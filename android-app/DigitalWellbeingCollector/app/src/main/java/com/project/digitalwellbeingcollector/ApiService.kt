package com.project.digitalwellbeingcollector

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    @POST("api/usage/android")
    suspend fun sendUsage(@Body usage: DailyUsageRequest): Response<UsageResponse>
}