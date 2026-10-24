import java.io.File
import javax.inject.Inject
import org.gradle.api.DefaultTask
import org.gradle.api.GradleException
import org.gradle.api.logging.LogLevel
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction
import org.gradle.process.ExecOperations

abstract class BuildTask : DefaultTask() {
    @get:Inject
    abstract val execOperations: ExecOperations
    @Input var rootDirRel: String? = null
    @Input var target: String? = null
    @Input var release: Boolean? = null

    @TaskAction
    fun assemble() {
        val root = rootDirRel ?: throw GradleException("rootDirRel cannot be null")
        val arch = target ?: throw GradleException("target cannot be null")
        val optimized = release ?: throw GradleException("release cannot be null")
        execOperations.exec {
            workingDir(File(project.projectDir, root))
            executable(System.getenv("NOVERA_NODE_BINARY") ?: "node")
            args("../node_modules/@tauri-apps/cli/tauri.js", "android", "android-studio-script")
            if (project.logger.isEnabled(LogLevel.DEBUG)) args("-vv")
            else if (project.logger.isEnabled(LogLevel.INFO)) args("-v")
            if (optimized) args("--release")
            args("--target", arch)
        }.assertNormalExitValue()
    }
}
