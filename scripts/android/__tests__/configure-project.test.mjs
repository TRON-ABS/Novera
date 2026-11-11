import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const helper = path.join(root, 'scripts/android/configure-project.mjs')
const pin = JSON.parse(fs.readFileSync(path.join(root, 'scripts/android/toolchain.json'), 'utf8'))
function fixture(t) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-android-config-'))
  const project = path.join(temporary, 'project')
  const source = path.join(temporary, 'registry', 'plugin')
  const put = (file, text) => {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, text)
  }
  put(path.join(source, 'build.gradle.kts'), 'android {\n    kotlinOptions {\n        jvmTarget = "1.8"\n    }\n}\n')
  put(path.join(project, 'tauri.settings.gradle'), "include ':example'\nproject(':example').projectDir = new File(" + JSON.stringify(source) + ')\n')
  put(path.join(project, 'settings.gradle'), "include ':app'\napply from: 'tauri.settings.gradle'\n")
  put(path.join(project, 'app/build.gradle.kts'), 'android {\n    compileSdk = 36\n    defaultConfig {\n        minSdk = 24\n        targetSdk = 36\n    }\n    buildTypes { getByName("debug") {} }\n    kotlinOptions {\n        jvmTarget = "1.8"\n    }\n}\n')
  put(path.join(project, 'build.gradle.kts'), 'classpath("com.android.tools.build:gradle:8.11.0")\nclasspath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25")\n')
  put(path.join(project, 'buildSrc/build.gradle.kts'), 'dependencies {\n    implementation("com.android.tools.build:gradle:8.11.0")\n}\n')
  put(path.join(project, 'gradle/wrapper/gradle-wrapper.properties'), 'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.14.3-bin.zip\n')
  put(path.join(project, 'gradle.properties'), 'android.useAndroidX=true\norg.gradle.configuration-cache=true\n')
  put(path.join(project, 'app/src/main/AndroidManifest.xml'), '<manifest><application android:label="Novera"><activity android:name=".MainActivity" /></application></manifest>\n')
  t.after(() => {
    const absolute = path.resolve(temporary)
    assert.ok(absolute.startsWith(path.resolve(os.tmpdir()) + path.sep))
    assert.ok(path.basename(absolute).startsWith('novera-android-config-'))
    fs.rmSync(absolute, { recursive: true, force: true })
  })
  const run = (...args) => {
    const result = spawnSync(process.execPath, [helper, '--project', project, ...args], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr || result.stdout)
  }
  return { temporary, project, source, put, run, read: p => fs.readFileSync(path.join(project, p), 'utf8') }
}
test('synchronizes cached Gradle version values from canonical application and release settings', t => {
  const f = fixture(t)
  f.put(path.join(f.project, 'app/tauri.properties'), 'tauri.android.versionName=0.0.1\ntauri.android.versionCode=1\ncustom.keep=unchanged\n')
  f.run()
  const app = JSON.parse(fs.readFileSync(path.join(root, 'src-tauri/tauri.conf.json'), 'utf8'))
  const release = JSON.parse(fs.readFileSync(path.join(root, 'scripts/android/release.json'), 'utf8'))
  const properties = f.read('app/tauri.properties')
  assert.ok(properties.includes('tauri.android.versionName=' + app.version + '\n'))
  assert.ok(properties.includes('tauri.android.versionCode=' + release.versionCode + '\n'))
  assert.match(properties, /^custom.keep=unchanged$/m)
})

