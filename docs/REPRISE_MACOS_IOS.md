# Reprendre les sorties macOS et iOS après Android

**Situation au 14 novembre 2026.** Novera iOS **1.0.4** (build **104**) a passé la validation sur simulateur depuis `main`. L’archive iPhone ARM64 a été compilée et contrôlée depuis `main`. L’activation du compte Apple Developer, la signature et l’essai sur iPhone physique restent à faire.

**Situation au 7 novembre 2026 :** macOS Intel et Apple Silicon sont publiés en [1.0.1](RELEASE_1.0.1_2026-11-07.md). iOS reste inclus dans la mise à jour 1.0.1 des sources communes ; le mainteneur confirme ne pas encore disposer du compte et de la signature Apple nécessaires à une distribution sur iPhone. Les remarques ci-dessous sur la 1.0.0 sont historiques.

Mise à jour du **3 novembre 2026** : Android et macOS sont disponibles ; iOS reste interne et ne doit pas être annoncé installable sur iPhone.

## Prérequis Apple pour la suite

Le mainteneur ne possède pas encore les accès Apple nécessaires. S'inscrire à l'[Apple Developer Program](https://developer.apple.com/programs/enroll/) sous son identité ou celle de son organisation. Le même abonnement peut servir aux deux plateformes ; les certificats et profils diffèrent. L'inscription, les accords et le paiement demandent son intervention. Ne jamais transmettre les secrets dans le chat, Git ou les artefacts.

Les Mac de compilation peuvent être fournis par GitHub Actions : `macos-15` ARM64 et `macos-15-intel` Intel. Des machines prêtées à des testeurs ou louées avec bureau distant peuvent couvrir les essais graphiques ; vérifier architecture, version du système et disponibilité avant toute location. Aucun abonnement ou serveur payant n'a été commandé.

## macOS

La [sortie officielle 1.0.0 Intel et Apple Silicon](RELEASE_MACOS_1.0.0.md) est disponible en téléchargement direct, après tests automatiques séparés. Les essais visuels sont différés à la demande du mainteneur. Les paquets ne disposent pas de Developer ID/notarisation Apple ; le guide explique l’autorisation spécifique au premier lancement. Les mises à jour portent la signature Novera.

La future signature Apple reste à préparer ; elle ne conditionne plus cette sortie directe autorisée. Conserver les certificats hors du dépôt et reprendre les essais visuels sur Mac physique puis l’inférence MLX.

## iOS

### Résultats de la 1.0.4

- **Archive iPhone.** Xcode 27.2 a produit une `.xcarchive` non signée pour iPhoneOS ARM64 depuis `main`. Le rapport confirme l’identifiant `io.github.tronabs.novera.ios`, la version **1.0.4**, le build **104** et le minimum déclaré **iOS 15.0**. Le ZIP GitHub Actions contient `Novera-iPhone-unsigned.xcarchive.tar.gz`. L’artefact expire le 12 février 2027. [Télécharger l’archive iPhone non signée](https://github.com/TRON-ABS/Novera/actions/runs/43607760724/artifacts/14119995861) · [Exécution et rapport de vérification](https://github.com/TRON-ABS/Novera/actions/runs/43607760724#artifacts)
- **Simulateur.** Après l’intégration des corrections Swift et de l’identifiant dans `main` (`db60493d`), la compilation ARM64, les sept tests frontend et les démarrages avant et après réinstallation ont réussi sur iPhone Duo (iOS 27.1) et iPhone 18 Pro Max (iOS 27.2). Le fichier de test a été conservé sur les deux simulateurs. Les essais visuels et matériels restent à faire. [Exécution et rapport simulateur](https://github.com/TRON-ABS/Novera/actions/runs/43600194331#artifacts)

### Générer l’archive iPhone pour les prochaines versions

Après avoir actualisé la version et le numéro de build dans `src-tauri/tauri.ios.conf.json`, lancer manuellement **Novera iPhone archive preflight** dans GitHub Actions en sélectionnant `main` ou la référence à valider. Une fois le job réussi, télécharger l’artefact `novera-iphone-unsigned-xcarchive`. Son ZIP contient `Novera-iPhone-unsigned.xcarchive.tar.gz`. Le rapport `IOS-DEVICE.json` est disponible dans l’artefact `novera-iphone-archive-evidence`.

### Étapes restantes pour TestFlight

1. Le titulaire active l’abonnement Apple Developer. Enregistrer l’App ID `io.github.tronabs.novera.ios` dans l’équipe Apple, créer la fiche Novera dans App Store Connect et configurer la signature de distribution, les profils de provisioning et les droits iOS.
2. Générer une archive iPhone signée à partir du code retenu. Vérifier l’identifiant, le numéro de build, l’équipe de signature, les droits, les permissions, les notices et la version minimale déclarée. [Procédure d’archivage et d’export sur la branche TestFlight](https://github.com/TRON-ABS/Novera/blob/codex/prepare-ios-testflight/docs/REPRISE_MACOS_IOS.md#pr%C3%A9parer-une-b%C3%AAta-testflight)
3. Envoyer le build à App Store Connect, attendre son traitement, compléter les informations de bêta et l’attribuer à un groupe TestFlight interne. Soumettre le build à la revue bêta Apple avant d’ouvrir les essais aux testeurs externes. [Guide TestFlight](https://developer.apple.com/testflight/)
4. Installer la bêta sur un iPhone physique. Vérifier le démarrage, le clavier, les réglages, le stockage des clés API, les pièces jointes, les coupures réseau, l’inférence locale Metal et la conservation des données lors d’une mise à jour. Consigner les résultats avant d’annoncer la disponibilité.

### Validation sur simulateur pour les prochaines versions

- Mettre à jour la version et le numéro de build dans `src-tauri/tauri.ios.conf.json`, puis lancer le workflow « Novera iOS simulator validation » sur le commit à publier.
- Utiliser les couples explicites iPhone Duo / iOS 27.1 et iPhone 18 Pro Max / iOS 27.2 avec Xcode 27.2. Ces couples ont réussi sur la branche iOS lors du [run 43534689668](https://github.com/TRON-ABS/Novera/actions/runs/43534689668). Lors d’un changement de Xcode ou de runtime, valider les nouveaux couples avant de les remplacer dans le script. L’ordre de la liste renvoyée par `simctl` varie d’un runner à l’autre.
- En cas de blocage, relever dans le journal le modèle, le runtime, l’étape et le délai dépassé. Sur `main`, les deux premières tentatives de la 1.0.4 ont compilé puis dépassé le délai de `simctl launch` au premier démarrage. Avec la matrice explicite, la compilation et les sept tests frontend ont réussi sur `main`. Les deux simulateurs ont démarré avant et après réinstallation, avec conservation du fichier de test. [Échec initial et relance](https://github.com/TRON-ABS/Novera/actions/runs/43582110101) · [Validation de la matrice sur main](https://github.com/TRON-ABS/Novera/actions/runs/43587102715)
- Joindre au suivi de version le résultat GitHub Actions et le rapport `IOS-HEADLESS.json`. Le rapport couvre le démarrage et la réinstallation avec conservation d’un fichier de test. Les essais visuels et la validation sur iPhone physique font l’objet de contrôles distincts.

Points de reprise : [LAUNCH_STATUS.md](LAUNCH_STATUS.md), [RETOUR_EXPERIENCE_RELEASES.md](RETOUR_EXPERIENCE_RELEASES.md). Ne pas confondre compilation, signature, essai sur appareil et publication.
