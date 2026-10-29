# Novera — guide utilisateur

## Informations utilisateur — tableau de bord et créations, 29 octobre 2026

Le tableau de bord conserve une largeur maximale de **1 024 px** et s’adapte aux fenêtres plus petites. Dans la rangée basse, les commandes suivent cet ordre : **Mémoire auto → Réglages → Téléchargements**. Réglages ouvre la même configuration commune ; Téléchargements donne accès à la progression et aux commandes des téléchargements en cours. Ce raccourci n’active aucune compilation ni mise à jour automatique.

Le bouton d’envoi conserve une teinte **bleu sombre** pendant le travail ; un **petit carré** indique la commande Arrêter. Le compteur de contexte local reste visible dès l’écran initial lorsqu’un modèle est sélectionné : **« — » signifie que la capacité réelle n’est pas encore disponible**. Il est remplacé par le pourcentage dès que le moteur fournit cette information. Le cercle associé est une jauge ; ce pourcentage n’est ni une progression de téléchargement ni un taux d’utilisation du GPU. Les libellés d’attente réutilisent les traductions disponibles dans les 80 catalogues.

La [version portable Windows](BUILD_AND_RELEASE.md#portable) est incluse dans la préparation des distributions : ZIP complet à extraire, sans installateur, avec empreinte SHA-256. Les modèles ne sont pas fournis et les données utilisent les emplacements Novera habituels. Aucune compilation de ces nouvelles sources n’est lancée par cette préparation.

Cette section décrit les sources mises à jour ; leur présence dans votre application dépend de sa compilation avec ces sources. Les [règles d’or](REGLES_D_OR.md) imposent une information claire dans les 80 langues pour les fonctions de Novera. La traduction structurelle ne remplace pas une relecture par des locuteurs de chaque langue. Les notes datées qui suivent cette section décrivent des états antérieurs ; cette section présente le fonctionnement courant.

### Du démarrage au premier résultat

1. Ouvrez **Novera · Configurations** pour choisir les fonctions souhaitées. Le mode local demande les modèles et leurs composants ; le cloud demande un fournisseur, un modèle accessible et votre clé API.
2. Terminez les téléchargements et vérifiez que les composants sont prêts. Un fichier de modèle seul ne suffit pas toujours : l’encodeur et le VAE doivent correspondre au moteur choisi.
3. Dans le tableau de bord, choisissez **Texte**, **Image**, **Musique** ou **Vidéo**, ou utilisez **Auto** pour laisser Novera orienter votre demande. Un choix de mode explicite garde priorité.
4. Vérifiez le modèle affiché, les réglages et la quantité, puis envoyez votre demande. Le bouton intégré à droite de la saisie devient Arrêter pendant l’exécution ; il reste séparé de la zone de texte.
5. Consultez le résultat, ses informations et les commandes de fichier. L’emplacement enregistré permet de retrouver l’original ; le partage transmet le média sélectionné.

Auto facilite l’orientation et la gestion des réglages disponibles ; il ne fournit pas de clé API et ne supprime pas les contraintes matérielles. Les rangées du tableau de bord reviennent à la ligne lorsque l’espace manque. Sur une petite fenêtre, certains outils restent accessibles dans leur menu regroupé.

### Quel modèle sert à quoi ?

| Fonction | Modèle ou composants du parcours local | À comprendre |
| --- | --- | --- |
| Conversation | Modèle de texte sélectionné, par exemple Nemotron-3.5-Bolt-E4B | Rédaction, compréhension et réponses textuelles. |
| Recherche dans les documents | Modèle d’embeddings, par exemple Qwen3-Embedding 0.6B | Représentation des textes pour la recherche ; ce n’est pas un générateur d’image. |
| Image | FLUX.2 Klein 4B, encodeur Qwen3-4B et VAE correspondant | Le générateur, l’encodeur et le VAE ont des rôles complémentaires. La note commune des Configurations précise désormais que cet ensemble sert à l’image. |
| Musique | ACE-Step 1.5 Turbo, planificateur, encodeur et VAE dédiés | Le texte peut décrire le style et fournir des paroles ; vérifiez le choix Instrumental. |
| Vidéo | Wan2.1 T2V 1.3B, encodeur UMT5 et VAE correspondant | La résolution, le nombre d’images et la cadence influencent la charge et la durée du clip. |
| Agrandissement d’image | RealESRGAN, selon les fichiers installés | Traitement supplémentaire pour augmenter la taille d’une image. |

Les noms ci-dessus décrivent le parcours présenté par Novera, pas une liste de tous les modèles compatibles. Les choix réels restent ceux de vos réglages et du catalogue. Les besoins dépendent aussi de la précision, de la taille de sortie et de la mémoire déjà occupée.

**RAM** désigne la mémoire principale de la machine ; **VRAM**, celle du processeur graphique. L’**encodeur** prépare la consigne pour le générateur ; le **VAE** participe à la conversion des représentations vers le média final. Le réglage de mémoire automatique adapte la gestion disponible ; il ne crée pas de mémoire supplémentaire.

### Local ou cloud

Le moteur local utilise les composants installés sur votre machine. Un modèle cloud envoie la demande au fournisseur choisi ; celui-ci impose son accès au modèle, ses quotas, crédits, formats et conditions. Consultez votre compte avant de lancer plusieurs résultats. La clé se règle dans le profil du fournisseur ; ne la copiez pas dans une demande ou une capture publique.

Une clé valide pour la conversation ne garantit pas l’accès aux modèles d’image, de musique ou de vidéo. Le fournisseur et le modèle doivent correspondre à la fonction sélectionnée. Le dépôt présente leurs noms et icônes dans le tableau des fournisseurs multimédias ; cette présentation n’implique pas de partenariat.

### Comprendre les commandes

| Commande | Effet et conseil |
| --- | --- |
| Ratio | Forme du cadre, par exemple 21:9 ; à distinguer du nombre de pixels. |
| Résolution | Dimensions en pixels ; les augmenter peut accroître le temps de calcul et la mémoire nécessaire. |
| Agrandissement | Ajoute un traitement pour agrandir l’image ; la taille finale et le temps total peuvent augmenter. |
| Graine | Valeur qui contrôle une partie de l’aléatoire. Fixez-la pour comparer des essais dans un environnement identique ; une reproduction exacte entre moteurs ou versions n’est pas garantie. |
| Quantité | De **1 à 10**, **1 par défaut**, réglage indépendant pour Image, Musique et Vidéo. Les résultats sont demandés successivement ; le temps et les frais cloud éventuels peuvent augmenter. |
| Durée du média | Longueur de la musique ou du clip ; les limites dépendent du moteur. Un choix manuel valide reste prioritaire sur l’interprétation automatique du texte. |
| Images / FPS | Nombre d’images et cadence vidéo. Ils participent à la durée du clip et à la charge de génération. |
| Instrumental | Demande une musique sans chant lorsqu’il est activé. Pour chanter, désactivez-le et fournissez les paroles souhaitées. |

Le profil musical recommandé actuel active **Instrumental**. Vous pouvez le désactiver pour demander une chanson avec voix. Les choix déjà enregistrés dans vos profils sont conservés ; un réglage existant peut donc différer de la recommandation initiale.

### Les temps affichés restent des informations du résultat

Le **temps de génération** indique la phase de calcul lorsqu’elle est mesurée. Le **temps total** couvre le parcours mesuré jusqu’au résultat ; il peut inclure préparation et traitements complémentaires. Aucun de ces temps n’est la durée de lecture d’une musique ou d’une vidéo.

Les nouveaux résultats conservent leurs temps avec l’historique, séparément pour chaque fichier. Après redémarrage, ils sont réaffichés. Pour les anciens résultats, Novera peut récupérer les valeurs encore présentes dans le fichier d’informations associé ; si elles n’ont jamais été enregistrées ou ne sont plus disponibles, aucune durée n’est inventée. Gardez le média et ses fichiers associés à leur emplacement pour conserver cet accès.

### Si une génération échoue

Le message doit conserver le détail utile de l’erreur. Une erreur de mémoire ou d’écriture ne doit plus être remplacée systématiquement par une invitation à configurer un modèle.

| Situation signalée | Vérification utile |
| --- | --- |
| Modèle ou composant manquant | Ouvrez Configurations, vérifiez le moteur sélectionné et ses fichiers requis. Attendez la fin du téléchargement. |
| Clé, accès ou quota cloud | Vérifiez le profil du bon fournisseur, l’accès au modèle et les crédits. Un nouvel essai peut être facturé selon le fournisseur. |
| Mémoire insuffisante | Réduisez la résolution ou la charge de génération, fermez les applications gourmandes et vérifiez les réglages mémoire. |
| Impossible d’enregistrer / disque plein | Vérifiez l’espace libre et l’accès au dossier de sortie. Un calcul terminé ne signifie pas que son fichier a pu être écrit. |
| Fichier ancien indisponible | Vérifiez qu’il n’a pas été déplacé ou supprimé ; la référence de l’historique ne remplace pas le fichier original. |
| Réseau ou service distant indisponible | Vérifiez la connexion et l’état de votre fournisseur avant de relancer. |

Pour demander de l’aide, indiquez le mode, le modèle, les réglages principaux et le détail affiché, en retirant toute donnée personnelle. Ne transmettez jamais votre clé API. Les correctifs de diagnostic n’assurent pas la réussite d’une génération sur toute machine : ils permettent de comprendre et traiter sa cause réelle.

## Coller des paroles en mode Auto — 28 octobre 2026

Vous pouvez coller une chanson structurée qui commence directement par `[Intro]`, puis comporte par exemple `[Verse]`, `[Chorus]`, `[Bridge]` et `[Outro]`, avec vos lignes sous chaque balise. Auto l'oriente vers Musique. Un titre et un en-tête Paroles sont facultatifs ; une description « Style & ambiance » peut être ajoutée séparément dans le même texte. Les sections chantées sont envoyées comme paroles, la description comme consigne musicale. Le réglage Instrumental explicite reste pris en compte.

La section Musique de **Novera · Configurations** contient aussi une courte aide générique pour répartir style, voix et paroles. Elle ne contient aucune chanson prédéfinie. Les demandes explicites d'analyse, de traduction ou d'écriture restent en texte ; vous pouvez choisir Texte manuellement pour éviter une génération musicale.

Pour le partage système, l'aperçu Novera se ferme avant le volet Windows afin de libérer les clics et le focus. Si l'appel échoue, la préparation revient avec ses commandes de copie et de fermeture. Le cache des fichiers reste conservé. Ces changements nécessitent une application compilée avec les sources mises à jour.

## Musique avec chant — 28 octobre 2026

**Instrumental est désactivé par défaut** dans les nouvelles configurations et les réglages recommandés. Vous pouvez donc ajouter des paroles et demander du chant avec l'accompagnement musical. Activez Instrumental pour demander une musique sans chant. Les choix déjà enregistrés dans vos profils sont conservés.

## Partager le fichier seul et ouvrir en grand — 28 octobre 2026

Les lecteurs musique et vidéo Novera utilisent la vitesse normale, sans réglage de vitesse. Le masquage de cette commande dans les aperçus natifs dépend de la webview ; les fichiers originaux restent transmis tels quels.

Pour un média unique, le partage propose **Original** : le système reçoit le fichier image, audio ou vidéo, sans le cadre ni les boutons du lecteur Novera. Son aperçu est volontairement simple ; il ne constitue pas une capture des commandes de la conversation. Les MP3/WAV sont présentés comme de l'audio. Pour un résultat texte seul, TXT est proposé initialement. Vous pouvez toujours choisir les formats riches ou une discussion complète dans les réglages de partage ; ces choix produisent alors un document, plutôt que le média seul.

La fenêtre principale desktop est configurée pour démarrer maximisée par le système et rester redimensionnable. Le contenu s'adapte à la place disponible ; les minima sont abaissés à 640 × 480. Ces modifications des sources prennent effet dans une application recompilée et ne prouvent pas encore le comportement sur chaque environnement desktop.

## Lecteurs Novera et durée manuelle — 28 octobre 2026

Les sources proposent une barre Novera pour la musique et la vidéo : lecture/pause, déplacement dans la piste, temps écoulé/total, son et vitesse. Une autre lecture met la précédente en pause, en gardant sa position. Les images disposent du zoom, du retour à 100 % et de l'agrandissement. Les mêmes contrôles servent aux conversations et aperçus ; la vidéo peut passer en plein écran ou être agrandie dans l'application. Ces modifications nécessitent une application compilée avec ces sources.

Pour choisir la durée de génération musicale, ouvrez la durée dans le tableau de bord, **effacez la valeur puis tapez par exemple 360**. Vous pouvez laisser le champ vide pendant la saisie et taper chiffre par chiffre. Toute modification passe automatiquement en manuel : la durée écrite dans la demande ne remplace plus votre choix. Réactivez **Auto** pour suivre à nouveau la durée explicite du texte, ou la durée de secours lorsqu'elle manque. Un champ incomplet ou hors plage est signalé ; la génération ne doit pas le remplacer silencieusement par une durée plus courte. Le même comportement de saisie est prévu pour la vidéo locale.

| Moteur musical sélectionné | Durée saisissable en secondes |
| --- | --- |
| ACE-Step local | 10–600 |
| ElevenLabs ElevenMusic | 3–600 |
| Stability Stable Audio 3 | 1–380 |
| fal ACE-Step | 5–240 |
| Replicate Stable Audio 2.5 | 1–190 |

Bornes vérifiées dans [ACE-Step C++](https://github.com/ServeurpersoCom/acestep.cpp/blob/de858d8e1a94f0e1939cf9bdd8ff7d9631953077/docs/ARCHITECTURE.md), [ElevenLabs](https://elevenlabs.io/docs/api-reference/music/compose), [Stability](https://docs.stability.ai/api-reference/stable-audio/text-to-audio), [le schéma fal](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ace-step) et [Replicate](https://replicate.com/stability-ai/stable-audio-2.5/api/schema) le 27/28 octobre 2026. Il s'agit de limites de paramètres, pas d'une garantie de réussite sur tout matériel. La durée par défaut reste 30 s ; le format musical initial et recommandé est MP3 à 320 kb/s pour le moteur local. Les choix enregistrés et les formats imposés par les fournisseurs restent pris en charge.

La musique sauvegardée reste référencée depuis son dossier système après redémarrage ; le correctif d'historique restaure les références MP3/WAV qui étaient interprétées à tort comme du base64. Les fichiers et discussions ne sont pas effacés. Un fichier déplacé ou supprimé reste indisponible jusqu'à sa remise en place.

L'interface utilise les API web communes à Windows, Linux, Android, iOS et macOS. Le décodage dépend du codec et de la webview installée ; privilégier MP3 pour l'audio et MP4/H.264 pour la vidéo, sans promettre tous les formats sur toutes les versions. Sur iOS, certaines commandes de son restent pilotées par le système et le plein écran vidéo peut utiliser l'interface Apple. [Comportements Safari officiels](https://developer.apple.com/documentation/webkit/delivering-video-content-for-safari). Cette préparation des lecteurs ne rend pas les moteurs de génération desktop disponibles sur mobile. Essais dans chaque application et sur appareils réels encore nécessaires.

## Fournisseurs musicaux cloud et fiabilité locale — 27 octobre 2026

Dans la page commune, section **Musique**, le sélecteur propose **ACE-Step local**, puis **ElevenLabs, Stability AI, fal et Replicate**, avec leurs icônes. MiniMax n'est pas proposé pour la musique. Les modèles sont ElevenMusic v2.5, Stable Audio 3, ACE-Step cloud et Stable Audio 2.5 chez Replicate. La clé se règle dans le profil fournisseur habituel ; le panneau donne un lien direct. Le choix local reste la valeur initiale et aucune clé n'est préremplie.

Les paramètres suivent le contrat choisi : graine indisponible pour le parcours ElevenMusic par prompt ; formats cloud affichés selon le fournisseur ; réglage de paroles pour ElevenLabs/fal ; **190 s maximum chez Replicate** contre 240 s dans les autres choix exposés. Les raccourcis hors limite sont retirés, la saisie conserve un pas de 1 s. Les sorties cloud sont enregistrées dans **Musique / Novera musique**, comme les créations locales. Le cloud peut être facturé ; un arrêt local ne garantit pas l'annulation de cette facturation. Aucun basculement automatique vers un autre fournisseur payant.

Auto reste actif quand un profil est installé ou un modèle choisi ; la sortie reconnue et son modèle restent visibles. Le choix manuel explicite d'une sortie reste disponible.

Pour le problème CUDA signalé pendant le décodage musical, les sources réduisent les tuiles VAE et prévoient une reprise CPU unique en placement automatique pour cette erreur précise. Essais locaux réussis : **30 s de WAV en 13,6 s**, puis **180 s en 24,9 s**, à 48 kHz stéréo 24 bits. Le second fichier mesure **51 840 044 octets**. [Mesures détaillées et limites](SUIVI_MOTEURS.md#musique-cloud-et-vae-cuda--candidat-du-27-octobre-2026). Qualité d'écoute non évaluée ; aucun essai cloud facturé ni nouvelle compilation de Novera pour ce lot. Dans l'exécutable actuel, le choix **CPU** déjà disponible constitue un contournement possible en attendant sa recompilation.

## Auto visible et musique à la seconde — correction locale du 27 octobre 2026

Un nouveau contexte commence en **Auto**. Pendant la saisie, Auto reste allumé et le bouton de la sortie reconnue s'allume également : Texte, Image, Musique ou Vidéo. Le sélecteur compact près des actions montre le modèle correspondant ; son nom complet est disponible au survol. Les boutons suivent les changements de demande sans modifier le choix Auto. Pendant un travail, ils restent attachés à la sortie envoyée ; un brouillon suivant ne remplace pas l'indicateur du travail en cours. Les choix manuels existants restent respectés.

« Crée une bande originale de 3 minutes pour le film… » choisit désormais **Musique** et envoie **180 secondes**. Le mot film ne transforme plus cette demande en vidéo. Les requêtes de texte, prompt ou scénario restent des demandes textuelles ; une vidéo avec musique reste une vidéo. Le vocabulaire Auto couvre des commandes dans les 80 locales, avec des exemples testés et des commandes explicites traduites ; il s'agit d'une reconnaissance déterministe, pas d'une garantie sur toute formulation ou variante dialectale. En cas d'ambiguïté, les quatre boutons manuels restent disponibles.

Musique propose **30 à 240 secondes**, une saisie à la **seconde** et huit raccourcis : **30, 60, 90, 120, 150, 180, 210, 240 s**. Valeur par défaut : **30 s**. Une durée explicite reconnue dans le début de la demande remplace le préréglage pour cette création ; elle apparaît dans le contrôle et ne modifie pas le préréglage enregistré. Pour la changer, modifier la demande. Une durée explicite hors plage est refusée avant génération. Les anciens paramètres musicaux hors plage sont ramenés aux nouvelles bornes lors de leur utilisation. Les durées vidéo restent indépendantes.

Les créations musicales sont sauvegardées automatiquement dans **Musique / Novera musique**, avec le dossier Musique fourni par le système, en WAV ou MP3 selon le format choisi. Le lecteur dans la conversation référence le fichier enregistré. Les noms de modèles utilisent une direction de texte automatique pour les interfaces de droite à gauche ; aucun nouveau libellé anglais n'est imposé aux autres langues. Sources locales uniquement ; l'exécutable existant doit être recompilé ultérieurement pour intégrer ces modifications.

Les [valeurs de référence pour comparer les prochaines modifications](SUIVI_MOTEURS.md#valeurs-musicales-configurées-dans-cette-référence) conservent unités, durées, formats, poids exacts, tailles audio estimées et mesures réelles disponibles. Exemple : **3 minutes = 180 secondes**, environ **51,84 Mo de données WAV 24 bits stéréo à 48 kHz**, avant en-têtes ; il s'agit d'un calcul, pas d'un morceau déjà généré. Les temps et pics mémoire musicaux sont marqués **non disponibles** jusqu'aux essais réels.

## Texte, Image, Musique et Vidéo — sources locales du 27 octobre 2026

Le bouton à curseurs ouvre une page commune avec quatre sections dans cet ordre. Chacune explique ses modèles et propose ses réglages et le parcours **Parcourir**. En haut, **Tout télécharger et configurer automatiquement** prépare les quatre configurations conseillées Windows. Avant le lancement, la confirmation présente les fichiers, leurs tailles, le dossier, l'espace libre et la marge nécessaire. Si le disque manque de place, libérer de l'espace ou choisir un autre dossier/disque ; le lancement est bloqué tant que l'espace est insuffisant. Le contrôle est répété au démarrage. Aucun modèle n'est téléchargé sans confirmation.

Le pack représente **14,88 Go**, avec une marge supplémentaire de 256 Mio. Le Qwen texte est partagé avec l'encodeur image. Le moteur d'export vidéo nécessite un Python existant avec `imageio-ffmpeg` : le contrôle global signale ce prérequis manquant avant confirmation et permet d'ouvrir les réglages. Le bouton global ne promet donc pas d'installer toutes les dépendances du système. Voir [le budget exact et son périmètre](SUIVI_MOTEURS.md#référence-texte-image-musique-vidéo--1488-go--27-octobre-2026).

**Musique**, entre Image et Vidéo, utilise ACE-Step 1.5 Turbo 2B Q4_K_M avec ses trois compagnons. Le tableau de bord permet de choisir une durée de **30 à 240 secondes** (30 secondes par défaut), la qualité WAV/MP3 et la graine. Par défaut : **WAV 24 bits, stéréo 48 kHz, graine aléatoire, instrumental, 8 étapes et BPM automatique**. Les réglages détaillés permettent aussi une graine fixe/incrémentée/décrémentée, le nombre d'étapes, le périphérique, le tempo, les paroles et la langue du chant. La graine est conservée lors d'une reprise technique de la même demande.

Pour importer une configuration musicale, choisir le dossier contenant les quatre GGUF compatibles et le dossier du moteur `ace-lm`/`ace-synth`. Les rôles sont contrôlés depuis les métadonnées ; l'encodeur affiché suit le premier encodeur alphabétique chargé par ce moteur. Aucun chemin personnel n'est prérempli. Les profils musicaux ont leurs propres sélections et paramètres ; retirer un profil ne supprime pas ses fichiers. La création enregistrée apparaît dans un lecteur audio intégré, sans ligne technique de modèle sous le média. Musique utilise directement la demande et n'ajoute pas un assistant ni un second éditeur d'instructions.

La configuration automatique s'applique à la discussion d'origine sans forcer son mode de sortie ni rouvrir la page pendant un autre travail. Les paramètres Image/Vidéo restent séparés ; les choix vidéo de 1 seconde à 1 heure restent expérimentaux et assemblés en clips courts, avec 5 secondes par défaut. Les sources de Musique sont vérifiées par tests ; **la génération complète et l'écoute sur cette machine restent à valider**. Ces changements locaux nécessitent une future recompilation pour apparaître dans l'exécutable existant ; aucune publication n'est effectuée.

## Progression vidéo — correction locale du 27 octobre 2026

L’indicateur quitte **« Chargement du moteur de création »** dès que le moteur signale le début du calcul. Il affiche ensuite **« Création en cours · … % »**, puis **« Finalisation de la vidéo · … % »** pendant la fermeture et la vérification du MP4. **100 % est réservé à la création terminée et publiée dans son dossier local**. Un chargement sans mesure disponible reste indéterminé ; le transfert des poids en mémoire ne se fait plus passer pour la progression de création.

Le pourcentage suit les étapes de calcul et de décodage, cumulées sur les clips d’une longue vidéo ; il ne prédit pas exactement le temps restant. Le suivi par étape est également conservé pour les vidéos Diffusers. Essai réel du worker Wan : passage de Chargement à Création en cours (29, 58, 88, 98 %), puis Finalisation (98, 99 %) avant Terminé (100 %), observé pendant que le processus travaille encore. Essai technique de 1 seconde, 128 × 64, trois étapes ; ce n’est pas une mesure de qualité. Vérification du correctif : 43 tests web ciblés, 17 tests Python, types frontend et 80 × 1 746 clés sans erreur. Aucun nouveau binaire Novera ni publication du dépôt ; parcours visuel après recompilation à contrôler.

## Configuration conseillée : Texte, Image et Vidéo — sources locales du 27 octobre 2026

Le bouton **à curseurs de réglage** du compositeur ouvre **une seule page détaillée**. Son info-bulle indique ses trois usages et les choix Automatique/Parcourir. Il se distingue du bouclier des autorisations. Les sections sont distinctes :

- **Texte** : Qwen3 4B Q4_K_M proposé avec le diagnostic matériel et la confirmation de téléchargement existants du Hub ; sélection d’un modèle disponible ou import GGUF via Parcourir.
- **Image** : FLUX.2 Klein 4B Q4_K_M avec encodeur Qwen3 4B Q4_K_M et VAE. Installation confirmée, fichiers au choix, placement automatique GPU/CPU et NVFP4 image proposé selon le diagnostic de compatibilité.
- **Vidéo** : petit pack **Wan2.1 T2V 1.3B Q4_K_M**, encodeur UMT5-XXL Q4_K_M et VAE Wan2.1. Les trois poids représentent exactement **4 891 677 270 octets**, environ 4,89 Go décimaux. Les liens pointent vers des révisions figées, avec contrôle de taille et SHA-256, reprise et confirmation avant transfert. Références et empreintes vérifiées ; **les poids ne sont pas téléchargés par cette modification**.

Les réglages et chemins Image/Vidéo disposent de deux banques indépendantes. Un ancien dossier vidéo reste lisible, sans copier les chemins des composants image dans la banque vidéo. **Aucun chemin de la machine du mainteneur n’est livré comme valeur par défaut** : les champs de modèles commencent vides. Ils sont renseignés après choix, import ou installation confirmée. Les fichiers et choix utilisateur existants ne sont pas effacés.

Le parcours vidéo Q4 utilise le moteur C++ embarqué sous Windows, puis l’encodeur `imageio-ffmpeg` de l’environnement Python choisi : texte vers vidéo, sortie **MP4 H.264**, **5 secondes par défaut**, 512 × 224 en **21:9**, 16 images/s, 20 étapes et CFG 6 dans le profil proposé. Ce modèle ne prend pas en charge l’animation d’une image dans ce parcours ; le raccourci correspondant est masqué lorsqu’il est sélectionné. Les vidéos Diffusers conservent leur sortie MP4 et peuvent utiliser leurs propres pipelines image vers vidéo. **NVFP4 vidéo n’est pas activé** : ce parcours ne dispose pas du moteur nécessaire pour ce format.

La durée se règle de **1 seconde à 1 heure**, directement **à gauche du format** sur le tableau de bord. Le conseil Novera sélectionne 5 secondes. Les longues vidéos sont assemblées à partir de clips courts, encodés au fur et à mesure pour éviter de conserver toute la vidéo en mémoire ; des raccords peuvent être visibles. Une heure est une possibilité expérimentale de planification/assemblage, pas une scène cohérente d’une heure validée avec Wan. Les graines Image et Vidéo sont **aléatoires par défaut**, avec les choix Fixe, Incrémenter, Décrémenter et Réutiliser la dernière graine dans les deux sections indépendantes. Le format initial des deux configurations est 21:9 ; les choix explicites sauvegardés restent conservés. Les aperçus vidéo s’adaptent à la largeur et à la hauteur disponibles, sans déformation, et disposent d’un lecteur agrandi.

Le diagnostic local a trouvé la cause de l’échec après calcul : le moteur livré produit un **AVI même avec une extension WebM**. Le nouveau parcours demande explicitement un AVI temporaire puis encode un vrai MP4 avant publication. L’environnement Python doit fournir `imageio-ffmpeg` (présent dans les dépendances média existantes) ; une erreur de dépendance apparaît avant le calcul. Les erreurs du moteur sont désormais conservées dans le message d’échec, au lieu du seul conseil générique de configuration.

Le LTX-Video 2B envisagé auparavant n’est pas la même famille que LTX-2.3/2.5. Il n’est pas pris en charge par le moteur C++ embarqué ; le profil léger Q4 proposé ici est donc Wan2.1. Voir [le support Wan du moteur](https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/wan.md), [la conversion Q4 du générateur](https://huggingface.co/samuelchristlie/Wan2.1-T2V-1.3B-GGUF), [l’encodeur](https://huggingface.co/city96/umt5-xxl-encoder-gguf) et [le VAE repackagé](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged). Les licences des fournisseurs s’appliquent.

Les nouvelles créations locales et cloud n’ajoutent plus la ligne **« Modèle : moteur · fichier »** sous le résultat. Les anciens pieds natifs isolés sont masqués à l’affichage ; les messages et métadonnées sauvegardés sont conservés.

Vérification du correctif local : **145 tests web dans 13 fichiers**, **15 tests Python**, **13 tests natifs isolés** sur les sources réelles, TypeScript, sept tests d’architecture et contrôle des **80 locales × 1 745 clés**, sans erreur. Deux libellés supplémentaires sont traduits dans toutes les locales ; relecture native encore nécessaire. Le pack déjà installé par le mainteneur est vérifié prêt. Essai réel du nouveau worker : **512 × 224, 80 images à 16 images/s, MP4 de 5,00 secondes**, environ **124,8 secondes** de calcul et export sur la machine du mainteneur. Un assemblage de deux clips de test vérifie aussi la durée exacte ; l’arrêt du worker coupe son moteur enfant sous Windows. Aucune génération d’une heure testée, aucune certification de qualité ou de performance générale, aucun nouveau binaire Novera. Le parcours visuel dans l’application recompilée reste à contrôler. Publication du dépôt et de la vitrine toujours suspendue.

## Un seul éditeur d’instructions et aperçus adaptés — correction locale du 27 octobre 2026

**Novera est un assistant avec trois catégories d’instructions : Texte, Image et Vidéo.** Le seul éditeur officiel reste le carnet du tableau de bord **« Novera · Gérer les instructions »**. Configuration → Assistants présente désormais une explication et un retour vers l’accueil, sans second formulaire ni création de trois assistants supplémentaires. Une ancienne ouverture du formulaire du profil intégré Novera affiche le même guide. Les profils et instructions sauvegardés restent conservés ; les assistants personnalisés liés aux projets ne sont pas supprimés.

Les images générées occupent la largeur de la conversation disponible ; la limite fixe de 576 px est retirée. Leur hauteur suit la fenêtre (75 % de sa hauteur visible), sans déformation ni recadrage. Un clic ouvre l’aperçu agrandi sur 95 % de la largeur de la fenêtre. Le fichier, ses dimensions réelles et les paramètres de génération sont conservés : cet ajustement concerne la présentation uniquement.

Validation des sources : 237 tests web dans six fichiers, TypeScript et contrôle des 80 locales × 1 743 clés sans erreur. Aucun nouveau binaire ni contrôle visuel dans une application recompilée. **Correction gardée uniquement en local à la demande du mainteneur : aucun commit, push ou changement de vitrine.**

## Nouveau projet et choix d’accès — sources du 27 octobre 2026

1. Cliquer sur **Nouveau projet** dans la barre latérale, ou utiliser le raccourci correspondant. Choisir un dossier existant ou en créer un dans le sélecteur système.
2. Confirmer le mode : **Lecture seule**, **Demander avant modification ou suppression**, ou **Autoriser la modification et la suppression**. Annuler abandonne l’ouverture. Lecture seule est sélectionné initialement.
3. Retrouver le projet dans la liste, même avant le premier message. Utiliser le bouton bouclier pour revoir les autorisations. **Réinitialiser** retire les accords du shell et remet le dossier en lecture seule.

Avant la première commande du shell, Novera affiche la commande et ses paramètres : **Refuser**, **Autoriser une fois**, ou **Autoriser dans la conversation**. Le dernier choix ne vaut que pour cette conversation et jusqu’au redémarrage de Novera. Il reste indépendant du choix du dossier et des autorisations MCP. Une fermeture ou un arrêt de tâche ne vaut jamais acceptation. Le choix explicite d’accès au dossier est sauvegardé avec le projet ; les accords temporaires du shell ne le sont pas.

Les écritures sans accès au projet restent confinées à l’espace de travail privé par la protection native existante. En mode de confirmation, un moniteur de fond reste en lecture seule. Changer ou réinitialiser les accès s’applique aux appels suivants et annule les confirmations en attente ; utiliser **Arrêter** pour interrompre les commandes déjà lancées.

La discussion conserve les modes Automatique/Texte/Image/Vidéo. Le bouton vidéo compact règle le nombre d’images et la cadence à côté du format et de la résolution pour les profils locaux. Le travail sur dossier utilise encore les outils texte ; la génération vidéo et le parcours visuel dans une nouvelle application compilée restent à valider. Tous les textes sont fournis dans les langues déjà disponibles. Ce lot met à jour les sources, sans nouvelle compilation de Novera.

## Noms de pièces jointes compatibles — 26 octobre 2026

Les pièces jointes transmises au partage système, au partage navigateur et à **Copier le fichier** utilisent désormais un nom ASCII compatible : accents simplifiés, espaces et caractères spéciaux remplacés, nom de secours `Novera` si nécessaire. L’extension réelle, le titre et le contenu multilingue sont conservés ; l’enregistrement local garde le nom proposé en langue d’origine. Cette protection commune vise les applications destinataires au-delà de WhatsApp. Elle nécessite une nouvelle compilation de Novera.

Diagnostic local : les fichiers HTML Novera existent toujours, avec images incorporées ; la copie reçue dans le dossier de transfert WhatsApp existe aussi, mais son nom est altéré et l’URL d’ouverture encode encore différemment `œ`, ce qui désigne un fichier inexistant. La suppression du cache n’est pas la cause observée. Aucun accès au contenu des messages WhatsApp ni envoi automatique.

Validation : 99 tests web dans sept fichiers (noms Unicode et décodage, extensions, contrats de partage natif/navigateur, copie de fichier, exports et composant), TypeScript et build Vite Windows. Les contrats natif/navigateur passent aussi sous configurations macOS, Linux, Android et iOS : sept tests par configuration, plus un test réservé à Windows ignoré. Pas de nouveau binaire Novera ni d’essai réel dans chaque messagerie ou sur les autres systèmes.

## Partage système Windows réactivé — 26 octobre 2026

Le mainteneur a ensuite confirmé le bon fonctionnement sur son PC. Ce retour utilisateur ne constitue pas une validation de toutes les messageries ou des autres plateformes.

Le bouton **Partage système** et son adaptateur Windows sont de nouveau activés dans les sources, à la demande du mainteneur : le même dysfonctionnement a été observé hors Novera, puis le mainteneur a indiqué avoir trouvé le réglage concerné. Cette réactivation ne constitue pas une confirmation technique de la cause du problème Windows ; Novera ne modifie aucun réglage du système.

Après Préparer, utiliser **Partage système** pour choisir une application Windows compatible. **Copier le fichier** et **Enregistrer** restent disponibles ; la copie conserve le parcours Win32 CF_HDROP Unicode dans un worker, indépendant du volet WinRT. Le contenu n’est envoyé qu’après les actions explicites dans l’application destinataire. PDF conserve son parcours d’impression/enregistrement.

Vingt tests web ciblés sous configuration Windows, TypeScript et contrôle natif vérifient les sources. Aucun nouvel exécutable Novera ni nouvel essai complet d’envoi vers une messagerie n’est annoncé. Recompiler pour rétablir le bouton dans un build qui contenait la protection temporaire.

## Partage Windows : volet bloquant suspendu — 26 octobre 2026

**Étape historique, remplacée par la réactivation décrite ci-dessus.**

Un incident réel a bloqué le volet Partager : impossible de choisir une application ou de fermer la fenêtre ; Windows a enregistré un gel de Novera, et son volet est resté après l’arrêt de l’application. La fermeture ciblée de l’instance de partage a libéré le bureau sans redémarrer l’Explorateur. Aucun réglage Windows manquant n’a été identifié ; la cause exacte entre le système et l’interopérabilité n’est pas établie.

**Dans les sources corrigées, le volet système Windows est temporairement indisponible**, avec protection dans l’interface et dans la commande native. Utiliser **Copier le fichier**, désormais mis en avant, puis coller dans une application compatible, ou **Enregistrer** et joindre le fichier. Texte riche, copie d’image et impression/PDF restent disponibles selon le format. Aucun message n’est envoyé automatiquement. Le partage système des autres plateformes conserve son code et ses limites de validation.

Sous Windows, Copier le fichier fournit un bloc Unicode CF_HDROP entièrement matérialisé, sans attente WinRT, lecture différée du fichier ni callback de partage dans le fil d’interface. La préparation et la copie passent par un worker ; le presse-papiers peut être temporairement occupé, auquel cas une erreur est affichée. La compatibilité du collage dépend de l’application destinataire. L’application et le volet de diagnostic de cet incident ont été fermés ; aucun nouveau binaire Novera n’est publié. **Recompiler pour bénéficier de la protection** ; ne pas réutiliser le bouton système d’un ancien build pour vérifier ce correctif.

Validation : vingt tests web ciblés sous configuration Windows, un test Rust utilisant le parseur réel du Shell pour des chemins Unicode et UNC, contrôle natif Windows et TypeScript. Cela ne certifie pas un envoi vers WhatsApp, Outlook ou une autre messagerie. La réactivation du volet WinRT nécessite une correction démontrée et un essai interactif réussi.

## Real-ESRGAN : chemins Windows, Python et taille finale — 26 octobre 2026

Le panneau compact propose des menus directs **Ratio** et **Résolution**. Pour une image locale, l’interrupteur **×2/×4** active ou désactive l’agrandissement ; la flèche voisine choisit le facteur. La taille finale est affichée dans le bouton et suit le facteur et les dimensions de départ. Exemple : 512 × 224 avec ×2 donne 1024 × 448, avec ×4 donne 2048 × 896. Sur OFF, la taille affichée est celle de l’image sans agrandissement. Ce contrôle n’est pas affiché pour la vidéo ou le cloud.

Le bouton en forme de carnet **Novera · Gérer les instructions** ouvre uniquement trois champs : **Texte**, **Image** et **Vidéo**. Il ne modifie aucun paramètre du modèle. Les consignes par défaut suivent les 70 langues de l’interface ; les textes personnalisés sont conservés lors d’un changement de langue. **Réinitialiser** remet les trois consignes par défaut dans l’éditeur ; **Enregistrer** applique le choix, **Annuler** conserve les réglages précédents. Les instructions Texte complètent celles de l’assistant sélectionné ; Image et Vidéo s’appliquent à la génération correspondante.

Le mode **Auto** reconnaît les commandes `/image` et `/video`, ainsi que les demandes explicites de création en français et en anglais, avec des formulations comme « Peux-tu me créer une image ? », « Fais-moi une vidéo » ou « Please draw a castle ». Les demandes de prompt, de script, d’explication ou de site restent du texte. Une description ambiguë comme « une voiture du futur » reste du texte : choisir **Image** ou **Vidéo**, ou préciser l’action souhaitée.

Une correction prend en charge les anciens chemins Windows d’installation combinant le préfixe canonique `\\?\` et un `/` avant le nom du fichier. Les poids pouvaient être installés et vérifiés, mais refusés par l’API Windows. Les nouveaux chemins sont assemblés correctement et les anciens chemins d’agrandissement sont réparés lors de la demande ; la validation native accepte aussi les composants concernés.

**Périphérique Real-ESRGAN :** Auto utilise CUDA si le PyTorch configuré le détecte, sinon CPU ; le choix CPU force le processeur. Le placement de l’encodeur Qwen3 sur CPU est indépendant. Un test réel du poids officiel ×2 sur une entrée synthétique 64 × 64 a confirmé les tenseurs sur CUDA en Auto sur RTX 5070 Laptop, et sur CPU en mode CPU, avec sortie 128 × 128. Il vérifie le périphérique, pas la vitesse comparative.

Le champ **Python** des réglages média doit désigner l’interpréteur de l’environnement contenant **PyTorch, Pillow et NumPy**. Installer les poids ne fournit pas ces dépendances. Un simple `python` peut pointer vers un autre environnement. Novera contrôle désormais ces imports avant de commencer le rendu avec agrandissement, ainsi que la disponibilité CUDA lorsque CUDA est explicitement demandé. Un échec distingue le modèle absent, le problème Python et le manque de mémoire, avec son détail technique ; tous ne renvoient plus au conseil d’installation des poids. Aucun téléchargement de dépendances ni remplacement global de Python n’est effectué automatiquement.

Diagnostic sur le PC du mainteneur : les deux poids officiels étaient présents ; les chemins enregistrés étaient mal assemblés et l’alias `python` ne contenait aucune des trois dépendances. Les réglages sauvegardés ont été corrigés vers l’environnement CUDA existant et vérifié, sans modifier les modèles ni les autres préférences. Essai réel avec le poids installé ×2 : **512 × 224 → 1024 × 448, 4,52 s**. Cela valide le worker sur ce PC, pas un parcours complet de la nouvelle application. L’indicateur et le contrôle préalable nécessitent une recompilation ; aucun nouvel EXE n’est publié pour ce correctif.

## Partage des résultats et ratios — sources du 26 octobre 2026

La petite icône **Partager**, à côté des actions existantes sous une réponse ou une création, ouvre un aperçu. Le même bouton dans la barre de discussion partage la conversation. Choisir **Ce résultat uniquement**, **Toute la conversation actuelle** ou **Choisir les éléments** ; préparer l’aperçu, puis Copier, Copier le fichier, Enregistrer, Imprimer/PDF ou Partage système. Modifier la sélection invalide l’aperçu précédent. Questions et sources sont sélectionnables ; les paramètres de génération restent facultatifs et désactivés initialement.

« Toute la conversation » comprend les messages de la branche active, même lorsqu’ils sont hors écran après défilement. Les autres conversations et versions de réponse restent exclues. Le JSON du nouveau bouton porte le schéma `novera-share` version 1 et suit cette sélection ; la disquette conserve son export historique distinct. Le partage retire réflexion interne et traces d’outils ; les titres/liens des sources web peuvent être ajoutés sans leurs traces d’exécution. Il ne modifie pas l’historique. Une création peut être partagée seule, sans le texte de la réponse.

| Contenu | Formats et comportement |
| --- | --- |
| Texte et documents | Markdown, TXT, HTML autonome, DOCX, ODT, RTF, EPUB 3, JSON, CSV et ZIP ; tableaux, code et images intégrés selon les possibilités du format. Les équations utilisent MathML en HTML/EPUB/ODT, OMML dans DOCX et du texte en RTF. |
| PDF | Véritable impression système, puis choix PDF si un pilote est disponible. Pour le joindre à une messagerie, enregistrer le PDF puis le sélectionner dans celle-ci. Aucun autre format n’est renommé en PDF. |
| Image seule | Original, PNG, JPEG, WebP, GIF, BMP, TIFF, ICO, TGA, PPM P6, QOI, AVIF et SVG avec image incorporée, ainsi que HTML/PDF/ZIP. La conversion SVG ne vectorise pas une image matricielle. Le navigateur seul propose PNG/JPEG/WebP et les formats documentaires ; les autres encodeurs nécessitent l’application native. |
| Vidéo | Fichier original sans transcodage ; lecture incorporée en HTML/ZIP, avec prise en charge dépendant du lecteur. Les documents imprimés/bureautiques indiquent le nom du fichier. EPUB dépend des capacités du lecteur. |
| Archive ZIP | Document HTML hors ligne, Markdown, manifeste et médias ; originaux séparés si une image a été convertie pour le document. Décompresser avant d’ouvrir l’HTML. |

Les exports bureautiques utilisent leurs vrais conteneurs ; la fidélité des mises en page et des formules complexes dépend du logiciel lecteur. Les animations restent intactes dans **Original** ; une conversion d’image produit une image fixe. ICO est limité à 256 pixels sur son grand côté. Les conversions peuvent perdre profils couleur, métadonnées et certaines caractéristiques du format initial. Les fichiers de travail comme PSD/XCF et les codecs non disponibles ne sont pas des formats de conversion proposés ; conserver l’original. Ceci couvre les formats courants indiqués, sans promettre tous les formats propriétaires.

| Plateforme | Passage vers les applications installées |
| --- | --- |
| Windows | Feuille de partage native réactivée, Copier le fichier via Win32 et Enregistrer. |
| macOS | Sélecteur de services de partage et fichier dans le presse-papiers. |
| Android | Choix système ACTION_SEND avec URI temporaire autorisée en lecture et copie de fichier. |
| iOS/iPadOS | Feuille UIActivityViewController et fournisseur de fichier pour le presse-papiers. |
| Linux | Portail XDG Email avec pièce jointe ; copie d’URI de fichier pour les logiciels compatibles et enregistrement. Un portail/client configuré est nécessaire. |
| Navigateur | Web Share quand il accepte le contenu, téléchargement et presse-papiers selon les autorisations du navigateur. |

Cela inclut les **messageries, applications de chat, courriel et réseaux sociaux** qui acceptent le format et se déclarent auprès du système. Une application absente du sélecteur peut recevoir un fichier enregistré ou collé si elle le permet. Novera n’envoie aucun message automatiquement ; ouvrir la feuille ne prouve pas l’envoi. Les liens publics hébergés sont reportés à une prochaine étape. Aucun contenu n’est téléversé par Novera pour créer un lien.

Un export contenant des médias distants peut les charger lors de **Préparer**, sans cookies ni référent ; les fichiers générés locaux restent locaux. Les médias incorporés et les exports en mémoire sont limités à 256 Mio ; les vidéos originales locales peuvent être copiées directement sans cette incorporation. Les copies de partage restent dans le cache privé de l’application, avec nettoyage des répertoires marqués datant de plus de sept jours lors d’un prochain partage. Les documents externes utilisés en contexte et les modèles ne sont pas archivés.

**Ratio et résolution** : les boutons rapides Image/Vidéo ouvrent les réglages de dimensions. Dix-neuf proportions sont proposées : 1:1, 16:9, 9:16, 4:3, 3:4, 21:9, 9:21, 16:10, 10:16, 3:2, 2:3, 5:4, 4:5, 2:1, 1:2, 3:1, 1:3, 32:9 et 9:32, plus un rapport personnalisé. Changer de ratio conserve le grand côté de la résolution actuelle ; les dimensions sont arrondies à un multiple de 16, entre 64 et 2048. Les boutons 512/768/1024/1280/1536/1920/2048 recalculent les deux côtés avec le ratio sélectionné. Exemple : 1024² → 16:9 = 1024 × 576. Le ratio peut donc être légèrement approché. Un format très large peut agrandir le grand côté pour garder au moins 64 sur le petit. Les contraintes propres au modèle demeurent ; ces réglages concernent les profils locaux image/vidéo. Les préréglages cloud restent ceux de leur fournisseur. L’agrandissement Real-ESRGAN s’applique ensuite à l’image et conserve ses proportions.

Validation des sources : 145 tests web ciblés, trois tests Rust isolés des commandes de partage, onze encodeurs exercés, TypeScript, build Vite, architecture et 70 catalogues à **1 734 clés**. Contrôle natif Windows `cargo check --lib` réussi ; conteneurs ZIP/XML contrôlés et DOCX relu indépendamment. Les adaptateurs Linux/macOS/Android/iOS sont présents dans les sources et restent à compiler/essayer sur leur plateforme. Aucun nouvel exécutable Novera, aucune validation complète d’envoi vers une messagerie ni certification bureautique n’est annoncée.

## Graines, résolution et agrandissement — sources du 26 octobre 2026

Les images locales proposent quatre modes de graine : **Aléatoire**, **Fixe**, **Incrémenter (+1)** et **Décrémenter (−1)**. Une seule graine entière est réservée par demande, conservée pendant une attente/reprise du démarrage et enregistrée avec l’image. La graine précédente peut être réutilisée en mode fixe. Les nouvelles configurations démarrent en aléatoire ; les anciens profils sans ce réglage conservent leur graine fixe. Les suites +1/−1 rebouclent aux limites 0 et 4 294 967 295. Une comparaison demande le même modèle et les mêmes réglages ; la graine seule ne garantit pas un résultat identique entre matériels ou versions.

Le message près des dimensions indique la limite de **génération de Novera : 2048 × 2048 pixels**, avec suffisamment de mémoire. Il ne certifie pas cette taille pour chaque modèle ou GPU.

**Agrandissement Real-ESRGAN** est activable/désactivable et reste désactivé initialement. Le facteur proposé est **×2**, avec ×4 au choix. **Automatique** recommande le poids officiel correspondant ; **Parcourir** choisit un fichier local `.pth` compatible avec l’architecture RRDB 23 blocs en ×2 ou ×4. Les autres architectures `.pth` ne sont pas prises en charge par ce parcours.

**Installer les deux modèles officiels** prépare une confirmation avec tailles, espace et destination, puis télécharge [RealESRGAN_x2plus.pth](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth) et [RealESRGAN_x4plus.pth](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth), avec reprise et SHA-256. Dossier par défaut : `Documents/Novera models/upscale_models`, ou un emplacement choisi. **Utiliser cette configuration** enregistre les deux chemins ; Automatique les retrouve même dans un dossier personnalisé. Aucun téléchargement ne démarre au simple changement de facteur.

L’agrandissement utilise l’exécutable Python média choisi, avec **PyTorch, Pillow et NumPy**, sur CPU ou CUDA. Le processus de diffusion se termine avant le chargement de l’agrandisseur, pour libérer ses modèles. Cela s’applique aux images locales C++, Diffusers et NVFP4 ; ni aux requêtes cloud ni à la vidéo. Après génération 2048², le plafond calculé est 4096² en ×2 ou 8192² en ×4, selon la mémoire disponible. Ces grandes tailles n’ont pas été essayées ici. L’image finale est publiée uniquement après réussite et vérification des dimensions ; Arrêter couvre les deux étapes.

Tous les nouveaux textes existent dans les 70 locales. Sources uniquement : recompiler Novera pour disposer de ces réglages dans le binaire.

## Mémoire automatique ou modèles en parallèle — 26 octobre 2026

Sur desktop, le réglage **Mémoire des modèles locaux** apparaît dans la discussion et dans **Paramètres → Général**. Il est mémorisé pour le profil et expliqué dans les 70 locales.

**Automatique, recommandé et activé par défaut** : Novera attend la fin des travaux locaux actifs, libère les modèles texte inutilisés puis charge celui demandé. Le changement fonctionne dans les deux sens entre texte, image et vidéo. Les modèles texte se rechargent à la prochaine demande ; les fichiers, réglages, sélections et conversations restent conservés. Le travail déjà engagé et ses modèles auxiliaires de documents/RAG ou de routage des outils sont protégés. L’attente/libération de RAM/VRAM est visible dans le résumé du réglage. Un appel cloud seul n’impose pas de décharger les modèles locaux.

**Manuel, modèles en parallèle** : si la machine possède assez de RAM/VRAM, ouvrir des discussions distinctes permet de lancer simultanément un modèle texte, un modèle image et un modèle vidéo. Novera ne décharge pas automatiquement les modèles et le verrou exclusif entre les workers image/vidéo est levé pour ces demandes. La capacité du moteur et la mémoire disponible restent déterminantes ; une saturation demeure possible. Les processus média actuels se terminent après leur génération et libèrent leurs poids naturellement, y compris en Manuel : ce réglage n’ajoute pas un cache média permanent.

Les changements de mode s’appliquent aux nouvelles demandes et n’annulent pas les générations en cours. Les demandes automatiques attendent aussi les travaux manuels déjà engagés avant d’évincer des modèles. Ces fonctions sont présentes dans les sources ; le parcours matériel à trois modèles lourds reste à tester avec la prochaine compilation du mainteneur.

## Installation conseillée et bibliothèque média — sources du 26 octobre 2026

Dans les réglages de création, **Installer cette configuration** présente les trois composants FLUX.2 Klein 4B, leurs tailles, les liens des fournisseurs/licences, l’espace libre et la destination. Par défaut : le véritable dossier Documents du système (Téléchargements en repli), puis `Novera models/FLUX.2 Klein 4B`. **Parcourir** permet de choisir un autre parent, mémorisé pour les prochaines installations. Le sous-dossier et les fichiers ne sont créés qu’après confirmation. Les références officielles sont épinglées à une révision et vérifiées par SHA-256 ; le total est de **5 269 712 238 octets**, hors marge de sécurité.

Une variante FLUX NVFP4 officielle avec le même Qwen GGUF CPU est également proposée si le diagnostic du GPU et du moteur PyTorch confirme le calcul FP4 natif et la mémoire libre. Le téléchargement est lui aussi soumis à confirmation.

Les téléchargements continuent pendant les discussions et les créations d’images ou de vidéos. Une petite icône de la barre principale montre le pourcentage et ouvre le détail de chaque fichier, avec pause, reprise et annulation. Aucun son, toast de fin ni notification système. Après vérification, **Configuration prête** reste visible jusqu’au clic d’accusé de réception ; le panneau reste consultable jusqu’à sa fermeture. Une fin survenant dans un panneau déjà ouvert n’est pas automatiquement acquittée. Une fermeture de Novera conserve les fichiers partiels pour une reprise explicite au prochain lancement, sans téléchargement automatique au démarrage.

La configuration prête est enregistrée automatiquement dans **Réglages → Fournisseurs → llama.cpp → Image** ; le même endroit propose Image/Vidéo, import manuel, modification du nom et des composants, sélection et suppression. FLUX, son encodeur Qwen et son VAE forment une seule entrée Image. Les entrées figurent aussi dans le sélecteur de la discussion, avec les filtres Local/Image/Vidéo. **Utiliser cette configuration** choisit le moteur intégré, Qwen sur CPU et génération Auto. Les choix restent propres à la configuration sélectionnée dans chaque discussion. Comme pour les autres modèles importés, retirer une entrée de Novera **conserve les fichiers sur disque**, et le dialogue l’indique. Les modèles texte existants restent gérés par leur moteur habituel.

Le prochain build Windows préparé par le lanceur embarque le moteur C++ et ses bibliothèques CUDA/Vulkan/CPU. Novera utilise automatiquement ce moteur : aucun champ d’exécutable n’est affiché sous Windows et les anciens chemins `.build` enregistrés sont ignorés. Les autres plateformes conservent le choix d’un exécutable personnalisé. Le bouton sélectionné parmi Auto, Texte, Image et Vidéo affiche le même cadre coloré que les autres commandes actives. Ces corrections sont dans les sources ; elles nécessitent la prochaine compilation par le mainteneur.

Comportements présents dans les sources au **26 octobre 2026**. Le [tableau de bord](../TABLEAU_DE_BORD_NOVERA.md) précise ce qui est déjà compilé et ce qui reste à valider. Aucun binaire public n’est encore disponible.

[Premier démarrage](#first-run) · [Discussions](#conversations) · [Hub](#hub) · [Cloud](#cloud) · [Confidentialité](#privacy) · [Agent](#agent)

<a id="first-run"></a>

## Premier démarrage

Le sélecteur affiche les **70 noms natifs** (Français, English, العربية, 日本語, etc.), avec sens de lecture automatique et un menu élargi et défilant. Le nom indonésien est précisé en **Bahasa Indonesia**.

Sans préférence sauvegardée, la langue système est sélectionnée puis enregistrée. Un choix manuel remplace cette préférence pour les démarrages suivants. Voir [les langues](LANGUAGES.md#system-language).

Le préréglage desktop LFM2.5-2.6B Q6_K utilise une température de **0,1**, top-k **50**, pénalité de répétition **1,1** et un contexte configuré de **32 768 tokens**. Cette valeur configurée ne garantit pas la capacité disponible sur tout matériel.

### Accélération optionnelle de LFM2.5-2.6B

Le premier démarrage propose une case **DSpark**, décochée par défaut, avec le
modèle de bureau recommandé **LFM2.5-2.6B Q6_K**. Le téléchargement démarre
uniquement après l’action de l’utilisateur. Si la case est cochée, le chemin
d’import existant ajoute le compagnon Q8_0 avec le type `dspark` ; il prépare
le décodage spéculatif `draft-dspark`. Le modèle principal reste le même.
Le choix reste associé au téléchargement si le contrôle de support est encore
en attente et ne peut pas changer pendant le téléchargement.

Le [dépôt officiel LiquidAI](https://huggingface.co/LiquidAI/LFM2.5-2.6B-DSpark-GGUF)
décrit ce fichier comme un brouillon auxiliaire à associer à LFM2.5-2.6B.
[Fichier demandé](https://huggingface.co/LiquidAI/LFM2.5-2.6B-DSpark-GGUF/resolve/main/LFM2.5-2.6B-DSpark-Q8_0.gguf?download=true).
Les métadonnées Hugging Face consultées donnent **356 491 776 octets**, soit
environ 356 MB à télécharger. Les poids n’ont pas été téléchargés pour ce travail.
La taille du fichier ne mesure pas la consommation totale en mémoire.

L’explication visible avant le téléchargement précise que DSpark **peut**
accélérer la génération, utilise davantage de RAM ou de VRAM et laisse moins
de mémoire pour le contexte. L’utilisateur doit tester son matériel et régler
la longueur du contexte, ou désactiver le décodage spéculatif dans les paramètres
du modèle. La valeur du contexte n’est pas réduite automatiquement, aucun gain
de vitesse ni capacité matérielle n’est garanti. L’option 2.6B n’est pas proposée
pour la recommandation Android 1.2B ni pour un autre modèle.

### Demande indépendante pour le suivi des erreurs

Le parcours contient une étape dédiée au suivi des erreurs avant le modèle,
distincte du consentement aux statistiques. Elle présente le destinataire et
le contenu limité des rapports, puis **Autoriser / Refuser**. Aucun consentement
aux statistiques n’active les rapports d’erreurs. Le suivi reste désactivé par
défaut ; le choix est enregistré dans le même état persistant, lié à sa
destination, pour éviter de reposer la question à chaque démarrage.

Sans service configuré, l’étape indique qu’aucun rapport n’est envoyé et le
bouton d’autorisation est désactivé. Un profil ayant déjà autorisé le suivi ne
reçoit pas une nouvelle demande. Un import de modèle en arrière-plan ne peut
pas contourner la question encore en attente. Le nombre d’étapes reste stable
une fois les consentements présentés. Le réglage reste modifiable dans
Confidentialité ; le filtre des données envoyées est inchangé.

<a id="conversations"></a>

## Discussions et outils

### Paramètres et outils

La rangée sous chaque message utilise des infobulles et noms accessibles traduits pour copier/copier terminé, mémoriser, modifier, supprimer, redemander, continuer, régénérer et parcourir les versions. La jauge ouvre les statistiques dans les modes compact et détaillé ; ses libellés et unités suivent la langue. La date des messages et les nombres utilisent la langue sélectionnée, avec adaptation des codes de catalogue non standard pour `Intl`. Les exemples et dialogues de confirmation de suppression des messages sont localisés. Ces textes sont présents dans les 60 catalogues.

La recherche Internet est activée par défaut pour un nouveau profil ou un ancien profil sans préférence valide. Un choix booléen déjà enregistré, notamment une désactivation manuelle, reste conservé au redémarrage. Aucune préférence du profil utilisateur n’a été modifiée par cette mise à jour des sources.

Style actualisé dans les sources : ⚙️ réglages, 🌐 recherche web, 💻 shell, ⚡ raisonnement, 💾 sauvegarde, 🗑️ suppression. Les emoji décoratifs partagent une boîte centrée de 20 px, une taille de police de 18 px et des boutons de 32 px. Les infobulles et libellés accessibles traduits restent portés par les boutons ; les états actifs et les restrictions existantes sont conservés.

Le panneau de l’assistant indique si le modèle conserve ses valeurs par défaut ou si des paramètres de l’assistant les remplacent. La roue dentée ouvre les paramètres avancés ; « Add parameter » reste dans cette partie. Le bouton de réinitialisation retire les paramètres d’échantillonnage propres à l’assistant et conserve ses autres réglages. Sans remplacement, le modèle reprend ses valeurs configurées, y compris le profil LFM de Novera.

La portée des réglages existants est conservée : dans une discussion, sa copie de l’assistant est mise à jour, ainsi que l’assistant canonique s’il existe encore. Cette copie canonique sert aux futures discussions ; les copies des autres discussions existantes ne sont pas réécrites. Les paramètres du modèle restent distincts.

Web Search, Shell et Raisonnement partagent un contour arrondi, une épaisseur de trait cohérente et un fond teinté quand le réglage est actif. Les restrictions du Shell, les capacités nécessaires et les différents modes de raisonnement sont conservés. La recherche web possède désormais un libellé accessible et un état `aria-pressed`.

### Disquette : sauvegarder la discussion ouverte

Le menu de formats est non modal et contrôlé : un clic ou déplacement du focus ailleurs dans l’interface le ferme, même si un composant parent intercepte l’événement. Le clic extérieur peut aussi activer le contrôle visé. Le bouton, la sélection d’un format et Échap conservent leur comportement normal. Cela concerne le menu de formats ; le dialogue Windows de choix de fichier reste le dialogue natif.

Placement actualisé : Partager, disquette puis corbeille après Raisonnement, dans le groupe d’outils à gauche de la barre de saisie. Sur une fenêtre étroite, ces actions suivent les outils dans le menu de débordement.

| Choix | Contenu |
| --- | --- |
| Markdown `.md` | Texte de la branche affichée, organisé par rôle |
| Texte `.txt` | Texte de la branche affichée |
| JSON `.json` | Messages utilisateur/assistant filtrés de toutes les branches, références de branche et identifiants actifs ; schéma version 2 |
| HTML `.html` | Document autonome lisible ; les contenus des messages sont échappés |
| CSV `.csv` | Une ligne par message de la branche affichée ; UTF-8 et protection contre les formules de tableur |
| Imprimer / Enregistrer en PDF | Dialogue d’impression système, avec choix PDF s’il est disponible |

Aucune connexion externe n’est nécessaire pour l’export. Les fichiers externes joints ne sont pas regroupés dans une archive : les formats lisibles indiquent leurs références ; le JSON conserve les données et références déjà présentes dans les messages. Il ne constitue pas une sauvegarde complète du profil, des réglages globaux ou des modèles. Aucun import JSON n’est ajouté par cette modification.

Tous les formats, y compris JSON et PDF, excluent les blocs de réflexion, les appels/résultats des outils et leurs métadonnées internes. Les anciens blocs `<think>`, `<thought>`, `<thinking>`, `<reasoning>`, `<analysis>` et le canal `analysis` sont également retirés du texte de l’assistant ; les blocs incomplets ne sont pas exportés. Les messages utilisateur, les réponses visibles, leurs liens et les exemples de code restent disponibles. Les messages contenant seulement des traces internes ne créent pas d’entrée vide. La branche affichée est calculée avant filtrage afin de conserver la réponse qui suit un nœud outil. Le JSON filtré utilise la version 2 et ne constitue plus une archive brute des données de session. Aucun historique stocké n’est modifié.

Sous Tauri, l’utilisateur choisit le fichier dans le dialogue natif, puis l’écriture passe par la commande existante. Dans le navigateur, l’action télécharge un fichier. Annuler ne modifie rien ; une erreur d’écriture est affichée. Le PDF passe par une impression réelle, sans renommer un autre format en `.pdf`. Sa feuille de style est également fournie comme ressource locale pour respecter la CSP de WebView2.

### Corbeille : supprimer et repartir à zéro

La corbeille se trouve à droite de la disquette et demande confirmation. Elle vise uniquement la discussion ouverte. L’écriture des messages en attente est terminée avant la suppression persistante. Les mécanismes existants nettoient la session et demandent le nettoyage du cache moteur, de l’index documentaire et de l’espace des outils.

Après une suppression réussie, les messages en mémoire, la file d’attente et les pièces jointes préparées de cette discussion sont retirés ; la saisie et son brouillon sont réinitialisés. L’écran d’accueil permet de commencer une nouvelle discussion : un nouvel identifiant et un nouveau titre sont créés par le fonctionnement habituel au premier envoi. Aucune discussion vide supplémentaire n’est enregistrée immédiatement.

Les autres discussions restent disponibles. Une erreur conserve la discussion et la saisie, et permet de réessayer. Si l’utilisateur a changé de discussion ou est revenu à l’accueil pendant l’opération, son nouveau brouillon n’est pas effacé. Les commandes sont indisponibles pendant une génération ou le traitement des pièces jointes. La discussion de démarrage reste protégée tant que sa configuration n’est pas terminée. Cowork garde ses propres commandes et son propre cycle de session.

Il s’agit d’une suppression applicative, sans garantie d’effacement sécurisé du disque ou des copies exportées. Les nettoyages secondaires hérités sont effectués au mieux et ne transforment pas une suppression persistante réussie en échec.

### Recherche Internet désactivée et protocole brut du modèle

Quand la recherche est désactivée, une instruction explicite demande au modèle de répondre depuis ses connaissances sans simuler de recherche ; les schémas `web_search` et `web_fetch` sont retirés, y compris si un serveur MCP les expose sous ces mêmes noms. L’exécution des outils web intégrés conserve sa vérification de l’interrupteur juste avant l’appel. Les outils MCP personnalisés ayant d’autres noms conservent leur propre configuration ; l’interrupteur web n’est pas présenté comme un pare-feu général.

Certains modèles peuvent écrire `<|tool_call_start|>[google(...)]<|tool_call_end|>` comme du texte. Ce texte n’est jamais interprété ou exécuté. Il est retiré du rendu assistant, de la copie, de la sauvegarde des nouveaux messages, du rechargement de l’historique et des exports. Les balises incomplètes sont masquées pendant la génération. Les questions utilisateur et les exemples explicitement placés dans du code sont conservés. Le filtrage ne garantit pas qu’un modèle produira toujours une réponse correcte ni une réponse exploitable s’il ne génère que ce protocole invalide.

## Texte, image et vidéo dans la même discussion

Les sources locales ajoutent **Auto · Texte · Image · Vidéo** dans le compositeur. Le champ de saisie et le fil restent communs. Le choix manuel prime ; Auto reconnaît les demandes explicites en français/anglais et les commandes `/image` et `/video`. Pour les autres langues, les boutons traduits permettent de choisir explicitement la sortie.

Ouvrir les réglages de création, choisir l’exécutable de l’environnement **Python 3.15.1** équipé de **PyTorch et Diffusers 0.42.0**, puis les dossiers complets de modèles image/vidéo reconnus. L’installation isolée peut utiliser `transformers-server/setup.ps1 -Backend cu130 -Media` (ou `cpu`). Aucun poids n’est téléchargé automatiquement. Régler dimensions, étapes, graine et, pour la vidéo, nombre d’images et fréquence. CPU/GPU peut être imposé ; Auto utilise CUDA lorsque disponible. Les modèles doivent tenir en mémoire.

Le fil montre l’image ou le lecteur vidéo après la sauvegarde terminée. La progression apparaît près du champ ; le bouton d’arrêt existant annule uniquement la création en cours. Un bouton permet d’afficher le fichier enregistré ; une image peut être agrandie, servir à préparer une variante ou une vidéo dans cette même discussion. Les demandes explicites de modification/animation peuvent reprendre la dernière image créée dans le fil. La retouche accepte une seule image si le pipeline dispose d’une conversion image-à-image ; l’animation image-à-vidéo nécessite un modèle local conditionné par image ; le montage vidéo reste à intégrer.

Sauvegarde automatique : **Images → Novera image** et **Vidéos → Novera vidéo**, via les vrais dossiers connus du système, même déplacés ou redirigés vers OneDrive. Les noms uniques évitent les écrasements. Un fichier JSON voisin conserve les paramètres de reproduction. La discussion garde une référence légère ; déplacer ou supprimer le fichier le rend indisponible dans le fil. Ces créations et leurs prompts restent locaux. Les réponses des moteurs textuels et les fonctions Agent/Cowork restent séparées de l’exécution de diffusion.

Ces sources ont ensuite été publiées à la demande du mainteneur. Le parcours image GGUF/C++ a été validé dans son binaire Windows avec le trio conseillé, l’aperçu et la sauvegarde ; les autres parcours graphiques restent à vérifier séparément. [Moteurs, preuves et limites](SUIVI_MOTEURS.md).

<a id="hub"></a>

## Découvrir et comparer des modèles

**Hugging Face : 3 187 159 dépôts de modèles, soit environ 3,19 millions**, relevés le **26 octobre 2026** ([catalogue global](https://huggingface.co/models)). Parmi eux : **214 900 dépôts GGUF** et **27 295 dépôts MLX** ([GGUF](https://huggingface.co/models?library=gguf), [MLX](https://huggingface.co/models?library=mlx)). Ces nombres incluent variantes et conversions ; ils ne mesurent ni les modèles distincts ni une compatibilité garantie avec Novera.

Le Hub interroge directement l’API publique Hugging Face et propose **23 entrées de navigation** : texte, code, image, vidéo, voix, médical et autres domaines, dont tous les domaines et les tâches inconnues. La recherche et la pagination chargent des métadonnées en ligne, puis les filtres affinent les résultats chargés. Les modèles de la catégorie sélectionnée se chargent progressivement à l’approche du bas de la liste, sans bouton « Suivant ». Les nouveaux résultats s’ajoutent en bas sans déplacer les lignes déjà affichées. Changer de catégorie, de recherche ou de filtre ramène en haut ; changer le tri réinitialise l’ordre. Le chargement se met en pause en cas d’erreur réseau, avec reprise explicite via « Réessayer ». Un identifiant `éditeur/dépôt` ou une URL Hugging Face permet aussi un accès direct. Les six présélections restent disponibles. Les licences et accès restreints restent applicables.

La disponibilité d’une fiche ne signifie pas que son moteur est intégré. GGUF utilise llama.cpp ; MLX nécessite la plateforme Apple prévue. Le nouveau moteur Safetensors / Transformers importe un **dossier local complet de modèle textuel**, avec Python/PyTorch configuré. Le téléchargement automatique du dépôt Safetensors complet et les moteurs image/vidéo/autres modalités restent à intégrer. Voir le [suivi des moteurs](SUIVI_MOTEURS.md).

Les **conseils pour votre matériel** expliquent leurs suggestions selon la mémoire estimée, le moteur, la langue déclarée et votre priorité. Ils sont calculés localement, sans transmettre vos relevés matériels au catalogue. Avant téléchargement, le diagnostic vérifie les métadonnées, le moteur, le système et les budgets mémoire disponibles ; pour Safetensors, il peut sonder Python/PyTorch et CUDA. Le contexte peut être ajusté dans cette estimation. Une taille manquante affiche « Estimation mémoire indisponible » ; aucune valeur de remplacement n’est inventée. Le badge et le diagnostic utilisent le même calcul. Aucun conseil ne garantit les performances ; la catégorie médicale ne constitue pas une validation clinique.

Les listes sont mises en cache pendant dix minutes ; les métadonnées de fichiers sont chargées par trois requêtes simultanées au maximum. Aucune clé utilisateur ni poids de modèle n’est envoyé ou téléchargé pour cette découverte. Une erreur réseau conserve le dernier cache ; les six présélections restent disponibles hors ligne. Le cache ancien du catalogue Jan est abandonné à la migration, sans toucher aux modèles ou conversations.

Le Hub ajoute un catalogue Novera embarqué de six petits modèles : LiquidAI LFM2.5-230M, 350M, 1.2B-Instruct, 2.6B et Qwen3.5-0.8B, 2B. Les autres modèles découverts sur Hugging Face sont ajoutés par lots, sans dépendre du catalogue Jan. Le catalogue Novera est disponible même si le flux distant échoue. Aucune préférence de modèle installée, aucun modèle ni profil utilisateur n'est remplacé.

### Taille et classement

Les tailles et révisions des GGUF ont été vérifiées via les métadonnées Hugging Face le 24 octobre 2026 ; aucun poids téléchargé pour ce travail. Les URL pointent une révision précise. La version Q4_K_M proposée par défaut pèse respectivement 153 406 304, 229 312 224, 730 895 168, 1 674 455 040, 532 517 120 et 1 280 835 840 octets. Q6_K et Q8_0 sont également proposés lorsqu'ils existent. Le choix initial de l'assistant au premier démarrage reste LFM2.5-2.6B Q6_K.

Le tri par défaut « Adapté à mon matériel » applique l'estimation mémoire existante (RAM, GPU, contexte de 8 192 jetons), puis les dépôts d’éditeurs d’origine, la sélection Novera et le compromis 1.2B/2.6B, puis le poids. Ce n'est pas un score de qualité ni une garantie de compatibilité moteur. Les modèles aux besoins mémoire trop élevés sont classés après ceux qui paraissent tenir en mémoire. Les dimensions inconnues restent inconnues. Le diagnostic utilise les derniers relevés de mémoire disponible lorsqu’ils sont présents ; ils peuvent évoluer avant le chargement.

Les tris donnent priorité aux dépôts d’éditeurs d’origine reconnus, sans faire passer un modèle estimé incompatible devant un modèle adapté dans le tri matériel. Dans chaque groupe, le tri « Les plus petits » utilise le poids réel de la variante proposée, avec les tailles inconnues en dernier. Les deux variantes Qwen3.5 présélectionnées restent des conversions Unsloth : leur attribution d’origine est conservée. Les filtres sont moins de 1 Go, 1–2 Go, 2–4 Go, 4 Go et plus, avec bornes inférieures incluses et supérieures exclues. Ils s'appliquent aussi aux recherches directes Hugging Face. La mémoire estimée représente les poids et une heuristique de cache de contexte, hors système et avec des limites selon l'architecture ; elle ne remplace pas une mesure réelle.

### Comparaison et performances

Jusqu'à trois modèles peuvent être sélectionnés ; la comparaison reste visible au-dessus de la liste et n'est pas perdue pendant le filtrage ou le défilement. Le poids, les paramètres, la mémoire estimée et les scores publiés sont présentés côte à côte.

Les scores de qualité viennent des fiches des fabricants :

- [LFM2.5-230M](https://huggingface.co/LiquidAI/LFM2.5-230M), [350M](https://huggingface.co/LiquidAI/LFM2.5-350M) et [1.2B-Instruct](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct) : MMLU-Pro et IFEval.
- [LFM2.5-2.6B](https://huggingface.co/LiquidAI/LFM2.5-2.6B) : IFBench et LiveCodeBench v6.
- [Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B) et [2B](https://huggingface.co/Qwen/Qwen3.5-2B) : MMLU-Pro et IFEval sans mode de raisonnement.
- GGUF LiquidAI : dépôts officiels ; GGUF Qwen3.5 : dépôts [Unsloth 0.8B](https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF) et [2B](https://huggingface.co/unsloth/Qwen3.5-2B-GGUF).

Ces chiffres ne sont pas des évaluations Novera des fichiers quantifiés sélectionnés. Les méthodes, versions et modes peuvent différer. Aucun classement global commun, aucune vitesse matérielle inventée et aucun score français indépendant ne sont affichés. La date visible est celle de vérification des sources, pas la date d'exécution du benchmark fabricant.

« Tester sur mon PC » nécessite une variante locale téléchargée et déjà lancée ; le test n'effectue aucun téléchargement ni changement de modèle automatique. Il utilise un prompt fixe en anglais, identique pour tous les modèles, sans historique ni outils, avec raisonnement désactivé dans les paramètres de requête et un maximum de 128 jetons. L'anglais est une condition du protocole de mesure, pas un texte d'interface. Le modèle peut toutefois ne pas respecter ce mode.

Le débit global est calculé à partir du nombre de jetons réellement déclaré par le moteur et de toute la durée d'inférence, traitement de la question inclus, chargement du modèle exclu. Il n'est pas comparable à une mesure de décodage pur. Le premier délai correspond au premier texte reçu. Si le moteur ne rapporte pas le nombre de jetons, aucun débit n'est inventé à partir des caractères. La mémoire affichée est le dernier relevé de mémoire utilisée du système entier ; ce n'est pas la consommation propre au modèle ni un pic mémoire. La variante et la date sont conservées avec le résultat dans l'état de la page uniquement.

Le test est interdit pendant une génération de discussion ou Cowork, annulé si une génération commence, si le modèle quitte la sélection ou si l'utilisateur quitte le Hub. Annulation manuelle et limite d'une minute. Aucun message n'est enregistré dans une conversation, aucun résultat n'est envoyé à une destination statistique. Les mesures restent en mémoire et ne survivent pas à une nouvelle ouverture de la page.

<a id="cloud"></a>

Les six modèles locaux présélectionnés affichent l’icône officielle de leur éditeur : **Liquid AI** pour les quatre LFM2.5 et **Qwen** pour les deux Qwen3.5. Ces icônes sont embarquées, visibles dans la liste du Hub et sur la fiche du modèle, avec fond clair pour rester lisibles dans les deux thèmes. Aucun téléchargement de poids ne démarre à l’affichage.

## Fournisseurs cloud et maintenance

Catalogue initial vérifié le **25 octobre 2026**, neuf fournisseurs supplémentaires vérifiés le **26 octobre 2026** dans les sources officielles. Novera propose **27 fournisseurs prédéfinis** et **69 modèles de conversation présélectionnés**. Azure utilise les noms de déploiement du compte ; IBM watsonx utilise les alias de sa passerelle et ne possède pas de sélection universelle.

Les sélections de conversation sont centralisées dans `web-app/src/constants/cloudModels.ts`. Elles offrent des modèles actuels sans prétendre reproduire tous les catalogues commerciaux. Les noms de marques et identifiants API restent identiques dans les 70 langues ; toute nouvelle explication d’interface est traduite dans les 70 langues.

Les fournisseurs ajoutés disposent de leurs propres logos officiels embarqués. Voir la [provenance et la procédure de maintenance des logos](DEVELOPMENT.md#logos).

### Sélections et sources officielles

| Fournisseur | Sélection intégrée | Source vérifiée |
| --- | --- | --- |
| OpenAI | GPT-6.1 Sol, GPT-6 Astra, GPT-6 Luna, GPT-6 Sol | [Catalogue](https://developers.openai.com/api/docs/models/all), [compatibilité GPT-6](https://developers.openai.com/api/docs/guides/latest-model) |
| Azure | Noms des déploiements propres au compte ; aucun identifiant universel inventé | [Déploiements et API v1](https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/endpoints) |
| Anthropic | Claude Sonnet 5.5, Opus 5.5, Fable 5.1, Haiku 5.5 | [Modèles](https://platform.claude.com/docs/en/models/overview) |
| Gemini | Gemini 4 Argon, 3.8 Flash, 3.6 Flash, 3.5 Flash-Lite | [Modèles](https://ai.google.dev/gemini-api/docs/models) |
| Mistral | Large 4, Medium 3.5, Small 4, Ministral 3 3B | [Catalogue](https://docs.mistral.ai/models), [Large](https://docs.mistral.ai/models/mistral-large-4-0), [Medium](https://docs.mistral.ai/models/mistral-medium-3-5-26-04), [Small](https://docs.mistral.ai/models/mistral-small-4-0-26-03), [Ministral](https://docs.mistral.ai/models/ministral-3-3b-25-12) |
| Groq | GPT-OSS 120B et 20B ; Llama 3.3 70B et 3.1 8B | [Modèles disponibles](https://console.groq.com/docs/models) |
| xAI | Grok 4.7 | [Catalogue](https://docs.x.ai/developers/models), [Chat Completions](https://docs.x.ai/developers/model-capabilities/legacy/chat-completions) |
| MiniMax | MiniMax-M3.1-Flash et MiniMax-M3 | [Modèles](https://platform.minimax.io/docs/guides/models-intro), [API compatible OpenAI](https://platform.minimax.io/docs/api-reference/text-openai-api) |
| OpenRouter | Kimi K3.1 Pro, MiniMax M3.1 Flash, DeepSeek V4.1 Flash 1017, Nemotron 3.5 Super VL gratuit | [Catalogue API public](https://openrouter.ai/api/v1/models) |
| Hugging Face | DeepSeek V4.1 Flash 1017, Qwen3.8 27B, Kimi K3, GLM 5.3 | [Catalogue des modèles servis](https://router.huggingface.co/v1/models) |
| NVIDIA NIM | MiniMax M3.1 Flash, DeepSeek V4.1 Flash, Nemotron 3.5 Super VL et Lightning, GLM 5.3 | [Catalogue API public](https://integrate.api.nvidia.com/v1/models) |
| DeepSeek | `deepseek-flash` (V4.1-Flash-1017), `deepseek-v4-pro` | [Modèles et identifiants](https://api-docs.deepseek.com/quick_start/pricing/) |
| Kimi | `kimi-k3.1-pro`, `kimi-k3.1-pro-highspeed`, `kimi-k3` | [Modèles](https://platform.kimi.ai/docs/models), [adresse internationale](https://platform.kimi.ai/docs/get-your-api-key) |
| Alibaba Cloud | `qwen3.8-max`, `qwen3.7-plus`, `qwen3.8-flash` | [Catalogue](https://www.alibabacloud.com/help/en/model-studio/models), [compatibilité et régions](https://www.alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope) |
| Cerebras | `qwen-3.8-27b`, `gpt-oss-120b` | [Catalogue](https://inference-docs.cerebras.ai/models/overview), [API et vision](https://inference-docs.cerebras.ai/resources/openai) |
| Together AI | DeepSeek V4.1 Flash 1017, Kimi K3, Qwen3.8 Flash et 2.4T-A95B | [Catalogue](https://docs.together.ai/docs/serverless/models), [adresse API](https://docs.together.ai/docs/inference/openai-compatibility) |
| Fireworks AI | DeepSeek V4.1 Flash 1017, Kimi K3, MiniMax M3 | [Catalogue](https://docs.fireworks.ai/getting-started/models), [DeepSeek](https://app.fireworks.ai/models/fireworks/deepseek-v4p1-flash-1017), [Kimi](https://app.fireworks.ai/models/fireworks/kimi-k3), [MiniMax](https://app.fireworks.ai/models/fireworks/minimax-m3) |
| Perplexity | Sonar Agent, GPT-6.1 Sol, Gemini 4 Argon, Kimi K3 | [Modèles Agent](https://docs.perplexity.ai/docs/agent-api/models), [API Responses](https://docs.perplexity.ai/docs/agent-api/openai-compatibility) |

| Meta AI | `muse-wonder-1.0`, `muse-spark-1.3` | [Modèles](https://dev.meta.ai/docs/models), [API](https://dev.meta.ai/docs/api-reference) |
| Cohere | `command-a-plus-05-2026` | [Modèles](https://docs.cohere.com/docs/models), [compatibilité OpenAI](https://docs.cohere.com/v2/docs/compatibility-api) |
| Z.ai | `glm-5.3`, `glm-5.3-flash`, `glm-5.3-flashx` | [GLM-5.3](https://docs.z.ai/guides/llm/glm-5.3), [Flash](https://docs.z.ai/guides/vlm/glm-5.3-flash), [configuration](https://zcode.z.ai/en/docs/configuration) |
| AI21 Labs | `jamba-large` (1.7), `jamba-mini-2` (2) | [Modèles et alias API](https://docs.ai21.com/docs/jamba-foundation-models), [API](https://docs.ai21.com/reference/jamba-1-6-api-ref) |
| BytePlus (ByteDance) | `dola-seed-2-1-turbo-260628` | [Paramètres et disponibilité](https://docs.byteplus.com/en/docs/modelark/model-parameter-support), [retraits](https://docs.byteplus.com/en/docs/modelark/model-deprecation-notice) |
| Baidu Qianfan | `ernie-5.1` | [Catalogue Chine](https://cloud.baidu.com/doc/qianfan/s/rmh4stp0j), [ERNIE 5.1](https://ernie.baidu.com/blog/posts/ernie-5.1-0508-release/) |
| Tencent TokenHub | `hy4-preview` | [API et régions](https://cloud.tencent.com/document/product/1823/130078), [modèle](https://cloud.tencent.com/document/product/1823/132252) |
| Amazon Bedrock | `openai.gpt-6.1-sol` via Mantle | [API](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-chat-completions.html), [fiche du modèle](https://docs.aws.amazon.com/fr_fr/bedrock/latest/userguide/model-card-openai-gpt-6-1-sol.html) |
| IBM watsonx | Catalogue du compte via Model Gateway ; aucun identifiant inventé | [Passerelle](https://www.ibm.com/docs/en/watsonx/saas?topic=preview-inferencing-gateway-models), [SDK officiel](https://ibm.github.io/watsonx-ai-python-sdk/model_gateway.html) |

### Configuration et actualisation

- Les ajouts du 26 octobre emploient les API compatibles Chat Completions. Meta AI désigne son API développeur, distincte de l’abonnement grand public. Les modèles auto-hébergés sans identifiant cloud (par exemple Jamba 3B) ne sont pas inventés dans la liste.
- Les URL Z.ai, BytePlus, Baidu, Tencent, Bedrock et IBM sont modifiables. Z.ai distingue prépaiement (`/api/paas/v4`) et Coding Plan (`/api/coding/paas/v4`) : choisir l’offre de la clé ; GLM-5.3 impose son raisonnement. Baidu utilise par défaut l’API Chine `/v2` pour ERNIE 5.1 ; sa disponibilité sur l’API internationale n’est pas présumée. Tencent utilise TokenHub Chine ; Singapour emploie `https://tokenhub-intl.tencentmaas.com/v1`, avec une clé et des modèles autorisés pour ce site. BytePlus conserve l’endpoint ModelArk de Singapour ; `dola-seed-evolving` n’est pas proposé car la documentation l’indique indisponible sur BytePlus.
- Amazon Bedrock utilise une clé API bearer Bedrock et l’endpoint Mantle régional, sans signature SigV4. Le catalogue est interrogé sur `/v1/models` ; GPT-6 utilise `/openai/v1`, GPT-OSS `/v1`. Les URL de proxy personnalisées restent intactes. Le catalogue importé est limité aux familles GPT dont ce transport Chat Completions est pris en charge ; la disponibilité varie selon région et compte.
- IBM nécessite l’URL réelle du Model Gateway du compte (`https://YOUR-GATEWAY-HOST/ml/gateway/v1`) et son authentification autorisée. Laisser l’URL vide bloque l’inférence. Actualiser la liste après configuration : les alias et versions, y compris les éventuels modèles Granite récents, sont ceux réellement enregistrés dans la passerelle. Cette intégration ne remplace pas l’API native watsonx à projet/IAM.
- Cohere conserve l’URL d’inférence `/compatibility/v1` et lit son catalogue natif `/v1/models?endpoint=chat&page_size=1000`, en écartant les modèles retirés et non conversationnels. Les anciennes configurations Cohere sont conservées et leur URL native obsolète est corrigée ; les clés et URL de proxy ne sont pas remplacées.
- Z.ai, AI21, BytePlus, Baidu et Tencent utilisent une sélection maintenue dans les sources : l’actualisation réintroduit les modèles de cette sélection sans supprimer les modèles existants. Aucun endpoint de catalogue non documenté n’est supposé ; le test des clés par catalogue est désactivé pour ces services. La disponibilité d’une nouvelle version exige une nouvelle vérification et mise à jour de cette sélection.
- Une clé API du fournisseur est nécessaire. Aucune clé utilisateur n’a été lue ni utilisée pour cette vérification ; aucun appel d’inférence payant n’a été lancé.
- Alibaba utilise une URL propre à l’espace de travail et à la région. Le champ est modifiable, comme pour Azure. Remplacer `YOUR-WORKSPACE-ID` et sélectionner la région correspondant à la clé. L’aide est traduite dans les 70 langues.
- Perplexity utilise désormais `/v1/responses` avec l’adaptateur OpenAI existant. Les anciens préréglages Sonar Chat Completions ne sont plus proposés par défaut.
- Le bouton d’actualisation sait lire les catalogues des nouveaux fournisseurs lorsqu’ils exposent `/models`. Il conserve au maximum dix modèles récents, filtre les services non conversationnels reconnus et exploite les métadonnées de capacités disponibles. Les dates égales ou absentes utilisent l’ordre de la sélection vérifiée avant le tri alphabétique.
- Un modèle inconnu reste limité au texte tant que ses capacités ne sont pas confirmées. Le catalogue NVIDIA ne fournit pas ces capacités : ses nouvelles sélections sont volontairement limitées au texte dans Novera. La disponibilité commerciale d’un modèle ne prouve pas la compatibilité complète de toutes ses fonctions.
- Les sélections intégrées sont actualisées au démarrage par le service des fournisseurs. Le store conserve les modèles et réglages enregistrés ; utiliser l’actualisation pour remplacer les anciennes sélections par le catalogue du compte. Les modèles marqués comme importés sont conservés par cette action. Les modèles supprimés volontairement restent masqués lors de la fusion initiale.
- Si une API ne propose pas de catalogue ou refuse l’accès, l’actualisation affiche une erreur traduite et laisse la liste en place. Azure garde sa gestion existante : les identifiants de modèle utilisés pour l’inférence sont les noms des déploiements.

### Procédure pour les futures mises à jour

1. Relire les catalogues et annonces officiels de chaque fournisseur concerné. Vérifier les identifiants API exacts, les retraits annoncés, les régions et les formats d’API ; dater la vérification et conserver les liens ici. Ne pas déduire un identifiant à partir d’un nom commercial.
2. Actualiser `web-app/src/constants/cloudModels.ts`, y compris `CLOUD_CATALOG_VERIFIED_AT`. Ne déclarer les outils ou la vision que sur preuve officielle. Conserver les choix de gamme et ne pas remplacer silencieusement un modèle choisi par l’utilisateur.
3. Pour un fournisseur ajouté ou une API modifiée, contrôler `constants/providers.ts`, `lib/remoteModelCatalog.ts`, `lib/model-factory.ts`, `lib/providerCaps.ts` et les noms affichés dans `lib/utils.ts`. Les modèles Azure restent liés aux noms des déploiements du compte.
4. Préserver les clés, adresses personnalisées, réglages, modèles importés et suppressions volontaires. Tester l’actualisation, les réponses vides ou invalides et les erreurs d’accès sans effacer la liste existante.
5. Traduire tout texte d’interface ajouté ou modifié dans les **70 langues prises en charge**, puis actualiser `docs/language-support.json` et `docs/LANGUAGES.md`. Les marques et identifiants techniques gardent leur écriture officielle.
6. Exécuter les tests concernés du catalogue, du service des fournisseurs, de la fusion des modèles et de l’écran de configuration ; vérifier TypeScript sans émission et `python scripts/check-novera-locales.py`. Vérifier aussi l’architecture si ses frontières changent. Distinguer les tests simulés des appels réellement validés avec un compte autorisé.
7. Mettre à jour ce document, `PR.md` et `TABLEAU_DE_BORD_NOVERA.md` avec les résultats réels et les limites. La mise à jour de cette documentation ne déclenche ni compilation, ni publication, ni activation de GitHub Actions.

### Validation et limites

Les tests locaux vérifient le catalogue, les filtres, les métadonnées, le tri, les doublons, les erreurs de réponse et le choix de l’adaptateur Perplexity. Les tests de fusion et de suppression des modèles existants restent applicables. Les catalogues publics OpenRouter, Hugging Face et NVIDIA ont été consultés pour vérifier les identifiants.

L’accès réel dépend de la clé, du compte, des droits et de la région. Conversation, outils et vision de chaque fournisseur restent à valider avec des comptes autorisés. Le catalogue décrit les sources du 25 octobre ; son utilisation réelle nécessite des comptes autorisés et une validation du programme construit.

<a id="privacy"></a>

### Modèles texte, image, vidéo et multimodaux dans la même discussion

Le sélecteur se filtre par **Tous / Texte / Image / Vidéo / Multimodal**, puis par **Tous / Local / Cloud**. Image/Vidéo désignent la sortie créée ; Multimodal désigne plusieurs types d’entrée ou de sortie. Un modèle qui analyse une photo peut répondre uniquement en texte.

Choisir un générateur active sa sortie Image ou Vidéo et conserve le modèle texte de la discussion. Les réglages de création permettent aussi de choisir séparément les modèles image et vidéo, locaux ou cloud. Un seul profil et une seule configuration de clés sont conservés par fournisseur. Un modèle sans clé affiche « Configurer une clé API » et renvoie aux réglages du prestataire ; les droits, crédits et restrictions régionales dépendent du compte. Adobe Firefly requiert un jeton d’accès et son identifiant client `x-api-key`.

**Cloud :** votre texte et, si vous en ajoutez une, votre image de départ sont envoyés au prestataire sélectionné. Les créations peuvent être facturées. Le bouton d’arrêt local ne garantit pas l’annulation de cette facturation. Le modèle d’un éditeur hébergé chez fal ou Replicate utilise la clé et la facturation de cet hébergeur, explicitement nommé dans la liste. Les modèles en aperçu sont signalés ; Vidu Q4 nécessite une image de départ. Le catalogue et sa date de vérification sont décrits dans [le suivi des moteurs](SUIVI_MOTEURS.md#création-cloud-dans-la-discussion--26-octobre-2026).

Les résultats terminés apparaissent dans la discussion et se sauvegardent dans les mêmes dossiers système « Novera image » et « Novera vidéo » que les créations locales. Une URL de résultat temporaire n’est pas utilisée comme sauvegarde durable. Une erreur ne crée pas de réponse média fictive. Les paramètres Diffusers restent réservés aux modèles locaux ; les adaptateurs cloud utilisent leurs préréglages. Retouche depuis une image uniquement sur les modèles annoncés compatibles ; montage vidéo et entrées multiples ne sont pas pris en charge dans ce lot.


### FLUX.2 Klein : deux rôles GGUF distincts

Dans les réglages de création, choisir le moteur image **stable-diffusion.cpp · GGUF**, puis le GGUF de diffusion image, le GGUF encodeur **Qwen3-4B** et le VAE FLUX.2. Sous Windows, Novera utilise le moteur embarqué automatiquement ; sur les autres plateformes, sélectionner `sd-cli` et conserver ses bibliothèques à côté. Le modèle image et l’encodeur peuvent être quantifiés séparément. Les réglages de départ pour Klein distillé sont 4 étapes et CFG 1 ; vérifier ceux du modèle choisi. Auto utilise le matériel disponible via le moteur. La vidéo conserve les réglages Diffusers/Python.

Un fichier nommé comme FLUX peut contenir seulement un encodeur Qwen3 : se fier aux métadonnées et au rôle du modèle. Le fichier « uncensored » examiné dans ce lot appartient au champ encodeur. Le premier essai NVFP4 direct a échoué ; le correctif de compatibilité décrit ci-dessous permet désormais la combinaison réelle testée. Voir [les résultats et les chemins de runtime locaux](SUIVI_MOTEURS.md#images-gguf-et-encodeur-qwen3-gguf--26-octobre-2026). Les binaires ignorés doivent être sélectionnés explicitement ; ils ne sont pas inclus dans l’installeur. Aucune nouvelle compilation de Novera pour ce lot.



### Mélanger GGUF et Safetensors, y compris le NVFP4 reconnu

Le moteur **stable-diffusion.cpp · GGUF / Safetensors** propose trois fichiers séparés : modèle de diffusion, encodeur de texte et VAE. Chacun accepte le format compatible avec le moteur et la famille choisie. Pour le montage FLUX.2 Klein testé, choisir le modèle image NVFP4 Safetensors, l’encodeur Qwen3-4B GGUF — y compris la variante « uncensored » examinée — et le VAE FLUX.2 Safetensors. Le fichier « uncensored » est un encodeur ; il ne va pas dans le champ diffusion.

Les métadonnées NVFP4 reconnues déclenchent une préparation locale en cache, une seule fois par contenu et version. Choisir l’environnement **Python 3.15.1 avec PyTorch** pour cette étape. Les originaux restent intacts ; les demandes suivantes réutilisent la copie terminée. Pour le modèle 4B essayé, prévoir environ **7,22 Gio de cache supplémentaire**, plus les besoins de rendu. La progression distingue le chargement/préparation du rendu ; Stop arrête le travail possédé. Un manque d’espace ou un cache incomplet provoque une erreur, sans écrasement de modèle.

Ce mode de compatibilité peut fonctionner **sur CPU sans CUDA**. Il ne constitue pas une accélération NVFP4 matérielle native et peut demander davantage de RAM/disque. Le runtime Vulkan a produit l’image 512 × 512 avec la RTX 5070 Laptop ; un rendu technique 64 × 64 a aussi réussi sur CPU. Les autres matériels ne sont pas certifiés. Voir [résultats, formats et limites](SUIVI_MOTEURS.md#formats-mixtes-ggufsafetensors-et-compatibilité-nvfp4--26-octobre-2026). Ce fonctionnement du runtime est vérifié ; l’interface et la chaîne native du nouvel exécutable doivent encore être testées après compilation par le mainteneur.

## Confidentialité

Les statistiques et le suivi des erreurs ont des consentements **indépendants**, désactivés par défaut et liés à l’hôte/projet destinataire. Le suivi des erreurs est demandé au premier démarrage ; l’accord aux statistiques ne l’active jamais. Le refus est mémorisé. Sans destination configurée, aucun envoi n’est possible. Un changement de destinataire demande une nouvelle décision. Le retrait dans Paramètres → Confidentialité annule les requêtes en attente et les envois suivants.

| Fonction | Données et limites |
| --- | --- |
| Statistiques facultatives | Événement `novera_app_started`, version et OS, UUID aléatoire par événement, jamais réutilisé. Compte des démarrages consentis, pas des utilisateurs uniques. |
| Suivi des erreurs facultatif | Erreurs JavaScript non interceptées et promesses rejetées sans gestionnaire ; type d’erreur autorisé, message technique constant, version/OS et éventuellement positions numériques du bundle principal. Déduplication, au plus dix rapports par activation et dix positions par pile. |

Aucune conversation, prompt, recherche, résultat d’outil, clé, identité utilisateur, nom de modèle ou chemin n’est sérialisé. Les messages d’erreurs bruts, causes et propriétés personnalisées sont exclus. Pas de cookies, enregistrement de session, profil de personne ou SDK de capture automatique. Le serveur voit les informations de connexion : sa rétention et le traitement des IP restent à configurer ; le client seul ne garantit pas l’anonymat des journaux serveur.

Les erreurs interceptées par React/le routeur et les crashs natifs Rust, Android ou moteur ne sont pas couverts. Pas de source maps publiées, ni file persistante de rapports. Les diagnostics locaux et l’OpenTelemetry avancé des agents sont distincts, ce dernier désactivé sans configuration explicite du collecteur.

La configuration de construction et les essais réalisés sont décrits dans [construction](BUILD_AND_RELEASE.md#telemetry) et [historique](CHANGELOG.md#history).

<a id="agent"></a>

## Agent en terminal

Depuis Bash, `./novera-agent.sh` lance l’interface de l’agent sans argument et transmet les arguments sinon. Il utilise une CLI déjà placée dans `src-tauri/resources/bin/`, sous les noms Novera ou les noms internes `jan` compatibles. Il ne télécharge ni ne compile automatiquement.

La construction et l’appel direct du binaire sont décrits dans [le guide de construction](BUILD_AND_RELEASE.md#cli). Les références techniques restent séparées car les tests ADK utilisent leurs exemples : [CLI](agent/cli.md), [protocole](agent/protocol.md).


### NVFP4 CUDA, placement et durée des créations

Dans les réglages de création, **NVFP4 CUDA · PyTorch** accepte le Comfy FLUX.2 Klein 4B NVFP4 Safetensors, Qwen3-4B GGUF et le VAE FLUX.2 Safetensors. Utiliser Python 3.15.1 avec PyTorch CUDA et les dépendances NVFP4 facultatives. Le générateur exige un GPU Blackwell ; Qwen peut utiliser CPU ou CUDA indépendamment. Auto conserve Qwen sur CPU si la VRAM libre est limitée. Le moteur C++ conserve ses composants GGUF/Safetensors et son mode de compatibilité. Le parcours vidéo Diffusers garde son réglage global.

Le conseil Novera propose FLUX.2 Klein 4B Q4_K_M sur GPU, Qwen3-4B Q4_K_M sur CPU et le VAE officiel, avec liens et bouton de placement sans téléchargement automatique ni remplacement des chemins choisis. Pour privilégier la fidélité des composants GGUF texte, image et vidéo : Q6_K minimum conseillé ; pour l’équilibre : Q4_K_M. Ces repères ne garantissent pas une précision universelle et ne s’appliquent pas directement à NVFP4. Le Hub explique les prérequis et ne confond pas GPU compatible et moteur prêt.

Sous chaque nouvelle image ou vidéo apparaissent la durée totale et, si le moteur la mesure, la génération seule. Le total inclut chargement, encodage, attente réseau et sauvegarde ; les mesures restent visibles après réouverture. Pas de durée inventée pour les anciennes créations. [Références de téléchargement, résultats et limites](SUIVI_MOTEURS.md#nvfp4-cuda-natif-placement-et-durées--26-octobre-2026).

### Échec image : vérifier le moteur et son exécutable

Pour une diffusion **GGUF Q4_K_M**, sélectionner **stable-diffusion.cpp · GGUF / Safetensors**. Dans les sources Windows corrigées, Novera résout son moteur embarqué sans champ d’exécutable ni ancien remplacement manuel. Si ce champ apparaît encore, le binaire utilise une version antérieure : recompiler avec les sources à jour. Les champs diffusion, encodeur Qwen3 et VAE restent séparés. Le moteur **NVFP4 CUDA** attend le modèle image Safetensors Comfy NVFP4 reconnu ; un GGUF Q4_K_M n’est pas ce format.

La correction de ces deux réglages a permis la génération réelle du trio conseillé dans Novera : **512 × 512, quatre étapes, Qwen sur CPU, génération Auto/Vulkan, 25,5 s au total**, image affichée et sauvegardée dans Images/Novera image. Le message générique masquait une erreur de validation de format ; aucun modèle n’a été réécrit pour résoudre cet échec. [Preuves et périmètre](SUIVI_MOTEURS.md#diagnostic-graphique-et-trio-gguf-réel--26-octobre-2026).
