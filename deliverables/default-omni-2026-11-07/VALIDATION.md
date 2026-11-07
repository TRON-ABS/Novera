# Modèle par défaut commun — 7 novembre 2026

Préparation locale de la 1.0.1 ; manifests applicatifs conservés en 1.0.0. Aucun paquet publié, commit ou déploiement.

## Comportement

LFM3-Omni-2B Q4_K_M est proposé par défaut sur les interfaces Desktop, Android et iOS, avec son mmproj obligatoire. NVIDIA Nemotron-3.5-Bolt-E4B Q4_K_M reste une alternative dans Configurations. Les descriptions expliquent le téléchargement, la mémoire, les modalités et la voix système de l'alternative texte. Les 104 catalogues contiennent ces deux descriptions et 2 435 clés ; la validation structurelle ne certifie pas une relecture humaine des traductions.

Les nouveaux réglages recommandés sont de 32 768 jetons sur ordinateur et 2 048 sur mobile. Les réglages des modèles déjà installés sont conservés ; sélectionner explicitement une recommandation applique son contexte. Les contrôles de compatibilité et de mémoire restent visibles : un contexte de 32K exige davantage de mémoire.

Le pack importe le modèle et son projecteur depuis le même dossier. La découverte native vérifie taille et SHA-256 des deux fichiers et refuse un projecteur manquant ou incorrect. Elle conserve la découverte de Nemotron et ne traite pas le projecteur comme un modèle indépendant. Aucun téléchargement automatique n'est déclenché en ouvrant Configurations.

## Provenance

Paire issue du [dépôt officiel LiquidAI](https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF), révision `d508b88f08a5b4286f2d2805a6a8d69a0ff44c72` :

| Fichier | Octets | SHA-256 |
|---|---:|---|
| LFM3-Omni-2B-Q4_K_M.gguf | 1099630080 | `9f8d30e9d4fd7a9349d586e077988229b3ca0a0e4ad730897563d1eccc9893e2` |
| mmproj-LFM3-Omni-2B-Q4_K_M.gguf | 291586720 | `0a746c0794782a16d4456b230c2a0b5888a2d94a6677211edbed7d7a4177a39a` |

Total : 1 391 216 800 octets, environ 1,39 Go décimaux. Tailles et empreintes des fichiers locaux existants concordent avec l'API officielle Hugging Face. Aucun poids utilisateur n'a été modifié. [Alternative NVIDIA officielle](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB), environ 6,18 Go.

## Vérifications et limites

Suite web complète après correction de l’assertion de placement micro : **7 494 réussis, 17 ignorés, aucun échec**, dans 518 fichiers (516 réussis, deux ignorés). Cette exécution précède le lot de catalogue API documenté séparément.

- 161 tests ciblés interface/import/découverte/configuration réussis dans sept fichiers ; quatre tests des réglages initiaux de l'extension réussis.
- Rust Windows, `cargo test --locked --manifest-path src-tauri/Cargo.toml --lib core::recommended_models::tests` : trois réussis ; `core::creation_bundle::tests` : dix réussis. Compilation de bibliothèque de test, pas d'un paquet de distribution.
- TypeScript `tsc -b` réussi. ESLint ciblé réussi sur les cinq sources de recommandation/import ; SetupScreen conserve cinq erreurs préexistantes `react-hooks/set-state-in-effect`, sur des lignes non modifiées par ce lot.
- Builds Vite `IS_TAURI=true`, plateformes `windows`, `darwin`, `linux`, `android`, `ios` : cinq réussis. Ce sont des builds de l'interface commune, pas des compilations natives pour chaque OS.
- Interface Windows WebView avec profil isolé : deux choix visibles, contexte 32768 ; simulation mobile à 390 px : contexte 2048, aucun débordement horizontal des cartes. Aucun téléchargement. Captures et résultats joints.
- Validation de structure : 104 catalogues, 2435 clés, aucune erreur. Textes traduits automatiquement avec variantes régionales ; relecture éditoriale native non certifiée.

La synthèse vocale native LFM3 reste limitée à Windows dans l'implémentation actuelle. La sélection par défaut commune ne garantit pas l'inférence, la voix ou les performances sur Android/iOS/macOS/Linux. Aucun test sur appareil mobile ni paquet natif de ces plateformes n'a été exécuté pour ce lot. Les applications déjà installées et les releases publiques n'ont pas reçu ces changements : il faut reconstruire ou distribuer une mise à jour. Le CLI n'a pas l'interface Configurations ni de modèle téléchargé implicitement.
