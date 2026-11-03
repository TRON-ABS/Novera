# Novera Android 1.0.0 — distribution directe ARM64

Préparation du **2 novembre 2026**, priorité demandée par le mainteneur. Le mainteneur dispose d'un téléphone et préfère installer lui-même les APK, sans pilotage ADB. macOS et iOS sont reportés selon [REPRISE_MACOS_IOS.md](REPRISE_MACOS_IOS.md).

## Périmètre et état

### Sortie 1.0.0 — 3 novembre 2026

Le mainteneur confirme que le dernier APK interne **1000010 fonctionne bien** et autorise la sortie Android **1.0.0**. Ce retour global est une validation manuelle du mainteneur ; il ne constitue pas un relevé séparé de chaque interaction système.

Le paquet de sortie **1000011** conserve la version affichée **1.0.0** et la même identité de signature. La taille de lot par défaut passe à **512** sur Android, y compris pour les modèles enregistrés avec l'ancienne valeur par défaut de 2048. Les autres valeurs personnalisées sont conservées. Les réglages Desktop restent inchangés.

**Recommandations :** pour les modèles locaux, utiliser de préférence un téléphone moderne avec suffisamment de mémoire. Sur un appareil ancien ou moins puissant, privilégier un fournisseur **API**. Pour les **recherches web**, un contexte d'au moins **16K tokens (16 384)** est conseillé pour garder la place nécessaire aux résultats et à la réponse. Cette recommandation ne relève pas automatiquement le contexte local par défaut, afin de limiter la consommation mémoire sur téléphone.

