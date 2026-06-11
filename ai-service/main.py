import os
import json
import re
from typing import Optional

import joblib
import pandas as pd
import numpy as np

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
from sklearn.linear_model import LinearRegression

from rule_based_scoring import (
    calculate_rule_score,
    calculate_rule_score_with_reasons,
    get_level,
)
from rag.semantic_search import retrieve
from services.embedding_service import create_embedding


app = FastAPI(title="CRM AI Service")

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-3.5-flash")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "lead_scoring_model.pkl")

try:
    ml_model = joblib.load(MODEL_PATH)
    print("Loaded RandomForest lead scoring model successfully.")
except Exception as e:
    ml_model = None
    print("Warning: lead_scoring_model.pkl not found or cannot be loaded.")
    print(e)


def parse_json_response(text: str):
    raw_text = text.strip()

    raw_text = re.sub(r"^```json\s*", "", raw_text)
    raw_text = re.sub(r"^```\s*", "", raw_text)
    raw_text = re.sub(r"\s*```$", "", raw_text)

    start = raw_text.find("{")
    end = raw_text.rfind("}")

    if start != -1 and end != -1:
        raw_text = raw_text[start:end + 1]

    return json.loads(raw_text)


def predict_lead_score(data):
    if ml_model is None:
        score, _ = calculate_rule_score_with_reasons(data)
        return score

    try:
        input_df = pd.DataFrame([{
            "interaction_count": data.interaction_count,
            "order_count": data.order_count,
            "total_spent": data.total_spent,
            "task_count": data.task_count,
            "status": data.status or "LEAD",
            "source": data.source or "Other",
        }])

        probabilities = ml_model.predict_proba(input_df)[0]

        classifier = ml_model.named_steps["classifier"]
        classes = list(classifier.classes_)

        if 1 in classes:
            class_index = classes.index(1)
        else:
            class_index = 1

        probability = probabilities[class_index]
        score = int(probability * 100)

        return max(0, min(score, 100))

    except Exception as e:
        print("ML prediction error, fallback to rule-based scoring:", e)
        score, _ = calculate_rule_score_with_reasons(data)
        return score


class CustomerAIRequest(BaseModel):
    customer_id: int
    full_name: str
    status: Optional[str] = None
    source: Optional[str] = None
    note: Optional[str] = None
    interaction_count: int = 0
    order_count: int = 0
    total_spent: float = 0
    task_count: int = 0


class RecommendationRequest(BaseModel):
    customer_id: int
    full_name: str
    level: str
    total_spent: float = 0
    interaction_count: int = 0
    task_count: int = 0


class ChatRequest(BaseModel):
    question: str
    context: Optional[str] = ""


class EmbeddingRequest(BaseModel):
    customerId: int
    content: str


class RevenueForecastRequest(BaseModel):
    monthlyRevenue: list


class ChurnRiskRequest(BaseModel):
    customer_id: int
    full_name: str
    status: Optional[str] = None
    potential_score: int = 0
    interaction_count: int = 0
    order_count: int = 0
    total_spent: float = 0
    task_count: int = 0


@app.get("/")
def health_check():
    return {
        "message": "CRM AI Service is running"
    }


@app.post("/ai/analyze-customer")
def analyze_customer(data: CustomerAIRequest):
    _, reasons = calculate_rule_score_with_reasons(data)

    score = predict_lead_score(data)
    level = get_level(score)

    prompt = f"""
Bạn là chuyên gia CRM.

Điểm tiềm năng của khách hàng đã được tính bằng mô hình Machine Learning Random Forest.
Các lý do giải thích được sinh từ tập luật nghiệp vụ nhằm hỗ trợ Explainable AI.

Thông tin khách hàng:
- Tên: {data.full_name}
- Trạng thái: {data.status}
- Nguồn: {data.source}
- Ghi chú: {data.note}
- Số lần tương tác: {data.interaction_count}
- Số đơn hàng: {data.order_count}
- Tổng chi tiêu: {data.total_spent}
- Số task chăm sóc: {data.task_count}
- Điểm ML: {score}
- Nhóm: {level}
- Lý do giải thích: {reasons}

Yêu cầu:
Trả về JSON hợp lệ:
{{
  "summary": "tóm tắt ngắn bằng tiếng Việt",
  "suggestedAction": "hành động chăm sóc đề xuất bằng tiếng Việt"
}}

Không dùng markdown.
Không giải thích thêm.
Chỉ trả về JSON.
"""

    try:
        response = model.generate_content(prompt)
        result = parse_json_response(response.text)

        return {
            "potentialScore": score,
            "level": level,
            "summary": result.get("summary", ""),
            "suggestedAction": result.get("suggestedAction", ""),
            "reasons": reasons
        }

    except Exception:
        return {
            "potentialScore": score,
            "level": level,
            "summary": f"{data.full_name} được mô hình Random Forest đánh giá thuộc nhóm {level} với điểm {score}.",
            "suggestedAction": "Nên tiếp tục chăm sóc khách hàng dựa trên mức độ tiềm năng và lịch sử tương tác.",
            "reasons": reasons
        }


