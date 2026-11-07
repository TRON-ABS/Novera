import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '../..')
const pin = JSON.parse(fs.readFileSync(path.join(here, 'toolchain.json'), 'utf8'))
const args = process.argv.slice(2)
const projectArg = args.indexOf('--project')
const project = path.resolve(projectArg >= 0 ? args[projectArg + 1] : path.join(repo, 'src-tauri/gen/android'))
const pluginsOnly = args.includes('--plugins-only')
const read = p => fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
function write(p, text) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== text) fs.writeFileSync(p, text)
}
function managed(text, name, body) {
  const begin = '// NOVERA ' + name + ' BEGIN'
  const end = '// NOVERA ' + name + ' END'
  const start = text.indexOf(begin)
  if (start >= 0) {
    const finish = text.indexOf(end, start)
    if (finish < 0) throw new Error('Incomplete managed section: ' + name)
    return text.slice(0, start) + begin + '\n' + body + '\n' + end + text.slice(finish + end.length)
  }
  return text.trimEnd() + '\n\n' + begin + '\n' + body + '\n' + end + '\n'
}
function compilerOptions(text, target) {
  text = text.replace(/^[ \t]*kotlinOptions\s*\{[^{}]*\}[ \t]*(?:\n)?/gm, '')
  return managed(text, 'COMPILER OPTIONS', 'kotlin {\n    compilerOptions {\n        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.' + target + ')\n    }\n}')
}

