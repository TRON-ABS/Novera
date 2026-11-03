# Compilations Novera sur GitHub Actions

**État actuel — 3 novembre 2026 :** la [sortie Mac officielle Intel et Apple Silicon](RELEASE_MACOS_1.0.0.md) est disponible, avec signatures updater Novera et batteries natives séparées. Le run `41642608432` compile les paquets ; la revalidation Intel `41669833311` réutilise ses octets exacts après le seul dépassement du délai de découverte Metal à froid. Les essais visuels sont différés, sans Developer ID/notarisation ni validation MLX revendiqués. Les bilans datés ci-dessous restent historiques.


Les nouveaux candidats Web ajoutent une révision publique sans secret et le reçu `WEB-DELIVERY-READINESS.json` pour préparer le renouvellement par rechargement. Les trois contrôles HTTP locaux couvrent les révisions successives et le refus de caches périmés. Le candidat `41339452516` est téléchargé et vérifié ; le rechargement entre deux builds au navigateur local conserve le thème choisi. La vitrine informative GitHub Pages est désormais déployée et vérifiée sous HTTPS par le run `41346258656` ; son workflow manuel `target=pages` ne déploie pas le client ni les feeds. Le canal applicatif hébergé et ses caches restent à certifier. Voir [le contrat et les limites Web](WEB_DELIVERY.md).

## Cinq installations et remplacements natifs vérifiés — 1er novembre 2026

