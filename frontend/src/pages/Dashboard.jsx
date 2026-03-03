import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell } from "recharts";

// Hardcoded user ID for now (will be replaced with actual auth)
const USER_ID = "test-user-123";

const RiskGauge = ({ score }) => {
  const percentage = score * 100;

  const data = [
    { name: "Risk", value: percentage },
    { name: "Remaining", value: 100 - percentage }
  ];

  const getColor = () => {
    if (percentage < 40) return "#22c55e";
    if (percentage < 70) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ textAlign: "center" }}>
      <PieChart width={220} height={220}>
        <Pie
          data={data}
          innerRadius={70}
          outerRadius={90}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
        >
          <Cell fill={getColor()} />
          <Cell fill="#1e293b" />
        </Pie>
      </PieChart>
      <h2 style={{ marginTop: -140, fontSize: 28 }}>
        {percentage.toFixed(0)}%
      </h2>
      <p style={{ opacity: 0.7 }}>Risk Level</p>
    </div>
  );
};

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [usageHistory, setUsageHistory] = useState([]);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/user/${USER_ID}/dashboard`
        );
        setUsageHistory(response.data.usageHistory);
        setLatestPrediction(response.data.latestPrediction);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: "red" }}>{error}</div>;

  // Prepare probability data for chart
  const probabilityData =
    latestPrediction?.probabilities?.map((value, index) => ({
      name: ["Low", "Moderate", "High"][index],
      value: Number((value * 100).toFixed(1))
    })) || [];

  // Prepare screen time trend data
  const trendData = usageHistory.map((day) => ({
    date: day.date.slice(5), // show MM-DD
    screenTime: day.totalScreenTime
  })).reverse(); // oldest to newest

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, marginBottom: 30 }}>
        Your Digital Wellbeing Dashboard
      </h1>

      {latestPrediction ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 30,
            marginBottom: 40
          }}
        >
          {/* LEFT: Risk Summary */}
          <div style={{ background: "#0f172a", padding: 25, borderRadius: 12 }}>
            <h2>Current Risk Level</h2>
            <h1 style={{ fontSize: 36, color: "#38bdf8" }}>
              {latestPrediction.predictedClass}
            </h1>
            <RiskGauge score={latestPrediction.riskScore} />
          </div>

          {/* RIGHT: Probability Distribution */}
          <div style={{ background: "#0f172a", padding: 25, borderRadius: 12 }}>
            <h2>Risk Distribution</h2>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={probabilityData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly AI Plan */}
          {latestPrediction.aiPlan?.weekly_plan && (
            <div style={{ gridColumn: "1 / span 2" }}>
              <h2 style={{ marginBottom: 20 }}>Your AI Weekly Plan</h2>
              {latestPrediction.aiPlan.risk_summary && (
                <p style={{ background: "#1e293b", padding: 15, borderRadius: 8, marginBottom: 20 }}>
                  {latestPrediction.aiPlan.risk_summary}
                </p>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 20
                }}
              >
                {Object.entries(latestPrediction.aiPlan.weekly_plan).map(([day, task]) => (
                  <div
                    key={day}
                    style={{
                      background: "#1e293b",
                      padding: 20,
                      borderRadius: 12
                    }}
                  >
                    <strong style={{ fontSize: 18 }}>{day.toUpperCase()}</strong>
                    <p style={{ marginTop: 10, opacity: 0.8 }}>{task}</p>
                  </div>
                ))}
              </div>
              {latestPrediction.aiPlan.behavioral_goals && (
                <div style={{ marginTop: 20, background: "#1e293b", padding: 15, borderRadius: 8 }}>
                  <strong>Behavioral Goals</strong>
                  <ul>
                    {latestPrediction.aiPlan.behavioral_goals.map((goal, i) => (
                      <li key={i}>{goal}</li>
                    ))}
                  </ul>
                </div>
              )}
              {latestPrediction.aiPlan.motivational_message && (
                <div style={{ marginTop: 20, background: "#1e293b", padding: 15, borderRadius: 8 }}>
                  <em>"{latestPrediction.aiPlan.motivational_message}"</em>
                </div>
              )}
            </div>
          )}
        </motion.div>
      ) : (
        <p>No prediction data available yet. Sync your Android app.</p>
      )}

      {/* Screen Time Trend (last 7 days) */}
      {usageHistory.length > 0 && (
        <div style={{ marginTop: 40, background: "#0f172a", padding: 25, borderRadius: 12 }}>
          <h2 style={{ marginBottom: 20 }}>Last 7 Days Screen Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="screenTime" stroke="#38bdf8" name="Hours" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Dashboard;