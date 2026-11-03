# Reprendre les sorties macOS et iOS après Android

Note du **2 novembre 2026**, à la demande du mainteneur : terminer Android en premier. macOS et iOS restent internes ; ne pas les annoncer comme disponibles.

## Prérequis commun

Le mainteneur ne possède pas encore les accès Apple nécessaires. S'inscrire à l'[Apple Developer Program](https://developer.apple.com/programs/enroll/) sous son identité ou celle de son organisation. Le même abonnement peut servir aux deux plateformes ; les certificats et profils diffèrent. L'inscription, les accords et le paiement demandent son intervention. Ne jamais transmettre les secrets dans le chat, Git ou les artefacts.

Les Mac de compilation peuvent être fournis par GitHub Actions : `macos-15` ARM64 et `macos-15-intel` Intel. Des machines prêtées à des testeurs ou louées avec bureau distant peuvent couvrir les essais graphiques ; vérifier architecture, version du système et disponibilité avant toute location. Aucun abonnement ou serveur payant n'a été commandé.

## macOS

La chaîne de distribution Apple est préparée localement. Suivre [RELEASE_MACOS_1.0.0.md](RELEASE_MACOS_1.0.0.md) : six secrets Apple, option `macos_distribution=true`, `target=macos`, `signed_updates=true`, signature Developer ID, notarisation, contrôles Gatekeeper et comparaison DMG/archive updater sur chaque architecture. Ces changements doivent encore être intégrés et exécutés sur Mac.

- [ ] Configurer les accès et conserver une sauvegarde sécurisée de la clé privée.
- [ ] Construire et contrôler séparément ARM64 (MLX, minimum actuel macOS 14) et Intel (GGUF, minimum actuel macOS 13).
- [ ] Tester les paquets exacts : téléchargement, installation, premier lancement, interface, moteur compatible, mise à jour et données conservées.
- [ ] Préparer la release privée sans perdre les trois manifests publics desktop/CLI/portable ; vérifier le canal public après publication.

## iOS

Le candidat existant est pour simulateur. Le certificat Developer ID macOS ne remplace pas la signature iOS.

- [ ] Définir l'identifiant applicatif iOS définitif, l'équipe, les capacités et le canal initial (TestFlight conseillé pour les essais).
- [ ] Préparer les certificats iOS, profils de provisioning et accès App Store Connect adaptés ; vérifier les exigences actuelles Apple.
- [ ] Auditer les dépendances, permissions et stockage iOS indépendamment d'Android. Un moteur Android lancé comme processus ne prouve pas un moteur autorisé et fonctionnel sur iOS.
- [ ] Construire pour appareil ARM64, inspecter la signature, les entitlements, les notices et le minimum système.
- [ ] Déclarer et vérifier la fenêtre mobile principale avant les essais : l'absence de `app.windows` a causé l'écran noir Android ; la configuration iOS actuelle doit être contrôlée sur ce même point.
- [ ] Tester sur iPhone/iPad réel : discussions, clés fournisseur, pièces jointes, réseau interrompu, redémarrage, fonctions locales réellement prises en charge et mise à jour avec conservation des données.
- [ ] Distribuer par le canal Apple retenu, puis mettre à jour la disponibilité seulement avec les preuves correspondantes.

Points de reprise : [LAUNCH_STATUS.md](LAUNCH_STATUS.md), [RETOUR_EXPERIENCE_RELEASES.md](RETOUR_EXPERIENCE_RELEASES.md). Ne pas confondre compilation, signature, essai sur appareil et publication.
