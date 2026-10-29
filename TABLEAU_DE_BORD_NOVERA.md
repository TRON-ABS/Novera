# Novera — tableau de bord

## Navigation et modèles intégrés — sources du 29 octobre 2026

Les sources intègrent Recherche/Nouveau projet à gauche de la saisie et Modèles/Configuration à droite, avec des fenêtres Novera au-dessus du tableau de bord et un sélecteur de modèle compact unique. Les paramètres du modèle suivent le même parcours. Les anneaux sont verts au repos, jaune/rouge pendant la réponse ; les réponses du modèle ont leur propre cadre. Les infobulles et unités de durée couvrent les **80 langues / 2 402 clés**. Le lanceur local passe à **8 tâches Cargo**.

Validation locale de publication : **449 tests ciblés dans 15 fichiers**, TypeScript, contrôles de sources/architecture, catalogues et traitement CSS réussis ; **7 tests des règles d’architecture** passent également. Les changements de sources sont sur `codex/dashboard-navigation-and-model-selector`, depuis `main` après PR #3. Aucun nouveau binaire, compilation applicative, validation CI, fusion supplémentaire ni contrôle visuel compilé n’est annoncé. Le mainteneur compile et vérifie le rendu. Voir [PR.md](PR.md).

## Stockage commun et catalogue automatique — 28 octobre 2026

Build courant : [Novera Windows local](deliverables/Novera-desktop-1.0.0-2026-10-28_03-08-27-045/).

LFM3 et MiniLM sont rangés dans leurs sous-dossiers de **Documents/Novera models** ; leurs enregistrements sont corrigés. Tests réels réussis : réponse LFM3 à 32 K et embeddings MiniLM de 384 dimensions. **Tron et son draft DSpark restent sur le Bureau, sans déplacement.**

