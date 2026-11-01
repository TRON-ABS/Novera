package io.github.tronabs.novera.sharing

import androidx.core.content.FileProvider

// A distinct component keeps the plugin's authority and path metadata separate
// from the application's export provider during Android manifest merging.
class NoveraShareProvider : FileProvider()
