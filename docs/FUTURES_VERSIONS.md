# Préparer les prochaines versions et mises à jour Novera

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

Le cycle reste piloté depuis le dépôt **TRON-ABS/Novera**. Les compilations manuelles, contrôles de versions, tests de migration et vérifications des paquets préparent les prochaines distributions. La publication officielle et l’activation des mises à jour signées suivent la [politique de versions](../OFFICIAL_RELEASES.md). Les résultats des builds en cours figurent dans [le suivi CI](CI_DISTRIBUTIONS.md).

## Préparer un numéro de version cohérent

Prévisualiser, par exemple, le passage à 1.0.1 :

```sh
node scripts/distribution/prepare-version.mjs 1.0.1
```

Cette commande affiche les six fichiers concernés sans les modifier. Après choix du numéro et revue du plan :

```sh
node scripts/distribution/prepare-version.mjs 1.0.1 --write
git diff --check
node scripts/distribution/check-release-readiness.mjs
```

L’outil synchronise le frontend, la configuration Tauri, le package Rust principal, la CLI et leurs deux verrous Cargo. Il conserve les versions des dépendances tierces. Il refuse une incohérence existante, un retour en arrière, une simple variation de métadonnées de build ou un fichier modifié depuis le calcul du plan. Il compare correctement les composantes numériques et les préversions. Une demande du numéro déjà présent ne réécrit rien.

Les discussions, modèles, chemins configurés et profils utilisateurs ne sont pas des entrées de cet outil. Il ne compile pas, ne crée pas de tag et ne publie rien. La version actuelle n’a pas été augmentée par les prévisualisations de validation.

Les préversions servent aux candidats ; le générateur du flux stable refuse les préversions. Les compteurs de build, règles de signature et exigences propres aux stores mobiles restent à vérifier avant chaque livraison sur un store.

## Contrôles GitHub obligatoires

Le workflow [Novera — All distribution candidates](../.github/workflows/novera-build-all.yml) propose `target=checks` pour contrôler les sources seules et `target=all` pour les onze variantes. Une cible précise permet une relance limitée. Les matrices de compilation dépendent du contrôle des sources : une incohérence de versions ou de verrous bloque leur démarrage.

Les contrôles couvrent les définitions des distributions, la préparation des versions, l’exclusion des profils/poids, la collecte des vrais paquets, les prérequis CUDA, les configurations mobiles et les contrats du flux de mise à jour Novera. Les tests de format de signature utilisent des paquets synthétiques : ils ne constituent pas une validation cryptographique de release.

