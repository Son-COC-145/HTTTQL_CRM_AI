import os
import json
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai


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
    context: str


@app.get("/")
def health_check():
    return {
        "message": "CRM AI Service is running"
    }


@app.post("/ai/analyze-customer")
def analyze_customer(data: CustomerAIRequest):
    prompt = f"""
Bạn là AI phân tích khách hàng cho hệ thống CRM.

Hãy phân tích khách hàng sau và trả về DUY NHẤT JSON hợp lệ.

Thông tin khách hàng:
- ID: {data.customer_id}
- Tên: {data.full_name}
- Trạng thái: {data.status}
- Nguồn: {data.source}
- Ghi chú: {data.note}
- Số lần tương tác: {data.interaction_count}
- Số đơn hàng: {data.order_count}
- Tổng chi tiêu: {data.total_spent}
- Số task chăm sóc: {data.task_count}

Yêu cầu JSON:
{{
  "potentialScore": số nguyên từ 0 đến 100,
  "level": "HOT" hoặc "WARM" hoặc "COLD",
  "summary": "tóm tắt ngắn bằng tiếng Việt",
  "suggestedAction": "hành động chăm sóc đề xuất bằng tiếng Việt"
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
            "potentialScore": 50,
            "level": "WARM",
            "summary": response.text,
            "suggestedAction": "Tiếp tục chăm sóc và theo dõi phản hồi của khách hàng."
        }

    return result


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
    prompt = f"""
Bạn là trợ lý AI cho hệ thống CRM.

Dữ liệu CRM:
{data.context}

Câu hỏi người dùng:
{data.question}

Yêu cầu:
- Trả lời bằng tiếng Việt
- Ngắn gọn, dễ hiểu
- Dựa trên dữ liệu CRM được cung cấp
- Nếu phù hợp, hãy đề xuất hành động chăm sóc khách hàng
"""

    response = model.generate_content(prompt)

    return {
        "answer": response.text
    }