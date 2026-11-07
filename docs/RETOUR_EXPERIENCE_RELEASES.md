# Novera — problèmes à éviter et méthode pour les prochaines sorties

Établi le **2 novembre 2026**, après les sorties 1.0.0 Windows x64, Windows ARM64, Linux x64, CLI x64 et Windows x64 portable.

Ce fichier sert de mémoire pratique avant de préparer macOS, Android/iOS ou une nouvelle mise à jour. Il rassemble les incidents réellement rencontrés et les actions qui ont permis de progresser. Les préparations recommandées pour les plateformes restantes sont indiquées séparément ; elles ne sont pas présentées comme des validations déjà obtenues.

**Disponibilité de référence : [LAUNCH_STATUS.md](LAUNCH_STATUS.md).** Les bilans datés du 1er novembre restent des historiques, même lorsqu’ils contiennent « publication bloquée ». Pour les commandes détaillées : [BUILD_AND_RELEASE.md](BUILD_AND_RELEASE.md) et [FUTURES_VERSIONS.md](FUTURES_VERSIONS.md).

## 1. Commencer par les vrais prérequis

Avant une compilation longue, remplir une fiche avec la plateforme, l’architecture, le format, la version applicative, le canal de mise à jour, les accès de signature disponibles et le matériel de test prévu.

| Prochaine cible | Ce que nous avons déjà | Ce qu’il faut obtenir ou vérifier avant publication |
| --- | --- | --- |
| macOS Apple Silicon | Candidats inspectés, signatures updater et remplacements natifs contrôlés en CI. | Identité Apple de distribution, signature/notarisation du paquet final, contrôle du canal public et du parcours réel sur Mac. |
| macOS Intel | Candidats x64 inspectés et essais natifs distincts de ceux d’Apple Silicon. | Même chaîne de distribution Apple, contrôle sur Intel et dépendances adaptées ; ne pas reprendre le résultat ARM64 comme preuve Intel. |
| Android | APK debug ARM64 inspectée ; signature debug, ELF et alignement contrôlés. | Trois audits mobiles, identité de signature durable, canal de distribution choisi et installation/mise à jour sur appareil. |
| iOS | Candidat simulateur interne. | Équipe Apple, identifiants et accès nécessaires, provisioning, build pour appareil et essais réels via le canal retenu. |
| Prochaine version Windows/Linux/portable | Paquets publics 1.0.0 et canaux signés disponibles. | Véritable transition de la version publique précédente vers la nouvelle, dans l’interface et avec conservation des données. |

Préparer les certificats et accès dans les emplacements sécurisés prévus. Ne jamais mettre leurs valeurs dans ce fichier, un ticket, le chat, Git ou un artefact. Vérifier les exigences officielles Apple/Google et les outils disponibles au moment de chaque sortie ; les références de ce dépôt ne sont pas une garantie de règles de store inchangées.

## 2. Incidents transversaux : le raccourci à garder

| Problème rencontré | Correction ou méthode à réutiliser |
| --- | --- |
| Recompiler une application entière pour corriger seulement son banc d’essai. | Séparer compilation et validation. Réutiliser les mêmes octets signés si les sources applicatives sont inchangées, avec contrôle du diff, des empreintes et des signatures. |
| Un workflow échoue après avoir compilé et signé correctement. | Conserver le résultat de chaque étape. Un paquet peut être retenu pour diagnostic ou revalidation ; ne jamais qualifier le workflow complet de réussi. |
| Le résultat de l’API GitHub paraît bloqué sur une ancienne étape. | Forcer une lecture fraîche des métadonnées ; nous avons utilisé un paramètre de lecture unique. Recontrôler aussi le commit et l’ID du run, sans se fier à un ancien JSON local. |
| Envoi de plusieurs gigaoctets très lent depuis le PC. | Transférer depuis la CI les artefacts déjà contrôlés vers un brouillon privé. Vérifier les digests renvoyés par GitHub ; ne pas reconstruire pour changer seulement le lieu de transfert. |
| `hashlib.file_digest` absent du Python Ubuntu utilisé en CI. | Épingler explicitement l’interpréteur ou calculer SHA-256 par blocs, comme dans `stage-portable-assets.py`. Vérifier les versions réellement utilisées avant d’employer une API récente. |
| Action de cache refusée par la politique du dépôt. | Employer une action autorisée et épinglée, ou fonctionner sans cache. Garder la politique existante. Le cache accélère ; il ne constitue pas une preuve de validité. |
| Le checkout propre ne contient pas `.build`. | Créer explicitement les dossiers de travail ; ne pas dépendre d’un répertoire laissé par une session locale. |
| Un fichier caché indispensable disparaît de l’archive Actions. | Vérifier le contenu réel après téléchargement, y compris les marqueurs tels que `.novera-image-runtime`. Inclure seulement les fichiers cachés autorisés, jamais les secrets par un ajout global. |
| Notices ou ressources absentes du ZIP, malgré un exécutable correct. | Comparer la liste complète des fichiers et leurs empreintes ; garder les licences, notices et `resources/SIGNATURE.txt`. |
| Compter sur une liste de versions copiée dans plusieurs guides. | Lire les configurations de référence et le workflow exécuté. Relever les valeurs dans le reçu de la sortie, plutôt que maintenir plusieurs copies divergentes. |

