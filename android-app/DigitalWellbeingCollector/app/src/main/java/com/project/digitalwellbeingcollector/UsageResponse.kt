package com.project.digitalwellbeingcollector

data class UsageResponse(
    val message: String,
    val prediction: PredictionData?
)

data class PredictionData(
    val predicted_class: String,
    val risk_score: Double,
    val confidence_level: String,
    val probabilities: List<Double>
)