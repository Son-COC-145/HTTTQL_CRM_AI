import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report


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

    [6, 5, 50000000, 5, "CUSTOMER", "Referral", 1],
    [5, 2, 22000000, 3, "CUSTOMER", "Zalo", 1],
    [4, 2, 15000000, 2, "POTENTIAL", "Facebook", 1],
    [3, 1, 10000000, 1, "POTENTIAL", "Referral", 1],
    [1, 0, 0, 0, "LEAD", "Website", 0],
    [0, 0, 0, 0, "INACTIVE", "Referral", 0],
    [1, 0, 1000000, 1, "LEAD", "Zalo", 0],
    [2, 1, 3000000, 1, "LEAD", "Facebook", 0],
    [3, 0, 0, 2, "POTENTIAL", "Website", 0],
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
        ("classifier", RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=5
        )),
    ]
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("Accuracy:", round(accuracy, 2))
print("Classification Report:")
print(classification_report(y_test, y_pred))

joblib.dump(model, "lead_scoring_model.pkl")

print("Model trained and saved to lead_scoring_model.pkl")