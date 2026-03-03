const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  predictedClass: String,
  riskScore: Number,
  probabilities: [Number],
  aiPlan: Object,
  inputData: Object,
  createdAt: Date
});

module.exports = mongoose.model("Prediction", predictionSchema);