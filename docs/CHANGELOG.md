# Novera — historique consolidé

Les entrées ci-dessous décrivent des étapes datées. Elles ne remplacent pas [l’état courant des sources et du binaire](../TABLEAU_DE_BORD_NOVERA.md). Les journaux bruts, caches et exécutables restent locaux.

<a id="history"></a>

## 25 octobre 2026 — documentation regroupée

Les **36 Markdown principaux** de la racine et du premier niveau de `docs` sont regroupés en **14 documents** : deux présentations, tableau de bord, feuille de route, instructions, contribution, revue courante, deux politiques et cinq références dans `docs`. Les références techniques imbriquées, licences, notices et README de sous-projets restent à leur place.

Les anciens journaux par tâche et le journal texte redondant sont remplacés par ce relevé, la feuille de route et les guides thématiques. L’ancien inventaire de dépendances incluait le site Jan supprimé ; les manifestes/verrous deviennent la référence courante. Les 100 lignes de la feuille de route des langues et les 35 corrections ci-dessous sont conservées.

Aucune compilation, modification de profil, activation de CI ni publication de binaire pour cette restructuration.

## 25 octobre — premier démarrage et derniers contrôles de sources

Commit [0765c3b](https://github.com/TRON-ABS/Novera/commit/0765c3b1766ccb52905f876ef149e55e260c4b50) : DSpark Q8_0 facultatif pour LFM2.5-2.6B desktop, explication RAM/VRAM/contexte et demande indépendante Autoriser/Refuser pour les erreurs. Trois nouvelles clés dans les 36 locales : 1 516 clés chacune. Dernière suite web complète : **5 187 réussis, 2 ignorés** ; TypeScript sans émission, contrôle des langues, sept tests d’architecture et 13 modules sans violation. Les appels réseau des tests sont simulés. Aucun nouveau build applicatif.

## 25 octobre — langues, identité interne et nettoyage

Wu complété par 757 entrées puis 16 catalogues hérités par 9 219 traductions ; relecture native ouverte. Les comptes 1 513 de leurs [rapports](../deliverables/locale-completion-2026-10-25/report.md) sont ceux de cette étape. Les textes ultérieurs portent le total à 1 516.

Les composants propres au projet deviennent `novera-llama-worker`, `novera_llama_shim`, 17 fonctions FFI et modules `useNovera…`. Compatibilité de stockage, variables de construction et identité des véritables fournisseurs Jan conservées. Contrôles de cette étape : 234 tests web, TypeScript, 223 assertions portable/12 scénarios, trois tests de ressources Rust en harnais isolé, en-tête C/C++ et concordance des 17 symboles. Aucune liaison complète de moteur ni mise à niveau réelle validée.

Retrait de 762 chemins de l’ancien site Jan (environ 244 Mio de sources), anciens installateurs pointant `delta.jan.ai`, recette Flatpak Jan 0.8.5 et workflows associés. Les références CLI/protocole sont conservées dans `docs/agent`, avec leurs exemples ADK. Licences et ressources de fournisseurs réellement utilisés restent présentes. Un nettoyage local distinct avait retiré environ 14,4 Go d’artefacts reproductibles, en conservant sources, données, outils de référence et preuves. Ses anciens chemins d’artefacts ne garantissent plus leur disponibilité.

Les catalogues cloud et sept logos officiels ont été actualisés d’après les sources relevées le 25 octobre, sans utiliser de clé utilisateur ni effectuer d’inférence payante. Leur provenance est dans [Développement](DEVELOPMENT.md#logos), les limites et la maintenance dans [le guide utilisateur](USER_GUIDE.md#cloud).

## 25 octobre, 02:59 — dernier build Desktop et essai Europe

Construction web/Rust release locale, dossier `deliverables/Novera-desktop-1.0.0-2026-10-25_02-59-20-029`, EXE **60 113 408 octets**, SHA-256 `3EA0AB5571BF9EFEDF2584C0EE5D4DEAD87B8E12CA4E94AB2A9EC04A2A19B426`. Ancienne distribution conservée. Démarrage dans un profil et WebView2 isolés : confidentialité en français, destination Europe et deux interrupteurs désactivés. Aucun choix du profil habituel modifié.

Un harnais Node utilisant l’adaptateur a envoyé un unique `$exception` synthétique (`1.0.0-validation`), sans son message sentinelle brut. Réponse Europe HTTP 200, réception puis regroupement Error tracking constatés dans le projet **319433**, une occurrence. Le précontrôle CORS acceptait `http://tauri.localhost`. Cela ne valide pas le transport depuis le WebView ; aucune erreur volontaire dans l’application ni événement de démarrage utilisateur envoyé. Preuve locale : `.build/posthog-desktop-validation-2026-10-25/validation.json`.

Le lecteur de configuration et `-WithTelemetry` sont ensuite publiés dans les sources, avec 16 assertions de sécurité et 69 assertions du lanceur, sans nouveau build ou rapport réel. La configuration locale et les jetons sont exclus. Ce build précède les derniers renommages, compléments de langues et options DSpark/consentement.

## 24 octobre — bureau, Hub, Android et portable

Commandes de discussion, exports filtrés, suppression confirmée, langue système persistée, infobulles/dates/statistiques localisées, recherche web avec préférence conservée, filtrage du protocole brut et fermeture du menu au clic extérieur. Plusieurs builds isolés ont été contrôlés à leurs étapes respectives. Les comptes historiques de tests ne sont pas ceux des dernières sources.

Hub : six petits GGUF épinglés, estimation mémoire, tri, comparaison et test local annulable. La suite de cette étape comptait **5 103 réussis, 2 ignorés**. Le packaging portable #9302 a été adapté, testé sur fixtures (223 assertions/12 scénarios), extrait et démarré en profil isolé ; PC propre, signature et runner distant restent séparés.

Android : chaîne JDK 27.0.1.0.3 / SDK 37.2 / NDK r30 / Gradle 9.8.1 / AGP 9.4.0 / Kotlin 2.4.21. APK debug ARM64 **50 408 405 octets**, SHA-256 `B3355AE6AC41F289F3894FD9CFAE1E646E8D8459FA823719BA426E410C25E8A8`. Contrôles manifeste, six bibliothèques natives, signature debug et alignement 16 Kio. Trois tests de configuration et 70 assertions sous PowerShell 5.1 et 7. Preuve locale : `.build/android-toolchain-integration-2026-10-24/verification.json`. Ces résultats ne valident ni téléphone, ni signature de production, ni les changements postérieurs ; les trois audits restent ouverts.

Architecture : séparation progressive de six responsabilités, règles pures et adaptateurs, contrôle de frontières. Une sauvegarde antérieure avait été comparée par SHA-256 avant refonte. Les anciennes formulations « non compilé » ou « uniquement local » dans les journaux décrivent leur étape, pas l’état final des sources publiées.

## 23 octobre — fondation de Novera 1.0.0

Intégration des 35 corrections Windows ci-dessous, puis compilation locale autorisée. Build historique `Novera-Desktop-local-1.0.0`, SHA-256 `20D6D569802B435E9DF66F618FB94C14F1F28262DA4CF47593BD42E47BD8B35C`. Démarrage isolé, 33 tests natifs conversations et 63 MCP/requêtes réussis ; le harnais de tests comportait un manifeste Common-Controls v6, sans modifier l’EXE produit. Ce build n’est plus le dernier. La publication des sources a ensuite été autorisée le 24 octobre, sans binaire public.

<a id="engine-history"></a>

## 22–23 octobre — campagnes moteur historiques

M01–M04 ont été implémentés puis testés localement, sur Tron-v1-Q6_K (LFM2 2,7B) et RTX 5070 Laptop 8 151 Mio, puis sur d’autres scénarios CUDA/Intel. Les premières campagnes utilisaient b11721 ; le déploiement suivant et sa calibration utilisaient b11823. Ces chiffres ne sont ni des promesses pour DSpark ni des mesures du dernier arbre source ; les gains de scénarios différents ne s’additionnent pas.

| Priorité | ID | Amélioration possible | Preuve disponible | État |
| --- | --- | --- | --- | --- |
| 1 | M02 | Charger les modèles hors du verrou global du registre | A déjà prêt : premier token à 37 ms normalement, 930 ms pendant le chargement de B | Implémenté : 930 → 34 ms pendant B ; contrôles natifs réussis |
| 2 | M03 | Choisir batch/microbatch selon le modèle, le GPU et la mémoire disponible | À 8 192 tokens : 512/512 → 2 048/2 048 réduit le TTFT de 15,2 %, avec +282 MiB observés | Profil mesuré volontaire + repli manuel ; UI réelle testée ; hydratation des modes corrigée |
| 3 | M01 | Garder plusieurs conversations récentes dans des slots résidents, avec repli disque | À 8 192 tokens : 20 ms en mémoire, 187 ms via disque, 1 586 ms par recalcul | Affinité bornée et repli disque ; 219 → 43 ms avec deux slots |
| 4 | M04 | Réserver la spéculation n-gramme aux usages qui en bénéficient | Copie répétitive : 128 → 430 tokens/s ; pas de gain clair en prose/code | Option texte répétitif ; désactivée par défaut |

Les validations finales incluaient mémoire contrainte, hydratation des options, plusieurs profils GPU/modèles et tâches réelles. Le batch 2 048 n’est pas universel ; la spéculation n-gramme n’a pas de bénéfice général démontré en prose/code. La calibration b11823 relevait −13,8 % de TTFT à 8 192 tokens en 2 048/2 048 contre 512/512 sur Tron Q6/f16, sans extrapolation au profil long bf16.

Les mesures de copies de chaînes/streaming n’ont pas justifié d’optimisation de production. Les sept contrôles Spark-X2.6-4B du 23 octobre validaient certains comportements dans l’application installée de cette époque, sans remplir le contexte configuré de 68 192 tokens. [Relevé intégral et liens de preuves](https://github.com/TRON-ABS/Novera/blob/0765c3b1766ccb52905f876ef149e55e260c4b50/SUIVI_MOTEUR.md).

<a id="windows-fixes"></a>

## Les 35 corrections Windows intégrées

Numéros historiques de contributions ; ils ne sont pas des PR encore ouvertes dans Novera.

| PR historique | Correction |
| --- | --- |
| #9365 | fix(tables): preserve literal code whitespace in exported cells |
| #9364 | fix(markdown): preserve fenced and inline code during math normalization |
| #9341 | fix(attachments): reserve context for already prepared inline documents |
| #9340 | fix(mcp): normalize image data URLs before encoding tool results |
| #9330 | fix(settings): serialize backend operations before deduplicating writes |
| #9380 | fix(chat): filter named SSE events after sampling retries |
| #9379 | fix(chat): preserve SSE responses across mixed line endings |
| #9378 | fix(assistants): preserve state when deletion fails |
| #9377 | fix(projects): await dialog saves and retain failed drafts |
| #9376 | fix(providers): isolate runtime engine discovery failures |
| #9375 | fix(projects): preserve saved projects when storage operations fail |
| #9373 | fix(chat): keep live stream statistics with their originating thread |
| #9372 | fix(chat): report history read failures and allow retry |
| #9371 | fix(settings): protect saved preferences after hydration read failures |
| #9369 | fix(chat): retain attachment drafts while a turn is running |
| #9368 | fix(threads): preserve selected model when removing an assistant |
| #9367 | fix(threads): preserve new chat drafts when creation fails |
| #9366 | fix(threads): preserve conversations when deletion fails |
| #9345 | fix(memory): serialize concurrent Remember saves per data folder |
| #9343 | fix(code): render escaped plain text when syntax highlighting fails |
| #9342 | fix(preview): keep Storage properties and methods in sync |
| #9339 | fix(chat): preserve manual titles when background generation finishes late |
| #9338 | fix(tools): isolate pending approvals by owning thread and call |
| #9337 | fix(attachments): queue concurrent ingestion choices without stranding callers |
| #9336 | fix(models): scope deletion records and cache updates by provider |
| #9335 | fix(models): keep individual deletions retryable on filesystem failure |
| #9334 | fix(code): ignore obsolete asynchronous highlighting results |
| #9333 | fix(chat): protect drafts from arrow-key history navigation |
| #9332 | fix(favorites): isolate models by provider and migrate unique legacy owners |
| #9331 | fix(chat): generate titles with the owning thread model |
| #9329 | fix(models): keep failed bulk deletions visible and retryable |
| #9328 | fix(chat): let disabled shell calls receive a refusal and continue |
| #9327 | fix(chat): activate remote auto compact without a manual context limit |
| #9326 | fix(chat): preserve branch metadata and order message persistence |
| #9325 | fix(agent): deduplicate MCP tool definitions consistently with routing |

Le packaging #9302 est une intégration d’outillage supplémentaire, distincte de ces 35 corrections. La correction Linux #9346 reste à examiner ; les essais exhaustifs en fonctionnement restent dans [la feuille de route](../ROADMAP.md).