Les essais réussissent sur **Windows x64 et ARM64, Linux x64, macOS ARM64 et Intel**. Les reçus téléchargés et leurs digests GitHub sont vérifiés : installation du vrai paquet, signature native, rejet du contenu altéré, aucune offre à version égale, restauration effective par l’updater, empreintes runtime et témoin de profil conservés, démarrage pendant 15 secondes avant et après. Le [run Windows 41336767111](https://github.com/TRON-ABS/Novera/actions/runs/41336767111) compare 106 fichiers x64 et neuf ARM64 ; le [run Linux/macOS 41334675673](https://github.com/TRON-ABS/Novera/actions/runs/41334675673) compare l’AppImage exacte, 22 fichiers macOS ARM64 et 30 Intel.

Le programme de contrôle annonce `0.9.9` pour exercer le vrai paquet `1.0.0`. Ces preuves ne couvrent pas le parcours d’update dans l’interface, une transition entre deux applications publiées ni une inspection visuelle de tous les moteurs. Le défaut Windows était celui du profil synthétique du banc d’essai ; son arborescence standard corrige le démarrage sans recompiler Novera.

**La publication reste bloquée** : aucun feed public n’est créé, les trois CLI signées passent également le remplacement isolé et leur manifeste est préparé localement, sans endpoint public activé, les exigences Apple/mobile/Web et les scénarios MSI/Debian/portable restent distincts. Le brouillon privé conserve ses 15 assets vérifiés. Voir le [protocole de validation](INSTALL_UPDATE_VALIDATION.md) et la [disponibilité actuelle](LAUNCH_STATUS.md).

<details>
<summary>Historique des contrôles précédents — états remplacés par le bilan ci-dessus</summary>

## Diagnostic Windows : profil de validation corrigé — 1er novembre 2026

La relance `41335902365` identifie le panic du plugin HTTP : `unknown path` lors de la résolution du cache Windows. Une reproduction locale de `SHGetKnownFolderPath`, sans installation et sans modification du registre, démontre que les dossiers synthétiques séparés du banc d’essai donnent `0x80070003`, alors que l’arborescence standard `USERPROFILE/AppData/Local` et `AppData/Roaming` résout le cache dans le répertoire isolé. Le contrôleur adopte cette arborescence et vérifie les deux dossiers Windows avant de lancer Novera. Aucune correction binaire ou recompilation des moteurs n’est nécessaire à cette étape ; les essais Windows restent à réussir. Les résultats Linux/macOS déjà vérifiés sont conservés, les CLI signées restent en cours et la publication demeure bloquée.

## Installations Linux et macOS vérifiées ; diagnostic Windows en cours — 1er novembre 2026

Le [run 41334675673](https://github.com/TRON-ABS/Novera/actions/runs/41334675673), commit `d2488453`, réussit les scénarios Linux x64, macOS ARM64 et macOS Intel. Les reçus téléchargés et leurs empreintes GitHub sont vérifiés : signatures natives, rejet du contenu altéré, absence d’offre à version égale, remplacement effectif du paquet, empreintes runtime conservées et témoin de profil préservé. L’application reste active 15 secondes avant et après. Les 22 fichiers macOS ARM64 et 30 fichiers Intel restent identiques ; l’AppImage retrouve son empreinte exacte.

Le programme de contrôle utilise une version synthétique `0.9.9` avec le vrai paquet `1.0.0` : ce succès ne certifie ni le parcours dans l’interface ni une mise à niveau entre deux applications publiées. Sur Windows x64 et ARM64, le téléchargement, les contrôles natifs et l’installation NSIS atteignent le premier démarrage, puis l’application s’arrête avec le code 101. Le diagnostic de démarrage isolé est désormais conservé pour une relance Windows uniquement. Aucun succès Windows n’est revendiqué. Les trois nouvelles CLI signées sont encore en construction/test. La publication et les feeds publics restent bloqués ; les exigences Apple/mobile/Web et des autres formats demeurent.

## Essai Windows : sélection du linker de validation — 1er novembre 2026

Le premier run de validation 41332189234 passe les contrats source mais échoue avant installation : Bash résout le link.exe de Git pendant la compilation du programme de contrôle. Le job utilise désormais le sélecteur MSVC déjà présent et testé dans le dépôt, avec son chemin de linker explicite. Une relance ciblée est préparée ; aucun échec d’installation de Novera ni validation réussie n’est déduit de cet incident de préparation.

## Nouvelle phase : essais réels d’installation et d’update — 1er novembre 2026

Le mainteneur demande maintenant de valider les installations et mises à jour ainsi que les canaux incomplets. Le workflow prépare des essais sur runners GitHub hébergés, avec les vrais paquets signés et un programme de contrôle natif isolé ; aucune installation n’est effectuée sur le profil personnel. La compilation locale du programme et les quatre tests des garde-fous passent, ainsi que les 49 contrats Node ; les résultats d’installation CI restent à obtenir. Le contrôle distingue le remplacement natif d’un paquet, un programme de test avec version synthétique, et un parcours complet entre deux applications publiées. Voir [le protocole et ses limites](INSTALL_UPDATE_VALIDATION.md).

## Bilan des distributions : compilations terminées, brouillon prêt — 1er novembre 2026

Les onze variantes retenues disposent d’une compilation GitHub réussie. Les cinq bundles desktop sélectionnés passent les vérifications cryptographiques de mise à jour, avec les préparations Windows et leurs limites de source documentées ci-dessous. Le contrôle source final [41329047879](https://github.com/TRON-ABS/Novera/actions/runs/41329047879), commit `2142b95f`, réussit : **49 contrats Node, 47 réussis, 2 tests propres à Windows ignorés sur Ubuntu, aucun échec** ; les 49 passent localement sous Windows.

Le brouillon GitHub `430498139`, préversion prévue `v1.0.0-candidate.20261101`, contient maintenant **15 assets transférés et vérifiés** : cinq bundles d’update desktop, leurs cinq signatures, l’index de provenance, les empreintes globales, la licence, l’identité et la signature TRON-ABS. Les tailles et SHA-256 renvoyés par GitHub correspondent aux fichiers sélectionnés ; chacun reste sous 2 Gio. L’ancien candidat sans updater a été retiré du brouillon, avec son original local conservé. MSI, Debian, portable, Android debug, iOS simulateur, Web et CLI ne sont pas les assets de diffusion de ce brouillon.

**Le brouillon reste bloqué et non publié. Aucun `latest.json` public n’est créé.** Les essais réels d’installation et d’update restent à effectuer dans des environnements dédiés, ainsi que les exigences de distribution et de canal propres aux formats exclus. Windows Sandbox n’est pas disponible sur ce poste ; aucun paquet n’est installé sur le profil personnel. Les signatures d’update vérifiées ne constituent pas une signature Authenticode ou une notarisation Apple. Le suivi automatique des compilations peut s’arrêter une fois ce bilan publié ; les validations de lancement restantes sont explicites dans la page de disponibilité.

## Windows x64 : candidat préparé et contrôlé — 1er novembre 2026

Toutes les cibles disposent maintenant d’une compilation réussie dans les runs retenus. Le candidat Windows x64 provient de la [relance GitHub `41311520840`](https://github.com/TRON-ABS/Novera/actions/runs/41311520840), commit `bbe679d3` : signatures finales et **neuf migrations réussies**. L’archive source `13091806780` de 5 038 992 055 octets a le SHA-256 `91355e0bb32b81727e7f58d6228fd09165aab4743de343ea1073c3998182f341`.

L’upload Actions a omis le marqueur caché `.novera-image-runtime` bien qu’il figure dans les empreintes ; **l’archive source reste donc incomplète et ne doit pas être diffusée telle quelle**. Les fichiers présents passent leurs empreintes. Une préparation distincte restaure les 42 octets du marqueur depuis le NSIS signé, avec exactement l’empreinte d’origine. Le correctif `0a6d6a22` conserve désormais les fichiers cachés du collecteur contrôlé lors des uploads futurs. Aucun binaire n’est recompilé localement.

Le portable d’origine omettait aussi la notice `resources/SIGNATURE.txt` et son texte décrivait mal l’état des mises à jour. Le correctif `89419d39` conserve les notices du runtime figé et décrit les limites réelles ; le ZIP est reconditionné localement depuis les mêmes binaires GitHub. Son SHA-256 est `a2306aa9bcb63a597f0d659ea630cf70e84e67d7c08e3d6860d8292918048886`. La provenance distingue compilation, source incomplète et préparation ; les fichiers originaux sont conservés.

Le candidat préparé passe **125 empreintes**, **83 PE x64**, les **77 fichiers du moteur image** épinglé CUDA 13.4.3, la clé publique réellement embarquée et le contrôle cryptographique `--publication-check`. Les **106 fichiers runtime correspondent exactement au NSIS extrait**, et le portable corrigé correspond au runtime figé, notices comprises. La signature du MSI passe aussi ; son EXE x64 diffère uniquement des trois octets réservés au type d’installateur MSI/NSIS. Ce contrôle ne valide pas son scénario de mise à jour.

Aucun installateur n’est exécuté sur le profil personnel. Les essais réels d’installation/update et les conditions propres aux autres formats, mobiles, Web et CLI restent à satisfaire ; **aucune version publique n’est annoncée**. La disponibilité de lancement est synchronisée dans les deux README et la page dédiée.

## Windows x64 signé : compilation et migrations réussies — 1er novembre 2026

La [relance ciblée `41311520840`](https://github.com/TRON-ABS/Novera/actions/runs/41311520840), commit `bbe679d3`, termine avec succès, y compris le job Windows x64 `124862783500`. Le journal confirme la création des installateurs NSIS/MSI, la vérification de la signature du bundle final et **9 tests de migration réussis / 0 échec / 0 ignoré**. Le maintien de `STATIC_VCRUNTIME=true` corrige donc aussi le défaut sur le runner complet.

L’[artefact `13091806780`](https://github.com/TRON-ABS/Novera/actions/runs/41311520840/artifacts/13091806780) contient les formats Windows et mesure **5 038 992 055 octets**. Son téléchargement pour inspection indépendante est en cours : les empreintes locales, architectures, signatures, ressources et comparaisons NSIS/runtime/portable ne sont pas encore annoncées comme validées. Toutes les cibles ont désormais une compilation réussie dans les runs retenus, sans transformer les candidats internes en versions publiques. La publication reste bloquée par les contrôles de paquets et d’installation/update encore nécessaires.

## Windows x64 : correction des tests après signature — 1er novembre 2026

Le job `124820616112` du run signé `41297251818` échoue **après** la création des installateurs NSIS/MSI et la vérification de la signature d’update, au moment de recompiler pour les tests de migration. Tauri utilise le runtime MSVC statique et laisse un remplacement `msvcrt.lib` dans `OUT_DIR` ; le lancement direct de Cargo sans ce même réglage expose cette bibliothèque à un lien dynamique, provoquant LNK4003 et 112 symboles non résolus. Aucun candidat final de ce job n’est certifié ni publié.

Le défaut est reproduit localement dans un petit projet Rust isolé avec le helper réel de `tauri-build 2.6.3` : compilation statique réussie, transition vers les tests sans réglage en échec, puis tests réussis avec le mode statique conservé. Le script CI exporte désormais `STATIC_VCRUNTIME=true` pour le build desktop Windows et ses tests directs. **49 contrats Node locaux passent**. La relance ciblée Windows x64 signée [41311520840](https://github.com/TRON-ABS/Novera/actions/runs/41311520840), commit correctif bbe679d3, est lancée et ses contrats source passent ; les autres plateformes vérifiées sont conservées. Cette reproduction ne remplace pas les neuf migrations du prochain build complet.

Présentation du lancement et disponibilité par plateforme : [état actuel](LAUNCH_STATUS.md).

## macOS Intel : candidat signé vérifié — 1er novembre 2026

Le candidat Intel signé du [run `41297251818`](https://github.com/TRON-ABS/Novera/actions/runs/41297251818), commit `d0a29f63`, est téléchargé et contrôlé : [artefact `13083107857`](https://github.com/TRON-ABS/Novera/actions/runs/41297251818/artifacts/13083107857), 213 497 090 octets, **11 empreintes vérifiées**. SHA-256 de l’archive : `2ba2bdd265d5703105f0f2c100338ad5c7e2772ec8ec63fb5afd2d42c4b41e42`.

La signature de l’archive d’update finale passe la vérification cryptographique avec la clé publique Novera épinglée ; le reçu correspond au commit et à `darwin-x86_64`, et `--publication-check` réussit. Les **30 fichiers réguliers de l’application correspondent exactement entre archive d’update et DMG** ; la clé publique réelle est embarquée. Les 26 Mach-O sont x64, avec un minimum maximal **macOS 13.0** ; le worker GGUF/Metal et la notice TRON-ABS sont présents, MLX est exclu et aucun chemin de dépendance du runner n’est conservé.

Les **9 tests de migration réussissent sans échec ni test ignoré**. Les deux architectures macOS signées sont maintenant contrôlées. Seul Windows x64 reste en compilation ; la publication demeure bloquée en attendant notamment les essais réels d’installation/update. Aucune installation sur le profil personnel ni notarisation Apple n’est revendiquée.

## macOS Apple Silicon : candidat signé vérifié — 1er novembre 2026

Le candidat ARM64 signé du [run `41297251818`](https://github.com/TRON-ABS/Novera/actions/runs/41297251818), commit `d0a29f63`, est compilé et téléchargé : [artefact `13083335852`](https://github.com/TRON-ABS/Novera/actions/runs/41297251818/artifacts/13083335852), 217 568 424 octets, **11 empreintes vérifiées**. SHA-256 de l’archive : `315c4515db6eece25d1302f4972267638779e15595b221d3418bb00dda9144cb`.

La signature cryptographique de l’archive d’update finale est revérifiée avec la clé publique Novera épinglée ; le reçu correspond au commit et à `darwin-aarch64`, et `--publication-check` réussit. Les **22 fichiers réguliers de l’application dans l’archive d’update correspondent octet pour octet au DMG** ; la clé publique est réellement embarquée dans l’exécutable. Les 16 Mach-O inspectés sont ARM64, avec un minimum maximal **macOS 14.0** ; MLX et son shader sont présents, ainsi que la notice TRON-ABS, sans chemins de bibliothèques du runner.

Les **9 tests de migration réussissent, sans échec ni test ignoré**. Aucun paquet n’est installé sur le profil personnel. L’installation et la mise à jour réelles sur Mac, ainsi que la notarisation Apple, ne sont pas revendiquées ; la publication reste bloquée. Windows x64 et macOS Intel signés sont encore suivis.

## Windows ARM64 : signature valide et copie runtime corrigée — 1er novembre 2026

Le candidat ARM64 du [run `41297251818`](https://github.com/TRON-ABS/Novera/actions/runs/41297251818), commit `d0a29f63`, est compilé et téléchargé ([artefact source `13081090918`](https://github.com/TRON-ABS/Novera/actions/runs/41297251818/artifacts/13081090918), 291 161 431 octets, 22 empreintes). SHA-256 GitHub : `cf1c75b04a54eb5a0993b3513f3341c2751be1707a3ec1470e633f425ffc7963`. Sept binaires PE ARM64 et les neuf tests de migration passent ; le NSIS final a une signature d’update Novera vérifiée et contient la clé publique réelle.

La comparaison de l’EXE brut avec celui extrait du NSIS expose exactement **trois octets différents** : le marqueur Tauri réservé `UNK` du brut devient `NSS` dans l’installateur. Le NSIS est correct ; la copie desktop brute du candidat CI ne doit pas être publiée telle quelle. Le correctif source `932460fa` prépare uniquement la copie du runtime, conserve le marqueur NSIS et ajoute une preuve de type/offset/empreinte. Le contrôle de publication Windows exige désormais cette preuve et vérifie les octets réels. **49 tests Node locaux réussissent**, dont huit tests crypto/configuration/préparation/publication.

Une préparation locale dérivée des fichiers compilés sur GitHub reproduit exactement l’EXE du NSIS après cette seule correction réservée. Les **neuf fichiers runtime correspondent octet pour octet à l’installateur extrait** ; la signature de l’installateur est revérifiée et le contrôle `--publication-check` réussit sur ce runtime préparé. Aucune compilation applicative locale ni installation n’est exécutée. La provenance distingue le commit de compilation `d0a29f63`, l’artefact source et le commit de préparation `932460fa`, avec de nouvelles empreintes pour le candidat préparé. L’archive Actions d’origine reste intacte et conserve sa limite de copie brute ; elle n’est pas présentée comme l’archive corrigée.

Le flux de mise à jour vise le NSIS. L’essai réel d’installation/update et les scénarios des autres formats restent à valider ; la publication demeure bloquée. L’ancien run Windows x64 sans updater `41276293618` a aussi terminé sa compilation avec succès, mais reste interne et n’est pas une distribution autorisée par la nouvelle consigne.

## Premier candidat desktop avec update signé vérifié — 1er novembre 2026

Linux x64 du [run signé `41297251818`](https://github.com/TRON-ABS/Novera/actions/runs/41297251818), commit `d0a29f63`, est compilé et téléchargé ([artefact `13080473923`](https://github.com/TRON-ABS/Novera/actions/runs/41297251818/artifacts/13080473923)). L’archive de 321 555 711 octets passe **11 empreintes** ; SHA-256 GitHub : `facf344a00e7157a220bf5c6d542bc8fa66db449e4c210aa3e74ea02cfe06831`.

Les champs de provenance confirment le canal configuré et les signatures vérifiées. Le reçu `UPDATER-READINESS.json` correspond au commit et à `linux-x86_64` ; l’AppImage final passe une nouvelle vérification cryptographique locale avec la clé publique épinglée, et le contrôle `--publication-check` réussit. SHA-256 de l’AppImage : `d3d52143d3be76897e1d691d2d8814099cb9ee76c75706960038547869964633`. L’inspection indépendante de Debian/AppImage contrôle 50 ELF x64 et retrouve la clé publique réelle dans les deux exécutables emballés ; notice, icône et exclusion des pilotes GPU hôtes restent conformes.

Le runner réussit le test GTK réel, la signature après reconditionnement AppImage et **9 tests de migration / 0 échec / 0 ignoré**. Les deux reçus sont présents dans l’archive. Aucun paquet n’est installé ou exécuté sur le profil personnel. L’essai graphique d’installation/update et le scénario propre au Debian restent distincts ; cette réussite technique ne débloque pas à elle seule la publication globale. Windows et macOS signés restent suivis ; Android/iOS relancés restent internes sans canal de publication validé.

## Publication conditionnée aux mises à jour — 1er novembre 2026

Le mainteneur impose désormais **aucune version publique sans mécanisme de mise à jour configuré et vérifié**. Cette consigne remplace les projets de diffusion des candidats précédents sans updater. Ils restent des preuves internes ; leurs compilations et inspections ne leur donnent pas une autorisation de publication.

Le mainteneur autorise explicitement la création et la configuration de la clé Novera. La clé privée chiffrée reste hors dépôt, avec accès Windows restreint ; les deux secrets Actions `NOVERA_UPDATER_PRIVATE_KEY` et `NOVERA_UPDATER_PASSWORD` sont configurés par chiffrement à la clé publique GitHub. Seule `src-tauri/tauri.updater.conf.json`, contenant la clé publique et le flux exclusif Novera, est versionnée. Empreinte SHA-256 du paquet de clé publique : `f8adcd7f0e5a079521c8fc4ec03987d8bc78acf8578a25f1ad25c72e1a93af9d`.

Un vrai fichier signé avec cette clé passe deux vérifications cryptographiques indépendantes ; un fichier altéré est rejeté. Un export de secours chiffré, avec code de récupération distinct et script de restauration, a été remis au mainteneur à l’emplacement demandé hors dépôt. Une restauration sans DPAPI puis une signature avec la clé restaurée réussissent ; les secrets temporaires de cet essai sont supprimés. La copie sur un support externe et la conservation séparée du code restent à faire par le mainteneur. Aucune valeur secrète n’est inscrite dans Git, les logs ou les assets.

Le commit `d0a29f63` ajoute au workflow manuel l’option **`signed_updates=true`** : configuration de confiance embarquée, frontend de mise à jour actif, signature des octets finaux et vérification Ed25519 du contenu et du commentaire Minisign. Linux est signé après le reconditionnement AppImage ; les archives macOS d’update portent un nom distinct par architecture. Le reçu `UPDATER-READINESS.json` conserve commit, plateforme, flux, empreinte publique et SHA-256 des fichiers signés. Les champs de provenance `updaterChannelConfigured` et `updaterSignaturesVerified` distinguent ces nouveaux builds des anciens candidats.

Le [run signé `41297251818`](https://github.com/TRON-ABS/Novera/actions/runs/41297251818) compile les cinq cibles desktop ; Android et iOS relancés par la cible `native` restent des candidats internes. **47 tests Node passent localement**, dont six tests de signature/configuration/publication ; le contrôle source GitHub passe avec les tests propres à Windows ignorés sur Ubuntu. Le résultat des paquets signés et leurs reçus restent à vérifier après compilation. Les anciens binaires installés ne sont pas modifiés par ce commit.

Avant publication d’un candidat desktop extrait :

```sh
node scripts/distribution/ci-check-updater.mjs --publication-check CHEMIN_DU_CANDIDAT
```

Le contrôle refuse un canal absent, un reçu d’un autre commit, une autre plateforme ou destination, un fichier altéré et une signature d’une autre clé ; il revérifie les octets du bundle avec la clé publique épinglée. Il ne publie rien et ne remplace pas l’essai réel d’installation/mise à jour, les licences, l’approbation du mainteneur ou la signature de code/notarisation propre au système. L’updater signé Tauri ne constitue pas une signature Authenticode ou une notarisation Apple.

Le brouillon de préversion `v1.0.0-candidate.20261101` est marqué **BLOQUÉ : mises à jour vérifiées requises** et reste non publié. Le transfert des anciens candidats sans updater a été arrêté. Aucun tag de publication ni `latest.json` public n’est annoncé comme disponible. Android debug, iOS simulateur et la CLI sans canal adapté restent exclus de toute publication selon la nouvelle consigne ; leurs canaux de mise à jour et validations propres doivent être terminés. Les MSI, Debian et portables ne sont pas les bundles du flux NSIS/AppImage préparé : leur scénario d’update doit aussi être vérifié avant diffusion. La version applicative reste **1.0.0**.

<!-- NOVERA CI STATUS START -->
## Tableau de suivi des onze variantes — 1er novembre 2026

Ce tableau relève les résultats des derniers runs concernés, sans transformer un job en cours en réussite. Une relance ciblée remplace le statut de la variante dans l'ancien run global, qui peut donc rester rouge malgré un correctif ultérieur réussi.

| Variante | Dernier état relevé | Provenance |
| --- | --- | --- |
| Desktop Windows x64 | windows / x64: compilé | [run 41311520840](https://github.com/TRON-ABS/Novera/actions/runs/41311520840) · `bbe679d3` |
| Setup Windows x64 | windows / x64: compilé | [run 41311520840](https://github.com/TRON-ABS/Novera/actions/runs/41311520840) · `bbe679d3` |
| MSI Windows x64 | windows / x64: compilé | [run 41311520840](https://github.com/TRON-ABS/Novera/actions/runs/41311520840) · `bbe679d3` |
| Portable Windows x64 | windows / x64: compilé | [run 41311520840](https://github.com/TRON-ABS/Novera/actions/runs/41311520840) · `bbe679d3` |
| Windows ARM64 | arm64 / arm64: compilé | [run 41297251818](https://github.com/TRON-ABS/Novera/actions/runs/41297251818) · `d0a29f63` |
| Linux | linux / x64: compilé | [run 41297251818](https://github.com/TRON-ABS/Novera/actions/runs/41297251818) · `d0a29f63` |
| macOS | macos / arm64: compilé; macos / x64: compilé | [run 41297251818](https://github.com/TRON-ABS/Novera/actions/runs/41297251818) · `d0a29f63` |
| Android | android / windows-2025: compilé | [run 41297251818](https://github.com/TRON-ABS/Novera/actions/runs/41297251818) · `d0a29f63` |
| iOS simulateur | ios / macos-15: compilé | [run 41297251818](https://github.com/TRON-ABS/Novera/actions/runs/41297251818) · `d0a29f63` |
| Web | web / ubuntu-22.04: compilé | [run 41275648200](https://github.com/TRON-ABS/Novera/actions/runs/41275648200) · `307fbb16` |
| CLI | cli / ubuntu-22.04: compilé; cli / windows-2025: compilé; cli / macos-15: compilé | [run 41280300978](https://github.com/TRON-ABS/Novera/actions/runs/41280300978) · `410caea5` |

Artefacts téléchargés et contrôlés indépendamment :

- [Novera-android-Windows-41281439087](https://github.com/TRON-ABS/Novera/actions/runs/41281439087/artifacts/13074371303) : 6 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée.
- [Novera-arm64-arm64-41297251818](https://github.com/TRON-ABS/Novera/actions/runs/41297251818/artifacts/13081090918) : 22 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée.
- [Novera-cli-Linux-41280300978](https://github.com/TRON-ABS/Novera/actions/runs/41280300978/artifacts/13073505849) : 7 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée.
- [Novera-cli-Windows-41280300978](https://github.com/TRON-ABS/Novera/actions/runs/41280300978/artifacts/13073064714) : 7 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée.
- [Novera-cli-macOS-41280300978](https://github.com/TRON-ABS/Novera/actions/runs/41280300978/artifacts/13073560959) : 7 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée.
- [Novera-ios-macOS-41276290611](https://github.com/TRON-ABS/Novera/actions/runs/41276290611/artifacts/13071509324) : 6 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée.
- [Novera-linux-x64-41297251818](https://github.com/TRON-ABS/Novera/actions/runs/41297251818/artifacts/13080473923) : 11 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée; signature cryptographique du bundle d’update et prérequis de publication vérifiés.
- [Novera-macos-arm64-41297251818](https://github.com/TRON-ABS/Novera/actions/runs/41297251818/artifacts/13083335852) : 11 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée; minimum natif maximal relevé : macOS 14.0.0; signature cryptographique du bundle d’update et prérequis de publication vérifiés.
- [Novera-macos-x64-41297251818](https://github.com/TRON-ABS/Novera/actions/runs/41297251818/artifacts/13083107857) : 11 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée; minimum natif maximal relevé : macOS 13.0.0; signature cryptographique du bundle d’update et prérequis de publication vérifiés.
- [Novera-web-Linux-41275648200](https://github.com/TRON-ABS/Novera/actions/runs/41275648200/artifacts/13070388490) : 593 empreintes vérifiées, signature de marque et provenance conformes.

Les signatures ci-dessus sont les notices personnelles TRON-ABS. Elles ne remplacent pas une signature cryptographique de production. Les validations sur PC neuf, téléphone et tablette restent distinctes des compilations CI.
<!-- NOVERA CI STATUS END -->

Le 1er novembre 2026, le mainteneur autorise explicitement **toutes les plateformes et variantes**, en confirmant Linux, Android, iOS et macOS, avec contrôle des résultats et mise à jour des MD. Cette autorisation remplace la consigne historique de garder Actions désactivé pour la préparation seule. Aucun profil utilisateur ni discussion du PC du mainteneur n'est envoyé aux runners.

## macOS Intel vérifié — 07:09 UTC

Le [run macOS `41278737556`](https://github.com/TRON-ABS/Novera/actions/runs/41278737556), commit `5468f183`, est entièrement réussi. Le [candidat Intel `13073109727`](https://github.com/TRON-ABS/Novera/actions/runs/41278737556/artifacts/13073109727) téléchargé mesure 106 591 838 octets et passe sept empreintes. SHA-256 de l’archive GitHub : `e94f67a9711563f9a3e1e38523e55f78eb2f8fcba4f410fca617ac251e6c5fb9`. Son reçu annonce macOS 13.0 ; l’inspection indépendante des 40 entrées du DMG confirme **26 Mach-O x64**, minimum natif maximal **13.0.0**, worker GGUF et modules CPU/Metal, notice TRON-ABS embarquée et absence du serveur MLX réservé à Apple Silicon. Les dépendances chargées n’exigent pas de chemins de développement du runner. Aucun montage, lancement, installation, notarisation ou signature de production n’est effectué par cette inspection.

Les deux nouveaux DMG du même commit sont désormais inspectés : ARM64/macOS 14 et Intel/macOS 13. Ce run précède les tests de migration desktop ajoutés ensuite ; leur réussite Linux ne certifie pas ces DMG. Le seul build encore en cours est Windows x64, commun au desktop, NSIS, MSI et portable.

## Android vérifié — 06:59 UTC

Le [run `41281439087`](https://github.com/TRON-ABS/Novera/actions/runs/41281439087), commit `ff4740a0`, réussit l’assemblage APK après séparation des fournisseurs de partage et d’exports. L’[artefact `13074371303`](https://github.com/TRON-ABS/Novera/actions/runs/41281439087/artifacts/13074371303) téléchargé mesure 211 921 240 octets ; ses six empreintes, provenance et notice sont conformes. SHA-256 de l’archive GitHub : `31151eaebe90d85df82a530078848ba8b371dfba9eb54285f2411984566e3a9b`.

L’APK nommé `app-universal-debug.apk` contient uniquement l’ABI **arm64-v8a**. Les six bibliothèques requises (application, worker, GGML/base/CPU et libc++) sont des ELF ARM64 avec segments alignés à **16 384 octets**. Les outils officiels du SDK Android 37 confirment l’identité **`io.github.tronabs.novera.debug`**, les autorités `.fileprovider` et `.novera.share` avec la classe distincte `NoveraShareProvider`, une signature **APK v2 Android Debug valide** et le contrôle `zipalign -c -P 16 -v 4`. La notice TRON-ABS est embarquée ; aucun EXE/DLL ni pile Python/PyTorch desktop n’est présent. Les champs historiques de provenance `win32`/`x64` décrivent le runner, pas l’ABI de l’APK. Aucun APK n’est installé. Les trois audits mobiles, l’essai du partage sur appareil et la chaîne de signature release durable restent à valider.

## Nouveaux candidats vérifiés — 06:49 UTC

Le [run CLI `41280300978`](https://github.com/TRON-ABS/Novera/actions/runs/41280300978), commit `410caea5`, est entièrement réussi. Chaque hôte Windows/Linux/macOS exécute deux tests Rust de politique des mises à jour et d’aide : six réussis au total, zéro échec/ignoré. Les trois archives sont téléchargées ; 21 empreintes, provenance, notice TRON-ABS et architectures ELF x64 / PE x64 / Mach-O ARM64 sont conformes. Le nom interne historique `jan` reste conservé.

Le nouveau [DMG Apple Silicon](https://github.com/TRON-ABS/Novera/actions/runs/41278737556/artifacts/13073710701), commit `5468f183`, contient huit fichiers externes et sept empreintes vérifiées. Le reçu `MACOS-COMPATIBILITY.json` annonce 14.0 et 16 binaires ; l’inspection indépendante du DMG confirme 16 Mach-O ARM64 avec minimum maximal **14.0.0**, MLX, shaders et notice embarquée. SHA-256 de l’archive GitHub : `a3a7ed7c930888e773cce697e3ea5440d3b41d592281b821530b59ea32f76727`. Les DMG précédents exigeant macOS 15 restent des preuves historiques. Aucun lancement ou montage du DMG n’est effectué sur Windows ; l’installation macOS reste à tester. Ce run précède les nouveaux tests de migration desktop. Le job Intel du même run est désormais réussi et son paquet vérifié ci-dessus.


</details>

## Préparation des prochaines versions

Linux `e870627e`, [run `41279778571`](https://github.com/TRON-ABS/Novera/actions/runs/41279778571), confirme le nouveau cycle desktop : test GTK réel réussi et **9 tests Rust de compatibilité des données réussis / 0 échec / 0 ignoré** sur les fixtures 0.8.3 et 0.8.5. Le reçu est présent dans le candidat téléchargé. L’archive `13072669601` contient neuf fichiers, huit empreintes vérifiées ; Debian/AppImage passent à nouveau 50 contrôles ELF x64, avec notice embarquée, icône et exclusion des pilotes GPU hôtes. SHA-256 de l’archive GitHub : `2fdeab6ee3b7c0917744e6a1f4b9b742d1b189bdd3fd87d0aca82721d566deb1`. Aucun paquet n’est installé sur le profil personnel.

Le [cycle durable des versions](FUTURES_VERSIONS.md) ajoute un contrôle préalable des six sources de version, les tests de migration desktop et un générateur de manifeste pour cinq cibles desktop. Le [run de contrats `41281084320`](https://github.com/TRON-ABS/Novera/actions/runs/41281084320), commit `85558421`, réussit : 39 tests Node et deux tests propres à Windows ignorés sur Ubuntu ; les 41 passent localement sur Windows. La CLI Linux du run `41280300978` réussit ses deux tests Rust de politique et d’aide ; son nouveau paquet est téléchargé et vérifié. Linux réussit désormais les neuf tests de migration et les trois CLI leurs deux tests respectifs ; les autres jobs restent suivis individuellement.

Le [run `41281310528`](https://github.com/TRON-ABS/Novera/actions/runs/41281310528), commit `93815b15`, confirme le même résultat avec les nouvelles actions officielles Node 24 : installation Node et conservation de l’artefact de contrôle réussies, sans les anciens avertissements Node 20.

Android `e870627e` passe la compilation native puis échoue à la fusion du manifeste : le fournisseur de partage du plugin et celui des exports de l’application utilisent tous deux la classe `androidx.core.content.FileProvider`, avec des autorités et chemins différents. Le correctif `ff4740a0` donne au plugin sa propre sous-classe `NoveraShareProvider`, conserve les deux autorités, leurs ressources et l’accès non exporté, puis relance uniquement Android dans le [run `41281439087`](https://github.com/TRON-ABS/Novera/actions/runs/41281439087). La compilation APK est désormais réussie et son paquet vérifié ci-dessus ; les essais de partage sur appareil restent à confirmer.

## Lancement manuel

Workflow : [Novera — All distribution candidates](../.github/workflows/novera-build-all.yml). Entrée `target=all`, ou une des onze variantes du [catalogue](../scripts/distribution/release-targets.json). Les quatre variantes Windows x64 partagent un même build afin de conserver le même code et les mêmes dépendances. Une variante Windows demandée séparément produit également les formats Windows associés.

| Variante | Runner / résultat demandé |
| --- | --- |
| Desktop, Setup, MSI, portable | Windows x64 : runtime complet, NSIS, MSI et ZIP |
| Windows ARM64 | Runner ARM64 natif, moteur texte CPU et NSIS |
| Linux | Ubuntu : `.deb` et AppImage, moteur Vulkan |
| macOS | Deux builds natifs séparés Intel / Apple Silicon, DMG et moteur Metal |
| Android | Windows + JDK/SDK/NDK épinglés : APK de test ARM64 |
| iOS | macOS/Xcode : application pour simulateur Apple Silicon |
| Web | Frontend navigateur compilé |
| CLI | Windows, Linux et macOS : binaire et sortie `--help` |

Les applications macOS sont construites séparément par architecture : elles ne sont pas présentées comme un paquet universel dont tous les moteurs auraient deux tranches. Le moteur image Windows x64 n'est jamais copié dans Windows ARM64. La disponibilité des médias sur ces autres plateformes reste propre à leurs moteurs et prérequis ; une compilation ne garantit pas chaque fonction locale.

## Résultats et conservation

Chaque job réussi conserve un artefact GitHub Actions pendant **14 jours**, contenant les fichiers compilés, `candidate.json`, `SHA256SUMS`, les licences et `SIGNATURE.txt` : **TRON-ABS — The art of Human with AI**, avec le souhait d'une belle aventure en français et en anglais. Le portable porte aussi ce message dans son mode d'emploi. Les applications desktop embarquent une notice de signature. Aucun poids de modèle, discussion, clé personnelle, profil ou map privée n'est inclus par le collecteur.

Le commit et le run exacts figurent dans la provenance. Les matrices continuent lorsqu'une plateforme échoue ; le résumé global échoue si une matrice échoue. Les diagnostics de build sont conservés séparément pendant 7 jours quand ils sont disponibles. Un job vert signifie que sa commande et sa collecte ont réussi ; les champs `deviceValidated`, `productionSigned` et `publicReleasePublished` restent faux. Le worker desktop est exécuté avec `--version-json` ; la CLI avec `--help`. Cela ne remplace pas une inférence ni un essai d'installation sur une machine neuve.

Les anciens workflows de publication Jan, notifications et tâches planifiées doivent rester désactivés lors de l'activation du nouveau workflow manuel. Les commandes de ce lot ne publient pas vers npm, AWS, Discord, les stores Apple/Google ou un flux de mise à jour. Les artefacts Actions ne sont pas une release GitHub permanente ; une release exige une préparation et validation distinctes selon [la politique de publication](../OFFICIAL_RELEASES.md).

## Signature et mobile

Au contrôle initial, aucun secret Actions n'est configuré. Aucun certificat ni identité de production n'est inventé. Les signatures de marque TRON-ABS ne constituent pas une signature cryptographique des exécutables.

Les trois audits Android restent explicitement non validés dans `readiness.json`. Le nouveau commutateur `-AllowUnreviewedTestBuild` permet seulement un **APK debug de test sur GitHub Actions**, après tous les contrôles techniques existants. Il n'assouplit pas les builds ordinaires, n'ignore pas un SDK/moteur/permission manquant, ne coche pas les audits et ne certifie pas une distribution publique. Les licences SDK doivent être déjà provisionnées sur le runner : aucun acquittement automatique de nouveaux termes. Les SHA-256 du JDK et des outils Google sont contrôlés.

Le résultat iOS visé est pour **simulateur**, sans prétendre produire une IPA installable sur iPhone. Une archive appareil, TestFlight ou App Store exige l'équipe Apple réelle, les certificats et les profils appropriés. Le placeholder du dépôt est retiré dans la configuration temporaire du candidat simulateur uniquement. L'initialisation et la compilation réelles peuvent encore révéler des dépendances natives à corriger ; leurs résultats doivent être consignés.

## Contrôles avant premier lancement

`actionlint 1.7.12` valide le nouveau workflow. Les YAML sont parsés. Quatre tests du collecteur/politique Android réussissent ; les neuf tests du contrôle des distributions et ses onze références sont valides. Les 223 assertions / 12 scénarios du portable réussissent. La première tentative de contrôle Bash a été bloquée par l'isolation Windows ; les contrôles de syntaxe Bash des trois scripts ont ensuite réussi avec accès approprié. Ces contrôles ne sont pas des compilations multiplateformes.

## Premier lancement distant — 1er novembre 2026

Le mainteneur a explicitement autorisé l'activation de GitHub Actions, la désactivation des anciens workflows et la limitation des actions autorisées. État vérifié après application : **37 anciens workflows désactivés**, un seul workflow actif (`Novera - All distribution candidates`). La politique autorise les actions GitHub et l'action MSVC épinglée utilisée par ce workflow ; aucun secret de signature n'a été ajouté.

Le [run 41272733352](https://github.com/TRON-ABS/Novera/actions/runs/41272733352) est déclenché avec `target=all` depuis le commit `3f072579bbc2e97c15ea2cd4d0c6bf49d3902641`. GitHub a créé onze jobs de compilation, initialement en file d'attente, avec les quatre formats Windows regroupés et plusieurs hôtes pour macOS/CLI. Le résumé dépend de ces matrices. Aucun artefact compilé ni succès distant n'est encore attesté par ce premier relevé. Les résultats ultérieurs doivent conserver le commit exact de leur run plutôt que le HEAD courant.


### Premier correctif issu du run

Le job Web échoue réellement à l'installation immuable Yarn (`YN0028`), avant la compilation : l'entrée racine `novera-app@workspace:.` est restée à l'ancienne position alphabétique de son nom précédent. L'entrée est déplacée à sa position canonique. Les arbres YAML avant/après sont comparés égaux : aucune version ni dépendance n'est changée. L'essai local de validation Corepack a été empêché par l'accès réseau du bac à sable ; le résultat de l'installation immuable doit être confirmé par le prochain run GitHub. Une relance depuis le commit corrigé remplace le run initial, dont les résultats ne sont pas présentés comme des compilations réussies.

### Préparation native Windows et actions imbriquées

Les journaux du premier run révèlent également deux causes distinctes : l'action composite demandait une action tierce d'installation de jq absente de la liste autorisée ; la CLI Windows prenait le `link.exe` GNU de Git Bash à la place du linker MSVC. Le provisionnement jq utilise désormais l'outil présent sur le runner ou son gestionnaire natif, sans élargir les permissions GitHub. Un script commun sélectionne le linker MSVC par chemin complet pour le bon hôte/cible x64 ou ARM64, y compris pour la CLI. Une relance du workflow manuel remplace les candidats précédents du même groupe ; elle ne crée pas de publication automatique.

Validation du correctif natif : **5 tests de candidats/politiques réussis**, dont sélection réelle du chemin MSVC pour fixtures x64/ARM64 avec espaces et refus d’un outil absent ; actionlint toujours sans erreur.

### Run corrigé et première compilation réussie

[Run 41273037531](https://github.com/TRON-ABS/Novera/actions/runs/41273037531), commit `7cced48a4b6924f9e20e91a064c2c2a027638e24` : **Web compilé et artefact retenu**, identifiant `13069523743`, 49 318 112 octets. Cette réussite confirme l'installation Yarn immuable après normalisation du verrou. Les autres plateformes sont encore suivies individuellement.

Windows x64 a ensuite échoué sur une comparaison SHA-256 CUDA. Vérification indépendante du premier composant depuis le manifeste officiel NVIDIA : archive NVCC 13.4.92 de 32 991 192 octets, SHA-256 attendu et réel `23950047aa5405993129a982a99924b4e6d5eb9bc312300030f3afd9b3b49ea4`, conformes. Cause reproduite localement : GNU `sha256sum` préfixe l'empreinte par un caractère d'échappement lorsque le nom contient les antislashs d'un chemin Windows. Calculer sur l'entrée standard évite ce marqueur, sans retirer la vérification. Seul Windows est relancé après ce correctif ; les plateformes encore actives conservent leur run.

### Validation des artefacts et catalogue CUDA

L'artefact Web est téléchargé et validé indépendamment : **594 fichiers, 593 empreintes vérifiées**, signature TRON-ABS et provenance conformes. SHA-256 de l'archive GitHub : `ace1e40c9b803052d505ebed92aa1b89ef24d89e04383beab7b667cd220b91a5`. Aucun profil, discussion ou poids de modèle n'est présent selon le contrôle du contenu et le manifeste.

Relance Windows [41273326935](https://github.com/TRON-ABS/Novera/actions/runs/41273326935), commit `dfe64604` : la comparaison des archives est rétablie ; le provisionnement révèle ensuite le renommage officiel `cuda_cccl` → `cccl` dans CUDA 13.4.3. Un planificateur valide désormais tous les composants, leur architecture, version, chemin et SHA-256 avant le premier téléchargement. Il conserve les anciens catalogues et n'autorise les trois composants historiquement intégrés à NVCC que sur les anciennes versions concernées. Les notices de chaque composant sont conservées ; le document EULA officiel de NVCC est copié sans modification sous le nom attendu par le packager image. Le runtime image conserve aussi ces notices redist. **8 tests** des nouveaux contrôles passent, ainsi qu'actionlint.

### CLI et premier démarrage Android

Les CLI Linux x64 et macOS ARM64 ont compilé sur le run `41273037531`, exécuté `--help`, puis retenu leurs artefacts. Vérification indépendante de chaque archive : **8 fichiers, 7 empreintes conformes**, signature TRON-ABS, provenance et architecture réelle (ELF x64 / Mach-O ARM64) confirmées. Artefacts : Linux `13069749955` (20 828 083 octets, SHA-256 `610412c849c00616419dbc3e1c6c6bd815502ba7ca720423370612d6ef7418fb`) ; macOS `13069439592` (13 882 558 octets, SHA-256 `42c920a8af6c6c9462d3a1c930cad967cda0d5cce1e6874e8eae4c1fd8f6841b`). Le binaire interne reste nommé `jan` ; après téléchargement d'un artefact ZIP sur Unix, rétablir au besoin son droit d'exécution avec `chmod +x jan`.

Android : le provisionnement JDK/SDK/NDK épinglé a abouti, sans nouvelle acceptation automatique de licence. Le projet Tauri est généré mais la configuration échoue faute de `tauri.settings.gradle`, normalement émis par le premier Cargo mobile. L'initialisation ajoute donc un bootstrap frontend puis `cargo check --locked --lib --no-default-features --features mobile --target aarch64-linux-android` avec le contexte Android avant de configurer les copies Gradle. Un projet déjà initialisé conserve le chemin existant. Les trois tests de configuration Android et la syntaxe PowerShell réussissent ; le bootstrap natif réel est à confirmer par la relance Android.

### Cause commune aux builds natifs vierges : icônes générées

Windows ARM64 atteint le build Tauri mais échoue sur `icons/icon.ico` absent ; le message `package.metadata does not exist` qui le précède n'est pas la cause bloquante. iOS atteint sa compilation Rust/Xcode de simulateur, puis échoue sur `icons/32x32.png` absent. Ces icônes sont générées localement par le lanceur existant et ne sont pas des entrées binaires versionnées. Le script CI ajoute `yarn build:icon` avant toutes les constructions natives, y compris le bootstrap Android.

Le sélecteur manuel `native` relance uniquement les applications desktop et mobiles. Il ne recompilera pas les trois CLI et le Web déjà compilés et vérifiés. Les anciennes tentatives natives sont remplacées ; leurs artefacts déjà réussis restent disponibles. Aucune réussite complète ARM64/iOS n'est déduite de ce correctif avant son nouveau build.

La notice personnelle TRON-ABS est également copiée dans les assets du futur APK Android, et pas seulement dans son artefact extérieur. Le test du collecteur confirme qu’une notice seule ne permet jamais de certifier une compilation vide. Les **11 tests** candidats/CUDA/configuration Android passent après ces modifications ; actionlint est sans erreur.

### Linker CMake du moteur CUDA

Le build Windows du run `41273736808` dépasse le provisionnement, puis CMake choisit à son tour le `link.exe` GNU pour son test NVCC, bien que Cargo ait déjà son linker MSVC. Le journal confirme que NVCC compile le test CUDA et que le lien échoue sur l'outil GNU. Le même chemin MSVC vérifié est maintenant transmis explicitement au build CMake du moteur avec `NOVERA_MSVC_LINKER`, sans modifier le comportement des environnements qui ne le définissent pas. Le test x64/ARM64 contrôle les deux réglages exportés ; les cinq tests de candidats/politiques passent. Android confirme le même défaut d'icônes dans son bootstrap Cargo précédent ; la génération commune des icônes couvre également ce cas.

### Régression de compilation GTK 3

Le premier build Linux a une seconde erreur réelle, en plus des icônes : `gtk::Clipboard` 0.18.2 ne possède pas `set_uris`. L'archive officielle de cette version a été vérifiée contre le SHA-256 du verrou Cargo ; `set_uris` appartient à `SelectionData`. La copie de fichiers utilise maintenant `Clipboard::set_with_data` avec une cible `text/uri-list`, conserve l'URI dans le callback, propage un refus d'appropriation et demande sa conservation au gestionnaire de presse-papiers.

Le contrôle Linux isolé compile le **même module que la production** et demande réellement l'URI au presse-papiers sous Xvfb, avec espace/Unicode encodés. Il ne duplique pas l'implémentation dans une fixture et ne touche pas le presse-papiers du mainteneur. Son résultat doit être confirmé par GitHub ; il n'a pas été exécuté sur Windows. Les tentatives natives concernées sont remplacées par un run depuis ces correctifs, tandis que les quatre artefacts Web/CLI validés restent conservés.

### Contrôle visuel Web et premier lancement navigateur

L'artefact Web vérifié est servi localement sans recompiler les sources et ouvert dans un navigateur vierge. L'interface charge Novera 1.0.0 sans discussion, mais l'accueil initial impose le wizard d'installation du moteur desktop, inadapté au navigateur. L'accueil Web sans fournisseur utilisable est maintenant dirigé vers les réglages existants des fournisseurs ; les applications Tauri (desktop/mobile) conservent leur parcours natif. Aucun nouveau libellé ni catalogue de traduction n'est ajouté.

**13 tests de route réussis**, dont navigateur vierge, navigateur avec fournisseur distant et parcours natif existant ; TypeScript et lint ciblé réussissent. Une nouvelle compilation Web GitHub doit confirmer le correctif, puis son écran initial sera contrôlé. Le serveur d'aperçu initial isolé n'était pas accessible au navigateur ; il a été relancé hors de cette isolation, sur boucle locale uniquement, sans changement du pare-feu ni des paramètres de sécurité.

### Contrat du test GTK

Le run natif `41275047042` compile le nouveau module de production GTK. Son test isolé échoue ensuite à la compilation parce que `wait_for_uris()` renvoie directement un `Vec<GString>`, et non une option. Retirer l'appel `expect` du test conserve les assertions sur la liste et l'URI retournée. Ce défaut appartient au test ajouté ; aucune réussite de l'échange presse-papiers n'est encore annoncée avant la relance Linux.

### Web corrigé : build et contrôle visuel confirmés

[Run Web 41275648200](https://github.com/TRON-ABS/Novera/actions/runs/41275648200), commit `307fbb16a78abf4a0baaa7d70b5d6a36a433a233` : job et résumé réussis. Artefact `13070388490`, **49 318 320 octets / 594 fichiers / 593 empreintes conformes**, SHA-256 `110792ff7fdf6e41505c46065a4f7aed1e986296ec394734670e6075a121d8aa`. Notice personnelle et provenance vérifiées.

Le navigateur vierge ouvre désormais `/settings/providers` directement. Le formulaire existant de fournisseur compatible OpenAI/Anthropic s'ouvre correctement ; aucune clé ni génération n'est utilisée pour ce test. Aucun téléchargement de modèle n'est lancé. La capture de contrôle est conservée localement hors Git. Les onglets et deux serveurs d'aperçu créés pour le test sont fermés/arrêtés. Ce contrôle du premier lancement n'est pas une preuve d'inférence cloud ni un test de chaque fournisseur.

### Collecte iOS et chemins Windows : relances ciblées

Le run natif `41275047042` compile réellement l’application iOS : Xcode annonce `BUILD SUCCEEDED`, puis Tauri produit `src-tauri/gen/apple/build/arm64-sim/Novera.app`. Le collecteur attendait un chemin contenant `simulator` et refusait donc ce résultat. Le filtre reconnaît désormais les répertoires Tauri `arm64-sim` / `x86_64-sim` et les produits `iphonesimulator`, en excluant une application device `arm64`. Un test archive la bonne application parmi les deux et relit son contenu : réussi. Relance iOS `41276290611`, commit `a84f8cf6` ; la compilation précédente ne vaut pas artefact téléchargeable puisqu’elle n’avait pas été collectée.

Windows x64 passe désormais la détection CUDA mais échoue dans le sous-build Vulkan sur `RC1109`, lors de la création d’un manifeste dans un chemin très imbriqué. Le build CI utilise le répertoire moteur court sous `RUNNER_TEMP`, avec l’isolation par `OUT_DIR` déjà fournie par le moteur et son reçu de staging. Aucune modification du registre ou des réglages Windows. Relance Windows x64 `41276293618`, même commit. Six tests de collecteur/politiques réussissent, ainsi que la syntaxe Bash. Les autres architectures continuent sur leur run d’origine.

### Android : environnement des commandes frontend

Le run natif `41275047042` termine le bootstrap Android et le moteur ARM64, puis échoue dans `beforeBuildCommand` : `cross-env` introuvable. L’entrée APK invoquait directement le fichier JavaScript de Tauri, sans le chemin des outils du workspace fourni par Yarn. Elle passe maintenant par `corepack yarn tauri`, sans changer les contrôles Android ni les dépendances. Syntaxe PowerShell et neuf tests ciblés collecteur/configuration/politiques réussis. Relance Android `41276458095`, commit `ce35ecbd`.

### macOS : prérequis et ressources propres à l’architecture

Le serveur MLX documente Apple Silicon et Xcode 26.2 comme prérequis. Le nouveau workflow choisit maintenant cette installation Xcode par `DEVELOPER_DIR` pour le desktop ARM64, comme les workflows macOS existants ; aucun changement persistant de `xcode-select`. Intel conserve son worker GGUF natif et exclut les ressources MLX réservées à Apple Silicon. Le manifeste de candidat indique cette limite. Un test relit la vraie configuration macOS et vérifie que le worker GGUF reste présent sur Intel, que MLX est exclu sur Intel et conservé sur ARM64. Sept tests de collecteur/politiques et syntaxe Bash réussis. Relance macOS `41276594974`, commit `9f68b5d3` ; les compilations natives restent à confirmer par les résultats du run.

### iOS simulateur : candidat téléchargé et inspecté

[Run iOS `41276290611`](https://github.com/TRON-ABS/Novera/actions/runs/41276290611), commit `a84f8cf64b03367e9b6e2d271083a20d1e29e30e` : compilation, collecte et résumé réussis. Artefact `13071509324`, **81 814 413 octets / 7 fichiers / 6 empreintes conformes**, SHA-256 `bb3a16377d1da77a722d68932ded5ffd0463f778094aa970d3d07d761124218a`.

L’archive interne `Novera-iOS-simulator-0.tar.gz` contient **17 entrées**. Lecture indépendante de l’exécutable Mach-O : **ARM64**, commande `LC_BUILD_VERSION` indiquant la plateforme **iOS Simulator (7)**. La notice TRON-ABS est présente dans l’application elle-même ; chemins, inventaire et absence de poids/profils/discussions contrôlés. Cela confirme un paquet de simulateur, pas une IPA signée pour iPhone. Aucun lancement sur simulateur ou appareil réel n’est encore certifié. Le journal conserve aussi un avertissement Xcode sur l’identifiant personnalisé du plist ; il n’a pas empêché ce build de simulateur et devra être revu avant le provisioning d’une version device.

### Windows ARM64 : desktop et NSIS vérifiés

Job ARM64 `124755700775` réussi dans le [run `41275047042`](https://github.com/TRON-ABS/Novera/actions/runs/41275047042), commit `bb8a1040c17f5b9326859f945bfe1212966c9a81`. Artefact `13071721946` : **291 192 696 octets / 20 fichiers / 19 empreintes conformes**, SHA-256 `cb3d9ac4b51d5c39a0393e857aeed1d107ad25702f6b17e44e97ffd226690620`.

Les **sept exécutables/DLL du desktop sont réellement ARM64**. Le worker CPU et ses bibliothèques sont présents ; le runtime image x64 est exclu. Extraction indépendante du NSIS `Novera_1.0.0_arm64-setup.exe` avec 7-Zip 26.05 : **16 fichiers**, les **neuf fichiers runtime attendus** correspondent exactement aux empreintes du desktop. Les autres entrées appartiennent à NSIS et au désinstalleur. Notice TRON-ABS embarquée. Aucun installateur ni application ARM64 n’est exécuté sur le PC x64 du mainteneur ; l’essai sur appareil Windows ARM64 reste à effectuer.

Après cette réussite, les deux anciens jobs macOS encore en cours dans le run natif sont remplacés par la relance macOS dédiée. L’arrêt du run global conserve les artefacts réussis ; il ne transforme pas ses anciennes erreurs en validations.

### macOS Apple Silicon : premier DMG inspecté

Le job macOS ARM64 `124755700844` termine également avec succès juste avant la fin du run natif `41275047042`. Artefact `13072130830` : **108 367 202 octets / 7 fichiers / 6 empreintes conformes**, SHA-256 `8a55653d9995f8211fedb124da112bae684d6e88442330893ce2a5a0bfc22e21`.

Inspection indépendante du DMG/HFS sans installer ni exécuter l’application : **35 entrées**, **16 binaires/bibliothèques Mach-O ARM64** vérifiés, dont l’application, Bun, uv, le worker GGUF et MLX. Notice personnelle présente dans l’application ; `default.metallib` est embarqué. Les dépendances chargées référencent les frameworks système ou les bibliothèques livrées via `@rpath`, avec `@loader_path` en tête des chemins de recherche du worker. Les chemins de développement supplémentaires du runner ne sont pas nécessaires à ces bibliothèques locales ; cela reste un contrôle statique, pas une validation d’inférence ou de lancement sur un Mac neuf. La relance dédiée macOS `41276594974` poursuit les contrôles Intel et Apple Silicon.

### Linux : Debian et AppImage vérifiés, test GTK réussi

[Run Linux `41275746510`](https://github.com/TRON-ABS/Novera/actions/runs/41275746510), commit `0beb13a3280c0665063674391112d493ec2ba991` : compilation, collecte et résumé réussis. Artefact `13071478788` : **321 560 268 octets / 8 fichiers / 7 empreintes conformes**, SHA-256 `bad4f68ae0b8da53ab9deba7f5cd49ceea6f4dd4b6b45ba453d7597b37c1e911`. Debian : **127 787 272 octets** ; AppImage : **193 747 448 octets**.

Le journal confirme le test réel `clipboard_serves_a_file_uri_to_a_consumer` sous Xvfb : **1 réussi, 0 échec, 0 ignoré**, exécuté sur le module GTK de production. Inspection indépendante des paquets sans les installer ni les exécuter : Debian **47 entrées / 25 ELF x64**, AppImage **564 entrées / 25 ELF x64**. Application, Bun, uv, worker, modules CPU et Vulkan présents ; signature TRON-ABS embarquée dans les deux formats. L’AppImage conserve `.DirIcon` et exclut les bibliothèques de pilote `libcuda.so` / chargeur `libvulkan.so` qui doivent provenir du système utilisateur. Lancement graphique, inférence et installation sur distributions cibles restent à tester séparément.

### Android : argument Cargo perdu par le CLI verrouillé

La relance `41276458095` dépasse bien `cross-env`, puis échoue sur les API tray/updater desktop activées dans le build mobile. Le journal montre le Cargo initial sans `--no-default-features`, malgré l’argument demandé. Le [source officiel du CLI Tauri 2.8.4](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.8.4/crates/tauri-cli/src/mobile/android/build.rs) utilise les options par défaut pour ce premier build Android. Le [CLI 2.11.4](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.11.4/crates/tauri-cli/src/mobile/android/build.rs) transmet les arguments demandés au premier Cargo.

Épingler `@tauri-apps/cli` à **2.11.4** corrige ce chemin sans activer les fonctions desktop sur mobile. Comparaison sémantique du verrou : seules les entrées CLI Tauri, ses binaires hôtes et la référence du workspace racine changent. Installation `corepack yarn install --immutable --mode=skip-build` réussie et `tauri-cli --version` confirme 2.11.4 ; aucun build d’application local. Les avertissements de peers React/TypeScript préexistants restent visibles. Relance Android depuis `d142e12ee4e785d5204d027e73b722f21becec4f`.

### macOS : minimums de compilation et métadonnées alignés

La relance ARM64 `41276594974` réussit, puis son DMG `13071619315` est téléchargé et inspecté : **108 550 638 octets / 6 empreintes conformes / 16 Mach-O ARM64**, SHA-256 `2fff8b4c5ed0a0587a0624e443a25a3242ad226a4cba10feec8850a2ad7d7b63`. MLX, ses shaders et la notice embarquée sont présents. Toutefois, la lecture des commandes Mach-O révèle que **les bibliothèques GGUF de ce candidat exigent macOS 15**, contrairement au minimum plus ancien annoncé par l’application. Les anciens DMG restent donc des candidats pour macOS 15 ; ils ne prouvent pas le fonctionnement sur macOS 13/14.

Le nouveau profil CI définit un minimum commun à la compilation CMake/Rust et au plist Tauri : **macOS 14.0 sur Apple Silicon** (minimum MLX déclaré) et **13.0 sur Intel** (minimum Bun observé). Un helper partagé fournit ces valeurs aux deux étapes. Après packaging, le contrôle lit les commandes de chaque Mach-O dans l’application, vérifie CPU/plateforme/version minimale et compare le plist ; toute bibliothèque plus exigeante bloque la collecte. Un reçu `MACOS-COMPATIBILITY.json` est ajouté aux candidats qui passent ce contrôle.

Douze tests ciblés réussissent : contrats du collecteur, prérequis MLX lus dans son vrai manifeste et quatre cas de lecture Mach-O, dont le défaut observé macOS 15 sous une déclaration 14, les commandes Intel anciennes, les versions patch, une cible iOS/CPU incorrecte et les entrées tronquées. Syntaxe Bash réussie. [Relance macOS `41278737556`](https://github.com/TRON-ABS/Novera/actions/runs/41278737556), commit `5468f183c5b94f276d1de7ca4f95edf9bc586d83`, encore en compilation. Ce ciblage ABI ne certifie pas à lui seul un lancement ou une inférence sur les anciennes versions de macOS.