Les prochains téléchargements GGUF/MLX et les packs conseillés utilisent un sous-dossier par modèle. Les fichiers recommandés déjà présents et vérifiés sont importés automatiquement par référence ; la liste Modèles se rafraîchit à l’ouverture, au retour dans la fenêtre et après l’enregistrement du moteur. Pas de téléchargement silencieux, de copie en double ni de réimport des suppressions explicites. Les anciennes installations gardent leurs chemins. [Détails](docs/SUIVI_MOTEURS.md#rangement-des-modèles-et-import-automatique--28-octobre-2026).

## LFM3 et compilation b11940 — 28 octobre 2026

**Compilation Windows x64 terminée** avec llama.cpp **b11940**, CPU et CUDA 13.4. **LFM3-1.7B Q6_K installé et sélectionné sans draft**, dans le dossier de données de Novera. Le worker intégré charge le modèle sur la RTX 5070 Laptop à **32 K tokens** et produit une réponse terminée.

L’option NVFP4 apparaît sur le matériel NVIDIA compatible détecté ; sa conversion en GGUF et son inférence restent à valider. Aucune instruction ni bouton de connexion à un serveur externe. Qwen3 reste l’encodeur image ; le pack complet passe à **21 fichiers / environ 16,31 Go**.

Tests ciblés, TypeScript, ESLint, architecture et structure des **80 × 1 770 clés** validés. L’interface graphique complète reste à vérifier. Build local disponible, sans publication de binaire ni validation CI. [Détails et preuves](docs/SUIVI_MOTEURS.md#lfm3-et-moteur-b11940--28-octobre-2026).


## Paroles structurées dans Auto et retour du partage — 28 octobre 2026

Auto reconnaît désormais une fiche de chanson commençant par un titre/en-tête Paroles ou directement par `[Intro]`, suivie d'autres sections et de lignes chantées. Le texte musical est séparé des paroles avant l'envoi local ou aux fournisseurs vocaux pris en charge ; le BPM de la description est utilisé si aucun BPM manuel n'est fixé. Les profils ne sont pas modifiés. Les demandes de rédaction/analyse/traduction et le mode Texte explicite restent textuels. Une aide générique avec cinq balises apparaît dans la configuration musicale, sans paroles de cet échange, traduite dans les **80 locales**.

Retour du partage Windows : la préparation du fichier dans le cache est confirmée. Le mainteneur précise que le volet finit par s'ouvrir, puis que le blocage apparaît après sa fermeture. La fenêtre modale Novera est maintenant démontée avant le passage au système ; ses verrous de clics/focus sont retirés. En cas d'erreur native, la préparation est restaurée pour réessayer/copier. Aucun cache utilisateur effacé ni parcours de fermeture d'application modifié.

Validation : **379 tests / huit fichiers**, dont routage, transport, paramètres locaux/cloud, retour/échec du partage, configuration et catalogues ; TypeScript et ESLint ciblé réussis ; zéro violation d'architecture et sept tests d'architecture ; **80 × 1 769 clés**, sans erreur structurelle. Un petit diagnostic Windows isolé a été compilé, ouvert sur un fichier fictif, puis fermé ; son appel natif est revenu, sans envoi à un destinataire. Le retour du volet dans une application Novera recompilée reste à vérifier ; aucun nouveau binaire Novera ni publication produit pour ce lot.

## Blocage du partage système Windows — correction locale du 28 octobre 2026

Le chemin natif appelait `GetFileFromPathAsync(...).join()` sur le thread principal avant `ShowShareUIForWindow`. Cette attente peut empêcher le traitement des messages nécessaires à WinRT. La résolution est déplacée sur un worker initialisé MTA, avec transmission via `AgileReference<IStorageItem>` et ouverture du panneau maintenue sur le thread propriétaire. La préparation est bornée à 15 s ; si elle échoue, aucune ouverture tardive n'est programmée par ce worker. Chemins Windows longs, UNC et Unicode préservés.

Les **83 tests web de partage / six fichiers** et les **sept tests natifs isolés** passent, y compris la libération des commandes après une erreur native. Les appels WinRT réels vérifient de vrais fichiers TXT/PNG/MP3/MP4 et leur référence après sortie du worker ; les erreurs de fichier absent et chemins UNC/Unicode sont couvertes. Architecture : zéro violation. Pas de nouveau binaire Novera ni envoi à un destinataire ; l'essai de la fenêtre complète après recompilation reste nécessaire.

## Partage des originaux et démarrage maximisé — 28 octobre 2026

Les captures du mainteneur montraient le cadre Novera dans l'aperçu de partage et un MP3 étiqueté Image. L'aperçu affiche maintenant le média brut, sans en-tête/cadre Novera. Les entrées audio de l'historique sont incluses dans le partage ; le repli pour un fichier nouvellement créé distingue PNG/JPEG/WebP, MP4/WebM et MP3/WAV. Un rendu avec un seul média propose **Original**, sans sa légende ni une page HTML du lecteur. Le partage natif reçoit une référence au fichier ou ses octets, avec un texte d'accompagnement vide. Le texte seul propose TXT ; les exports riches/conversations sont conservés. Un export HTML délibéré utilise correctement une balise audio pour la musique.

Fenêtre desktop : `maximized: true`, redimensionnement conservé, minima 640 × 480 dans les configurations Windows/Linux/macOS. Le système choisit la zone maximisée ; le contenu conserve ses dispositions adaptatives existantes.

Validation : **87 tests / sept fichiers** avec contrats Windows activés, TypeScript et ESLint ciblé réussis ; architecture sans violation et sept tests ; trois configurations JSON contrôlées. Les tests vérifient la charge transmise au service système, sans envoi à un destinataire ni ouverture réelle de la fenêtre de partage. Démarrage et partage dans un nouveau binaire encore à vérifier après compilation. Pas de nouveau binaire, commit/push ou publication.

## Lecteurs Novera, durée libre et reprise musicale — 28 octobre 2026

Sources locales : commandes audio/vidéo Novera communes, visualiseur d'images avec zoom, affichage responsive, cibles tactiles 44 px, contrôles clavier et réduction des animations. Intégration aux créations, messages, aperçus de pièces jointes, espace de travail et aperçu de partage. Plein écran standard, repli vidéo Safari et agrandissement interne si nécessaire. Une nouvelle lecture met les autres en pause. La compatibilité des codecs et les essais matériels restent distincts de ces contrôles communs.

Durée manuelle : effacer **240**, taper **360**, puis quitter le champ conserve **360 s** et désactive Auto. La génération locale accepte **10–600 s**, la valeur est transmise sans troncature ; une valeur hors plage est signalée puis refusée à l'envoi. Les paramètres recommandés utilisent MP3 320 kb/s. [Bornes des fournisseurs](docs/USER_GUIDE.md#lecteurs-novera-et-durée-manuelle--28-octobre-2026).

Reprise musicale : le chargement de l'historique ajoutait à tort `data:audio/…;base64,` devant la référence du fichier musical. Le lien est maintenant conservé ; les anciens enregistrements enveloppés peuvent être réparés à la lecture. Tests MP3/WAV sur trois cycles JSON de sauvegarde/rechargement, sans modification des fichiers audio.

Validation : **410 tests web / 16 fichiers**, **19 tests Rust isolés**, TypeScript et ESLint ciblé réussis ; sept tests d'architecture et zéro violation ; **80 locales × 1 768 clés**, sans erreur structurelle. Les API Safari et les limites musicales ont été vérifiées dans leurs documentations officielles. L'aperçu dans le navigateur Windows n'a pas pu être contrôlé : la fenêtre ciblée reste minimisée et inaccessible à l'outil. Pas de certification Windows/Linux/Android/iOS/macOS, d'essai réel de génération de 360 s, de nouveau binaire Novera ou de publication pour ce lot.

## Musique cloud et essai réel du VAE — 27 octobre 2026

Sources : quatre choix musicaux cloud avec icônes (**ElevenLabs, Stability AI, fal, Replicate**), MiniMax écarté de cette liste musicale, ACE-Step local conservé par défaut. Le sélecteur et l'application d'un profil préservent Auto actif. Catalogue : **42 profils, 49 présélections média** ; sauvegarde audio locale après génération cloud, contrats testés sans dépenses réelles.

Correctif VAE CUDA : tuiles 256 / recouvrement 32, reprise CPU unique pour l'erreur VAE « device not ready » en placement Auto. Essais CLI réels réussis sur RTX 5070 Laptop : **30 s produites en 13,6128333 s**, **180 s en 24,8571114 s**, WAV 48 kHz stéréo 24 bits ; tailles vérifiées **8 640 044 / 51 840 044 octets**. Écoute et nouvelle application graphique non validées. [Référence et mesures](docs/SUIVI_MOTEURS.md#musique-cloud-et-vae-cuda--candidat-du-27-octobre-2026).

**172 tests web / 13 fichiers, 19 tests Rust isolés**, TypeScript, architecture et 80 × 1 762 clés sans erreur. Sources locales ; aucun nouveau binaire Novera, commit/push ou changement de vitrine.

## Auto multilingue et durée musicale — correction locale du 27 octobre 2026

Auto reste le choix initial des nouveaux contextes et allume aussi le bouton de la sortie effective, avec son modèle dans le sélecteur compact. Le brouillon met l'aperçu à jour ; pendant la génération, l'indicateur suit le travail envoyé. Une bande originale pour un film est routée vers Musique ; une durée explicite de trois minutes envoie 180 secondes. Le modèle texte suit celui de la discussion. Vocabulaire de commandes couvrant les 80 locales, exemples musicaux et sorties explicites traduites testés ; variantes et formulations libres restent à enrichir, sans certification linguistique.

Musique : **30–240 secondes**, réglage à la seconde et raccourcis toutes les 30 secondes, défaut 30 s. Validation frontend/native cohérente ; sortie **Musique / Novera musique**, WAV ou MP3. Vidéo inchangée : plage expérimentale 1 s–1 h et défaut 5 s.

Validation des dernières versions de chaque fichier : **390 tests web dans 14 fichiers**, **17 tests Rust isolés**, TypeScript sans émission, sept tests d'architecture, zéro violation et **80 × 1 762 clés** sans erreur structurelle. Reproduction du routage du long texte fourni par le mainteneur, sans lancer de génération musicale. Aucun nouveau build applicatif, commit/push ni changement de vitrine.

## Musique et budget des quatre configurations — sources locales du 27 octobre 2026

Musique est ajouté entre Image et Vidéo : ACE-Step 1.5 Turbo 2B Q4_K_M et compagnons, profils séparés, graine aléatoire, durée/qualité au tableau de bord, 30 s et WAV 24 bits par défaut. La page commune ordonne Texte, Image, Musique, Vidéo avec leurs explications et un téléchargement global confirmé : espace libre, besoin restant et marge contrôlés avant lancement ; dépendance d'export vidéo vérifiée.

Référence documentée : **14 878 787 127 octets, soit 14,88 Go**, pour 20 fichiers uniques, Qwen texte/image mutualisé. [Composition, exclusions, versions et critères d'amélioration](docs/SUIVI_MOTEURS.md#référence-texte-image-musique-vidéo--1488-go--27-octobre-2026). Objectif futur : mêmes capacités ou meilleures à volume égal ou inférieur, avec qualité et performances mesurées.

Validation locale : **154 tests web réussis**, un scénario non-Windows ignoré, **17 tests Rust isolés**, TypeScript, sept tests d'architecture, zéro violation et **80 × 1 762 clés**. CLI musicales inspectées ; aucun poids musical téléchargé ni génération/écoute complète validée. Contrôle dans une application recompilée encore nécessaire. **Aucun nouveau binaire, commit/push ni changement de vitrine.**

## Progression vidéo fidèle aux phases — correction locale du 27 octobre 2026

L’affichage passe de **Chargement** à **Création en cours · … %** dès le calcul, puis à **Finalisation de la vidéo** avant la création terminée. Les pourcentages de transfert des poids en mémoire ne sont plus confondus avec les étapes de génération. Suivi cumulatif des clips et des étapes Diffusers ; 100 % seulement après publication locale du MP4. Essai réel du worker avec progression reçue avant sa sortie ; 43 tests web ciblés, 17 tests Python, types et **80 × 1 746 clés** sans erreur. Aucun nouveau binaire Novera ni publication ; contrôle visuel dans l’application recompilée restant à faire. [Guide](docs/USER_GUIDE.md#progression-vidéo--correction-locale-du-27-octobre-2026).

## Configuration unique et vidéo Q4 — correction locale du 27 octobre 2026

Une page depuis le bouton **à curseurs de réglage** regroupe **Texte, Image et Vidéo**, avec conseils automatiques, installation confirmée et Parcourir. L’icône retrouve son aspect précédent pour se distinguer du bouclier des autorisations. Banques Image/Vidéo indépendantes, chemins de modèles vides par défaut, aucun chemin personnel livré. Les nouvelles créations ne montrent plus leur ligne de modèle ; les anciens pieds natifs isolés sont masqués sans réécrire l’historique.

Pack vidéo : **Wan2.1 T2V 1.3B Q4_K_M + UMT5-XXL Q4_K_M + VAE**, **4 891 677 270 octets**, désormais trouvé installé et vérifié prêt dans le profil du mainteneur. Correction de l’échec après calcul : sortie AVI réelle du moteur transcodée en **MP4 H.264**. **5 secondes par défaut**, durée expérimentale **1 seconde à 1 heure à gauche du format**, **21:9 par défaut pour Image et Vidéo**, graines **aléatoires par défaut** avec quatre modes et réutilisation. Aperçu vidéo adapté à la fenêtre et lecteur agrandi. Les longues vidéos sont des assemblages avec raccords possibles ; une heure n’a pas été générée. Image vers vidéo et NVFP4 vidéo non activés pour ce profil.

**145 tests web / 13 fichiers**, **15 tests Python**, **13 tests natifs isolés**, types, sept tests d’architecture et **80 × 1 745 clés** sans erreur. Essai réel du nouveau worker : vidéo MP4 de **5,00 s, 512 × 224, 80 images à 16 FPS**, calcul et export en **124,8 s** sur cette machine. Aucun nouveau binaire Novera ; parcours visuel dans l’application recompilée à contrôler. Aucun commit/push ni changement de vitrine. [Guide](docs/USER_GUIDE.md#configuration-conseillée--texte-image-et-vidéo--sources-locales-du-27-octobre-2026).

## Correction locale : instructions et taille des images — 27 octobre 2026

Configuration → Assistants explique les trois catégories du seul assistant Novera et renvoie au carnet **Novera · Gérer les instructions**, seul éditeur officiel. L’ancien formulaire du profil intégré renvoie également au guide. Les aperçus de créations utilisent la largeur disponible et une hauteur adaptée à la fenêtre ; fichiers et résolution de génération conservés.

**237 tests web / six fichiers**, TypeScript et **80 × 1 743 clés** sans erreur. Contrôle visuel dans une application recompilée encore nécessaire. **Publication suspendue à la demande du mainteneur : aucun commit, push, nouveau binaire ni changement de vitrine pour ce correctif.** [Guide](docs/USER_GUIDE.md#un-seul-éditeur-dinstructions-et-aperçus-adaptés--correction-locale-du-27-octobre-2026).

## Fenêtre commune, projets et autorisations — sources du 27 octobre 2026

Le compositeur existant reste au bas de la fenêtre, avec une navigation repliable et un habillage sombre cyan/violet. **Nouveau projet** ouvre un sélecteur de dossier puis un choix explicite : **lecture seule** par défaut, **demander avant modification ou suppression**, ou **autoriser ces changements**. Les projets sans message restent dans la liste. Le choix d’un dossier ne suffit jamais à autoriser des écritures.

Le shell demande un premier accord distinct : refus, une commande, ou les commandes de cette conversation pendant l’exécution courante de l’application. Les accords MCP ne valent pas accord du shell. Fermer la confirmation ou arrêter la tâche refuse les demandes en attente. Le bouton bouclier permet de revoir l’accès au dossier et de réinitialiser les accords. Les outils natifs reçoivent l’accès effectif à chaque appel ; les anciens dossiers sans choix explicite restent en lecture seule.

Le panneau vidéo de la discussion ajoute le nombre d’images et la cadence aux commandes de format/résolution. Les projets sur dossier conservent leur parcours d’outils texte dans la même fenêtre ; leur transport ne génère pas de médias. Les moteurs vidéo et leur validation réelle feront l’objet d’un lot séparé. Tous les nouveaux textes sont présents dans **toutes les langues déjà disponibles** ; il ne s’agit pas d’une certification linguistique.

Validation locale : **768 tests web réussis dans 51 fichiers** (dernier état de chaque fichier), TypeScript sans émission, sept tests d’architecture et contrôle des **80 locales × 1 742 clés** sans erreur. Contrôle visuel complet dans une application recompilée encore à réaliser : le navigateur intégré ne joint pas le serveur local. Aucun nouveau binaire, aucune validation CI ni nouveau rendu vidéo.

## Langues — sources du 27 octobre 2026

Dix catalogues ajoutés : cebuano, kazakh, cingalais, xhosa, khmer, afrikaans, maïthili, wolof, kurmandji et kinyarwanda. **80 locales × 1 738 clés**, dans 14 espaces de noms ; contrôle technique sans erreur. Brouillons assistés par Google ; Microsoft complète le kinyarwanda via son interface web. Relecture native requise. Les essais Lara sans clé couvrent trois phrases dans chacune des six langues rares proposées ; le magahi a produit un fragment parasite. Ces six catalogues ne sont pas ajoutés à ce lot et aucune certification linguistique n’est annoncée.

Le précédent build Windows reste à 70 locales. Aucune compilation ni publication de binaire pour ce lot ; GitHub Actions reste désactivé. Voir [le suivi des langues](docs/LANGUAGES.md).


Validation locale du lot : **589 tests réussis dans sept fichiers**, TypeScript sans émission et contrôle de **80 × 1 738 clés**, sans erreur. Aucun contrôle CI ni binaire supplémentaire.

## Temps signalé et périphérique Real-ESRGAN — 26 octobre 2026

Le mainteneur signale **11,3 secondes sans agrandissement Real-ESRGAN** pour le rendu GGUF/C++ évoqué dans le suivi. La mesure initiale instrumentée de 25,5 s est conservée comme historique ; aucun gain contrôlé entre ces deux essais n’est annoncé.

Test réel ciblé de Real-ESRGAN avec son poids officiel ×2 : **64 × 64 → 128 × 128**, modèle et tenseurs sur **CUDA en Auto** sur RTX 5070 Laptop ; même calcul confirmé sur CPU lorsqu’il est forcé. Aucune préférence de l’application modifiée. Ce contrôle ne compare pas les performances CPU/GPU et ne constitue pas un nouveau rendu complet de Novera. Mise à jour documentaire uniquement, sans recompilation ni publication de binaire.


## Panneau compact et trois consignes — 26 octobre 2026

Le panneau de discussion est désormais compact, avec un contour dégradé et des états ON/OFF explicites. Les menus Ratio/Résolution règlent directement les dimensions. L’interrupteur d’agrandissement et son menu ×2/×4 affichent la taille finale réelle ; la mémoire automatique indique son état.

Le bouton de carnet Novera ouvre uniquement les trois consignes **Texte, Image et Vidéo** : aucun réglage du modèle n’est accessible dans cet éditeur. Les **210 consignes par défaut** suivent les **70 langues** ; les personnalisations sont conservées au changement de langue. Réinitialiser prépare les valeurs par défaut, Sauvegarder les applique, Annuler conserve les précédentes. Les catalogues couvrent désormais **1 738 clés** chacun.

Auto reconnaît davantage de formulations françaises/anglaises, notamment les demandes polies et de dessin. Les demandes de prompt, script, explication ou site restent du texte. Les exemples d’échec effacés par le mainteneur n’ont pas été reproduits ; les nouveaux cas sont des tests de régression représentatifs.

Validation locale : **420 tests dans 14 fichiers**, TypeScript, build Vite Windows, compilation Release et contrôle visuel dans l’application. Le dialogue à trois champs et les tailles 1024 × 432 → 2048 × 864 en ×2, puis 4096 × 1728 en ×4 ont été vérifiés ; ×2 a été rétabli après l’essai. Aucun nouveau rendu image/vidéo n’est revendiqué pour ce lot. Un build Windows local contient ces changements ; **aucun binaire public ni validation CI**. [Utilisation](docs/USER_GUIDE.md#real-esrgan--chemins-windows-python-et-taille-finale--26-octobre-2026).


## Noms de pièces jointes compatibles — 26 octobre 2026

Les pièces jointes transmises au partage système, au partage navigateur et à **Copier le fichier** utilisent désormais un nom ASCII compatible : accents simplifiés, espaces et caractères spéciaux remplacés, nom de secours `Novera` si nécessaire. L’extension réelle, le titre et le contenu multilingue sont conservés ; l’enregistrement local garde le nom proposé en langue d’origine. Cette protection commune vise les applications destinataires au-delà de WhatsApp. Elle nécessite une nouvelle compilation de Novera.

Diagnostic local : les fichiers HTML Novera existent toujours, avec images incorporées ; la copie reçue dans le dossier de transfert WhatsApp existe aussi, mais son nom est altéré et l’URL d’ouverture encode encore différemment `œ`, ce qui désigne un fichier inexistant. La suppression du cache n’est pas la cause observée. Aucun accès au contenu des messages WhatsApp ni envoi automatique.

Validation : 99 tests web dans sept fichiers (noms Unicode et décodage, extensions, contrats de partage natif/navigateur, copie de fichier, exports et composant), TypeScript et build Vite Windows. Les contrats natif/navigateur passent aussi sous configurations macOS, Linux, Android et iOS : sept tests par configuration, plus un test réservé à Windows ignoré. Pas de nouveau binaire Novera ni d’essai réel dans chaque messagerie ou sur les autres systèmes.

## Confirmation et nettoyage local — 26 octobre 2026

Le mainteneur a ensuite confirmé le bon fonctionnement sur son PC. Ce retour utilisateur ne constitue pas une validation de toutes les messageries ou des autres plateformes.

Nettoyage local terminé : deux anciens caches de compilation/tests supprimés, environ **31,1 Go réellement libérés**, pour **120,2 Go libres sur C:** au contrôle final. Application en cours, modèles, environnements Python, sources et cache Release conservés ; les prochains tests devront reconstruire leur cache de débogage. Aucun fichier temporaire ni binaire ajouté au dépôt.

## Partage Windows de nouveau activé — 26 octobre 2026

**État courant des sources : volet système Windows réactivé à la demande du mainteneur.** Le problème a aussi été rencontré hors Novera ; le mainteneur indique avoir trouvé le réglage concerné. Cette observation ne certifie pas une cause technique précise. Copier le fichier reste un parcours Win32 dans un worker ; Enregistrer reste disponible. **20 tests web Windows**, TypeScript et contrôle natif ; aucun réglage Windows changé, aucun nouveau binaire ni nouvel envoi vers une messagerie validé. [Guide](docs/USER_GUIDE.md#partage-système-windows-réactivé--26-octobre-2026).

## Partage Windows : protection après gel confirmé — 26 octobre 2026

Le volet système a bloqué l’interaction et Novera a fait l’objet d’un événement Windows AppHang. **Volet WinRT suspendu dans les sources**, côté interface et commande native ; réactivation conditionnée à une validation interactive. Copier le fichier est mis en avant et utilise CF_HDROP Unicode matérialisé hors interface ; Enregistrer/copie riche/image/PDF restent disponibles. Instance résiduelle fermée, bureau libéré sans redémarrage de l’Explorateur. **20 tests web Windows + un test Rust Shell**, types et contrôle natif réussis. Cause Windows/interop non isolée ; aucun réglage utilisateur à modifier identifié, aucun nouvel EXE Novera ni partage réel vers une messagerie certifié. [Guide et limites](docs/USER_GUIDE.md#partage-windows--volet-bloquant-suspendu--26-octobre-2026).

## Real-ESRGAN : incident corrigé et taille finale — 26 octobre 2026

Deux causes confirmées sur le PC du mainteneur : chemins de poids Windows mal assemblés et `python` sans PyTorch/Pillow/NumPy. Sources corrigées, diagnostic préalable avant génération, réglages sauvegardés réparés vers le Python CUDA existant. **Vrai ×2 : 512 × 224 → 1024 × 448 en 4,52 s**. Le compositeur affiche un bouton Real-ESRGAN actif avec facteur et taille finale à droite de Ratio/Résolution. **42 tests web, un test Rust isolé de reproduction Windows**, TypeScript et contrôle natif réussis ; aucun nouveau binaire. [Détails et périmètre](docs/USER_GUIDE.md#real-esrgan--chemins-windows-python-et-taille-finale--26-octobre-2026).

## Partage, messageries et ratios — 26 octobre 2026

Sources : petite icône sous chaque réponse/création et pour la discussion ; résultat, branche active complète ou sélection, aperçu explicite, copie riche/image/fichier, exports et impression/PDF. DOCX/ODT/RTF/EPUB/ZIP complètent les formats textuels ; original et onze encodeurs d’image, SVG incorporé ; vidéo originale. Messageries via les capacités du système, copie ou pièce jointe ; Linux utilise le portail courriel. Dix-neuf ratios + personnalisé et résolutions ajustées au grand côté courant pour les profils locaux. **70 locales × 1 734 clés ; 145 tests web, trois tests Rust**, TypeScript, Vite, contrôle natif Windows et architecture réussis. Sources des autres adaptateurs présentes, essais natifs correspondants encore nécessaires. Aucun nouveau binaire, aucun envoi automatique ni lien public hébergé. [Guide et limites](docs/USER_GUIDE.md#partage-des-résultats-et-ratios--sources-du-26-octobre-2026).

## Graines et agrandissement d’image — 26 octobre 2026

Sources : modes de graine aléatoire/fixe/+1/−1, réutilisation, limite de génération **2048 × 2048**, agrandissement **Real-ESRGAN optionnel** ×2 par défaut/×4, modèles officiels installables ou fichier choisi. Désactivé initialement ; Python/PyTorch média requis une fois activé. **70 locales × 1 704 clés**, 82 tests web, quatre tests Python, sept tests Rust d’installation, types et contrôle natif ; vrais essais des deux poids sur CPU et CUDA, sur une entrée 16². Aucun nouveau binaire Novera ; les tailles maximales et le parcours graphique complet restent à valider après compilation. [Utilisation et limites](docs/USER_GUIDE.md#graines-résolution-et-agrandissement--sources-du-26-octobre-2026).

## Moteur image intégré et boutons actifs — 26 octobre 2026

Sources corrigées : sous Windows, plus de champ d’exécutable `sd-cli` ; les anciens chemins enregistrés sont ignorés et le moteur inclus dans Novera est résolu automatiquement. Auto, Texte, Image et Vidéo reprennent le cadre coloré des autres commandes actives. Tests ciblés réussis ; aucun nouvel EXE construit pour ces corrections. Recompiler Novera pour les appliquer au binaire. [Preuves et limites](docs/SUIVI_MOTEURS.md#résolution-interne-du-moteur-image-windows--26-octobre-2026).

## Automatisation mémoire et contrôle manuel — 26 octobre 2026

Gestion **Automatique par défaut**, dans les deux sens entre texte, image et vidéo : attente des travaux locaux actifs, déchargement des modèles devenus inutiles, rechargement à la demande et conservation des conversations/fichiers. Mode **Manuel** pour demandes texte/image/vidéo simultanées dans des discussions distinctes selon la RAM/VRAM ; les workers média restent des processus par génération. Contrôle visible dans la discussion et les paramètres généraux, traduit dans les 70 locales. **369 tests web / 24 fichiers**, trois tests natifs de politique, types et architecture ; **1 689 clés par locale**. Publication des sources/vitrine autorisée, sans nouveau build de Novera ni binaire. [Détails et limites](docs/SUIVI_MOTEURS.md#gestion-mémoire-entre-texte-image-et-vidéo--26-octobre-2026).

## Installation conseillée et bibliothèque Image/Vidéo — sources locales

Le lot du 26 octobre ajoute l’installation confirmée du trio FLUX dans `Documents/Novera models` ou un dossier choisi, progression globale/per-file, pause/reprise et vérification SHA-256. Icône seule, sans audio ni notification système, fin conservée jusqu’au clic. Import automatique dans la section Image de la page llama.cpp, import manuel/édition/retrait des configurations et sélecteur de discussion par catégorie. Le prochain build Windows embarque le moteur C++ CUDA 13.4.3/Vulkan/CPU ; plus de chemin `.build` à choisir. **70 locales × 1 681 clés**, 98 tests web ciblés/TypeScript/architecture et six tests natifs isolés validés. La sonde CUDA fonctionne ; le nouveau parcours graphique complet reste à tester avec la compilation du mainteneur. Publication des sources et contrôle de la vitrine autorisés ; aucune compilation de Novera ni publication de binaire pour ce lot. [Détails et limites](docs/SUIVI_MOTEURS.md#installation-groupée-bibliothèque-et-moteur-embarqué--26-octobre-2026).

État des sources au **26 octobre 2026**. Ce fichier est le point d’entrée ; les procédures, tâches et preuves détaillées sont dans les documents ci-dessous.



## Test réel dans Novera — images GGUF, 26 octobre 2026

Échec diagnostiqué puis corrigé par les réglages : le moteur NVFP4 était associé à un GGUF et l’exécutable C++ pointait vers un fichier d’encodeur. Après choix de stable-diffusion.cpp/Vulkan et de son vrai `sd-cli.exe`, **le trio conseillé FLUX.2 Klein 4B Q4_K_M + Qwen3-4B Q4_K_M CPU + VAE BFL a produit une vraie image 512² dans la discussion**, sauvegardée dans Images/Novera image ; durée totale affichée **25,5 s**. Binaire compilé par le mainteneur, aucune nouvelle compilation ici. Validation limitée à ce parcours GGUF sur ce PC ; cloud, vidéo et NVFP4 graphique restent distincts. [Diagnostic et preuve](docs/SUIVI_MOTEURS.md#diagnostic-graphique-et-trio-gguf-réel--26-octobre-2026).


## Synchronisation du dépôt et de la vitrine — 26 octobre 2026

Le mainteneur a autorisé la publication des nouvelles sources et de la vitrine : **41 profils cloud**, dont **19 avec routes de génération**, **45 préréglages média (25 image / 20 vidéo)**, **70 locales × 1 668 clés**, création dans la discussion, moteurs mixtes et NVFP4 CUDA natif testé. L’ambition publique inclut l’aide aux personnes et les contributions dans tous les secteurs, avec simplicité et accessibilité au savoir à travers le monde ; ces orientations restent distinctes des fonctions déjà validées. Description GitHub, site associé, sujets, README rendus, icônes/liens, absence de binaire public et GitHub Actions désactivé font partie du contrôle de synchronisation. La vérification en ligne de la révision publiée est enregistrée localement avec la publication. Aucune nouvelle compilation déclenchée ici ; le mainteneur teste sa propre compilation. Contrôles de publication : **369 tests web réussis dans 22 fichiers**, TypeScript sans émission, 70 locales à 1 668 clés, frontières et sept tests d’architecture validés. Contrôle documentaire local : 254 références sans cible manquante et 41 icônes par README.


## NVFP4 natif, placement et durées — sources locales

NVFP4 CUDA FLUX.2 Klein 4B testé réellement sur RTX 5070 Laptop : image 512²/quatre étapes, 400 GEMM natives, sans cache BF16 de diffusion. Choix CPU/CUDA/Auto indépendants pour Qwen et le générateur ; durées sous les images et vidéos, conservées dans la conversation. Conseil corrigé Qwen3-4B CPU + FLUX.2 Q4_K_M GPU et VAE officiel ; aucune nouvelle famille de poids téléchargée. Le Hub conseille NVFP4 sous conditions matérielles, et Q6_K/fidélité ou Q4_K_M/équilibre pour les composants GGUF texte/image/vidéo. 106 tests web, 21 Python CUDA, 20 Python CPU et un test matériel ignoré, 70 × 1 668 clés. **Pas de compilation ni publication.** [Preuves et limites](docs/SUIVI_MOTEURS.md#nvfp4-cuda-natif-placement-et-durées--26-octobre-2026).


## Où trouver l’information ?

| Besoin | Document de référence |
| --- | --- |
| Présentation | [Français](README.fr.md) · [English](README.md) |
| Utiliser Novera : premier démarrage, modèles, discussions, confidentialité | [Guide utilisateur](docs/USER_GUIDE.md) |
| Architecture, moteur, compatibilité, dépendances et logos | [Développement](docs/DEVELOPMENT.md) |
| Suivi local des moteurs, Safetensors CPU/GPU et versions PyTorch | [Suivi des moteurs](docs/SUIVI_MOTEURS.md) |
| Compiler, préparer Windows/Android, signer et distribuer | [Construction et distribution](docs/BUILD_AND_RELEASE.md) |
| Couverture des 70 locales, traductions et feuille de route des langues | [Langues](docs/LANGUAGES.md) |
| Prochaines tâches | [Feuille de route unique](ROADMAP.md) |
| Changements et preuves historiques | [Historique](docs/CHANGELOG.md) |
| Revue de la modification courante | [PR.md](PR.md) |
| Consignes du projet | [NOVERA.md](NOVERA.md) · [Contribuer](CONTRIBUTING.md) |
| Identité, licences et publication officielle | [Identité](BRANDING.md) · [Versions officielles](OFFICIAL_RELEASES.md) · [Licence](LICENSE) |

## Catalogue média cloud — sources locales

41 profils cloud, dont 14 nouveaux fournisseurs avec icônes officielles, et 45 présélections de génération documentées. Filtres Texte/Image/Vidéo/Multimodal et Local/Cloud dans la discussion ; choix média séparé du modèle texte, sauvegarde système commune. Les tests cloud sont simulés, sans compte ni facturation réels. Ce lot cloud avait porté les 70 locales à 1 645 clés ; le lot GGUF ci-dessous porte la base actuelle à 1 653. Relecture native requise. Voir [le suivi détaillé](docs/SUIVI_MOTEURS.md#création-cloud-dans-la-discussion--26-octobre-2026). **Aucune compilation ni publication de ce lot** : la vitrine GitHub ci-dessous décrit toujours l’état précédemment publié à 27 fournisseurs.

## Moteur image mixte et compatibilité NVFP4 — sources locales

Composants GGUF/Safetensors séparés, préparation automatique du NVFP4 ComfyUI reconnu dans un cache BF16, rendu C++ avec règle Q8_0 limitée à la diffusion. L’encodeur « uncensored » conserve son rôle et sa quantification GGUF. **Deux images réelles finales produites : Vulkan RTX 5070 Laptop, 512²/4 étapes ; CPU, 64²/1 étape.** Le mode de compatibilité ne nécessite pas de RTX 50 et n’est pas un calcul NVFP4 matériel natif. Originaux intacts. 581 tests web/26 fichiers, 15 tests Python dans les environnements CPU et CUDA, 70 locales à 1 653 clés, contrôles de types et d’architecture validés. L’application n’est ni recompilée ni publiée ; son flux natif complet attend validation. [Preuves et limites](docs/SUIVI_MOTEURS.md#formats-mixtes-ggufsafetensors-et-compatibilité-nvfp4--26-octobre-2026).

## Sources actuelles

- Version préparée : **1.0.0** ; 35 corrections Windows intégrées, architecture en six domaines et nouveaux noms internes Novera.
- **70/70 catalogues**, chacun à **1 653/1 653 clés anglaises (100 %)** dans 14 espaces de noms. Dernier lot : ouzbek du Nord, zoulou, arabe saïdi, pachto du Nord, oromo du Centre-Ouest, saraiki, néerlandais, somali, roumain et assamais. Relecture native encore nécessaire.
- Premier démarrage : langue système sauvegardée, recommandation desktop LFM2.5-2.6B Q6_K, compagnon DSpark Q8_0 facultatif avec explication RAM/VRAM/contexte, demande distincte pour le suivi des erreurs.
- **Hugging Face : environ 3,19 millions de dépôts de modèles** (3 187 159 au 26 octobre 2026), dont 214 900 GGUF et 27 295 MLX ; découverte directe des formats compatibles par lots, avec six présélections Novera conservées ; **41 profils cloud**, **69 présélections textuelles** et **45 présélections de génération**, avec neuf fournisseurs et leurs icônes ajoutés le 26 octobre (listes initiales relevées le 25). Disponibilité et capacités réelles dépendent du modèle, du compte et du matériel.
- Dernière suite web complète enregistrée : **5 187 tests réussis, 2 ignorés** ; TypeScript sans émission, catalogues et frontières d’architecture validés. Ce résultat précède la consolidation documentaire et ne prouve pas un fonctionnement natif complet.

Lot Hub antérieur : **257 tests web réussis dans 11 fichiers**, TypeScript sans émission, sept tests d’architecture réussis et 70 locales complètes. Essai API publique : 44 dépôts avec tailles, pagination disponible, aucun poids téléchargé. Aucun exécutable reconstruit.

Dernier lot cloud : **310 tests ciblés réussis dans quatorze fichiers**, TypeScript sans émission, 70 catalogues complets et 980 JSON inchangés ; 27 fournisseurs et six modèles locaux avec icônes officielles vérifiées ; les 70 noms de langues restent natifs. Aucun exécutable reconstruit pour ce lot.

Dernier lot langues : **963 tests ciblés réussis dans 45 fichiers**, TypeScript sans émission, 70 catalogues complets en clés et contrôles d’architecture validés. Relecture native et adaptation vernaculaire intégrale des variantes éditoriales restent ouvertes. Ces tests ne reconstruisent pas le programme.

## Créations dans la discussion — non publié

Les sources locales ajoutent Auto/Texte/Image/Vidéo au même compositeur, modèles Diffusers locaux et paramètres, progression/arrêt, aperçu image, lecteur vidéo, variante image et sauvegarde automatique dans **Images/Novera image** et **Vidéos/Novera vidéo** via les dossiers connus du système. Les créations conservent leurs paramètres ; les conversations stockent des références légères. PNG et MP4 ont été générés réellement sur CPU/CUDA avec des fixtures non entraînées, sans télécharger de poids ; la variante image a été validée sur CPU et l’animation d’une image sur CUDA avec une fixture conditionnée par image distincte. Lot final : **370 tests web réussis dans 17 fichiers**, **8 tests Python**, **7 tests d’architecture**, TypeScript sans émission et 70 catalogues validés. Les contrôles sont présents dans les 70 langues, à 1 620 clés chacune.

**Dernière consigne : pas de compilation de l’application ni de mise à jour du dépôt pour ce lot.** Les builds, commits et chiffres historiques des sections suivantes précèdent cet ajout. Les modèles complets, la configuration Python 3.15.1/Diffusers et la mémoire adaptée restent nécessaires. Le parcours graphique dans un nouveau binaire reste à vérifier. [Suivi des moteurs](docs/SUIVI_MOTEURS.md) · [Utilisation](docs/USER_GUIDE.md).

## Hub et Safetensors — suivi local du 26 octobre

Le Hub prépare 23 entrées de navigation, des conseils matériels expliqués et une revue avant téléchargement. Safetensors textuel : Python 3.15.1, PyTorch 2.14.1 CPU/CUDA, tests réels CPU/GPU réussis sur le modèle minuscule. Image, vidéo et autres modalités restent dépendantes de moteurs à intégrer. [Versions, résultats et limites](docs/SUIVI_MOTEURS.md).

Dernier correctif : chargement progressif au défilement sans bouton « Suivant », résultats de la catégorie active ajoutés en bas dans un ordre stable, badge raccordé au diagnostic traduit ; 16 tests ciblés réussis dans 5 fichiers et TypeScript validé. Les 70 catalogues existants sont réutilisés. Le mainteneur prend en charge sa compilation. Mise à jour des sources du dépôt autorisée ensuite par le mainteneur ; aucun binaire publié.

## Compilations locales enregistrées

Le journal `.build/launcher-desktop-2026-10-26_02-58-48-043/result.json` enregistre une compilation desktop réussie, sans publication, avant le dernier correctif de pagination/badge. Le dossier de sortie consigné n’est plus présent à son emplacement lors de ce contrôle ; sa disponibilité actuelle n’est donc pas attestée ici. Aucun nouveau build lancé pour les correctifs ou cette mise à jour documentaire.

### Compilation antérieure du 25–26 octobre

Compilation Windows x64 terminée le **26 octobre 2026 à 00:04 (Paris)**, démarrée le 25 à 23:59, dans `deliverables/Novera-desktop-1.0.0-2026-10-25_23-59-09-633`. Elle intègre les **70 catalogues**, les noms internes Novera et les options DSpark/consentements. Elle précède les neuf ajouts cloud et la découverte directe Hugging Face du 26 octobre ; ceux-ci nécessitent une nouvelle compilation.

EXE : **65 208 832 octets**, SHA-256 `1D3E1F545BF11CDC50F6E5F031ABFCA2DBD1E6293818F3D12A049263CDAC187A`.

Le BAT fourni a terminé les étapes moteur, interface et desktop. Le dossier contient 26 exécutables/DLL contrôlés x64 ; worker `novera-llama-worker.exe` version 0.7.0, llama.cpp b11823, CUDA x64 et CPU chargés. Le worker du dossier final détecte la RTX 5070 Laptop. L’ancien worker n’est pas livré. Réutilisation du moteur vérifiée sans environnement de compilation spécial, après contrôle des empreintes. Preuves locales : `.build/engine-launcher-fix-2026-10-25/runtime-audit.json` et `.build/launcher-desktop-2026-10-25_23-59-09-633/result.json`.

La compilation ne remplace pas l’application installée et ne modifie aucun profil. Aucun nouveau démarrage de l’interface, génération de modèle ou essai de mise à niveau n’a été réalisé pour cette correction. Suivi des erreurs, statistiques et mises à jour restent désactivés dans ce build sans télémétrie configurée. Les premiers démarrages et le transport réel d’erreurs depuis le WebView restent à valider.

## Vitrine GitHub — contrôle du 26 octobre 2026

Le champ « À propos », indépendant du README, a été corrigé : **70 locales d’interface**, **27 fournisseurs cloud**, Hub adaptatif et état en développement. Site associé et sujets du dépôt contrôlés ; aucune version binaire publique présente et GitHub Actions désactivé lors de la vérification.

Les README anglais/français présentent le défilement progressif, le moteur textuel Safetensors, les 23 entrées de navigation et les 14 locales RTL. Le contrôle des sources a confirmé 70 catalogues à 1 587 clés, 27 icônes par galerie et **98 références locales valides** au total, images et ancres incluses. Les derniers changements restent à compiler par le mainteneur. Le texte et les attributions de licence hérités sont conservés ; l’API GitHub classe actuellement la courte notice `LICENSE` en « Other », ce qui ne constitue pas un changement de licence.

Le catalogue Safetensors officiel recensait **1 440 138 dépôts** lors du relevé du 26 octobre 2026. Ce nombre est ajouté aux deux README avec sa source ; il ne compte pas les modèles vérifiés compatibles Novera et ne s’additionne pas aux autres formats sans risque de doublons.

La règle permanente est inscrite dans [NOVERA.md](NOVERA.md) et le [guide de développement](docs/DEVELOPMENT.md) : vérifier et actualiser la vitrine lors de chaque synchronisation, puis contrôler le résultat en ligne. Les preuves de cet audit restent locales sous `.build/showcase-2026-10-26/` ; aucune compilation ou publication binaire pour cette modification.

## Limites de distribution

**Aucun binaire Novera public.** GitHub Actions et mises à jour automatiques restent désactivés. Les sources publiées peuvent être plus récentes que le programme installé. La consolidation documentaire ne compile ni ne remplace l’application.

Android : APK debug ARM64 assemblée dans les essais antérieurs ; trois audits restent ouverts. Essais sur téléphone, signature de production et parcours de construction gardé complet non validés. Android reste désactivé dans le lanceur.

Les validations à réaliser sont centralisées dans [ROADMAP.md](ROADMAP.md), sans les recopier dans chaque guide.

Contrôle final avant publication des sources : **309 tests réussis dans 17 fichiers**, TypeScript sans émission réussi ; contrôles des 70 locales et des frontières d’architecture sans erreur. Aucun nouveau build ni binaire publié pour cette synchronisation.

Compilation finale du rangement/import automatique réussie : `deliverables/Novera-desktop-1.0.0-2026-10-28_03-08-27-045/Novera-Desktop.exe`. SHA-256 : `C23A75AEA1616C0C01D86B1031E727A08E4D206BAAE2FBBD90CB9A8862F3AC7C`. Exécutable et moteur embarqué b11940 vérifiés ; manifeste d’empreintes présent. Les 40 tests supplémentaires du service de fournisseurs passent. L’interface graphique complète n’a pas été parcourue ; les tests de catalogue et de stockage, ainsi que les deux chargements réels depuis Documents, sont distincts de cette validation visuelle. Preuves : `.build/recommended-model-import/final-artifact.json` et journaux associés.
