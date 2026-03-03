from fastapi import FastAPI
import joblib
import numpy as np
from pydantic import BaseModel

# Load artifacts
model = joblib.load("addiction_xgb_model.pkl")
label_encoder = joblib.load("label_encoder.pkl")

app = FastAPI(title="Digital Addiction Prediction API")

# ----------------------------
# Simplified Input Schema
# ----------------------------
class UserInput(BaseModel):
    daily_screen_time_hours: float
    social_media_hours: float
    gaming_hours: float
    work_study_hours: float
    sleep_hours: float
    notifications_per_day: float
    app_opens_per_day: float
    weekend_screen_time: float
    stress_level: str            # Low / Medium / High
    academic_work_impact: str    # Yes / No


# ----------------------------
# Helper Encoding Functions
# ----------------------------
def encode_stress(level: str):
    mapping = {
        "Low": 0,
        "Medium": 1,
        "High": 2
    }
    return mapping.get(level, 1)


def encode_academic_impact(value: str):
    mapping = {
        "No": 0,
        "Yes": 1
    }
    return mapping.get(value, 0)


# ----------------------------
# Prediction Endpoint
# ----------------------------
@app.post("/predict")
def predict(data: UserInput):

    # Encode categorical values
    stress_encoded = encode_stress(data.stress_level)
    academic_encoded = encode_academic_impact(data.academic_work_impact)

    # Derived Features
    screen_per_notification = (
        data.daily_screen_time_hours / data.notifications_per_day
        if data.notifications_per_day > 0 else 0
    )

    work_sleep_ratio = (
        data.work_study_hours / data.sleep_hours
        if data.sleep_hours > 0 else 0
    )

    total_entertainment = data.social_media_hours + data.gaming_hours

    social_to_total_ratio = (
        data.social_media_hours / total_entertainment
        if total_entertainment > 0 else 0
    )

    # Prepare model input
    input_data = np.array([[
        data.daily_screen_time_hours,
        data.social_media_hours,
        data.gaming_hours,
        data.work_study_hours,
        data.sleep_hours,
        data.notifications_per_day,
        data.app_opens_per_day,
        data.weekend_screen_time,
        stress_encoded,
        academic_encoded,
        screen_per_notification,
        work_sleep_ratio,
        social_to_total_ratio
    ]])

    # Prediction
    prediction = model.predict(input_data)
    probabilities = model.predict_proba(input_data)

    predicted_label = label_encoder.inverse_transform(prediction)[0]
    risk_score = float(np.max(probabilities))

    # Confidence Level
    if risk_score > 0.75:
        confidence_level = "High"
    elif risk_score > 0.60:
        confidence_level = "Medium"
    else:
        confidence_level = "Low"

    return {
        "predicted_class": predicted_label,
        "risk_score": round(risk_score, 3),
        "confidence_level": confidence_level,
        "probabilities": probabilities[0].tolist()
    }