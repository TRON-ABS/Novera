# Contrôle UI et canal de production — 1er novembre 2026

Contrôles distants effectués à **23 h 23 puis 23 h 38, heure de Paris, le 1er novembre**. **Le canal de production n'est pas validé et aucune publication n'a été effectuée.** Le défaut est reproduit sur l'ancien candidat Windows. La correction est ensuite observée le 2 novembre dans un build Windows local et dans une vraie AppImage Linux signée ; les limites de ces preuves sont précisées ci-dessous.

## Canal réellement observé

Les requêtes GET anonymes sur les deux endpoints officiels renvoient HTTP 404 :

- `https://github.com/TRON-ABS/Novera/releases/latest/download/latest.json`
- `https://github.com/TRON-ABS/Novera/releases/latest/download/latest-cli.json`

L'API GitHub authentifiée confirme un unique brouillon de préversion `430498139`, avec 15 assets. Son tag observé est `untagged-124cb6a611096302cd22` ; il ne constitue pas la release stable `v1.0.0` visée par les manifests locaux. Aucun feed public ni aucune release stable ne sont disponibles. Le HEAD local et `main` distant correspondent à `814dd82f6b10e556e16bc24e80d8f0b426d2de51` au contrôle ; aucune PR n'est ouverte. Les manifests préparés localement ne prouvent pas la disponibilité de leurs URL publiques.

La preuve horodatée est conservée dans `.build/update-ui-2026-11-01/production-channel.json`. Les credentials restent hors de la preuve et ne sont pas transmis aux endpoints publics.

## Défaut trouvé et correction locale

Avant correction, `TauriUpdaterService.check()` convertissait toute erreur de feed en `null`. Le hook `useAppUpdater` faisait de même. Le bouton des paramètres affichait donc « aucune mise à jour disponible » en cas d'échec réseau ou HTTP, au lieu de son message d'erreur existant.

Le service propage maintenant l'erreur originale. Le hook réinitialise et synchronise l'offre périmée ; il propage l'erreur pour un contrôle manuel, et conserve le comportement silencieux du contrôle automatique. Les paramètres peuvent afficher le message d'erreur traduit puis permettre une nouvelle tentative. Aucun endpoint ni mécanisme cryptographique n'est changé.

Validation locale Windows :

```powershell
node node_modules/vitest/vitest.mjs run --project @janhq/web-app web-app/src/hooks/__tests__/useAppUpdater.test.ts web-app/src/services/updater/__tests__/tauri.test.ts web-app/src/routes/settings/__tests__/general.test.tsx
node --test scripts/distribution/__tests__/ci-check-updater.test.mjs scripts/distribution/__tests__/record-upgrade-check.test.mjs scripts/__tests__/novera-update.test.mjs
git diff --check
```

Résultats : **42 tests Vitest et 17 contrats Node réussis**, aucun échec ; vérification du diff réussie. Les régressions couvrent la propagation de l'erreur du service, le nettoyage et la synchronisation d'une ancienne offre, la distinction manuel/automatique, le message dans les paramètres et la nouvelle tentative. Le rapport Vitest est `.build/update-ui-2026-11-01/vitest-windows.json`. Ces tests utilisent des doubles de services ; ils ne prouvent pas une installation depuis l'interface native.

ESLint réussit sur les deux fichiers de production modifiés (`useAppUpdater.ts`, `services/updater/tauri.ts`), sans erreur. La configuration ignore les trois fichiers de test, ce que le lint signale par trois avertissements ; leur validation est celle de Vitest.

## Contrôle de l'application Windows

Le candidat signé pour l'updater, préparé depuis `bbe679d3`, a été lancé dans `.build/update-ui-2026-11-01/windows-profile`, avec `JAN_DATA_ROOT` et les répertoires de profil redirigés. Il atteint visuellement l'écran français « ÉTAPE 1 DE 4 / Novera doit être configuré sur votre système ». Le journal confirme un dossier de données sous ce profil isolé. Ce candidat existant n'embarque pas la correction source ci-dessus.

Le mainteneur a ensuite explicitement autorisé la première configuration isolée. Le clic « Commençons » a été effectué : le candidat atteint l'étape 2, détecte le backend CUDA et affiche les deux GPU. Un avertissement « Impossible de vérifier le modèle d'embedding » était présent ; le journal signalait `Documents directory unavailable` dans le profil synthétique. Le lanceur prépare désormais les dossiers Documents/Downloads/Desktop. Après redémarrage, le téléchargement automatique de `Qwen3-Embedding-0.6B-Q8_0` dans le dossier Documents isolé s'effectue et l'interface affiche sa vérification réussie.

