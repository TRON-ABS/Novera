# Novera — instructions du projet

## Direction finale : tout autour du tableau de bord — 29 octobre 2026

Objectif explicite pour les prochaines améliorations : **rendre toutes les fonctions accessibles dans le tableau de bord ou juste à côté, puis supprimer le panneau latéral permanent**. Cela inclut conversations et historique, recherche, projets, fichiers, modèles, configurations, téléchargements et outils. Préserver chaque possibilité pendant son déplacement ; ne pas supprimer un accès tant que son remplacement n’est pas disponible et validé.

Cette direction est un objectif futur, pas une autorisation de réorganisation immédiate. Avancer progressivement : une proposition concrète, la validation explicite du mainteneur, puis ce seul changement. Conserver la compacité, les 80 langues, l’accessibilité et l’adaptation aux tailles d’écran. Ne pas imposer dès maintenant une nouvelle maquette ou retirer le panneau latéral.

## Validation progressive du tableau de bord — règle du 29 octobre 2026

Dernière demande explicite : retirer **toutes** les icônes Téléchargements de l’en-tête et du panneau latéral, même dans Configurations. L’ancien masquage conditionnel ne suffit plus. Garder uniquement le déclencheur du tableau de bord et un gestionnaire de notifications sans interface à la racine de la fenêtre principale. Déplacer aussi **Nouvelle discussion** du panneau latéral vers une zone intégrée à gauche de la saisie, symétrique à Envoyer à droite, sans recouvrir le texte. Préserver l’action de nouvelle discussion normale et son raccourci clavier. Ces deux déplacements sont autorisés par cette demande précise, sans autre changement du tableau de bord.

Changement explicitement validé par la demande suivante : pendant la réponse du modèle, conserver le tableau de bord sans assombrissement et sans halo animé. Seul le bouton d’envoi change légèrement de teinte avec le petit carré Arrêter. Conserver les verrouillages des commandes indisponibles ; leur état désactivé ne doit plus atténuer visuellement l’ensemble du tableau de bord.

Changement explicitement demandé ensuite : supprimer le doublon Téléchargements en haut lorsque le raccourci du tableau de bord est présent. Conserver l’accès du haut sur les autres pages et le gestionnaire de notifications actif. Il s’agit uniquement de retirer cette icône dupliquée ; aucune autre réorganisation n’est autorisée par cette demande.

Le mainteneur demande désormais une progression **changement par changement** pour le tableau de bord. Présenter une proposition concrète, avec aperçu ou comparaison compréhensible, puis **attendre sa validation explicite avant de modifier le tableau de bord**. Ne pas regrouper plusieurs nouvelles évolutions sous une seule validation implicite et ne pas passer au changement suivant sans accord. Une proposition ou un objectif général ne vaut pas autorisation de toutes ses étapes. Cette règle concerne aussi les déplacements, dimensions, couleurs, icônes et nouvelles commandes.

Les ajustements expressément demandés avant cette règle sont consignés ci-dessous ; les travaux déjà préparés doivent rester identifiables et vérifiables. Une validation d’interface, une autorisation de fusion, une compilation et une publication de binaire restent des décisions distinctes.

## Préparation des distributions et compteur au démarrage — 29 octobre 2026

Le mainteneur demande de préparer Novera pour une future automatisation, **sans compilation multiplateforme pour le moment**, avec la version **portable Windows** incluse. Le [plan des distributions](docs/PREPARATION_DISTRIBUTIONS.md), son manifeste et le diagnostic de sources couvrent les onze variantes du lanceur. Ne pas activer Actions ou déclencher les anciens workflows sur la base de cette préparation. Les audits mobiles, runtimes par architecture, signatures et essais restent explicitement à terminer.

Le compteur de contexte doit être présent dès l’écran initial lorsqu’un modèle local est sélectionné : afficher un repère d’attente tant que la capacité réelle n’est pas connue, puis le pourcentage mesuré. Ne pas inventer de capacité ou de taux d’occupation. Le petit cercle du pourcentage est une jauge de contexte, pas une animation de téléchargement.

