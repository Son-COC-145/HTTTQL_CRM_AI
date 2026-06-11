import os
import json
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai

from ml_scoring import calculate_ml_score, get_level
from rag.semantic_search import retrieve
from services.embedding_service import create_embedding

app = FastAPI(title="CRM AI Service")

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-3.5-flash")


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


@app.get("/")
def health_check():
    return {
        "message": "CRM AI Service is running"
    }


@app.post("/ai/analyze-customer")
def analyze_customer(data: CustomerAIRequest):
    score = calculate_ml_score(data)
    level = get_level(score)

    prompt = f"""
Bạn là chuyên gia CRM.

Điểm tiềm năng của khách hàng đã được tính bằng mô hình Machine Learning.

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
        result = json.loads(response.text)

        return {
            "potentialScore": score,
            "level": level,
            "summary": result.get("summary", ""),
            "suggestedAction": result.get("suggestedAction", "")
        }

    except Exception:
        return {
            "potentialScore": score,
            "level": level,
            "summary": f"{data.full_name} được mô hình ML đánh giá thuộc nhóm {level} với điểm {score}.",
            "suggestedAction": "Nên tiếp tục chăm sóc khách hàng dựa trên mức độ tiềm năng và lịch sử tương tác."
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

    response = model.generate_content(prompt)

    try:
        result = json.loads(response.text)
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

        if rag_docs:
            rag_context = "\n".join(
                [doc["content"] for doc in rag_docs]
            )
        else:
            rag_context = data.context or ""

        prompt = f"""
Bạn là trợ lý AI cho hệ thống CRM.

Dữ liệu CRM liên quan được truy xuất bằng RAG:
{rag_context}

Câu hỏi người dùng:
{data.question}

Yêu cầu:
- Trả lời bằng tiếng Việt
- Ngắn gọn, dễ hiểu
- Dựa trên dữ liệu CRM được cung cấp
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