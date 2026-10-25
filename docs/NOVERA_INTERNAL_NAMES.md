# Noms internes de Novera — 25 octobre 2026

Les sources et leurs consommateurs utilisent désormais les noms Novera pour
les composants propres au projet.

| Ancien nom | Nom actuel |
| --- | --- |
| `jan-llama-worker` | `novera-llama-worker` |
| `jan_llama_shim.cpp` / `.h` | `novera_llama_shim.cpp` / `.h` |
| Fonctions C `jan_llama_*` | Fonctions C `novera_llama_*` |
| `useLatestJanModel` | `useLatestNoveraModel` |
| `useJanModelPromptDismissed` | `useNoveraModelPromptDismissed` |
| `useJanBrowserExtension` | `useNoveraBrowserExtension` |
| `JanBrowserExtensionDialog` | `NoveraBrowserExtensionDialog` |

Les manifestes Cargo/Tauri, imports et mocks, scripts de construction,
signature, paquet portable, installation Windows et workflows concernés
suivent ces noms. Le worker Android est désormais préparé sous le nom
`libnovera_llama_worker.so`. Les 17 fonctions de la frontière Rust/C++
utilisent le même préfixe et le même nom d’archive de shim.

## Compatibilité et identité des tiers

Les valeurs des clés de stockage persistent : le module Novera retrouve
notamment `jan-model-prompt-dismissed`. La recommandation reste celle de Novera.
Les variables de construction `JAN_ENGINE_*` et `JAN_LLAMA_CPP_*` existantes
restent compatibles ; cette modification ne migre pas toutes les anciennes API.

L’installateur Windows gère les deux noms du worker dans le répertoire de
l’installation : arrêt et libération avant remplacement, restauration si
l’installation abandonne, retrait de l’ancien worker après réussite.
Le même traitement est prévu à la désinstallation. Ce contrôle ne vise pas
les processus tiers installés ailleurs.

`getProviderLogo('novera')` utilise le logo Novera existant.
`getProviderLogo('jan')` garde le logo du fournisseur tiers Jan. Le vrai flux
de modèles Jan conserve son API `fetchLatestJanModel`. Le module navigateur
Novera conserve le nom `Jan Browser MCP`, sa commande de connexion et le lien
vers son extension Chrome existante : ce sont des identifiants de compatibilité
avec un composant tiers, pas une nouvelle extension Novera.
Les licences, auteurs historiques et attributions sont conservés.

## Validation locale et limites

- 234 tests web réussis dans neuf suites : modules renommés, hydratation,
  préférences existantes, recommandation, écran de démarrage, saisie,
  logos, service modèles et réinitialisation du stockage.
- Vérification TypeScript sans émission réussie.
- Paquet portable Windows : 223 assertions et 12 scénarios réussis sur fixtures.
- Trois tests Rust de ressources/installateur réussis dans un harnais isolé
  reprenant le fichier de test, dont la migration et la restauration de l’ancien
  worker. La compilation de l’application Tauri n’a pas été lancée.
- Métadonnées Cargo : cible `novera-llama-worker` et chemin source renommé.
- En-tête du shim validé par MSVC en C et C++ ; concordance des 17 déclarations
  Rust avec l’en-tête C et les références C++ contrôlée.
- Syntaxe de trois scripts Bash et cinq scripts PowerShell contrôlée.

Les tests web existants émettent encore des avertissements React `act` et des
messages d’erreurs simulées, sans échec. Aucun moteur complet ni exécutable
Desktop, installateur réel, paquet macOS/Linux ou APK Android n’a été reconstruit.
La liaison complète du shim et une vraie mise à niveau d’installation restent
à vérifier lors de la prochaine construction. Les exécutables déjà construits
conservent leurs anciens noms et leur comportement jusqu’à leur remplacement.
