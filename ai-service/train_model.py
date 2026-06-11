import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline


data = [
    [5, 3, 25000000, 3, "CUSTOMER", "Referral", 1],
    [4, 2, 18000000, 2, "CUSTOMER", "Facebook", 1],
    [3, 2, 12000000, 2, "POTENTIAL", "Website", 1],
    [4, 1, 9000000, 2, "POTENTIAL", "Referral", 1],
    [3, 1, 7000000, 1, "LEAD", "Facebook", 1],

    [2, 1, 5000000, 1, "POTENTIAL", "Website", 0],
    [2, 0, 0, 1, "LEAD", "Zalo", 0],
    [1, 0, 0, 1, "LEAD", "Facebook", 0],
    [1, 0, 0, 0, "INACTIVE", "Website", 0],
    [0, 0, 0, 0, "INACTIVE", "Zalo", 0],

    [5, 4, 40000000, 4, "CUSTOMER", "Referral", 1],
    [4, 3, 30000000, 3, "CUSTOMER", "Website", 1],
    [3, 1, 8000000, 2, "POTENTIAL", "Zalo", 1],
    [2, 0, 0, 1, "LEAD", "Referral", 0],
    [0, 0, 0, 0, "INACTIVE", "Facebook", 0],
]

columns = [
    "interaction_count",
    "order_count",
    "total_spent",
    "task_count",
    "status",
    "source",
    "converted"
]

df = pd.DataFrame(data, columns=columns)

X = df.drop("converted", axis=1)
y = df["converted"]

categorical_features = ["status", "source"]
numeric_features = [
    "interaction_count",
    "order_count",
    "total_spent",
    "task_count"
]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
        ("num", "passthrough", numeric_features),
    ]
)

model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(n_estimators=100, random_state=42)),
    ]
)

model.fit(X, y)

joblib.dump(model, "lead_scoring_model.pkl")

print("Model trained and saved to lead_scoring_model.pkl")