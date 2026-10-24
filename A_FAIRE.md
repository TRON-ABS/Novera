# Novera — à faire

Dernière mise à jour : **24 octobre 2026**.

Ce fichier suit les travaux à prévoir. Le [tableau de bord principal](TABLEAU_DE_BORD_NOVERA.md) centralise l’état du projet et les fichiers essentiels. Une tâche inscrite ici n’autorise pas automatiquement sa compilation, sa publication ou son déploiement.

## Version Android — APK

**Statut : chaîne récente intégrée, APK debug ARM64 assemblées localement ; essais sur téléphone à faire.** JDK 27.0.1.0.3, SDK 37.2, NDK r30, Gradle 9.8.1, AGP 9.4.0 et Kotlin 2.4.21 sont épinglés dans les scripts. Le lanceur conserve Android désactivé et les audits restent ouverts. Voir [préparation Android](docs/ANDROID_PREPARATION.md) et [chaîne de compilation](docs/ANDROID_TOOLCHAIN.md). Aucune date de disponibilité publique annoncée.

### Base déjà présente

- [Configuration Android Novera](src-tauri/tauri.android.conf.json).
- Projet Gradle généré et réglages reproductibles via [configure-project.mjs](scripts/android/configure-project.mjs), avec modèles et copies locales des plugins Android.
- Fonctionnalité Rust `mobile` dans [Cargo.toml](src-tauri/Cargo.toml).
- Commande `build:android` dans [package.json](package.json).

La compilation et les contrôles du paquet sont validés localement ; le fonctionnement sur appareil réel reste à établir.

### Étapes à réaliser

- [ ] Auditer la cible mobile existante, les plugins Tauri et les dépendances incompatibles avec Android.
- [x] Préparer et documenter l’environnement Android : JDK, SDK, NDK et cible Rust ARM64.
- [x] Intégrer les versions testées, les options Kotlin modernes et l’alignement du plugin exporté par buildSrc.
- [x] Assembler des APK debug ARM64 et contrôler manifeste, bibliothèques, signature et alignement 16 Kio.
- [x] Ajouter un diagnostic sans installation et un point d’entrée APK désactivé avec vérification des blocages.
- [ ] Adapter l’interface React au tactile, au clavier mobile, aux petits écrans et à la navigation retour.
- [ ] Vérifier l’arrivée initiale : détection de langue, nouveau choix manuel sauvegardé, traductions et écriture droite à gauche.
- [ ] Adapter les permissions, l’accès aux fichiers et le téléchargement des modèles au stockage Android.
- [ ] Vérifier la sauvegarde des réglages et conversations, les mises à niveau et la reprise après passage en arrière-plan.
- [ ] Définir quelles fonctions de bureau restent disponibles, doivent être adaptées ou doivent être désactivées sur mobile (outils système, processus externes, MCP et agents).
- [ ] Valider les connexions aux modèles distants et la gestion des secrets sur Android.
- [ ] Étudier puis adapter l’inférence locale pour ARM64 : moteur, chargement des GGUF et compatibilité des fonctions.
- [ ] Mesurer la mémoire, le contexte utilisable, la vitesse, la chauffe et la consommation sur plusieurs téléphones réels.
- [ ] Définir les appareils et versions Android pris en charge à partir des résultats. Le minimum indiqué dans la configuration actuelle reste à valider.
- [ ] Vérifier installation des APK de test, démarrage, téléchargements et conversations sur appareil réel.
- [ ] Préparer la signature et la conservation des clés, une procédure de construction reproductible et les empreintes des livrables.
- [ ] Décider du canal de distribution : APK directement installable et/ou AAB pour Google Play ; documenter les prérequis du canal choisi.
- [ ] Autoriser séparément une publication lorsque les contrôles et limites sont documentés.

### Critères avant distribution

- Installation et démarrage validés sur les appareils annoncés.
- Dernier choix de langue de l’utilisateur conservé après redémarrage.
- Réglages et conversations préservés après relance et mise à niveau.
- Téléchargement et utilisation des modèles vérifiés pour les modes annoncés.
- Fonctionnalités absentes et limites matérielles clairement indiquées ; ne pas promettre toutes les fonctions Windows sans validation.
- APK signée, version et empreinte enregistrées, procédure de distribution approuvée.

### Validation de l’IA locale

La disponibilité d’une APK ne signifie pas automatiquement que l’IA locale est prête. Choisir les modèles et contextes mobiles après mesures. Le préréglage desktop LFM2.5 Q6_K et son contexte de 32 768 tokens ne doivent pas être imposés à tous les téléphones sans vérifier leur capacité.

## Architecture modulaire — poursuivre progressivement

Référence : [architecture réalisée et limites](docs/ARCHITECTURE.md).

- [x] Sauvegarder le dossier local 1.0.0 avant restructuration et vérifier les empreintes.
- [x] Définir les six responsabilités et leurs chemins dans `architecture/modules.json`.
- [x] Extraire les règles de langue, conversations/contexte, images d’outils et métadonnées moteur ; conserver les points d’entrée compatibles.
- [x] Séparer la lecture de locale native, l’adaptateur de statistiques UI et le contrôle des flux de distribution.
- [x] Ajouter un contrôle des frontières avec des régressions, vérifier les types et les tests web.
- [ ] Retirer progressivement les accès aux réglages UI encore présents dans ModelFactory en passant par des contrats explicites.
- [ ] Extraire des contrôleurs de conversation et d’outils depuis le transport et les grandes routes, avec tests d’intégration.
- [ ] Clarifier la composition des services Windows/Linux/Android sans modifier leurs comportements par défaut.
- [ ] Étendre les règles strictes aux parties migrées ; ne pas présenter les couches historiques comme entièrement découplées.
- [ ] Auditer les dépendances avant tout retrait ; aucune réduction de poids ou de consommation n’est encore mesurée.
- [x] Compiler le nouveau binaire local sur demande : restructuration incluse, démarrage isolé validé le 24 octobre 2026.

## Distribution Windows portable — 24 octobre 2026

- [x] Adapter localement notre contribution #9302 à Novera : packager, licences, inventaire, empreintes et tests PowerShell.
- [x] Préparer la CI manuelle Novera avec autorisation explicite : accès en lecture, sans secrets ni publication ; Actions reste désactivé.
- [x] Créer et vérifier un ZIP du build existant, puis démarrer sa copie extraite dans un profil isolé.
- [x] Recompiler les dernières sources : langue système et commandes de discussion incluses dans le build local du 24 octobre 2026.
- [ ] Valider extraction, prérequis, interface et génération CPU/GPU sur PC propre.
- [ ] Autoriser puis exécuter la CI manuelle pour valider le parcours sur runner réel.
- [ ] Préparer séparément signature, version officielle et distribution publique ; aucune release créée par ce travail.

Référence : [Windows portable](docs/windows-portable.md).
