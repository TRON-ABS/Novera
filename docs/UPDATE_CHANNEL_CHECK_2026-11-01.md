# Contrôle UI et canal de production — 1er novembre 2026

Contrôles distants effectués à **23 h 23 puis 23 h 38, heure de Paris**. **Le canal de production n'est pas validé et aucune publication n'a été effectuée.** Le contrôle manuel est désormais reproduit dans l'interface Windows ; il confirme le faux message de dernière version sur le candidat existant.

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

- Windows : reconstruire un candidat contenant la correction et vérifier son message d'erreur dans l'interface ; exercer ensuite offre/téléchargement/vérification/installation/redémarrage avec conservation du profil. Le parcours du bouton sur l'ancien candidat et son défaut sont désormais reproduits.
- Linux : aucun hôte Linux interactif n'est disponible dans cette session ; WSL n'est pas installé. Les preuves natives antérieures restent celles du run `41334675673`. Aucun nouveau parcours UI Linux n'a été exécuté ici. Il faut un hôte Linux isolé avec affichage pour l'AppImage.
- Production : satisfaire les conditions de publication, puis contrôler un feed HTTPS public complet, les URL et signatures des paquets et une transition entre deux versions. Les 404 actuels ne valent ni absence normale d'une version plus récente, ni validation du canal.
- macOS/iOS : les accès et identités Apple réels restent nécessaires pour la signature/notarisation macOS et la distribution iOS sur appareil ; les validations UI et de canal restent également distinctes.

Le [bilan général](VALIDATION_RESULTS_2026-11-01.md) et les [conditions de lancement](LAUNCH_STATUS.md) restent applicables. La correction source est locale ; elle n'est ni compilée dans les paquets existants, ni validée en CI, ni fusionnée ou diffusée.
