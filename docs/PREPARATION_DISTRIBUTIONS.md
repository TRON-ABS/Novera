# Novera — préparer les distributions sans compiler

État demandé le **29 octobre 2026** : préparer les sources et les prérequis pour une future automatisation, **sans lancer de compilation multiplateforme, sans activer GitHub Actions et sans publier de binaire**. La version portable Windows fait explicitement partie du périmètre.

## Vérifier maintenant, sans lancer de construction

Depuis la racine du dépôt :

```sh
node scripts/distribution/check-release-readiness.mjs
node scripts/distribution/check-release-readiness.mjs --json
node --test scripts/distribution/__tests__/check-release-readiness.test.mjs
```

Les raccourcis `yarn check:distribution` et `yarn test:distribution` correspondent à ces contrôles. Ils n’installent rien, n’exécutent pas les commandes de compilation listées, ne contactent pas GitHub et ne modifient pas les réglages Actions. Le contrôle lit uniquement les sources du dépôt. Il n’inspecte ni certificat, ni secret, ni données utilisateur.

Le [manifeste des variantes](../scripts/distribution/release-targets.json) correspond aux onze variantes du lanceur local existant. Le contrôle vérifie les références aux sources, les scripts nécessaires, les configurations JSON, l’identité principale et l’alignement des versions application/web/native/CLI. La version du paquet privé racine n’est pas utilisée comme version de l’application.

Un contrôle réussi signifie **« définitions de sources valides »**. Il ne signifie pas « prêt à compiler sur un runner vierge » : les dépendances natives, les fichiers embarqués, la signature et les essais réels restent à vérifier. Le rapport laisse explicitement `compilationPerformed: false` et `buildReadiness: "not-verified"`. Les prérequis `pending` sont une liste de travail, pas des erreurs volontairement ignorées d’une compilation.

## Périmètre prévu

| Variante | Résultat visé | Environnement futur et points à terminer |
| --- | --- | --- |
| `desktop` | Dossier Windows x64 avec `Novera-Desktop.exe` et runtime | Compilateur natif, worker, moteurs et dépendances ; essai sur Windows propre. |
| `setup` | Installateur NSIS `.exe` | Runtime Windows complet, outils NSIS, signature et essais d’installation/désinstallation. |
| `msi` | Installateur `.msi` | Outils de paquetage MSI, signature et essais d’installation/mise à niveau. |
| **`portable`** | **ZIP Windows x64 et empreinte SHA-256** | Construire un runtime complet neuf, vérifier l’archive extraite sur une machine propre. |
| `arm64` | Installateur Windows ARM64 | Worker, bibliothèques et auxiliaires ARM64 ; runtime image compatible et essais sur appareil. |
| `linux` | `.deb` et AppImage | Runner Linux, GTK/WebKit, moteurs/auxiliaires Linux ; essai avec/sans AppIndicator. Flatpak est un paquetage séparé. |
| `macos` | `.app` et `.dmg` universel | macOS/Xcode, ressources Intel/Apple Silicon, MLX, signature Apple et notarisation. |
| `android` | APK ARM64 de test | SDK/NDK/JDK épinglés, projet généré, moteur ARM64, audits mobiles et essais sur téléphone. AAB de distribution à préparer séparément. |
| `ios` | Application pour appareil puis archive signée | macOS/Xcode, projet natif, dépendances mobiles, équipe Apple, certificats, profils et essais iPhone/iPad. |
| `web` | Dossier frontend `dist` | Dépendances et services navigateur ; vérifier les fonctions réellement disponibles sans API desktop. |
| `cli` | Binaire sans interface | Dépendances natives, essais par cible et revue de l’identité historique `jan` avant distribution Novera. |

Les configurations des cinq plateformes sont présentes. Cela ne rend pas leurs moteurs interchangeables : le runtime CUDA image Windows n’est pas un runtime Linux/macOS, et les moteurs desktop ne deviennent pas des moteurs mobiles en changeant la cible.

## Portable : ce que l’utilisateur recevra

Le paquet prévu est `Novera_<version>_x64-portable.zip`, accompagné de sa somme SHA-256. Il faut extraire **tout le ZIP**, conserver les ressources et les bibliothèques à côté de l’application, puis lancer l’exécutable. Le paquetage doit partir d’un runtime complet, pas d’un exécutable isolé. Les licences et composants requis doivent suivre le paquet.

Cette variante est **sans installation**, mais elle n’est pas un mode « toutes les données sur clé USB ». Les réglages et conversations utilisent le profil Novera habituel ; les modèles restent dans leurs emplacements configurés. **Les poids des modèles ne sont pas inclus dans le ZIP.** Le parcours de téléchargement/configuration de Novera reste disponible. Voir les [instructions du portable](BUILD_AND_RELEASE.md#portable).

Les formats Setup/MSI et portable sont des modes de distribution de la même application Windows ; ils ne prouvent pas à eux seuls une différence de capacités. Une nouvelle archive devra être testée sans chemins de développeur ni dépendances présentes uniquement sur la machine de construction.

## Blocages à conserver visibles

Android conserve trois audits non validés dans `scripts/android/readiness.json` : dépendances mobiles, permissions et stockage. Le diagnostic Android existant vérifie aussi les outils et bibliothèques générées ; le présent audit ne le remplace pas. iOS conserve le placeholder d’équipe Apple dans sa configuration. Ne pas remplir ces champs avec une fausse identité et ne pas déclarer les audits terminés sans preuve.

Les anciens workflows hérités de Jan et le workflow manuel portable ne constituent pas une chaîne Novera complète et validée. Certains supposent des secrets, des runtimes préconstruits ou des environnements spécifiques. Une future activation doit porter sur les jobs et les ressources effectivement préparés ; **ne pas simplement réactiver tous les workflows existants**.

## Passage futur à GitHub Actions

Lorsque le mainteneur demandera l’automatisation, préparer et relire les workflows Novera avant leur activation. Prévoir la construction des composants embarqués avant le frontend et le paquet final ; vérifier les architectures, versions, licences et empreintes. Utiliser les environnements natifs adaptés, des actions épinglées et des permissions limitées aux besoins du job.

Conserver séparément tests, compilation, signature, conservation d’artefacts et publication officielle. Prévoir une durée de conservation et un budget de stockage adaptés aux runtimes volumineux. Les clés et certificats seront configurés comme secrets, jamais dans les sources ou journaux.

Une première construction distante pourra produire des artefacts de test ou une release brouillon. La publication officielle et les mises à jour signées suivent la [politique de distribution](../OFFICIAL_RELEASES.md). Aucun tag, release, secret, réglage Actions ou abonnement n’est créé par cette préparation.

## Validation de cette préparation

Le contrôle est indépendant du système de compilation et fonctionne avec les modules intégrés de Node.js. Les tests couvrent notamment l’absence de binaires, les versions divergentes, les configurations manquantes/invalides, les scripts absents, le maintien du portable dans la liste et les blocages mobiles. Ils ne construisent pas l’application.

Le premier vrai build de chaque cible et les essais sur machines propres restent à effectuer. Aucune disponibilité universelle, signature ou validation matérielle n’est annoncée.
