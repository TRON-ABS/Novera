# Novera — feuille de route

Mise à jour du **25 octobre 2026**. Cette liste centralise les tâches ; elle n’annonce aucune date de sortie. L’état des sources et du dernier binaire est dans [le tableau de bord](TABLEAU_DE_BORD_NOVERA.md).

## Priorité : valider les sources actuelles en fonctionnement

- [ ] Sur nouvelle demande de compilation, construire un candidat avec les 36 catalogues complets, les nouveaux noms internes et les options DSpark/consentement du premier démarrage.
- [ ] Vérifier une vraie première installation : langue, refus mémorisé, consentements indépendants, absence de destination et téléchargement facultatif de DSpark.
- [ ] Mesurer la vitesse, RAM/VRAM et longueur de contexte avec et sans DSpark sur le matériel annoncé ; aucun gain garanti.
- [ ] Vérifier la liaison complète du shim et une mise à niveau réelle de l’ancien worker vers `novera-llama-worker`, avec restauration sur échec.
- [ ] Vérifier génération CPU/GPU, sauvegarde native, impression/PDF et navigation ; préserver les données existantes.
- [ ] Vérifier le transport d’une erreur depuis le WebView sur profil isolé, après accord de test explicite ; fixer rétention et traitement des IP côté service.
- [ ] Faire relire les traductions par des locuteurs natifs, notamment les ajouts assistés par traduction automatique et les variantes éditoriales jin/min nan/hakka/algérien/marocain encore fondées en partie sur une terminologie écrite commune. La couverture des clés est complète, la revue linguistique reste ouverte.
- [ ] Examiner séparément la correction Linux historique #9346 et tester sur Linux.

## Version Android — APK

**Statut : chaîne récente intégrée, APK debug ARM64 assemblées localement ; essais sur téléphone à faire.** JDK 27.0.1.0.3, SDK 37.2, NDK r30, Gradle 9.8.1, AGP 9.4.0 et Kotlin 2.4.21 sont épinglés dans les scripts. Le lanceur conserve Android désactivé et les audits restent ouverts. Voir [la chaîne Android et ses garde-fous](docs/BUILD_AND_RELEASE.md#android). Aucune date de disponibilité publique annoncée.

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

Référence : [architecture réalisée et limites](docs/DEVELOPMENT.md#architecture).

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
- [x] Compiler les commandes de discussion et la langue système dans le build historique du 24 octobre 2026.
- [ ] Valider extraction, prérequis, interface et génération CPU/GPU sur PC propre.
- [ ] Autoriser puis exécuter la CI manuelle pour valider le parcours sur runner réel.
- [ ] Préparer séparément signature, version officielle et distribution publique ; aucune release créée par ce travail.

Référence : [Windows portable](docs/BUILD_AND_RELEASE.md#portable).

## Distribution officielle et droits

- [ ] Définir le périmètre des plateformes réellement prises en charge et les prérequis mesurés.
- [ ] Préparer la première chaîne signée Novera : installation, mise à niveau et rejet d’une signature invalide. Distinguer signature Tauri et Authenticode.
- [ ] Faire approuver le candidat et le brouillon complet avant publication binaire ; conserver les notices et empreintes. GitHub Actions reste désactivé jusqu’à décision explicite.
- [ ] Compléter l’inventaire des composants livrés et le registre de provenance avant tout projet de licence propriétaire ou déclaration d’indépendance complète ; [politique](OFFICIAL_RELEASES.md#provenance).

## Direction du projet

Rendre les fournisseurs et capacités de modèles plus faciles à faire évoluer par des contrats explicites. Explorer outils, agents et multimodalité dans un cadre expérimental, avec validation avant promotion. Améliorer l’accessibilité, les petits matériels et les connexions limitées ; évaluer les usages éducatifs avec enseignants et apprenants avant toute promesse de disponibilité scolaire.

La feuille de route historique des 100 langues est conservée dans [le document des langues](docs/LANGUAGES.md#roadmap-100). Les nouvelles langues demandent une vérification des contributions existantes et une intégration complète.
