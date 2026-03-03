const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");  // ✅ Import DB connection

dotenv.config();

const app = express();

// ✅ Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend running successfully 🚀" });
});

// Routes
const predictionRoutes = require("./routes/predictionRoutes");
app.use("/api/predict", predictionRoutes);

// Server start
const PORT = process.env.PORT || 5000;

const usageRoutes = require('./routes/usageRoutes');
app.use('/api/usage', usageRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/user', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});