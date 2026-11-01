# Préparer les prochaines versions et mises à jour Novera

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

Le workflow de candidats conserve les mises à jour automatiques désactivées. Il ne publie pas sur les stores ni sur un flux d’update. Les artefacts Actions sont retenus 14 jours : une release permanente demande son propre brouillon, ses assets validés, ses signatures et l’approbation du mainteneur selon la politique du dépôt.

Au contrôle de ce lot, aucun secret Actions n’est configuré et la clé publique n’est pas présente à l’emplacement local prévu par le guide. La signature de marque **TRON-ABS — The art of Human with AI** est embarquée ; elle ne remplace pas ces clés et certificats.

## Preuves du cycle en cours

Le nouveau DMG Apple Silicon du [run `41278737556`](https://github.com/TRON-ABS/Novera/actions/runs/41278737556), commit `5468f183`, réussit le contrôle de minimum macOS. Son archive téléchargée passe sept empreintes, le reçu et une inspection indépendante des 16 Mach-O ARM64 du DMG : minimum maximal **14.0.0**, MLX/shaders présents. Le contrôle Intel reste en cours. Ce build précède l’ajout des tests de migration desktop en CI ; leur résultat Linux ne lui est pas attribué.

Le nouveau [build Linux `41279778571`](https://github.com/TRON-ABS/Novera/actions/runs/41279778571), commit `e870627e`, réussit les **neuf tests Rust de migration / zéro échec / zéro ignoré** sur les fixtures 0.8.3 et 0.8.5. Le candidat Debian/AppImage téléchargé conserve le reçu réel, huit empreintes conformes et 50 binaires ELF x64 vérifiés. Les essais d’installation et de mise à jour graphique restent distincts.

Sur Windows : **41 tests Node ciblés réussis**, dont sept tests du générateur d’update ; actionlint et syntaxe Bash réussis au contrôle du workflow. Le contrôle sur [GitHub, run `41279778571`](https://github.com/TRON-ABS/Novera/actions/runs/41279778571), commit `e870627e`, confirme **35 réussis / 2 tests spécifiques Windows ignorés sur Ubuntu / 0 échec** pour le lot précédent de 37 tests. Les tests Windows correspondants passent localement. Le [lot étendu de 41 tests sur GitHub](https://github.com/TRON-ABS/Novera/actions/runs/41281084320), commit `85558421`, réussit aussi : **39 réussis / 2 tests propres à Windows ignorés sur Ubuntu / 0 échec**. La CLI Linux du [run `41280300978`](https://github.com/TRON-ABS/Novera/actions/runs/41280300978), commit `410caea5`, réussit ses **deux tests Rust de politique et d’aide** ; son archive est téléchargée et vérifiée. Les trois CLI de ce run passent désormais chacune leurs deux tests Rust ; les trois archives sont téléchargées, leurs 21 empreintes et architectures vérifiées. Les autres migrations desktop restent suivies par leurs jobs réels.

Pour chaque nouvelle version, mettre à jour les notes de changements, ce guide si le cycle évolue, le suivi de validation et `PR.md`. Conserver le commit exact, les résultats exécutés et les limites connues ; ne pas reporter une réussite d’un ancien paquet sur une nouvelle compilation.

**TRON-ABS**

*The art of Human with AI*