// Read Cargo's generated paths, then adapt copies, never the Cargo registry.
const settings = path.join(project, 'tauri.settings.gradle')
if (!fs.existsSync(settings)) throw new Error('Tauri Android settings missing; run the mobile Cargo check first.')
const mapping = {}
const pattern = /project\('(:[^']+)'\)\.projectDir\s*=\s*new File\("((?:\\.|[^"])*)"\)/g
for (const match of read(settings).matchAll(pattern)) {
  const id = match[1]
  const source = path.resolve(JSON.parse('"' + match[2] + '"'))
  const destination = path.join(project, 'novera-plugins', id.slice(1))
  if (!/^:[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Unsupported plugin identifier: ' + id)
  if (source !== destination) {
    fs.cpSync(source, destination, {
      recursive: true,
      filter: p => !['build', '.gradle', '.kotlin'].includes(path.basename(p)),
    })
    for (const parent of [path.dirname(source), path.resolve(source, '../..')]) {
      for (const name of fs.readdirSync(parent).filter(n => /^(LICENSE|LICENCE|NOTICE)(?:[._-].*)?$/.test(n))) {
        const license = path.join(parent, name)
        if (fs.existsSync(license) && fs.statSync(license).isFile() && !fs.existsSync(path.join(destination, name))) {
          fs.copyFileSync(license, path.join(destination, name))
        }
      }
    }
  }
  const gradle = path.join(destination, 'build.gradle.kts')
  if (fs.existsSync(gradle)) {
    const pluginGradle = read(gradle)
    // Some published Tauri plugins reference a consumer-rules.pro omitted from
    // the crate. Export their existing project rules from the generated copy;
    // the tauri-android consumer rules preserve annotated JNI/plugin methods.
    for (const match of pluginGradle.matchAll(/consumerProguardFiles\("([^"]+)"\)/g)) {
      const name = match[1]
      if (path.basename(name) !== name) throw new Error('Unsupported consumer rules path')
      const rules = path.join(destination, name)
      if (!fs.existsSync(rules)) {
        const existing = path.join(destination, 'proguard-rules.pro')
        if (!fs.existsSync(existing)) throw new Error('Missing plugin consumer rules: ' + id)
        write(rules, read(existing))
      }
    }
    write(gradle, compilerOptions(pluginGradle, 'JVM_1_8'))
  }
  mapping[id] = 'novera-plugins/' + id.slice(1)
}
if (!Object.keys(mapping).length) throw new Error('No Android Tauri plugins found.')
write(path.join(project, 'novera-plugin-sources.json'), JSON.stringify(mapping, null, 2) + '\n')
// AGP 9.4 lint's K2 visitor crashes on the separately applied generated Kotlin
// dependency script (upstream b/561317331). Inline its declarative dependencies
// and refresh them from Cargo on every settings hook; do not disable lint.
const generatedDependencies = path.join(project, 'app/tauri.build.gradle.kts')
if (fs.existsSync(generatedDependencies)) {
  const body = read(generatedDependencies).replace(/^\/\/.*$/gm, '').replace(/^val implementation(?: by configurations| = configurations\.getByName\("implementation"\))\s*$/gm, '').trim()
  if (!/^dependencies\s*\{[\s\S]*\}$/.test(body)) throw new Error('Unsupported generated Tauri dependency script')
  const appGradle = path.join(project, 'app/build.gradle.kts')
  const appText = read(appGradle).replace(/^apply\(from\s*=\s*(?:file\()?"tauri\.build\.gradle\.kts"\)?\)\s*$/gm, '')
  write(appGradle, managed(appText, 'TAURI DEPENDENCIES', body))
}
// Tauri can regenerate these task files immediately before Gradle starts.
// The settings hook must adapt them too, even in plugins-only mode.
write(path.join(project, 'buildSrc/src/main/java/io/github/tronabs/novera/kotlin/BuildTask.kt'), read(path.join(here, 'templates/BuildTask.kt')))
const rustPlugin = path.join(project, 'buildSrc/src/main/java/io/github/tronabs/novera/kotlin/RustPlugin.kt')
if (fs.existsSync(rustPlugin)) {
  // The adapted task uses rootDirRel and obtains project.projectDir itself.
  // Gradle's inherited rootDir/projectDir properties are read-only Files.
  write(rustPlugin, read(rustPlugin)
    .replace(/^(\s*)rootDir\s*=\s*config\.rootDirRel\s*$/gm, '$1rootDirRel = config.rootDirRel')
    .replace(/^[ \t]*projectDir\s*=\s*project\.projectDir\.path[ \t]*$/gm, ''))
}
if (pluginsOnly) process.exit(0)

const app = path.join(project, 'app/build.gradle.kts')
let text = read(app)
text = text.replace(/^[ \t]*compileSdk(?:\s*=\s*[^\n]+|\s*\{[^\n]*\})[ \t]*$/gm,
  '    compileSdk { version = release(' + pin.compileSdk + ') { minorApiLevel = ' + pin.compileSdkMinor + ' } }')
for (const [key, value] of [['ndkVersion', pin.ndk], ['buildToolsVersion', pin.buildTools]]) {
  const expression = new RegExp('^[ \\t]*' + key + '\\s*=.*$', 'gm')
  const line = '    ' + key + ' = "' + value + '"'
  text = expression.test(text) ? text.replace(expression, line) : text.replace('android {', 'android {\n' + line)
}
text = text.replace(/^[ \t]*targetSdk\s*=.*$/gm, '        targetSdk = ' + pin.targetSdk)
text = text.replace(/^[ \t]*minSdk\s*=.*$/gm, '        minSdk = ' + pin.minimumSdk)
text = text.replace(/^[ \t]*compileOptions\s*\{[^{}]*\}[ \t]*(?:\n)?/gm, '')
if (!text.includes('useLegacyPackaging')) text = text.replace('android {', 'android {\n    packaging { jniLibs.useLegacyPackaging = true }')
text = text.replace('android {', 'android {\n    compileOptions {\n        sourceCompatibility = JavaVersion.VERSION_11\n        targetCompatibility = JavaVersion.VERSION_11\n    }')
if (!text.includes('applicationIdSuffix')) text = text.replace('getByName("debug") {', 'getByName("debug") {\n            applicationIdSuffix = ".debug"\n            versionNameSuffix = "-debug"')
const version = JSON.parse(read(path.join(repo, 'src-tauri/tauri.conf.json'))).version
const versionCode = JSON.parse(read(path.join(repo, 'src-tauri/tauri.android.conf.json'))).bundle.android.versionCode
const release = JSON.parse(read(path.join(here, 'release.json')))
if (versionCode !== release.versionCode) throw new Error('Android release versionCode is not synchronized')
text = text.replace(/getProperty\("tauri.android.versionName",\s*"[^"]*"\)/g, 'getProperty("tauri.android.versionName", "' + version + '")')
write(app, compilerOptions(text, 'JVM_11'))
// A direct Gradle rebuild can otherwise keep the preceding Tauri version.
// These generated values always follow the canonical application/release files.
const versionProperties = path.join(project, 'app/tauri.properties')
if (fs.existsSync(versionProperties)) {
  let generated = read(versionProperties)
  for (const [key, value] of [['versionName', version], ['versionCode', versionCode]]) {
    const pattern = new RegExp('^tauri\\.android\\.' + key + '=.*$', 'm')
    const entry = 'tauri.android.' + key + '=' + value
    generated = pattern.test(generated) ? generated.replace(pattern, entry) : generated.trimEnd() + '\n' + entry + '\n'
  }
  write(versionProperties, generated)
}

const main = path.join(project, 'build.gradle.kts')
write(main, read(main)
  .replace(/com\.android\.tools\.build:gradle:[^"]+/g, 'com.android.tools.build:gradle:' + pin.agp)
  .replace(/org\.jetbrains\.kotlin:kotlin-gradle-plugin:[^"]+/g, 'org.jetbrains.kotlin:kotlin-gradle-plugin:' + pin.kotlin))
const helper = path.join(project, 'buildSrc/build.gradle.kts')
let helperText = read(helper).replace(/com\.android\.tools\.build:gradle:[^"]+/g, 'com.android.tools.build:gradle:' + pin.agp)
if (helperText.includes('org.jetbrains.kotlin:kotlin-gradle-plugin:')) {
  helperText = helperText.replace(/org\.jetbrains\.kotlin:kotlin-gradle-plugin:[^"]+/g, 'org.jetbrains.kotlin:kotlin-gradle-plugin:' + pin.kotlin)
} else {
  helperText = helperText.replace('dependencies {', 'dependencies {\n    implementation("org.jetbrains.kotlin:kotlin-gradle-plugin:' + pin.kotlin + '")')
}
helperText = managed(helperText, 'HELPER TARGET', 'java {\n    sourceCompatibility = JavaVersion.VERSION_21\n    targetCompatibility = JavaVersion.VERSION_21\n}\ntasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {\n    compilerOptions.jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21)\n}')
write(helper, helperText)
const wrapper = path.join(project, 'gradle/wrapper/gradle-wrapper.properties')
write(wrapper, read(wrapper).replace(/^distributionUrl=.*$/m, 'distributionUrl=https\\://services.gradle.org/distributions/gradle-' + pin.gradle + '-bin.zip'))
const properties = path.join(project, 'gradle.properties')
let props = read(properties)
for (const [key, value] of [['android.builtInKotlin', 'false'], ['android.newDsl', 'false'], ['org.gradle.workers.max', '4']]) {
  const expression = new RegExp('^' + key.replaceAll('.', '\\.') + '=.*$', 'm')
  props = expression.test(props) ? props.replace(expression, key + '=' + value) : props.trimEnd() + '\n' + key + '=' + value + '\n'
}
write(properties, props)

const manifest = path.join(project, 'app/src/main/AndroidManifest.xml')
let xml = read(manifest)
for (const [key, value] of [['allowBackup', 'false'], ['fullBackupContent', 'false'], ['extractNativeLibs', 'true']]) {
  const expression = new RegExp('android:' + key + '="[^"]*"')
  xml = expression.test(xml) ? xml.replace(expression, 'android:' + key + '="' + value + '"') : xml.replace('<application', '<application\n        android:' + key + '="' + value + '"')
}
write(manifest, xml)
// Tauri init leaves its sample launcher in the generated project. Reapply the
// existing Novera hand assets on every configuration, including round variants.
fs.cpSync(path.join(repo, 'src-tauri/icons/android'), path.join(project, 'app/src/main/res'), { recursive: true })
// Local inference uses authenticated HTTP on loopback. Keep remote traffic TLS-only.
const security = path.join(project, 'app/src/main/res/xml/network_security_config.xml')
write(security, '<?xml version="1.0" encoding="utf-8"?>\n<network-security-config>\n  <base-config cleartextTrafficPermitted="false" />\n  <domain-config cleartextTrafficPermitted="true">\n    <domain includeSubdomains="false">localhost</domain>\n    <domain includeSubdomains="false">127.0.0.1</domain>\n  </domain-config>\n</network-security-config>\n')
xml = xml.replace(/\s+android:networkSecurityConfig="[^"]*"/g, '')
xml = xml.replace('<application', '<application\n        android:networkSecurityConfig="@xml/network_security_config"')
write(manifest, xml)
write(path.join(project, 'app/src/main/res/xml/file_paths.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<paths xmlns:android="http://schemas.android.com/apk/res/android">\n  <files-path name="novera_exports" path="exports/" />\n  <cache-path name="novera_export_cache" path="exports/" />\n</paths>\n')
fs.mkdirSync(path.join(project, 'app/src/main/java/io/github/tronabs/novera/generated'), { recursive: true })
write(path.join(project, 'app/src/main/assets/resources/LICENSE'), read(path.join(repo, 'LICENSE')))
write(path.join(project, 'app/src/main/assets/resources/SIGNATURE.txt'), read(path.join(here, 'templates/SIGNATURE.txt')))

// Cargo may regenerate tauri.settings.gradle on every native build. This hook survives it.
const settingsMain = path.join(project, 'settings.gradle')
let mainSettings = read(settingsMain)
if (!mainSettings.includes("apply from: 'novera.settings.gradle'")) mainSettings = mainSettings.trimEnd() + "\n\napply from: 'novera.settings.gradle'\n"
write(settingsMain, mainSettings)
const hook = read(path.join(here, 'templates/novera.settings.gradle'))
  .replaceAll('__CONFIG_SCRIPT__', "'" + path.join(here, 'configure-project.mjs').replaceAll('\\', '/').replaceAll("'", "\\'") + "'")
  .replaceAll('__KOTLIN_VERSION__', JSON.stringify(pin.kotlin))
write(path.join(project, 'novera.settings.gradle'), hook)
write(path.join(project, 'novera-toolchain.json'), JSON.stringify(pin, null, 2) + '\n')
console.log('Android configured: JDK ' + pin.jdkVersion + ', SDK ' + pin.sdkPlatform + ', NDK ' + pin.ndk + ', Gradle ' + pin.gradle + ', Kotlin ' + pin.kotlin + '.')