function snapshot(directory, prefix = '') {
  return Object.fromEntries(fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relative = prefix + entry.name
    const full = path.join(directory, entry.name)
    return entry.isDirectory() ? Object.entries(snapshot(full, relative + '/')) : [[relative, createHash('sha256').update(fs.readFileSync(full)).digest('hex')]]
  }))
}
test('aligns root and exported Kotlin versions, typed targets and pinned SDK tools', t => {
  const f = fixture(t)
  const original = fs.readFileSync(path.join(f.source, 'build.gradle.kts'), 'utf8')
  f.run()
  assert.ok(f.read('build.gradle.kts').includes('kotlin-gradle-plugin:' + pin.kotlin))
  assert.ok(f.read('buildSrc/build.gradle.kts').includes('implementation("org.jetbrains.kotlin:kotlin-gradle-plugin:' + pin.kotlin + '")'))
  assert.ok(f.read('app/build.gradle.kts').includes('minorApiLevel = ' + pin.compileSdkMinor))
  assert.ok(f.read('app/build.gradle.kts').includes('ndkVersion = "' + pin.ndk + '"'))
  assert.ok(f.read('app/build.gradle.kts').includes('JvmTarget.JVM_11'))
  assert.ok(f.read('novera-plugins/example/build.gradle.kts').includes('JvmTarget.JVM_1_8'))
  assert.ok(!f.read('novera-plugins/example/build.gradle.kts').includes('kotlinOptions'))
  assert.equal(fs.readFileSync(path.join(f.source, 'build.gradle.kts'), 'utf8'), original)
  assert.ok(f.read('gradle/wrapper/gradle-wrapper.properties').includes('gradle-' + pin.gradle + '-bin.zip'))
  assert.match(f.read('gradle.properties'), /^org\.gradle\.configuration-cache=false$/m)
  assert.doesNotMatch(f.read('gradle.properties'), /^org\.gradle\.configuration-cache=true$/m)
  assert.ok(f.read('settings.gradle').includes("apply from: 'novera.settings.gradle'"))
  assert.ok(f.read('novera.settings.gradle').includes('plugin.class.protectionDomain.codeSource.location'))
  assert.ok(f.read('buildSrc/src/main/java/io/github/tronabs/novera/kotlin/BuildTask.kt').includes('execOperations.exec'))
  assert.ok(f.read('app/src/main/AndroidManifest.xml').includes('android:networkSecurityConfig="@xml/network_security_config"'))
  assert.match(f.read('app/src/main/AndroidManifest.xml'), /android:windowSoftInputMode="adjustResize"/)
  const activity = f.read('app/src/main/java/io/github/tronabs/novera/MainActivity.kt')
  assert.match(activity, /SOFT_INPUT_ADJUST_RESIZE/)
  assert.match(activity, /SDK_INT >= Build\.VERSION_CODES\.R/)
  const network = f.read('app/src/main/res/xml/network_security_config.xml')
  assert.ok(network.includes('<base-config cleartextTrafficPermitted="false" />'))
  assert.ok(network.includes('<domain includeSubdomains="false">127.0.0.1</domain>'))
  assert.ok(network.includes('<domain includeSubdomains="false">localhost</domain>'))
  for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
    for (const name of ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png']) {
      const relative = `mipmap-${density}/${name}`
      assert.deepEqual(fs.readFileSync(path.join(f.project, 'app/src/main/res', relative)),
        fs.readFileSync(path.join(root, 'src-tauri/icons/android', relative)))
    }
  }
})
test('reconfiguration preserves generated content without duplicate blocks', t => {
  const f = fixture(t)
  f.run()
  const before = snapshot(f.project)
  f.run()
  assert.deepEqual(snapshot(f.project), before)
})

test('settings hook reapplies the task adaptation after Tauri regenerates Kotlin files', t => {
  const f = fixture(t)
  f.run()
  const appBefore = f.read('app/build.gradle.kts')
  const plugin = 'buildSrc/src/main/java/io/github/tronabs/novera/kotlin/RustPlugin.kt'
  f.put(path.join(f.project, plugin), 'task.apply {\n    rootDirRel = config.rootDirRel\n    projectDir = project.projectDir.path\n    target = targetName\n}\n')
  f.put(path.join(f.project, 'buildSrc/src/main/java/io/github/tronabs/novera/kotlin/BuildTask.kt'), 'regenerated upstream task\n')
  f.run('--plugins-only')
  assert.doesNotMatch(f.read(plugin), /\bprojectDir\s*=/)
  assert.match(f.read(plugin), /rootDirRel = config.rootDirRel/)
  assert.match(f.read(plugin), /target = targetName/)
  assert.match(f.read('buildSrc/src/main/java/io/github/tronabs/novera/kotlin/BuildTask.kt'), /workingDir\(File\(project\.projectDir, root\)\)/)
  assert.equal(f.read('app/build.gradle.kts'), appBefore)
  const before = snapshot(f.project)
  f.run('--plugins-only')
  assert.deepEqual(snapshot(f.project), before)
})

test('release packaging exports omitted consumer rules without changing registry sources', t => {
  const f = fixture(t)
  f.put(path.join(f.source, 'build.gradle.kts'), 'android { defaultConfig { consumerProguardFiles("consumer-rules.pro") } }\n')
  f.put(path.join(f.source, 'proguard-rules.pro'), '-keep class example.Native { *; }\n')
  f.run()
  assert.equal(f.read('novera-plugins/example/consumer-rules.pro'), '-keep class example.Native { *; }\n')
  assert.equal(fs.existsSync(path.join(f.source, 'consumer-rules.pro')), false)
  const before = snapshot(f.project)
  f.run()
  assert.deepEqual(snapshot(f.project), before)
})

