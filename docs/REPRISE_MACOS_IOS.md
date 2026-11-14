# Reprendre les sorties macOS et iOS après Android

**Préparation interne du 13 novembre 2026.** La configuration iOS annonce Novera **1.0.4**, crée explicitement la fenêtre principale et reprend le moteur embarqué **llama.cpp v1.0.0** avec Metal. Le build de validation est à lancer sur Apple Silicon avec **Xcode 27.2** et un simulateur iOS 27.2. Les vérifications de démarrage, du clavier et de la navigation dans Configurations restent à exécuter sur simulateur. La signature iPhone et la distribution restent en attente.

**Situation au 7 novembre 2026 :** macOS Intel et Apple Silicon sont publiés en [1.0.1](RELEASE_1.0.1_2026-11-07.md). iOS reste inclus dans la mise à jour 1.0.1 des sources communes ; le mainteneur confirme ne pas encore disposer du compte et de la signature Apple nécessaires à une distribution sur iPhone. Les remarques ci-dessous sur la 1.0.0 sont historiques.

Mise à jour du **3 novembre 2026** : Android et macOS sont disponibles ; iOS reste interne et ne doit pas être annoncé installable sur iPhone.

## Prérequis Apple pour la suite

Le mainteneur ne possède pas encore les accès Apple nécessaires. S'inscrire à l'[Apple Developer Program](https://developer.apple.com/programs/enroll/) sous son identité ou celle de son organisation. Le même abonnement peut servir aux deux plateformes ; les certificats et profils diffèrent. L'inscription, les accords et le paiement demandent son intervention. Ne jamais transmettre les secrets dans le chat, Git ou les artefacts.

Les Mac de compilation peuvent être fournis par GitHub Actions : `macos-15` ARM64 et `macos-15-intel` Intel. Des machines prêtées à des testeurs ou louées avec bureau distant peuvent couvrir les essais graphiques ; vérifier architecture, version du système et disponibilité avant toute location. Aucun abonnement ou serveur payant n'a été commandé.

## macOS

La [sortie officielle 1.0.0 Intel et Apple Silicon](RELEASE_MACOS_1.0.0.md) est disponible en téléchargement direct, après tests automatiques séparés. Les essais visuels sont différés à la demande du mainteneur. Les paquets ne disposent pas de Developer ID/notarisation Apple ; le guide explique l’autorisation spécifique au premier lancement. Les mises à jour portent la signature Novera.

La future signature Apple reste à préparer ; elle ne conditionne plus cette sortie directe autorisée. Conserver les certificats hors du dépôt et reprendre les essais visuels sur Mac physique puis l’inférence MLX.

## iOS

Le candidat existant est pour simulateur. Le certificat Developer ID macOS ne remplace pas la signature iOS.

- [ ] Définir l'identifiant applicatif iOS définitif, l'équipe, les capacités et le canal initial (TestFlight conseillé pour les essais).
- [ ] Préparer les certificats iOS, profils de provisioning et accès App Store Connect adaptés ; vérifier les exigences actuelles Apple.
- [ ] Auditer les dépendances, permissions et stockage iOS indépendamment d'Android. Un moteur Android lancé comme processus ne prouve pas un moteur autorisé et fonctionnel sur iOS.
- [ ] Construire pour appareil ARM64, inspecter la signature, les entitlements, les notices et le minimum système.
- [ ] Déclarer et vérifier la fenêtre mobile principale avant les essais : l'absence de `app.windows` a causé l'écran noir Android ; la configuration iOS actuelle doit être contrôlée sur ce même point.
- [ ] Tester sur iPhone/iPad réel : discussions, clés fournisseur, pièces jointes, réseau interrompu, redémarrage, fonctions locales réellement prises en charge et mise à jour avec conservation des données.
- [ ] Distribuer par le canal Apple retenu, puis mettre à jour la disponibilité seulement avec les preuves correspondantes.

### Validation sur simulateur pour les prochaines versions

- Mettre à jour la version et le numéro de build dans `src-tauri/tauri.ios.conf.json`, puis lancer le workflow « Novera iOS simulator validation » sur le commit à publier.
- Utiliser les couples explicites iPhone Duo / iOS 27.1 et iPhone 18 Pro Max / iOS 27.2 avec Xcode 27.2. Ces couples ont réussi sur la branche iOS lors du [run 43534689668](https://github.com/TRON-ABS/Novera/actions/runs/43534689668). Lors d’un changement de Xcode ou de runtime, valider les nouveaux couples avant de les remplacer dans le script. L’ordre de la liste renvoyée par `simctl` varie d’un runner à l’autre.
- En cas de blocage, relever dans le journal le modèle, le runtime, l’étape et le délai dépassé. Sur `main`, les deux premières tentatives de la 1.0.4 ont compilé puis dépassé le délai de `simctl launch` au premier démarrage. Avec la matrice explicite, la compilation et les sept tests frontend ont réussi sur `main`. Les deux simulateurs ont démarré avant et après réinstallation, avec conservation du fichier de test. [Échec initial et relance](https://github.com/TRON-ABS/Novera/actions/runs/43582110101) · [Validation de la matrice sur main](https://github.com/TRON-ABS/Novera/actions/runs/43587102715)
- Joindre au suivi de version le résultat GitHub Actions et le rapport `IOS-HEADLESS.json`. Le rapport couvre le démarrage et la réinstallation avec conservation d’un fichier de test. Les essais visuels et la validation sur iPhone physique font l’objet de contrôles distincts.

Points de reprise : [LAUNCH_STATUS.md](LAUNCH_STATUS.md), [RETOUR_EXPERIENCE_RELEASES.md](RETOUR_EXPERIENCE_RELEASES.md). Ne pas confondre compilation, signature, essai sur appareil et publication.
