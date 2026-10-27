# Novera — feuille de route

## Panneau compact et consignes — 26 octobre 2026

- [x] Panneau compact coloré, états ON/OFF et menus directs de dimensions et d’agrandissement ×2/×4 avec taille finale.
- [x] Éditeur limité aux consignes Texte/Image/Vidéo, sauvegarde indépendante des paramètres du modèle et remise à zéro.
- [x] 240 consignes par défaut dans les 80 locales, personnalisations préservées et 1 738 clés par catalogue.
- [x] Régressions Auto françaises/anglaises et contrôle du nouveau panneau dans un build Windows local.
- [ ] Recueillir les nouveaux exemples réels d’échec Auto ; poursuivre les essais de génération du mainteneur et la relecture linguistique native.


## Direction : automatiser la complexité, garder des choix simples

Rendre les capacités avancées utiles au quotidien pour des utilisateurs de langues, niveaux techniques et matériels différents. Les automatismes déjà présents couvrent le diagnostic du Hub, le moteur Windows intégré, les configurations média conseillées, les téléchargements vérifiés, les bibliothèques par catégorie et la sauvegarde système. La gestion de RAM/VRAM ajoute un choix Automatique recommandé et un choix Manuel pour les machines capables de travailler en parallèle.

- [x] Sources : transitions mémoire texte/image/vidéo dans les deux sens, file d’attente, protection des tâches et modèles auxiliaires, conservation des fichiers/conversations.
- [x] Sources : mode Manuel sans éviction et workers média concurrents, explications dans les 70 locales et paramètres mémorisés.
- [ ] Tester le parcours complet après compilation, dont trois modèles lourds en parallèle sur matériel dimensionné et erreurs de mémoire réelles.
- [ ] Étendre progressivement les estimations de coût mémoire, le placement et les conseils avec des mesures par matériel ; conserver les réglages experts et les limites explicites.
- [ ] Relire les nouvelles traductions nativement et améliorer l’accessibilité au fil des essais utilisateurs.

Ces objectifs concernent le produit Novera ; ils ne déclenchent ni compilation, ni tâche planifiée externe, ni publication de binaire.

## Installation média et moteur embarqué — 26 octobre 2026

- [x] Sources : installation FLUX explicitement confirmée, choix de dossier système/personnalisé, reprise, vérification, progression persistante sans audio/notification système.
- [x] Sources : bibliothèque Image/Vidéo dans la page llama.cpp, import automatique et manuel, édition, retrait avec conservation des fichiers, sélection par discussion.
- [x] Préparation Windows : moteur CUDA 13.4.3 et replis Vulkan/CPU, empaquetage automatique et sonde CUDA réelle.
- [ ] Tester le parcours complet dans la prochaine compilation du mainteneur, sur petits fichiers puis le trio réel avec droits/licences nécessaires.
- [ ] Valider une image avec le nouveau C++ CUDA embarqué ; conserver les essais Vulkan et NVFP4 PyTorch séparés.
- [ ] Essayer le repli sur de vraies cartes Maxwell/Pascal/Volta et relire les nouvelles traductions avec des locuteurs natifs.

Mise à jour du **26 octobre 2026**. Cette liste centralise les tâches ; elle n’annonce aucune date de sortie. L’état des sources et du dernier binaire est dans [le tableau de bord](TABLEAU_DE_BORD_NOVERA.md).


## Ambition : aider et contribuer dans tous les secteurs

Au-delà de l’école, développer avec les utilisateurs et les professionnels des usages utiles à la recherche, la santé, l’accompagnement social, l’agriculture, l’environnement, l’énergie, l’industrie, l’artisanat, les entreprises, les services publics, le droit, l’informatique, la cybersécurité, la robotique, la création, les langues, les transports, le sport, l’action humanitaire et la vie quotidienne. La liste est ouverte ; elle décrit une direction de contribution mondiale, pas un catalogue d’usages déjà validés.

- [ ] Co-construire les usages avec les personnes concernées et les spécialistes de chaque domaine et contexte local.
- [ ] Réduire les étapes de configuration, améliorer les conseils matériels et rendre les exigences cloud/coût compréhensibles.
- [ ] Améliorer l’accessibilité, les traductions relues nativement, les guides et les parcours adaptés aux débutants.
- [ ] Intégrer les avancées IA utiles après vérification des modèles, moteurs, licences, API et limites réelles.

Les capacités livrées dans les sources restent décrites dans le tableau de bord ; ces objectifs ne déclenchent ni entraînement spécialisé ni publication binaire.


## NVFP4 natif et conseils — 26 octobre 2026

- [x] Tester un chemin FP4 CUDA natif pour FLUX.2 Klein 4B Comfy, avec encodeur GGUF et VAE Safetensors.
- [x] Séparer le placement de l’encodeur et du générateur dans les moteurs à composants ; conserver les durées sous images/vidéos.
- [x] Ajouter les conseils NVFP4 conditionnés au GPU et les repères GGUF Q6_K/Q4_K_M pour texte/image/vidéo, dans les 70 langues.
- [x] Vérifier le trio conseillé GGUF dans le binaire compilé par le mainteneur : image 512² affichée, enregistrée et durée totale 25,5 s, après correction des réglages moteur/exécutable, le 26 octobre.
- [ ] Valider séparément les parcours graphiques NVFP4, cloud et vidéo ainsi que les dossiers système redirigés et les autres matériels.
- [ ] Étendre après validation les architectures, 9B, édition native et vidéo NVFP4 ; mesurer les performances sur plusieurs matériels.

