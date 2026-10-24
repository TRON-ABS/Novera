# Préparation de la future APK Novera

État du **24 octobre 2026** : **la nouvelle chaîne Android est intégrée aux scripts du projet et des APK debug ARM64 ont été assemblées localement**. L'installation et l'inférence sur téléphone ne sont pas encore validées. Android reste désactivé dans le BAT ; seule Novera-Desktop est activée.

## Versions de référence

| Élément | Version intégrée |
| --- | --- |
| JDK | 27.0.1.0.3 |
| SDK / Target SDK / minimum SDK | 37.2 / 37 / 24 |
| Build-Tools | 37.0.0 |
| NDK | r30 LTS — 30.0.16248370 |
| Gradle / AGP | 9.8.1 / 9.4.0 |
| Kotlin Android | 2.4.21 |
| Rust / ABI initiale | 1.98.0 / arm64-v8a |

Les versions, prérequis, commandes et adaptations sont décrits dans [ANDROID_TOOLCHAIN.md](ANDROID_TOOLCHAIN.md). La source unique des versions est [toolchain.json](../scripts/android/toolchain.json). La combinaison Gradle/AGP est plus récente que la plage entièrement validée par JetBrains pour Kotlin 2.4.21 : sa validation ici est locale et expérimentale.

## Ce qui est intégré

- Sélection Rust mobile explicite : `--no-default-features --features mobile` ; dépendances desktop isolées.
- Versions appliquées au projet Gradle, au wrapper et à buildSrc ; contrôle de la version Kotlin réellement chargée, pour éviter qu'une dépendance transitive active encore Kotlin 2.2.10.
- Options `compilerOptions` typées et lancement par ExecOperations. Les modules Android Tauri sont adaptés dans des copies locales générées ; le cache Cargo reste intact.
- Hook de settings résistant aux fichiers régénérés par Cargo et tests de relance sans doublons.
- Moteur CPU ARM64 séparé, cache CMake distinct par NDK, recherche correcte du module CPU dans lib ou bin, contrôle ELF 16 Kio et notices.
- Racine privée des données et de la base vectorielle ; prise en charge des URI Android `content://` pour les documents sélectionnés.
- Modèle d'accueil Android LFM2.5-1.2B-Instruct Q4_K_M, contexte initial de 4 096 jetons ; un modèle chargé et cache de slots désactivé.
- Manifeste sans sauvegarde Android automatique, partage limité aux exports privés et identifiant debug séparé.
- Libellé du Hub « Adapté à mon matériel » traduit dans les 36 langues. Toute évolution visible doit conserver les traductions dans toutes les langues prises en charge.

Les secrets sont chiffrés avec une clé aléatoire stockée dans le dossier privé ; une intégration au Keystore matériel reste à étudier. La sélection de dossier n'est pas encore disponible dans l'adaptateur mobile.

## Validations obtenues

Les essais SDK, JDK, NDK et Kotlin ont produit des APK debug ARM64. Le moteur et la bibliothèque Android ont été reconstruits avec le NDK r30. Le contenu natif, les dépendances, l'alignement ELF/ZIP à 16 Kio, le manifeste et la signature debug ont été vérifiés. Kotlin 2.4.21 est confirmé dans le plugin chargé, les tâches et la bibliothèque standard résolue.

Les scripts maintenus appliquent maintenant ces choix au projet principal. Les tests couvrent les versions racine/buildSrc, les cibles JVM conservées, la préservation du cache Cargo, l'idempotence et la reprise des chemins de plugins après régénération. Les détails et preuves locales sont indiqués dans [ANDROID_TOOLCHAIN.md](ANDROID_TOOLCHAIN.md).

Ces validations ne remplacent pas les essais sur téléphone. Aucun débit, gain de mémoire ou niveau de chauffe n'est annoncé. L'exécutable Windows et les profils existants sont préservés.

## Commandes et blocages conservés

```powershell
yarn prepare:android
yarn check:android
yarn test:android
yarn build:android:engine
```

Le diagnostic est aussi accessible par `Compiler-Novera.bat /android-check`. Il ne compile pas et n'installe pas l'application. Les trois audits de [readiness.json](../scripts/android/readiness.json) restent ouverts : dépendances, permissions et stockage. Les nouvelles versions et les adaptations écrites ne valent pas validation finale de ces audits.

`yarn build:android` et `yarn build:android:apk` utilisent le point d'entrée gardé, avec un mode debug explicite. Le parcours automatisé complet reste bloqué et n'a pas été validé de bout en bout ; les assemblages de validation utilisent les étapes séparées documentées. Les mises à jour automatiques et les envois de statistiques non configurés restent désactivés ; l'accord explicite de l'utilisateur reste requis pour de futurs envois.

## Étapes restantes

1. Achever les audits mobiles, en particulier les capacités réellement disponibles, le stockage, les exports et les secrets.
2. Valider sur téléphone ARM64 installation, démarrage, WebView, clavier, retour système, langue, reprise et conservation des conversations.
3. Télécharger un petit modèle et vérifier chargement, génération CPU, mémoire, chauffe et consommation ; déterminer les appareils et contextes pris en charge à partir des mesures.
4. Valider le point d'entrée complet, les reprises après échec et la construction depuis un environnement propre.
5. Préparer séparément signature de production, version, empreintes et distribution APK/AAB. Aucune release publique ou CI distante n'a été créée.

Le suivi des critères fonctionnels reste dans [A_FAIRE.md](../A_FAIRE.md).
