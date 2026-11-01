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

Les résultats distants, liens et limites effectifs seront ajoutés après le lancement ; aucune réussite distante n'est annoncée à ce stade.
