# Tableau de bord Novera — centre de contrôle du développement

**Point d’entrée principal du développement de Novera.** Dernière mise à jour : **25 octobre 2026**.

Mission : **Knowledge for everyone.** Rendre le savoir et les outils d’IA accessibles au plus grand nombre, dans plusieurs langues. Mainteneur : **TRON-ABS**.

Contact officiel de Novera : **[contact.novera.tronabs@gmail.com](mailto:contact.novera.tronabs@gmail.com)**, confirmé par le mainteneur le 24 octobre 2026 et affiché dans les README anglais et français du dépôt.

Ce fichier centralise les accès, le statut et les prochaines étapes ; les détails restent dans les fichiers spécialisés. Les instructions du mainteneur et de [NOVERA.md](NOVERA.md) gardent leur priorité. Ce tableau est un état documenté, pas un suivi automatique en temps réel ni une autorisation de compiler ou de publier.

## Navigation rapide

Publication des sources autorisée le 25 octobre 2026 : suivi des erreurs, consentement indépendant, traductions et documentation. Le nouveau jeton déclaré européen remplace le premier uniquement dans la configuration locale ignorée par Git ; aucun jeton, binaire ou artefact de compilation n’entre dans cette publication. GitHub Actions reste désactivé.

Préparation locale du 25 octobre 2026 : **Error tracking PostHog** ajouté aux sources avec un consentement indépendant, désactivé par défaut, et des textes dans les 36 langues. Filtrage strict des rapports JavaScript non interceptés, déduplication, dix rapports maximum par activation, arrêt immédiat sur retrait. Validation ciblée : 44 tests et TypeScript sans émission réussis ; inventaire des langues validé. Cette préparation a ensuite été publiée dans 0990a25, puis compilée et raccordée au projet Europe lors de la validation locale décrite dans l’état actuel. Les crashs natifs, erreurs interceptées et source maps restent hors périmètre. Voir [configuration et limites](docs/UPDATES_AND_TELEMETRY.md#suivi-des-erreurs--25-octobre-2026).

- [Fournisseurs cloud et procédure des futures mises à jour](docs/CLOUD_PROVIDERS.md)
- [État actuel](#état-actuel)
- [Travaux restants](#travaux-restants)
- [Architecture en six domaines](docs/ARCHITECTURE.md)
- [Commandes de discussion et exports](docs/CONVERSATION_CONTROLS.md)
- [À faire : Android / APK](A_FAIRE.md)
- [Carte des fichiers essentiels](#carte-des-fichiers-essentiels)
- [Commandes utiles](#commandes-utiles)
- [Exécutable et preuves locales](#exécutable-et-preuves-locales)
- [Règles de maintenance du tableau](#règles-de-maintenance-du-tableau)

## État actuel

Premier démarrage : DSpark Q8_0 optionnel et décoché pour le LFM2.5-2.6B de bureau, avec explication du compromis RAM/VRAM/contexte dans les 36 langues. Le suivi des erreurs demande aussi un consentement indépendant, désactivé par défaut et mémorisé. Couverture : 1 516/1 516 clés. [Parcours et limites de validation](docs/FIRST_RUN_OPTIONS.md). Ces ajouts nécessitent une nouvelle compilation.

Synchronisation complète des sources du 25 octobre 2026 : les **36 catalogues couvrent 1 516/1 516 clés**, les noms internes du moteur et des modules propres à Novera sont adaptés, et les derniers contrôles et documents sont inclus. Suite web complète : **5 177 tests réussis, 2 ignorés, aucun échec**. Le dépôt à jour décrit les sources ; les nouveaux noms et traductions ne sont pas encore dans un exécutable reconstruit. [Périmètre et vérifications](docs/REPOSITORY_SYNC.md).

PostHog Europe — validation locale du 25 octobre 2026 : **Novera-Desktop 1.0.0 compilé** dans `deliverables/Novera-desktop-1.0.0-2026-10-25_02-59-20-029`, avec la destination Europe configurée. Démarrage et écran Confidentialité vérifiés sur un profil isolé : les deux interrupteurs sont désactivés et le destinataire européen est affiché en français. Un seul rapport synthétique `1.0.0-validation`, envoyé par le même adaptateur dans un harnais Node, est confirmé dans Activity et Error tracking du projet Europe 319433. Aucun consentement du profil utilisateur n’a été modifié. Transport depuis une erreur réelle du WebView non testé. Le lanceur propose maintenant `-WithTelemetry` pour lire le fichier local ignoré par Git ; sans ce paramètre, la destination reste désactivée. Android, mises à jour automatiques et GitHub Actions restent désactivés. Les dernières modifications du lanceur sont incluses dans la synchronisation des sources ; cette compilation reste locale et aucun binaire n’est publié. [Compte rendu et limites](docs/UPDATES_AND_TELEMETRY.md#compilation-desktop-et-validation-europe--25-octobre-2026).

Lanceur terminal renommé en **`novera-agent.sh`**, avec textes Novera et compatibilité du CLI local sous ses noms actuels, y compris `jan.exe` pour Git Bash/MSYS2. L’ancien `jan-agent.sh` est retiré ; le moteur d’agent et le nom interne du binaire restent inchangés. Sources incluses dans la publication de ce renommage ; aucune compilation de l’application.

Logos des sept nouveaux fournisseurs cloud : images officielles de DeepSeek, Kimi, Alibaba Cloud, Cerebras, Together AI, Fireworks AI et Perplexity intégrées localement et raccordées aux avatars existants. 60 tests des utilitaires réussis ; sept fichiers vérifiés et aperçu clair/sombre contrôlé à petite taille. [Provenance et maintenance](docs/PROVIDER_LOGOS.md). Sources et logos inclus dans la publication du 25 octobre 2026 ; aucune nouvelle compilation pour cet ajout.

Nettoyage local du 25 octobre 2026 : **41 dossiers générés et 2 archives supprimés**, soit environ **14,4 Go** de fichiers. Anciennes distributions, copies de runtimes et caches Android expérimentaux retirés ; sources, données, outils installés et rapports conservés. Empreintes des exécutables Desktop protégés et de l’APK actuelle inchangées. [Détail et règles des prochains nettoyages](docs/LOCAL_CLEANUP.md). Aucune compilation ni publication pour ce nettoyage.

Fournisseurs cloud : **18 préréglages**, dont DeepSeek, Kimi, Alibaba Cloud, Cerebras, Together AI, Fireworks AI et Perplexity ajoutés. Sélections de modèles actualisées après vérification des sources officielles le 25 octobre 2026 ; catalogues centralisés et actualisation étendue. Perplexity utilise Responses ; espace de travail Alibaba configurable avec aide dans les 36 langues. [Catalogue, sources et limites](docs/CLOUD_PROVIDERS.md). 57 modèles présélectionnés ; 215 tests ciblés réussis, TypeScript sans émission et contrôle des 36 langues réussis. Sources et documentation incluses dans la publication du 25 octobre 2026 ; aucune nouvelle compilation pour ce lot. Validation des appels réels avec clés API encore ouverte.

Nettoyage de l'identité : ancienne bannière Jan inutilisée retirée de la racine du projet. Les README conservent la bannière Novera ; l'inventaire d'audit est actualisé. Licences et attributions héritées inchangées. Aucune compilation nécessaire.

Chaîne Android intégrée aux sources : **JDK 27.0.1.0.3, SDK 37.2, NDK r30, Gradle 9.8.1, AGP 9.4.0 et Kotlin 2.4.21**. Versions centralisées, options Kotlin modernes, classpath buildSrc aligné et modules Tauri adaptés dans des copies locales générées. APK debug ARM64 assemblées et vérifiées ; intégration au projet principal contrôlée. [Préparation](docs/ANDROID_PREPARATION.md), [versions et procédure](docs/ANDROID_TOOLCHAIN.md). Android reste désactivé dans le BAT ; audits fonctionnels et essais sur téléphone restent ouverts. Présente publication des sources et de la documentation uniquement ; les outils installés et APK restent locaux.

Actualisation du Hub : le filtre porte maintenant le libellé **« Adapté à mon matériel »**, traduit dans les 36 langues pour couvrir les différents appareils. Validation : 42 tests ciblés réussis, contrôle des catalogues sans erreur. Changement local, pas encore compilé ni publié.

| Sujet | État constaté | Référence |
| --- | --- | --- |
| Version des sources | **Novera 1.0.0** | [Frontend](web-app/package.json), [Rust](src-tauri/Cargo.toml), [Tauri](src-tauri/tauri.conf.json) |
| Dépôt officiel | Public et indépendant du réseau de forks de Jan | [TRON-ABS/Novera](https://github.com/TRON-ABS/Novera) |
| Publication des sources | Publication du 25 octobre 2026 : fournisseurs cloud, modèles, sept logos officiels, textes dans les 36 langues et documentation de maintenance/nettoyage. Le retrait de JanBanner est déjà publié au commit **71cdffeacbd07dd7f74c2101a2df8158efa761e2**. Aucun exécutable ou APK inclus | [Historique main](https://github.com/TRON-ABS/Novera/commits/main) |
| Corrections Windows | **35/35 intégrées et incluses dans le build local 1.0.0** | [Registre d’intégration](docs/NOVERA_1_INTEGRATION.md) |
| Dernier exécutable | **Build du 24 octobre 2026**, Windows x64 1.0.0, release LTO fat ; dernières fonctions compilées, démarrage isolé validé ; non signé | [Dossier local](deliverables/Novera-Desktop-local-1.0.0), [preuve de compilation](deliverables/Novera-Desktop-local-1.0.0/BUILD_INFO.md) |
| Langue système au premier démarrage | **Incluse dans le nouveau binaire local** ; français détecté sur profil neuf, choix anglais sauvegardé dans le test puis conservé après redémarrage | [Fonctionnement et validation native](docs/SYSTEM_LANGUAGE.md) |
| Choix manuel de langue | La nouvelle langue choisie par l’utilisateur **remplace la précédente dans la sauvegarde** ; les démarrages suivants utilisent ce dernier choix | [Réglages généraux](web-app/src/hooks/useGeneralSetting.ts) |
| Interface multilingue | **36 locales** ; 18 nouveaux catalogues complets à **1 510 clés** ; Wu partiel à **753 clés** ; relecture native en attente | [Couverture](docs/LANGUAGES.md) |
| Barre de discussion | **Incluse dans le nouveau binaire local** : paramètres avancés, icônes harmonisées, exports et suppression confirmée ; dialogues natifs et interface complète encore à valider | [Fonctionnement et limites](docs/CONVERSATION_CONTROLS.md) |
| Premier modèle recommandé | **LiquidAI LFM2.5-2.6B Q6_K** ; température **0.1**, top-k **50**, pénalité de répétition **1.1**, contexte **32 768 tokens** ; téléchargement par l’utilisateur | [Catalogue](web-app/src/lib/noveraRecommendedModel.ts), [paramètres](extensions/llamacpp-extension/src/novera-model-defaults.ts) |
| Moteur du build local | llama.cpp **b11823 / 0.7.0**, commit `5c19a5a7560024bb19745b4ae04a75613d4b9aa3` | [Épinglage moteur](src-tauri/plugins/tauri-plugin-llamacpp/build.rs) |
| Derniers tests web | Dernière suite complète avant les infobulles : **5 012 réussis, 2 ignorés** ; puis **86 tests ciblés** et TypeScript sans émission réussis pour les infobulles ; voir PR.md pour la validation de publication | [Notes du build](deliverables/Novera-Desktop-local-1.0.0/BUILD_INFO.md) |
| Tests natifs ciblés du build | Validation historique : **96 réussis** sur un build antérieur, non relancés pour le dernier build : 33 conversations et 63 requêtes/MCP. Le lanceur de tests utilise une copie avec manifeste Common-Controls v6 | [Compte rendu local](deliverables/Novera-Desktop-local-1.0.0/BUILD_INFO.md) |
| Limites de validation | Pas de génération complète LFM, de validation graphique exhaustive, de test portable sur PC propre ni de validation manuelle des dialogues natifs d’export/PDF | [Notes du build](deliverables/Novera-Desktop-local-1.0.0/BUILD_INFO.md) |
| Architecture | **Restructuration intégrée aux sources** en six domaines ; règles de conversation, langues, images d’outils et métadonnées moteur extraites, accès système/adaptateurs séparés ; couches historiques encore à migrer progressivement | [Architecture et limites](docs/ARCHITECTURE.md), [carte](architecture/modules.json) |
| Contrôle des frontières | 13 fichiers stricts vérifiés, 7 tests du contrôleur réussis ; les anciennes couches d’intégration ne sont pas certifiées entièrement découplées | [Contrôleur](scripts/check-architecture.mjs) |
| Dépendances | **301 externes directes JS/TS + Rust** : 189 + 112, outils compris ; inventaire détaillé dans les sources | [Versions et périmètre](docs/DEPENDENCIES.md) |
| ZIP portable local actuel | Archive historique : **563 340 637 octets**, 33 fichiers ; antérieure aux dernières corrections, non actualisée par cette compilation | [Dossier du ZIP](deliverables/Novera-Portable-local-1.0.0-build-2026-10-24_03-26-05), [documentation](docs/windows-portable.md) |
| Distribution publique | Aucun exécutable, installateur ou ZIP portable Novera publié | [Versions officielles](OFFICIAL_RELEASES.md) |
| Automatisation | GitHub Actions et mises à jour automatiques **désactivés au dernier contrôle** | [Politique de distribution](OFFICIAL_RELEASES.md) |
| État de ce tableau | Inclus dans la présente mise à jour des sources | Exécutables locaux exclus de la publication |

Les campagnes de tests se recouvrent : ne pas additionner leurs totaux. Les mentions de builds, tests et publications des anciens suivis décrivent leur date, pas nécessairement le présent.

## Travaux restants

| Travail | Situation | Critère de réalisation |
| --- | --- | --- |
| Détection de langue dans le binaire | **Réalisée**, démarrage et conservation d’un choix sauvegardé vérifiés sur profil isolé | Parcours complet du sélecteur de langue via l’interface à vérifier |
| Distribution portable Windows | **#9302 adaptée et intégrée localement** : packager, empreintes, tests et CI manuelle Novera préparée ; ZIP de validation de l’exécutable existant | Nouveau build des dernières sources sur demande, CI réellement exécutée après autorisation, PC propre, génération CPU/GPU et signature avant distribution publique |
| Correctif Linux AppIndicator | Contribution historique **#9346** non intégrée ; absente de Jan main/dev au contrôle du 24 octobre | Intégration séparée, tests et validation Linux/Flatpak réelle |
| Signature et mises à jour | Version locale non signée ; pas de flux Novera indépendant validé | Chaîne de signature/distribution préparée puis autorisée ; ne pas réactiver automatiquement les workflows |
| Langues | 36 catalogues complets à 1 516/1 516 clés ; relecture native en attente | Relecture par locuteurs et maintien des contrôles d’interpolation/RTL |
| Dépendances | Inventaire disponible ; allègement **non réalisé**, aucune dépendance ajoutée ou retirée par la restructuration | Audit des usages réels, doublons, poids et fonctions optionnelles avant toute suppression |
| Poursuite de modularisation | Premières règles pures et adaptateurs séparés ; Factory, transport et grandes routes gardent des couplages historiques | [Limites et étapes suivantes](docs/ARCHITECTURE.md), [suivi](A_FAIRE.md) |
| Version Android / APK | **APK debug ARM64 assemblées localement**, chaîne récente intégrée aux scripts ; fonctionnement sur téléphone et distribution à valider | [Chaîne Android](docs/ANDROID_TOOLCHAIN.md), [étapes et critères](A_FAIRE.md) |
| Documentation locale | Inventaire des dépendances et ce tableau encore locaux | Relecture et publication sur demande du mainteneur |

## Carte des fichiers essentiels

Les chemins partent de la racine du projet. Les dossiers indiquent un ensemble de fichiers à explorer ; les historiques et preuves `.build/` restent locaux.

### Projet, décisions et suivi

| Fichier ou dossier | Rôle dans le développement |
| --- | --- |
| [NOVERA.md](NOVERA.md) | Instructions du projet, identité, préservation des données et limites des opérations autorisées. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Responsabilités des six domaines, extractions réalisées, compatibilité et limites. |
| [architecture/modules.json](architecture/modules.json) | Carte des domaines et règles d’import appliquées aux modules extraits. |
| [A_FAIRE.md](A_FAIRE.md) | Travaux planifiés ; feuille de route Android/APK, étapes et critères avant distribution. |
| [PR.md](PR.md) | Journal chronologique local des contributions, publications, compilations et contrôles. Lire les entrées les plus récentes en premier. |
| [ROADMAP.md](ROADMAP.md) | Mission, orientations et priorités de développement. |
| [README.md](README.md) | Présentation publique principale, capacités et état de validation. |
| [README.fr.md](README.fr.md) | Présentation publique en français. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guide de contribution et environnement de développement. |
| [docs/NOVERA_1_INTEGRATION.md](docs/NOVERA_1_INTEGRATION.md) | Liste des 35 corrections Windows intégrées, adaptations et validation de la version 1.0.0. |
| [docs/UPDATES_2026-10-24.md](docs/UPDATES_2026-10-24.md) | Notes de publication des sources de Novera 1.0.0. |
| [docs/UPDATES_2026-10-23.md](docs/UPDATES_2026-10-23.md) | Notes historiques de la base 0.8.7 et du modèle recommandé. |
| [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md) | Inventaire des dépendances directes et indirectes, contraintes et versions verrouillées. |
| [docs/SYSTEM_LANGUAGE.md](docs/SYSTEM_LANGUAGE.md) | Détection initiale de langue, remplacement de la sauvegarde par le choix manuel et tests. |
| [docs/LANGUAGES.md](docs/LANGUAGES.md) | Couverture réelle des traductions et limites. |
| [docs/language-support.json](docs/language-support.json) | Inventaire mesuré des 36 locales, clés couvertes et provenance. |
| [SUIVI_LANGUES.md](SUIVI_LANGUES.md) | Suivi historique des langues ; les anciennes estimations ne constituent pas une couverture actuelle. |
| [SUIVI_MOTEUR.md](SUIVI_MOTEUR.md) | Suivi local des campagnes moteur et résultats, y compris leurs limites. |
| [Novera_Contributions.txt](Novera_Contributions.txt) | Historique local des contributions et procédures anciennes ; vérifier leur validité avant réutilisation. |

### Configuration, versions et dépendances

| Fichier ou dossier | Rôle dans le développement |
| --- | --- |
| [package.json](package.json) | Commandes de la racine, espaces de travail et gestionnaire Yarn 4.5.3. |
| [yarn.lock](yarn.lock) | Versions JavaScript/TypeScript verrouillées du projet principal. |
| [web-app/package.json](web-app/package.json) | Version de l’interface, dépendances et commandes frontend. |
| [web-app/tsconfig.app.json](web-app/tsconfig.app.json) | Contrôle TypeScript de l’application. |
| [web-app/vite.config.ts](web-app/vite.config.ts) | Construction de l’interface et constantes de plateforme. |
| [src-tauri/Cargo.toml](src-tauri/Cargo.toml) | Version et fonctionnalités natives ; profil release avec LTO fat. |
| [src-tauri/Cargo.lock](src-tauri/Cargo.lock) | Dépendances Rust verrouillées de l’application. |
| [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json) | Identité Novera, version et configuration Tauri commune. |
| [src-tauri/tauri.windows.conf.json](src-tauri/tauri.windows.conf.json) | Fenêtre Windows, ressources et configuration NSIS/MSI. |
| [src-tauri/tauri.linux.conf.json](src-tauri/tauri.linux.conf.json) | Configuration Linux. |
| [src-tauri/tauri.macos.conf.json](src-tauri/tauri.macos.conf.json) | Configuration macOS. |
| [src-tauri/novera-cli/Cargo.toml](src-tauri/novera-cli/Cargo.toml) | Version et dépendances de la CLI ; le nom technique de compatibilité reste jan-cli. |
| [src-tauri/novera-cli/Cargo.lock](src-tauri/novera-cli/Cargo.lock) | Verrou Rust séparé de la CLI. |
| [src-tauri/build.rs](src-tauri/build.rs) | Préparation native de l’application. |
| [src-tauri/capabilities](src-tauri/capabilities) | Permissions Tauri par fenêtre et plateforme. |
| [src-tauri/resources](src-tauri/resources) | Ressources de compilation et moteur ; ne pas confondre avec les données utilisateur. |

### Interface et préférences

| Fichier ou dossier | Rôle dans le développement |
| --- | --- |
| [web-app/src/main.tsx](web-app/src/main.tsx) | Point d’entrée React et installation du routeur. |
| [web-app/src/routes/__root.tsx](web-app/src/routes/__root.tsx) | Structure principale de navigation et fournisseurs de contexte. |
| [web-app/src/providers/ServiceHubProvider.tsx](web-app/src/providers/ServiceHubProvider.tsx) | Initialisation des services, migration et hydratation des préférences avant affichage. |
| [web-app/src/hooks/useGeneralSetting.ts](web-app/src/hooks/useGeneralSetting.ts) | Préférences générales, langue sauvegardée et initialisation de première arrivée. |
| [web-app/src/lib/systemLanguage.ts](web-app/src/lib/systemLanguage.ts) | Détection OS/navigateur et rapprochement des variantes vers les langues prises en charge. |
| [web-app/src/i18n/setup.ts](web-app/src/i18n/setup.ts) | Chargement des traductions, repli, langue et direction du document. |
| [web-app/src/i18n/TranslationContext.tsx](web-app/src/i18n/TranslationContext.tsx) | Application des traductions et de la direction avant affichage. |
| [web-app/src/containers/LanguageSwitcher.tsx](web-app/src/containers/LanguageSwitcher.tsx) | Sélecteur des 36 langues et changement manuel. |
| [web-app/src/locales](web-app/src/locales) | Catalogues de traduction. |
| [web-app/src/types/app.d.ts](web-app/src/types/app.d.ts) | Types globaux, notamment la liste des langues. |
| [web-app/src/hooks/useInterfaceSettings.ts](web-app/src/hooks/useInterfaceSettings.ts) | Préférences visuelles, zoom et notifications. |
| [web-app/src/hooks/useTheme.ts](web-app/src/hooks/useTheme.ts) | Thème et préférence système de couleurs. |
| [web-app/src/lib/backendStorage.ts](web-app/src/lib/backendStorage.ts) | Sauvegarde ordonnée des réglages et protection en cas de lecture impossible. |
| [web-app/src/lib/hydrateStores.ts](web-app/src/lib/hydrateStores.ts) | Chargement, relance et validation de l’hydratation des stores. |
| [web-app/src/lib/migrateLocalStorageSettings.ts](web-app/src/lib/migrateLocalStorageSettings.ts) | Migration des anciens réglages localStorage vers le backend. |
| [web-app/src/constants/localStorage.ts](web-app/src/constants/localStorage.ts) | Clés de stockage à maintenir compatibles. |

### Conversations, modèles, documents et outils

| Fichier ou dossier | Rôle dans le développement |
| --- | --- |
| [web-app/src/containers/ChatInput.tsx](web-app/src/containers/ChatInput.tsx) | Saisie, brouillons, pièces jointes et création de conversations. |
| [web-app/src/routes/threads/$threadId.tsx](web-app/src/routes/threads/$threadId.tsx) | Conversation affichée, historique, reprise et titres. |
| [web-app/src/hooks/useThreads.ts](web-app/src/hooks/useThreads.ts) | État des conversations et suppressions après confirmation du stockage. |
| [web-app/src/hooks/useMessages.ts](web-app/src/hooks/useMessages.ts) | Messages, branches et ordre de persistance. |
| [web-app/src/stores/chat-session-store.ts](web-app/src/stores/chat-session-store.ts) | Sessions de chat et état des conversations en arrière-plan. |
| [web-app/src/lib/custom-chat-transport.ts](web-app/src/lib/custom-chat-transport.ts) | Transport, orchestration des tours et outils. |
| [web-app/src/lib/model-factory.ts](web-app/src/lib/model-factory.ts) | Création des modèles fournisseurs, flux et statistiques propres aux conversations. |
| [web-app/src/lib/sseEventTypeFilter.ts](web-app/src/lib/sseEventTypeFilter.ts) | Filtrage des événements SSE et fins de lignes. |
| [web-app/src/lib/thread-title-summarizer.ts](web-app/src/lib/thread-title-summarizer.ts) | Titres générés avec le modèle de la conversation propriétaire. |
| [web-app/src/hooks/useModelProvider.ts](web-app/src/hooks/useModelProvider.ts) | Fournisseurs, modèles, migrations et suppressions propres au fournisseur. |
| [web-app/src/hooks/useFavoriteModel.ts](web-app/src/hooks/useFavoriteModel.ts) | Favoris propres au fournisseur et migration des anciens favoris. |
| [web-app/src/lib/noveraRecommendedModel.ts](web-app/src/lib/noveraRecommendedModel.ts) | Catalogue fixe du premier modèle LFM2.5 Q6_K. |
| [web-app/src/hooks/useLatestJanModel.ts](web-app/src/hooks/useLatestJanModel.ts) | Chargement et persistance de la recommandation Novera ; nom interne hérité. |
| [extensions/llamacpp-extension/src/novera-model-defaults.ts](extensions/llamacpp-extension/src/novera-model-defaults.ts) | Préréglage LFM : température 0.1, top-k 50, répétition 1.1, contexte 32768. |
| [extensions/llamacpp-extension/src/index.ts](extensions/llamacpp-extension/src/index.ts) | Import, configuration et intégration du moteur local. |
| [extensions/assistant-extension/src/index.ts](extensions/assistant-extension/src/index.ts) | Assistant intégré, paramètres et migrations. |
| [extensions/conversational-extension](extensions/conversational-extension) | Persistance et API des conversations. |
| [extensions/download-extension](extensions/download-extension) | Téléchargement des modèles. |
| [extensions/rag-extension](extensions/rag-extension) | Intégration de la recherche documentaire. |
| [web-app/src/lib/attachmentProcessing.ts](web-app/src/lib/attachmentProcessing.ts) | Préparation des documents et budget de contexte. |
| [web-app/src/lib/tool-image-sentinel.ts](web-app/src/lib/tool-image-sentinel.ts) | Normalisation des images renvoyées par les outils. |
| [web-app/src/hooks/useAttachmentIngestionPrompt.ts](web-app/src/hooks/useAttachmentIngestionPrompt.ts) | File des choix d’ingestion concurrente. |
| [web-app/src/hooks/useToolApprovalRequests.ts](web-app/src/hooks/useToolApprovalRequests.ts) | Autorisations liées à leur conversation et appel. |
| [web-app/src/lib/tool-approval-key.ts](web-app/src/lib/tool-approval-key.ts) | Clés des autorisations d’outils. |
| [web-app/src/containers/RenderMarkdown.tsx](web-app/src/containers/RenderMarkdown.tsx) | Affichage Markdown et préservation du code. |
| [web-app/src/components/MarkdownTable.tsx](web-app/src/components/MarkdownTable.tsx) | Affichage et export des tableaux. |
| [web-app/src/components/ai-elements/code-block.tsx](web-app/src/components/ai-elements/code-block.tsx) | Surlignage et repli sûr du code. |
| [web-app/src/services](web-app/src/services) | Services frontend : conversations, modèles, fournisseurs, fichiers, MCP et autres interfaces. |

### Backend natif, moteur et agents

| Fichier ou dossier | Rôle dans le développement |
| --- | --- |
| [src-tauri/src/main.rs](src-tauri/src/main.rs) | Entrée de l’exécutable Windows Novera-Desktop. |
| [src-tauri/src/lib.rs](src-tauri/src/lib.rs) | Assemblage Tauri, plugins, démarrage et cycle de vie. |
| [src-tauri/src/core/mod.rs](src-tauri/src/core/mod.rs) | Carte des modules natifs et conditions de compilation. |
| [src-tauri/src/core/setup.rs](src-tauri/src/core/setup.rs) | Initialisation native, migrations et tray. |
| [src-tauri/src/core/app/commands.rs](src-tauri/src/core/app/commands.rs) | Chemins et configuration des données de l’application. |
| [src-tauri/src/core/threads/commands.rs](src-tauri/src/core/threads/commands.rs) | Commandes natives des conversations et remontée des erreurs de suppression. |
| [src-tauri/src/core/server/proxy.rs](src-tauri/src/core/server/proxy.rs) | Proxy de l’API locale et traitement des requêtes. |
| [src-tauri/src/core/agent/loop.rs](src-tauri/src/core/agent/loop.rs) | Boucle d’orchestration des agents. |
| [src-tauri/src/core/agent/upstream.rs](src-tauri/src/core/agent/upstream.rs) | Requêtes fournisseurs et dédoublonnage des définitions MCP selon le routage. |
| [src-tauri/src/core/agent/project.rs](src-tauri/src/core/agent/project.rs) | Contexte projet et résolution des instructions. |
| [src-tauri/src/core/agent/skills.rs](src-tauri/src/core/agent/skills.rs) | Chargement des compétences et guides. |
| [src-tauri/src/core/agent/secrets.rs](src-tauri/src/core/agent/secrets.rs) | Gestion et masquage des secrets ; ne jamais mettre de vrais identifiants dans le tableau de bord. |
| [src-tauri/plugins/tauri-plugin-agent-tools/src/default_novera_skill.md](src-tauri/plugins/tauri-plugin-agent-tools/src/default_novera_skill.md) | Guide intégré des outils Novera. |
| [src-tauri/plugins/tauri-plugin-llamacpp/build.rs](src-tauri/plugins/tauri-plugin-llamacpp/build.rs) | Version épinglée et compilation du moteur llama.cpp. |
| [src-tauri/plugins/tauri-plugin-llamacpp/src/engine/commands.rs](src-tauri/plugins/tauri-plugin-llamacpp/src/engine/commands.rs) | Commandes moteur et version du worker installé. |
| [src-tauri/plugins/tauri-plugin-llamacpp/src/bin/jan-llama-worker.rs](src-tauri/plugins/tauri-plugin-llamacpp/src/bin/jan-llama-worker.rs) | Exécutable worker ; nom de compatibilité conservé. |
| [src-tauri/plugins/tauri-plugin-llamacpp/shim/jan_llama_shim.cpp](src-tauri/plugins/tauri-plugin-llamacpp/shim/jan_llama_shim.cpp) | Interface native du moteur. |
| [src-tauri/build-utils](src-tauri/build-utils) | Préparation, construction et signature du moteur selon la plateforme. |
| [src-tauri/utils](src-tauri/utils) | Utilitaires Rust partagés. |
| [core](core) | Contrats TypeScript et interfaces d’extensions. |
| [packages/adk](packages/adk) | SDK TypeScript agent. |
| [adk/python/pyproject.toml](adk/python/pyproject.toml) | Configuration du SDK Python. |

### Tests, compilation et publication

| Fichier ou dossier | Rôle dans le développement |
| --- | --- |
| [vitest.config.ts](vitest.config.ts) | Configuration des projets de tests. |
| [web-app/vitest.config.ts](web-app/vitest.config.ts) | Configuration Vitest de l’interface. |
| [web-app/src/test/setup.ts](web-app/src/test/setup.ts) | Mocks et préparation des tests web. |
| [web-app/src/lib/__tests__/systemLanguage.test.ts](web-app/src/lib/__tests__/systemLanguage.test.ts) | Correspondances de langues et repli après échec de détection OS. |
| [web-app/src/hooks/__tests__/useGeneralSetting.language.test.ts](web-app/src/hooks/__tests__/useGeneralSetting.language.test.ts) | Première arrivée, sauvegarde, redémarrage et priorité du choix manuel. |
| [web-app/src/lib/__tests__/backendStorage.hydration.test.ts](web-app/src/lib/__tests__/backendStorage.hydration.test.ts) | Protection des préférences après erreur de lecture. |
| [web-app/src/lib/__tests__/backendStorage.ordering.test.ts](web-app/src/lib/__tests__/backendStorage.ordering.test.ts) | Ordre des lectures/écritures et protection des sauvegardes engagées. |
| [src-tauri/src/core/threads/tests.rs](src-tauri/src/core/threads/tests.rs) | Tests natifs des conversations. |
| [scripts/check-novera-locales.py](scripts/check-novera-locales.py) | Vérification des locales, clés et inventaire documenté. |
| [e2e/package.json](e2e/package.json) | Dépendances et commandes des tests de bout en bout. |
| [autoqa/requirements.txt](autoqa/requirements.txt) | Outils Python des tests automatisés. |
| [.github/workflows](.github/workflows) | Workflows hérités ; Actions est désactivé au dernier contrôle. |
| [.github/workflows/template-tauri-build-windows-x64.yml](.github/workflows/template-tauri-build-windows-x64.yml) | Chaîne Windows héritée de publication, non appelée par la nouvelle CI portable manuelle. |
| [scripts/download-bin.mjs](scripts/download-bin.mjs) | Téléchargement des auxiliaires ; contrôler les origines avant une distribution. |
| [scripts/check-update-feeds.mjs](scripts/check-update-feeds.mjs) | Vérification des flux de mise à jour. |
| [BRANDING.md](BRANDING.md) | Identité Novera et usages officiels. |
| [OFFICIAL_RELEASES.md](OFFICIAL_RELEASES.md) | Politique des versions officielles. |
| [.github/CODEOWNERS](.github/CODEOWNERS) | Responsabilité de revue. |
| [LICENSE](LICENSE) | Licence Apache conservée. |

### Modules extraits et adaptateurs

| Chemin | Responsabilité |
| --- | --- |
| [web-app/src/modules/interface](web-app/src/modules/interface) | Correspondance des langues sans accès au système. |
| [web-app/src/modules/conversations](web-app/src/modules/conversations) | Conversion des messages, branches, contexte et nettoyage des titres. |
| [web-app/src/modules/engines](web-app/src/modules/engines) | Contrats et métadonnées moteur, observateur injecté. |
| [web-app/src/modules/tools](web-app/src/modules/tools) | Encodage des images de résultats MCP. |
| [web-app/src/modules/platform](web-app/src/modules/platform) | Lecture des préférences du navigateur et de la locale native. |
| [web-app/src/adapters/interface/engine-progress.ts](web-app/src/adapters/interface/engine-progress.ts) | Liaison des événements moteur vers l’état UI de la bonne conversation. |
| [scripts/distribution](scripts/distribution) | Contrôles de distribution hors runtime applicatif. |
| [scripts/check-architecture.mjs](scripts/check-architecture.mjs) | Contrôle hors réseau des frontières d’import. |
| [scripts/__tests__/architecture.test.mjs](scripts/__tests__/architecture.test.mjs) | Régressions contre les couplages interdits. |

## Commandes utiles

Exécuter depuis la racine. Ce sont des repères, pas des actions lancées automatiquement. Le gestionnaire déclaré est **Yarn 4.5.3** ; le minimum Rust déclaré par le projet est **1.88**. Le build Windows local validé a utilisé Rust **1.98 MSVC**.

| Besoin | Commande | Précision |
| --- | --- | --- |
| Vérifier les frontières | `yarn check:architecture` | Modules déjà extraits, chemins et imports |
| Tester le contrôleur | `yarn test:architecture` | Sept scénarios de dépendances et accès globaux interdits |
| Tests de l’interface | `yarn test:web` | Sans compilation de l’exécutable natif |
| Tests du core | `yarn test:core` | Projet de tests TypeScript core |
| Tests des extensions | `yarn test:ext` | Extensions sélectionnées par la configuration Vitest |
| Contrôle de types sans émission | `node web-app/node_modules/typescript/bin/tsc --noEmit -p web-app/tsconfig.app.json` | Utilise le TypeScript du workspace frontend |
| Contrôle des langues | `python scripts/check-novera-locales.py` | Compare catalogues, types, sélecteur et inventaire documenté |
| Interface de développement | `yarn dev:web` | Mode navigateur ; ne valide pas tous les accès natifs Tauri |
| Compiler l’interface | `yarn build:web` | TypeScript puis Vite ; seulement si la tâche autorise une compilation |
| Compiler les extensions | `yarn build:extensions` | Core puis extensions |
| Générer les icônes | `yarn build:icon` | Écrit des fichiers générés |

Les scripts génériques de compilation de [package.json](package.json) peuvent télécharger des auxiliaires et utiliser des workflows hérités. La procédure locale validée est répertoriée ci-dessous ; ne pas assimiler cette compilation locale à une distribution publique reproductible. Les tests natifs nécessitent le toolchain et le runtime appropriés ; l’ajout du manifeste a concerné uniquement une copie du lanceur de tests.

## Exécutable et preuves locales

**Cette section contient des chemins locaux, souvent ignorés par Git.** Ils peuvent ne pas exister dans un autre clone ni sur GitHub. Aucun journal privé ou binaire n’est automatiquement destiné à la publication.

| Ressource locale | Usage |
| --- | --- |
| [deliverables/Novera-Desktop-local-1.0.0/Novera-Desktop.exe](deliverables/Novera-Desktop-local-1.0.0/Novera-Desktop.exe) | Dernier binaire validé, antérieur à la détection de langue système. |
| [deliverables/Novera-Desktop-local-1.0.0/README.md](deliverables/Novera-Desktop-local-1.0.0/README.md) | Lancement et obligation de conserver resources, bun.exe et uv.exe. |
| [deliverables/Novera-Desktop-local-0.8.7/Novera-Desktop.exe](deliverables/Novera-Desktop-local-0.8.7/Novera-Desktop.exe) | Ancien binaire conservé ; ne pas le présenter comme la dernière version. |
| [.build/novera-v1-local-2026-10-23/build.ps1](.build/novera-v1-local-2026-10-23/build.ps1) | Procédure locale Windows validée ; chemins et toolchain propres à cette machine, sortie pouvant être remplacée lors d’un nouveau build. |
| [.build/novera-v1-local-2026-10-23/smoke.ps1](.build/novera-v1-local-2026-10-23/smoke.ps1) | Contrôle de démarrage dans un profil isolé ; protège une application déjà ouverte. |
| [.build/novera-v1-local-2026-10-23/verification.json](.build/novera-v1-local-2026-10-23/verification.json) | Compilation, démarrage, ressources et limites de validation. |
| [.build/novera-v1-local-2026-10-23/native-tests-final.json](.build/novera-v1-local-2026-10-23/native-tests-final.json) | Résultat des deux campagnes natives ciblées après adaptation du lanceur. |
| [.build/novera-system-language-2026-10-24/verification.json](.build/novera-system-language-2026-10-24/verification.json) | 4 937 tests web, contrôles de langue et contrôle de types. |
| [.build/novera-language-publication-2026-10-24/verification.json](.build/novera-language-publication-2026-10-24/verification.json) | Publication b8e8c81, état Actions et absence de nouveau binaire. |
| [.build/dependency-inventory-2026-10-24/verification.json](.build/dependency-inventory-2026-10-24/verification.json) | Comptage des dépendances et vérification des liens de l’inventaire. |
| [.build/dependency-inventory-2026-10-24/generate.py](.build/dependency-inventory-2026-10-24/generate.py) | Générateur local de l’inventaire ; nécessite PyYAML dans l’environnement de travail. |
| [.build/jan-linux-ci-audit-2026-10-24/verification.json](.build/jan-linux-ci-audit-2026-10-24/verification.json) | Contrôle daté des deux correctifs Linux/portable dans Jan main/dev. |

Empreinte du dernier exécutable local 1.0.0 :

```text
20D6D569802B435E9DF66F618FB94C14F1F28262DA4CF47593BD42E47BD8B35C
```

Sauvegarde avant restructuration : [dossier horodaté](deliverables/Novera-Desktop-local-1.0.0-sauvegarde-2026-10-24_02-14-10), 2026-10-24T02:14:10.004287+02:00 ; **32 fichiers, 1 086 921 999 octets**, empreintes SHA-256 vérifiées. L’exécutable original reste inchangé. Cette copie est locale et n’est pas destinée à GitHub.

## Règles de maintenance du tableau

1. **Commencer ici**, puis lire [NOVERA.md](NOVERA.md) et la partie concernée. Vérifier la dernière entrée de [PR.md](PR.md) pour le contexte récent.
2. Après un changement significatif, mettre à jour **État actuel** et **Travaux restants** avec la date réelle et un lien vers la preuve ou le document détaillé.
3. Distinguer systématiquement **sources locales**, **sources publiées**, **exécutable compilé**, **validation exécutée** et **version distribuée**. Une étape ne prouve pas les suivantes.
4. Conserver les résultats négatifs et les limites ; ne pas remplacer une validation manquante par une estimation ou une compilation précédente.
5. Après une compilation, noter version, empreinte, chemin du livrable, périmètre des tests et différences encore absentes du binaire. Après une publication, vérifier le commit distant et noter son lien.
6. Après un ajout de dépendance ou de langue, actualiser les inventaires spécialisés et leurs comptes ; ce tableau reste un résumé.
7. Ne jamais y copier de tokens, clés privées, conversations ou données utilisateur. Préserver licences et attributions.
8. Ne pas transformer une ancienne autorisation en tâche permanente : suivre la demande actuelle du mainteneur pour compilation, publication, migration, suppression et activation de workflows.

## Repères de distribution et d’identité

- Dépôt officiel : [TRON-ABS/Novera](https://github.com/TRON-ABS/Novera).
- Historique hérité : [TRON-ABS/Novera-Jan-archive](https://github.com/TRON-ABS/Novera-Jan-archive). Ne pas le fusionner automatiquement dans l’historique indépendant de Novera.
- Les noms techniques Jan conservés pour la compatibilité ne doivent pas être remplacés globalement sans adapter leurs consommateurs.
- Le changement de marque ne change pas la propriété du code hérité : consulter [LICENSE](LICENSE), [BRANDING.md](BRANDING.md) et [OFFICIAL_RELEASES.md](OFFICIAL_RELEASES.md).

## Commandes de discussion — 24 octobre 2026

Les paramètres avancés sont masqués par défaut. Les icônes Web Search, Shell et Raisonnement partagent leur style ; les capacités et protections existantes sont conservées. À droite, la disquette propose Markdown, TXT, JSON, HTML, CSV et l’impression/PDF ; la corbeille supprime uniquement la discussion confirmée et revient à une saisie vide, avec nouvelle identité/titre au prochain envoi. Les erreurs et changements de navigation conservent le nouveau brouillon éventuel.

| Fichier essentiel | Rôle |
| --- | --- |
| [ConversationActions.tsx](web-app/src/containers/ConversationActions.tsx) | Commandes de sauvegarde, confirmation de suppression et remise à zéro. |
| [export.ts](web-app/src/modules/conversations/export.ts) | Sérialisation pure ; branche visible pour les formats lisibles, toutes les versions dans le JSON. |
| [conversation-files.ts](web-app/src/adapters/platform/conversation-files.ts) | Dialogue natif, téléchargement navigateur et impression/PDF. |
| [SamplerPopover.tsx](web-app/src/containers/SamplerPopover.tsx) | Accès avancé et retour aux valeurs du modèle. |
| [CONVERSATION_CONTROLS.md](docs/CONVERSATION_CONTROLS.md) | Comportement, portée des données et validations encore nécessaires. |

Validation : **4 975 tests web réussis, 2 ignorés**, TypeScript sans émission, 12 fichiers aux frontières d’architecture, 7 tests du contrôleur, 36 catalogues et traitement des styles Tailwind réussis. Preuves : `.build/composer-actions-2026-10-24/verification.json`. Aucune compilation applicative, publication ou suppression de discussion réelle. L’exécutable et sa sauvegarde gardent le SHA-256 `20D6D569802B435E9DF66F618FB94C14F1F28262DA4CF47593BD42E47BD8B35C`. L’enregistrement natif et l’impression WebView2 restent à vérifier dans le prochain build autorisé.

## Windows portable / contribution #9302 — 24 octobre 2026

Adaptation Novera de notre contribution : scripts de packaging et tests, sans nouvelle dépendance. Le ZIP conserve ses ressources, ses auxiliaires, les licences et les règles de versions officielles ; les données restent dans le profil utilisateur normal. Les noms stable/beta/nightly, la structure ZIP, les empreintes et l’exclusion des fichiers privés sont contrôlés.

| Fichier essentiel | Rôle |
| --- | --- |
| [scripts/package-windows-portable.ps1](scripts/package-windows-portable.ps1) | Commande compatible, également exposée par `yarn package:portable:win32`. |
| [scripts/distribution/package-windows-portable.ps1](scripts/distribution/package-windows-portable.ps1) | Assemblage vérifié, inventaire et empreintes ; aucune compilation ni publication par ce script. |
| [scripts/tests/package-windows-portable.Tests.ps1](scripts/tests/package-windows-portable.Tests.ps1) | 223 assertions et 12 scénarios, exécutés sous PowerShell 5.1 et 7. |
| [.github/workflows/manual-build-portable.yml](.github/workflows/manual-build-portable.yml) | Workflow Novera manuel, sources choisies, accès en lecture, sans secrets ni release. Préparé avec autorisation explicite ; aucun lancement. |
| [.github/workflows/windows-portable-tests.yml](.github/workflows/windows-portable-tests.yml) | Tests de packaging manuels sur les deux PowerShell. |
| [docs/windows-portable.md](docs/windows-portable.md) | Usage, CI, périmètre du ZIP et validations encore nécessaires. |

Le ZIP local de validation provient du build existant du **23 octobre 2026**. Aucun nouveau build applicatif ni envoi GitHub. Son SHA-256 est `477132753a9c3e29cac4f522ce114f4c20f48ed187ee1b5cf45baa8d852d7f75`. Les 33 fichiers ZIP et 32 fichiers de l’original/sauvegarde sont vérifiés ; le démarrage du ZIP extrait tient 10 secondes avec titre Novera, profil isolé et PATH sans outils de développement. Aucun modèle chargé ni message envoyé.

Actionlint et cinq scénarios de préparation CI réussis ; les permissions sont limitées à la lecture, sans secrets, release ou déclencheur automatique. Les configurations produit/Cargo sont strictement identiques à leurs copies avant test après correction d’un problème d’isolation PowerShell. Les binaires et données utilisateur sont préservés. Actions n’est pas réactivé ; la signature, l’exécution CI et la validation sur PC propre restent à faire. Preuves : `.build/novera-portable-2026-10-24/verification.json`.

## Nouvelle compilation locale — 24 octobre 2026

Les dernières sources sont compilées en **Novera 1.0.0 Windows x64**, avec LTO fat. L’exécutable courant contient désormais la détection de langue, la restructuration et les commandes récentes de discussion. **4 975 tests web réussis, 2 ignorés**, TypeScript et architecture validés ; extensions, icônes, interface et Rust release compilés.

- Exécutable : [Novera-Desktop.exe](deliverables/Novera-Desktop-local-1.0.0/Novera-Desktop.exe), **59 411 456 octets**, SHA-256 `B682ADF50B626792CFBFA729C4D06B178D7A46B47FCB73063693A21B1C84D55B`.
- ZIP courant : [Novera_1.0.0_x64-portable.zip](deliverables/Novera-Portable-local-1.0.0-build-2026-10-24_03-26-05/Novera_1.0.0_x64-portable.zip), **563 340 637 octets**, SHA-256 `00377ea53501acfd30e78ed8cfafd8989e87514e9728877462feffda66c442ca`.
- Sauvegarde complète : [Novera-Desktop-local-1.0.0-sauvegarde-2026-10-24_03-26-05](deliverables/Novera-Desktop-local-1.0.0-sauvegarde-2026-10-24_03-26-05), 32 fichiers vérifiés.

Démarrage natif testé sur profil isolé : français détecté, préférence anglaise simulée dans le stockage conservée au redémarrage. Les 29 fichiers du moteur/ressources/auxiliaires restent identiques ; seuls l’exécutable et ses deux documents ont été remplacés dans le dossier courant. Aucun modèle chargé ni message envoyé. Le ZIP extrait est contrôlé séparément. Le PC propre, l’inférence CPU/GPU et les dialogues natifs d’export/PDF restent à valider. Aucune signature, release distante, activation d’Actions ou exécution de workflow. Preuves : `.build/novera-local-build-2026-10-24_03-26-05/verification.json`.

Les paragraphes précédents conservent leurs dates et leur état historique ; les lignes « État actuel » ci-dessus font référence à ce nouveau build.

## Actualisation des commandes, mises à jour et statistiques — 24 octobre 2026

Dernier exécutable local : SHA-256 `4549FBB7B893BED432F02942B2F89B2F190D8C3833FD673DDFC1BF0D4F96BF9C`, 59 540 480 octets, démarrage isolé vérifié. Les infobulles et statistiques suivent les 36 langues ; recherche Internet activée par défaut avec préférence enregistrée conservée. Menu de sauvegarde fermé au clic extérieur et protocole outil brut filtré. La chaîne de mises à jour signées et les statistiques avec consentement sont préparées, sans clé de production, sans destination statistique et sans activation. Voir docs/UPDATES_AND_TELEMETRY.md. Aucun exécutable, ZIP ou installateur publié ; workflows non modifiés dans cette publication.

Validation de la présente publication sur la base main et les seules sources sélectionnées : **5 053 tests web réussis, 2 ignorés**, TypeScript sans émission réussi, 36 catalogues sans erreur, 13 fichiers sans violation de frontière, 10 tests Node réussis et 223 assertions de packaging réussies (12 scénarios). Cette validation remplace les anciens totaux de publication ; aucune CI distante exécutée.

## Nouveau Hub compilé — 24 octobre 2026

Le dernier exécutable inclut la [découverte des petits modèles](docs/HUB_DISCOVERY.md), les tris et filtres par taille, la comparaison de trois modèles et le test local, dans les 36 langues. Build : 59610112 octets, SHA-256 `F68F779BF51E1B48BB066B49B1DED84207CC13A65619A09FA912B8D321C10795`, démarrage isolé vérifié. Le ZIP historique ne correspond pas à ce build. Validation actuelle : 5 103 tests web réussis, 2 ignorés ; 72 ciblés, TypeScript et langues réussis. Les campagnes se recouvrent et ne s’additionnent pas. Le binaire du nouveau Hub reste local ; les sources sont incluses dans la présente publication. Publication précédente : [d126f1f](https://github.com/TRON-ABS/Novera/commit/d126f1f52f92817622bb44810e02c1ab6e93a09d). Aucun benchmark matériel des six modèles exécuté ; aucun poids téléchargé.

## Lanceur local et future APK — 24 octobre 2026

**Historique de la première préparation.** Pour l'état actuel des versions intégrées et des APK locales vérifiées, consulter [ANDROID_TOOLCHAIN.md](docs/ANDROID_TOOLCHAIN.md).

[Mode d’emploi du BAT](docs/LOCAL_BUILD_LAUNCHER.md) : C:\msys64\home\jmsga\Compiler-Novera.bat ; seule la cible desktop est activée. [Préparation Android](docs/ANDROID_PREPARATION.md) : diagnostic et entrée APK ARM64 désactivée, environnement et adaptation encore incomplets. Les ressources seules ne constituent pas le projet Gradle. 65 assertions réussies sur chacun des deux hôtes PowerShell ; aucune compilation, installation ou publication dans cette préparation. L’exécutable du Hub reste inchangé.
