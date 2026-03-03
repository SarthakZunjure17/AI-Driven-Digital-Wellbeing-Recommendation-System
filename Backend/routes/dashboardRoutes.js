const express = require('express');
const router = express.Router();
const DailyUsage = require('../models/DailyUsage'); // adjust path if needed

// GET /api/user/:userId/dashboard
router.get('/:userId/dashboard', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Get last 7 days of usage (excluding future dates)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const usageHistory = await DailyUsage.find({
            userId,
            createdAt: { $gte: sevenDaysAgo }
        })
        .sort({ date: -1 }) // newest first
        .limit(7); // just in case

        // Get the most recent document that has prediction data
        const latestWithPrediction = await DailyUsage.findOne({
            userId,
            predictedClass: { $exists: true, $ne: null }
        }).sort({ createdAt: -1 });

        res.json({
            usageHistory,
            latestPrediction: latestWithPrediction || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;