package io.github.tronabs.novera

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
    private lateinit var startupDiagnostics: StartupDiagnostics

    override fun onCreate(savedInstanceState: Bundle?) {
        startupDiagnostics = StartupDiagnostics(this)
        startupDiagnostics.start()
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
    }

    override fun onWebViewCreate(webView: WebView) {
        super.onWebViewCreate(webView)
        startupDiagnostics.attach(webView)
    }
}
