import json
import psycopg2
import numpy as np

from services.embedding_service import create_embedding


# ===========================
# Kết nối PostgreSQL
# ===========================

def get_connection():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        database="crm_ai_db",
        user="postgres",
        password="123456"
    )


# ===========================
# Tính Cosine Similarity
# ===========================

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(np.dot(a, b) / (norm_a * norm_b))


# ===========================
# Semantic Search
# ===========================

def retrieve(question, limit=5):

    # Sinh embedding cho câu hỏi
    question_embedding = create_embedding(question)

    conn = get_connection()

    try:

        with conn.cursor() as cur:

            cur.execute("""
                SELECT
                    customer_id,
                    content,
                    embedding_json
                FROM customer_embeddings
                WHERE embedding_json IS NOT NULL
            """)

            rows = cur.fetchall()

    finally:
        # Luôn đóng kết nối kể cả khi xảy ra Exception
        conn.close()

    results = []

    for customer_id, content, embedding_json in rows:

        try:

            embedding = json.loads(embedding_json)

            similarity = cosine_similarity(
                question_embedding,
                embedding
            )

            results.append({
                "customerId": customer_id,
                "content": content,
                "score": similarity
            })

        except Exception:
            # Bỏ qua embedding lỗi
            continue

    # Sắp xếp theo độ tương đồng giảm dần
    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return results[:limit]
