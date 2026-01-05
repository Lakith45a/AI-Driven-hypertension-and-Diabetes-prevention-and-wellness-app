import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib

# Load dataset
df = pd.read_csv("pss10_dataset.csv")

# ---------- PSS SCORING ----------
def calculate_pss(row):
    reverse_items = [3, 4, 6, 7]  # Q4, Q5, Q7, Q8 (0-indexed)
    total = 0

    for i in range(10):
        value = row[i]
        if i in reverse_items:
            value = 4 - value
        total += value

    return total


# Apply scoring
df["pss_score"] = df.apply(calculate_pss, axis=1)

# Label mapping
def label_stress(score):
    if score <= 13:
        return "low"
    elif score <= 26:
        return "medium"
    else:
        return "high"

df["label"] = df["pss_score"].apply(label_stress)

# Features and labels
X = df[[f"q{i}" for i in range(1, 11)]]
y = df["label"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = LogisticRegression(max_iter=500)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("\nModel Evaluation:\n")
print(classification_report(y_test, y_pred, zero_division=0))


# Save model
joblib.dump(model, "pss_model.pkl")

print("\n✅ Model training completed and saved as pss_model.pkl")
