# Novera 1.0.0 — sortie Windows x64 portable

La [version portable signée](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-windows-portable) est publique. Le [contrôle public 41504580547](https://github.com/TRON-ABS/Novera/actions/runs/41504580547) vérifie les trois manifests, les 26 fichiers et les sept signatures sans authentification. Le contrôle manuel du canal publié dans la vraie interface Windows locale affiche « You're running the latest version ». Voir aussi le [statut de sortie](LAUNCH_STATUS.md).

La distribution utilise une compilation dédiée à Windows x64 : `Program` contient l’application et ses moteurs ; `Data` conserve les discussions, réglages, modèles téléchargés, caches et profil WebView. Le lanceur est `Novera.exe`. Le [guide portable](WINDOWS_PORTABLE.md) explique les déplacements et les limites.

## Provenance

- Version applicative : **1.0.0** ; tag de publication : `v1.0.0-windows-portable`.
- Application compilée au commit `8df293c4b64b007250bb28582d0ed45ced215953`, [run 41486084155](https://github.com/TRON-ABS/Novera/actions/runs/41486084155). Compilation, création des paquets et signatures réussies ; ce workflow complet a ensuite échoué lors de son contrôle graphique Windows Server.
- Exécutable applicatif SHA-256 : `07ab11c121efd658b38133582b6ba14e3acf71dac9aba1f3ac381cdc578db275`.
- Moteurs repris, octet pour octet, de l’installateur x64 immuable original, commit `428299c34d66170f543722ea98a11de6e3e50979`, SHA-256 `41d2e4e839ff6ec094afe1944760222e50bf3278636f9a2618d4296546c7a4d8`.

| Fichier | Octets | SHA-256 |
| --- | ---: | --- |
| Archive initiale portable | 1 354 715 823 | `1d6df5d266478c5b969152cc16a9288d83d841dceed95a79ed193e2eb3bca615` |
| Remplacement signé de Program | 1 355 056 815 | `3d6f0f37b0fb294dcc82324f5c01697fcc056ffb2ce59d27b6c2d2f220e98654` |

Les deux signatures sont vérifiées indépendamment avec la clé publique Novera épinglée. L’archive initiale ne contient aucun profil personnel ni poids de modèle ; son dossier `Data` est vide.

## Contrôles exécutés

Le [run natif 41499152235](https://github.com/TRON-ABS/Novera/actions/runs/41499152235), au commit `308ae72418bb799b8f993ac57a199b7e9eb4eb1d`, réussit avec les fichiers signés exacts et des sources applicatives inchangées : téléchargement via le véritable plugin Tauri, vérification de signature, rejet d’un paquet altéré par le vérificateur natif, absence d’offre à version égale, installation du remplacement, restauration des **109 fichiers** de Program, conservation des octets de discussion et de modèle synthétiques et du réglage témoin. Ce scénario CI utilise explicitement des fixtures de fichiers ; il ne prétend pas valider une interface, un lanceur graphique ou des chemins de pièces jointes.

Sur le Windows local, le même exécutable signé passe séparément les essais dans la vraie interface avant déplacement, après déplacement vers un chemin avec espaces et accents, puis après remplacement natif de Program. Les appels au backend créent puis retrouvent une discussion, un réglage, une pièce jointe, un modèle synthétique et un secret synthétique protégé par Windows. Le chemin de pièce jointe suit le dossier, tandis qu’un texte de message contenant l’ancien chemin reste intact. Le lanceur racine signé démarre aussi l’application.

Le remplacement local exécute le paquet natif exact après vérification indépendante de sa signature. Un fichier de Program volontairement retiré est restauré ; les 109 empreintes correspondent et les octets de discussion et de modèle restent identiques. Ce lancement manuel du remplacement est distinct du téléchargement et de l’installation par Tauri vérifiés en CI. Les reçus et captures locaux sont référencés par empreinte dans `PORTABLE-PROVENANCE.json`, sans publier les chemins du profil de test.

Sept tests du support portable, huit tests de régression du magasin de secrets de l’application installée et un test SQLite de déplacement des chemins de documents passent. Les contrôles des sources, Node/Python et actionlint passent également. Les versions installées et CLI conservent leurs paquets et canaux propres.

## Limites

L’interface Windows Server de la CI reste non validée. Les résultats graphiques concernent le Windows local ; son niveau d’intégrité n’est pas certifié. Avant publication, l’absence de feed portable produit l’erreur de contrôle attendue. Après publication, les fichiers publics et le message de version à jour sont vérifiés séparément, comme indiqué en tête de ce bilan.

Ces essais utilisent des données synthétiques. Ils ne certifient ni toutes les clés USB, ni tous les modèles ou matériels, ni une transition entre deux versions publiques. Aucun modèle n’est inclus. WebView2 doit déjà être installé. Les accès cloud protégés par Windows peuvent demander une reconnexion sur un autre PC ou compte ; les environnements Python facultatifs peuvent demander une réparation après déplacement. La signature updater est distincte d’Authenticode.

La dernière release GitHub devra contenir les trois manifests `latest.json`, `latest-cli.json` et `latest-portable.json`. Le descripteur public conserve les références des paquets Windows x64, Windows ARM64, Linux x64 et CLI déjà publiés, et ajoute uniquement les fichiers de la distribution portable.

**TRON-ABS** — *The art of Human with AI*