@app.post("/ai/recommend-action")
def recommend_action(data: RecommendationRequest):
    prompt = f"""
Bạn là AI tư vấn chăm sóc khách hàng trong hệ thống CRM.

Hãy đề xuất hành động chăm sóc cho khách hàng sau và trả về DUY NHẤT JSON hợp lệ.

Thông tin:
- ID khách hàng: {data.customer_id}
- Tên khách hàng: {data.full_name}
- Nhóm khách hàng: {data.level}
- Tổng chi tiêu: {data.total_spent}
- Số lần tương tác: {data.interaction_count}
- Số task chăm sóc: {data.task_count}

Yêu cầu JSON:
{{
  "customerId": {data.customer_id},
  "customerName": "{data.full_name}",
  "priority": "HIGH" hoặc "MEDIUM" hoặc "LOW",
  "recommendations": [
    "hành động 1",
    "hành động 2",
    "hành động 3"
  ]
}}

Không giải thích thêm.
Không dùng markdown.
Chỉ trả về JSON.
"""

    try:
        response = model.generate_content(prompt)
        result = parse_json_response(response.text)

    except Exception:
        result = {
            "customerId": data.customer_id,
            "customerName": data.full_name,
            "priority": "MEDIUM",
            "recommendations": [
                "Tiếp tục chăm sóc khách hàng.",
                "Theo dõi phản hồi trong vài ngày tới.",
                "Gửi thêm thông tin sản phẩm hoặc dịch vụ phù hợp."
            ]
        }

    return result


@app.post("/ai/chat")
def chat(data: ChatRequest):
    try:
        rag_docs = retrieve(data.question)

        rag_text = ""

        if rag_docs:
            rag_text = "\n".join(
                [doc["content"] for doc in rag_docs]
            )

        backend_context = data.context or ""

        combined_context = f"""
Dữ liệu truy xuất từ Backend theo nghiệp vụ:
{backend_context}

Dữ liệu khách hàng liên quan truy xuất bằng RAG Semantic Search:
{rag_text}
"""

        prompt = f"""
Bạn là trợ lý AI cho hệ thống CRM.

Dữ liệu CRM:
{combined_context}

Câu hỏi người dùng:
{data.question}

Yêu cầu:
- Trả lời bằng tiếng Việt
- Ngắn gọn, dễ hiểu
- Ưu tiên dữ liệu Backend nếu câu hỏi liên quan đến task, doanh thu, trạng thái hoặc nguồn khách hàng
- Dùng dữ liệu RAG để bổ sung các khách hàng liên quan
- Nếu phù hợp, hãy đề xuất hành động chăm sóc khách hàng
- Trình bày gọn, hạn chế dòng trống
- Không chèn nhiều dòng trắng giữa các ý
- Mỗi ý chỉ cách nhau 1 dòng
- Không chèn dòng trống giữa các mục danh sách
- Không dùng nhiều đoạn văn trong cùng một mục bullet/number
- Mỗi khách hàng viết trong 1 dòng hoặc tối đa 2 dòng
"""

        response = model.generate_content(prompt)

        return {
            "answer": response.text,
            "backendContext": backend_context,
            "ragContext": rag_docs
        }

    except Exception as e:
        return {
            "answer": "AI hiện đang tạm thời quá tải, chưa có dữ liệu RAG hoặc vượt giới hạn quota Gemini. Vui lòng thử lại sau.",
            "error": str(e)
        }


@app.post("/embedding")
def embedding(data: EmbeddingRequest):
    vector = create_embedding(data.content)

    return {
        "customerId": data.customerId,
        "embedding": vector
    }


@app.post("/ai/forecast-revenue")
def forecast_revenue(data: RevenueForecastRequest):
    revenues = data.monthlyRevenue

    if len(revenues) < 2:
        return {
            "forecastRevenue": 0,
            "message": "Không đủ dữ liệu để dự báo"
        }

    X = np.array(range(len(revenues))).reshape(-1, 1)
    y = np.array(revenues)

    model_lr = LinearRegression()
    model_lr.fit(X, y)

    next_month = np.array([[len(revenues)]])
    forecast = model_lr.predict(next_month)[0]

    return {
        "forecastRevenue": round(float(forecast), 2),
        "message": "Dự báo doanh thu tháng tiếp theo bằng Linear Regression"
    }


@app.post("/ai/churn-risk")
def churn_risk(data: ChurnRiskRequest):
    risk = 20
    reasons = []

    if data.status == "INACTIVE":
        risk += 35
        reasons.append("Khách hàng đang ở trạng thái không hoạt động")

    if data.potential_score < 40:
        risk += 20
        reasons.append("Điểm AI thấp")

    if data.interaction_count == 0:
        risk += 15
        reasons.append("Không có lịch sử tương tác gần đây")

    if data.order_count == 0:
        risk += 15
        reasons.append("Chưa phát sinh đơn hàng")

    if data.task_count == 0:
        risk += 5
        reasons.append("Chưa có task chăm sóc")

    risk = min(risk, 100)

    if risk >= 75:
        level = "HIGH"
    elif risk >= 45:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "customerId": data.customer_id,
        "customerName": data.full_name,
        "churnRisk": risk,
        "level": level,
        "reasons": reasons,
        "suggestedAction": "Nên tạo chiến dịch chăm sóc lại, gửi ưu đãi cá nhân hóa hoặc liên hệ trực tiếp để xác nhận nhu cầu."
    }