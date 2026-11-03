<p align="center"><a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.de.md">Deutsch</a> · <a href="README.it.md">Italiano</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिंदी</a> · <a href="README.bn.md">বাংলা</a> · <a href="README.ur.md">اردو</a> · <a href="README.mr.md">मराठी</a> · <a href="README.te.md">తెలుగు</a> · <a href="README.ta.md">தமிழ்</a> · <a href="README.sw.md">Kiswahili</a> · <a href="README.ha.md">Hausa</a> · <a href="README.tl.md">Tagalog</a> · <a href="README.fa-IR.md">فارسی (ایران)</a> · <a href="README.am.md">አማርኛ</a> · <a href="README.th.md">ไทย</a> · <a href="README.jv.md">Basa Jawa</a> · <a href="README.id.md">Bahasa Indonesia</a> · <a href="README.pl.md">Polski</a> · <a href="README.vn.md">Tiếng Việt</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.cs.md">Čeština</a> · <a href="README.ko.md">한국어</a> · <a href="README.ca.md">Català</a> · <a href="README.gu.md">ગુજરાતી</a> · <a href="README.kn.md">ಕನ್ನಡ</a> · <a href="README.yo.md">Yorùbá</a> · <a href="README.my.md">မြန်မာ</a> · <a href="README.ln.md">Lingála</a> · <a href="README.or.md">ଓଡ଼ିଆ</a> · <a href="README.uk.md">Українська</a> · <a href="README.ml.md">മലയാളം</a> · <a href="README.pa.md">ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ)</a> · <a href="README.nl.md">Nederlands</a></p>

<div align="center">
  <img src=".github/assets/novera-banner-en.png" alt="Novera — Wissen für alle" width="100%" />
  <p><strong>Sie beschreiben Ihr Ziel. Novera bereitet vor, führt aus und organisiert.</strong></p>
  <p>Ein unabhängiger KI-Assistent von TRON-ABS, vom ersten Start bis zum Ergebnis: Text, Bilder, Musik und Video in einem Gespräch.</p>
  <p><strong>Verfügbar für Windows, Linux, macOS und Android</strong> · 80 Oberflächensprachen · 42 Cloud-Anbieter · 49 Medienvoreinstellungen · Apache 2.0</p>
  <p><a href="#from-first-launch-to-results">Automatisierung</a> · <a href="#one-dashboard-for-every-creation">Erstellungsübersicht</a> · <a href="#local-models-in-use">Lokale Modelle</a> · <a href="#hub-and-compatible-models">Formate &amp; Hub</a> · <a href="#cloud-providers">Cloud</a> · <a href="CONTRIBUTING.md">Mitwirken</a></p>
  <p>Offizieller Kontakt: <a href="mailto:contact.novera.tronabs@gmail.com" dir="ltr">contact.novera.tronabs@gmail.com</a></p>
  <p>Offizielle Novera-Social-Profile: <a href="https://www.facebook.com/profile.php?id=61596114515071">Facebook</a> · <a href="https://www.instagram.com/noveratronabs/">Instagram</a> · <a href="https://www.tiktok.com/@tronabs0">TikTok</a> · <a href="https://www.youtube.com/@noveratronabs">YouTube</a> · <a href="https://x.com/noveratronabs">X</a> · <a href="https://bsky.app/profile/noveratronabs.bsky.social">Bluesky</a></p>
  <p>Teilen Sie Ihre Kreationen, Modelle, Einstellungen, Fragen, Feedback und Ideen.</p>
</div>

> Unterstützte Übersetzung der englischen README vom 3. November 2026. Muttersprachliche Korrekturen sind willkommen. Verlinkte Dokumente bleiben in ihrer ursprünglichen Sprache.

---

## Verfügbarkeit — 3. November 2026

**Novera 1.0.0 ist für Windows, Linux, macOS und Android verfügbar.** [Windows x64 / Linux x64](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0) · [Windows ARM64](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-windows-arm64). Desktop-Pakete, sowohl CLI-Archive, Signaturen als auch Update-Manifeste sind öffentlich und verifiziert.

| Plattform | Verfügbarkeit |
| --- | --- |
| Windows x64 | Öffentlicher NSIS-Installer, signierter Updater; Native Installation und Austausch überprüft. |
| Linux x64 | Öffentlicher AppImage, signierter Updater; Native Installation und Austausch überprüft. |
| Windows x64 / Linux x64 CLI | [Novera CLI](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-cli-novera): `novera.exe` / `novera`, mit einem dedizierten signierten Update-Kanal. |
| Windows ARM64 | [Öffentliches NSIS-Installationsprogramm](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-windows-arm64), native CPU-Text-Engine; Installation, Austausch und Public-Channel-Prüfungen verifiziert. |
| Android ARM64 | [Öffentlich signiert APK 1.0.0](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-android-1000012), Android 7+, Standardstapel 512. Der Betreuer bestätigt, dass Build 1000012 auf seinem Telefon funktioniert. Sauberes Paket ohne Gespräche, Modelle oder persönliche API-Schlüssel. [Beweise und Einschränkungen](docs/RELEASE_ANDROID_1.0.0.md). |
| macOS Intel / Apple Silicon | [Offizielle 1.0.0 DMG-Version](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-macos), macOS 13+ Intel / 14+ Apple Silicon; Novera-signierte Updates. Nicht von Apple notariell beglaubigt; Automatisierte Prüfungen wurden für beide Architekturen getrennt durchgeführt, visuelle Prüfungen wurden verschoben. [Installation und Nachweis](docs/RELEASE_MACOS_1.0.0.md). |
| iOS | Interner Simulatoraufbau; Vor der iPhone-Installation ist eine Apple-Signatur/-Bereitstellung erforderlich. [Nachverfolgung](docs/REPRISE_MACOS_IOS.md). |
| Windows x64 tragbar | [Signiertes ZIP-Archiv](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-windows-portable); Daten bleiben in Data, signierter Program-Ersatz verifiziert. |
| Web, MSI, Debian | Gehosteter Web-Client und andere Formate bleiben intern; Die Präsentationsseite für Seiten ist verfügbar. |