Dernier choix visuel du mainteneur : bouton d’envoi **bleu sombre**, mode Arrêter dans la même palette et **petit carré de 12 px**. Cette demande remplace les propositions rouge/rosé/violet de cet échange. Conserver sa zone réservée dans la saisie, les noms accessibles traduits et le fonctionnement d’arrêt.

La largeur maximale commune est désormais **1 024 px**, avec retour à la ligne sous cette limite. Dans la rangée basse : **Mémoire auto → Réglages → Téléchargements**. Le raccourci de téléchargement consulte le même état partagé, sans doubler les notifications de mise à jour. L’accès global aux téléchargements reste disponible ailleurs dans l’application. L’évolution générale « OVNI » est reportée à la demande du mainteneur ; ne pas l’inclure dans ce lot.

## Règles d’or et information utilisateur — 29 octobre 2026

Les [règles d’or détaillées de Novera](docs/REGLES_D_OR.md) constituent la référence durable pour l’ensemble du produit. Elles incluent explicitement **la qualité des informations fournies aux utilisateurs**, du premier démarrage à l’exécution complète : rôle des modèles et composants, local/cloud, réglages, automatismes, coûts éventuels, résultats, durées conservées, erreurs et solutions.

Toute nouvelle aide visible doit être disponible dans les 80 langues et rester lisible dans le tableau de bord adaptable. Le [guide utilisateur](docs/USER_GUIDE.md) décrit les usages concrets. Les règles distinguent exigences du produit, vérifications effectuées et limites encore à essayer ; les anciennes notes datées ci-dessous restent historiques. Pour le lot en cours, le mainteneur s’occupe de la compilation applicative.

## Téléchargement du Hub vers Documents — correction du 28 octobre 2026

La tentative Qwen3.5-2B Q6_K révélait une incohérence : la destination était bien `Documents/Novera models/Qwen3.5-2B-Q6_K/model.gguf`, mais le gestionnaire natif refusait encore toute sortie du dossier interne de données. Le téléchargement échouait avant l’écriture du modèle avec « outside of Jan data folder ».

Le gestionnaire accepte maintenant le stockage interne existant et, pour un téléchargement portant un identifiant de modèle valide, **le sous-dossier de ce modèle uniquement** sous `Documents/Novera models`. La génération du dossier et sa validation partagent la même règle de nommage. Modèle, projection, fichiers associés et temporaires suivent cette règle. Les chemins des autres modèles, les sorties du dossier autorisé et les jonctions Windows vers un emplacement extérieur restent refusés. Vérifier l’ensemble du lot avant les requêtes réseau ; utiliser la même validation pour le téléchargement et le nettoyage après annulation.

Validation : quatre tests natifs isolés et 17 tests du relais de téléchargement passent ; aucune violation d’architecture. Compilation Windows réussie, worker b11940 et empreintes vérifiés. [Application corrigée](deliverables/Novera-desktop-1.0.0-2026-10-28_04-25-37-548/Novera-Desktop.exe). SHA-256 : `2CF2B8ECAEE094592479A80C50AF30D055977E41C1CCE88CE61CE0A09E1D3479`. Preuves : `.build/download-model-storage/final-artifact.json`. Le parcours réel du Hub démarre Qwen3.5-2B Q6_K sans erreur de chemin ; vérification de fin en cours.


## Rangement des modèles et import automatique — 28 octobre 2026

Build courant : [Novera Windows local](deliverables/Novera-desktop-1.0.0-2026-10-28_03-08-27-045/).

