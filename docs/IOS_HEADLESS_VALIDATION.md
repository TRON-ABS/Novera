# iOS : interface mobile commune et tests sans contrôle visuel

Préparation du 3 novembre 2026, à la suite de la batterie Mac. Le mainteneur demande des sorties officielles et le suivi des retours utilisateurs, avec les essais visuels reportés.

## Périmètre vérifiable sans accès Apple de distribution

Le mode `target=ios-tests` du workflow existant construit l'application ARM64 pour simulateur, exécute les tests frontend et teste son installation, son lancement et sa réinstallation sur deux modèles d'iPhone simulés. Il ne capture aucune image et ne vérifie ni pixels ni interactions graphiques.

Les deux simulateurs sont créés spécifiquement pour le job, puis supprimés par UUID exact. Les autres appareils et leurs données ne sont pas manipulés. Une sentinelle synthétique dans le conteneur de l'application vérifie la conservation des données lors de la réinstallation. Cette sentinelle ne constitue pas un test complet des conversations ou du trousseau iOS.

`IOS-HEADLESS.json` distingue architecture, identité simulateur, modèles simulés, survie du processus et conservation du conteneur. Les champs `realDeviceValidated`, `deviceInstallableDistribution` et `clipboardInteractionValidated` restent faux tant que ces points ne sont pas réellement testés.

## Leçons Android appliquées

- Déclarer la fenêtre principale `main`, créée et visible, avec `index.html` : l'absence de fenêtre était la cause de l'écran noir Android.
- Ne pas imposer les largeurs Desktop au téléphone. Garder la navigation des réglages repliable et les contrôles responsive communs.
- Conserver les feuilles de style, la palette et les choix clair/sombre Desktop. Les différences natives et le rendu exact restent distincts des tests DOM.
- Copier le texte par le plugin natif iOS sur le thread principal, avec limite de 512 Kio UTF-8 et confirmation après écriture. La lecture du presse-papiers n'est pas ajoutée. L'option locale évite une copie vers d'autres appareils via Universal Clipboard.
- Reprendre les tests de partage/aperçu, de recherche web et de consentement. Les services API sont simulés dans ces tests, sans appel payant ni clé personnelle.

## Distribution officielle iPhone

Le mainteneur confirme ne pas encore disposer d'un compte Apple Developer. Le paquet simulateur est donc une preuve de compilation/exécution, pas un fichier installable par les utilisateurs iPhone.

La sortie officielle grand public demandée nécessite une identité de signature, le provisioning et le canal Apple de distribution, normalement App Store. TestFlight est un canal d'essai distinct et demande aussi l'accès développeur. Aucun fichier simulateur ne doit être renommé en IPA distribuable ni annoncé comme une application iPhone installable.

Référence : [distribution iOS Apple](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases).

## Suivi

Cette préparation dépend de la PR Mac pour l'extension du workflow et s'enchaîne avec elle. Les résultats natifs, limites et éventuels blocages doivent être inscrits dans `PR.md`, `docs/REPRISE_MACOS_IOS.md` et `docs/LAUNCH_STATUS.md`. La vitrine n'annonce une disponibilité iPhone qu'une fois un véritable canal d'installation disponible.