Les actions d’installation Node et de conservation des artefacts utilisent désormais les versions officielles [setup-node 7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0) et [upload-artifact 7.0.2](https://github.com/actions/upload-artifact/releases/tag/v7.0.2), épinglées par SHA et exécutées sous Node 24. Le cache automatique de gestionnaire de paquets reste désactivé. Cette préparation retire la dépendance aux anciennes actions Node 20 ; le [contrôle GitHub du nouveau workflow](https://github.com/TRON-ABS/Novera/actions/runs/41281310528) réussit, avec conservation de ses résultats.

Chaque build desktop passe aussi la suite Rust `upgrade_compat` sur les anciennes données de release conservées dans le dépôt. Zéro test exécuté, un échec ou un test ignoré empêchent la collecte finale. Le reçu `UPGRADE-COMPATIBILITY.json` indique le commit, les fixtures et le nombre de tests réussis. Le runtime distribué est figé avant ces tests ; les installateurs, le desktop et le portable ne récupèrent pas un EXE reconstruit ultérieurement par Cargo.

Lors d’un changement de schéma, conserver une fixture de l’ancienne version et ajouter le scénario de migration. Ne pas remplacer les anciennes fixtures pour faire disparaître un échec. Les tests actuels couvrent leurs formats et cas documentés ; ils ne certifient pas toute donnée future ni un essai réel de mise à jour sur appareil.

La CLI conserve le nom d’exécutable historique `jan`, avec l’identité Novera et la signature TRON-ABS dans son aide. Ses builds Windows/Linux/macOS testent que l’état non configuré refuse le contrôle et la mise à jour forcée. Un canal CLI signé Novera reste à implémenter avant d’activer ce mécanisme.

## Compatibilité des paquets

Les candidats conservent `candidate.json`, `SHA256SUMS`, les notices et la signature personnelle. Le manifeste indique le commit et le run exacts. Ses champs historiques `platform` et `architecture` décrivent l’hôte de compilation ; la cible mobile est confirmée séparément par le contenu natif du paquet.

Pour macOS, les cibles de compilation et le plist partagent leur minimum : 14.0 sur Apple Silicon avec MLX, 13.0 sur Intel avec GGUF. Le contrôle lit les architectures, plateformes et minimums des Mach-O réellement emballés. Une dépendance plus exigeante fait échouer le build. Les candidats qui passent conservent `MACOS-COMPATIBILITY.json`. Les premiers DMG antérieurs à ce contrôle exigent macOS 15 ; consulter leur provenance dans le suivi CI.

Les contrôles indépendants des téléchargements vérifient les empreintes et les fichiers embarqués. La compilation, l’inspection d’un paquet, la signature de production et un essai d’installation/mise à jour sont des validations distinctes. Avant publication, essayer la version précédente vers la nouvelle sur un profil de test et vérifier la conservation des conversations, modèles et réglages.

## Canaux de mise à jour

| Distribution | Préparation actuelle / condition de livraison |
| --- | --- |
| Windows x64 / ARM64 NSIS | Générateur de configuration et de manifeste Novera disponible pour les deux architectures ; première installation manuelle d’un client contenant la bonne clé publique requise. |
| Windows portable | Remplacement manuel du runtime complet ; les modèles et profils restent des données séparées. Le portable actuel ne devient pas actualisable par un manifeste seul. |
| Linux x64 | Le générateur accepte l’AppImage signé ; le paquet Debian ne sert pas de fichier d’update Tauri. |
| macOS ARM64 / Intel | Le générateur accepte les archives `.app.tar.gz` signées par architecture ; les DMG de candidats ne sont pas des archives d’update. |
| Android | APK debug de test avec suffixe `.debug`, distinct de l’identité de production. Une chaîne release exige une clé de signature durable et des compteurs de version corrects ; les trois audits mobiles restent à terminer. |
| iOS | Le candidat actuel vise le simulateur. Distribution sur iPhone/iPad et mises à jour via les canaux Apple exigent équipe, certificats, provisioning et validation sur appareil. |
| Web | Nouveau déploiement du frontend compilé, avec contrôle du premier lancement et des fournisseurs ; ce n’est pas le mécanisme d’update desktop. |
| CLI | Paquets manuels par plateforme ; contrôle automatique et remplacement forcé restent indisponibles sans canal Novera signé. |

Les clés debug Android des runners ne sont pas une identité de production durable. Les futures releases doivent garder leur identité d’application et leur chaîne de signature pour permettre une mise à jour normale ; une désinstallation destinée à contourner un changement de signature risque de supprimer les données et ne fait pas partie de ce cycle.

## Passer d’un candidat à une release signée

Le [guide des mises à jour signées](BUILD_AND_RELEASE.md#updates) décrit la configuration de la clé publique et du flux exclusif Novera. La clé privée, son mot de passe et les certificats de plateforme restent hors du dépôt et des artefacts. Réutiliser la chaîne de confiance prévue pour les versions suivantes ; toute rotation demande un plan de transition et des essais.

Le générateur prépare un seul `latest.json` pour les cinq cibles desktop. Exemple de fichier `release/updates.json` (chemins relatifs à ce fichier) :

```json
[
  {"platform":"windows-x86_64","artifact":"Novera_1.0.1_x64-setup.exe","signature":"Novera_1.0.1_x64-setup.exe.sig"},
  {"platform":"windows-aarch64","artifact":"Novera_1.0.1_arm64-setup.exe","signature":"Novera_1.0.1_arm64-setup.exe.sig"},
  {"platform":"linux-x86_64","artifact":"Novera_1.0.1_amd64.AppImage","signature":"Novera_1.0.1_amd64.AppImage.sig"},
  {"platform":"darwin-aarch64","artifact":"Novera_1.0.1_aarch64.app.tar.gz","signature":"Novera_1.0.1_aarch64.app.tar.gz.sig"},
  {"platform":"darwin-x86_64","artifact":"Novera_1.0.1_x64.app.tar.gz","signature":"Novera_1.0.1_x64.app.tar.gz.sig"}
]
```

```sh
node scripts/updates/novera-update.mjs manifest --version 1.0.1 --artifacts-file release/updates.json --notes release/notes.md --out .build/latest.json
```

Ne conserver dans la liste que les cibles réellement construites, signées et vérifiées. Les noms macOS distincts évitent une collision d’assets sur GitHub ; conserver les octets signés inchangés et associer chaque archive à sa bonne signature. L’outil refuse les doublons de plateforme, mauvais formats/architectures/versions, signatures structurellement incorrectes et fichiers de sortie existants. Il calcule les SHA-256 en lecture continue, sans charger les grands paquets en RAM. Les URL restent fixées au dépôt Novera et au tag de la version. Il ne signe, ne téléverse ni ne valide cryptographiquement les fichiers ; le contrôle de signature réel et l’essai d’update restent nécessaires.

Le mode ordinaire conserve les mises à jour automatiques désactivées ; le mode explicite `signed_updates=true` les configure pour les nouveaux builds desktop et vérifie les signatures finales. Il ne publie pas sur les stores ni sur un flux d’update. Les artefacts Actions sont retenus 14 jours : une release permanente demande son propre brouillon, ses assets validés, ses signatures et l’approbation du mainteneur selon la politique du dépôt.

Au contrôle initial, aucun secret Actions ni clé publique locale n’était configuré. La création de la clé et des deux secrets chiffrés est désormais autorisée et réalisée, comme décrit en tête de ce guide. La signature de marque **TRON-ABS — The art of Human with AI** est embarquée ; elle ne remplace pas ces clés et certificats.

## Preuves du cycle en cours

Le candidat Android `ff4740a0` du [run `41281439087`](https://github.com/TRON-ABS/Novera/actions/runs/41281439087) compile et son APK téléchargé est vérifié : six empreintes, six ELF ARM64 alignés à 16 Ko, identité `.debug`, deux fournisseurs distincts, signature APK v2 Android Debug valide et contrôle zipalign. Il reste un paquet de test, sans validation des trois audits mobiles, d’une installation sur appareil ou d’une signature release durable.

Le nouveau DMG Apple Silicon du [run `41278737556`](https://github.com/TRON-ABS/Novera/actions/runs/41278737556), commit `5468f183`, réussit le contrôle de minimum macOS. Son archive téléchargée passe sept empreintes, le reçu et une inspection indépendante des 16 Mach-O ARM64 du DMG : minimum maximal **14.0.0**, MLX/shaders présents. Le candidat Intel du même run est aussi réussi et téléchargé : sept empreintes, reçu macOS 13.0 et 26 Mach-O x64 contrôlés indépendamment, minimum maximal 13.0.0 et MLX exclu. Ce build précède l’ajout des tests de migration desktop en CI ; leur résultat Linux ne lui est pas attribué.

Le nouveau [build Linux `41279778571`](https://github.com/TRON-ABS/Novera/actions/runs/41279778571), commit `e870627e`, réussit les **neuf tests Rust de migration / zéro échec / zéro ignoré** sur les fixtures 0.8.3 et 0.8.5. Le candidat Debian/AppImage téléchargé conserve le reçu réel, huit empreintes conformes et 50 binaires ELF x64 vérifiés. Les essais d’installation et de mise à jour graphique restent distincts.

Sur Windows : **41 tests Node ciblés réussis**, dont sept tests du générateur d’update ; actionlint et syntaxe Bash réussis au contrôle du workflow. Le contrôle sur [GitHub, run `41279778571`](https://github.com/TRON-ABS/Novera/actions/runs/41279778571), commit `e870627e`, confirme **35 réussis / 2 tests spécifiques Windows ignorés sur Ubuntu / 0 échec** pour le lot précédent de 37 tests. Les tests Windows correspondants passent localement. Le [lot étendu de 41 tests sur GitHub](https://github.com/TRON-ABS/Novera/actions/runs/41281084320), commit `85558421`, réussit aussi : **39 réussis / 2 tests propres à Windows ignorés sur Ubuntu / 0 échec**. La CLI Linux du [run `41280300978`](https://github.com/TRON-ABS/Novera/actions/runs/41280300978), commit `410caea5`, réussit ses **deux tests Rust de politique et d’aide** ; son archive est téléchargée et vérifiée. Les trois CLI de ce run passent désormais chacune leurs deux tests Rust ; les trois archives sont téléchargées, leurs 21 empreintes et architectures vérifiées. Les autres migrations desktop restent suivies par leurs jobs réels.

Pour chaque nouvelle version, mettre à jour les notes de changements, ce guide si le cycle évolue, le suivi de validation et `PR.md`. Conserver le commit exact, les résultats exécutés et les limites connues ; ne pas reporter une réussite d’un ancien paquet sur une nouvelle compilation.

**TRON-ABS**

*The art of Human with AI*
