# Novera 1.0.0 — préparation macOS

État au **2 novembre 2026 : publication en attente des accès Apple et des essais finaux sur Mac**. Aucune disponibilité publique macOS n'est annoncée. Le mainteneur confirme ne pas encore disposer des accès demandés.

## État vérifié

La lecture authentifiée des métadonnées GitHub du 2 novembre confirme :

- `main` est à `967b4ea94262cd843b8c405515f46254b37fa154` au début de cette préparation ; aucune PR n'est ouverte.
- Les seuls secrets de dépôt sont `NOVERA_UPDATER_PRIVATE_KEY` et `NOVERA_UPDATER_PASSWORD`. Aucun environnement de distribution Apple n'est configuré ; seul `github-pages` existe.
- Le brouillon historique **430498139**, cible `568a5b61b9c2f8c49e7d23b92d466a696c07b0c6`, conserve les deux archives Mac ci-dessous et leurs signatures updater. Il ne contient aucun DMG. Son contenu ne doit pas être publié comme une distribution Apple finalisée.

| Archive interne | Taille | SHA-256 renvoyé par GitHub |
| --- | ---: | --- |
| `Novera_1.0.0_aarch64.app.tar.gz` | 109436139 | `3bb3c4ff3e9996362df101e6491e89257c6f9541d285d73141fefd47c705e07a` |
| `Novera_1.0.0_x64.app.tar.gz` | 106901903 | `4dc7e59cb33f44849090557be7159d24281f0208dd643d4894176a6ab25f22df` |

Ces métadonnées ne constituent pas une nouvelle vérification des octets téléchargés. Les anciens essais natifs sont conservés dans [INSTALL_UPDATE_VALIDATION.md](INSTALL_UPDATE_VALIDATION.md), notamment le [run 41334675673](https://github.com/TRON-ABS/Novera/actions/runs/41334675673). Ils ne prouvent ni la signature Apple finale ni un parcours graphique complet.

## Accès à préparer hors du dépôt et du chat

Créer les secrets suivants dans les [paramètres Actions du dépôt](https://github.com/TRON-ABS/Novera/settings/secrets/actions). Le certificat doit appartenir à Novera, avec sa clé privée et une sauvegarde sécurisée.

| Secret GitHub | Contenu attendu |
| --- | --- |
| `NOVERA_APPLE_CERTIFICATE` | Export `.p12` du certificat **Developer ID Application** et de sa clé privée, encodé en base64. |
| `NOVERA_APPLE_CERTIFICATE_PASSWORD` | Mot de passe de cet export. |
| `NOVERA_APPLE_SIGNING_IDENTITY` | Identité complète `Developer ID Application: … (…)` associée au certificat. |
| `NOVERA_APPLE_ID` | Identifiant du compte Apple autorisé à notariser. |
| `NOVERA_APPLE_PASSWORD` | Mot de passe **spécifique à l'application** pour la notarisation. |
| `NOVERA_APPLE_TEAM_ID` | Identifiant de l'équipe du certificat et de la notarisation. |

Les deux secrets updater existants restent nécessaires et distincts. La configuration utilise l'authentification Apple ID de Tauri, sans fichier de clé API à conserver sur le runner. Référence officielle consultée : [signature et notarisation macOS Tauri](https://v2.tauri.app/distribute/sign/macos/).

## Chaîne préparée

Le workflow [novera-build-all.yml](../.github/workflows/novera-build-all.yml) possède un mode explicite `macos_distribution`, désactivé par défaut. Après intégration et configuration des secrets, lancer avec **`target=macos`, `signed_updates=true`, `macos_distribution=true`** sur le commit revu.

1. Le job source refuse immédiatement un périmètre différent, une identité autre que Developer ID Application ou un secret manquant. Il affiche seulement les noms des variables manquantes.
2. Les deux jobs natifs restent séparés : ARM64 sur `macos-15`, Intel sur `macos-15-intel`. Les minima et dépendances sont contrôlés par `ci-check-macos.mjs` ; MLX reste limité à ARM64.
3. Tauri reçoit les accès Apple pour signer et notariser pendant la création des paquets. Les octets finaux d'update sont signés et vérifiés avec la clé Novera par le contrôle existant.
4. `macos-distribution.mjs verify` vérifie la signature stricte du bundle, l'autorité et l'équipe attendues, le hardened runtime, le ticket agrafé à l'application et l'évaluation Gatekeeper.
5. Le contrôle extrait l'archive updater et monte le DMG en lecture seule. Il compare tous les fichiers du bundle, y compris fichiers cachés, modes et liens symboliques, au bundle signé. Chaque copie doit conserver sa signature et son ticket. Les liens sortant du bundle sont refusés.
6. Le reçu `MACOS-DISTRIBUTION.json` conserve le commit, le run, l'architecture, les empreintes des deux paquets et les résultats techniques. Il laisse explicitement `realDeviceUIValidated=false`. Le champ historique général `productionSigned` du candidat reste conservateur ; consulter le reçu Apple dédié.

Cette chaîne est préparée et testée localement sur ses fonctions portables. **Aucun build avec certificat Apple ni contrôle Apple sur Mac n'a encore été exécuté.**

Validation locale : 34 tests ciblés réussis, un test POSIX ignoré sur Windows. Suite source élargie : 70 réussites, un test ignoré et un refus réseau du bac à sable sur le test HTTP local ; sa suite Web de trois tests réussit après relance hors bac à sable. Les 11 tests Python réussissent, ainsi que les contrôles de syntaxe YAML, JavaScript et Bash, l'audit des sources de sortie et `git diff --check`. Aucun résultat CI nouveau n'est revendiqué.

## Travail restant avant publication

- [ ] Configurer les six secrets Apple et confirmer les hôtes de test Apple Silicon et Intel.
- [ ] Faire passer les contrôles source en CI et les deux builds avec le mode de distribution Apple.
- [ ] Vérifier les reçus et conserver les DMG, archives updater, signatures et empreintes finales hors des artefacts temporaires.
- [ ] Sur chaque architecture, tester le DMG exact téléchargé : installation, premier lancement, interface, moteurs compatibles, contrôle manuel d'update et conservation du profil synthétique après remplacement.
- [ ] Préparer un brouillon privé Mac depuis le commit revu, avec un tag explicite et une provenance complète. Refaire toute signature updater après modification des octets.
- [ ] Préserver `latest.json`, `latest-cli.json` et `latest-portable.json` dans toute nouvelle release choisie comme `latest`. Ajouter les plateformes Darwin au desktop sans perdre Windows/Linux et conserver les octets des deux feeds inchangés.
- [ ] Vérifier tailles, digests serveur, signatures et URL ; publier les paquets finalisés puis vérifier le vrai canal sans authentification sur les deux Mac.
- [ ] Mettre à jour [LAUNCH_STATUS.md](LAUNCH_STATUS.md), README et vitrine après les contrôles publics. Une transition entre deux versions publiques reste à exercer lors d'une version applicative supérieure.

Les paquets existants et les trois canaux publics restent inchangés pendant cette préparation. Voir [RETOUR_EXPERIENCE_RELEASES.md](RETOUR_EXPERIENCE_RELEASES.md) pour les incidents à éviter.
