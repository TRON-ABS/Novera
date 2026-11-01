# Novera 1.0.0 — lancement et disponibilité

## Diagnostic Windows : profil de validation corrigé — 1er novembre 2026

La relance `41335902365` identifie le panic du plugin HTTP : `unknown path` lors de la résolution du cache Windows. Une reproduction locale de `SHGetKnownFolderPath`, sans installation et sans modification du registre, démontre que les dossiers synthétiques séparés du banc d’essai donnent `0x80070003`, alors que l’arborescence standard `USERPROFILE/AppData/Local` et `AppData/Roaming` résout le cache dans le répertoire isolé. Le contrôleur adopte cette arborescence et vérifie les deux dossiers Windows avant de lancer Novera. Aucune correction binaire ou recompilation des moteurs n’est nécessaire à cette étape ; les essais Windows restent à réussir. Les résultats Linux/macOS déjà vérifiés sont conservés, les CLI signées restent en cours et la publication demeure bloquée.

## Installations Linux et macOS vérifiées ; diagnostic Windows en cours — 1er novembre 2026

Le [run 41334675673](https://github.com/TRON-ABS/Novera/actions/runs/41334675673), commit `d2488453`, réussit les scénarios Linux x64, macOS ARM64 et macOS Intel. Les reçus téléchargés et leurs empreintes GitHub sont vérifiés : signatures natives, rejet du contenu altéré, absence d’offre à version égale, remplacement effectif du paquet, empreintes runtime conservées et témoin de profil préservé. L’application reste active 15 secondes avant et après. Les 22 fichiers macOS ARM64 et 30 fichiers Intel restent identiques ; l’AppImage retrouve son empreinte exacte.

Le programme de contrôle utilise une version synthétique `0.9.9` avec le vrai paquet `1.0.0` : ce succès ne certifie ni le parcours dans l’interface ni une mise à niveau entre deux applications publiées. Sur Windows x64 et ARM64, le téléchargement, les contrôles natifs et l’installation NSIS atteignent le premier démarrage, puis l’application s’arrête avec le code 101. Le diagnostic de démarrage isolé est désormais conservé pour une relance Windows uniquement. Aucun succès Windows n’est revendiqué. Les trois nouvelles CLI signées sont encore en construction/test. La publication et les feeds publics restent bloqués ; les exigences Apple/mobile/Web et des autres formats demeurent.

État vérifié au **1er novembre 2026**. Novera prépare son lancement : **aucune distribution publique n’est annoncée à ce stade**. Les artefacts de compilation servent aux contrôles internes ; le brouillon de préversion demeure bloqué. Les anciens candidats sans updater restent internes.

Les [nouveaux essais d’installation et d’update](INSTALL_UPDATE_VALIDATION.md) ont atteint la compilation des programmes de contrôle sur les runners. L’accès aux assets du brouillon a ensuite échoué HTTP 403 ; la correction d’accès précède la relance. Aucune installation n’est donc encore certifiée. Le [canal CLI signé](CLI_SIGNED_UPDATES.md) est implémenté en option et reste à valider avec ses nouveaux paquets ; les anciens candidats CLI ne sont pas activés rétroactivement.

Novera réunit la conversation, la recherche et la création de texte, d’images, de musique et de vidéo dans un même tableau de bord. Les parcours guidés aident à choisir et préparer les composants compatibles ; les options avancées restent accessibles. Les possibilités locales dépendent du matériel, du moteur et des modèles installés ; les services cloud utilisent les accès configurés par l’utilisateur. Les [vitrines française](../README.fr.md) et [anglaise](../README.md) présentent les capacités et la capture réelle du mainteneur.

| Cible | Preuves disponibles | Conditions encore nécessaires à la diffusion |
| --- | --- | --- |
| Windows x64 | [Relance signée réussie](https://github.com/TRON-ABS/Novera/actions/runs/41311520840), neuf migrations, 83 PE x64 et candidat préparé contrôlés ; signatures NSIS/MSI et cohérence runtime/portable vérifiées. | Effectuer les essais réels d’installation/update ; valider séparément les scénarios desktop/NSIS/MSI/portable. |
| Windows ARM64 | NSIS signé vérifié ; runtime préparé correspondant aux neuf fichiers installés, provenance conservée. | Installation et mise à jour réelles, validation du format distribué. L’archive Actions brute garde sa limite documentée. |
| Linux x64 | Signature AppImage, clé embarquée, 50 ELF x64 et neuf migrations contrôlés. | Installation/update AppImage ; scénario de mise à jour propre au Debian. |
| macOS Apple Silicon | Signature de l’archive d’update vérifiée ; 16 Mach-O ARM64, minimum macOS 14, neuf migrations réussies. | Installation/update sur Mac ; politique de signature de code et notarisation Apple. |
| macOS Intel | Signature de l’archive d’update vérifiée ; 26 Mach-O x64, minimum macOS 13, neuf migrations réussies. | Installation/update sur Mac ; politique de signature de code et notarisation Apple. |
| Android ARM64 | APK debug interne, identifiant `.debug`, signature debug et alignement 16 Ko vérifiés. | Canal de mise à jour adapté, validations mobiles et signature durable de distribution. |
| iOS | Application pour simulateur ARM64 contrôlée. | Build appareil, accès/signatures Apple, canal de distribution et mise à jour adaptés, validations mobiles. |
| Web | Build et parcours initial contrôlés. | Hébergement, déploiement et renouvellement de la version publique validés. |
| CLI Linux x64, Windows x64, macOS ARM64 | Trois builds, architectures et tests de politique/aide contrôlés. | Canal de mise à jour adapté et vérifié avant publication. |

Les preuves, commits et empreintes de chaque candidat figurent dans le [suivi des compilations](CI_DISTRIBUTIONS.md). La signature cryptographique d’une mise à jour prouve l’origine et l’intégrité de son contenu ; elle ne remplace pas l’essai d’installation/update ni la signature de code propre au système.

## Préparation Windows et limites des archives sources

L’archive Actions Windows x64 omet un marqueur caché attendu par ses empreintes. Le candidat dérivé restaure ce fichier depuis l’installateur signé et reconditionne le portable pour conserver toutes les notices ; sa provenance et ses empreintes sont distinctes. L’archive Windows ARM64 d’origine conserve aussi sa limite documentée de marqueur Tauri dans la copie brute. Les installateurs signés sélectionnés sont revérifiés séparément. **Les archives Actions sources ne sont pas présentées comme les paquets corrigés.** Le [suivi CI](CI_DISTRIBUTIONS.md) donne les détails et les preuves de préparation.

## Brouillon préparé, publication en attente

Le brouillon GitHub non publié contient **15 fichiers vérifiés** : installateurs NSIS Windows x64 et ARM64, AppImage Linux x64, archives d’update macOS ARM64 et Intel, leurs cinq signatures, l’index des commits et provenances, les empreintes globales, la licence et les notices TRON-ABS. Tous les transferts passent la comparaison des tailles et empreintes serveur, avec chaque fichier sous 2 Gio. Les formats et plateformes exclus restent des candidats internes ; ce brouillon ne signifie pas que leurs canaux de mise à jour sont prêts.

Les compilations et contrôles de préparation des paquets sont terminés. Une nouvelle phase d’essais réels sur runners isolés est engagée : [protocole et limites](INSTALL_UPDATE_VALIDATION.md). Le lancement public reste conditionné aux essais d’installation/update sur des machines ou environnements dédiés, aux exigences des plateformes et aux canaux manquants. Aucune installation sur le profil personnel, notarisation Apple ou validation sur appareil mobile n’est revendiquée. Le flux public `latest.json` n’est pas publié.

## Où trouver les versions publiques

Les téléchargements officiels seront présentés sur [GitHub Releases — TRON-ABS/Novera](https://github.com/TRON-ABS/Novera/releases), avec les plateformes réellement disponibles, leurs prérequis, les empreintes et les notes de version. L’absence actuelle de release publique ne signifie pas que toutes les compilations ont échoué. Aucun lien vers un artefact interne n’est présenté comme un téléchargement de lancement.

La consigne du mainteneur s’applique à chaque plateforme et format : **aucune version publique sans mécanisme de mise à jour configuré et vérifié**. La [politique officielle](../OFFICIAL_RELEASES.md), le [guide de distribution](BUILD_AND_RELEASE.md) et la [préparation des versions futures](FUTURES_VERSIONS.md) encadrent ce passage. La première installation du client de confiance et les futures mises à jour sont des étapes distinctes ; les anciens binaires sans updater ne sont pas activés à distance.

## Notre invitation

Je vous souhaite à toutes et à tous une merveilleuse aventure avec Novera. Que votre curiosité ouvre de nouvelles portes, que vos idées prennent vie et que chaque création vous emmène un peu plus loin.

**TRON-ABS**

*The art of Human with AI*
