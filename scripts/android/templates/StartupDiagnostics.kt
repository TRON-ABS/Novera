package io.github.tronabs.novera

import android.app.AlertDialog
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.security.NetworkSecurityPolicy
import android.webkit.WebView
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import org.json.JSONObject

// Internal diagnostic APK only. No network upload, WebView debug port, or data reset.
class StartupDiagnostics(private val activity: MainActivity) {
    private val handler = Handler(Looper.getMainLooper())
    private var webView: WebView? = null
    private var shown = false

    fun start() {
        handler.postDelayed({ collect() }, 20000)
    }

    @android.annotation.SuppressLint("RestrictedApi") // Same document-start hook used by Wry.
    fun attach(view: WebView) {
        webView = view
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            WebViewCompat.addDocumentStartJavaScript(view, """
                (function() {
                  window.__noveraStartupErrors = [];
                  function record(value) {
                    var message = String(value && value.message || value || 'unknown');
                    message = message.replace(/(?:sk-|hf_)[A-Za-z0-9_-]+/g, '[redacted]').slice(0, 300);
                    if (window.__noveraStartupErrors.length < 3) window.__noveraStartupErrors.push(message);
                  }
                  window.addEventListener('error', function(e) { record(e.message || e.error); });
                  window.addEventListener('unhandledrejection', function(e) { record(e.reason); });
                  var original = console.error;
                  console.error = function() {
                    if (String(arguments[0]).indexOf('Failed to boot app') >= 0) record(arguments[1]);
                    return original.apply(console, arguments);
                  };
                })();
            """.trimIndent(), setOf("http://tauri.localhost", "https://tauri.localhost"))
        }
    }

    private fun collect() {
        if (activity.isFinishing || activity.isDestroyed) return
        val report = JSONObject()
            .put("device", Build.MANUFACTURER + " " + Build.MODEL)
            .put("android", Build.VERSION.RELEASE)
            .put("api", Build.VERSION.SDK_INT)
            .put("webview", WebViewCompat.getCurrentWebViewPackage(activity)?.versionName ?: "unknown")
            .put("webviewCreated", webView != null)
            .put("tauriHttpAllowed", NetworkSecurityPolicy.getInstance().isCleartextTrafficPermitted("tauri.localhost"))
            .put("ipcHttpAllowed", NetworkSecurityPolicy.getInstance().isCleartextTrafficPermitted("ipc.localhost"))
        val view = webView
        if (view == null) { show(report); return }
        report.put("page", "no JavaScript response")
        // Only structural startup data: never read conversations, settings or keys.
        view.evaluateJavascript("""
            (function() {
              var root = document.getElementById('root');
              return JSON.stringify({
                ready: document.readyState,
                origin: location.origin,
                rootNodes: root ? root.childElementCount : -1,
                rootTextLength: root ? root.innerText.length : -1,
                tauriIpc: !!window.__TAURI_INTERNALS__,
                documentStartErrors: window.__noveraStartupErrors || [],
                secureContext: window.isSecureContext,
                randomUUID: typeof (window.crypto && window.crypto.randomUUID),
                toSorted: typeof Array.prototype.toSorted
              });
            })()
        """.trimIndent()) { result ->
            report.put("page", result)
            show(report)
        }
        handler.postDelayed({ show(report) }, 5000)
    }

    private fun show(report: JSONObject) {
        if (shown || activity.isFinishing || activity.isDestroyed) return
        shown = true
        val text = report.toString(2)
        AlertDialog.Builder(activity)
            .setTitle("Novera — diagnostic de demarrage")
            .setMessage(text)
            .setPositiveButton("Copier le diagnostic") { _, _ ->
                val clipboard = activity.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                clipboard.setPrimaryClip(ClipData.newPlainText("Novera startup", text))
            }
            .setNegativeButton("Fermer", null)
            .show()
    }
}
