# Batterie Mac sans contrôle visuel

Préparation du 3 novembre 2026 à la demande du mainteneur. Cibles : Mac Intel et Apple Silicon. Enchaîner ensuite les contrôles iOS et tenir les vitrines et comptes rendus à jour.

## Exécution

Workflow `novera-build-all.yml`, paramètres `target=macos-tests`, `signed_updates=true`, `macos_distribution=false` tant que les accès Apple ne sont pas configurés. Les deux jobs macOS utilisent les mêmes sources ; les autres plateformes de la matrice sont ignorées.

| Architecture | Runner configuré | Minimum du paquet | Moteur |
| --- | --- | --- | --- |
| Apple Silicon | `macos-15` | macOS 14 | GGUF ; MLX emballé et inspecté |
| Intel | `macos-15-intel` | macOS 13 | GGUF ; MLX exclu |

Les contrôles Apple Developer ID/notarisation restent distincts des signatures de mise à jour Novera. Le mainteneur confirme ne pas encore disposer d'un compte Apple Developer. Aucun résultat de cette batterie ne remplace les accès Apple manquants.

## Régressions couvertes

| Problème déjà rencontré | Contrôle ajouté ou réutilisé |
| --- | --- |
| Paquet incomplet malgré compilation réussie | Comparaison exhaustive application construite / DMG / archive updater, fichiers cachés et modes compris |
| Mauvaise architecture ou minimum macOS trop récent | `ci-check-macos.mjs` sur les exécutables et bibliothèques livrés |
| Ressource ou bibliothèque absente | Versions des sidecars livrés, démarrage du worker et lancement du paquet exact |
| Modèle présent mais génération impossible | Petit GGUF épinglé par commit, taille et SHA-256 ; suites natives moteur/HTTP/supervision exécutées avec ce fichier |
| Données perdues après mise à jour | Tests de migration existants et remplacement natif avec profil synthétique et sentinelle conservée |
| Signature invalide ou mise à jour corrompue | Vérificateur natif Tauri, rejet d'un paquet modifié et absence d'offre à version égale |
| Copie, partage et recherche web défaillants | Tests frontend de presse-papiers, aperçu/partage et recherche mobile |
| Bouton Autoriser indisponible ou mauvais consentement | Tests de destination et de consentement réel ; pas de rapports réels envoyés |
| Écart entre couleurs système et thème choisi | Tests communs `ThemeProvider` et `useTheme` ; aucun test de pixels |
| Confusion entre preuve native et essai graphique | Reçu avec `visualTestsPerformed=false` et `realDeviceUIValidated=false` |

La palette et les composants viennent du même frontend que Windows et Linux. Android/iOS réutilisent cette base et adaptent la disposition à l'écran mobile. Les différences natives et le rendu réel ne sont pas certifiés par un test DOM.

## Isolation et preuves

Les manipulations d'installation et de remplacement sont limitées aux runners macOS GitHub éphémères. Les tests emploient des profils synthétiques dans `RUNNER_TEMP`. Les secrets de signature, les jetons GitHub et les clés de fournisseurs ne sont pas transmis aux processus applicatifs testés. Le petit modèle reste un fichier de test temporaire et n'est jamais emballé dans le produit.

Le workflow conserve les paquets signés Novera et `MACOS-HEADLESS.json` uniquement si la batterie aboutit. En cas d'échec, les traces dédiées restent dans l'artefact de diagnostic. Le reçu distingue les tests frontend, le modèle réel, les comparaisons de paquets et les contrôles d'update. Le lancement d'un processus pendant quinze secondes ne prouve pas le fonctionnement de l'interface.

L'inférence MLX et les performances GPU ne sont pas annoncées comme testées sur les runners standards. La petite génération GGUF sur CPU ne mesure ni la qualité d'un grand modèle ni la vitesse sur un Mac physique.

## Publication et vitrines

L'objectif demandé est une disponibilité publique comme les autres plateformes. Avant toute annonce, rattacher chaque téléchargement aux paquets exacts, résultats, signatures et limites. La signature Novera n'est pas une signature Apple ni une notarisation. Le mainteneur demande une sortie officielle en téléchargement direct dès que les deux batteries réussissent, avec essais visuels différés. L'absence de certificat Developer ID et de notarisation Apple doit être indiquée dans les notes et les vitrines ; elle n'est pas présentée comme une validation Apple. Un paquet simulateur iOS ne doit pas être annoncé comme une application installable sur iPhone.

Suivi : `PR.md`, `docs/RELEASE_MACOS_1.0.0.md`, `docs/REPRISE_MACOS_IOS.md` et `docs/LAUNCH_STATUS.md`.
