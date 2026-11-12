package io.github.tronabs.novera

import android.os.Build
import android.os.Bundle
import android.graphics.Rect
import android.view.View
import android.view.ViewTreeObserver
import android.view.WindowManager
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
    private val apkUpdater by lazy { ApkUpdater(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
        // On older Android versions, let the system resize the WebView for the IME.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            enableEdgeToEdge()
        }
        super.onCreate(savedInstanceState)
    }

    override fun onResume() {
        super.onResume()
        apkUpdater.resume()
    }

    override fun onPause() {
        apkUpdater.pause()
        super.onPause()
    }

    override fun onWebViewCreate(webView: WebView) {
        super.onWebViewCreate(webView)
        val visibleFrame = Rect()
        val location = IntArray(2)
        val update = ViewTreeObserver.OnGlobalLayoutListener {
            if (webView.height == 0) return@OnGlobalLayoutListener
            // Older WebViews can keep reporting their full height while the IME covers them.
            webView.getWindowVisibleDisplayFrame(visibleFrame)
            webView.getLocationOnScreen(location)
            val visibleHeight = (visibleFrame.bottom - location[1]).coerceAtMost(webView.height)
            if (visibleHeight <= 0) return@OnGlobalLayoutListener
            val height = visibleHeight / webView.resources.displayMetrics.density
            webView.evaluateJavascript(
                "if(window.__noveraAndroidVisibleHeight!==$height){" +
                    "window.__noveraAndroidVisibleHeight=$height;" +
                    "window.dispatchEvent(new Event('novera-android-viewport'));}",
                null,
            )
        }
        webView.addOnAttachStateChangeListener(object : View.OnAttachStateChangeListener {
            override fun onViewAttachedToWindow(view: View) {
                view.viewTreeObserver.addOnGlobalLayoutListener(update)
            }

            override fun onViewDetachedFromWindow(view: View) {
                view.viewTreeObserver.removeOnGlobalLayoutListener(update)
            }
        })
        if (webView.isAttachedToWindow) webView.viewTreeObserver.addOnGlobalLayoutListener(update)
    }
}
