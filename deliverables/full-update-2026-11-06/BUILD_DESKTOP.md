# Compilation Desktop Windows x64 — 6 novembre 2026

État : **terminé et assemblage vérifié**. Desktop Windows x64 compilée jusqu'au bout à la demande du mainteneur. Il ne s'agit ni d'un installateur NSIS/MSI ni d'une compilation CLI. La version applicative reste 1.0.0 ; cette préparation locale n'est pas une publication 1.0.1.

**Périmètre historique :** cette compilation précède la correction du repli des commandes du bas et l'ajout du vocal. Ces nouvelles sources sont suivies dans [le lot suivant](../composer-controls-voice-2026-11-06/VALIDATION.md) et seront compilées par le mainteneur ; elles ne sont pas incluses dans le binaire décrit ici.

## Blocage signalé et correction

Le lanceur s'arrêtait à l'étape `engine` : le verrou autonome `src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock` ne correspondait plus aux nouveaux manifests. L'option `--locked` refusait correctement de le modifier pendant la compilation.

- Mise en cohérence des verrous concernés avec les manifests courants ; conservation de `--offline --locked` dans le lanceur.
- Résolution minimale privilégiée pour conserver les versions déjà verrouillées ; alignement des dépendances transverses du moteur sur celles de l'application, notamment OpenSSL 0.10.82 et openssl-sys 0.9.118. La résolution hors ligne avait initialement sélectionné des versions antérieures ; ces sélections ont été rectifiées.
- Retrait des métadonnées SemVer des exigences `serde_yaml`, `toml`, `toml_edit` et `ash` : les numéros réels restent pris en charge, les suffixes qui déclenchaient les avertissements Cargo ne sont plus utilisés dans les exigences.
- Contrôle `cargo metadata --locked --offline --filter-platform x86_64-pc-windows-msvc` : **six verrous validés, inchangés pendant le contrôle** (application, CLI, worker Android, moteur llama.cpp, RAG et support portable). Cela vérifie la résolution ; cela ne compile pas les six cibles.
- Script de préparation du moteur : **24 assertions réussies**.

## Exécution suivie

Commande : `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/distribution/build-novera-local.ps1 -WithTelemetry`, variante `desktop`, Windows x64.

La configuration des diagnostics reprend celle de la commande du mainteneur. Elle n'accorde pas de consentement aux utilisateurs et ne remplace pas l'installation personnelle existante.

Journal de la compilation réussie : `.build/launcher-desktop-2026-11-06_18-24-34-617/`. Toutes les étapes du lanceur ont réussi : préparation du moteur d'image, source/toolchain/moteur llama.cpp, assemblage du moteur, contrôle de version, extensions, interface et exécutable Desktop. Code de sortie du lanceur : **0**.

- Moteur C/C++ et worker : compilation `release` réussie en **24 min 58 s**, incluant les 147 unités CUDA et les variantes CPU.
- Architecture CUDA conservée : `75-real;80-virtual;86-real;89-real;90-virtual;120a-real;121a-real`, toolchain CUDA 13.5. Cette compilation ne constitue pas un essai matériel de chaque architecture.
- Interface web compilée en **7,40 s** ; cartes de sources privées préparées localement, sans téléversement.
- Desktop Rust compilée en **8 min 03 s**, avec avertissements non bloquants.

## Assemblage et contrôles finaux

Dossier : `deliverables/Novera-desktop-1.0.0-2026-11-06_18-24-34-617/` ; point d'entrée `Novera-Desktop.exe`.

Le verrou du moteur a été définitivement aligné pendant la compilation initiale. Pour contrôler aussi cet état final, le worker a été recompilé avec `--offline --locked`, en réutilisant par le mécanisme existant `JAN_LLAMA_PREBUILT_DIR` les bibliothèques C/C++ de cette compilation locale. Leur provenance et leurs empreintes sont conservées dans `.build/launcher-engine-prebuilt-v0.9.0-2026-11-06/PROVENANCE.json`. Le worker final a été assemblé dans le dossier Desktop ; les empreintes ont ensuite été régénérées et vérifiées.

- Recompilation finale du worker : **réussie en 9,00 s** ; préparation, assemblage et contrôle de version réussis. Le cache du lanceur enregistre le verrou final et les empreintes des ressources.
- Exécutable principal : **PE Windows x64**, SHA-256 `60030f82e095b2d249144767afdc20f04c7c5434195d0fdcf395c68799fbaa94`.
- **92 fichiers vérifiés** contre `SHA256SUMS`, y compris l'exécutable, le worker, les bibliothèques et auxiliaires. Aucun `.pdb` ni `.map` privé dans le runtime.
- Worker du dossier assemblé : **llama.cpp v0.9.0, build 12110, commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`**.
- Exécution de `--list-devices` depuis le dossier final : contrôle de la version liée réussi, chargement des backends **CPU et CUDA** depuis les ressources distribuées, détection de la **NVIDIA GeForce RTX 5070 Laptop GPU** (8 123 Mio annoncés).
- Preuve consolidée : [desktop-build-validation.json](desktop-build-validation.json). Résolution des dépendances : [cargo-locked-validation.json](cargo-locked-validation.json).

Limites : pas d'inférence de modèle ni d'essai interactif de l'interface native pendant ce contrôle. L'application personnelle n'a pas été lancée ni remplacée. Aucun autre système/architecture, installateur ou parcours de mise à jour 1.0.0 → 1.0.1 n'est validé par cette compilation. La migration complète suivie dans SUIVI.md reste en cours.

Contrôle complémentaire : `scripts/tests/build-launcher.Tests.ps1` s'arrête sur une attente Android ancienne (« Android unexpectedly ready before source review »), car le diagnostic renvoie désormais prêt. Aucun APK n'a été lancé par ce test. Ce résultat n'est pas présenté comme une réussite des contrôles du lanceur ; la compilation Desktop réelle reste le contrôle déterminant de ce lot.

Les journaux de réparation et de contrôle final sont conservés localement sous `.tmp/launcher-lock-fix/`. Le reçu du lanceur, actualisé après assemblage du worker final, est `.build/launcher-desktop-2026-11-06_18-24-34-617/result.json`. Aucune CI, approbation, fusion ou publication n'est revendiquée.
