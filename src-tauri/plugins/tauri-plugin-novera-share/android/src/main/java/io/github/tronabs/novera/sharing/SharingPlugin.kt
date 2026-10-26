package io.github.tronabs.novera.sharing

import android.app.Activity
import android.content.ClipData
import android.content.Intent
import android.content.ClipboardManager
import android.content.Context
import androidx.core.content.FileProvider
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin
import java.io.File

@InvokeArg
class ShareArgs {
    lateinit var path: String
    lateinit var root: String
    var mime: String = "application/octet-stream"
    var title: String = "Novera"
    var text: String = ""
}

@TauriPlugin
class SharingPlugin(private val activity: Activity) : Plugin(activity) {
    private fun uri(args: ShareArgs): android.net.Uri {
        val file = File(args.path).canonicalFile
        val cache = activity.cacheDir.canonicalFile
        val root = File(args.root).canonicalFile
        require(root.name == "shares" && root.path.startsWith(cache.path + File.separator))
        require(file.isFile && file.path.startsWith(root.path + File.separator))
        return FileProvider.getUriForFile(activity, activity.packageName + ".novera.share", file)
    }

    @Command
    fun copyFile(invoke: Invoke) {
        try {
            val args = invoke.parseArgs(ShareArgs::class.java)
            val clipboard = activity.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            clipboard.setPrimaryClip(ClipData.newUri(activity.contentResolver, args.title, uri(args)))
            invoke.resolve()
        } catch (error: Exception) { invoke.reject(error.message ?: "SHARE_UNSUPPORTED") }
    }
    @Command
    fun share(invoke: Invoke) {
        try {
            val args = invoke.parseArgs(ShareArgs::class.java)
            val uri = uri(args)
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = args.mime
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_TITLE, args.title)
                if (args.text.isNotEmpty()) putExtra(Intent.EXTRA_TEXT, args.text)
                clipData = ClipData.newRawUri(args.title, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            activity.startActivity(Intent.createChooser(intent, args.title))
            invoke.resolve()
        } catch (error: Exception) {
            invoke.reject(error.message ?: "SHARE_UNSUPPORTED")
        }
    }
}
