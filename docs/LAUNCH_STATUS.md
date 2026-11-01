# Novera 1.0.0 — lancement et disponibilité

État vérifié au **1er novembre 2026**. Novera prépare son lancement : **aucune distribution publique n’est annoncée à ce stade**. Les artefacts de compilation servent aux contrôles internes ; le brouillon de préversion demeure bloqué. Les anciens candidats sans updater restent internes.

Novera réunit la conversation, la recherche et la création de texte, d’images, de musique et de vidéo dans un même tableau de bord. Les parcours guidés aident à choisir et préparer les composants compatibles ; les options avancées restent accessibles. Les possibilités locales dépendent du matériel, du moteur et des modèles installés ; les services cloud utilisent les accès configurés par l’utilisateur. Les [vitrines française](../README.fr.md) et [anglaise](../README.md) présentent les capacités et la capture réelle du mainteneur.

| Cible | Preuves disponibles | Conditions encore nécessaires à la diffusion |
| --- | --- | --- |
| Windows x64 | [Relance signée réussie](https://github.com/TRON-ABS/Novera/actions/runs/41311520840), neuf migrations, 83 PE x64 et candidat préparé contrôlés ; signatures NSIS/MSI et cohérence runtime/portable vérifiées. | Contrôler les nouveaux fichiers, la cohérence du runtime et les scénarios desktop/NSIS/MSI/portable. |
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

## Où trouver les versions publiques

Les téléchargements officiels seront présentés sur [GitHub Releases — TRON-ABS/Novera](https://github.com/TRON-ABS/Novera/releases), avec les plateformes réellement disponibles, leurs prérequis, les empreintes et les notes de version. L’absence actuelle de release publique ne signifie pas que toutes les compilations ont échoué. Aucun lien vers un artefact interne n’est présenté comme un téléchargement de lancement.

La consigne du mainteneur s’applique à chaque plateforme et format : **aucune version publique sans mécanisme de mise à jour configuré et vérifié**. La [politique officielle](../OFFICIAL_RELEASES.md), le [guide de distribution](BUILD_AND_RELEASE.md) et la [préparation des versions futures](FUTURES_VERSIONS.md) encadrent ce passage. La première installation du client de confiance et les futures mises à jour sont des étapes distinctes ; les anciens binaires sans updater ne sont pas activés à distance.

## Notre invitation

Je vous souhaite à toutes et à tous une merveilleuse aventure avec Novera. Que votre curiosité ouvre de nouvelles portes, que vos idées prennent vie et que chaque création vous emmène un peu plus loin.

**TRON-ABS**

*The art of Human with AI*
