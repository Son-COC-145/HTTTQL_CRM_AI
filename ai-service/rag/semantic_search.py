import numpy as np
import psycopg2
import json

from services.embedding_service import create_embedding


conn = psycopg2.connect(

    host="localhost",

    port=5432,

    database="crm_ai_db",

    user="postgres",

    password="123456"

)


def cosine_similarity(a, b):

    a = np.array(a)

    b = np.array(b)

    return np.dot(a, b) / (
        np.linalg.norm(a) * np.linalg.norm(b)
    )


def retrieve(question):

    question_embedding = create_embedding(question)

    cur = conn.cursor()

    cur.execute("""

        SELECT customer_id,
               content,
               embedding_json

        FROM customer_embeddings

    """)

    rows = cur.fetchall()

    result = []

    for row in rows:

        embedding = json.loads(row[2])

        score = cosine_similarity(

            question_embedding,

            embedding

        )

        result.append({

            "customerId": row[0],

            "content": row[1],

            "score": score

        })

    result.sort(

        key=lambda x: x["score"],

        reverse=True

    )

    return result[:5]