APK de sortie signé et inspecté : `deliverables/Novera-Android-public-1.0.0-2026-11-03/Novera_1.0.0_android-arm64.apk`, **1000011**, **42211690 octets**, SHA-256 **`325d5ef5b6ca558ed150ea590eaf4a01b54ac8bfb1f7ee5b163dffbe85c43ecb`**. TypeScript/Vite, Cargo release, Gradle/Lint, signature, alignements et contrôle final du paquet passent. Le JavaScript exact du lot à 512 est retrouvé dans la bibliothèque native compilée ; les **217 PNG** restent identiques à 1000010. Les tests frontend ciblés passent **85 cas**, et les contrôles de configuration Android **5 cas**. [Provenance](release-evidence/android-public-1.0.0-2026-11-03/ANDROID-PROVENANCE.json), [inspection](release-evidence/android-public-1.0.0-2026-11-03/ANDROID-VERIFICATION.json), [CI des contrats de sources](https://github.com/TRON-ABS/Novera/actions/runs/41578791664).

La validation sur téléphone du nouveau 1000011 reste distincte du retour positif sur 1000010. Le mainteneur prévoit de le réinstaller. Une installation par-dessus conserve les données ; désinstaller peut effacer les données privées de l'application. Les **12 anciens APK locaux** de livraison et leurs fichiers de signature détachée ont été supprimés à sa demande après vérification du nouveau paquet ; leurs reçus et empreintes historiques sont conservés.

Le brouillon privé Android est préparé sous le tag prévu `v1.0.0-android`, sans devenir `latest`, afin de préserver les canaux Desktop, CLI et portable. Le transfert de l’APK et des reçus a été bloqué par le contrôle automatique, qui demande une autorisation explicite du payload vers GitHub ; aucun APK Android public n’est annoncé.

### Historique de préparation jusqu'au candidat 1000010

Les états « en attente » et « interne » ci-dessous décrivent les étapes précédant le retour positif du mainteneur et l'autorisation de sortie du 3 novembre.

- Identité de production : `io.github.tronabs.novera`, distincte de `io.github.tronabs.novera.debug`.
- Version applicative : **1.0.0** ; dernier candidat **1000010 signé et inspecté**, combinant le correctif Origin de 1000009, la copie native de texte Android et l’aperçu du message choisi lorsqu’il ne contient qu’une trace visible sans réponse finale. Les builds 1000002/1000003 ont été testés manuellement sur HUAWEI P20 ; les builds 1000004 et 1000006 ont rencontré un refus HTTP 403. Les anciens builds sont conservés comme preuves historiques.
- Cible : Android ARM64 (`arm64-v8a`), minimum Android 7/API 24 ; moteur texte CPU, un modèle à la fois, sans MLX ni moteur image CUDA.
- Canal retenu : APK signé, téléchargement direct ; installation et mise à jour manuelles par le gestionnaire de paquets Android.
- Les [trois revues de sources](ANDROID_RELEASE_REVIEW_2026-11-02.md) sont consignées. L'ancien worker local nommé `libjan_llama_worker.so` est remplacé par le moteur actuellement épinglé ; le stockage des secrets Android utilise désormais le fichier chiffré privé au lieu du backend keyring en mémoire.
- Une identité RSA 4096 de signature Android est créée hors dépôt, avec mot de passe aléatoire protégé par DPAPI et accès limité au compte Windows. Son certificat public SHA-256 est `ccea6bf07c93c9c0c10861f1ba897077925505cd8621117d4c671f1886b62582`. La sauvegarde portable hors machine reste à effectuer par le mainteneur.

**Le mainteneur confirme sur HUAWEI P20 la mise à jour interne 1000002 → 1000003, la discussion et le modèle conservés, une réponse LFM3 et la persistance après fermeture/relance. Le refus HTTP 403 persiste sur 1000008, dans web_search vers lite.duckduckgo.com sans redirection signalée. Le mainteneur confirme que Lite fonctionne dans le navigateur du téléphone. La différence Origin est reproduite sur PC ; sa correction dans 1000009 reste à confirmer sur le P20.** Les paquets restent internes.

### Copie native et aperçu d'un message sans réponse finale — 3 novembre 2026

Le mainteneur signale que le texte copié ne se colle pas, puis précise que « Préparer l'aperçu » n'est pas cliquable. Le bouton Copier appelait l'API navigateur sans attendre sa promesse et affichait donc une réussite même si la WebView refusait l'écriture. Android utilise maintenant une commande native dédiée, `sharing_copy_text`, relayée au ClipboardManager sur le thread UI. Aucun contenu du presse-papiers n'est lu. La limite est de 512 Kio UTF-8 ; les erreurs remontent sans faux indicateur de réussite. Le contenu est marqué sensible pour masquer l'aperçu système Android récent. La copie des messages, du code, des tableaux et du texte depuis l'aperçu partage utilise ce chemin ; les copies navigateur/Desktop restent inchangées.

Un test a reproduit le second défaut : le rendu choisi peut ne contenir qu'une réflexion et une erreur d'outil, sans réponse finale ; le filtrage de l'export ne conserve alors aucune entrée et désactive Préparer. Pour le message explicitement choisi, sa trace visible et ses erreurs deviennent exportables lorsque la réponse manque. Les réponses normales restent prioritaires, les arguments des outils ne sont pas repris et le filtrage des réflexions dans les exports de discussions entières reste inchangé. L'aperçu demeure obligatoire avant l'action de partage ; aucune ouverture d'application destinataire ou transmission automatique n'est ajoutée.

APK interne : `deliverables/Novera-Android-clipboard-share-fix-2026-11-03/Novera_1.0.0_android-arm64.apk`, **1000010**, **42215786 octets**, SHA-256 **`32b0396cfb5eadd947117ffe5ecd3a75cb474a442f1a5ebfdeb3f903be35e7b8`**, certificat inchangé. TypeScript/Vite, Cargo release, Gradle/Lint, signature et inspection passent. Les tests ciblés donnent 109 réussites et 12 cas de plateforme ignorés ; deux tests supplémentaires de copie Android depuis l'aperçu et cinq tests de configuration passent. Le test de régression de l'aperçu échouait avant correction et passe ensuite. Le JavaScript exact du presse-papiers est retrouvé dans la bibliothèque native ; les commandes natives et leurs symboles DEX sont présents, le Kotlin généré correspond aux sources suivies, et les 217 PNG restent identiques. [Provenance](release-evidence/android-clipboard-share-fix-2026-11-03/ANDROID-PROVENANCE.json).

Le code HTTP est strictement identique à celui de 1000009, dont le comparatif Origin est consigné ci-dessous. Installer par-dessus sans désinstaller. Vérifier une recherche, Copier puis Coller dans un autre champ de texte, puis Partager → Préparer l'aperçu → partage Android. Ces opérations sur téléphone restent à confirmer ; la présence des symboles et les tests ne prouvent pas une interaction réelle avec la feuille système Android.

### Origine WebView injectée par le client natif — 3 novembre 2026

Le diagnostic du mainteneur sur 1000008 indique deux refus de `web_search` vers `lite.duckduckgo.com`, sans redirection signalée. Il ne s'agit donc pas d'une erreur de lecture d'une page source. Aucun terme de recherche personnel n'est conservé dans ces preuves.

La version épinglée `tauri-plugin-http 2.5.9` ajoute par défaut l'en-tête `Origin` de la WebView, ici `https://tauri.localhost`. Deux requêtes ordinaires sur le même PC, avec le même endpoint Lite, la même requête neutre et le même User-Agent Novera, reproduisent **HTTP 403 et zéro résultat avec Origin**, puis **HTTP 200 et dix résultats sans Origin**. Aucune page de challenge n'est détectée. Voir [comparaison](release-evidence/android-http-origin-fix-2026-11-03/ORIGIN-COMPARISON.json).

Le [code officiel Tauri](https://github.com/tauri-apps/plugins-workspace/blob/v2/plugins/http/src/commands.rs) prévoit explicitement un en-tête Origin vide comme consigne de suppression dans le client natif. L'option nécessaire `unsafe-headers` était déjà active sur Android ; aucune permission ou option Cargo n'est ajoutée. Le correctif utilise cette consigne uniquement dans l'aide web mobile, pour la recherche et la lecture de sources. Il conserve le User-Agent Novera déclaré, DuckDuckGo Lite, la vérification TLS, les limites et l'arrêt sur refus/challenge. Il n'envoie pas une fausse origine de site.

APK interne : `deliverables/Novera-Android-http-origin-fix-2026-11-03/Novera_1.0.0_android-arm64.apk`, **1000009**, **42211690 octets**, SHA-256 **`f5e492a8c2ad8868be918fe5c352fec1a8d983e49997e0b725aa6b0677972c9f`**, certificat inchangé. TypeScript/Vite, Cargo release, Gradle/Lint, signature et inspection passent. Les 30 tests web ciblés et cinq contrôles de configuration Android passent ; l'adaptateur réel conserve la consigne vide pour les deux outils. L'asset JavaScript exact contenant cette correction est retrouvé dans la bibliothèque native compilée et les 217 PNG sont inchangés. [Provenance](release-evidence/android-http-origin-fix-2026-11-03/ANDROID-PROVENANCE.json).

La reproduction établit un effet de cet en-tête sur le PC et concorde avec le diagnostic mobile ; elle ne remplace pas l'essai du nouvel APK sur téléphone. Installer par-dessus sans désinstaller, puis effectuer une nouvelle recherche explicite. La résolution du refus sur P20 reste en attente.

### Journaux et diagnostic 403 — 3 novembre 2026

La capture du mainteneur confirme que la navigation repliable laisse maintenant lire les réglages, mais les boutons des journaux débordent encore. Sous 480 px de largeur de carte, « Ouvrir les journaux » est placé sous « Ouvrir le dossier contenant », avec largeur disponible entière et texte pouvant revenir à la ligne. La disposition des cartes larges est conservée.

Le refus signalé vise `duckduckgo.com`. Le code pouvait recevoir une URL de recherche principale dans `web_fetch` et la lire directement. Les URLs de recherche connues avec paramètre `q` sont désormais envoyées directement à `web_search` sur Lite, sans première requête à la page JavaScript. Une page d'accueil sans requête est refusée localement avec instruction d'utiliser l'outil de recherche. Les pages d'aide restent lisibles. Les erreurs HTTP indiquent `[web_search]` ou `[web_fetch]`, le domaine refusant et le domaine initial en cas de redirection, sans exposer les termes recherchés. Aucun nouvel essai après un 403 ni changement de fournisseur n'est ajouté.

Cette correction couvre un cas reproduit par les tests ; elle ne démontre pas la cause du refus observé sur le P20. Après avoir précisé que le premier retour ne correspondait pas à un essai du navigateur, le mainteneur confirme ensuite que le lien Lite fonctionne dans le navigateur mobile. Le succès de cet essai ne prouve pas celui du client HTTP de Novera ; aucun blocage général du réseau n'est établi.

APK interne : `deliverables/Novera-Android-logs-search-2026-11-03/Novera_1.0.0_android-arm64.apk`, **1000008**, **42199402 octets**, SHA-256 **`dc93772a04b64fa33192d4056a88ba4cf9f6c6b4dd02d80c3ee8ed20f66b2db7`**, certificat inchangé. Construction TypeScript/Vite, Cargo release, Gradle/Lint, signature et inspection passent. Les 45 tests frontend ciblés et cinq contrôles de configuration Android passent ; l'adaptateur HTTP Tauri reçoit réellement la requête Lite normalisée dans un contrôle sans réseau. Les changements sont présents dans la bibliothèque compilée et les 217 ressources PNG restent identiques. Preuves : [provenance 1000008](release-evidence/android-logs-search-2026-11-03/ANDROID-PROVENANCE.json).

Installer par-dessus 1000007 sans désinstaller. Vérifier l'ordre et la visibilité complète des deux boutons des journaux, puis une recherche explicite. Le prochain message de refus doit permettre de distinguer l'outil et une éventuelle redirection. La résolution du HTTP 403 sur téléphone n'est pas revendiquée.

### Réglages étroits et recherche — 3 novembre 2026

Le retour du mainteneur sur 1000006 signale encore un HTTP 403 et montre le menu fixe de gauche comprimant les réglages Général jusqu'à un affichage lettre par lettre. La navigation commune devient repliable au-dessus du contenu sous 700 px ; elle se referme après sélection. Les pages de réglages partagent cette adaptation et le contenu garde une largeur minimale nulle dans la disposition flexible.

La recherche utilise désormais la [version Lite officielle de DuckDuckGo](https://safe.duckduckgo.com/duckduckgo-help-pages/features/non-javascript), en GET HTTPS avec identité Novera déclarée. Le lecteur accepte les lignes de résultats Lite et conserve l'ancien format HTML pour les redirections. Aucun nouvel essai par un autre point d'accès après un 403, changement automatique de fournisseur, proxy ou résolution de challenge n'est ajouté. Les erreurs précisent le domaine et interdisent de prétendre avoir lu une page refusée. Une réponse PC HTTP 200 fournit dix liens, dont cinq résultats extraits par le véritable lecteur ; ce contrôle ne valide pas le réseau mobile du P20.

APK interne : `deliverables/Novera-Android-settings-search-2026-11-03/Novera_1.0.0_android-arm64.apk`, **1000007**, **42 207 594 octets**, SHA-256 **`dd49e92140cda0925a4f3402c262f4eed09a1f470c0d8ee6bf7449fb69956bbe`**, certificat inchangé. TypeScript/Vite, Cargo release, Gradle/Lint, signature et inspection finale réussissent. Les 64 tests frontend ciblés passent. La bibliothèque compilée contient le nouveau menu et l'adresse Lite ; les 217 ressources PNG compilées sont identiques à 1000006. Le contrôle visuel automatisé local a été bloqué par l'accès du navigateur ; aucune validation visuelle sur appareil n'est revendiquée. Preuves : [provenance 1000007](release-evidence/android-settings-search-2026-11-03/ANDROID-PROVENANCE.json).

Installer par-dessus sans désinstaller, ouvrir Général puis Interface, changer de rubrique et contrôler la lisibilité sans déplacement horizontal. Demander ensuite une recherche web explicite ; en cas de refus, relever le domaine et le statut exacts. La conservation de la discussion et du modèle doit aussi être confirmée après cette mise à jour.

### Retour du mainteneur et diagnostic — 2 novembre 2026

Le mainteneur a installé le paquet de départ `versionCode=999999` et signale un écran noir sur **HUAWEI P20**. Le diagnostic retourné ensuite indique **HUAWEI EML-L29, Android 10/API 29, WebView 156.0.8078.47**, avec `webviewCreated=false`. Aucune discussion témoin ni mise à jour avec données conservées n'est validée. Les contrôles cryptographiques et statiques précédents ne sont pas des preuves de démarrage de l'interface.

Un APK de diagnostic interne est disponible dans `deliverables/Novera-Android-startup-diagnostic-2026-11-02/Novera_1.0.0_android-arm64-startup-diagnostic.apk`, `versionCode=1000001`, même identité et certificat. SHA-256 : `5979079f863c38e204975967cdbed2be4828cf108130f778b689f5c83c95ca0a`, **41687402 octets**. Sa signature et son inspection de paquet passent. Le runtime natif et les assets applicatifs correspondent au candidat ; le code Kotlin du diagnostic et les profils DEX associés diffèrent intentionnellement.

Ce diagnostic affiche localement, après environ 20–25 secondes si le thread UI reste disponible, le modèle, Android, la version WebView, l'état de création de la vue, le chargement du document et les erreurs de démarrage détectables. Il n'active ni port de débogage ni envoi réseau, ne lit pas les discussions ou réglages et ne réinitialise pas les données. Il n'est pas un correctif de l'écran noir. Le mainteneur peut installer ce paquet par-dessus, attendre la fenêtre et copier le diagnostic. Si aucune fenêtre n'apparaît, des journaux natifs seront nécessaires.

Le mainteneur a activé HDB Huawei ; aucun appareil ADB n'était détecté lors de la vérification. HDB/HiSuite et le débogage USB Android sont des mécanismes distincts. Aucun APK n'a été installé par ADB sur son téléphone.

Après installation du diagnostic, le prochain paquet correctif devra avoir un `versionCode` supérieur à **1000001** ; ne pas demander de désinstaller ou de rétrograder pour contourner cette progression.

### Défaut de configuration identifié

La configuration de base ne déclare aucune entrée `app.windows`, et l'ancienne configuration Android n'en ajoutait aucune. Dans le code de Tauri utilisé, `AppConfig.windows` est un vecteur vide par défaut ; le démarrage crée seulement les fenêtres de cette liste. Aucune création manuelle de la fenêtre principale n'existe dans Novera. Cette absence explique le diagnostic `webviewCreated=false` : le démarrage reste sans interface configurée.

Le correctif Android ajoute explicitement `main`, créée et visible au démarrage, ouvrant `index.html` avec le schéma applicatif HTTPS. Il garde l'identité, le certificat et les emplacements de données. `versionCode=1000002` permet de remplacer le diagnostic 1000001. L'audit source et le garde-fou local refusent désormais un build Android sans cette fenêtre.

Les deux indicateurs HTTP du diagnostic sont `false` ; ils ne prouvent pas ici un échec réseau de la page puisque la vue n'existait pas. La nouvelle origine HTTPS évite de demander une exception HTTP globale ou de modifier les protections du téléphone.

### Correctif à installer par-dessus le diagnostic

Fichier : `deliverables/Novera-Android-startup-fix-2026-11-02/Novera_1.0.0_android-arm64.apk`, **41679210 octets**, `versionCode=1000002`, SHA-256 **`59a542a6cb727b173e3a571a3477dff9f4a95839f46190d736bc42a0becc595f`**. Le certificat reste celui déjà installé.

Le point d'entrée local complet `build-release.ps1` réussit cette fois jusqu'au reçu final : Cargo release, conditionnement Gradle avec Lint actif, signature et inspection autonome. Le contrôle négatif refuse une copie altérée et le fichier signé original reste inchangé. La classe temporaire du diagnostic Kotlin est absente de ce correctif. Les contrôles source donnent 76 tests Node réussis, un test POSIX ignoré sur Windows et 19 tests Python réussis. [Provenance et limites](release-evidence/android-startup-fix-2026-11-02/ANDROID-PROVENANCE.json).

Le mainteneur a ensuite confirmé que l'application démarre et atteint le parcours du premier modèle. Il a annoncé le téléchargement de LFM3-1.7B, puis une réponse reçue et le message toujours disponible après fermeture et redémarrage de l'application. La capture fournie montre l'interface, LFM3-1.7B sélectionné et une réponse affichée. Elle affiche ponctuellement 1 jeton/s, 161 jetons et « Pensée pour 3 min 47 s » ; ce relevé ne constitue pas un benchmark ni une garantie de performance.

Le [compte rendu de l'essai téléphone](release-evidence/android-startup-fix-2026-11-02/device-runtime-report.json) distingue les résultats déclarés par le mainteneur des contrôles locaux. Aucune lecture indépendante du versionCode installé ni collecte ADB n'a été effectuée. La capture personnelle n'est pas copiée dans le dépôt ; seule son empreinte et les observations techniques utiles sont conservées, sans recopier le contenu de la conversation.

**La persistance après fermeture/relance puis après remplacement par un APK supérieur est confirmée par le mainteneur**, selon le compte rendu ci-dessous. Conserver l'installation actuelle et sa discussion. Les pièces jointes, secrets fournisseur et interruptions réseau restent à tester. Le mainteneur indique n'avoir pu que refuser le suivi des erreurs lors du premier parcours ; le comportement de l'acceptation reste à clarifier. Aucun consentement ni fonctionnement d'envoi de diagnostics n'est déduit de ce retour.

### APK préparé pour l'essai discussion et modèle conservés

À la demande du mainteneur, un paquet interne **1000003** est préparé pour remplacer le correctif **1000002** actuellement testé. Fichier : `deliverables/Novera-Android-update-test-2026-11-02/Novera_1.0.0_android-arm64-update-test.apk`, **41679210 octets**, SHA-256 **`2527bf0ffc5ffe006633622d3a71dab99a2edebb88b8b0be143a83edbbdb395e`**.

Le script `scripts/android/prepare-update-test.ps1` réutilise le runtime du correctif vérifié : pas de recompilation Rust/frontend, comparaison exacte des 12 entrées natives/assets, conditionnement Gradle avec le seul versionCode de test augmenté, signature avec le même certificat et inspection autonome. La compilation Gradle, la signature et l'inspection réussissent. Le paquet de référence est inchangé et les propriétés générées sont restaurées à 1000002 après le conditionnement. Le modèle et les discussions du téléphone ne sont jamais des entrées de construction.

Les [reçus de l'APK de test](release-evidence/android-update-test-2026-11-02/update-test.verification.json) et sa [provenance](release-evidence/android-update-test-2026-11-02/update-test.provenance.json) restent les constats immuables de construction. Le [retour ultérieur du mainteneur](release-evidence/android-update-test-2026-11-02/device-update-report.json) confirme l'installation, la discussion et le modèle conservés, une réponse LFM3 puis la conservation après relance. Le versionCode installé n'a pas été lu indépendamment. Cette observation couvre deux builds internes, sans revendiquer une transition entre versions publiques.

1. Garder Novera installé, sa discussion et LFM3-1.7B déjà téléchargé ; ne pas effacer les données.
2. Transférer ce nouvel APK, l'ouvrir sur le téléphone et choisir **Mettre à jour**. Ne pas désinstaller en cas de refus : conserver le message exact.
3. Ouvrir Novera et vérifier que la discussion précédente est présente.
4. Sélectionner LFM3-1.7B et envoyer un nouveau message **sans retélécharger le modèle**. Si le modèle est proposé au téléchargement, le signaler avant toute nouvelle tentative de téléchargement.
5. Fermer et rouvrir Novera : vérifier encore la discussion et le modèle.

Résultat déclaré : mise à jour acceptée, discussion et modèle retrouvés, réponse reçue et contenu conservé après relance. Après installation du build 1000003, conserver cette installation et utiliser **1000004 ou supérieur** pour la remplacer. Les définitions Android sont désormais à 1000004 pour le correctif de recherche ci-dessous.

### Erreur DuckDuckGo après mise à jour

Le mainteneur signale une recherche DuckDuckGo affichant « Permission denied, code 13 », suivie d'une nouvelle tentative et d'une réponse. Cette réponse du modèle ne prouve pas que la recherche a abouti. Le chemin DuckDuckGo utilisait le serveur MCP local `uvx`, un outil de bureau absent de la distribution mobile.

Le correctif 1000004 route DuckDuckGo sur Android/iOS vers le client HTTP natif et le site HTML public en HTTPS. Il évite aussi le démarrage automatique des serveurs MCP stdio de bureau sur mobile, sans supprimer leur configuration ; les transports distants HTTP/SSE restent disponibles. Il borne délais, taille de réponse et texte retourné, contrôle les redirections et signale les challenges sans les contourner. Les tests ciblés passent : 50 tests frontend, un ignoré ; deux tests Rust de politique de transport ; 17 tests Node de génération/préparation et huit tests Python du vérificateur APK. TypeScript/Vite, Cargo release Android, Gradle avec Lint actif, signature et inspection indépendante réussissent via le point d'entrée complet.

APK : `deliverables/Novera-Android-websearch-fix-2026-11-02/Novera_1.0.0_android-arm64.apk`, **41662826 octets**, SHA-256 **`ab9ec555cbc38a758b0eb093777cbeef0cffaeb12e8d5d76d4f7a5e7eb46a979`**, même certificat épinglé, versionCode **1000004**. [Reçu du paquet](release-evidence/android-websearch-fix-2026-11-02/ANDROID-VERIFICATION.json) et [provenance](release-evidence/android-websearch-fix-2026-11-02/ANDROID-PROVENANCE.json). Installer par-dessus le build 1000003, sans désinstaller ni effacer les données ; vérifier une recherche web avec résultats et liens, puis discussion et modèle après relance. Le résultat sur téléphone reste en attente.

Une requête publique de contrôle depuis ce PC reçoit HTTP 202 et un challenge DuckDuckGo, correctement reconnu comme indisponibilité ; aucun succès réseau réel de recherche n'est revendiqué. La recherche sur le réseau du téléphone reste à vérifier après installation du nouvel APK. Aucun fournisseur différent n'est sélectionné silencieusement.

### Retour HTTP 403 et essai du fournisseur déjà intégré

Après livraison du correctif 1000004, le mainteneur signale `error duckduckgo mobile request failed HTTP 403`. Le [retour téléphone](release-evidence/android-websearch-fix-2026-11-02/device-websearch-report.json) laisse la recherche non validée. Le code 403 indique un refus HTTP ; l'URL exacte n'est pas connue et le libellé actuel est partagé avec la lecture des pages de résultats. Aucun blocage précis du réseau du téléphone ni résultat web réussi ne peut en être déduit.

L'alternative **Exa est déjà incluse dans l'APK**, avec permission mobile et client natif HTTPS. L'[accès MCP sans clé documenté par Exa](https://exa.ai/mcp) répond sur le PC à la même requête JSON-RPC que le client installé : HTTP 200, trois résultats réels et liens de documentation Tauri, sans erreur outil ni indicateur de quota. Le [compte rendu réseau](release-evidence/android-websearch-fix-2026-11-02/exa-alternative-probe.json) distingue ce succès PC du test Android restant à effectuer. Le premier essai Python avec son identification de bibliothèque renvoyait un refus Cloudflare 1010 ; l'essai sans User-Agent, conforme au client natif actuel, réussit. Aucune usurpation de navigateur ni résolution de challenge n'a été utilisée.

Prochain essai sur le téléphone : **Paramètres → Recherche sur le Web → Fournisseur de recherche → Exa**, laisser la clé API facultative vide et la recherche activée. Revenir à la discussion et demander une recherche avec liens. Il s'agit d'un choix explicite du mainteneur ; aucun réglage du téléphone n'est modifié à distance, aucun nouvel APK ni téléchargement du modèle n'est nécessaire. La publication Android reste en attente de ce résultat.

### Maintien de DuckDuckGo — formulaire officiel, build 1000005

Le mainteneur demande ensuite de conserver DuckDuckGo. Exa reste une possibilité déjà intégrée, sans migration automatique ni essai téléphone déclaré. Le correctif 1000005 conserve donc le fournisseur choisi et corrige le contrat HTTP : envoi de `q` dans le formulaire HTML POST `application/x-www-form-urlencoded`, identification explicite et véridique `Novera/1.0.0 (+https://github.com/TRON-ABS/Novera)` et en-tête Accept pour le texte/HTML. Le HTML reçu de l'[interface officielle sans JavaScript](https://safe.duckduckgo.com/duckduckgo-help-pages/features/non-javascript) déclare bien `<form action="/html/" method="post">`. Aucune usurpation de navigateur, aucun proxy de recherche ni résolution automatique de challenge n'est ajouté.

Un essai réel depuis le PC, avec les mêmes méthode, corps et en-têtes que le correctif, répond **HTTP 200**, dix liens HTML et aucun marqueur de challenge. Le parseur réel de Novera en extrait cinq résultats HTTPS avec titres et extraits. Cette preuve porte sur la requête combinant POST et identification Novera ; elle n'isole pas lequel de ces changements explique le refus précédent sur le téléphone. Le site Lite officiel répond aussi lors de l'exploration, mais aucun repli automatique vers lui n'est ajouté.

Les **52 tests frontend ciblés passent**, un test est ignoré. Ils couvrent notamment les octets du formulaire, la conversion POST → GET pour une redirection 303, l'interdiction de transmettre une recherche hors du service DuckDuckGo et l'absence de nouvelle tentative automatique sur HTTP 403. Une vérification de l'adaptateur Tauri HTTP réel, avec seulement le pont IPC intercepté, confirme que le corps encodé et le User-Agent arrivent bien dans la configuration transmise au backend. Les erreurs de lecture indiquent désormais l'hôte refusant la requête, plutôt que d'attribuer toute page refusée à DuckDuckGo.

Le résultat de recherche sur HUAWEI P20 reste à confirmer après installation par-dessus le build 1000004, sans désinstaller ni effacer les données. Garder DuckDuckGo sélectionné (ou le resélectionner si le réglage a été changé), demander une recherche web avec liens, puis vérifier la conservation de la discussion et du modèle après relance. Un challenge ou un refus persistant reste une erreur explicite ; aucun succès sur téléphone n'est déduit des contrôles PC.

La chaîne complète de construction locale du build 1000005 réussit : TypeScript/Vite, Cargo release Android, assemblage Gradle avec Lint actif, signature et inspection indépendante du paquet. APK : `deliverables/Novera-Android-duckduckgo-form-fix-2026-11-02/Novera_1.0.0_android-arm64.apk`, **41662826 octets**, SHA-256 **`2f69d4eaa50b8bbdf0ac0f9ea8a42b75451d261aa5b90c740d51c08de63e4eaa`**, même certificat que les builds installés. [Reçu APK](release-evidence/android-duckduckgo-form-fix-2026-11-02/ANDROID-VERIFICATION.json), [provenance](release-evidence/android-duckduckgo-form-fix-2026-11-02/ANDROID-PROVENANCE.json) et [preuve réseau/parser PC](release-evidence/android-duckduckgo-form-fix-2026-11-02/DUCKDUCKGO-LIVE-PROBE.json). Aucun nouvel essai téléphone, publication ou validation CI n'est revendiqué.

### Main Novera, couleurs Desktop et clavier — build combiné 1000006

Pendant la préparation, le mainteneur signale l'icône Tauri au lieu de la main et l'ouverture du clavier au début de la réflexion. Il demande une palette bleu nuit/cyan, puis précise la référence : les couleurs de Novera Desktop. Le build 1000005 reste une preuve interne de construction ; aucun essai téléphone de ce build n'est déclaré.

Le projet Android généré contient effectivement les icônes Tauri, alors que les quinze PNG Novera existent déjà dans `src-tauri/icons/android`. Le configurateur les recopie désormais dans les ressources du projet à chaque configuration. Le test existant de génération compare les quinze fichiers aux originaux ; les cinq tests de configuration passent. Aucun logo n'est redessiné.

Le profil Desktop local est lu uniquement pour ses réglages d'apparence : thème `dark`, accent `gray`. Les styles partagés fournissent déjà le compositeur bleu nuit, les contours cyan et les accents de Desktop. Après hydratation des préférences Android, une migration applique ces deux réglages **une seule fois**, puis conserve les changements ultérieurs du mainteneur ; Desktop et iOS ne sont pas modifiés. Aucun profil ni contenu personnel n'est copié dans le dépôt ou l'APK.

Le clavier était provoqué par des effets qui focalisaient le champ au changement de discussion et à chaque statut autre que `submitted`, y compris `streaming`. Ces reprises automatiques de focus sont désactivées sur Android/iOS, et l'envoi accepté retire le focus du champ pour fermer le clavier. La saisie au toucher reste possible, y compris pendant la réponse. Le comportement de focus Desktop est conservé.

Les contrôles frontend de ces changements passent : **87 tests** (champ de saisie, apparence, fournisseur de thème et préférences), en complément des **52 tests de recherche**, un ignoré. La nouvelle régression exerce le focus manuel, l'envoi, les phases `submitted`/`streaming`/`ready`, puis une nouvelle saisie manuelle. Les essais sur le P20 restent nécessaires pour l'icône du lanceur, les couleurs, le clavier logiciel et DuckDuckGo.

La chaîne locale complète du build 1000006 réussit : TypeScript/Vite, Cargo release Android, Gradle avec Lint actif, signature et inspection indépendante. APK : `deliverables/Novera-Android-mobile-fix-2026-11-02/Novera_1.0.0_android-arm64.apk`, **42207594 octets**, SHA-256 **`82d3002ae90d3e4700d04bb239128d01e4baf5f91dd1f815f049b4ab4d059217`**. Même certificat que le build 1000004 installé. AAPT résout cinq ressources du lanceur ; leurs pixels visibles et alpha correspondent aux icônes de la main existantes, en normalisant seulement le RGB invisible alpha zéro modifié par le compactage PNG AAPT. [Reçu APK](release-evidence/android-mobile-fix-2026-11-02/ANDROID-VERIFICATION.json), [provenance](release-evidence/android-mobile-fix-2026-11-02/ANDROID-PROVENANCE.json) et [contrôle des icônes](release-evidence/android-mobile-fix-2026-11-02/ICON-VERIFICATION.json). Le résultat physique du nouvel APK reste à recevoir ; aucune publication n'est effectuée.

## Paquets initiaux et validation locale — historique

Fichiers locaux dans `deliverables/Novera-Android-1.0.0-2026-11-02/` :

| Usage | Fichier | versionCode | Octets | SHA-256 |
| --- | --- | ---: | ---: | --- |
| Départ interne pour l'essai d'update | `Novera_1.0.0_android-arm64-update-test-start.apk` | 999999 | 41687402 | `444fa49ddb070d73d1de49bb29e7e6380636547ea2c3dcac4e1fb417523e8b86` |
| Candidat final | `Novera_1.0.0_android-arm64.apk` | 1000000 | 41687402 | `b2ed854d01b072c7b5204b9680cfe9212032cd3d89c7d09cd4ac6e6afd5896b3` |

Les deux APK passent le vérificateur indépendant : certificat épinglé, signatures APK v2/v3 vérifiées par l'outil Android, version et identité, SDK, absence de debug, sauvegardes désactivées, politique HTTP limitée à loopback, zipalign et six ELF ARM64 avec alignements d'au moins 16 Kio et dépendances résolues. Les seules permissions de l'APK sont `INTERNET` et la permission interne `io.github.tronabs.novera.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`.

Les **12 entrées natives/assets** correspondent exactement entre paquet de départ et candidat final. Le paquet de départ est conditionné par Gradle sans recompiler Rust/frontend ; les propriétés générées sont ensuite restaurées à `versionCode=1000000`. Les octets du candidat final restent inchangés. Une copie volontairement altérée est rejetée par `apksigner` avec `DOES NOT VERIFY`, code de sortie 1.

Compilation du worker CPU épinglé `8642541b255bfb5dc39cd351a178be09013a55d6`, compilation Cargo release de l'application et assemblage Gradle avec Lint actif réussis. Le point d'entrée complet a atteint la signature, puis son premier contrôle final a refusé le nouveau libellé de sortie `V3.0 Signer` des Build-Tools 37. Le parseur a été corrigé et testé ; **les mêmes octets signés**, sans reconstruction ni nouvelle signature, passent ensuite l'inspection indépendante. Le journal initial n'est pas requalifié en exécution intégralement réussie.

Sources de départ : commit `967b4ea94262cd843b8c405515f46254b37fa154`, avec les modifications locales documentées. Il ne s'agit pas encore d'un commit de release intégré/revu ni d'une validation CI. Les [reçus conservés](release-evidence/android-1.0.0-2026-11-02/ANDROID-PROVENANCE.json) donnent les empreintes des sources, le patch applicatif, les paquets et les limites. Les reçus laissent `deviceValidated=false` et `published=false`.

Contrôles source locaux : **75 tests Node réussis, un test POSIX ignoré sur Windows**, **19 tests Python réussis** (11 distribution + 8 vérificateur Android), syntaxe PowerShell/YAML/JavaScript et audit de préparation valides. Les tests de génération couvrent l'idempotence, le rafraîchissement des plugins/dépendances et les règles ProGuard absentes ; les tests du vérificateur couvrent les mauvais ELF, les domaines HTTP indus, les noms de ressources optimisés et les formats de sortie de signature.

## Protocole initial — historique, ne pas rétrograder pour le rejouer

Utiliser uniquement les APK signés accompagnés des reçus de cette préparation. Le paquet de départ interne a un `versionCode` **999999** ; le candidat final a **1000000**, avec la même identité, le même certificat et les mêmes fichiers natifs/frontend. Ce scénario ne constitue pas une transition entre deux versions publiques.

**Le premier lancement de ce scénario a échoué. Sur le téléphone ayant reçu le diagnostic 1000001, poursuivre avec le correctif 1000002 ; ne plus tenter d'installer les anciens paquets ni désinstaller pour les remettre.**

1. Transférer d'abord le paquet de départ interne sur le téléphone (USB en transfert de fichiers, par exemple), puis l'ouvrir dans le gestionnaire de fichiers. Autoriser cette source d'installation seulement si Android le demande et si le fichier est celui fourni. En cas de blocage de sécurité, conserver le message et le signaler.
2. Ouvrir Novera. Noter le modèle du téléphone, sa version Android, la mémoire disponible et la version de WebView si connue.
3. Créer une discussion témoin contenant **« Test Android Novera — conservation »**, changer un réglage visible et, si possible, joindre un petit document synthétique. Ne pas employer une conversation personnelle comme témoin.
4. Fermer complètement Novera et le rouvrir : discussion, pièce jointe et réglage doivent rester présents. Si un fournisseur cloud est configuré, vérifier aussi que sa clé reste utilisable après redémarrage, sans jamais la transmettre dans le compte rendu.
5. Installer ensuite le candidat final **par-dessus**, sans désinstaller le paquet de départ ni effacer ses données. Android doit proposer une mise à jour. En cas de signature incompatible ou de demande de désinstallation, arrêter l'essai et conserver le message.
6. Rouvrir Novera : retrouver la discussion témoin, la pièce jointe, le réglage et le fournisseur configuré. Tester un échange cloud si disponible ; tester séparément un petit GGUF compatible si le téléphone le permet.
7. Tester une interruption réseau et un redémarrage de l'application. Le contenu local doit rester accessible ; les erreurs réseau doivent être compréhensibles.

Si le candidat final est déjà installé, ne pas désinstaller pour forcer le retour au paquet de départ : signaler cet état et préparer un nouveau scénario de mise à jour adapté.

## Retour attendu

```text
Téléphone / RAM / Android / WebView :
Paquet de départ : installation et premier lancement :
Discussion, pièce jointe, réglage et secret après fermeture/réouverture :
Installation du paquet final par-dessus, sans effacer les données :
Contenu retrouvé après mise à jour :
Cloud / modèle local testé / résultats séparés :
Interruption réseau / redémarrage :
Message exact de tout problème (sans secret) :
```

## Publication restante

Après réception du résultat téléphone : conserver les preuves et les octets exacts, sauvegarder l'identité de signature, intégrer et vérifier les sources finales, préparer le brouillon Android avec provenance/empreintes et notes. Toute future release choisie comme `latest` doit préserver les manifests desktop, CLI et portable existants. La présence d'un APK ne doit pas interrompre leurs canaux.

La première publication Android doit refléter la portée réelle des essais. Ne pas annoncer Google Play, iOS, une accélération GPU ou une transition entre deux versions publiques sur la seule base de cette préparation.
