from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="CRM AI Service")

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

@app.get("/")
def health_check():
    return {
        "message:": "CRM AI Service is running"
    }

@app.post("/ai/analyze-customer")
def analyze_customer(data: CustomerAIRequest):
    score = 40

    if data.interaction_count >= 3:
        score += 15
    elif data.interaction_count >= 1:
        score += 8

    if data.order_count >= 2:
        score += 20
    elif data.order_count == 1:
        score += 12

    if data.total_spent >= 10000000:
        score += 20
    elif data.total_spent >= 5000000:
        score += 12

    if data.task_count >= 1:
        score += 5

    if data.status and data.status.upper() in ["POTENTIAL", "LEAD"]:
        score += 5

    score = min(score, 100)

    if score >= 80:
        level = "HOT"
        summary = f"{data.full_name} là khách hàng có khả năng chuyển đổi cao."
        action = "Nên liên hệ trong 24h, tư vấn gói cao hơn và gửi ưu đãi cá nhân hóa."
    elif score >= 60:
        level = "WARM"
        summary = f"{data.full_name} là khách hàng tiền năng ở mức trung bình."
        action = "Nên tiếp tục chăm sóc, gửi thêm thông tin sản phẩm và đặt lịch follow-up."
    else:
        level = "COLD"
        summary = f"{data.full_name} cần được nuôi dưỡng thêm trước khi chốt đơn."
        action = "Nên gửi nội dung giới thiệu, case study hoặc ưu đãi nhỏ để tăng mức độ quan tâm."

    return {
        "potentialScore": score,
        "level": level,
        "summary": summary,
        "suggestedAction": action
    }

class RecommendationRequest(BaseModel):
    customer_id: int
    full_name: str
    level: str
    total_spent: float = 0
    interaction_count: int = 0
    task_count: int = 0

@app.post("/ai/recommend-action")
def recommend_action(data: RecommendationRequest):
    recommendations = []

    if data.level == "HOT":
        priority = "HIGH"
        recommendations.append("Liên hệ khách hàng trong 24 giờ.")
        recommendations.append("Đề xuất gói dịch vụ cao hơn hoặc ưu đãi cá nhân hóa.")
        recommendations.append("Tạo task follow-up để tránh bỏ lỡ cơ hội chốt đơn.")
    elif data.level == "WARM":
        priority = "MEDIUM"
        recommendations.append("Gửi thêm thông tin sản phẩm hoặc case study.")
        recommendations.append("Đặt lịch tư vấn lại trong 2-3 ngày.")
        recommendations.append("Theo dõi phản hồi của khách hàng.")
    else:
        priority = "LOW"
        recommendations.append("Gửi nội dung giới thiệu tổng quan.")
        recommendations.append("Duy trì chăm sóc định kỳ.")
        recommendations.append("Chưa nên đẩy mạnh bán hàng ngay.")

    if data.total_spent >= 10000000:
        recommendations.append("Cân nhắc xếp khách hàng vào nhóm VIP.")
    
    if data.interaction_count == 0:
        recommendations.append("Cần tạo tương tác đầu tiên với khách hàng.")

    return {
        "customerId": data.customer_id,
        "customerName": data.full_name,
        "priority": priority,
        "recommendations": recommendations
    }

class ChatRequest(BaseModel):
    question: str
    context: str

@app.post("/ai/chat")
def chat(data: ChatRequest):
    question = data.question.lower()
    context = data.context

    if "tiềm năng nhất" in question or "hot nhất" in question:
        answer = (
            "Dựa trên dữ liệu CRM, khách hàng tiềm năng nhất hiện tại là:\n\n"
            + context.split("Khách hàng tiềm năng nhất:")[-1].split(".\n")[0].strip()
        )

    elif "tổng số khách" in question or "bao nhiêu khách" in question:
        answer = context.split(".\n")[0]

    elif "chăm sóc" in question or "task" in question:
        answer = (
            "Nên ưu tiên chăm sóc các khách hàng có điểm AI cao, đặc biệt nhóm HOT. "
            "Bạn có thể tạo task follow-up cho các khách hàng này."
        )

    else:
        answer = (
            "Dựa trên dữ liệu CRM hiện có, đây là tóm tắt:\n\n"
            + context[:1500]
        )

    return {
        "answer": answer
    }