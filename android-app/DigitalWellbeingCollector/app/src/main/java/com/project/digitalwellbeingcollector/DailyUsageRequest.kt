package com.project.digitalwellbeingcollector

data class DailyUsageRequest(
    val userId: String,
    val date: String,               // format: YYYY-MM-DD
    val totalScreenTime: Double,     // in hours
    val socialMediaHours: Double,
    val gamingHours: Double,
    val workStudyHours: Double,
    val sleepHours: Double,
    val appOpens: Int,
    val unlocks: Int,
    val notifications: Int
)