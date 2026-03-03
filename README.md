# AI-Driven Digital Wellbeing Recommendation System 
📱 Overview
A comprehensive digital wellbeing platform that combines Android app data collection, machine learning risk prediction, and AI-generated personalized recommendations to help users manage digital addiction.

Key Features
📊 Android App – Automatically collects real usage data (screen time, app categories, etc.)

🤖 ML Prediction – XGBoost model predicts addiction risk level (Low/Moderate/High)

🧠 AI Recommendations – Gemini generates personalized weekly plans

🌐 Web Dashboard – Visualizes trends, risk scores, and AI insights

🔄 End‑to‑end flow – Data flows from phone → backend → ML → AI → dashboard

🏗️ Project Structure
text
AI-Driven-Digital-Wellbeing-Recommendation-System/
├── android-app/               # Android Studio project (Kotlin)
│   └── DigitalWellbeingCollector/
├── backend/                   # Node.js + Express API
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API routes
│   └── server.js
├── frontend/                  # React + Vite dashboard
│   ├── src/
│   └── package.json
├── ml-service/                # FastAPI + XGBoost
│   ├── ml_service.py
│   └── requirements.txt
└── README.md
🚀 Getting Started
Prerequisites
Node.js v20+ – Download

Python 3.10+ – Download

Android Studio – Download

MongoDB Atlas account – Free tier

Google AI Studio API key (for Gemini) – Get key

1️⃣ Clone the Repository
bash
git clone https://github.com/SarthakZunjure17/AI-Driven-Digital-Wellbeing-Recommendation-System.git
cd AI-Driven-Digital-Wellbeing-Recommendation-System
2️⃣ Backend Setup (Node.js)
bash
cd backend
cp .env.example .env   # edit with your MongoDB URI and Gemini key
npm install
npm start
Server runs at http://localhost:5000

3️⃣ ML Service Setup (FastAPI)
bash
cd ml-service
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn ml_service:app --reload --port 8000
ML service runs at http://localhost:8000

4️⃣ Frontend Setup (React)
bash
cd frontend
npm install
npm run dev
Dashboard at http://localhost:5173

5️⃣ Android App Setup
Open android-app/DigitalWellbeingCollector in Android Studio

Build and run on a real device (API 26+)

Grant Usage Access permission when prompted

The app will automatically sync data to your backend

Note: Update the BASE_URL in RetrofitClient.kt to your computer's local IP (e.g., http://192.168.x.x:5000) if testing on a real device.

🔄 System Flow
Android app collects daily usage stats (screen time, app categories, etc.)

Backend receives data and stores it in MongoDB

ML service predicts addiction risk (Low/Moderate/High)

Gemini AI generates a personalized weekly plan

Web dashboard displays risk level, trends, and AI recommendations

📊 API Endpoints
Method	Endpoint	Description
POST	/api/usage/android	Receive Android usage data
GET	/api/user/:userId/dashboard	Get latest prediction + 7‑day history
POST	/predict	(ML service) Get risk prediction
🧪 Testing the Flow
Start backend, ML service, and frontend.

Run Android app, grant permission, and tap "Sync to Backend".

Check MongoDB for new documents in dailyusages collection.

Open web dashboard at http://localhost:5173 – data should appear.

👥 Team Collaboration
Backend/ML/Android – @SarthakZunjure17

Frontend – [Add names]

Testing/Documentation – [Add names]

🛠️ Built With
Android – Kotlin, UsageStatsManager, Retrofit

Backend – Node.js, Express, MongoDB Atlas, Mongoose

ML – Python, FastAPI, XGBoost, scikit‑learn

AI – Google Gemini API

Frontend – React, Vite, Recharts, Framer Motion

📝 Environment Variables
Backend (.env)
env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
ML_SERVICE_URL=http://localhost:8000
Android (RetrofitClient.kt)
kotlin
private const val BASE_URL = "http://10.0.2.2:5000/"   // emulator
// or "http://192.168.x.x:5000/" for real device
📸 Screenshots
(Add screenshots of your dashboard and Android app here)

🚧 Future Enhancements
User authentication (JWT)

Goal setting and intervention tracking

Push notifications

More detailed analytics (category breakdown, correlations)

iOS support (via manual entry)

📄 License
This project is for educational purposes.

🙌 Acknowledgments
Kaggle dataset: Smartphone Usage and Addiction Analysis

Google Gemini for AI recommendations

MongoDB Atlas for cloud database

Happy coding! 🚀