Öffnen Sie auf dem Mac DMG und kopieren Sie Novera in „Anwendungen“. Wenn der erste Start blockiert ist, lassen Sie Novera zu **Systemeinstellungen → Datenschutz und Sicherheit → Trotzdem öffnen**. [Apple-Anweisungen](https://support.apple.com/guide/mac-help/mh40616/mac).

Updater-Signaturen sind keine Windows Authenticode oder Apple-Beglaubigung. Manuelle Prüfungen der aktuellen Version werden im öffentlichen Kanal durchgeführt. Ein Übergang zwischen zwei öffentlichen Versionen bleibt ein Test für die nächste Veröffentlichung. [Beweise und Einschränkungen](docs/LAUNCH_STATUS.md).

Für lokale Modelle unter Android wird ein modernes Smartphone mit ausreichend Speicher empfohlen. Nutzen Sie auf schwächeren Geräten einen API-Anbieter. Für die Websuche wird in allen Versionen ein Kontext von mindestens **16K Tokens (16,384)** empfohlen.

**Windows x64 tragbar 1.0.0 ist verfügbar.** Diskussionen, Einstellungen und heruntergeladene Versionen bleiben im tragbaren Ordner darunter `Data`. Entpacken Sie das komplette Archiv und starten Sie `Novera.exe`. Schließen Sie Novera, bevor Sie den Ordner verschieben oder USB-Speicher auswerfen. [Tragbare Anleitung und Einschränkungen](docs/WINDOWS_PORTABLE.md).

<a id="one-dashboard-for-every-creation"></a>

## Ein Dashboard für jede Kreation

Novera wächst mit Ihnen. Ihre Beispiele und Einstellungen können anderen Benutzern helfen, ein passendes Setup zu finden. Teilen Sie Fragen, Probleme und Ideen auf unserer Seite [Facebook page](https://www.facebook.com/profile.php?id=61596114515071) oder per [E-Mail](mailto:contact.novera.tronabs@gmail.com). Geben Sie nach Möglichkeit Ihre Novera-Version, Ihr Gerät und Ihr lokales/API-Modell an. Entfernen Sie persönliche Daten und geben Sie niemals API-Schlüssel oder Passwörter weiter.

![Novera generiertes Bild und einheitliches Dashboard mit Menge, Seed, Upscaling und automatischem Speicher](.github/assets/novera-dashboard-2026-11-01.png)

*Echter Screenshot der Windows-Anwendung, bereitgestellt vom Betreuer am 1 November 2026, der berichtet, dass die Anwendung gut funktioniert. Es zeigt eine generierte Landschaft, ihre Steuerelemente für gespeicherte Dateien und das einheitliche Erstellungs-Dashboard; Dies ist kein Modell.*

Ein Panel, fünf Modi: **Auto, Text, Bild, Musik und Video**. Die Steuerung folgt dem ausgewählten Modus: Verhältnis, Auflösung, Dauer, Kadenz, Qualität, Instrumental, Liedtext, Startwert und Quantität. Panelbreite und Schaltflächen passen sich dem Fenster und den übersetzten Beschriftungen an.

- **1–10 sequentielle Generationen**, standardmäßig 1, mit unabhängigen Mengen für Bild, Musik und Video. Stop bricht die aktive Aufgabe und die verbleibende Warteschlange ab.
- **Zufällige, feste, +1- und −1-Seeds**, voreingestellte oder benutzerdefinierte Verhältnisse und optional **Real-ESRGAN ×2/×4** Hochskalierung mit angezeigten Endmaßen.
- Das ausgewählte Modell, der automatische Speicher, Anhänge, Anweisungen, die Websuche und die Tools bleiben in derselben Leiste. Werkzeuge hängen von den Modellfunktionen und dem gewährten Zugriff ab.

<a id="from-first-launch-to-results"></a>

## Vom ersten Start bis zu den Ergebnissen

**Unsere Automatisierung verbindet die Vorbereitung mit dem gesamten Ausführungsworkflow.** Novera übernimmt die technischen Schritte, die für die ausgewählte Konfiguration verfügbar sind, und behält gleichzeitig den Zugriff auf erweiterte Steuerelemente bei.

| Schritt | Was Novera verarbeitet |
| --- | --- |
| **1. Starten** | Wählt beim ersten Start eine unterstützte Systemsprache aus und speichert Ihre Präferenz. Präsentiert Einstiegsmodelle und nützliche Hardwareinformationen. |
| **2. Bereiten Sie sich vor** | Die geführte Installation bietet Text, Einbettungen, Bilder, Musik, Video und Hochskalierung. Es zeigt vor Ihrer Genehmigung eine Vorschau der Komponenten, Größen und des freien Speicherplatzes an und verfolgt dann die Downloads mit Fortschritt, Pause/Fortsetzung und SHA-256-Überprüfung. |
| **3. Konfigurieren** | Registriert Modelle und ihre Komponenten, bereitet die relevanten Profile vor und meldet erforderliche Abhängigkeiten. Abrufeinbettungen beginnen auf CPU mit einer gespeicherten CPU/GPU-Auswahl. Neue Musikprofile verwenden standardmäßig den Instrumentalmodus. |
| **4. Verstehen Sie die Anfrage** | Leitet erkannte Erstellungsanfragen automatisch an Text, Bild, Musik oder Video weiter. Sie können den Ausgabemodus und ein lokales oder Cloud-Modell auch explizit auswählen. |
| **5. Ausführen** | Der automatische Speicher wartet auf aktive Arbeit, gibt nicht benötigte Modelle frei und lädt erforderliche Ressourcen neu. Eine Auftragsreihe 1–10 wird der Reihe nach ausgeführt und gibt Ressourcen vor dem nächsten Auftrag frei. Cloud-Anbieter verwenden das ausgewählte Konto und die ausgewählte Konfiguration. |
| **6. Abrufen und wiederverwenden** | Speichert Medien in Novera-Systemordnern, zeigt Ergebnisse und verfügbare Timings an und bietet dann Varianten, die Bibliothek, Kopieren, Exporte oder Systemfreigaben an. Das Senden an eine andere Anwendung bleibt Ihre Aktion. |

Automatisierung umfasst integrierte Engines und Workflows; Dadurch wird nicht jedes Hub-Modell ausführbar. Hardware, installierte Komponenten und Anbieterzugriff bestimmen, was ausgeführt werden kann. Ordner, Dateiänderungen und Shell-Befehle folgen den Zugriffsberechtigungen der Konversation.

[Benutzerhandbuch](docs/USER_GUIDE.md) · [Motoren und Validierung](docs/SUIVI_MOTEURS.md) · [Entwicklung](docs/DEVELOPMENT.md)

In den aktualisierten Quellen, **Configurations passt seine Empfehlungen an mobile und eingeschränkte Hardware an**: LFM3-1.7B Q4 oder LFM3-Omni-2B Q4 mit seinem Projektor, wenn die gemeldeten Speicher- und Engine-Anforderungen erfüllt sind. Die nicht verfügbare lokale Generierung wird ausgeblendet oder blockiert. konfigurierte Cloud-Bild, Musik und Video bleiben weiterhin verfügbar. Die Schnittstellenführung verwendet die Sprachkataloge 80 wieder. Diese Schätzungen erfordern noch Gerätetests und eine Neuerstellung, um installierte Anwendungen zu erreichen.

## Fähigkeiten in der Quelle

Die optionale Wartungsdiagnose unterscheidet jetzt Builds und vom Instrument behandelte Fehler sowie JavaScript-Ausnahmen mit separater Zustimmung und gefilterten technischen Feldern. Für den Betreuer ist eine stündliche Produktions-E-Mail-Benachrichtigung konfiguriert. Private Quellkarten und Warnungsdetails folgen dem [Wartungs-Runbook](docs/MAINTENANCE.md); Der Test-E-Mail-Empfang wird bestätigt, während der authentifizierte Symbol-Upload und das Testen in der nächsten Binärdatei als Freigabeprüfungen verbleiben.

| Bereich | Funktionen |
| --- | --- |
| **Text und Vision** | Konversation, Dokumentanhänge, gestreamte Antworten und lokale oder Cloud-Modelle. Die Sicht hängt vom Modell ab; Verstehen und Bilder erzeugen sind getrennte Fähigkeiten. |
| **Bild** | Konversationsgenerierung, Seeds, Verhältnisse, Auflösung, GGUF/Safetensors-Komponenten, konfigurierte Diffusers-Ordner und das unterstützte native NVFP4 CUDA-Profil. |
| **Musik** | Lokale oder Cloud-Generierung, Dauer, Qualität, Instrumental oder Gesang, sofern unterstützt, strukturierte Texte und ein Audioplayer. Die Anbieteroptionen sind unterschiedlich. |
| **Video** | Lokale oder Cloud-Generierung, Dauer, Bildanzahl/Trittfrequenz für lokale Profile, Verhältnisse, Auflösung und ein Videoplayer. |
| **Suche und Tools** | Websuche, einbettungsbasierter Dokumentenabruf, MCP, Arbeitsbereiche und lokale Tools je nach Modellunterstützung und gewährtem Zugriff. |
| **Ergebnisse und Teilen** | Medienbibliothek, Varianten, Antwort-/Gesprächsexporte, Dokumente und Originalmedien, Drucken/PDF und plattformabhängige Systemfreigabe. |
| **Ressourcenmanagement** | Automatischer Speicher standardmäßig aktiviert, CPU/GPU-Einstellungen für unterstützte Komponenten und manuelle Profile, wenn die Ressourcen dies zulassen. |

<a id="local-models-in-use"></a>

## Lokale Modelle im Einsatz

Diese Modelle bilden die aktuelle geführte Konfiguration. Sie können andere kompatible Modelle importieren oder die Profile ändern.

| Rolle | Modell / konfigurierte Komponenten |
| --- | --- |
| **Text – Erstmodell** | **Nemotron-3.5-Bolt-E4B**, Datei `Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf`. |
| **Dokumentenabruf** | **Qwen3-Embedding-0.6B Q8_0**, **CPU standardmäßig**, mit einer gespeicherten CPU/GPU-Auswahl. |
| **Bild** | **FLUX.2 Klein 4B Q4_K_M**, **Qwen3-4B Q4_K_M** Encoder und offizieller FLUX.2 VAE. |
| **Bild – Hardwareoption** | **FLUX.2 Klein 4B NVFP4**über den nativen CUDA-Pfad, wenn GPU und Umgebung kompatibel sind. |
| **Musik** | **ACE-Step 1.5 Turbo 2B Q4_K_M**, `acestep-5Hz-lm-1.7B-Q8_0.gguf` Planer, dedizierter Musik-Encoder Qwen und VAE. |
| **Video** | **Wan2.1 T2V 1.3B Q4_K_M**, **UMT5-XXL Q4_K_M** Encoder und Wan 2.1 VAE. |
| **Hochskalierung** | Optional **Real-ESRGAN ×2 und ×4**, mit Abhängigkeitsprüfungen. |

Der Musik-Encoder Qwen und das Abrufmodell Qwen sind **verschiedene Dateien**, separat gespeichert. Modelllizenzen verbleiben bei ihren Herausgebern.

[Textmanifest](web-app/src/constants/text-manifest.json) · [Einbettungen](web-app/src/constants/embedding-manifest.json) · [Musik](web-app/src/constants/music-manifest.json) · [Bild-/Videokomponenten](src-tauri/src/core/creation_bundle.rs)

<a id="cloud-providers"></a>

## Cloud-Anbieter

**42 Anbieterprofile** sind integriert. **ElevenLabs** erscheint nun im Showcase neben den Musikrouten von Stability AI, fal und Replicate.

| | | |
| --- | --- | --- |
| <img src="web-app/public/images/model-provider/openai.svg" alt="OpenAI" width="28" height="28" /> [OpenAI](https://platform.openai.com/docs/models) | <img src="web-app/public/images/model-provider/azure.svg" alt="Microsoft Azure" width="28" height="28" /> [Microsoft Azure](https://oai.azure.com/deployments) | <img src="web-app/public/images/model-provider/anthropic.svg" alt="Anthropic" width="28" height="28" /> [Anthropic](https://platform.claude.com/docs/en/models/overview) |
| <img src="web-app/public/images/model-provider/open-router.svg" alt="OpenRouter" width="28" height="28" /> [OpenRouter](https://openrouter.ai/models) | <img src="web-app/public/images/model-provider/mistral.svg" alt="Mistral" width="28" height="28" /> [Mistral](https://docs.mistral.ai/models) | <img src="web-app/public/images/model-provider/groq.svg" alt="Groq" width="28" height="28" /> [Groq](https://console.groq.com/docs/models) |
| <img src="web-app/public/images/model-provider/xai.svg" alt="xAI" width="28" height="28" /> [xAI](https://docs.x.ai/developers/models) | <img src="web-app/public/images/model-provider/gemini.svg" alt="Google Gemini" width="28" height="28" /> [Google Gemini](https://ai.google.dev/gemini-api/docs/models) | <img src="web-app/public/images/model-provider/minimax.svg" alt="MiniMax" width="28" height="28" /> [MiniMax](https://platform.minimax.io/docs/api-reference/text-openai-api) |
| <img src="web-app/public/images/model-provider/huggingface.svg" alt="Hugging Face" width="28" height="28" /> [Hugging Face](https://huggingface.co/models?pipeline_tag=text-generation&inference_provider=all) | <img src="web-app/public/images/model-provider/nvidia.svg" alt="NVIDIA NIM" width="28" height="28" /> [NVIDIA NIM](https://build.nvidia.com/models) | <img src=".github/assets/providers/deepseek.png" alt="DeepSeek" width="28" height="28" /> [DeepSeek](https://api-docs.deepseek.com/) |
| <img src="web-app/public/images/model-provider/moonshot.png" alt="Kimi · Moonshot AI" width="28" height="28" /> [Kimi · Moonshot AI](https://platform.kimi.ai/docs/models) | <img src="web-app/public/images/model-provider/alibaba.png" alt="Alibaba Cloud · Qwen" width="28" height="28" /> [Alibaba Cloud · Qwen](https://www.alibabacloud.com/help/en/model-studio/models) | <img src="web-app/public/images/model-provider/cerebras.png" alt="Cerebras" width="28" height="28" /> [Cerebras](https://inference-docs.cerebras.ai/models/overview) |
| <img src="web-app/public/images/model-provider/together.svg" alt="Together AI" width="28" height="28" /> [Together AI](https://docs.together.ai/docs/serverless/models) | <img src="web-app/public/images/model-provider/fireworks.svg" alt="Fireworks AI" width="28" height="28" /> [Fireworks AI](https://docs.fireworks.ai/getting-started/models) | <img src="web-app/public/images/model-provider/perplexity.png" alt="Perplexity" width="28" height="28" /> [Perplexity](https://docs.perplexity.ai/docs/agent-api/models) |
| <img src=".github/assets/providers/meta.png" alt="Meta AI" width="28" height="28" /> [Meta AI](https://dev.meta.ai/docs/models) | <img src="web-app/public/images/model-provider/cohere.svg" alt="Cohere" width="28" height="28" /> [Cohere](https://docs.cohere.com/docs/models) | <img src="web-app/public/images/model-provider/zai.svg" alt="Z.ai" width="28" height="28" /> [Z.ai](https://docs.z.ai/guides/llm/glm-5.3) |
| <img src="web-app/public/images/model-provider/ai21.png" alt="AI21 Labs" width="28" height="28" /> [AI21 Labs](https://docs.ai21.com/docs/jamba-foundation-models) | <img src="web-app/public/images/model-provider/byteplus.png" alt="BytePlus · ByteDance" width="28" height="28" /> [BytePlus · ByteDance](https://docs.byteplus.com/en/docs/modelark/model-parameter-support) | <img src=".github/assets/providers/baidu.png" alt="Baidu Qianfan" width="28" height="28" /> [Baidu Qianfan](https://cloud.baidu.com/doc/qianfan/s/rmh4stp0j) |
| <img src=".github/assets/providers/tencent.png" alt="Tencent TokenHub" width="28" height="28" /> [Tencent TokenHub](https://cloud.tencent.com/document/product/1823/130078) | <img src="web-app/public/images/model-provider/bedrock.png" alt="Amazon Bedrock" width="28" height="28" /> [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-chat-completions.html) | <img src="web-app/public/images/model-provider/watsonx.png" alt="IBM watsonx" width="28" height="28" /> [IBM watsonx](https://www.ibm.com/docs/en/watsonx/saas?topic=preview-inferencing-gateway-models) |
| <img src="web-app/public/images/model-provider/elevenlabs.png" alt="ElevenLabs" width="28" height="28" /> [ElevenLabs](https://elevenlabs.io/docs/api-reference/music/compose) | <img src="web-app/public/images/model-provider/bfl.png" alt="Black Forest Labs" width="28" height="28" /> [Black Forest Labs](https://docs.bfl.ai/quick_start/generating_images) | <img src="web-app/public/images/model-provider/stability.png" alt="Stability AI" width="28" height="28" /> [Stability AI](https://docs.stability.ai/api-reference) |
| <img src="web-app/public/images/model-provider/recraft.png" alt="Recraft" width="28" height="28" /> [Recraft](https://www.recraft.ai/docs/api-reference/agents.md) | <img src="web-app/public/images/model-provider/ideogram.png" alt="Ideogram" width="28" height="28" /> [Ideogram](https://developer.ideogram.ai/ideogram-api/api-overview) | <img src="web-app/public/images/model-provider/adobe-firefly.png" alt="Adobe Firefly" width="28" height="28" /> [Adobe Firefly](https://developer.adobe.com/firefly-services/docs/firefly-api/) |
| <img src="web-app/public/images/model-provider/runway.png" alt="Runway" width="28" height="28" /> [Runway](https://docs.dev.runwayml.com/api/) | <img src="web-app/public/images/model-provider/luma.png" alt="Luma" width="28" height="28" /> [Luma](https://docs.agents.lumalabs.ai/guides/model/) | <img src="web-app/public/images/model-provider/ltx.png" alt="LTX (Lightricks)" width="28" height="28" /> [LTX (Lightricks)](https://docs.ltx.io/models) |
| <img src="web-app/public/images/model-provider/fal.png" alt="fal" width="28" height="28" /> [fal](https://fal.ai/docs/documentation/model-apis/inference/queue) | <img src="web-app/public/images/model-provider/replicate.png" alt="Replicate" width="28" height="28" /> [Replicate](https://replicate.com/docs/reference/http) | <img src="web-app/public/images/model-provider/leonardo.png" alt="Leonardo.Ai" width="28" height="28" /> [Leonardo.Ai](https://docs.leonardo.ai/reference/creategeneration) |
| <img src="web-app/public/images/model-provider/krea.png" alt="Krea" width="28" height="28" /> [Krea](https://www.krea.ai/docs/developers/krea-3/overview) | <img src="web-app/public/images/model-provider/vidu.png" alt="Vidu" width="28" height="28" /> [Vidu](https://platform.vidu.com/docs/model-map) | <img src="web-app/public/images/model-provider/pixverse.png" alt="PixVerse" width="28" height="28" /> [PixVerse](https://docs.platform.pixverse.ai/changelog-2394996m0) |

### Bild, Musik und Video

**20-Anbieter stellen Generierungsrouten bereit**, mit **49-Voreinstellungen: 25-Bild, 20-Video und 4-Musik**. Musikrouten sind **ElevenMusic v2.5**, **Stable Audio 3**, **ACE-Step bis fal** Und **Stable Audio 2.5 bis Replicate**.

| Anbieter | Gibt in Novera aus | Katalogmodelle |
| --- | --- | --- |
| <img src="web-app/public/images/model-provider/elevenlabs.png" alt="ElevenLabs" width="24" height="24" /> [ElevenLabs](https://elevenlabs.io/docs/api-reference/music/compose) | Musik | `ElevenMusic v2.5` |
| <img src="web-app/public/images/model-provider/stability.png" alt="Stability AI" width="24" height="24" /> [Stability AI](https://docs.stability.ai/api-reference/stable-audio/text-to-audio) | Bild / Musik | `Stable Audio 3` · `Stable Image Ultra` · `Stable Image Core` |
| <img src="web-app/public/images/model-provider/fal.png" alt="fal" width="24" height="24" /> [fal](https://fal.ai/models/fal-ai/ace-step/api) | Bild / Musik / Video | `ACE-Step · cloud` · `Pika 2.2 · fal` · `Qwen Image 2512 · fal` · `FLUX.2 Max · fal` · `Kling 3 Pro · fal` · `Kling 3 Standard · fal` |
| <img src="web-app/public/images/model-provider/replicate.png" alt="Replicate" width="24" height="24" /> [Replicate](https://replicate.com/stability-ai/stable-audio-2.5/api/schema) | Bild / Musik | `Stable Audio 2.5 · Replicate` · `FLUX.2 Max · Replicate` |
| <img src="web-app/public/images/model-provider/byteplus.png" alt="BytePlus · ByteDance" width="24" height="24" /> [BytePlus · ByteDance](https://docs.byteplus.com/en/docs/ModelArk/image-generation-api) | Bild / Video | `Dola Seedream 5 Pro` · `Dreamina Seedance 2.5` |
| <img src="web-app/public/images/model-provider/adobe-firefly.png" alt="Adobe Firefly" width="24" height="24" /> [Adobe Firefly](https://developer.adobe.com/firefly-services/docs/firefly-api/api/) | Bild / Video | `Adobe Firefly Image 5` · `Adobe Firefly Video` |
| <img src="web-app/public/images/model-provider/gemini.svg" alt="Google Gemini" width="24" height="24" /> [Google Gemini](https://ai.google.dev/gemini-api/docs/omni) | Bild / Video | `Gemini Omni 1.1 Flash` · `Gemini Nano Banana 2.1` |
| <img src="web-app/public/images/model-provider/krea.png" alt="Krea" width="24" height="24" /> [Krea](https://www.krea.ai/docs/developers/krea-3/overview.md) | Bild | `Krea 3` |
| <img src="web-app/public/images/model-provider/leonardo.png" alt="Leonardo.Ai" width="24" height="24" /> [Leonardo.Ai](https://docs.leonardo.ai/docs/lucid-origin) | Bild | `Lucid Origin` · `Krea 2 Turbo · Leonardo` · `Ideogram 3 · Leonardo` |
| <img src="web-app/public/images/model-provider/vidu.png" alt="Vidu" width="24" height="24" /> [Vidu](https://platform.vidu.com/docs/api-reference/video-models/vidu-q4-preview/image-to-video) | Video | `Vidu Q4 Preview` · `Vidu Q3 Pro` · `Vidu Q3 Turbo` |
| <img src="web-app/public/images/model-provider/openai.svg" alt="OpenAI" width="24" height="24" /> [OpenAI](https://developers.openai.com/api/docs/guides/image-generation) | Bild | `GPT Image 2.5 Sunburst` · `GPT Image 2.5 Flare` |
| <img src="web-app/public/images/model-provider/xai.svg" alt="xAI" width="24" height="24" /> [xAI](https://docs.x.ai/developers/model-capabilities/imagine) | Bild / Video | `Grok Imagine Image 2.0` · `Grok Imagine Video 1.5` · `Grok Imagine Video 1.5 Lite` |
| <img src="web-app/public/images/model-provider/bfl.png" alt="Black Forest Labs" width="24" height="24" /> [Black Forest Labs](https://docs.bfl.ai/quick_start/generating_images) | Bild | `FLUX.2 [max]` · `FLUX.2 [pro]` · `FLUX.2 [klein] 9B` |
| <img src="web-app/public/images/model-provider/recraft.png" alt="Recraft" width="24" height="24" /> [Recraft](https://www.recraft.ai/docs/api-reference/agents.md) | Bild | `Recraft V4.1` · `Recraft V4.1 Flash` · `Recraft V4.1 Pro` |
| <img src="web-app/public/images/model-provider/ideogram.png" alt="Ideogram" width="24" height="24" /> [Ideogram](https://developer.ideogram.ai/ideogram-api/api-overview) | Bild | `Ideogram 4.5` |
| <img src="web-app/public/images/model-provider/runway.png" alt="Runway" width="24" height="24" /> [Runway](https://docs.dev.runwayml.com/api/) | Video | `Runway Gen-4.5` |
| <img src="web-app/public/images/model-provider/luma.png" alt="Luma" width="24" height="24" /> [Luma](https://docs.agents.lumalabs.ai/guides/model/) | Bild / Video | `Luma Uni-1 Max` · `Luma Uni-1` · `Luma Ray 3.2` |
| <img src="web-app/public/images/model-provider/ltx.png" alt="LTX (Lightricks)" width="24" height="24" /> [LTX (Lightricks)](https://docs.ltx.io/models) | Video | `LTX-2.5 Pro` · `LTX-2.5 Fast` |
| <img src="web-app/public/images/model-provider/minimax.svg" alt="MiniMax" width="24" height="24" /> [MiniMax](https://platform.minimax.io/docs/api-reference/video-generation-v2-create) | Bild / Video | `MiniMax H3 Max` · `MiniMax H3` · `MiniMax H3 Highspeed` · `MiniMax Image-01` |
| <img src="web-app/public/images/model-provider/pixverse.png" alt="PixVerse" width="24" height="24" /> [PixVerse](https://docs.platform.pixverse.ai/changelog-2394996m0) | Video | `PixVerse V6 Max` · `PixVerse V6` |

<details>
<summary><strong>Auswahllisten für Text- und Visionsmodelle nach Anbieter anzeigen</strong></summary>

| Anbieter | In der Quelle angebotene Modell-IDs |
| --- | --- |
| [OpenAI](https://platform.openai.com/docs/models) | `gpt-6.1-sol` · `gpt-6-astra` · `gpt-6-luna` · `gpt-6-sol` |
| [Microsoft Azure](https://oai.azure.com/deployments) | Kontospezifische Bereitstellung oder Gateway |
| [Anthropic](https://platform.claude.com/docs/en/models/overview) | `claude-sonnet-5-5` · `claude-opus-5-5` · `claude-fable-5-1` · `claude-haiku-5-5` |
| [OpenRouter](https://openrouter.ai/models) | `moonshotai/kimi-k3.1-pro` · `minimax/minimax-m3.1-flash` · `deepseek/deepseek-v4.1-flash-1017` · `nvidia/nemotron-3.5-super-vl:free` |
| [Mistral](https://docs.mistral.ai/models) | `mistral-large-4` · `mistral-medium-3-5` · `mistral-small-2603` · `ministral-3b-2512` |
| [Groq](https://console.groq.com/docs/models) | `openai/gpt-oss-120b` · `openai/gpt-oss-20b` · `llama-3.3-70b-versatile` · `llama-3.1-8b-instant` |
| [xAI](https://docs.x.ai/developers/models) | `grok-4.7` |
| [Google Gemini](https://ai.google.dev/gemini-api/docs/models) | `gemini-4-argon` · `gemini-3.8-flash` · `gemini-3.6-flash` · `gemini-3.5-flash-lite` |
| [MiniMax](https://platform.minimax.io/docs/api-reference/text-openai-api) | `MiniMax-M3.1-Flash` · `MiniMax-M3` |
| [Hugging Face](https://huggingface.co/models?pipeline_tag=text-generation&inference_provider=all) | `deepseek-ai/DeepSeek-V4.1-Flash-1017` · `Qwen/Qwen3.8-27B` · `moonshotai/Kimi-K3` · `zai-org/GLM-5.3` |
| [NVIDIA NIM](https://build.nvidia.com/models) | `minimaxai/minimax-m3.1-flash` · `deepseek-ai/deepseek-v4.1-flash` · `nvidia/nemotron-3.5-super-vl-120b-a12b` · `nvidia/nemotron-3.5-lightning-30b-a3b` · `z-ai/glm-5.3` |
| [DeepSeek](https://api-docs.deepseek.com/) | `deepseek-flash` · `deepseek-v4-pro` |
| [Kimi · Moonshot AI](https://platform.kimi.ai/docs/models) | `kimi-k3.1-pro` · `kimi-k3.1-pro-highspeed` · `kimi-k3` |
| [Alibaba Cloud · Qwen](https://www.alibabacloud.com/help/en/model-studio/models) | `qwen3.8-max` · `qwen3.7-plus` · `qwen3.8-flash` |
| [Cerebras](https://inference-docs.cerebras.ai/models/overview) | `qwen-3.8-27b` · `gpt-oss-120b` |
| [Together AI](https://docs.together.ai/docs/serverless/models) | `deepseek-ai/DeepSeek-V4.1-Flash-1017` · `moonshotai/Kimi-K3` · `Qwen/Qwen3.8-Flash` · `Qwen/Qwen3.8-2.4T-A95B` |
| [Fireworks AI](https://docs.fireworks.ai/getting-started/models) | `accounts/fireworks/models/deepseek-v4p1-flash-1017` · `accounts/fireworks/models/kimi-k3` · `accounts/fireworks/models/minimax-m3` |
| [Perplexity](https://docs.perplexity.ai/docs/agent-api/models) | `perplexity/sonar` · `openai/gpt-6.1-sol` · `google/gemini-4-argon` · `perplexity/kimi-k3` |
| [Meta AI](https://dev.meta.ai/docs/models) | `muse-wonder-1.0` · `muse-spark-1.3` |
| [Cohere](https://docs.cohere.com/docs/models) | `command-a-plus-05-2026` |
| [Z.ai](https://docs.z.ai/guides/llm/glm-5.3) | `glm-5.3` · `glm-5.3-flash` · `glm-5.3-flashx` |
| [AI21 Labs](https://docs.ai21.com/docs/jamba-foundation-models) | `jamba-large` · `jamba-mini-2` |
| [BytePlus · ByteDance](https://docs.byteplus.com/en/docs/modelark/model-parameter-support) | `dola-seed-2-1-turbo-260628` |
| [Baidu Qianfan](https://cloud.baidu.com/doc/qianfan/s/rmh4stp0j) | `ernie-5.1` |
| [Tencent TokenHub](https://cloud.tencent.com/document/product/1823/130078) | `hy4-preview` |
| [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-chat-completions.html) | `openai.gpt-6.1-sol` |
| [IBM watsonx](https://www.ibm.com/docs/en/watsonx/saas?topic=preview-inferencing-gateway-models) | Kontospezifische Bereitstellung oder Gateway |

</details>

Inventar anhand der Quelle überprüft am **29 Oktober 2026**. Diese Namen beschreiben Novera-Voreinstellungen und nicht den garantierten Zugriff für jedes Konto. Remote-Kataloge, Regionen, Lizenzen, Kontingente und Abrechnung bleiben anbieterspezifisch. Kompatible Profile können ihre Kataloge aktualisieren; Azure und einige Gateways verwenden Kontobereitstellungen. Cloud-Verträge beinhalten simulierte Tests; Für dieses Showcase-Update wurde keine kostenpflichtige Generierung durchgeführt.

[Medienkatalog](web-app/src/constants/mediaProviders.ts) · [Text-/Visionsmodelle](web-app/src/constants/cloudModels.ts) · [Cloud-Setup](docs/USER_GUIDE.md#cloud) · [Herkunft des Symbols](docs/DEVELOPMENT.md#logos)

<a id="hub-and-compatible-models"></a>

## Hub und kompatible Modelle

**GGUF, Standard und quantisiert Safetensors, ONNX und MLX**: Erkunden Sie Modelle nach Aufgabe und wählen Sie Varianten aus, die mit der Engine und Ihrer Hardware kompatibel sind.

| Familie | Unterstützung in der Quelle | Anforderungen |
| --- | --- | --- |
| **GGUF** | Textgenerierung über llama.cpp; Bild- und Videokomponenten für unterstützte Profile. | Architektur, die von der mitgelieferten Engine erkannt wird. |
| **Split GGUF** | Eine Variante pro kompletter Serie, summierte Größe, Download aller Shards und Überprüfung der Größe/SHA-256/Header. | Standardnummerierte Dateinamen; Das Herunterladen von 500 GB bedeutet nicht, dass das Modell zu diesem PC. passt |
| **Standard Safetensors** | Vollständige Modellordner über Transformers; kausale Textgenerierung auf CPU oder NVIDIA CUDA. | Konfiguration, Tokenizer und alle erforderlichen Shards. |
| **ONNX Runtime** | Lokaler Import von numerischen/boolschen Diagrammen und vorbereitete GenAI-Textexporte. | Validierter vollständiger Ordner; aufgabenspezifische Vor-/Nachbearbeitung erforderlich; [Einrichtung und Grenzen](onnx-server/README.md). |
| **LoRA / PEFT-Adapter** | Importieren Sie eine komplette Basis mit ihrem separaten lokalen Adapter im Safetensors-Provider. | Unquantisierte kausale Transformers-Basis, übereinstimmende Identität, Tensorprüfungen und kumulative Speicherschätzung; [Einrichtung und Grenzen](transformers-server/README.md#local-lora--peft-adapters). |
| **FP8 LLM / ModelOpt** | Native CUDA-Ausführung für kompatible dichte Llama/Qwen2/Qwen3-FP8-Exporte pro Tensor. | Architektur-/Tensorprüfungen und echte Kernel-Prüfung; [Einrichtung und Grenzen](transformers-server/README.md#modelopt-fp8-and-nvfp4-llms). |
| **NVFP4 LLM / ModelOpt** | Gepackte Block-16 FP4-Projektionen durch native CUDA-GEMMs; getrennt vom Bild NVFP4. | Kompatibel Blackwell GPU, unterstützte Dimensionen/Export und tatsächliche Kernel-Sonde; Ungeschulte Vorrichtungen getestet auf RTX 5070. |
| **AWQ** | 4-Bit-GEMM-Checkpoints ohne zusammengeführte Operationen. | NVIDIA CUDA und optionale GPTQModel/Transformers-Lader. |
| **GPTQ** | 2/3/4/8-Bit-Konfigurationen, gptq/gptq_v2-Formate. | NVIDIA CUDA, GPTQModel und Optimum; echte Ausführung getestet bei 4 Bits. |
| **bitsandbytes** | 4-Bit NF4/FP4 oder 8-Bit INT8. | NVIDIA CUDA und optionale Abhängigkeiten; echte NF4- und INT8-Tests. |
| **EXL3** | Vollständige quantisierte Safetensors-Ordner über ExLlamaV3; tatsächliche CUDA-Generierung getestet. | NVIDIA GPU, separate Python 3.12-Umgebung und kompatible Architektur; kein CPU-Fallback. |
| **EXL2** | Eigener ExLlamaV2-Lader; Streaming, Abbruch und Entladen des Modells auf der GPU getestet. | Explizite CUDA-Attention für die getestete Softwareumgebung; vollständiger Checkpoint und freier VRAM erforderlich. |
| **MLX** | Kompatible Modelle auf Apple Silicon. | MLX-Engine und unterstützte Plattform. |

Der Hub steckt jetzt fest **LFM3-1.7B** als LiquidAI-Empfehlung für kompatible Konfigurationen mit den Varianten Q4_K_M, Q6_K und Q8_0. Das Erstausführungsmodell bleibt das in der oben aufgeführten geführten Konfiguration aufgeführte Modell.

Download-Gewichte filtern von **unter 1 GB bis 500 GB und höher**und dann nach Hardware-Passform, Größe, Aktualität oder Downloads sortieren. Die Ergebnisse werden nach und nach geladen; Filter gelten für abgerufene Modelle und deren Standardvariante. Die Speicherempfehlung verwendet verfügbare RAM/VRAM-, Kontext- und Begleitkomponenten, ohne den gemeinsam genutzten GPU-Speicher doppelt zu zählen.

AWQ 4-bit, GPTQ 4-bit, NF4 und INT8 generierten jeweils Text auf einem RTX 5070 Laptop unter Verwendung winziger, nicht trainierter Modelle, die offline erstellt wurden. Dies validiert das Laden und die Ausführung, nicht die Qualität oder Leistung jedes Modells. **Diese Ergänzungen befinden sich in der Quelle: Neuaufbau und kompatible Abhängigkeiten sind erforderlich; Dieses README-Update aktualisiert keine installierte Binärdatei.**

**Gemessen am RTX 5070 Laptop:** Qwen2.5-0.5B-Instruct, Kontext 2,048, Eingabeaufforderung 272-Token, 128 generierte Token, fünf aufgewärmte Läufe: mittlere Dekodierung **GGUF Q4_K_M 402.7 Token/s · EXL3 4 bpw 312.5 · EXL2 4 bpw 146.9**. Hier wurde kein Geschwindigkeitsvorteil gegenüber GGUF nachgewiesen. Quantisierung und Kalibrierung unterscheiden sich, und EXL3 bestand eine einfache Rechenprüfung nicht. Die Ergebnisse sind keine allgemeine Rangliste für Geschwindigkeit oder Qualität. [Vollständige Messungen und Grenzwerte](deliverables/exllama-2026-10-30/validation.md).

**TabbyAPI** ist eine optionale, separat verwaltete OpenAI-kompatible Serververbindung, die standardmäßig deaktiviert ist. Die Erkennung und das Streaming des authentifizierten EXL3-Modells wurden getestet. Die verwaltete lokale ExLlama-Route bleibt eindeutig. [ExLlama-Setup und TabbyAPI-Verbindung](transformers-server/README.md#exl3-first-exl2-second--nvidia-execution).

Die standardmäßige, an die Hardware angepasste Sortierung bevorzugt neuere Versionen innerhalb derselben Kompatibilität und verfügbaren Speicherstufe. Installierte Modelle werden nicht automatisch ersetzt.

[Quantisiertes Safetensors-Setup](transformers-server/README.md#quantized-safetensors--source-integration-29-october-2026) · [Formate, Prioritäten und Validierung](docs/SUIVI_MOTEURS.md)

Die aktualisierten Quellen fügen hinzu **optionale verwaltete Komponenten in Konfigurationen für Windows x64**: private Python-Umgebungen, angeheftete CPU/CUDA-Profile, Schätzungen und Bestätigung vor Downloads, Überprüfung, Reparatur und Entfernung. Benutzerdefinierte Interpreterpfade bleiben unter den erweiterten Optionen. Native GGUF-Engines behalten ihre vorhandenen Komponenten; Mobile und Cloud laden Desktop Python/PyTorch nicht herunter. Drei private CPU/Export-Profile wurden mit echten Kunststoffgeräten geübt; Der Betreuer meldet erfolgreiche Desktop-Nutzung auf 1 November 2026; GPU-Profile und die Clean-PC-Installation erfordern noch eine separate, detaillierte Validierung. [Profile und Testgrenzen](docs/REPRISE_COMPOSANTS_GERES_80_LANGUES.md). Das Einbetten des Stacks in EXE wird verschoben.

## Sprachen und Varianten der 80-Schnittstelle

**Alle 80-Kataloge decken die aktuellen englischen 2,429-Schlüssel ab** in allen 15-Namespaces, einschließlich Menüs, Konfigurationen, Einstellungen, Hilfe und Mediensteuerelementen. Pluralformen und Schnittstellenrichtung richten sich nach der ausgewählten Sprache. Antwort- und Sprachsprachen sind modellabhängig.

Diese technische Abdeckung bescheinigt keine sprachliche Qualität: **Native Überprüfung und regionale Anpassung bleiben notwendig**. Siehe native Bezeichnungen und bekannte Grenzwerte im [Sprachführer](docs/LANGUAGES.md) Und [Prüfbericht](deliverables/interface-audit-2026-10-29/RAPPORT.md).

## Wir helfen Menschen in allen Bereichen

Über Schule und Bildung hinaus ist es unser Ziel, Menschen weltweit beim Lernen, beim Lösen von Problemen sowie bei der Erstellung und Entwicklung nützlicher Projekte zu helfen. Ziel von Novera ist es, die aktuellen Fortschritte von AI verständlicher und benutzerfreundlicher zu machen, unabhängig von Sprachen, Erfahrungsniveaus und verfügbarer Hardware.

| Sektoren, deren Entwicklung wir unterstützen möchten | Beispiele für nützliche Beiträge |
| --- | --- |
| Schulen, Bildung und lebenslanges Lernen | Erklären Sie Konzepte, passen Sie Lernmaterialien an und unterstützen Sie Lehrer, Schüler und Familien. |
| Forschung, Wissenschaft und Weltraum | Entdecken Sie Literatur, erklären Sie Methoden, analysieren Sie Daten und teilen Sie Wissen. |
| Gesundheit, Pflege und soziale Unterstützung | Machen Sie Informationen leichter verständlich und unterstützen Sie Recherche und professionelle Arbeitsabläufe. |
| Landwirtschaft, Ernährung und ländliche Gemeinden | Teilen Sie praktisches Wissen, unterstützen Sie die Planung und entwickeln Sie lokal nützliche Tools. |
| Umwelt, Klima, Wasser und Artenvielfalt | Erklären Sie Beweise, unterstützen Sie Beobachtungen und helfen Sie Gemeinden bei der Planung von Projekten. |
| Energie, Industrie, Bau und Handwerk | Unterstützung bei Dokumentation, Design, Wartung, technischem Lernen und Prozessverbesserung. |
| Unternehmen, Handel, Finanzen und Beschäftigung | Helfen Sie dabei, die Arbeit zu organisieren, Informationen zu verstehen, Projekte zu entwickeln und berufliche Fähigkeiten zu erlernen. |
| Öffentliche Dienste, Recht und Bürgerbeteiligung | Machen Sie Dokumente und Verfahren leichter verständlich und Informationen leichter zugänglich. |
| Informatik, Cybersicherheit, Robotik und Telekommunikation | Helfen Sie bei der Entwicklung von Software, verstehen Sie Systeme und entwickeln Sie nützliche Tools. |
| Kunst, Kultur, Medien, Sprachen und Erbe | Unterstützen Sie das Schreiben, Übersetzen, Bilder, Videos, kreative Projekte und den kulturellen Austausch. |
| Transport, Logistik, Tourismus, Sport und Gemeinschaftsleben | Hilfe bei Planung, Kommunikation, Lernen und lokalen Initiativen. |
| Barrierefreiheit, humanitäre Arbeit und Alltag | Reduzieren Sie Sprach- und Wissensbarrieren und unterstützen Sie Menschen mit praktischen Hilfen. |

Hierbei handelt es sich um Anweisungen für Beiträge und Entwicklung, nicht um den Anspruch, dass jede branchenspezifische Anwendung bereits bereitgestellt oder validiert wurde. Wir wollen eine einfache Anleitung für den täglichen Gebrauch, klare erweiterte Optionen bei Bedarf, transparente Hardware- und Cloud-Anforderungen und eine Zusammenarbeit mit Menschen, die sich in jedem Bereich und lokalen Kontext auskennen.

## Projektstatus

**Novera 1.0.0 ist für Windows, Linux, macOS und Android verfügbar.** Der Screenshot zeigt eine vom Betreuer lokal kompilierte Windows-Anwendung. Quelländerungen, gezielte Tests und Hardwarevalidierung werden separat dokumentiert; Dadurch wird nicht jedes Modell, jede Plattform oder jedes Cloud-Konto validiert.

Manuelle GitHub Actions-Builds sind für alle elf Distributionsvarianten aktiviert. Folgen Sie dem [Build-Ergebnisse und verifizierte Kandidaten-Downloads](docs/CI_DISTRIBUTIONS.md); Die Verfügbarkeit wird für jede Plattform separat erfasst. Kandidaten unterscheiden sich von unterzeichneten Produktionsfreigaben. Die Verteilungsanforderungen sind im beschrieben [offizielle Veröffentlichungsrichtlinie](OFFICIAL_RELEASES.md) Und [Veröffentlichungsseite](https://github.com/TRON-ABS/Novera/releases). Vorhandene Kandidaten mit deaktiviertem Updater bleiben intern. Für öffentliche Veröffentlichungen ist ein konfigurierter und verifizierter Update-Mechanismus erforderlich. [Desktop-Signaturprüfungen und verbleibende Startanforderungen werden dokumentiert](docs/LAUNCH_STATUS.md).

## Dokumentation und Beiträge

- [Detaillierte Bedienungsanleitung](docs/USER_GUIDE.md), [Goldene Regeln für Produkt- und Benutzerinformationen (Französisch)](docs/REGLES_D_OR.md), [Modelle und Motoren](docs/SUIVI_MOTEURS.md).
- [Entwicklung](docs/DEVELOPMENT.md), [Build- und Release-Anleitung](docs/BUILD_AND_RELEASE.md), [zukünftige Versionen und Update-Vorbereitung](docs/FUTURES_VERSIONS.md).
- [Projekt-Dashboard](TABLEAU_DE_BORD_NOVERA.md), [Roadmap](ROADMAP.md), [Änderungsprotokoll](docs/CHANGELOG.md).
- [Mitwirken](CONTRIBUTING.md): Code, Tests, native Überprüfung in allen 80-Sprachen und echtes Workflow-Feedback.

## Identität und Lizenz

Novera wird verwaltet von **TRON-ABS** Zoll [dieses Repository](https://github.com/TRON-ABS/Novera). Siehe die [Identitätsrichtlinie](BRANDING.md) Und [offizielle Veröffentlichungsrichtlinie](OFFICIAL_RELEASES.md).

Novera baut auf auf [Jan](https://github.com/janhq/jan), erstellt von Menlo Research und seinen Mitwirkenden. Original- und Quellennachweise Dritter sowie die [Apache 2.0-Lizenz](LICENSE) bleiben erhalten. Jan-Downloads sind keine Novera-Versionen.

## Unterstützt Novera

Als unabhängiger Forscher weiß ich, wie ein Mangel an Finanzmitteln es schwierig machen kann, Forschung zu betreiben.

Wenn Sie Teil des Novera-Abenteuers sein möchten, können Sie meine Forschung und die Entwicklung des Projekts mit einem freiwilligen Bitcoin-Beitrag unterstützen.

Vielen Dank an alle für Ihre Unterstützung, Beiträge, Ihr Feedback und Ihre Ermutigung. In diesem Abenteuer zählt jede Geste!

**Bitcoin (BTC) – Bitcoin-Netzwerk**

Empfangsadresse: `17TXpB1aBj5DxjwEfM3K44zyqhixRzY78i`

Um einen Beitrag zu leisten, scannen Sie diesen QR-Code mit Ihrer Brieftasche oder kopieren Sie die oben stehende Adresse. Auswählen **Bitcoin (BTC), im Bitcoin-Netzwerk**und wählen Sie dann den gewünschten Betrag aus.

<img src=".github/assets/novera-bitcoin-support.png" alt="QR-Code der Bitcoin-Adresse zur Unterstützung von Novera" width="240" />

---

<div align="center">
  <p>An alle, die ihre Reise mit Novera beginnen: Möge Ihre Neugier neue Türen öffnen, Ihre Ideen zum Leben erwecken und jede Kreation Sie ein Stück weiterbringen.</p>
  <p><strong>TRON-ABS</strong></p>
  <p>Herr Sachet Jean-Marc – Unabhängiger Forscher – Frankreich</p>
  <p><em>Die Kunst des Menschen mit AI</em></p>
  <p>Vielen Dank an alle, die zu einer besseren Welt beitragen. Durch ihre Entdeckungen, ihre Arbeit, ihre gegenseitige Unterstützung und das Wissen, das sie weitergeben, haben sie uns dabei geholfen, dorthin zu gelangen, wo wir heute sind.</p>
  <p>Wir wünschen ihnen alles Gute für die Zukunft, zusammen mit allen, die diesen Geist des Teilens und der Unterstützung anderer in sich tragen.</p>
</div>

<div align="center"><sub>Entwicklungstool: 🧠 Codex – GPT-6.1 Sol</sub></div>
