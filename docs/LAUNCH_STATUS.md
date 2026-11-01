# Novera 1.0.0 — lancement et disponibilité

**Reprise du 2 novembre, feeds contrôlés à 00 h 24 (Paris)** : feeds desktop et CLI toujours en HTTP 404 ; canal de production non validé. Le faux message « dernière version » est corrigé : l'erreur explicite et la nouvelle tentative sont vérifiées sur Windows natif local, et le parcours d'erreur est vérifié dans une vraie AppImage Linux signée. Les nouveaux paquets Windows signés restent en compilation. [Preuves, limites et étapes restantes](UPDATE_CHANNEL_CHECK_2026-11-01.md).

La correction est proposée dans la [PR brouillon #5](https://github.com/TRON-ABS/Novera/pull/5). Le [run correctif 41358869680](https://github.com/TRON-ABS/Novera/actions/runs/41358869680) passe ses contrôles source (55 contrats réussis, deux propres à Windows ignorés, dix tests Python réussis) et son job Linux. L'artefact Linux téléchargé passe le digest GitHub, 15 empreintes, la signature finale, 42 tests frontend et neuf migrations. Windows local est un build debug de contrôle, distinct des candidats signés encore attendus. Aucune fusion ni publication n'est attestée.

État vérifié au **1er novembre 2026**. **Les téléchargements publics restent fermés.** Les cinq plateformes desktop passent désormais l’installation et le remplacement par le composant updater natif en environnement GitHub isolé. Le brouillon de préversion demeure privé et bloqué ; les anciens candidats sans updater restent internes.

Les trois CLI passent également leurs essais isolés et le renouvellement Web local est contrôlé. Le [bilan final des preuves et besoins restants](VALIDATION_RESULTS_2026-11-01.md) distingue ces résultats des conditions de production non satisfaites. Le contrôle source du déploiement Pages réussit : 57 contrats Node (55 réussis, deux propres à Windows ignorés sur Ubuntu) et sept tests Python ; les 57 passent localement sous Windows. La [vitrine GitHub Pages](https://tron-abs.github.io/Novera/) est en ligne sous HTTPS ; elle présente le lancement en préparation et ne distribue aucune application.

Novera réunit conversation, recherche et création de texte, d’images, de musique et de vidéo dans un même tableau de bord. Les possibilités locales dépendent du matériel, du moteur et des modèles installés ; le cloud utilise les accès configurés par l’utilisateur. Les [vitrines française](../README.fr.md) et [anglaise](../README.md) conservent la capture réelle du mainteneur.

| Cible | Preuves réellement disponibles | Conditions restantes |
| --- | --- | --- |
| Windows x64 NSIS | Installation et remplacement natif réussis ; 106 fichiers runtime identiques, signatures/tamper/profil/démarrage avant-après contrôlés. | Parcours UI et feed de production ; scénarios propres MSI/portable. La source Actions brute reste incomplète, avec préparation distincte documentée. |
| Windows ARM64 NSIS | Même scénario réussi ; neuf fichiers runtime identiques. | Parcours UI et feed de production ; conserver la provenance de la préparation runtime. |
| Linux x64 AppImage | Installation/remplacement natif antérieurs réussis ; nouveau paquet signé et parcours UI d'erreur de feed vérifiés, capture et reçu recontrôlés. | Offre et installation depuis l'interface sur le canal de production ; Debian à valider séparément. |
| macOS ARM64 | Installation et remplacement natif réussis ; 22 fichiers identiques ; minimum macOS 14. | Parcours UI/feed de production ; signature de code et notarisation Apple. |
| macOS Intel | Installation et remplacement natif réussis ; 30 fichiers identiques ; minimum macOS 13. | Parcours UI/feed de production ; signature de code et notarisation Apple. |
| CLI Windows x64, Linux x64 et macOS ARM64 | Trois remplacements signés et exécutions réussis ; artefacts téléchargés, onze empreintes chacun, architectures et clé embarquée contrôlées. Manifeste complet préparé localement. | Endpoint de production et transition entre versions publiées non validés. Anciennes CLI sans updater toujours internes. |
| Android | APK ARM64 debug interne contrôlé. | Signature durable, canal de production et validation appareil. |
| iOS | Application simulateur interne contrôlée. | Identité Apple réelle, build appareil, canal de distribution et validation appareil. |
| Web | Nouveau build CI vérifié ; 588 fichiers servis contrôlés en HTTP local ; rechargement entre deux builds au navigateur avec thème préservé. | Vitrine informative GitHub Pages en ligne ; client toujours interne. Cache, chemins, parcours fonctionnels et renouvellement du client hébergé restent à valider. Voir [les limites](WEB_DELIVERY.md). |

## Ce que les essais desktop prouvent

Le [run Windows 41336767111](https://github.com/TRON-ABS/Novera/actions/runs/41336767111) et le [run Linux/macOS 41334675673](https://github.com/TRON-ABS/Novera/actions/runs/41334675673) utilisent les vrais paquets signés conservés dans le brouillon. Les reçus téléchargés passent leurs digests GitHub. Ils confirment signatures, refus du contenu altéré, absence d’offre à version égale, installation, restauration de fichiers et conservation d’un témoin de profil ; les applications restent actives 15 secondes avant et après.

Le programme de contrôle utilise une version synthétique `0.9.9` avec le paquet `1.0.0`. **Le parcours complet dans l’interface et une transition entre deux applications publiées ne sont pas certifiés.** Le maintien du processus ne constitue pas une inspection visuelle ou une validation de tous les moteurs. Les signatures d’update ne valent pas signature Authenticode ou notarisation Apple. Voir [le protocole et les limites](INSTALL_UPDATE_VALIDATION.md).

## Brouillon et conditions de publication

La préversion prévue `v1.0.0-candidate.20261101`, release `430498139`, contient 15 assets transférés dont tailles et SHA-256 serveur correspondent aux fichiers retenus : cinq bundles desktop d’update, cinq signatures, index de provenance, empreintes globales et notices. Chaque asset reste sous 2 Gio. Aucun `latest.json` ou `latest-cli.json` public n’est créé. MSI, Debian, portable, mobiles, Web et CLI ne sont pas les assets de diffusion de ce brouillon. Les manifests desktop et CLI sont préparés localement pour examen ; ils ne sont pas servis publiquement.

La consigne du mainteneur reste obligatoire : **aucune version publique sans mécanisme de mise à jour configuré et vérifié**. Les liens de téléchargement seront présentés sur [GitHub Releases](https://github.com/TRON-ABS/Novera/releases) seulement après les conditions propres aux formats diffusés. La [politique officielle](../OFFICIAL_RELEASES.md), le [guide de distribution](BUILD_AND_RELEASE.md) et la [préparation des versions](FUTURES_VERSIONS.md) encadrent ce passage. Le [canal CLI](CLI_SIGNED_UPDATES.md) passe ses trois essais isolés ; sa disponibilité de production reste à valider.

## Notre invitation

Je vous souhaite à toutes et à tous une merveilleuse aventure avec Novera. Que votre curiosité ouvre de nouvelles portes, que vos idées prennent vie et que chaque création vous emmène un peu plus loin.

**TRON-ABS**

*The art of Human with AI*
