package com.project.digitalwellbeingcollector

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : AppCompatActivity() {

    private lateinit var tvPermissionStatus: TextView
    private lateinit var btnGrantPermission: Button
    private lateinit var btnQueryUsage: Button
    private lateinit var btnSync: Button
    private lateinit var tvResult: TextView

    private var lastQuotedStats: List<UsageStats>? = null
    private var lastTotalScreenTime: Long = 0L

    private val settingsLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        checkPermissionAndUpdateUI()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        tvPermissionStatus = findViewById(R.id.tvPermissionStatus)
        btnGrantPermission = findViewById(R.id.btnGrantPermission)
        btnQueryUsage = findViewById(R.id.btnQueryUsage)
        btnSync = findViewById(R.id.btnSync)
        tvResult = findViewById(R.id.tvResult)

        btnGrantPermission.setOnClickListener {
            openUsageAccessSettings()
        }

        btnQueryUsage.setOnClickListener {
            queryAndDisplayUsage()
        }

        btnSync.setOnClickListener {
            syncToBackend()
        }

        checkPermissionAndUpdateUI()
    }

    override fun onResume() {
        super.onResume()
        checkPermissionAndUpdateUI()
    }

    private fun checkPermissionAndUpdateUI() {
        val hasPermission = UsagePermissionHelper.hasUsageAccess(this)
        if (hasPermission) {
            tvPermissionStatus.text = "✅ Usage Access: GRANTED"
            tvPermissionStatus.setTextColor(getColor(android.R.color.holo_green_dark))
            btnGrantPermission.isEnabled = false
            btnQueryUsage.isEnabled = true
            btnSync.isEnabled = lastQuotedStats != null
        } else {
            tvPermissionStatus.text = "❌ Usage Access: NOT GRANTED"
            tvPermissionStatus.setTextColor(getColor(android.R.color.holo_red_dark))
            btnGrantPermission.isEnabled = true
            btnQueryUsage.isEnabled = false
            btnSync.isEnabled = false
            tvResult.text = "Please grant permission first."
        }
    }

    private fun openUsageAccessSettings() {
        val intent = UsagePermissionHelper.getUsageAccessSettingsIntent()
        settingsLauncher.launch(intent)
        Toast.makeText(
            this,
            "Find this app in the list and enable usage access",
            Toast.LENGTH_LONG
        ).show()
    }

    private fun queryAndDisplayUsage() {
        val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val calendar = Calendar.getInstance()
        val endTime = calendar.timeInMillis
        calendar.add(Calendar.DAY_OF_YEAR, -1)
        val startTime = calendar.timeInMillis

        val statsList = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )

        if (statsList.isNullOrEmpty()) {
            tvResult.text = "No usage data available for the last 24 hours.\n\n" +
                    "Note: Data may take a few hours to appear after first enabling permission."
            lastQuotedStats = null
            btnSync.isEnabled = false
            return
        }

        val filtered = statsList.filter { it.totalTimeInForeground > 0 }
            .sortedByDescending { it.totalTimeInForeground }

        lastQuotedStats = filtered
        lastTotalScreenTime = filtered.sumOf { it.totalTimeInForeground }

        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
        val summary = StringBuilder()
        summary.append("Data from ${dateFormat.format(Date(startTime))} to ${dateFormat.format(Date(endTime))}\n")
        summary.append("====================================\n")

        var totalScreenTime = 0L
        for (stat in filtered) {
            val packageName = stat.packageName
            val timeInForeground = stat.totalTimeInForeground
            totalScreenTime += timeInForeground
            val lastTimeUsed = stat.lastTimeUsed

            val hours = timeInForeground / (1000 * 60 * 60)
            val minutes = (timeInForeground % (1000 * 60 * 60)) / (1000 * 60)

            summary.append("${packageName.take(30)}: ${hours}h ${minutes}m")
            if (lastTimeUsed > 0) {
                val lastUsedDate = Date(lastTimeUsed)
                val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
                summary.append(" (last used: ${timeFormat.format(lastUsedDate)})")
            }
            summary.append("\n")
        }

        val totalHours = totalScreenTime / (1000 * 60 * 60)
        val totalMinutes = (totalScreenTime % (1000 * 60 * 60)) / (1000 * 60)
        summary.append("====================================\n")
        summary.append("TOTAL SCREEN TIME: ${totalHours}h ${totalMinutes}m\n")
        summary.append("Apps shown: ${filtered.size}")

        tvResult.text = summary.toString()
        btnSync.isEnabled = true
    }

    private fun syncToBackend() {
        if (lastQuotedStats == null) {
            Toast.makeText(this, "No data to sync. Query first.", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                val userId = "test-user-123" // Replace with actual user ID later

                val (social, gaming, work) = categorizeApps(lastQuotedStats!!)
                val totalHours = lastTotalScreenTime / (1000.0 * 60 * 60)

                val request = DailyUsageRequest(
                    userId = userId,
                    date = today,
                    totalScreenTime = totalHours,
                    socialMediaHours = social,
                    gamingHours = gaming,
                    workStudyHours = work,
                    sleepHours = 0.0,        // To be implemented later
                    appOpens = 0,
                    unlocks = 0,
                    notifications = 0
                )

                val response = RetrofitClient.instance.sendUsage(request)

                if (response.isSuccessful) {
                    tvResult.text = "Sync successful!\nServer says: ${response.body()?.message}"
                    Toast.makeText(this@MainActivity, "Data synced", Toast.LENGTH_SHORT).show()
                } else {
                    tvResult.text = "Sync failed: ${response.code()} ${response.message()}"
                }
            } catch (e: IOException) {
                tvResult.text = "Network error: ${e.message}"
            } catch (e: HttpException) {
                tvResult.text = "HTTP error: ${e.message}"
            }
        }
    }

    private fun categorizeApps(stats: List<UsageStats>): Triple<Double, Double, Double> {
        var social = 0.0
        var gaming = 0.0
        var work = 0.0

        stats.forEach { stat ->
            val pkg = stat.packageName
            val hours = stat.totalTimeInForeground / (1000.0 * 60 * 60)

            when {
                pkg.contains("instagram") || pkg.contains("facebook") ||
                        pkg.contains("whatsapp") || pkg.contains("snapchat") ||
                        pkg.contains("tiktok") || pkg.contains("twitter") -> social += hours

                pkg.contains("game") || pkg.contains("gaming") ||
                        pkg.contains("pubg") || pkg.contains("candy") ||
                        pkg.contains("clash") -> gaming += hours

                pkg.contains("chrome") || pkg.contains("browser") ||
                        pkg.contains("docs") || pkg.contains("sheets") ||
                        pkg.contains("word") || pkg.contains("excel") ||
                        pkg.contains("outlook") || pkg.contains("gmail") -> work += hours
            }
        }

        return Triple(social, gaming, work)
    }
}