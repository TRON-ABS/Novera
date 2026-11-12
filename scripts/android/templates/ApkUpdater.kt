package io.github.tronabs.novera

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.util.Log
import android.widget.Toast
import androidx.core.content.FileProvider
import androidx.core.net.toUri
import org.json.JSONArray
import java.io.File
import java.net.URL
import java.security.MessageDigest
import javax.net.ssl.HttpsURLConnection
import kotlin.concurrent.thread

internal class ApkUpdater(private val activity: Activity) {
    private data class Release(val version: String, val code: Long, val url: String, val size: Long, val sha256: String)

    private val handler = Handler(Looper.getMainLooper())
    private val tick = Runnable { advance() }
    private var foreground = false
    private var busy = false
    private var nextCheck = 0L
    private var offer: Release? = null
    private var awaitingPermission: Release? = null
    private var ready: File? = null

    fun resume() {
        foreground = true
        awaitingPermission?.let { release ->
            awaitingPermission = null
            if (canInstall()) download(release)
        }
        advance()
    }

    fun pause() {
        foreground = false
        handler.removeCallbacks(tick)
    }

    private fun advance() {
        if (!foreground || busy || activity.isFinishing || activity.isDestroyed || activity.packageName != PACKAGE) return
        handler.removeCallbacks(tick)
        ready?.let { apk ->
            ready = null
            try {
                val uri = FileProvider.getUriForFile(activity, "${activity.packageName}.fileprovider", apk)
                activity.startActivity(Intent(Intent.ACTION_VIEW).apply {
                    setDataAndType(uri, "application/vnd.android.package-archive")
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                })
            } catch (error: Exception) {
                apk.delete()
                reportFailure(error)
            }
        }
        offer?.let { release ->
            offer = null
            AlertDialog.Builder(activity)
                .setTitle(R.string.apk_update_title)
                .setMessage(activity.getString(R.string.apk_update_message, release.version, release.code))
                .setNegativeButton(R.string.apk_update_later, null)
                .setPositiveButton(R.string.apk_update_install) { _, _ -> requestInstall(release) }
                .show()
        }
        val remaining = nextCheck - SystemClock.elapsedRealtime()
        if (remaining > 0) {
            handler.postDelayed(tick, remaining)
            return
        }
        nextCheck = SystemClock.elapsedRealtime() + CHECK_INTERVAL
        runInBackground(
            work = {
                val installed = activity.packageManager.getPackageInfo(PACKAGE, signatureFlags())
                if (hasReleaseSignature(installed)) findRelease(versionCode(installed)) else null
            },
            onResult = { offer = it }
        )
    }

