# Revue des sources Android — 2 novembre 2026

Périmètre : première distribution directe APK ARM64 Novera 1.0.0, identité `io.github.tronabs.novera`. Les trois revues de sources de `scripts/android/readiness.json` sont closes pour les décisions décrites ci-dessous. Elles ne certifient pas une installation, une interface ni un moteur exécuté sur téléphone. La vérification du paquet compilé et les essais sur appareil restent des preuves distinctes.

## Dépendances mobiles

- `build-apk.ps1` sélectionne `--no-default-features --features mobile`. Les dépendances TLS mobiles de `src-tauri/Cargo.toml` utilisent Rustls. Le serveur MLX et les ressources Windows ne sont pas des ressources Android.
- Le worker CPU ARM64 provient de la révision llama.cpp épinglée par `plugins/tauri-plugin-llamacpp/build.rs`. Les bibliothèques natives requises sont `libapp_lib.so`, `libnovera_llama_worker.so`, `libggml.so`, `libggml-base.so`, `libggml-cpu.so` et `libc++_shared.so`.
- Incident local établi : le projet généré du 24 octobre contenait encore `libjan_llama_worker.so`. Le contrôleur actuel refusait correctement ce dossier. La reconstruction du moteur remplace cette entrée obsolète ; le vérificateur d'APK refuse toute bibliothèque manquante ou supplémentaire.
- `engine/worker.rs` cherche le worker dans le répertoire natif installé Android, depuis le mapping de `libapp_lib.so`. `extractNativeLibs=true` permet son extraction par le gestionnaire de paquets. Aucune exécution de binaire téléchargé dans le dossier de modèles n'est nécessaire.
- `engine/commands.rs` limite Android à un modèle et désactive le cache KV persistant. L'inférence locale reste CPU ; la mémoire et le comportement des appareils restent à mesurer.
- Les copies Gradle des plugins et leurs notices sont gérées par `configure-project.mjs`, sans modification du registre Cargo. Le moteur et le NDK apportent leurs notices dans les assets.
- Le premier assemblage release a révélé des références à `consumer-rules.pro` absentes des crates de certains plugins. La configuration exporte désormais leurs règles ProGuard existantes depuis les copies générées. Les règles JNI/annotations de Tauri restent actives.
- Le visiteur K2 de Lint plante sur le script de dépendances Kotlin inclus séparément ([défaut amont documenté](https://android.googlesource.com/platform/tools/base/+/44330ad8b855e38930c70ca44f65e781dd95d1ab)). La configuration intègre ces dépendances déclaratives dans le script applicatif et les rafraîchit après chaque génération Cargo. Lint n'est pas désactivé ; après cette correction, il a signalé les attributs `includeSubdomains` manquants, maintenant explicitement fixés à `false` sur les deux exceptions loopback.
- Sur ce poste Windows, Cargo réussit la compilation release mais Tauri ne peut créer le lien symbolique de `libapp_lib.so`. Le chemin de secours n'est accepté qu'après un message de compilation release réussie et cet échec précis ; il copie la bibliothèque avec comparaison SHA-256 puis utilise Gradle en sautant uniquement la tâche Rust déjà exécutée. Le reçu de conditionnement décrit ce mode, séparément de l'échec original Tauri.

## Permissions et exposition réseau

- Seule la capacité Tauri `mobile` est sélectionnée. Elle n'a ni origine distante IPC, ni permission `shell:allow-spawn`, ni updater desktop. Les commandes de fichiers et de dialogue mobiles utilisent les sélecteurs système et le support des URI `content://` de `tauri-plugin-fs`.
- Le manifeste applicatif demande `INTERNET`. La vérification du manifeste fusionné du vrai APK accepte également `ACCESS_NETWORK_STATE` et la permission interne AndroidX de récepteur non exporté ; elle refuse toute autre permission, notamment stockage global, caméra, micro et installation de paquets.
- Le FileProvider n'est pas exporté et ses chemins sont limités à `files/exports` et `cache/exports`. L'activité principale est exportée pour le lanceur, sans service de contrôle distant ajouté.
- Le build release n'est pas débogable. Une configuration réseau explicite interdit HTTP distant et permet seulement `localhost` et `127.0.0.1` pour les services locaux. Les appels Rust utilisent leur pile TLS ; les fournisseurs HTTPS restent le chemin prévu pour le cloud.
- Le mécanisme de mise à jour retenu est l'ouverture manuelle du nouvel APK signé dans l'installateur Android, avec confirmation système. Novera ne demande pas `REQUEST_INSTALL_PACKAGES` et n'installe pas silencieusement un paquet.

## Stockage et secrets

- Dans `src/lib.rs`, le répertoire privé fourni par `app.path().app_data_dir()` initialise la racine mobile avant la configuration applicative et les accès aux données. Le plugin vector-db résout lui aussi le répertoire privé Android lors de son setup. Les identités debug et production restent séparées.
- `provider_secrets.rs` utilise une clé aléatoire de 32 octets créée dans les données privées, avec permissions Unix `0600`, pour son fichier AES-256-GCM. Les sauvegardes Android applicatives sont désactivées (`allowBackup=false`, `fullBackupContent=false`). Ce dispositif n'est pas présenté comme un stockage matériel Android Keystore.
- Défaut confirmé dans la dépendance locale `keyring 3.6.3/src/lib.rs` : Android sélectionne le backend `mock`, dont une écriture réussie n'est pas persistante. `keyring_down()` sélectionne désormais directement le fichier chiffré privé sur Android. Les backends desktop et iOS restent inchangés.
- Les conversations et réglages restent dans les données privées de l'identité applicative. La signature Android durable est distincte de la clé updater desktop. Pour conserver les données, la mise à jour doit garder identité et certificat, avec un `versionCode` supérieur ; une désinstallation n'est jamais une preuve de migration.

## Preuves à ajouter après construction

`scripts/android/verify-apk.py` contrôle le fichier signé : identité, version, versionCode, SDK, permission set, sauvegardes désactivées, absence de debug, certificat public épinglé, signature APK v2, zipalign, ELF ARM64 alignés à 16 Kio, dépendances natives et notices. Son reçu laisse `deviceValidated=false`.

Les résultats effectifs, les empreintes finales et le protocole téléphone doivent être consignés dans `RELEASE_ANDROID_1.0.0.md`. La fermeture de ces revues autorise une tentative release contrôlée ; elle ne vaut ni validation sur appareil ni publication.
