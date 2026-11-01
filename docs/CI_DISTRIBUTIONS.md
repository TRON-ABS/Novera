# Compilations Novera sur GitHub Actions

Le 1er novembre 2026, le mainteneur autorise explicitement **toutes les plateformes et variantes**, en confirmant Linux, Android, iOS et macOS, avec contrôle des résultats et mise à jour des MD. Cette autorisation remplace la consigne historique de garder Actions désactivé pour la préparation seule. Aucun profil utilisateur ni discussion du PC du mainteneur n'est envoyé aux runners.

## Lancement manuel

Workflow : [Novera — All distribution candidates](../.github/workflows/novera-build-all.yml). Entrée `target=all`, ou une des onze variantes du [catalogue](../scripts/distribution/release-targets.json). Les quatre variantes Windows x64 partagent un même build afin de conserver le même code et les mêmes dépendances. Une variante Windows demandée séparément produit également les formats Windows associés.

| Variante | Runner / résultat demandé |
| --- | --- |
| Desktop, Setup, MSI, portable | Windows x64 : runtime complet, NSIS, MSI et ZIP |
| Windows ARM64 | Runner ARM64 natif, moteur texte CPU et NSIS |
| Linux | Ubuntu : `.deb` et AppImage, moteur Vulkan |
| macOS | Deux builds natifs séparés Intel / Apple Silicon, DMG et moteur Metal |
| Android | Windows + JDK/SDK/NDK épinglés : APK de test ARM64 |
| iOS | macOS/Xcode : application pour simulateur Apple Silicon |
| Web | Frontend navigateur compilé |
| CLI | Windows, Linux et macOS : binaire et sortie `--help` |

Les applications macOS sont construites séparément par architecture : elles ne sont pas présentées comme un paquet universel dont tous les moteurs auraient deux tranches. Le moteur image Windows x64 n'est jamais copié dans Windows ARM64. La disponibilité des médias sur ces autres plateformes reste propre à leurs moteurs et prérequis ; une compilation ne garantit pas chaque fonction locale.

## Résultats et conservation

Chaque job réussi conserve un artefact GitHub Actions pendant **14 jours**, contenant les fichiers compilés, `candidate.json`, `SHA256SUMS`, les licences et `SIGNATURE.txt` : **TRON-ABS — The art of Human with AI**, avec le souhait d'une belle aventure en français et en anglais. Le portable porte aussi ce message dans son mode d'emploi. Les applications desktop embarquent une notice de signature. Aucun poids de modèle, discussion, clé personnelle, profil ou map privée n'est inclus par le collecteur.

Le commit et le run exacts figurent dans la provenance. Les matrices continuent lorsqu'une plateforme échoue ; le résumé global échoue si une matrice échoue. Les diagnostics de build sont conservés séparément pendant 7 jours quand ils sont disponibles. Un job vert signifie que sa commande et sa collecte ont réussi ; les champs `deviceValidated`, `productionSigned` et `publicReleasePublished` restent faux. Le worker desktop est exécuté avec `--version-json` ; la CLI avec `--help`. Cela ne remplace pas une inférence ni un essai d'installation sur une machine neuve.

Les anciens workflows de publication Jan, notifications et tâches planifiées doivent rester désactivés lors de l'activation du nouveau workflow manuel. Les commandes de ce lot ne publient pas vers npm, AWS, Discord, les stores Apple/Google ou un flux de mise à jour. Les artefacts Actions ne sont pas une release GitHub permanente ; une release exige une préparation et validation distinctes selon [la politique de publication](../OFFICIAL_RELEASES.md).

## Signature et mobile

Au contrôle initial, aucun secret Actions n'est configuré. Aucun certificat ni identité de production n'est inventé. Les signatures de marque TRON-ABS ne constituent pas une signature cryptographique des exécutables.

Les trois audits Android restent explicitement non validés dans `readiness.json`. Le nouveau commutateur `-AllowUnreviewedTestBuild` permet seulement un **APK debug de test sur GitHub Actions**, après tous les contrôles techniques existants. Il n'assouplit pas les builds ordinaires, n'ignore pas un SDK/moteur/permission manquant, ne coche pas les audits et ne certifie pas une distribution publique. Les licences SDK doivent être déjà provisionnées sur le runner : aucun acquittement automatique de nouveaux termes. Les SHA-256 du JDK et des outils Google sont contrôlés.

Le résultat iOS visé est pour **simulateur**, sans prétendre produire une IPA installable sur iPhone. Une archive appareil, TestFlight ou App Store exige l'équipe Apple réelle, les certificats et les profils appropriés. Le placeholder du dépôt est retiré dans la configuration temporaire du candidat simulateur uniquement. L'initialisation et la compilation réelles peuvent encore révéler des dépendances natives à corriger ; leurs résultats doivent être consignés.

## Contrôles avant premier lancement

`actionlint 1.7.12` valide le nouveau workflow. Les YAML sont parsés. Quatre tests du collecteur/politique Android réussissent ; les neuf tests du contrôle des distributions et ses onze références sont valides. Les 223 assertions / 12 scénarios du portable réussissent. La première tentative de contrôle Bash a été bloquée par l'isolation Windows ; les contrôles de syntaxe Bash des trois scripts ont ensuite réussi avec accès approprié. Ces contrôles ne sont pas des compilations multiplateformes.