Un artefact Actions est temporaire. Conserver à temps les paquets retenus, leurs reçus et leurs digests ; les sorties publiques doivent avoir leurs assets permanents. Les workflows actuels utilisent une rétention de 14 jours pour de nombreux artefacts : relire la valeur du job concerné.

## 3. Environnement et interface : diagnostiquer la bonne couche

Les incidents Windows donnent une méthode utile pour les autres plateformes : identifier si l’échec vient de la préparation de l’hôte, du lancement, du moteur graphique, du stockage, de l’application ou du réseau.

- **Linker Windows :** Git Bash pouvait sélectionner son `link.exe` à la place de MSVC. Réutiliser [ci-msvc.ps1](../scripts/distribution/ci-msvc.ps1), avec un chemin explicite.
- **Runtime MSVC :** conserver `STATIC_VCRUNTIME=true` entre compilation Tauri et tests Cargo associés ; le mélange a produit des erreurs de liaison après un build pourtant réussi.
- **Profil synthétique :** reproduire l’arborescence standard `USERPROFILE/AppData/Local` et `AppData/Roaming`. Des dossiers artificiels séparés ont empêché la résolution du cache Windows.
- **Droits et premier lancement :** un dossier de test doit être accessible au compte qui lance réellement l’application. Un fichier de verrou absent avant le premier lancement signifie qu’aucun verrou n’existe encore.
- **WebView2 sur Windows Server :** les essais graphiques du portable sont restés infructueux, y compris après des adaptations du compte de test. La réussite des composants natifs en CI et celle de l’interface Windows locale sont donc conservées comme deux preuves distinctes.

Pour macOS/mobile, appliquer la même séparation sans supposer que la cause Windows s’y retrouve : conserver le journal natif, le code de sortie, l’architecture, le système, le profil de test et, si possible, une capture du vrai écran.

Un processus encore actif ne prouve pas que l’interface fonctionne. Une capture seule ne prouve pas une installation. Si un environnement de test ne couvre pas une étape, documenter la limite et obtenir cette preuve dans un environnement adapté. Ne pas désactiver les protections du poste pour fabriquer un résultat positif.

## 4. macOS : préparer Apple Silicon et Intel séparément

### Enseignements confirmés dans le dépôt

Les candidats inspectés ont des minima **macOS 14.0 pour ARM64 avec MLX** et **13.0 pour Intel avec GGUF**. Les premiers paquets, antérieurs au contrôle, demandaient macOS 15. Ces valeurs décrivent ces candidats ; il faut les recalculer pour les nouvelles dépendances.

La cohérence doit porter sur la cible de compilation, `LSMinimumSystemVersion` et les commandes de chargement de **chaque Mach-O emballé**, pas uniquement l’exécutable principal. Réutiliser [ci-check-macos.mjs](../scripts/distribution/ci-check-macos.mjs) et son reçu `MACOS-COMPATIBILITY.json`. Vérifier aussi les bibliothèques embarquées, les workers, les shaders requis et l’absence de chemins de dépendances propres au runner.

MLX et ses ressources appartiennent à la variante ARM64 contrôlée ; le candidat Intel inspecté l’exclut. Le Xcode retenu doit être celui fixé et testé par le workflow ; ne pas supposer que le Xcode par défaut d’un nouveau runner convient.

### Séquence à exécuter pour la sortie Mac

1. Confirmer les accès Apple et les deux machines/architectures de test avant de lancer les builds de distribution.
2. Vérifier la chaîne Xcode/SDK/Rust et les minima effectifs de toutes les dépendances natives.
3. Finaliser l’application et ses ressources, puis accomplir les étapes de signature/notarisation Apple nécessaires au canal choisi. Recontrôler le résultat final sur Mac.
4. Préparer séparément le DMG de première installation et l’archive `.app.tar.gz` attendue par l’updater, avec un nom distinct par architecture. Comparer leurs contenus applicatifs.
5. Signer les octets finaux de l’archive d’update avec la clé Novera et les vérifier indépendamment. Tout changement ultérieur demande de nouvelles empreintes et une nouvelle signature updater.
6. Tester installation, premier lancement, contrôle manuel, remplacement et données conservées sur chaque architecture ; après publication, vérifier le vrai endpoint public.