Le bouton « Continuer » atteint l'étape 3 « Suivi des erreurs », avec « Le suivi des erreurs n'est pas configuré. Aucun rapport n'est envoyé. ». Le mainteneur effectue lui-même le choix de confidentialité ; l'étape 4 est ensuite observée. Le lien « Parcourez d'autres modèles dans le Hub » ouvre bien le Hub. Aucun modèle de conversation n'est téléchargé depuis cet écran.

Pour préparer le contrôle des réglages, un vrai modèle local de validation `Qwen3.5-0.8B-Q8_0.gguf` et sa configuration sont copiés dans le profil isolé, sans nouveau téléchargement de modèle de conversation. Les 833 592 096 octets source/copie ont le même SHA-256 `37ae482d336108d23516fa35e8e0c4126688d81018b87178a18d752a1357814f`. Cette préparation ne certifie pas le parcours d'import normal depuis le Hub. Le candidat est redémarré et affiche le tableau de bord avec `Qwen-validation` sélectionné. La fermeture normale conservait le processus en arrière-plan ; le redémarrage a arrêté uniquement le PID du candidat identifié par son chemin exact.

Le parcours **Configurations → Général → Vérifier les mises à jour** est réellement exercé. Le bouton affiche « Vérification des mises à jour... », puis redevient disponible. À 23 h 38, le toast capturé affiche **« Vous utilisez la dernière version »**, alors que le journal du même contrôle confirme `Could not fetch a valid release JSON from the remote` sur l'endpoint officiel. Le contrôle HTTP distant immédiatement suivant confirme HTTP 404. Le défaut est donc reproduit dans l'application native, pas seulement déduit du code. Aucune offre, aucun téléchargement de mise à jour et aucune installation ne sont observés.

Les preuves locales sont `windows-manual-check-result.json` (arbre UI avec le toast), `windows-updater-log.txt` (journal filtré), `existing-model-staged.json` (copie du modèle) et `production-channel.json`, dans `.build/update-ui-2026-11-01/`. Le candidat conserve le code `bbe679d3` : **la correction source locale n'est pas validée dans ce binaire**.

## Ce qui reste à prouver

- Windows : vérifier le nouveau candidat signé et son message d'erreur dans l'interface ; le build local corrigé a déjà passé ce parcours. Exercer ensuite offre/téléchargement/vérification/installation/redémarrage avec conservation du profil.
- Linux : le parcours d'erreur du feed passe désormais dans la vraie AppImage signée sous Xvfb. L'offre, le téléchargement et l'installation depuis un feed de production restent à exercer ; les preuves de remplacement natif antérieures restent celles du run `41334675673`.
- Production : satisfaire les conditions de publication, puis contrôler un feed HTTPS public complet, les URL et signatures des paquets et une transition entre deux versions. Les 404 actuels ne valent ni absence normale d'une version plus récente, ni validation du canal.
- macOS/iOS : les accès et identités Apple réels restent nécessaires pour la signature/notarisation macOS et la distribution iOS sur appareil ; les validations UI et de canal restent également distinctes.

## Reconstruction corrective Windows/Linux

