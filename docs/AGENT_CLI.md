# CLI locale de Novera

Les anciens installateurs `install-jan-agent.sh` et `install-jan-agent.ps1`
ont été retirés : leur mode de téléchargement utilisait les distributions Jan
de `delta.jan.ai`, qui ne sont pas des publications Novera.

Le code de la CLI reste dans `src-tauri/novera-cli`. Pour une compilation locale
depuis la racine du dépôt :

```sh
cd src-tauri/novera-cli
cargo build --no-default-features --features cli --release
```

Le nom interne du binaire reste `jan` (`jan.exe` sous Windows). Le fichier de
configuration Cargo redirige la sortie vers `src-tauri/target/release/`.
Depuis la racine du dépôt, une fois la compilation effectuée :

```sh
./src-tauri/target/release/jan agent ui
```

Sous PowerShell, utiliser `./src-tauri/target/release/jan.exe agent ui`.
Le lanceur `novera-agent.sh` existant reste disponible pour les distributions
locales dont la CLI est déjà placée dans `src-tauri/resources/bin/`.

Aucun installateur Novera distant, téléchargement ou compilation n’a été validé
dans le cadre du nettoyage. Les noms techniques encore partagés avec le code
hérité restent conservés pour préserver le fonctionnement existant.
