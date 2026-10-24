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
  put(path.join(project, 'gradle.properties'), 'android.useAndroidX=true\n')
  put(path.join(project, 'app/src/main/AndroidManifest.xml'), '<manifest><application android:label="Novera" /></manifest>\n')
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
  assert.ok(f.read('settings.gradle').includes("apply from: 'novera.settings.gradle'"))
  assert.ok(f.read('novera.settings.gradle').includes('plugin.class.protectionDomain.codeSource.location'))
  assert.ok(f.read('buildSrc/src/main/java/io/github/tronabs/novera/kotlin/BuildTask.kt').includes('execOperations.exec'))
})
test('reconfiguration preserves generated content without duplicate blocks', t => {
  const f = fixture(t)
  f.run()
  const before = snapshot(f.project)
  f.run()
  assert.deepEqual(snapshot(f.project), before)
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