Instruction confirmée : les **prochains téléchargements de modèles** doivent aller par défaut dans **Documents/Novera models/<modèle>/**, avec leurs fichiers associés. Les téléchargements GGUF et MLX utilisent le même emplacement ; les packs image, musique, vidéo et le pack complet gardent un sous-dossier par modèle. Une sélection explicite d’un autre disque reste possible dans le parcours des packs. Les anciens profils et les anciennes installations groupées conservent leurs chemins ; un import manuel conserve le fichier choisi à son emplacement.

État du poste du mainteneur :

| Modèle | Poids |
| --- | --- |
| LFM3 Q6_K | `C:/Users/jmsga/Documents/Novera models/LFM3-1.7B-Q6_K/LFM3-1.7B-Q6_K.gguf` |
| MiniLM embeddings | `C:/Users/jmsga/Documents/Novera models/all-MiniLM-L6-v2/model.gguf` |
| Tron et draft DSpark | **Ne pas déplacer** : `C:/Users/jmsga/Desktop/T/Convertir GGUF/` |

Les petits fichiers d’enregistrement `model.yml` restent dans le dossier de données Novera et pointent vers les poids réels. MiniLM conserve son identifiant et son rôle d’embeddings. Test réel après déplacement : LFM3 termine sa réponse à 32 K de contexte ; MiniLM produit un vecteur de 384 dimensions.

Les recommandations texte déjà présentes sont enregistrées automatiquement par référence après vérification du nom attendu, de la taille et du SHA-256. Chercher le dossier commun en priorité, puis le stockage géré et Téléchargements ; accepter le sous-dossier du modèle. Actualiser le catalogue au chargement du moteur, à l’ouverture de Modèles et au retour dans la fenêtre. Aucun téléchargement silencieux, aucune copie en double, aucun remplacement des paramètres existants ni réimport d’un modèle explicitement supprimé. Les fichiers incomplets ou modifiés ne sont pas importés automatiquement.


## LFM3 et moteur b11940 — état validé du 28 octobre 2026

La compilation locale **Windows x64** de Novera est terminée avec **llama.cpp b11940**, révision `eb7818c0b85c08ccb39ec2299548b85147c47495`, CPU et CUDA 13.4. Le worker du dossier livré annonce la bonne version ; ses empreintes correspondent aux sorties compilées.

**LFM3-1.7B Q6_K** est le choix conseillé dans **Configurations / Texte** et au premier démarrage desktop, **sans modèle draft**. Le fichier officiel de **1 427 638 304 octets** est vérifié par SHA-256, installé dans le dossier de modèles utilisé par Novera et sélectionné dans les réglages enregistrés. Les autres modèles et une sauvegarde des réglages précédents sont conservés. Qwen3 reste l’encodeur FLUX.2 ; le choix Android existant reste inchangé. Le pack complet contient **21 fichiers / 16 306 425 431 octets**, environ **16,31 Go**, hors marge et dépendances supplémentaires.

Test réel réussi : le moteur intégré charge le Q6_K sur la RTX 5070 Laptop avec **32 768 tokens de contexte** et termine une réponse de test en français. Le maximum annoncé par LiquidAI est de 256 K ; le défaut Novera reste 32 K selon la mémoire. Paramètres initiaux : température 0,1, top-k 50, pénalité de répétition 1,1.

L’option **NVFP4** propose le fichier source aux GPU NVIDIA compatibles détectés et actifs, avec le seuil conservateur de 4,5 Gio de VRAM. **Aucune instruction ni bouton de connexion à un serveur externe.** b11940 possède déjà le type NVFP4 et ses kernels ; le fichier Safetensors exige une conversion validée du dépôt complet en GGUF NVFP4 avant usage dans Novera. Cette conversion et l’inférence NVFP4 de ce modèle restent à vérifier. **Q6_K est directement utilisable.**

Tests ciblés, TypeScript, ESLint et architecture validés. Inventaire structurel : **80 locales × 1 770 clés** ; nouvelle aide NVFP4 français/anglais avec repli anglais ailleurs. Le test du worker ne valide pas l’ensemble de l’interface graphique, les autres plateformes ou la qualité générale du modèle. Aucun binaire publié ni validation CI.

Build : [dossier Windows local](deliverables/Novera-desktop-1.0.0-2026-10-28_02-16-25-120/). [Détails et preuves](docs/SUIVI_MOTEURS.md#lfm3-et-moteur-b11940--28-octobre-2026).


## Auto musical, aide et retour du partage — 28 octobre 2026

Le mainteneur demande qu'Auto reconnaisse un morceau collé sous forme de sections `[Intro]`, `[Verse]`, `[Chorus]`, etc., avec ou sans titre ou en-tête Paroles, sans imposer une formule de création. Séparer les paroles du style/accompagnement dans les paramètres du moteur, sans enregistrer le texte de cet échange dans les profils. Une demande explicite de rédaction, analyse ou traduction reste du texte ; le choix Texte explicite garde priorité.

Dans **Novera · Configurations / Musique**, afficher une courte aide générique sur style/voix, champ Paroles et balises ; ne pas y copier les paroles du mainteneur. Le libellé est traduit dans les 80 locales, base 1 769 clés.

Précision du mainteneur : le volet Windows finit par s'ouvrir avec délai, puis le problème apparaît lorsqu'il est refermé. Il s'agit du retour du partage, pas de l'arrêt de Novera. Fermer la fenêtre modale de préparation avant l'appel système, libérer le verrouillage des clics/focus, et restaurer la préparation seulement en cas d'erreur. Le fichier de cache est présent ; ne pas supprimer ce cache sans diagnostic. Aucun changement du parcours d'arrêt de l'application pour ce lot.

## Réactivité du partage Windows — 28 octobre 2026

Le mainteneur signale un nouveau blocage du partage système. La résolution WinRT du fichier ne doit jamais attendre de manière synchrone sur le thread de l'interface. Préparer le StorageFile sur un worker MTA, transmettre une référence inter-thread puis ouvrir la fenêtre de partage sur le thread propriétaire. Borner la préparation à 15 secondes ; un échec doit libérer les commandes de partage et laisser Copier le fichier/Fermer disponibles. Conserver l'envoi du fichier seul, sans automatiser le choix d'un destinataire. Toute validation par tests isolés doit rester distincte d'un essai de l'application recompilée.

## Chant musical par défaut — 28 octobre 2026

Le mainteneur demande **Instrumental désactivé par défaut** pour la musique : les nouvelles configurations et l'application des réglages recommandés autorisent le chant avec l'accompagnement. Le choix Instrumental reste disponible ; conserver les profils et préférences déjà enregistrés. Ce réglage ne fournit pas à lui seul des paroles prédéfinies.

## Messages envoyés — 28 octobre 2026

Les bulles utilisateur colorées utilisent désormais le style Novera : fond bleu nuit/indigo, cadre fin cyan/violet et texte clair ajusté au fond. Remplacer le rouge-orangé uniquement sur les messages envoyés ; conserver le choix de bulle neutre dans les préférences. Ce changement visuel reste local et nécessite une application recompilée.

## Partage système et fenêtre principale — 28 octobre 2026

Dernier ajustement du mainteneur : **retirer la vitesse de lecture ajustable en musique et en vidéo**. Les lecteurs Novera gardent la vitesse normale sans sélecteur ; les aperçus natifs de partage demandent aussi de masquer ce réglage lorsque leur webview le permet. Cette instruction remplace la commande de vitesse prévue dans la direction précédente.

Le mainteneur précise que le **partage système transmet le fichier seul** : aucune capture du lecteur, aucun cadre/en-tête Novera et aucun message dupliqué joint au fichier. L'aperçu de partage montre le média simplement, sans utiliser le visualiseur Novera ; ses commandes restent dans la conversation. Un rendu contenant un seul média sélectionne son original, même accompagné d'une légende. Un résultat texte seul propose TXT ; les exports riches de discussion restent un choix explicite. Les musiques MP3/WAV doivent être reconnues comme audio, y compris lorsqu'un fichier vient d'être créé ou que l'historique utilise une ancienne enveloppe de référence.

Au démarrage desktop, ouvrir la fenêtre principale **maximisée par le système**, redimensionnable et adaptée à la zone d'écran disponible ; réduire les minima à 640 × 480 pour éviter les anciennes contraintes 1024 × 740 sur petits écrans. Configurations Windows/Linux/macOS actualisées ; ne pas assimiler cela au plein écran exclusif ni à un essai réel de chaque système. Ces changements restent locaux, sans nouvelle compilation applicative ni publication.

## Direction confirmée — lecteurs et durée manuelle, 28 octobre 2026

Les lecteurs audio et vidéo doivent avoir des commandes **Novera**, à la place de la barre native grise : cadre fin cyan/violet, commandes tactiles et clavier, progression, temps, son et vitesse. Appliquer la même identité au visualiseur d'images avec zoom et agrandissement, aux conversations, pièces jointes et aperçus. Une seule lecture à la fois ; démarrer un autre média met le précédent en pause sans le rembobiner. Préparer ces contrôles pour Windows, Linux, Android, iOS et macOS via les API web et leurs replis, tout en distinguant préparation des sources et validation réelle sur chaque système.

La **saisie manuelle de durée doit pouvoir être vidée et retapée** : ne jamais rétablir 240 ou un autre préréglage pendant une saisie incomplète. Modifier la valeur désactive Auto et prime sur la durée du prompt. Le local ACE-Step accepte **10–600 secondes**, dont **360 s**, sans réduction silencieuse ; ce choix remplace l'ancienne limite produit 30–240 s. Les bornes propres aux fournisseurs restent visibles et appliquées à l'envoi. Défaut musical : **MP3 320 kb/s**, durée de secours 30 s ; conserver les formats explicitement choisis. Auto de durée ne concerne pas la longueur du contexte texte.

Les musiques enregistrées doivent rester lisibles après fermeture/redémarrage, comme les textes/images/vidéos. Conserver les références `novera-creation:music/…` dans l'historique ; ne pas les convertir en faux contenus base64. Corriger également les anciennes références enveloppées par erreur, sans supprimer les fichiers ni les messages. Les six nouveaux libellés des lecteurs sont présents dans les 80 locales, base 1 768 clés. [Usage et limites](docs/USER_GUIDE.md#lecteurs-novera-et-durée-manuelle--28-octobre-2026), [état et validations](TABLEAU_DE_BORD_NOVERA.md#lecteurs-novera-durée-libre-et-reprise-musicale--28-octobre-2026).

Ce lot reste local : aucune nouvelle demande de commit/push, de publication ou de compilation applicative. Les tests Rust isolés ne constituent pas un nouveau binaire Novera.

## Direction produit : automatisation avancée, simplicité mondiale

Novera prend en charge la complexité technique pour que chacun puisse discuter, créer et apprendre au même endroit. Concevoir les parcours autour de l’intention de l’utilisateur, avec des choix automatiques utiles, des explications compréhensibles dans les 80 locales et un accès direct aux réglages avancés.

- Automatiser les tâches déjà prises en charge : diagnostic matériel, sélection du moteur compatible, installation confirmée des configurations conseillées, vérification des fichiers, progression, mémoire des modèles et sauvegarde dans les bons dossiers système.
- La gestion mémoire est **Automatique par défaut** : attendre les travaux locaux actifs, préserver leurs modèles auxiliaires, décharger les modèles inutilisés puis charger le modèle demandé. Garder les fichiers, conversations, sélections et réglages ; recharger à la prochaine demande. Les appels cloud seuls ne nécessitent pas d’éviction locale.
- Le mode **Manuel** autorise des modèles texte/image/vidéo concurrents dans des discussions distinctes, selon les capacités réelles de RAM/VRAM. Ne pas interrompre une génération en cours lors d’un changement de préférence. Les nouvelles demandes utilisent la nouvelle préférence. Les moteurs média qui terminent leur processus libèrent naturellement leurs poids même en Manuel.
- L’optimisation ne supprime jamais les fichiers du mainteneur ou de l’utilisateur. Une attente ou un échec doit être explicite ; ne pas annoncer une libération réussie si le moteur refuse de se décharger.
- Garder les confirmations nécessaires pour les téléchargements, licences, coûts cloud et actions sensibles, en respectant les consentements existants. L’automatisation produit ne signifie pas autonomie sans limites ni validation universelle de tous les matériels/modèles.
- Distinguer fonctions effectivement présentes, validation des sources, essais matériels et objectifs futurs. Maintenir la vitrine et les références cohérentes ; rechercher le maximum de simplicité sans masquer les limites utiles à la décision.

Le produit est **Novera**, maintenu par TRON-ABS : https://github.com/TRON-ABS/Novera.
Contact officiel : [contact.novera.tronabs@gmail.com](mailto:contact.novera.tronabs@gmail.com).
Objectif : **Knowledge for everyone.**

## Points d’entrée

Lire [le tableau de bord](TABLEAU_DE_BORD_NOVERA.md) pour l’état actuel, [le guide de développement](docs/DEVELOPMENT.md) pour l’architecture et [la feuille de route](ROADMAP.md) pour le travail restant. Mettre à jour le document de référence concerné après un changement, avec sa date et ses validations réelles ; éviter les nouveaux journaux Markdown par tâche.

## Règles de travail

- Sources principales : `C:\msys64\home\jmsga\Novera`. Préserver modifications locales, modèles, conversations, profils et identifiants. Ne pas importer ni effacer automatiquement les profils Jan.
- Application : `Novera-Desktop.exe`, identifiant `io.github.tronabs.novera`. Nouvel état d’agent : `~/.novera`. Instructions prioritaires : `NOVERA.md`, repli configurable sur `AGENTS.md`.
- Tout texte visible ajouté **ou modifié** doit être traduit dans les **80 locales** dans la même modification. Actualiser l’inventaire et exécuter `python scripts/check-novera-locales.py` ; le repli anglais ne remplace pas une traduction. Actualiser les nombres de locales de façon ciblée, sans remplacement global des valeurs numériques ni modification des chiffres historiques.
- À chaque mise à jour du dépôt, contrôler et actualiser aussi sa **vitrine GitHub** : description « À propos » et site associé (réglages distincts du README), README anglais/français rendus, chiffres des langues/fournisseurs/catégories, liens et images, sujets et état des versions publiques. Aligner les affirmations sur les sources et validations réelles ; distinguer sources publiées, builds locaux et binaires publics. Vérifier le résultat en ligne après publication. Ne pas annoncer la synchronisation terminée si la vitrine reste périmée ; signaler précisément tout champ impossible à modifier. Ce contrôle ne déclenche ni compilation, ni publication de binaire, ni activation de GitHub Actions.
- Respecter les six domaines de `architecture/modules.json`. Utiliser les règles pures et les adaptateurs ; vérifier `yarn check:architecture` et `yarn test:architecture` après modification des frontières. La migration du code historique reste progressive.
- Les versions Android proviennent uniquement de `scripts/android/toolchain.json`, des scripts et modèles associés. Les fichiers générés et caches ne sont pas la source des réglages. Une compilation locale ne prouve ni une validation officielle de la combinaison ni le fonctionnement sur téléphone.
- Vérifier les sources officielles et dater les modifications de catalogues cloud. Voir [la maintenance des fournisseurs](docs/USER_GUIDE.md#cloud).
- Conserver licences, notices, auteurs et attributions ; un renommage ne transfère pas les droits. Préserver les interfaces de compatibilité et l’identité des services tiers selon [le guide](docs/DEVELOPMENT.md#compatibility).

## Autorisations et état courant

**Dernière instruction du mainteneur, 27 octobre 2026 : ne pas mettre à jour le dépôt pour le moment.** Les corrections de l’éditeur officiel des instructions, des aperçus d’images et de la configuration Texte/Image/Vidéo restent locales. Aucun chemin personnel ne doit être préconfiguré par défaut. Les poids vidéo ne sont pas téléchargés sans demande ou confirmation explicite. Aucun commit/push ni modification de vitrine sans nouvelle demande explicite ; cette pause remplace les autorisations de publication antérieures.

Derniers choix du 27 octobre : graines Image/Vidéo **aléatoires par défaut**, modes avancés conservés dans les deux sections, **21:9 par défaut**, vidéo **5 secondes par défaut** (remplace la demande initiale de 3 secondes). Garder le choix expérimental de **1 seconde à 1 heure**, à gauche du format sur le tableau de bord, et annoncer les limites réelles des assemblages longs. Aperçus vidéo adaptés à la fenêtre. Le bouton des conseils retrouve l’**icône à curseurs**, distincte du bouclier des autorisations. Direction confirmée : simple, facile, performant et utile, sans masquer les échecs ni promettre des expériences non validées.

Demandes supplémentaires du 27 octobre : ajouter **Musique entre Image et Vidéo**, avec recommandation au même ordre dans la page commune, réglages détaillés propres à chaque modèle, durée/qualité/graines accessibles au tableau de bord et graine aléatoire par défaut. Choix retenu : ACE-Step 1.5 Turbo 2B **Q4_K_M**, planificateur 1.7B Q8_0, encodeur Qwen3-Embedding 0.6B Q8_0 et VAE BF16, **4 543 113 728 octets de poids**, sans prétendre avoir validé la qualité sonore sur cette machine. Préserver les formats auxiliaires fiables, les licences et les chemins vides par défaut.

En haut de la page : **tout télécharger et configurer automatiquement** pour les quatre configurations conseillées, après affichage des fichiers, tailles, dossier, espace libre, marge et manque éventuel. Vérifier à nouveau le disque au démarrage ; permettre un autre dossier/disque. Utiliser LFM3 pour le texte et conserver Qwen3 comme encodeur image. Documenter dans les MD le budget actuel d’environ **16,31 Go** (composition exacte, inclusions/exclusions, dépendances et validations), pour pouvoir comparer à l’avenir des solutions aussi capables ou meilleures à volume égal ou inférieur. Cette demande ne lève pas la pause de publication et n’autorise pas un téléchargement silencieux des poids.

Référence exacte enregistrée dans [le suivi des moteurs](docs/SUIVI_MOTEURS.md#référence-texte-image-musique-vidéo--1488-go--27-octobre-2026) : **14 878 787 127 octets**, 20 fichiers uniques, plus 256 Mio de marge de stockage. Comparer les futures solutions sur ce même périmètre, avec leurs dépendances, qualité, capacités, temps et mémoire mesurés ; ne pas assimiler le budget du pack à celui de l'application entière.

Dernier ajustement du 27 octobre : **Auto par défaut** pour un nouveau contexte, sans écraser les choix manuels existants. Auto reste actif et allume la sortie effective Texte/Image/Musique/Vidéo ; le modèle correspondant apparaît dans le sélecteur compact à la volée. Reconnaissance multilingue des demandes, sans confondre bande originale et film. Musique : **30 à 240 secondes**, saisie à la seconde, raccourcis toutes les 30 secondes, 30 secondes par défaut. Une durée explicite prise en charge dans la demande prime sur le préréglage, sans modifier celui-ci. Sauvegarde dans le dossier système **Musique / Novera musique**. Le vocabulaire des 80 locales reste un recognizer déterministe à enrichir et relire, pas une certification de toutes les formulations.

Ajout demandé ensuite : retirer MiniMax des **choix musicaux** et proposer ElevenLabs, Stability AI, fal et Replicate avec leurs icônes ; préserver ses autres fonctions, profils et clés. Auto actif doit le rester après sélection ou installation d'un modèle. Traiter l'erreur locale VAE CUDA `device not ready` sans l'assimiler automatiquement à un manque de mémoire ; documenter les mesures et les limites. Ces demandes ne lèvent pas la pause de publication ou de compilation applicative.

Le **27 octobre 2026**, le mainteneur demande aussi l’application de la fenêtre commune, Nouveau projet sur dossier, choix initial des accès au dossier et au shell, toutes les langues déjà disponibles et préparation de l’interface vidéo. Le consentement au dossier ne vaut jamais accord implicite de modification/suppression ; le shell exige son propre premier choix. Le lot met à jour les sources, MD, dépôt et vitrine sans nouvelle compilation ni publication de binaire.

Le **27 octobre 2026**, le mainteneur demande de publier les dix nouvelles langues et de mettre à jour les Markdown, le dépôt et la vitrine. Les sources passent à 80 locales ; les essais Lara sans clé ne constituent pas six catalogues supplémentaires. Aucune compilation ni publication de binaire pour ce lot.

Le **26 octobre 2026**, le mainteneur demande la mise à jour des MD, du dépôt et de sa vitrine après le panneau compact, les consignes Texte/Image/Vidéo dans 70 langues, Réinitialiser, Auto amélioré et les tailles finales ×2/×4. La publication des sources et des documents est autorisée. Un build Windows a déjà été compilé et contrôlé localement pour ce lot ; cette synchronisation ne déclenche ni compilation supplémentaire, ni publication de binaire, ni activation des Actions.


Le **26 octobre 2026**, le mainteneur demande aussi la publication de l’installation conseillée, de la bibliothèque média, du moteur image embarqué et la mise à jour des MD et de la vitrine. Conserver Qwen3 GGUF CPU ; le Qwen NVFP4 a été explicitement annulé. Cette demande ne lance pas de compilation de Novera ni de publication de binaire.

Le mainteneur a demandé le **25 octobre 2026** que le dépôt reflète toutes les dernières sources et documentations. Les publications de sources sont autorisées ; exclure secrets, configuration locale, données utilisateur, exécutables/APK, caches et diagnostics bruts. Garder GitHub Actions désactivé.

Le mainteneur a demandé ensuite le **26 octobre 2026** de **mettre à jour le dépôt et sa vitrine avec les fournisseurs cloud et les nouvelles capacités**. Cette demande autorise la publication des sources et des documents, et remplace la pause de publication précédente. Elle ne déclenche aucune compilation supplémentaire de l’application, publication de binaire ou activation de GitHub Actions. Les tests de l’exécutable compilé par le mainteneur restent distincts des validations des sources.

Les compilations locales demandées les 23–25 octobre et le test synthétique Europe sont historiques et décrits dans [l’historique](docs/CHANGELOG.md). Une synchronisation de sources ou de documentation ne déclenche aucune nouvelle compilation, installation ni publication de binaire.

Les mises à jour automatiques restent désactivées avant validation de la chaîne signée Novera. Statistiques et suivi des erreurs sont indépendants et désactivés par défaut ; ne pas modifier les consentements du profil utilisateur pendant les tests. Le paramètre desktop explicite `-WithTelemetry` lit uniquement la configuration publique du fichier local ignoré `web-app/.env.local`, sans publier ses valeurs ni accorder de consentement. Android reste désactivé dans le lanceur.

Politiques conservées : [identité](BRANDING.md), [versions officielles et provenance](OFFICIAL_RELEASES.md), [contribution](CONTRIBUTING.md).

Compilation finale du rangement/import automatique réussie : `deliverables/Novera-desktop-1.0.0-2026-10-28_03-08-27-045/Novera-Desktop.exe`. SHA-256 : `C23A75AEA1616C0C01D86B1031E727A08E4D206BAAE2FBBD90CB9A8862F3AC7C`. Exécutable et moteur embarqué b11940 vérifiés ; manifeste d’empreintes présent. Les 40 tests supplémentaires du service de fournisseurs passent. L’interface graphique complète n’a pas été parcourue ; les tests de catalogue et de stockage, ainsi que les deux chargements réels depuis Documents, sont distincts de cette validation visuelle. Preuves : `.build/recommended-model-import/final-artifact.json` et journaux associés.