Une signature updater Novera ne remplace pas la signature/notarisation Apple. Les essais natifs déjà obtenus sont décrits dans [INSTALL_UPDATE_VALIDATION.md](INSTALL_UPDATE_VALIDATION.md) ; leurs historiques ne certifient pas un parcours complet entre deux versions publiques.

## 5. Android : transformer le candidat debug en vraie distribution

### Ce qui est acquis

Le [candidat du run 41281439087](https://github.com/TRON-ABS/Novera/actions/runs/41281439087) a été inspecté : identité `.debug`, six ELF ARM64 alignés à 16 Ko, signature APK v2 Android Debug et contrôle zipalign. Ce résultat concerne cet APK ; il ne valide ni une identité de production ni un appareil réel.

La source de référence des outils est [scripts/android/toolchain.json](../scripts/android/toolchain.json). Le [réglage d’environnement](../scripts/android/environment.ps1) cherche le JDK exact et limite les adaptations au processus. Les plugins Android adaptés sont copiés dans le projet généré ; le cache Cargo n’est pas modifié. Garder les correctifs de génération reproductibles et vérifier qu’une régénération ne les supprime pas ou ne duplique pas leurs blocs.

### À faire avant la publication Android

- [ ] Fermer avec des preuves les trois revues de [readiness.json](../scripts/android/readiness.json) : dépendances mobiles, permissions et stockage. Au 2 novembre, elles sont toutes à `false`.
- [ ] Choisir le canal de distribution et préparer l’identité de production ainsi que sa signature durable et sa sauvegarde sécurisée.
- [ ] Vérifier la séparation debug/production et la progression du numéro de build/versionCode. Conserver l’identité et la chaîne de signature nécessaires aux mises à jour.
- [ ] Recontrôler l’APK/AAB effectivement livré : architectures, bibliothèques natives, alignements applicables, ressources, permissions et signature finale. Les six ELF du précédent APK ne prouvent rien sur un APK reconstruit.
- [ ] Installer sur appareil, tester le lancement, le stockage des discussions/modèles et les capacités locales réellement disponibles. Reprendre les essais après refus d’une permission, interruption réseau, arrêt et redémarrage.
- [ ] Exercer le mécanisme de mise à jour du canal choisi en conservant les données ; ne pas recopier automatiquement le mécanisme desktop Tauri.

Ne pas désinstaller pour contourner un changement de signature lors d’un essai censé prouver une mise à jour avec données conservées. Les limitations mémoire/matériel doivent être testées séparément des fonctions cloud ; une réussite cloud ne certifie pas un moteur local.

## 6. iOS : distinguer simulateur, appareil et distribution

Le candidat disponible reste un **candidat simulateur**. Il sert à préparer l’application ; il ne constitue pas une validation sur iPhone/iPad.

Avant une sortie iOS :

- [ ] Préparer l’équipe Apple, l’identifiant applicatif, les accès et le provisioning adaptés au canal retenu.
- [ ] Construire et inspecter la cible pour appareil, son architecture et son minimum système, indépendamment du simulateur.
- [ ] Vérifier les capacités, entitlements, permissions, ressources et dépendances mobiles réellement incluses.
- [ ] Tester sur appareil les discussions, pièces jointes, modèles compatibles, accès réseau et reprise après fermeture ou interruption.
- [ ] Tester la mise à jour par le canal Apple retenu, avec les versions de build appropriées et conservation du profil.
- [ ] Documenter ce qui nécessite un appareil, un compte ou une action du mainteneur avant de qualifier la distribution de prête.

Les clés, le stockage sécurisé et les permissions Android ne se transposent pas automatiquement à iOS. De même, les particularités Windows DPAPI ou macOS desktop ne prouvent pas le comportement du stockage sécurisé sur mobile : vérifier l’implémentation de chaque cible.

## 7. Données : préserver le contenu, pas seulement le démarrage

L’expérience portable a révélé des problèmes qui doivent entrer dans les prochaines matrices de migration :

| Cas à conserver dans les essais | Résultat attendu |
| --- | --- |
| Un texte de message ressemble à un ancien chemin absolu. | Le texte reste identique ; seuls les champs représentant réellement des chemins sont déplacés. Même précaution pour titres, prompts et modèles de texte. |
| Pièces jointes, réglages contenant du JSON et chemins SQLite. | Les références appartenant à l’ancien dossier suivent le nouveau ; les références externes restent externes, les contenus de documents/chunks restent intacts. |
| Discussion JSONL de plus de 64 Mio. | Lecture et réécriture en flux ; ne pas introduire un plafond qui casse les longues conversations. |
| Dossier déplacé, avec espaces et accents. | Les données sont retrouvées au vrai nouvel emplacement, puis encore après mise à jour. |
| Remplacement interrompu ou fichier Program manquant. | Récupération/restauration vérifiée ; aucune suppression des données utilisateur. |
| Secrets sur un autre compte ou PC. | Échec de déchiffrement traité proprement et reconnexion possible ; pas d’export en clair pour simuler la portabilité. |

Le portable garde `Program` et `Data` séparés. Cette organisation ne doit pas être confondue avec les emplacements système des applications installées ou les bacs à sable mobiles. Un ZIP d’application installée n’est pas, à lui seul, un portable.

Pour la prochaine évolution du schéma de données, prévoir une sauvegarde de test et un plan de compatibilité avant migration. Un retour à un ancien binaire ne garantit pas qu’il puisse relire une base migrée par la nouvelle version. Tester les sauvegardes et la reprise avec des profils synthétiques représentatifs ; ne jamais utiliser les conversations personnelles comme fixtures de publication.

## 8. Cycle conseillé pour une nouvelle version

1. **Cadrer.** Choisir les cibles et formats réellement livrés. Distinguer un ajout de compatibilité conservant 1.0.0 d’une vraie mise à jour applicative, dont la version doit être supérieure à celle installée pour être proposée.
2. **Préparer la version.** Examiner [prepare-version.mjs](../scripts/distribution/prepare-version.mjs) et tous les identifiants/compteurs propres aux plateformes. Rechercher les noms, tags et gardes encore figés sur `1.0.0` dans les scripts et descripteurs de ce cycle ; ne pas effectuer un remplacement global dans l’historique.
3. **Construire.** Compiler avec les configurations de production et le bon canal réellement embarqué. Le frontend et le backend doivent tous deux activer le contrôle d’update prévu ; un manifeste seul ne corrige pas un ancien client désactivé.
4. **Inspecter.** Contrôler architecture, ressources, notices, minima système, fichiers cachés autorisés et absence de profils/modèles personnels. Sur Windows, distinguer l’EXE brut des octets préparés par le bundler ; ne pas généraliser l’ancienne correction du marqueur réservé NSIS à d’autres formats.
5. **Signer les fichiers finaux.** Conserver la provenance, les SHA-256 et les signatures. Ne pas reconditionner un fichier après sa signature updater. Prévoir la sauvegarde et, si nécessaire, une transition explicite de clé plutôt qu’un remplacement improvisé.
6. **Tester les paquets exacts.** Première installation, refus de contenu altéré, absence d’offre à version égale, mise à jour et conservation des données. Conserver séparément les preuves natives, graphiques, locales et CI.
7. **Tester l’application publique précédente → candidat final.** Exercer dans la vraie application l’offre, le téléchargement, la vérification, l’installation, le redémarrage et les données retrouvées, avec les octets destinés à la sortie et un canal de test isolé si nécessaire. Ajouter interruption/reprise et échec de remplacement. Avant publication de la nouvelle version, ne pas appeler cet essai une transition entre deux versions publiques. Le programme de contrôle annonçant `0.9.9` pour installer `1.0.0` ne remplace pas ce parcours applicatif.
8. **Préparer le brouillon privé.** Charger les fichiers vérifiés, confirmer les tailles et digests serveur, relire les notes et faire passer les contrôles du commit final. Réutiliser les PR et tenir `PR.md` à jour.
9. **Figer la publication.** Après fusion, créer le vrai tag sur le commit revu, puis fournir explicitement `tag_name` et la cible lors des modifications du brouillon et de sa publication. Vérifier ces valeurs avant et après ; garder les anciens paquets publiés immuables.
10. **Contrôler publiquement.** Vérifier sans authentification les fichiers et manifests servis et leurs empreintes/signatures. Une fois les deux versions publiques disponibles, refaire le parcours complet depuis l’ancienne application sur le vrai canal publié : c’est cette preuve qui établit la transition publique → publique. Sur mobile, contrôler l’accès selon le canal retenu. Déclarer séparément les étapes qui n’ont pas été testées.
11. **Annoncer.** Mettre à jour README, disponibilité et vitrine seulement quand les téléchargements annoncés sont disponibles. Vérifier ensuite la page déployée, sa révision, ses liens et ses images.

### Attention à la release GitHub marquée « latest »

Les clients utilisent des URL de type `releases/latest/download/...`. **Chaque release choisie comme dernière release doit conserver tous les manifests réellement utilisés par les clients publiés :**

- `latest.json` : applications desktop installées ;
- `latest-novera-cli.json` : CLI Novera publiée avec le nom d'exécutable `novera` ;
- `latest-cli.json` : ancien canal CLI, à conserver si des clients publiés le consultent ; ne pas le substituer au canal Novera ;
- `latest-portable.json` : portable Windows.

Pour un canal qui ne change pas, reprendre ses octets valides et ses références de paquets immuables. Pour celui qui évolue, n’annoncer que les plateformes construites, signées et vérifiées, sans perdre les autres distributions déjà servies. Une release de compatibilité ou une sortie Mac ne doit pas rendre les mises à jour Windows, Linux, CLI ou portable introuvables. Les canaux mobiles choisis seront documentés séparément.

**Une version globale par manifest desktop.** Ne pas annoncer `version: 1.0.1` avec une entrée de plateforme pointant encore vers un paquet 1.0.0 : la signature ne corrige pas cette incohérence de version. Vérifier ensemble les cinq plateformes déjà publiques avant de basculer ce canal statique commun. Les canaux CLI et portable sont indépendants et peuvent conserver leur propre version précédente jusqu'à leur livraison ; préserver leurs vrais fichiers et leurs références.

## 9. Outils et preuves à réutiliser

| Besoin | Point de départ durable |
| --- | --- |
| Choisir les cibles, lancer les contrôles et déployer la vitrine | [novera-build-all.yml](../.github/workflows/novera-build-all.yml) ; relire ses inputs avant lancement. |
| Valider un candidat portable sans recompiler l’application | [reuse-portable-candidate.py](../scripts/distribution/reuse-portable-candidate.py), [novera-validate-portable.yml](../.github/workflows/novera-validate-portable.yml) ; comparer les sources applicatives et documenter le mode choisi. |
| Transférer les gros fichiers depuis la CI | [stage-portable-assets.py](../scripts/distribution/stage-portable-assets.py), cible explicite `stage-portable` ; uniquement le brouillon privé prévu et les fichiers du descripteur revu. |
| Contrôler les canaux et fichiers publics | [verify-public-release.mjs](../scripts/distribution/verify-public-release.mjs), [workflow public](../.github/workflows/novera-verify-public-release.yml) ; créer le descripteur de la nouvelle sortie, ne pas réutiliser aveuglément les empreintes 1.0.0. |
| Retrouver le périmètre des remplacements natifs | [INSTALL_UPDATE_VALIDATION.md](INSTALL_UPDATE_VALIDATION.md) et les bilans de sortie datés. |
| Retrouver les contraintes du portable | [WINDOWS_PORTABLE.md](WINDOWS_PORTABLE.md), [bilan portable 1.0.0](RELEASE_WINDOWS_PORTABLE_1.0.0.md). |

Pour l’état de référence public : [contrôle 41504580547](https://github.com/TRON-ABS/Novera/actions/runs/41504580547), trois manifests, 26 fichiers et sept signatures ; [contrôles natifs portables 41499152235](https://github.com/TRON-ABS/Novera/actions/runs/41499152235) ; [vitrine déployée 41506430394](https://github.com/TRON-ABS/Novera/actions/runs/41506430394). Ces chiffres décrivent la sortie du 2 novembre, pas une exigence de nombre fixe pour les futures sorties.

Les scripts opérationnels temporaires de `.build` aident au diagnostic, mais ne sont pas une procédure durable de référence. Avant réutilisation, vérifier leurs IDs de release, branches, versions, hypothèses et préconditions. Ne jamais rejouer une publication ancienne telle quelle.

## 10. Fiche à ajouter à chaque prochain cycle

```text
Date / responsable :
Version applicative précédente → nouvelle :
Cibles, architectures, formats et canaux concernés :
Identités et accès de signature disponibles (sans valeur secrète) :
Commit de compilation / run / digest de l’artefact source :
Commit de préparation et de validation si différent :
Paquets finaux : noms, tailles, SHA-256, signatures :
Hôtes / OS / appareils réels utilisés pour les essais :
Installation, interface, mise à jour et données : résultats distincts :
Transition entre versions publiques réellement exercée :
Incident rencontré → cause établie → correction → preuve :
Étapes non couvertes, contraintes et actions restantes :
PR / commit fusionné / tag / release :
Preuves des téléchargements publics et du canal client :
Révision de la vitrine et documentation mises à jour :
```

Ajouter les nouveaux enseignements ici avec une date et une preuve, puis mettre à jour la disponibilité séparément. Une compilation réussie, une signature, une installation, un parcours d’update et une publication sont cinq résultats différents.

**TRON-ABS** — *The art of Human with AI*

## 11. Complément Android du 2 novembre 2026

Les trois revues Android initialement ouvertes sont maintenant consignées dans [ANDROID_RELEASE_REVIEW_2026-11-02.md](ANDROID_RELEASE_REVIEW_2026-11-02.md). Cette fermeture concerne les sources ; les preuves du paquet et du téléphone restent dans [RELEASE_ANDROID_1.0.0.md](RELEASE_ANDROID_1.0.0.md). La [note de reprise macOS/iOS](REPRISE_MACOS_IOS.md) conserve les blocages Apple pendant la priorité Android.

- **Projet Android généré ancien :** vérifier les vrais noms des bibliothèques. Le dossier local conservait `libjan_llama_worker.so`, alors que le code attend `libnovera_llama_worker.so`. Le contrôle des six ELF finaux doit refuser les fichiers obsolètes et supplémentaires.
- **Secrets Android :** une écriture keyring réussie ne prouve pas une persistance. Le backend Android de keyring 3 est un mock en mémoire ; utiliser explicitement le stockage privé chiffré et tester une fermeture/réouverture sur téléphone.
- **Écran noir malgré un APK valide :** le premier essai sur HUAWEI P20/Android 10 a révélé `webviewCreated=false`. Ni la configuration commune ni Android ne déclaraient de fenêtre ; Tauri ne crée pas une fenêtre implicite dans ce cas. Déclarer `app.windows` pour la cible mobile, puis tester réellement le lancement. Les indicateurs de permission HTTP ne doivent pas détourner le diagnostic d'une vue qui n'a jamais été créée. Vérifier ce point séparément pour iOS avant sa reprise.
- **Tauri sous Windows sans liens symboliques :** Cargo peut réussir le build puis Tauri échouer au lien de `libapp_lib.so`. Conserver les deux résultats séparément. Copier les octets vérifiés et conditionner avec Gradle, en sautant seulement la tâche Rust déjà réussie ; ne pas changer les protections du poste pour obtenir un succès apparent.
- **Release différente du debug :** les règles ProGuard consommateur omises de certains plugins et le plantage K2 de Lint n'apparaissaient pas dans l'APK debug. Adapter uniquement les copies générées, garder Lint actif et rendre la génération idempotente.
- **Inspection des ressources optimisées :** R8/AAPT peuvent renommer `res/xml/network_security_config.xml` en un nom court. Résoudre le fichier depuis l'identifiant de ressource du manifeste compilé, puis contrôler sa structure et ses valeurs ; ne pas déduire la politique réseau du seul XML source.

## 12. Cycle 1.0.1 du 7 novembre 2026 — enseignements en cours

Le mainteneur autorise la mise à jour de ce mémo pendant la sortie. Les résultats et liens évoluent dans [le suivi 1.0.1](RELEASE_1.0.1_2026-11-07.md) ; aucun résultat d'un build lancé n'est annoncé réussi avant sa fin.

| Observation confirmée | Amélioration à réutiliser |
| --- | --- |
| Le dépôt local contenait de nombreux travaux validés, des sorties `.tmp`, des copies Android générées et des profils de test. | Construire une liste explicite des sources à publier. Exclure les sorties de compilation, journaux, profils `test-data-ThreadId*` à toute profondeur et copies `android/.tauri`. Préserver les fichiers locaux ; ne pas utiliser `git add .` pour une sortie. |
| `gh` et `yarn` n'étaient pas directement accessibles dans le shell, alors que Git, Node et Corepack fonctionnaient. | Contrôler les outils avant les opérations longues. Utiliser le Corepack du projet pour Yarn et les accès GitHub existants sans afficher ni enregistrer les identifiants. Un échec de résolution de commande n'est pas un échec de test applicatif. |
| Les anciens guides parlaient de trois manifests, mais la CLI Novera publique utilise `latest-novera-cli.json`. | Relever les endpoints dans les sources des clients et les assets de la vraie dernière release. Préserver aussi le nom historique s'il reste utilisé ; ne pas compter les manifests à partir d'un ancien tableau. |
| Les nouveaux modèles API sont partagés entre les 104 langues ; certains catalogues publics sont accessibles sans clé. | Vérifier noms, identifiants et modalités dans les sources officielles et les réponses réelles du parseur. Tester les nouveaux champs d'appel, les modèles personnels conservés et les limites de compte/région. Un GET de catalogue ne prouve pas une génération réussie. |
| Le premier commit local a été refusé faute d'identité Git configurée. | Vérifier l'identité de commit avant de publier ; reprendre l'identité publique déjà utilisée par le mainteneur pour ce dépôt, sans modifier la configuration globale du poste. |
| Les cinq premiers builds desktop 1.0.1 échouent sur l'import par défaut de `tar`, retiré de sa version épinglée actuelle. | Après une migration de dépendances, exercer aussi les scripts de préparation exécutés seulement en CI. Charger l'espace de noms `tar` et vérifier une vraie extraction gzip-tar. Un build Web et les tests de l'application ne couvrent pas le téléchargement des runtimes natifs. [Échec Windows](https://github.com/TRON-ABS/Novera/actions/runs/42341089285). |
| Les clés Android semblaient absentes de `LOCALAPPDATA/Novera/Signing/Android`, mais existaient dans le stockage virtualisé de Codex (`Packages/OpenAI.Codex_…/LocalCache/Local/Novera/Signing/Android`). | Comparer `LOCALAPPDATA`, le dossier Windows connu et le stockage de l'hôte qui a créé la clé. Chercher les noms de fichiers avant de conclure à une perte. Ne jamais recréer une identité pour résoudre un simple problème de chemin. |
| Les clés étaient rangées sous le même nom de dossier que l'application installée. | Utiliser désormais `LOCALAPPDATA/Novera-Signing/Android`, avec ACL privée et résolution commune aux scripts de création, signature, build et export. Conserver les originaux ; prendre en charge les anciennes clés et refuser une nouvelle création si une identité existe déjà. |
| La restauration Android a retrouvé `novera-android.p12`, `password.dpapi` et le certificat public d'origine. | Vérifier les empreintes des copies, déchiffrer le mot de passe uniquement en mémoire, ouvrir le PKCS12 puis exporter son certificat public et comparer son SHA-256 à `scripts/android/release.json`. La restauration de ce cycle réussit sans changer l'identité publiée. DPAPI CurrentUser reste lié au compte Windows ; prévoir aussi l'export chiffré de récupération via `scripts/android/export-signing-recovery.ps1`, avec un mot de passe conservé séparément. |
| Les CLI propres échouent car `novera-inference` embarque maintenant llama.cpp et le clone épinglé est absent du runner. | Préparer le clone vérifié avant Cargo, y compris pour une CLI sans interface. Le cache local d'un développeur ne vaut pas prérequis CI. |
| Tauri 2.7 génère `val implementation = configurations.getByName("implementation")`, alors que le préparateur Android ne reconnaissait que `val implementation by configurations`. | Accepter et tester les deux formes déclaratives connues, puis intégrer les dépendances sans désactiver Lint ni élargir arbitrairement le code Kotlin accepté. |
| Le portable échoue à compiler après la migration `sha2` : le résultat n'implémente plus `LowerHex`. | Encoder explicitement les octets du SHA-256, contrôler le vecteur connu `abc` et rejouer les tests de déplacement, verrous, corruption et remplacement. Les features optionnelles de distribution doivent être testées indépendamment du desktop installé. |
| Les scripts de packaging/signature/validation portables étaient figés en 1.0.0 et réutilisaient le moteur de cette sortie. | Lire la version applicative canonique, refuser un reçu d'une autre version, reconstruire le worker depuis le pin courant et contrôler son identité avant emballage. Distinguer la provenance du runtime image réutilisé de celle du nouveau moteur texte ; ne jamais étiqueter un ancien worker comme nouveau. |
| Le moteur embarqué de la CLI Windows échoue sur des chemins CMake commençant par `//?/D:/…`, issus de `Path::canonicalize()`. | Partir du chemin absolu fourni par Cargo et joindre les composants sans ajouter le préfixe Windows `\\?\`. Vérifier le comportement sur un vrai runner Windows ; une compilation Unix ne couvre pas cette réécriture. |
| Windows PowerShell 5 transforme un avertissement Tauri sur stderr en `NativeCommandError` avec `ErrorActionPreference=Stop`, alors que le build natif peut continuer. | Utiliser `pwsh` pour les scripts de release et conserver le code de sortie réel. Lire le journal courant et sa date ; ne pas diagnostiquer une relance à partir d'un fichier d'un ancien build. Ne pas confondre l'avertissement de compatibilité émis par Tauri et une preuve d'échec réel de Gradle. |
| Le build Linux ne trouve plus `zbus::Proxy` après la migration en 6.2.1 ; le compilateur indique que le symbole existe mais est conditionné par la feature `proxy`. | Lorsque `default-features=false`, réexaminer les features du nouveau manifeste amont, pas seulement les noms d'API. Activer explicitement `proxy` avec `tokio` pour les appels D-Bus existants, puis compiler réellement Linux. Une validation Windows ne couvre pas cette dépendance conditionnelle. |
| L'APK signé local compile, mais le projet Android régénéré en CI échoue sur `rootDir = config.rootDirRel` : Gradle expose déjà un `rootDir` en lecture seule. | Adapter ensemble le modèle `BuildTask.kt` et ses appels dans `RustPlugin.kt`, y compris dans un projet fraîchement généré. Le répertoire local déjà réparé ne démontre pas que le générateur fonctionne sur un hôte vierge. |
| La génération Tauri 2.12.4 ajoute aussi `projectDir = project.projectDir.path`, absent de l'ancien projet local. La tâche adaptée ne déclare pas cette propriété String et Gradle résout son `projectDir` File en lecture seule. | Retirer cette affectation générée précise : notre tâche calcule déjà son répertoire avec `File(project.projectDir, root)`. Réappliquer les adaptations via le hook de paramètres Gradle après une régénération Tauri. Couvrir le modèle neuf, ses paramètres conservés et une seconde configuration idempotente. Ne pas attribuer toute erreur « val cannot be reassigned » à la propriété précédemment corrigée. |
| Le disque C: se remplit pendant la préparation. | Inventorier les tailles, vérifier qu'aucun Cargo/rustc local ne travaille, puis supprimer uniquement les caches Rust régénérables (`debug/build`, `deps`, `incremental`, `.fingerprint` et cibles de test dédiées). Conserver exécutables utiles, caches release actifs, paquets, preuves, modèles et clés. Ce cycle libère environ 50 Go et conserve 75 Go libres après nettoyage. |
| Le passage des notes « en préparation » à une disponibilité publique risque de recopier les anciennes preuves de téléphone ou d'oublier certaines langues. | Préparer les 104 versions dans un dossier d'aperçu, garder `published=false` jusqu'au contrôle public et refuser l'annonce depuis cet état. Mettre à jour ensemble titre, statut, liens, compteurs Android et limites ; ne jamais transformer une confirmation du build 1000012 en validation du 1000013 par remplacement de chiffres. |
| Les bancs d'installation et d'interface contenaient des noms de paquets, versions et empreintes d'EXE de la 1.0.0. | Exiger un descripteur de la version applicative courante avec noms, IDs et empreintes revus. Refuser une plateforme non encore préparée ; ne pas la remplacer silencieusement par un ancien paquet. Consigner séparément la version installée et celle du feed public lorsqu'un candidat est plus récent que la sortie en ligne. |
| Après activation de `zbus/proxy`, Linux révèle que les setters du builder ne renvoient plus de `Result`. | Examiner toute la chaîne d'appels dans la version épinglée, retirer les `?` des setters `destination`, `path` et `interface`, et conserver `build().await?`, qui reporte les erreurs de validation. Ne pas supprimer la gestion d'erreur finale pour faire compiler. |
| Les gros paquets Actions doivent rejoindre les brouillons GitHub sans un nouvel envoi depuis le poste. | Utiliser un transfert CI limité à un brouillon existant : IDs exacts, commit, empreinte de l'archive, tailles et empreintes des paquets, signatures contre la clé épinglée. Recontrôler les empreintes côté GitHub et conserver un reçu ; ce transfert ne publie rien. |
| Une copie de `password.dpapi` seule ne permet pas la récupération après perte du profil Windows. | Conserver aussi une récupération chiffrée indépendante du compte, vérifier qu'elle restitue la même identité et tester la restauration dans un dossier privé neuf. Les copies Android et Desktop ont été vérifiées pour ce cycle. La clé updater commune couvre Windows, macOS, Linux, CLI et portable ; les futures identités Apple exigent leur propre sauvegarde. Garder les codes de récupération séparément des archives et hors de Git. |

Pour préparer les README de publication sans modifier les sources : `node scripts/distribution/publish-readme-release.mjs --preview NOUVEAU_DOSSIER`. Les brouillons conservent les limites de relecture native. L'application normale exige des faits de publication explicites ; la vitrine dispose d'un état publié distinct et testé. Ce mécanisme de documentation ne remplace pas la vérification des paquets et des endpoints publics.

La validation locale de ce cycle comprend 63 contrats Node réussis, 17 contrôles supplémentaires réussis et deux scénarios Windows ignorés par leurs conditions, 16 tests Python de distribution, huit tests Python Android et 23 tests de catalogue dont trois catalogues publics réels. Le build Web/TypeScript réussit. Les suites applicatives complètes passent : 8 069 tests réussis, 20 ignorés. Les compilations natives restent suivies séparément. Les tests ignorés ne sont pas comptés comme réussis.
