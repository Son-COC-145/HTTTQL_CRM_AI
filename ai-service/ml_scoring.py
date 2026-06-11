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