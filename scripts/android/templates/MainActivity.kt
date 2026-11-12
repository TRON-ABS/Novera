package io.github.tronabs.novera

import android.os.Bundle
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
    private val apkUpdater by lazy { ApkUpdater(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
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
}
