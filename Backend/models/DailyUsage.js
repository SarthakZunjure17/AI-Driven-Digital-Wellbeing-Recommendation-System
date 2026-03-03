const mongoose = require('mongoose');

const dailyUsageSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    totalScreenTime: Number,
    socialMediaHours: Number,
    gamingHours: Number,
    workStudyHours: Number,
    sleepHours: Number,
    appOpens: Number,
    unlocks: Number,
    notifications: Number,
    source: { type: String, enum: ['web', 'android'], default: 'android' },
    predictedClass: String,
    riskScore: Number,
    probabilities: Object,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DailyUsage', dailyUsageSchema);