La correction est proposée dans la [PR brouillon #5](https://github.com/TRON-ABS/Novera/pull/5), branche `codex/updater-feed-error`. Le commit `428299c34d66170f543722ea98a11de6e3e50979` est soumis au [run 41358869680](https://github.com/TRON-ABS/Novera/actions/runs/41358869680). Le job source et le job Linux réussissent ; les candidats Windows x64 et ARM64 sont encore en reconstruction à ce bilan. Le premier run `41358745246` a été remplacé pendant sa préparation pour intégrer les paramètres WebDriver et les gardes du banc Linux.

Le workflow manuel dispose d'une cible `windows-linux`. Les compilations desktop signées exécutent d'abord les 42 contrats frontend de l'updater et conservent leur résultat JSON. Les contrôles locaux supplémentaires passent : 57 contrats Node, dix tests Python, validation de syntaxe Python, actionlint et contrôle du diff.

Après compilation et vérification de signature, le job Linux exerce le vrai bouton dans l'AppImage sous Xvfb, via le [WebDriver externe documenté par Tauri](https://v2.tauri.app/develop/tests/webdriver/manual-setup/). Le banc refuse les postes locaux et les runners auto-hébergés. Il utilise un profil vierge et ouvre directement Général ; il ne valide donc pas l'onboarding ou l'installation de modèles. Il ne simule pas le service updater et n'installe aucune mise à jour.

### Linux signé : preuve reçue et contrôlée le 2 novembre

Le [job Linux 125004829064](https://github.com/TRON-ABS/Novera/actions/runs/41358869680/job/125004829064) réussit. L'artefact `13105425728` est téléchargé ; son digest GitHub `f280de09c36135b77d0a121626717610e64e2da7ac0d146be9d31d530fbd4dc4` et ses **15 empreintes de fichiers** sont recontrôlés. La vérification cryptographique indépendante de l'AppImage finale réussit avec la clé Novera épinglée. SHA-256 du paquet : `01f92f603037827fa8af4054d316f57add583f2801e5e0b66bd5a4621d3fb3ef`.

Les reçus attestent **42 contrats frontend et neuf migrations réussis**. La capture inspectée et le reçu natif montrent le vrai message **« Failed to check for updates »** sur le feed HTTP 404 ; le faux message de dernière version est absent. `nativeUiCheckPassed` vaut `true`, `updateInstalled` et `productionChannelValidated` valent `false`. La preuve vérifie le bouton sur le paquet livré, pas seulement le hook simulé.

Les fichiers sont conservés sous `.build/release-prepared/rebuild-428299c3/linux-x64/`, notamment `LINUX-UPDATER-UI.png`, `LINUX-UPDATER-UI.json` et `UPDATER-READINESS.json`. Le résultat indépendant est `.build/update-ui-2026-11-01/13105425728-verified.json`.

### Windows local : message corrigé et nouvelle tentative observés

Un frontend en mode production (`NOVERA_ENABLE_UPDATER=true`) est compilé, puis embarqué dans un binaire Rust **debug** local, depuis la branche corrective au commit documentaire `48f9df8033b8f737a6e3016780fb6c692bbc8844`. Les dépendances runtime viennent du candidat préparé `bbe679d3` ; ce montage demeure un banc local, pas un paquet signé de distribution. Le SHA-256 du binaire est `df7de65b2960c7a1231208642196a9f3821035e79eec3ed726a161316e944b1c`.

Avec le même profil isolé et le modèle `Qwen-validation`, le vrai parcours Configurations → Général → Vérifier les mises à jour affiche désormais **« Échec de la vérification des mises à jour »**. Le bouton redevient disponible et une nouvelle tentative reproduit l'erreur explicite. Le journal confirme le refus du feed et la remontée de l'erreur jusqu'aux paramètres ; l'origine observée est `http://tauri.localhost/`, avec le nouveau bundle `index-Bet3Z24Z.js`. Le contrôle automatique échoue silencieusement comme prévu, tandis que le contrôle manuel affiche l'erreur.

Preuves : `.build/update-ui-2026-11-01/local-native-build.json`, `fixed-windows-native-ui.json` et `fixed-windows-updater-log.txt`. Le paquet Windows signé doit encore être contrôlé séparément.

À **00 h 24 (Paris), le 2 novembre**, les deux endpoints publics restent en HTTP 404 et le brouillon `430498139` conserve ses 15 assets. La branche principale n'a pas changé et la PR #5 reste ouverte en brouillon. Une reprise automatique de ce chat, `terminer-les-contr-les-windows-novera`, vérifie toutes les dix minutes les nouveaux résultats Windows, récupère les paquets et poursuit les contrôles autorisés ; elle doit rester silencieuse sans évolution exploitable et se mettre en pause quand ces contrôles sont terminés. Le premier build Windows x64 signé précédent avait duré un peu plus de trois heures ; les nouveaux jobs continuent sans être interrompus. Les entrées macOS de la matrice actuelle ne compilent pas : la sélection `windows-linux` n'active que les trois variantes Windows/Linux.

Le [bilan général](VALIDATION_RESULTS_2026-11-01.md) et les [conditions de lancement](LAUNCH_STATUS.md) restent applicables. La correction est intégrée au nouveau candidat Linux vérifié, mais elle n'est pas fusionnée ou diffusée. Les réussites ci-dessus ne valent pas validation du canal de production ni installation depuis l'interface.
