# Validation locale de la préparation 1.0.1

Sources locales du 6 novembre 2026. Les manifests de l'application restent 1.0.0. Les anciennes preuves de l'audit initial restent historiques ; les résultats ci-dessous concernent les corrections. Aucun secret personnel n'a été utilisé dans les tests de chiffrement.

| Commande / portée | Résultat |
| --- | --- |
| Depuis la racine : `corepack yarn test` | Réussi : cœur 172, interface 7 294, extensions 390 ; **7 856 réussis, zéro échec, 17 ignorés**. |
| Depuis web-app : `corepack yarn build` | TypeScript puis Vite réussis ; avertissements de taille des chunks et d'annotations de bibliothèques, sans échec. |
| Depuis web-app : `node node_modules/vitest/vitest.mjs run --reporter=json --outputFile=../.tmp/security-web-full-validated.json` | 7 294 réussis, zéro échec, 17 ignorés. |
| `corepack yarn test:core` | 172/172 réussis. |
| `corepack yarn test:ext` | 390/390 réussis ; MLX exclu sur Windows par la configuration existante. |
| `cargo check --manifest-path src-tauri/Cargo.toml --lib` | Réussi sous Windows, avec un avertissement `unused_mut` dans la configuration. |
| `cargo test --manifest-path scripts/security/native/Cargo.toml --locked --lib` | 26/26 réussis ; import des véritables sources de sécurité et de parsing. |
| `cargo test --manifest-path src-tauri/Cargo.toml --lib core::asset_access::tests --locked` | Trois tests Tauri réussis : portée d'un fichier, exclusion des secrets, accès aux réglages ordinaires d'un projet. |
| `cargo metadata --manifest-path … --no-deps --locked --offline --format-version 1` pour les six manifests runtime | Six réussites, voir cargo-metadata.json ; ce contrôle ne compile pas les six cibles. |
| `node --test scripts/security/security.test.mjs scripts/monitoring/telemetry.test.mjs scripts/__tests__/novera-update.test.mjs scripts/distribution/__tests__/ci-check-updater.test.mjs` | 21/21 réussis. |
| `node scripts/check-architecture.mjs` et `node --test scripts/__tests__/architecture.test.mjs` | Six zones, 47 fichiers, aucune violation ; huit tests réussis. |
| `scripts/tests/telemetry-config.Tests.ps1` et `scripts/android/__tests__/telemetry.Tests.ps1` | 18 + 7 assertions réussies, aucun appel réseau. |
| `python scripts/check-novera-locales.py` | 104 catalogues de 2 429 clés, aucune erreur. Contrôle spécifique confidentialité : 16 textes/catalogue, destinataires présents. |
| ESLint ciblé sur les fichiers de production corrigés | Zéro erreur ; les fichiers de tests ignorés par la configuration ne sont pas présentés comme lintés. |
| Depuis transformers-server : `python -m unittest test_exllama test_float_quant test_managed test_peft test_quantization test_server` | 43 exécutés, 13 ignorés, aucun échec. Interpréteur de contrôle Python 3.15.1, Torch 2.15.0+cu134, Transformers 5.21.0 : ce n'est pas l'environnement ExLlama ancien ni la preuve des pins distribués. |
| Depuis media-server : `../.tmp/security-python/Scripts/python.exe -m unittest test_nvfp4_compat test_upscale test_video_worker test_worker` | 28 réussis. Environnement de test isolé avec accès aux paquets système ; Diffusers 0.42.0, imageio-ffmpeg 0.8.1 et ONNX 1.23.2 installés en roues précompilées sans leurs dépendances. Aucun paquet de production modifié. |

Les tests ciblés intermédiaires (281 tests applicatifs, 38 confidentialité/chemins, deux musique/chemins et 414 tests de réparation/catalogues) se recouvrent avec les suites complètes : ne pas additionner leurs nombres.

## Scans et fraîcheur des versions

`corepack yarn npm audit --all --recursive --json` : zéro avis de sécurité URL, dix dépréciations. Le code de sortie 1 vient des notices et n'est pas interprété comme « aucun résultat ». Les résultats bruts sont dans npm-all.jsonl.

`python scripts/security/scan-rust.py --lockfile … --output …` examine les six verrous cités dans rust-osv.json : 1 224 versions, 19 versions correspondantes, 18 identifiants incluant des alias et avis de maintenance. Le scan Python exact et les comparaisons npm/crates.io/PyPI/GitHub sont conservés séparément. Voir [le bilan global](ETAT_GLOBAL.md) pour les résultats et limites, en particulier ExLlama, glib et les différences de versions.

ONNX Runtime 1.31.1 n'a pas pu être installé en roue Windows dans le Python 3.15 du test ; seules les roues CPython 3.11–3.14 figurent dans le relevé officiel. Le test d'inférence ONNX n'a pas été exécuté. Aucune installation source native ou modification de Python système n'a été tentée.

## Limites de validation

Pas de compilation/liaison du nouveau moteur llama.cpp C/C++, d'inférence du moteur sur chaque backend, de tests natifs Linux/macOS/mobile ni de test du passage entre deux paquets publics 1.0.0 et 1.0.1. Les tests GPU explicitement ignorés restent à exécuter. Aucun workflow CI n'est lancé, aucun paquet n'est publié et aucun exécutable installé n'est remplacé.

Les rapports JSON et journaux de ce dossier consignent le périmètre réel. La première suite web avec 19 échecs est conservée dans test-summary.json comme état intermédiaire ; elle ne décrit plus le résultat final corrigé.
