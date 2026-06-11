import json
import psycopg2
import numpy as np
from services.embedding_service import create_embedding


def get_connection():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        database="crm_ai_db",
        user="postgres",
        password="123456"
    )


def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)

    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0

    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def retrieve(question, limit=5):
    question_embedding = create_embedding(question)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT customer_id, content, embedding_json
        FROM customer_embeddings
        WHERE embedding_json IS NOT NULL
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    results = []

    for row in rows:
        customer_id = row[0]
        content = row[1]
        embedding_json = row[2]

        try:
            embedding = json.loads(embedding_json)
            score = cosine_similarity(question_embedding, embedding)

            results.append({
                "customerId": customer_id,
                "content": content,
                "score": score
            })
        except Exception:
            continue

    results.sort(key=lambda x: x["score"], reverse=True)

    return results[:limit]