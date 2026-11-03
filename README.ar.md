<div dir="rtl" lang="ar">

<p align="center"><a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.de.md">Deutsch</a> · <a href="README.it.md">Italiano</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ar.md">العربية</a></p>

<div align="center">
  <img src=".github/assets/novera-banner-en.png" alt="Novera — المعرفة للجميع" width="100%" />
  <p><strong>أنت تصف ما تحتاجه، وNovera يتولى التحضير والتنفيذ والتنظيم.</strong></p>
  <p>مساعد ذكاء اصطناعي مستقل من TRON-ABS، من التشغيل الأول إلى النتائج: نصوص وصور وموسيقى وفيديو في محادثة واحدة.</p>
  <p><strong>متوفر لـ Windows وLinux وmacOS وAndroid</strong> · 80 لغة للواجهة · 42 مزودًا سحابيًا · 49 إعدادًا مسبقًا للوسائط · Apache 2.0</p>
  <p><a href="#from-first-launch-to-results">الأتمتة</a> · <a href="#one-dashboard-for-every-creation">لوحة الإنشاء</a> · <a href="#local-models-in-use">النماذج المحلية</a> · <a href="#hub-and-compatible-models">التنسيقات وHub</a> · <a href="#cloud-providers">الخدمات السحابية</a> · <a href="CONTRIBUTING.md">المساهمة</a></p>
  <p>التواصل الرسمي: <a href="mailto:contact.novera.tronabs@gmail.com" dir="ltr">contact.novera.tronabs@gmail.com</a></p>
  <p>الملفات الشخصية الاجتماعية الرسمية لـ Novera: <a href="https://www.facebook.com/profile.php?id=61596114515071">Facebook</a> · <a href="https://www.instagram.com/noveratronabs/">Instagram</a> · <a href="https://www.tiktok.com/@tronabs0">TikTok</a> · <a href="https://www.youtube.com/@noveratronabs">YouTube</a> · <a href="https://x.com/noveratronabs">X</a> · <a href="https://bsky.app/profile/noveratronabs.bsky.social">Bluesky</a></p>
  <p>شارك إبداعاتك ونماذجك وإعداداتك وأسئلتك وتعليقاتك وأفكارك.</p>
</div>

> ترجمة بمساعدة أدوات الترجمة لملف README الإنجليزي المؤرخ في 3 نوفمبر 2026. نرحب بمراجعة الناطقين بالعربية. تحتفظ المستندات المرتبطة بلغتها الأصلية.

---

## التوفر — 3 نوفمبر 2026

**Novera 1.0.0 متاح لـ Windows وLinux وmacOS وAndroid.** [Windows x64 / Linux x64](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0) · [Windows ARM64](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-windows-arm64). حزم سطح المكتب وأرشيفات CLI والتوقيعات وبيانات التحديث عامة وتم التحقق منها.

| منصة | توفر |
| --- | --- |
| Windows x64 | مثبت NSIS العام، المحدث الموقع؛ تم التحقق من التثبيت الأصلي والاستبدال. |
| Linux x64 | AppImage العام، المحدث الموقع؛ تم التحقق من التثبيت الأصلي والاستبدال. |
| Windows x64 / Linux x64 CLI | [Novera CLI](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-cli-novera): `novera.exe` / `novera`‎مع قناة مخصصة للتحديث الموقع. |
| Windows ARM64 | [مثبت NSIS عام](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-windows-arm64)، محرك النص الأصلي CPU؛ تم التحقق من التثبيت والاستبدال وفحوصات القناة العامة. |
| Android ARM64 | [توقيع عام APK 1.0.0](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-android-1000012)، Android 7+، الدفعة الافتراضية 512. يؤكد المشرف أن الإصدار 1000012 يعمل على هواتفه. حزمة نظيفة بدون محادثات أو نماذج أو مفاتيح API الشخصية. [الأدلة والقيود](docs/RELEASE_ANDROID_1.0.0.md). |
| macOS Intel / Apple Silicon | [الإصدار الرسمي لـ 1.0.0 DMG](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-macos), macOS 13+ إنتل / 14+ Apple Silicon; التحديثات الموقعة Novera. غير موثق من شركة Apple؛ تم تمرير الاختبارات الآلية بشكل منفصل على كلا المعماريتين، وتم تأجيل الاختبارات المرئية. [التثبيت والأدلة](docs/RELEASE_MACOS_1.0.0.md). |
| iOS | بناء جهاز محاكاة داخلي؛ مطلوب توقيع/توفير Apple قبل تثبيت iPhone. [متابعة](docs/REPRISE_MACOS_IOS.md). |
| Windows x64 محمول | [أرشيف ZIP الموقّع](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-windows-portable); تبقى البيانات في Data، وتم التحقق من استبدال Program. |
| ويب، MSI، ديبيان | يظل عميل الويب المستضاف والتنسيقات الأخرى داخلية؛ موقع عرض الصفحات متاح. |

