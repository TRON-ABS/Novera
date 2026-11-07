# llama.cpp v0.9.0 — préparation locale de toutes les versions

État actualisé le 6 novembre 2026 : **moteur C/C++ et Desktop Windows x64 compilés en release**, ressources CPU/CUDA assemblées et vérifiées. Le worker du dossier final confirme v0.9.0/build 12110 et détecte la RTX 5070 après chargement des backends distribués. [Preuves de compilation et limites](../deliverables/full-update-2026-11-06/BUILD_DESKTOP.md). Aucun essai d'inférence ni validation des autres plateformes n'en découle. Aucun commit, push, publication ou workflow lancé pour ce lot ; les installations existantes ne sont pas remplacées. La version applicative reste **1.0.0**.

## Verrouillage commun

La référence est [la release officielle v0.9.0](https://github.com/ggml-org/llama.cpp/releases/tag/v0.9.0), build **12110**, commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`. Le tag et le commit se trouvent dans `src-tauri/plugins/tauri-plugin-llamacpp/build.rs`. Le script de récupération contrôle le commit exact ; un tag déplacé ou un checkout ancien provoque un échec. Le checkout fournisseur local est à ce commit.

| Version | Préparation des sources | Validation restante |
| --- | --- | --- |
| Desktop Windows x64 | Worker v0.9.0 et application compilés en release ; chargement CPU/CUDA et détection RTX 5070 vérifiés dans le runtime assemblé. | Inférence réelle ; essais des autres GPU/backends et de l'interface native. |
| Desktop Windows ARM64 | Worker commun épinglé sur v0.9.0, variantes CPU/GPU existantes. | Compilation, liaison et inférence sur ARM64. |
| Windows portable | Reprend le worker de la compilation desktop correspondante. | Reconstruire puis vérifier le contenu du ZIP. |
| Linux x64/ARM64 | Même worker et même verrouillage. | Compilation, dépendances et inférence sur chaque cible. |
| macOS Intel/Apple Silicon | Même worker, sélection explicite de l’architecture CMake. | Deux compilations et essais distincts ; contrôle Metal. |
| Android ARM64 | Même verrouillage, repris dans le manifeste du moteur Android. | Reconstruction du worker/APK puis essai sur téléphone. |
| iOS appareil et simulateur | Moteur intégré à l’application, CPU/Metal statiques, SDK choisi selon la cible Rust. | Compilation sur Mac avec Xcode, signature pour appareil et essais sur simulateur/iPhone. |
| CLI Windows/Linux/macOS | Nouveau crate `novera-inference`, réutilisant le moteur et le build communs sans dépendance Tauri. | Compilation native, contrôle des dépendances, commandes du serveur et inférence. |

Les variantes Vulkan, CUDA et HIP/ROCm concernent les parcours existants du worker. La CLI utilise le CPU par défaut et propose `engine-metal` sur Mac. Les backends disponibles restent propres à chaque plateforme. Le verrouillage llama.cpp ne modifie pas les moteurs distincts tels que MLX.

## iOS

L’application utilise les mêmes commandes Tauri et le même serveur HTTP local que le worker desktop. Elle héberge le moteur directement, sans lancer de processus enfant. Les commandes de version et de détection des appareils interrogent le moteur lié. Le démarrage et le rechargement limitent la résidence à un modèle et désactivent la persistance KV entre sessions.

Les scripts `yarn build:ios` et `yarn build:ios:device` préparent maintenant les sources épinglées avant la future compilation. Cette préparation doit s’effectuer sur Mac avec Xcode et ses SDK iOS. Le compilateur Metal doit aussi être disponible. Les modèles doivent rester accessibles dans le stockage autorisé à l’application.

Le moteur partage le processus de l’application : un arrêt natif ou un manque de mémoire fatal peut fermer l’application. Ce parcours ne bénéficie pas de l’isolation du worker desktop. Le fonctionnement en arrière-plan, les limites mémoire et le cycle suspension/reprise restent à tester sur appareil.

## CLI

Les commandes ci-dessous sont destinées à la prochaine compilation du mainteneur ; elles n’ont pas été exécutées dans cette préparation.

Depuis la racine du projet, récupérer les sources puis compiler la CLI :

```sh
bash src-tauri/build-utils/fetch-engine-source.sh
cd src-tauri/novera-cli
cargo build --locked --no-default-features --features cli --release
```

Sur Mac, `--features cli,engine-metal` active Metal avec les shaders embarqués. Il faut une chaîne C++/CMake, ainsi que Ninja et LLVM pour le parcours Windows prévu par le projet. `make build-cli` et `make build-agent` préparent aussi les sources. Les modèles GGUF sont fournis localement par l’utilisateur ; le serveur ne télécharge aucun modèle au démarrage.

Créer par exemple un fichier `local.ini`, en remplaçant le chemin par celui d’un vrai modèle :

```ini
[*]
ctx-size = 2048
parallel = 1
n-gpu-layers = 0

[local-model]
model = /chemin/absolu/modele.gguf
```

Pour Metal, adapter `n-gpu-layers` au modèle et à la mémoire disponible. Les chemins absolus évitent une dépendance au répertoire de lancement.

Sous PowerShell :

```powershell
$env:NOVERA_ENGINE_API_KEY = '<cle-locale-aleatoire>'
novera engine version
novera engine serve --preset C:\chemin\local.ini --port 8080
```

Sous Linux/macOS :

```sh
export NOVERA_ENGINE_API_KEY='<cle-locale-aleatoire>'
novera engine version
novera engine serve --preset /chemin/local.ini --port 8080
```

La clé doit être non vide. `--port 0` demande un port libre au système. Le serveur affiche une ligne JSON avec l’URL et les identifiants des modèles, sans afficher la clé ; il écoute exclusivement sur `127.0.0.1`. Les modèles se chargent à la demande. `--models-max` vaut 1 par défaut et doit être positif ; `--slot-cache-mib` vaut 0.

Dans un second terminal, utiliser l’endpoint comme fournisseur compatible OpenAI :

```sh
novera --provider openai --base-url http://127.0.0.1:8080/v1 --api-key '<meme-cle-locale>' --model local-model
```

Adapter l’URL si le système a choisi le port. `Ctrl+C` demande l’arrêt du serveur et la libération des modèles. Comme sur iOS, le moteur intégré partage le processus CLI : un arrêt natif peut fermer le serveur.

## Contrôles sans compilation

La préparation vérifie les manifestes Cargo, le verrouillage de version, les dépendances de la CLI, la syntaxe Rust et les scripts de préparation. Les tests de packaging et de préparation avec compilateur simulé ne valident pas la compilation C++, la liaison, les commandes CLI exécutables ni l’inférence. Ces vérifications restent à réaliser après compilation sur chaque plateforme.

Résultats obtenus le 6 novembre 2026 :

| Contrôle exécuté | Résultat |
| --- | --- |
| `cargo metadata --no-deps --locked --offline --format-version 1` | Réussi pour l’application, le plugin natif, le worker Android, la CLI et `novera-inference`. Aucun build lancé. |
| `cargo tree --locked --offline --target x86_64-pc-windows-msvc --no-default-features --features cli -e normal` | Graphe CLI avec `novera-inference` 0.9.0, sans Tauri/GTK/GDK/Muda/Wry/WebKitGTK. Les autres cibles ne sont pas couvertes par ce contrôle de graphe. |
| Analyse syntaxique par `rustfmt`, sans exécution du code | Neuf fichiers Rust contrôlés. |
| `node --test scripts/__tests__/engine-staging.test.mjs` | Trois tests réussis sur des fichiers simulés. |
| `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tests/prepare-novera-engine.Tests.ps1` | 24 assertions réussies, compilateur simulé. |
| Lecture TOML/JSON/YAML, comparaison des lockfiles et du checkout fournisseur | Réussie ; ajout du seul paquet `novera-inference` au verrouillage CLI, versions des dépendances existantes conservées. |
| `git diff --check` | Réussi. |

Une résolution Cargo complète hors ligne, toutes cibles confondues, n’a pas abouti car le cache ne contient pas `android_system_properties` 0.1.6. Le contrôle ciblé du graphe Windows a ensuite réussi sans téléchargement. Aucun résultat de résolution complète ni de compilation n’est revendiqué.

Les tests Rust ajoutés pour les métadonnées de version et le cycle authentification/liste des modèles/arrêt du serveur restent **non exécutés**. Le rapport local est conservé dans `.build/llamacpp-0.9.0-2026-11-06/validation.json`.

Voir aussi [les prochaines versions](FUTURES_VERSIONS.md), [les commandes de distribution](BUILD_AND_RELEASE.md) et [la disponibilité des versions publiques](LAUNCH_STATUS.md).
