# Novera 1.0.0 — lancement et disponibilité

État vérifié au **1er novembre 2026**. **Les téléchargements publics restent fermés.** Les cinq plateformes desktop passent désormais l’installation et le remplacement par le composant updater natif en environnement GitHub isolé. Le brouillon de préversion demeure privé et bloqué ; les anciens candidats sans updater restent internes.

Novera réunit conversation, recherche et création de texte, d’images, de musique et de vidéo dans un même tableau de bord. Les possibilités locales dépendent du matériel, du moteur et des modèles installés ; le cloud utilise les accès configurés par l’utilisateur. Les [vitrines française](../README.fr.md) et [anglaise](../README.md) conservent la capture réelle du mainteneur.

| Cible | Preuves réellement disponibles | Conditions restantes |
| --- | --- | --- |
| Windows x64 NSIS | Installation et remplacement natif réussis ; 106 fichiers runtime identiques, signatures/tamper/profil/démarrage avant-après contrôlés. | Parcours UI et feed de production ; scénarios propres MSI/portable. La source Actions brute reste incomplète, avec préparation distincte documentée. |
| Windows ARM64 NSIS | Même scénario réussi ; neuf fichiers runtime identiques. | Parcours UI et feed de production ; conserver la provenance de la préparation runtime. |
| Linux x64 AppImage | Installation et remplacement natif réussis ; AppImage restaurée à son empreinte exacte. | Parcours UI et feed de production ; Debian à valider séparément. |
| macOS ARM64 | Installation et remplacement natif réussis ; 22 fichiers identiques ; minimum macOS 14. | Parcours UI/feed de production ; signature de code et notarisation Apple. |
| macOS Intel | Installation et remplacement natif réussis ; 30 fichiers identiques ; minimum macOS 13. | Parcours UI/feed de production ; signature de code et notarisation Apple. |
| CLI Linux/Windows/macOS ARM64 | Canal signé implémenté en option ; anciennes compilations conservées sans updater. | Nouveaux paquets et remplacement en relance CI après correction d’une fixture ; endpoint public non activé. |
| Android | APK ARM64 debug interne contrôlé. | Signature durable, canal de production et validation appareil. |
| iOS | Application simulateur interne contrôlée. | Identité Apple réelle, build appareil, canal de distribution et validation appareil. |
| Web | Nouveau build CI vérifié ; 588 fichiers servis contrôlés en HTTP local ; rechargement entre deux builds au navigateur avec thème préservé. | Hébergement HTTPS et cache/CDN réels ; parcours fonctionnels complets et renouvellement du site de production. Voir [les limites](WEB_DELIVERY.md). |

## Ce que les essais desktop prouvent

Le [run Windows 41336767111](https://github.com/TRON-ABS/Novera/actions/runs/41336767111) et le [run Linux/macOS 41334675673](https://github.com/TRON-ABS/Novera/actions/runs/41334675673) utilisent les vrais paquets signés conservés dans le brouillon. Les reçus téléchargés passent leurs digests GitHub. Ils confirment signatures, refus du contenu altéré, absence d’offre à version égale, installation, restauration de fichiers et conservation d’un témoin de profil ; les applications restent actives 15 secondes avant et après.

Le programme de contrôle utilise une version synthétique `0.9.9` avec le paquet `1.0.0`. **Le parcours complet dans l’interface et une transition entre deux applications publiées ne sont pas certifiés.** Le maintien du processus ne constitue pas une inspection visuelle ou une validation de tous les moteurs. Les signatures d’update ne valent pas signature Authenticode ou notarisation Apple. Voir [le protocole et les limites](INSTALL_UPDATE_VALIDATION.md).

## Brouillon et conditions de publication

La préversion prévue `v1.0.0-candidate.20261101`, release `430498139`, contient 15 assets transférés dont tailles et SHA-256 serveur correspondent aux fichiers retenus : cinq bundles desktop d’update, cinq signatures, index de provenance, empreintes globales et notices. Chaque asset reste sous 2 Gio. Aucun `latest.json` ou `latest-cli.json` public n’est créé. MSI, Debian, portable, mobiles, Web et CLI ne sont pas les assets de diffusion de ce brouillon.

La consigne du mainteneur reste obligatoire : **aucune version publique sans mécanisme de mise à jour configuré et vérifié**. Les liens de téléchargement seront présentés sur [GitHub Releases](https://github.com/TRON-ABS/Novera/releases) seulement après les conditions propres aux formats diffusés. La [politique officielle](../OFFICIAL_RELEASES.md), le [guide de distribution](BUILD_AND_RELEASE.md) et la [préparation des versions](FUTURES_VERSIONS.md) encadrent ce passage. Le [canal CLI](CLI_SIGNED_UPDATES.md) reste en validation.

## Notre invitation

Je vous souhaite à toutes et à tous une merveilleuse aventure avec Novera. Que votre curiosité ouvre de nouvelles portes, que vos idées prennent vie et que chaque création vous emmène un peu plus loin.

**TRON-ABS**

*The art of Human with AI*