على جهاز Mac، افتح DMG وانسخ Novera إلى التطبيقات. إذا تم حظر الإطلاق الأول، فاسمح بدخول Novera **إعدادات النظام ← الخصوصية والأمان ← فتح على أي حال**. [تعليمات أبل](https://support.apple.com/guide/mac-help/mh40616/mac).

توقيعات المحدث ليست Windows Authenticode أو توثيق Apple. يتم تمرير عمليات التحقق اليدوية من الإصدار الحالي عبر القناة العامة؛ يظل الانتقال بين نسختين عامتين بمثابة اختبار للإصدار التالي. [الأدلة والقيود](docs/LAUNCH_STATUS.md).

على Android، يُنصح بهاتف حديث بذاكرة كافية للنماذج المحلية؛ استخدم مزود API على الأجهزة الأقل قدرة. للبحث على الويب، يُنصح في جميع الإصدارات بسياق لا يقل عن **16K رمزًا (16,384)**.

**Windows x64 1.0.0 المحمول متوفر.** تبقى المناقشات والإعدادات والنماذج التي تم تنزيلها داخل المجلد المحمول الموجود أسفل `Data`. قم باستخراج الأرشيف الكامل وابدأ `Novera.exe`. أغلق Novera قبل نقل المجلد أو إخراج وحدة تخزين USB. [دليل المحمولة والقيود](docs/WINDOWS_PORTABLE.md).

<a id="one-dashboard-for-every-creation"></a>

## لوحة تحكم واحدة لكل إبداع

Novera ينمو معك. يمكن أن تساعد الأمثلة والإعدادات الخاصة بك المستخدمين الآخرين في العثور على الإعداد المناسب. تبادل الأسئلة والقضايا والأفكار على موقعنا [Facebook page](https://www.facebook.com/profile.php?id=61596114515071) أو بواسطة [البريد الإلكتروني](mailto:contact.novera.tronabs@gmail.com). إذا أمكن، قم بتضمين إصدار Novera والجهاز والطراز المحلي/API. قم بإزالة المعلومات الشخصية وعدم مشاركة مفاتيح أو كلمات مرور API مطلقًا.

![صورة تم إنشاؤها بواسطة Novera ولوحة معلومات موحدة مع الكمية والبذرة والترقية والذاكرة التلقائية](.github/assets/novera-dashboard-2026-11-01.png)

*لقطة شاشة لتطبيق Windows حقيقية مقدمة من المشرف على 1 نوفمبر 2026، الذي أفاد بأن التطبيق يعمل بشكل جيد. ويعرض المشهد الذي تم إنشاؤه وعناصر التحكم في الملفات المحفوظة ولوحة معلومات الإنشاء الموحدة؛ هذا ليس نموذج بالحجم الطبيعي.*

لوحة واحدة، خمسة أوضاع: **تلقائي، نص، صورة، موسيقى وفيديو**. تتبع عناصر التحكم الوضع المحدد: النسبة، والدقة، والمدة، والإيقاع، والجودة، والآلات، وكلمات الأغاني، والبذور، والكمية. يتكيف عرض اللوحة والأزرار مع النافذة والملصقات المترجمة.

- **1–10 أجيال متتابعة**، الإعداد الافتراضي هو 1، بكميات مستقلة للصور والموسيقى والفيديو. يؤدي الإيقاف إلى إلغاء المهمة النشطة وقائمة الانتظار المتبقية.
- **بذور عشوائية وثابتة +1 و −1**‎نسب محددة مسبقاً أو مخصصة واختيارية **Real-ESRGAN ×2/×4** الارتقاء مع عرض الأبعاد النهائية.
- يبقى النموذج المحدد والذاكرة التلقائية والمرفقات والتعليمات وبحث الويب والأدوات في نفس الشريط. تعتمد الأدوات على قدرات النموذج وإمكانية الوصول الممنوحة.

<a id="from-first-launch-to-results"></a>

## من الإطلاق الأول إلى النتائج

**تعمل الأتمتة لدينا على ربط الإعداد بسير عمل التنفيذ الكامل.** يتعامل Novera مع الخطوات الفنية المتاحة للتكوين المحدد، مع الحفاظ على إمكانية الوصول إلى عناصر التحكم المتقدمة.

| خطوة | ما يعالجه Novera |
| --- | --- |
| **1. ابدأ** | تحديد لغة النظام المدعومة عند التشغيل الأول وحفظ تفضيلاتك. يعرض نماذج البداية ومعلومات الأجهزة المفيدة. |
| **2. الاستعداد** | يوفر التثبيت الموجه النص والتضمين والصورة والموسيقى والفيديو والارتقاء. يقوم بمعاينة المكونات والأحجام والمساحة الحرة قبل موافقتك، ثم يتتبع التنزيلات مع التقدم والإيقاف المؤقت/الاستئناف والتحقق من SHA-256. |
| **3. تكوين** | تسجيل النماذج ومكوناتها وإعداد الملفات الشخصية ذات الصلة وتقارير التبعيات المطلوبة. تبدأ عمليات التضمين الاستردادية على CPU باستخدام خيار CPU/GPU المحفوظ. ملفات تعريف الموسيقى الجديدة افتراضية في وضع الآلات. |
| **4. فهم الطلب** | توجيه تلقائي لطلبات الإنشاء المعترف بها إلى نص أو صورة أو موسيقى أو فيديو. يمكنك أيضًا تحديد وضع الإخراج والنموذج المحلي أو السحابي بشكل صريح. |
| **5. تنفيذ** | الذاكرة التلقائية تنتظر العمل النشط، وتحرر النماذج غير الضرورية، وتعيد تحميل الموارد المطلوبة. يتم تشغيل سلسلة المهام 1–10 بالترتيب وتحرير الموارد قبل المهمة التالية. يستخدم موفرو السحابة الحساب والتكوين المحددين. |
| **6. استرجاعها وإعادة استخدامها** | يحفظ الوسائط في مجلدات نظام Novera، ويعرض النتائج والتوقيتات المتاحة، ثم يعرض المتغيرات أو المكتبة أو النسخ أو التصدير أو مشاركة النظام. يبقى الإرسال إلى تطبيق آخر هو عملك. |

الأتمتة تغطي المحركات وسير العمل المتكاملة؛ لا يجعل كل نموذج Hub قابلاً للتنفيذ. تحدد الأجهزة والمكونات المثبتة والوصول إلى الموفر ما يمكن تشغيله. تتبع المجلدات وتغييرات الملفات وأوامر shell منح الوصول للمحادثة.

[دليل المستخدم](docs/USER_GUIDE.md) · [المحركات والتحقق من صحتها](docs/SUIVI_MOTEURS.md) · [التطوير](docs/DEVELOPMENT.md)

في المصادر المحدثة، **تقوم التكوينات بتكييف توصياتها مع الأجهزة المحمولة والمقيدة**: LFM3-1.7B Q4، أو LFM3-Omni-2B Q4 مع جهاز العرض الخاص به عند استيفاء متطلبات الذاكرة والمحرك المبلغ عنها. يتم إخفاء أو حظر الجيل المحلي غير المتاح؛ تظل الصورة السحابية التي تم تكوينها والموسيقى والفيديو متاحة. تعمل إرشادات الواجهة على إعادة استخدام كتالوجات اللغة 80. لا تزال هذه التقديرات تتطلب اختبار الجهاز وإعادة البناء للوصول إلى التطبيقات المثبتة.

## الإمكانيات في المصدر

تعمل تشخيصات الصيانة الاختيارية الآن على التمييز بين عمليات الإنشاء والفشل التي تمت معالجتها بواسطة الأدوات بالإضافة إلى استثناءات JavaScript، مع موافقة منفصلة وحقول فنية تمت تصفيتها. يتم تكوين تنبيه عبر البريد الإلكتروني للإنتاج كل ساعة للمشرف. تتبع خرائط المصدر الخاصة وتفاصيل التنبيه [دليل الصيانة](docs/MAINTENANCE.md); يتم تأكيد استلام البريد الإلكتروني الاختباري، بينما يتم تحميل الرمز المصادق عليه واختباره في عمليات التحقق من الإصدار الثنائي التالية.

| المنطقة | المميزات |
| --- | --- |
| **النص والرؤية** | المحادثة ومرفقات المستندات والردود المتدفقة والنماذج المحلية أو السحابية. الرؤية تعتمد على النموذج؛ إن فهم الصور وتوليدها هما قدرات منفصلة. |
| **صورة** | إنشاء المحادثة والبذور والنسب والدقة ومكونات GGUF/Safetensors ومجلدات Diffusers وملف تعريف NVFP4 CUDA الأصلي المدعوم. |
| **الموسيقى** | الجيل المحلي أو السحابي، والمدة، والجودة، والآلات الموسيقية أو الغناء حيث تكون الكلمات المدعومة والمنظمة ومشغل الصوت. تختلف خيارات الموفر. |
| **فيديو** | الإنشاء المحلي أو السحابي والمدة وعدد الإطارات/الإيقاع للملفات الشخصية المحلية والنسب والدقة ومشغل الفيديو. |
| **البحث والأدوات** | بحث الويب واسترجاع المستندات المستندة إلى التضمين وMCP ومساحات العمل والأدوات المحلية وفقًا لدعم النموذج والوصول الممنوح. |
| **النتائج والمشاركة** | مكتبة الوسائط والمتغيرات وتصدير الاستجابة/المحادثة والمستندات والوسائط الأصلية والطباعة/PDF ومشاركة النظام المعتمد على النظام الأساسي. |
| **إدارة الموارد** | يتم تمكين الذاكرة التلقائية بشكل افتراضي، وإعدادات CPU/GPU للمكونات المدعومة وملفات التعريف اليدوية عندما تسمح الموارد بذلك. |

<a id="local-models-in-use"></a>

## النماذج المحلية قيد الاستخدام

تشكل هذه النماذج التكوين الموجه الحالي. يمكنك استيراد نماذج أخرى متوافقة أو تغيير ملفات التعريف.

| دور | المكونات النموذجية / المكونة |
| --- | --- |
| **نص — نموذج التشغيل لأول مرة** | **Nemotron-3.5-Bolt-E4B**‎ملف `Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf`. |
| **استرجاع المستندات** | **Qwen3-Embedding-0.6B Q8_0**, **CPU بشكل افتراضي**، مع خيار CPU/GPU المحفوظ. |
| **صورة** | **FLUX.2 Klein 4B Q4_K_M**, **Qwen3-4B Q4_K_M** التشفير والرسمى FLUX.2 VAE. |
| **الصورة — خيار الأجهزة** | **FLUX.2 Klein 4B NVFP4**، من خلال مسار CUDA الأصلي عندما يكون GPU متوافقًا مع البيئة. |
| **الموسيقى** | **ACE-Step 1.5 Turbo 2B Q4_K_M**, `acestep-5Hz-lm-1.7B-Q8_0.gguf` المخطط وبرنامج تشفير الموسيقى Qwen المخصص وVAE. |
| **فيديو** | **Wan2.1 T2V 1.3B Q4_K_M**, **UMT5-XXL Q4_K_M** التشفير و Wan 2.1 VAE. |
| **الارتقاء** | اختياري **Real-ESRGAN ×2 و ×4**, مع فحص التبعية. |

برنامج تشفير الموسيقى Qwen ونموذج الاسترجاع Qwen هما **ملفات مختلفة**‎مخزن بشكل منفصل. تظل التراخيص النموذجية مملوكة لناشريها.

[بيان النص](web-app/src/constants/text-manifest.json) · [التضمينات](web-app/src/constants/embedding-manifest.json) · [الموسيقى](web-app/src/constants/music-manifest.json) · [مكونات الصورة/الفيديو](src-tauri/src/core/creation_bundle.rs)

<a id="cloud-providers"></a>

## مقدمي الخدمات السحابية

**ملفات تعريف مزود 42** متكاملة. **ElevenLabs** الآن في واجهة العرض جنبًا إلى جنب مع مسارات الموسيقى من Stability AI وfal وReplicate.

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

### صورة وموسيقى وفيديو

**يعرض مقدمو 20 طرق التوليد**‎مع **إعدادات 49 المسبقة: صورة 25 وفيديو 20 وموسيقى 4**. طرق الموسيقى هي **ElevenMusic v2.5**, **Stable Audio 3**, **من ACE-Step إلى fal** و **من Stable Audio 2.5 إلى Replicate**.

| مقدم | المخرجات في Novera | نماذج الكتالوج |
| --- | --- | --- |
| <img src="web-app/public/images/model-provider/elevenlabs.png" alt="ElevenLabs" width="24" height="24" /> [ElevenLabs](https://elevenlabs.io/docs/api-reference/music/compose) | الموسيقى | `ElevenMusic v2.5` |
| <img src="web-app/public/images/model-provider/stability.png" alt="Stability AI" width="24" height="24" /> [Stability AI](https://docs.stability.ai/api-reference/stable-audio/text-to-audio) | صورة / موسيقى | `Stable Audio 3` · `Stable Image Ultra` · `Stable Image Core` |
| <img src="web-app/public/images/model-provider/fal.png" alt="fal" width="24" height="24" /> [fal](https://fal.ai/models/fal-ai/ace-step/api) | صورة / موسيقى / فيديو | `ACE-Step · cloud` · `Pika 2.2 · fal` · `Qwen Image 2512 · fal` · `FLUX.2 Max · fal` · `Kling 3 Pro · fal` · `Kling 3 Standard · fal` |
| <img src="web-app/public/images/model-provider/replicate.png" alt="Replicate" width="24" height="24" /> [Replicate](https://replicate.com/stability-ai/stable-audio-2.5/api/schema) | صورة / موسيقى | `Stable Audio 2.5 · Replicate` · `FLUX.2 Max · Replicate` |
| <img src="web-app/public/images/model-provider/byteplus.png" alt="BytePlus · ByteDance" width="24" height="24" /> [BytePlus · ByteDance](https://docs.byteplus.com/en/docs/ModelArk/image-generation-api) | صورة/فيديو | `Dola Seedream 5 Pro` · `Dreamina Seedance 2.5` |
| <img src="web-app/public/images/model-provider/adobe-firefly.png" alt="Adobe Firefly" width="24" height="24" /> [Adobe Firefly](https://developer.adobe.com/firefly-services/docs/firefly-api/api/) | صورة/فيديو | `Adobe Firefly Image 5` · `Adobe Firefly Video` |
| <img src="web-app/public/images/model-provider/gemini.svg" alt="Google Gemini" width="24" height="24" /> [Google Gemini](https://ai.google.dev/gemini-api/docs/omni) | صورة/فيديو | `Gemini Omni 1.1 Flash` · `Gemini Nano Banana 2.1` |
| <img src="web-app/public/images/model-provider/krea.png" alt="Krea" width="24" height="24" /> [Krea](https://www.krea.ai/docs/developers/krea-3/overview.md) | صورة | `Krea 3` |
| <img src="web-app/public/images/model-provider/leonardo.png" alt="Leonardo.Ai" width="24" height="24" /> [Leonardo.Ai](https://docs.leonardo.ai/docs/lucid-origin) | صورة | `Lucid Origin` · `Krea 2 Turbo · Leonardo` · `Ideogram 3 · Leonardo` |
| <img src="web-app/public/images/model-provider/vidu.png" alt="Vidu" width="24" height="24" /> [Vidu](https://platform.vidu.com/docs/api-reference/video-models/vidu-q4-preview/image-to-video) | فيديو | `Vidu Q4 Preview` · `Vidu Q3 Pro` · `Vidu Q3 Turbo` |
| <img src="web-app/public/images/model-provider/openai.svg" alt="OpenAI" width="24" height="24" /> [OpenAI](https://developers.openai.com/api/docs/guides/image-generation) | صورة | `GPT Image 2.5 Sunburst` · `GPT Image 2.5 Flare` |
| <img src="web-app/public/images/model-provider/xai.svg" alt="xAI" width="24" height="24" /> [xAI](https://docs.x.ai/developers/model-capabilities/imagine) | صورة/فيديو | `Grok Imagine Image 2.0` · `Grok Imagine Video 1.5` · `Grok Imagine Video 1.5 Lite` |
| <img src="web-app/public/images/model-provider/bfl.png" alt="Black Forest Labs" width="24" height="24" /> [Black Forest Labs](https://docs.bfl.ai/quick_start/generating_images) | صورة | `FLUX.2 [max]` · `FLUX.2 [pro]` · `FLUX.2 [klein] 9B` |
| <img src="web-app/public/images/model-provider/recraft.png" alt="Recraft" width="24" height="24" /> [Recraft](https://www.recraft.ai/docs/api-reference/agents.md) | صورة | `Recraft V4.1` · `Recraft V4.1 Flash` · `Recraft V4.1 Pro` |
| <img src="web-app/public/images/model-provider/ideogram.png" alt="Ideogram" width="24" height="24" /> [Ideogram](https://developer.ideogram.ai/ideogram-api/api-overview) | صورة | `Ideogram 4.5` |
| <img src="web-app/public/images/model-provider/runway.png" alt="Runway" width="24" height="24" /> [Runway](https://docs.dev.runwayml.com/api/) | فيديو | `Runway Gen-4.5` |
| <img src="web-app/public/images/model-provider/luma.png" alt="Luma" width="24" height="24" /> [Luma](https://docs.agents.lumalabs.ai/guides/model/) | صورة/فيديو | `Luma Uni-1 Max` · `Luma Uni-1` · `Luma Ray 3.2` |
| <img src="web-app/public/images/model-provider/ltx.png" alt="LTX (Lightricks)" width="24" height="24" /> [LTX (Lightricks)](https://docs.ltx.io/models) | فيديو | `LTX-2.5 Pro` · `LTX-2.5 Fast` |
| <img src="web-app/public/images/model-provider/minimax.svg" alt="MiniMax" width="24" height="24" /> [MiniMax](https://platform.minimax.io/docs/api-reference/video-generation-v2-create) | صورة/فيديو | `MiniMax H3 Max` · `MiniMax H3` · `MiniMax H3 Highspeed` · `MiniMax Image-01` |
| <img src="web-app/public/images/model-provider/pixverse.png" alt="PixVerse" width="24" height="24" /> [PixVerse](https://docs.platform.pixverse.ai/changelog-2394996m0) | فيديو | `PixVerse V6 Max` · `PixVerse V6` |

<details>
<summary><strong>عرض القوائم المختصرة لنماذج النص والرؤية حسب المزود</strong></summary>

| مقدم | معرفات النماذج موجودة في المصدر |
| --- | --- |
| [OpenAI](https://platform.openai.com/docs/models) | `gpt-6.1-sol` · `gpt-6-astra` · `gpt-6-luna` · `gpt-6-sol` |
| [Microsoft Azure](https://oai.azure.com/deployments) | النشر أو البوابة الخاصة بالحساب |
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
| [IBM watsonx](https://www.ibm.com/docs/en/watsonx/saas?topic=preview-inferencing-gateway-models) | النشر أو البوابة الخاصة بالحساب |

</details>

فحص المخزون مقابل المصدر على **29 أكتوبر 2026**. تصف هذه الأسماء الإعدادات المسبقة لـ Novera، وهي غير مضمونة الوصول لكل حساب. تظل الكتالوجات والمناطق والتراخيص والحصص والفواتير عن بعد خاصة بموفر الخدمة. يمكن لملفات التعريف المتوافقة تحديث كتالوجاتها؛ يستخدم Azure وبعض البوابات عمليات نشر الحساب. تحتوي العقود السحابية على اختبارات محاكاة؛ لم يتم إجراء أي توليد مدفوع لتحديث العرض هذا.

[كتالوج الوسائط](web-app/src/constants/mediaProviders.ts) · [نماذج النص/الرؤية](web-app/src/constants/cloudModels.ts) · [إعداد السحابة](docs/USER_GUIDE.md#cloud) · [مصدر الأيقونة](docs/DEVELOPMENT.md#logos)

<a id="hub-and-compatible-models"></a>

## المحور والموديلات المتوافقة

**GGUF، القياسية والمكممة Safetensors، ONNX، وMLX**: استكشف النماذج حسب المهمة واختر المتغيرات المتوافقة مع المحرك والأجهزة الخاصة بك.

| العائلة | الدعم في المصدر | المتطلبات |
| --- | --- | --- |
| **GGUF** | توليد النصوص عبر llama.cpp؛ ومكونات الصور والفيديو لملفات الإعداد المدعومة. | الهندسة المعمارية التي تم التعرف عليها بواسطة المحرك المجمع. |
| **سبليت GGUF** | متغير واحد لكل سلسلة كاملة، الحجم المجمع، تنزيل جميع الأجزاء والتحقق من الحجم/SHA-256/الرأس. | أسماء الملفات المرقمة القياسية؛ تنزيل 500 GB لا يعني أن الطراز يناسب PC. |
| **معيار Safetensors** | مجلدات نماذج كاملة عبر Transformers، مع توليد نصوص ذاتي الانحدار على CPU أو NVIDIA CUDA. | التكوين والرمز المميز وكل جزء مطلوب. |
| **ONNX Runtime** | استيراد محلي للرسوم البيانية الرقمية/المنطقية وتصدير النصوص GenAI المعدة. | مجلد كامل تم التحقق منه؛ مطلوب المعالجة المسبقة/المعالجة اللاحقة الخاصة بالمهمة؛ [الإعداد والحدود](onnx-server/README.md). |
| **محولات LoRA / PEFT** | قم باستيراد قاعدة كاملة بمحولها المحلي المنفصل في مزود Safetensors. | قاعدة Transformers السببية غير الكمية، والهوية المطابقة، وفحوصات الموتر وتقدير الذاكرة التراكمية؛ [الإعداد والحدود](transformers-server/README.md#local-lora--peft-adapters). |
| **FP8 LLM / ModelOpt** | تنفيذ CUDA الأصلي لصادرات Llama/Qwen2/Qwen3 الكثيفة المتوافقة لكل موتر FP8. | فحص البنية/الموتر ومسبار النواة الحقيقي؛ [الإعداد والحدود](transformers-server/README.md#modelopt-fp8-and-nvfp4-llms). |
| **NVFP4 LLM / ModelOpt** | كتلة معبأة-16 إسقاطات FP4 من خلال CUDA GEMMs الأصلية؛ منفصل عن الصورة NVFP4. | متوافق مع Blackwell GPU، الأبعاد المدعومة/التصدير ومسبار النواة الفعلي؛ تم اختبار التركيبات غير المدربة على RTX 5070. |
| **AWQ** | نقاط تحقق GEMM بدقة 4 بت دون دمج العمليات. | NVIDIA CUDA والرافعات الاختيارية GPTQModel/Transformers. |
| **GPTQ** | تكوينات 2/3/4/8 بت، وتنسيقات gptq/gptq_v2. | NVIDIA CUDA، GPTQModel وOptimum؛ تم اختبار التنفيذ الحقيقي على وحدات بت 4. |
| **bitsandbytes** | 4-بت NF4/FP4 أو 8-بت INT8. | NVIDIA CUDA والتبعيات الاختيارية؛ اختبارات NF4 و INT8 الحقيقية. |
| **EXL3** | مجلدات Safetensors مكممة كاملة عبر ExLlamaV3؛ اختُبر التوليد الفعلي باستخدام CUDA. | NVIDIA GPU، بيئة Python 3.12 منفصلة وبنية متوافقة؛ لا يوجد احتياطي CPU. |
| **EXL2** | محمّل ExLlamaV2 مخصص؛ اختُبر البث والإلغاء وتفريغ النموذج من الذاكرة على GPU. | استخدام آلية الانتباه CUDA صراحةً في البيئة المختبرة؛ يلزم ملف نموذج كامل وذاكرة VRAM متاحة. |
| **MLX** | الموديلات المتوافقة على Apple Silicon. | محرك MLX والمنصة المدعومة. |

يتم تثبيت المحور الآن **LFM3-1.7B** كتوصية LiquidAI للتكوينات المتوافقة، مع متغيرات Q4_K_M وQ6_K وQ8_0. يظل نموذج التشغيل الأول هو النموذج المدرج في التكوين الموجه أعلاه.

تصفية تنزيل الأوزان من **تحت 1 GB إلى 500 GB وما فوق**، ثم قم بالفرز حسب ملاءمة الأجهزة أو الحجم أو الحداثة أو التنزيلات. يتم تحميل النتائج تدريجيًا؛ تنطبق المرشحات على النماذج التي تم جلبها ومتغيرها الافتراضي. تستخدم نصيحة الذاكرة RAM/VRAM والسياق والمكونات المصاحبة المتاحة، دون العد المزدوج لذاكرة GPU المشتركة.

AWQ 4-bit، GPTQ 4-bit، NF4 وINT8 تم إنشاء نص على RTX 5070 Laptop باستخدام نماذج صغيرة غير مدربة تم إنشاؤها دون اتصال بالإنترنت. وهذا يتحقق من صحة التحميل والتنفيذ، وليس جودة أو أداء كل نموذج. **هذه الإضافات موجودة في المصدر: مطلوب إعادة البناء والتبعيات المتوافقة؛ لا يقوم هذا التحديث README بترقية البرنامج الثنائي المثبت.**

**تم قياسه على RTX 5070 Laptop:** Qwen2.5-0.5B-Instruct، السياق 2,048، الرموز المميزة 272، الرموز المميزة التي تم إنشاؤها 128، خمس عمليات تشغيل دافئة: فك التشفير المتوسط **GGUF Q4_K_M 402.7 الرموز/الرموز · EXL3 4 bpw 312.5 · EXL2 4 bpw 146.9**. لم تُثبت هنا أفضلية في السرعة على GGUF. تختلف إعدادات التكميم والمعايرة، وأخفق EXL3 في اختبار حسابي أساسي؛ لذلك لا تمثل هذه النتائج ترتيبًا عامًا للسرعة أو الجودة. [كامل القياسات والحدود](deliverables/exllama-2026-10-30/validation.md).

**TabbyAPI** هو اتصال خادم اختياري ومُدار بشكل منفصل ومتوافق مع OpenAI، ويتم تعطيله افتراضيًا. تم اختبار اكتشاف نموذج EXL3 المصادق عليه وتدفقه. يظل مسار ExLlama المحلي المُدار متميزًا. [إعداد ExLlama واتصال TabbyAPI](transformers-server/README.md#exl3-first-exl2-second--nvidia-execution).

يفضل الفرز الافتراضي الملائم للأجهزة الإصدارات الأحدث ضمن نفس مستوى التوافق والذاكرة المتوفرة. لا يتم استبدال النماذج المثبتة تلقائيًا.

[إعداد Safetensors الكمي](transformers-server/README.md#quantized-safetensors--source-integration-29-october-2026) · [التنسيقات والأولويات والتحقق](docs/SUIVI_MOTEURS.md)

إضافة المصادر المحدثة **المكونات المُدارة الاختيارية في تكوينات Windows x64**: بيئات Python الخاصة وملفات تعريف CPU/CUDA المثبتة والتقديرات والتأكيد قبل التنزيلات والتحقق والإصلاح والإزالة. تبقى مسارات المترجم الفوري ضمن الخيارات المتقدمة. تحتفظ محركات GGUF الأصلية بمكوناتها الحالية؛ لا يقوم الهاتف المحمول والسحابة بتنزيل Python/PyTorch لسطح المكتب. تم ممارسة ثلاثة ملفات تعريف CPU/تصدير خاصة باستخدام تركيبات صناعية حقيقية؛ أبلغ المشرف عن الاستخدام الناجح لسطح المكتب في 1 نوفمبر 2026؛ لا تزال ملفات تعريف GPU وتثبيت PC النظيف بحاجة إلى التحقق من الصحة بشكل منفصل ومفصل. [الملفات الشخصية وحدود الاختبار](docs/REPRISE_COMPOSANTS_GERES_80_LANGUES.md). تم تأجيل تضمين المكدس في EXE.

## لغات واجهة 80 ومتغيراتها

**تغطي جميع كتالوجات 80 مفاتيح اللغة الإنجليزية 2,429 الحالية** عبر مساحات الأسماء 15، بما في ذلك القوائم والتكوينات والإعدادات والمساعدة وعناصر التحكم في الوسائط. تتبع صيغ الجمع واتجاه الواجهة اللغة المحددة. تعتمد لغات الاستجابة والصوت بشكل منفصل على الطراز.

هذه التغطية الفنية لا تثبت الجودة اللغوية: **تظل المراجعة المحلية والتكيف الإقليمي ضروريين**. راجع التسميات الأصلية والحدود المعروفة في [دليل اللغة](docs/LANGUAGES.md) و [تقرير التدقيق](deliverables/interface-audit-2026-10-29/RAPPORT.md).

## مساعدة الناس في كل قطاع

أبعد من المدرسة والتعليم، طموحنا هو مساعدة الناس على التعلم وحل المشكلات وإنشاء وتطوير مشاريع مفيدة في جميع أنحاء العالم. يهدف Novera إلى جعل التطورات الحالية في AI أسهل في الفهم والاستخدام، عبر اللغات ومستويات الخبرة والأجهزة المتاحة.

| القطاعات التي نريد المساعدة في تطويرها | أمثلة على المساهمات المفيدة |
| --- | --- |
| المدارس والتعليم والتعلم مدى الحياة | شرح المفاهيم وتكييف المواد التعليمية ودعم المعلمين والطلاب والأسر. |
| الأبحاث والعلوم والفضاء | استكشاف الأدبيات وشرح الأساليب وتحليل البيانات وتبادل المعرفة. |
| الصحة والرعاية والدعم الاجتماعي | جعل المعلومات أسهل للفهم ودعم البحث وسير العمل المهني. |
| الزراعة والغذاء والمجتمعات الريفية | مشاركة المعرفة العملية ودعم التخطيط وتطوير الأدوات المفيدة محليًا. |
| البيئة والمناخ والمياه والتنوع البيولوجي | شرح الأدلة ودعم الملاحظة ومساعدة المجتمعات في تخطيط المشاريع. |
| الطاقة والصناعة والبناء والحرف | دعم التوثيق والتصميم والصيانة والتعلم الفني وتحسين العمليات. |
| الأعمال والتجارة والمالية والتوظيف | المساعدة في تنظيم العمل وفهم المعلومات وتطوير المشاريع وتعلم المهارات المهنية. |
| الخدمات العامة والقانون والمشاركة المدنية | تسهيل فهم المستندات والإجراءات وسهولة الوصول إلى المعلومات. |
| الحوسبة والأمن السيبراني والروبوتات والاتصالات | المساعدة في تطوير البرمجيات وفهم الأنظمة وبناء الأدوات المفيدة. |
| الفنون والثقافة والإعلام واللغات والتراث | دعم الكتابة والترجمة والصور والفيديو والمشاريع الإبداعية والمشاركة الثقافية. |
| النقل والخدمات اللوجستية والسياحة والرياضة والحياة المجتمعية | المساعدة في التخطيط والتواصل والتعلم والمبادرات المحلية. |
| سهولة الوصول والعمل الإنساني والحياة اليومية | تقليل حواجز اللغة والمعرفة ودعم الأشخاص بالمساعدة العملية. |

هذه توجيهات للمساهمة والتطوير، وليست ادعاءً بأن كل طلب خاص بقطاع معين قد تم تسليمه أو التحقق من صحته بالفعل. نريد إرشادات بسيطة للاستخدام اليومي، وخيارات متقدمة واضحة عند الحاجة، ومتطلبات الأجهزة والسحابة الشفافة، والتعاون مع الأشخاص الذين يعرفون كل مجال وسياق محلي.

## حالة المشروع

**Novera 1.0.0 متاح لـ Windows وLinux وmacOS وAndroid.** تعرض لقطة الشاشة تطبيق Windows الذي تم تجميعه محليًا بواسطة المشرف. يتم توثيق تغييرات المصدر والاختبارات المستهدفة والتحقق من صحة الأجهزة بشكل منفصل؛ وهذا لا يتحقق من صحة كل نموذج أو نظام أساسي أو حساب سحابي.

تم تمكين إصدارات GitHub Actions اليدوية لجميع متغيرات التوزيع الأحد عشر. اتبع [بناء النتائج والتحقق من تنزيلات المرشحين](docs/CI_DISTRIBUTIONS.md); يتم تسجيل التوفر بشكل منفصل لكل منصة. يختلف المرشحون عن إصدارات الإنتاج الموقعة. تم توضيح متطلبات التوزيع في [سياسة الإصدار الرسمي](OFFICIAL_RELEASES.md) و [صفحة الإصدارات](https://github.com/TRON-ABS/Novera/releases). يظل المرشحون الحاليون المعوقون للمُحدِّث داخليين. تتطلب الإصدارات العامة آلية تحديث تم تكوينها والتحقق منها؛ [تم توثيق عمليات التحقق من توقيع سطح المكتب ومتطلبات الإطلاق المتبقية](docs/LAUNCH_STATUS.md).

## التوثيق والمساهمات

- [دليل المستخدم التفصيلي](docs/USER_GUIDE.md), [القواعد الذهبية لمعلومات المنتج والمستخدم (الفرنسية)](docs/REGLES_D_OR.md), [الموديلات والمحركات](docs/SUIVI_MOTEURS.md).
- [التطوير](docs/DEVELOPMENT.md), [دليل البناء والإصدار](docs/BUILD_AND_RELEASE.md), [الإصدارات المستقبلية وإعداد التحديث](docs/FUTURES_VERSIONS.md).
- [لوحة تحكم المشروع](TABLEAU_DE_BORD_NOVERA.md), [خريطة الطريق](ROADMAP.md), [سجل التغيير](docs/CHANGELOG.md).
- [المساهمة](CONTRIBUTING.md): التعليمات البرمجية والاختبارات والمراجعة الأصلية عبر لغات 80 وملاحظات سير العمل الحقيقية.

## الهوية والترخيص

تتم صيانة Novera بواسطة **TRON-ABS** في [هذا المستودع](https://github.com/TRON-ABS/Novera). انظر [سياسة الهوية](BRANDING.md) و [سياسة الإصدار الرسمي](OFFICIAL_RELEASES.md).

Novera يبني عليه [Jan](https://github.com/janhq/jan)، تم إنشاؤها بواسطة Menlo Research ومساهميها. الإسناد الأصلي والجهات الخارجية و [رخصة Apache 2.0](LICENSE) محفوظ. تنزيلات Jan ليست إصدارات Novera.

## دعم Novera

كباحث مستقل، أعرف كيف يمكن لنقص التمويل أن يجعل من الصعب متابعة البحث.

إذا كنت ترغب في أن تكون جزءًا من مغامرة Novera، فيمكنك دعم بحثي وتطوير المشروع بمساهمة تطوعية بالبيتكوين.

شكراً للجميع على دعمكم ومساهماتكم وملاحظاتكم وتشجيعكم. كل لفتة مهمة في هذه المغامرة!

**Bitcoin (BTC) — شبكة Bitcoin**

عنوان الاستلام: `17TXpB1aBj5DxjwEfM3K44zyqhixRzY78i`

للمساهمة، امسح رمز QR بمحفظتك أو انسخ العنوان أعلاه. اختر **Bitcoin (BTC)، على شبكة Bitcoin**ثم اختر أي مبلغ ترغب به.

<img src=".github/assets/novera-bitcoin-support.png" alt="رمز QR لعنوان Bitcoin لدعم Novera" width="240" />

---

<div align="center">
  <p>إلى كل من يبدأ رحلته مع Novera: أتمنى أن يفتح فضولك أبوابًا جديدة، وتنبض أفكارك بالحياة، ويأخذك كل إبداع إلى أبعد قليلاً.</p>
  <p><strong>TRON-ABS</strong></p>
  <p>السيد Sachet Jean-Marc — باحث مستقل — فرنسا</p>
  <p><em>فن الإنسان مع AI</em></p>
  <p>شكراً لكل من يساهم في عالم أفضل. ومن خلال اكتشافاتهم وعملهم ودعمهم المتبادل والمعرفة التي ينقلونها، فقد ساعدونا في الوصول إلى ما نحن عليه اليوم.</p>
  <p>نتمنى لهم الأفضل في المستقبل، جنبًا إلى جنب مع كل من يحمل روح المشاركة ومساعدة الآخرين على المضي قدمًا.</p>
</div>

<div align="center"><sub>أداة التطوير: 🧠 Codex — GPT-6.1 Sol</sub></div>

</div>
