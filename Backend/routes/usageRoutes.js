const express = require('express');
const router = express.Router();
const axios = require('axios');
const DailyUsage = require('../models/DailyUsage'); // make sure this file exists

// POST /api/usage/android
router.post('/android', async (req, res) => {
    try {
        const { userId, date, totalScreenTime, socialMediaHours, gamingHours,
                workStudyHours, sleepHours, appOpens, unlocks, notifications } = req.body;

        // 1. Store the raw daily usage
        const dailyUsage = new DailyUsage({
            userId,
            date,
            totalScreenTime,
            socialMediaHours,
            gamingHours,
            workStudyHours,
            sleepHours,
            appOpens,
            unlocks,
            notifications,
            source: 'android'
        });
        await dailyUsage.save();

        // 2. Prepare features for ML
       const features = {
    daily_screen_time_hours: totalScreenTime,
    social_media_hours: socialMediaHours,
    gaming_hours: gamingHours,
    work_study_hours: workStudyHours,
    sleep_hours: sleepHours,
    notifications_per_day: notifications,
    app_opens_per_day: appOpens,
    weekend_screen_time: totalScreenTime,      // placeholder – you can also set to 0
    stress_level: "Medium",                    // default value
    academic_work_impact: "No"                 // default value
};

        // 3. Call ML service (adjust URL if needed)
        const mlResponse = await axios.post('http://localhost:8000/predict', features);
        const predictionData = mlResponse.data;

        // 4. Add prediction to the record
        dailyUsage.predictedClass = predictionData.predicted_class;
        dailyUsage.riskScore = predictionData.risk_score;
        dailyUsage.probabilities = predictionData.probabilities;
        await dailyUsage.save();

        res.status(201).json({
            message: 'Usage data saved and prediction stored',
            prediction: predictionData
        });
    } catch (error) {
        console.error('Error in /api/usage/android:', error);
        res.status(500).json({ error: 'Failed to process usage data' });
    }
});

module.exports = router;