## Premier lancement distant — 1er novembre 2026

Le mainteneur a explicitement autorisé l'activation de GitHub Actions, la désactivation des anciens workflows et la limitation des actions autorisées. État vérifié après application : **37 anciens workflows désactivés**, un seul workflow actif (`Novera - All distribution candidates`). La politique autorise les actions GitHub et l'action MSVC épinglée utilisée par ce workflow ; aucun secret de signature n'a été ajouté.

Le [run 41272733352](https://github.com/TRON-ABS/Novera/actions/runs/41272733352) est déclenché avec `target=all` depuis le commit `3f072579bbc2e97c15ea2cd4d0c6bf49d3902641`. GitHub a créé onze jobs de compilation, initialement en file d'attente, avec les quatre formats Windows regroupés et plusieurs hôtes pour macOS/CLI. Le résumé dépend de ces matrices. Aucun artefact compilé ni succès distant n'est encore attesté par ce premier relevé. Les résultats ultérieurs doivent conserver le commit exact de leur run plutôt que le HEAD courant.


### Premier correctif issu du run

Le job Web échoue réellement à l'installation immuable Yarn (`YN0028`), avant la compilation : l'entrée racine `novera-app@workspace:.` est restée à l'ancienne position alphabétique de son nom précédent. L'entrée est déplacée à sa position canonique. Les arbres YAML avant/après sont comparés égaux : aucune version ni dépendance n'est changée. L'essai local de validation Corepack a été empêché par l'accès réseau du bac à sable ; le résultat de l'installation immuable doit être confirmé par le prochain run GitHub. Une relance depuis le commit corrigé remplace le run initial, dont les résultats ne sont pas présentés comme des compilations réussies.

### Préparation native Windows et actions imbriquées

Les journaux du premier run révèlent également deux causes distinctes : l'action composite demandait une action tierce d'installation de jq absente de la liste autorisée ; la CLI Windows prenait le `link.exe` GNU de Git Bash à la place du linker MSVC. Le provisionnement jq utilise désormais l'outil présent sur le runner ou son gestionnaire natif, sans élargir les permissions GitHub. Un script commun sélectionne le linker MSVC par chemin complet pour le bon hôte/cible x64 ou ARM64, y compris pour la CLI. Une relance du workflow manuel remplace les candidats précédents du même groupe ; elle ne crée pas de publication automatique.

Validation du correctif natif : **5 tests de candidats/politiques réussis**, dont sélection réelle du chemin MSVC pour fixtures x64/ARM64 avec espaces et refus d’un outil absent ; actionlint toujours sans erreur.

### Run corrigé et première compilation réussie

[Run 41273037531](https://github.com/TRON-ABS/Novera/actions/runs/41273037531), commit `7cced48a4b6924f9e20e91a064c2c2a027638e24` : **Web compilé et artefact retenu**, identifiant `13069523743`, 49 318 112 octets. Cette réussite confirme l'installation Yarn immuable après normalisation du verrou. Les autres plateformes sont encore suivies individuellement.

Windows x64 a ensuite échoué sur une comparaison SHA-256 CUDA. Vérification indépendante du premier composant depuis le manifeste officiel NVIDIA : archive NVCC 13.4.92 de 32 991 192 octets, SHA-256 attendu et réel `23950047aa5405993129a982a99924b4e6d5eb9bc312300030f3afd9b3b49ea4`, conformes. Cause reproduite localement : GNU `sha256sum` préfixe l'empreinte par un caractère d'échappement lorsque le nom contient les antislashs d'un chemin Windows. Calculer sur l'entrée standard évite ce marqueur, sans retirer la vérification. Seul Windows est relancé après ce correctif ; les plateformes encore actives conservent leur run.

### Validation des artefacts et catalogue CUDA

L'artefact Web est téléchargé et validé indépendamment : **594 fichiers, 593 empreintes vérifiées**, signature TRON-ABS et provenance conformes. SHA-256 de l'archive GitHub : `ace1e40c9b803052d505ebed92aa1b89ef24d89e04383beab7b667cd220b91a5`. Aucun profil, discussion ou poids de modèle n'est présent selon le contrôle du contenu et le manifeste.

Relance Windows [41273326935](https://github.com/TRON-ABS/Novera/actions/runs/41273326935), commit `dfe64604` : la comparaison des archives est rétablie ; le provisionnement révèle ensuite le renommage officiel `cuda_cccl` → `cccl` dans CUDA 13.4.3. Un planificateur valide désormais tous les composants, leur architecture, version, chemin et SHA-256 avant le premier téléchargement. Il conserve les anciens catalogues et n'autorise les trois composants historiquement intégrés à NVCC que sur les anciennes versions concernées. Les notices de chaque composant sont conservées ; le document EULA officiel de NVCC est copié sans modification sous le nom attendu par le packager image. Le runtime image conserve aussi ces notices redist. **8 tests** des nouveaux contrôles passent, ainsi qu'actionlint.
