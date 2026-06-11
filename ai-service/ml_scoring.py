def calculate_ml_score(customer):

    score = 0

    score += customer.order_count * 15

    score += customer.interaction_count * 5

    score += customer.task_count * 2

    score += customer.total_spent / 1000000

    return min(round(score), 100)


def get_level(score):

    if score >= 80:
        return "HOT"

    if score >= 60:
        return "WARM"

    return "COLD"

def calculate_ml_score_with_reasons(customer):
    score = 30
    reasons = []

    if customer.interaction_count >= 3:
        score += 20
        reasons.append("+20 điểm vì khách hàng có nhiều tương tác")
    elif customer.interaction_count >= 1:
        score += 10
        reasons.append("+10 điểm vì khách hàng đã có tương tác")

    if customer.order_count >= 2:
        score += 25
        reasons.append("+25 điểm vì khách hàng đã có từ 2 đơn hàng trở lên")
    elif customer.order_count == 1:
        score += 15
        reasons.append("+15 điểm vì khách hàng đã phát sinh đơn hàng")

    if customer.total_spent >= 10000000:
        score += 20
        reasons.append("+20 điểm vì tổng chi tiêu cao")
    elif customer.total_spent >= 5000000:
        score += 10
        reasons.append("+10 điểm vì tổng chi tiêu ở mức khá")

    if customer.source == "Referral":
        score += 10
        reasons.append("+10 điểm vì khách hàng đến từ nguồn giới thiệu")

    if customer.status in ["POTENTIAL", "CUSTOMER"]:
        score += 10
        reasons.append("+10 điểm vì trạng thái khách hàng có khả năng chuyển đổi")

    score = max(0, min(score, 100))

    if not reasons:
        reasons.append("Khách hàng chưa có nhiều dữ liệu tương tác, đơn hàng hoặc chi tiêu")

    return score, reasons