[État vérifié](docs/SUIVI_MOTEURS.md#nvfp4-cuda-natif-placement-et-durées--26-octobre-2026).


## Création cloud — état des sources du 26 octobre 2026

- [x] Préparer le catalogue documenté, 14 profils supplémentaires et icônes officielles, avec filtres de modalité et choix séparés par sortie dans la discussion.
- [x] Implémenter les adaptateurs HTTP de génération et la sauvegarde système sans identifiant dans les fichiers ; traduire les nouveaux contrôles dans les 70 locales.
- [ ] Valider les adaptateurs avec des comptes autorisés, quotas et crédits réels, y compris annulation et restrictions régionales ; les tests actuels sont simulés.
- [ ] Compiler uniquement sur nouvelle demande du mainteneur, puis vérifier l’interface et la sauvegarde native dans un nouvel exécutable.
- [ ] Ajouter paramètres cloud avancés, entrées multiples, montage vidéo et autres déploiements régionaux après vérification des contrats.

## Priorité : valider les sources actuelles en fonctionnement

- [x] Construire un candidat local avec les 70 catalogues, les noms internes et les options DSpark/consentement : terminé le 26 octobre après correction de la préparation du worker et des DLL CUDA x64. Les essais fonctionnels ci-dessous restent ouverts.
- [ ] Vérifier une vraie première installation : langue, refus mémorisé, consentements indépendants, absence de destination et téléchargement facultatif de DSpark.
- [ ] Mesurer la vitesse, RAM/VRAM et longueur de contexte avec et sans DSpark sur le matériel annoncé ; aucun gain garanti.
- [ ] Vérifier la liaison complète du shim et une mise à niveau réelle de l’ancien worker vers `novera-llama-worker`, avec restauration sur échec.
- [ ] Vérifier génération CPU/GPU, sauvegarde native, impression/PDF et navigation ; préserver les données existantes.
- [ ] Vérifier le transport d’une erreur depuis le WebView sur profil isolé, après accord de test explicite ; fixer rétention et traitement des IP côté service.
- [ ] Faire relire les traductions par des locuteurs natifs, notamment les ajouts assistés par traduction automatique et les variantes éditoriales jin/min nan/hakka/algérien/marocain/xiang/dari/saïdi/saraiki encore fondées en partie sur une terminologie écrite commune. La couverture des clés est complète, la revue linguistique reste ouverte.
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

**80 locales sources couvrent désormais les 1 738 clés** ; la relecture native reste ouverte. Les six essais Lara sans clé ne sont pas six catalogues supplémentaires.

La feuille de route historique des 100 langues est conservée dans [le document des langues](docs/LANGUAGES.md#roadmap-100). Les nouvelles langues demandent une vérification des contributions existantes et une intégration complète.

## Créations dans la discussion — sources locales du 26 octobre 2026

- [x] Unifier Auto/Texte/Image/Vidéo dans le compositeur, avec réglages et progression.
- [x] Ajouter un adaptateur Diffusers hors réseau, CPU/CUDA, modèle local complet et arrêt limité au job.
- [x] Sauvegarder via les dossiers système Images/Novera image et Vidéos/Novera vidéo, avec paramètres et références persistantes dans le fil.
- [x] Préparer variantes image et animation image-à-vidéo avec modèles conditionnés adaptés ; valider de petites fixtures réelles CPU/CUDA.
- [x] Ajouter les contrôles, aides et erreurs aux 70 locales (1 620 clés chacune), vérifier types et régressions.
- [ ] Vérifier le parcours graphique et les dossiers personnels redirigés dans un nouvel exécutable, lorsque le mainteneur demandera sa compilation.
- [ ] Valider des modèles représentatifs de grande taille, mémoire disponible et matériels supplémentaires ; ne pas extrapoler les fixtures.
- [ ] Intégrer la gestion de dossiers Diffusers complets au Hub et affiner le diagnostic matériel par pipeline.
- [ ] Ajouter montage et variantes de vidéos existantes, autres modalités et reconnaissance d’intention au-delà du français/anglais.

**Pas de compilation de l’application, de commit, push ou mise à jour de la vitrine pour ce lot**, selon la dernière demande du mainteneur.

## Images GGUF et encodeur GGUF

- [x] Ajouter l’adaptateur natif stable-diffusion.cpp, les fichiers distincts diffusion/encodeur/VAE et le diagnostic de rôle dans 70 locales.
- [x] Préparer les binaires officiels CPU/Vulkan avec contrôle SHA-256 ; vérifier l’énumération GPU et le rejet de poids invalides.
- [ ] Obtenir un vrai GGUF de diffusion FLUX.2 Klein compatible et valider génération CPU/GPU, retouche et arrêt dans le nouvel exécutable après demande de compilation.
- [x] Corriger le format NVFP4 ComfyUI reconnu par un cache de compatibilité non destructif ; générations réelles réussies sur CPU et Vulkan avec l’encodeur « uncensored » GGUF. Ce chemin ne fournit pas l’accélération NVFP4 matérielle native.
- [ ] Définir un empaquetage redistribuable et une acquisition explicite de runtime avec licences et intégrité ; aucun binaire local ignoré n’est livré automatiquement.

### Validation restante du correctif mixte

- [x] Préparer automatiquement les composants NVFP4 reconnus, conserver les originaux et la quantification de l’encodeur GGUF, traduire les aides dans les 70 locales.
- [x] Décoder et vérifier les PNG réels CPU/Vulkan, contrôler la préparation sans CUDA et le cache avec tests de référence.
- [ ] Compiler sur demande puis valider sélection des fichiers, préparation/cache, génération, Stop et rechargement de discussion dans un nouvel exécutable Novera.
- [ ] Étendre les essais à d’autres modèles, architectures et matériels. Le succès d’un mélange ne valide pas toutes les quantifications.
- [ ] Étudier séparément un chemin NVFP4 matériel natif pour les GPU et noyaux compatibles ; ne pas confondre prise en charge d’un fichier et exécution native FP4.