test('inlines and refreshes Cargo dependencies without an external Kotlin script or lint bypass', t => {
  const f = fixture(t)
  f.put(path.join(f.project, 'app/tauri.build.gradle.kts'), '// Generated\nval implementation by configurations\ndependencies { implementation(project(":example")) }\n')
  f.put(path.join(f.project, 'app/build.gradle.kts'), f.read('app/build.gradle.kts') + '\napply(from = "tauri.build.gradle.kts")\n')
  f.run()
  assert.ok(!f.read('app/build.gradle.kts').includes('apply(from'))
  assert.ok(f.read('app/build.gradle.kts').includes('implementation(project(":example"))'))
  const before = snapshot(f.project)
  f.run()
  assert.deepEqual(snapshot(f.project), before)
  f.put(path.join(f.project, 'app/tauri.build.gradle.kts'), 'dependencies { implementation(project(":changed")) }\n')
  f.run('--plugins-only')
  assert.ok(f.read('app/build.gradle.kts').includes('implementation(project(":changed"))'))
  assert.ok(!f.read('app/build.gradle.kts').includes('implementation(project(":example"))'))
})
test('plugin refresh follows regenerated Cargo settings without editing the registry', t => {
  const f = fixture(t)
  f.run()
  const source2 = path.join(f.temporary, 'registry', 'second')
  const old = fs.readFileSync(path.join(f.source, 'build.gradle.kts'), 'utf8')
  f.put(path.join(source2, 'build.gradle.kts'), old)
  f.put(path.join(f.project, 'tauri.settings.gradle'), "include ':second'\nproject(':second').projectDir = new File(" + JSON.stringify(source2) + ')\n')
  f.run('--plugins-only')
  assert.deepEqual(JSON.parse(f.read('novera-plugin-sources.json')), { ':second': 'novera-plugins/second' })
  assert.ok(f.read('novera-plugins/second/build.gradle.kts').includes('compilerOptions'))
  assert.equal(fs.readFileSync(path.join(source2, 'build.gradle.kts'), 'utf8'), old)
})

test('accepts the Tauri 2.7 build dependency binding without disabling lint', t => {
  const f = fixture(t)
  f.put(path.join(f.project, 'app/tauri.build.gradle.kts'), '// Generated\nval implementation = configurations.getByName("implementation")\n\ndependencies { implementation(project(":example")) }\n')
  f.put(path.join(f.project, 'app/build.gradle.kts'), f.read('app/build.gradle.kts') + '\napply(from = "tauri.build.gradle.kts")\n')
  f.run()
  const text = f.read('app/build.gradle.kts')
  assert.ok(text.includes('implementation(project(":example"))'))
  assert.ok(!text.includes('val implementation'))
  assert.ok(!text.includes('apply(from'))
  assert.ok(!text.includes('checkReleaseBuilds = false'))
  const before = snapshot(f.project)
  f.run('--plugins-only')
  assert.deepEqual(snapshot(f.project), before)
})

test('adapts freshly generated Rust tasks without assigning the Gradle rootDir property', t => {
  const f = fixture(t)
  const plugin = 'buildSrc/src/main/java/io/github/tronabs/novera/kotlin/RustPlugin.kt'
  f.put(path.join(f.project, plugin), 'val first = task.apply {\n    rootDir = config.rootDirRel\n}\nval second = task.apply {\n    rootDirRel = config.rootDirRel\n    projectDir = project.projectDir.path\n    target = targetName\n}\n')
  f.run()
  const text = f.read(plugin)
  assert.equal((text.match(/rootDirRel = config.rootDirRel/g) ?? []).length, 2)
  assert.doesNotMatch(text, /\brootDir\s*=/)
  assert.doesNotMatch(text, /\bprojectDir\s*=/)
  assert.match(text, /target = targetName/)
  assert.match(f.read('buildSrc/src/main/java/io/github/tronabs/novera/kotlin/BuildTask.kt'), /var rootDirRel/)
  assert.match(f.read('buildSrc/src/main/java/io/github/tronabs/novera/kotlin/BuildTask.kt'), /workingDir\(File\(project\.projectDir, root\)\)/)
  const before = snapshot(f.project)
  f.run()
  assert.deepEqual(snapshot(f.project), before)
})