    private fun requestInstall(release: Release) {
        if (canInstall()) {
            download(release)
            return
        }
        AlertDialog.Builder(activity)
            .setMessage(R.string.apk_update_permission)
            .setNegativeButton(android.R.string.cancel, null)
            .setPositiveButton(R.string.apk_update_settings) { _, _ ->
                try {
                    awaitingPermission = release
                    activity.startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, "package:$PACKAGE".toUri()))
                } catch (error: Exception) {
                    awaitingPermission = null
                    reportFailure(error)
                }
            }
            .show()
    }

    private fun canInstall() =
        Build.VERSION.SDK_INT < 26 || activity.packageManager.canRequestPackageInstalls()

    private fun download(release: Release) {
        Toast.makeText(activity, R.string.apk_update_downloading, Toast.LENGTH_LONG).show()
        runInBackground(
            work = { downloadVerified(release) },
            onResult = { ready = it },
            onError = ::reportFailure
        )
    }

    private fun <T> runInBackground(
        work: () -> T,
        onResult: (T) -> Unit,
        onError: (Throwable) -> Unit = { Log.w("NoveraApkUpdater", "Update check failed", it) }
    ) {
        busy = true
        thread(name = "novera-apk-update", isDaemon = true) {
            val result = try {
                Result.success(work())
            } catch (error: Exception) {
                Result.failure(error)
            }
            handler.post {
                busy = false
                if (!activity.isDestroyed && !activity.isFinishing) {
                    result.fold(onResult, onError)
                    advance()
                }
            }
        }
    }

    private fun reportFailure(error: Throwable) {
        Log.w("NoveraApkUpdater", "Could not prepare Android update", error)
        Toast.makeText(activity, R.string.apk_update_error, Toast.LENGTH_LONG).show()
    }

    private fun findRelease(installedCode: Long): Release? {
        var best: Release? = null
        var page = 1
        do {
            val response = connect("$API?per_page=100&page=$page")
            val more: Boolean
            try {
                val releases = response.inputStream.bufferedReader().use { JSONArray(it.readText()) }
                for (index in 0 until releases.length()) {
                    val item = releases.getJSONObject(index)
                    if (item.optBoolean("draft") || item.optBoolean("prerelease")) continue
                    val tag = item.optString("tag_name")
                    val match = TAG.matchEntire(tag) ?: continue
                    val (version, codeText) = match.destructured
                    val code = codeText.toLongOrNull() ?: continue
                    if (code <= (best?.code ?: installedCode) || code > Int.MAX_VALUE) continue
                    val name = "Novera_${version}_android-arm64.apk"
                    val url = "$REPOSITORY/releases/download/$tag/$name"
                    val assets = item.getJSONArray("assets")
                    for (assetIndex in 0 until assets.length()) {
                        val asset = assets.getJSONObject(assetIndex)
                        val digest = DIGEST.matchEntire(asset.optString("digest")) ?: continue
                        val size = asset.optLong("size")
                        if (asset.optString("name") == name && asset.optString("state") == "uploaded" &&
                            asset.optString("browser_download_url") == url && size in 1..MAX_APK_BYTES) {
                            best = Release(version, code, url, size, digest.groupValues[1])
                            break
                        }
                    }
                }
                more = response.getHeaderField("Link")?.contains("rel=\"next\"") == true
            } finally {
                response.disconnect()
            }
            page++
        } while (more)
        return best
    }

    private fun downloadVerified(release: Release): File {
        val directory = File(activity.cacheDir, "apk-updates")
        check(directory.isDirectory || directory.mkdirs())
        val expiry = System.currentTimeMillis() - 24 * 60 * 60 * 1000
        directory.listFiles()?.filter { it.lastModified() < expiry }?.forEach { it.delete() }
        val apk = File.createTempFile("novera-", ".apk", directory)
        try {
            val digest = MessageDigest.getInstance("SHA-256")
            val response = connect(release.url)
            try {
                var size = 0L
                response.inputStream.use { input ->
                    apk.outputStream().buffered().use { output ->
                        val buffer = ByteArray(64 * 1024)
                        while (true) {
                            val read = input.read(buffer)
                            if (read == -1) break
                            size += read
                            check(size <= release.size) { "APK exceeds published size" }
                            digest.update(buffer, 0, read)
                            output.write(buffer, 0, read)
                        }
                    }
                }
                check(size == release.size && hex(digest.digest()) == release.sha256) { "APK digest mismatch" }
            } finally {
                response.disconnect()
            }
            val manager = activity.packageManager
            val archive = manager.getPackageArchiveInfo(apk.absolutePath, signatureFlags())
            val installed = manager.getPackageInfo(PACKAGE, signatureFlags())
            check(archive != null && archive.packageName == PACKAGE && archive.versionName == release.version &&
                hasReleaseSignature(archive) &&
                hasReleaseSignature(installed) && versionCode(archive) == release.code &&
                versionCode(installed) < release.code) { "APK identity or version mismatch" }
            return apk
        } catch (error: Exception) {
            apk.delete()
            throw error
        }
    }

    private fun connect(url: String): HttpsURLConnection {
        val connection = URL(url).openConnection() as HttpsURLConnection
        connection.connectTimeout = 10_000
        connection.readTimeout = 30_000
        connection.setRequestProperty("User-Agent", "Novera-Android")
        try {
            check(connection.responseCode == 200) { "Unexpected update server response: ${connection.responseCode}" }
            return connection
        } catch (error: Exception) {
            connection.disconnect()
            throw error
        }
    }

    @Suppress("DEPRECATION")
    private fun hasReleaseSignature(info: PackageInfo): Boolean {
        val signers = if (Build.VERSION.SDK_INT >= 28) info.signingInfo?.apkContentsSigners else info.signatures
        val signer = signers?.singleOrNull() ?: return false
        return hex(MessageDigest.getInstance("SHA-256").digest(signer.toByteArray())) == CERTIFICATE
    }

    @Suppress("DEPRECATION")
    private fun signatureFlags() =
        if (Build.VERSION.SDK_INT >= 28) PackageManager.GET_SIGNING_CERTIFICATES else PackageManager.GET_SIGNATURES

    @Suppress("DEPRECATION")
    private fun versionCode(info: PackageInfo) =
        if (Build.VERSION.SDK_INT >= 28) info.longVersionCode else info.versionCode.toLong()

    private fun hex(bytes: ByteArray) = bytes.joinToString("") { "%02x".format(it) }

    private companion object {
        const val PACKAGE = "__RELEASE_PACKAGE__"
        const val CERTIFICATE = "__RELEASE_CERTIFICATE__"
        const val API = "https://api.github.com/repos/TRON-ABS/Novera/releases"
        const val REPOSITORY = "https://github.com/TRON-ABS/Novera"
        const val CHECK_INTERVAL = 6 * 60 * 60 * 1000L
        const val MAX_APK_BYTES = 2_147_483_647L
        val TAG = Regex("""v(\d+\.\d+\.\d+)-android-([1-9]\d*)""")
        val DIGEST = Regex("sha256:([0-9a-f]{64})")
    }
}
