import os
import json
import psycopg2
import numpy as np

from dotenv import load_dotenv
from services.embedding_service import create_embedding


load_dotenv()


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        database=os.getenv("DB_NAME", "crm_ai_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "123456"),
    )


def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(np.dot(a, b) / (norm_a * norm_b))


def retrieve(question, limit=5, similarity_threshold=0.4):
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
        conn.close()

    results = []

    for customer_id, content, embedding_json in rows:
        try:
            embedding = json.loads(embedding_json)

            similarity = cosine_similarity(
                question_embedding,
                embedding
            )

            if similarity >= similarity_threshold:
                results.append({
                    "customerId": customer_id,
                    "content": content,
                    "score": similarity
                })

        except Exception:
            continue

    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return results[:limit]