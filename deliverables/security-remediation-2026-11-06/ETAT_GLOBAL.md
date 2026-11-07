# Novera : contrôle global du 6 novembre 2026

**Novera n'est pas encore à 100 % sur les dernières versions de ses composants.** Les tests locaux corrigés passent, mais cela ne remplace pas les migrations de dépendances et les essais des paquets natifs. La version applicative reste 1.0.0 ; la 1.0.1 est préparée dans les sources, sans publication ni modification de l'application installée.

| Volet | Résultat constaté | Ce qui reste |
| --- | --- | --- |
| Interface web | 7 294 tests réussis, zéro échec, 17 ignorés ; compilation web et TypeScript réussis. | Essais visuels et parcours des paquets natifs. |
| Cœur et extensions | 172 tests du cœur et 390 des extensions réussis. | MLX exclu de la suite Windows, à tester sur macOS. |
| Sécurité native | Contrôle Rust Windows réussi ; 26 tests de protection/parseurs et trois tests Tauri d'accès aux fichiers réussis. | Coffres Linux/macOS, WebViews hostiles, médias réels, authentification en réseau, ressources des parseurs. |
| Traductions | 104 catalogues, 2 429 clés chacun ; 16 textes de confidentialité et leurs destinataires présents partout. Compteurs persan/pendjabi corrigés. 104 fichiers README présents. | Relecture native, notamment des adaptations régionales ; contrôle de présence sans certification linguistique. |
| llama.cpp | Source et checkout sur v0.9.0, build 12110, commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`, correspondant à la dernière release stable consultée. | Compiler/lier et exécuter l'inférence sur les plateformes et backends concernés. |
| MLX | Sources : mlx-swift depuis 0.31.4, borné avant 0.32 ; mlx-swift-lm 3.31.4 exact. Releases consultées : 0.33.0 et 3.32.3. | Migration sur Mac en respectant les contraintes Swift/Jinja/tracing documentées. |
| ExLlama | Roues Windows : v3 1.6.5, release actuelle consultée 1.6.6 ; v2 0.3.2 correspond à la dernière release consultée. | Priorité sécurité : remplacer/reconstruire la combinaison Python 3.12/Torch 2.9/CUDA 12.8 et tester EXL2/EXL3. |
| Python Transformers/médias | 43 tests Transformers exécutés, dont 13 ignorés ; 28 tests médias réussis dans un environnement de test isolé utilisant les bibliothèques système. | Inférence GPU, parcours ignorés et validation des environnements qui seront réellement distribués. |
| ONNX | NumPy 2.5.4, ONNX 1.23.2 et ONNX Runtime 1.31.1 correspondent aux versions PyPI consultées. | Aucune roue Windows ONNX Runtime 1.31.1 pour CPython 3.15 : roues CPython 3.11 à 3.14 uniquement. Tester avec un Python compatible ; aucune inférence ONNX exécutée ici. |

## Dépendances : des écarts de versions subsistent

- JavaScript : **138 noms de paquets directs** consultés dans **11 manifests** ; **97** ont au moins une version installée différente du tag stable `latest`. Cela inclut les dépendances de développement et des changements majeurs, par exemple AI SDK et Vite. Ce nombre ne mesure pas des vulnérabilités ni des mises à jour compatibles applicables sans adaptation. [Relevé npm](javascript-freshness.json).
- Rust : **117 noms de crates directs** consultés dans **14 manifests** ; **86** ont au moins une version présente dans les verrous examinés différente de la dernière stable. Plusieurs versions d'une même crate peuvent être nécessaires à des dépendances incompatibles entre elles. Le relevé n'est pas une résolution complète pour tous les targets. [Relevé crates.io](rust-freshness.json).
- Python : **19 projets PyPI** consultés pour les trois serveurs et leurs variantes. Sept noms ont des pins exacts différents de la version actuelle consultée : Torch, Transformers, Diffusers, GPTQModel, ONNX Runtime GenAI, comfy-kitchen et triton-windows. Les exigences `>=` ne prouvent pas quelle version sera installée. [Relevé PyPI](python-freshness.json).

Les versions ont été consultées directement sur les registres officiels. L'identité des releases de moteurs et la dernière publication Novera consultée sont conservées dans [engine-releases.json](engine-releases.json). La référence stable de llama.cpp est [v0.9.0](https://github.com/ggml-org/llama.cpp/releases/tag/v0.9.0). Les autres sources exactes figurent dans chaque relevé.

## Sécurité : points ouverts

Le scan npm complet relève zéro avis de sécurité URL, avec dix notices de dépréciation. Le scan Rust de six verrous couvre 1 224 couples nom/version : 19 couples correspondent à 18 identifiants d'avis, avec alias et notices de maintenance. `glib 0.18.5` reste concerné par RUSTSEC-2024-0429 dans la pile Linux GTK/WebKit.

Le scan des **18 pins Python** renvoie **18 identifiants, dont des alias**, pour les seuls anciens Torch 2.9.0 et Transformers 4.57.1 du runtime ExLlama optionnel. Certains avis portent sur le chargement de contenus non fiables et l'exécution de code. Leur exploitabilité dans Novera n'a pas été démontrée ; ils ne sont pas annoncés comme corrigés. Les exigences Python transitives, les plages `>=`, les roues GitHub directes et l'ensemble des composants C/C++ ne sont pas couverts par ces seuls scans. [Détails Python](python-osv.json), [détails Rust](rust-osv.json), [suivi de sécurité](../../SECURITY.md).

## Trois priorités avant une validation de release

1. Traiter le runtime ExLlama ancien et le correctif glib Linux, puis refaire les scans sur les environnements réellement distribués.
2. Migrer les dépendances restantes par lots compatibles, en conservant les tests ; valider les moteurs et le choix de Python pour ONNX sur chaque cible.
3. Reconstruire et signer les paquets, tester la transition publique 1.0.0 → 1.0.1 avec conservation des données et finaliser les informations de confidentialité/conservation.

Les contrôles locaux, la CI, les essais natifs, l'approbation et la publication sont des étapes différentes. Ce bilan n'annonce ni une publication ni une certification de sécurité.
