# Langues d’interface Novera

## Extension à 120 langues et variantes — 11 novembre 2026

Les sources proposent **120 locales d’interface**, chacune avec **2 484 clés** dans **15 espaces de noms**. Ce lot suit les rangs 108 à 117 de la [compilation communautaire 2025](https://www.jetpunk.com/user-quizzes/2026529/top-200-languages-ethnologue-2025). Le sélecteur, la détection d’une préférence système explicite, la persistance et les commandes du mode Auto couvrent les dix ajouts.

| Rang de référence 2025 | Langue ou variante | Locale | Écriture et sens | Base de traduction |
| ---: | --- | --- | --- | --- |
| 108 | Arabe du Hedjaz | `acw` | Arabe, RTL | Adaptation partielle de l’arabe standard |
| 109 | Arabe de Taëz et d’Aden | `acq` | Arabe, RTL | Brouillon NLLB et corrections éditoriales |
| 110 | Hongrois | `hu` | Latin, LTR | Brouillon MADLAD et corrections éditoriales |
| 111 | Sadri (nagpuri) | `sck` | Devanagari, LTR | Adaptation partielle du hindi écrit |
| 112 | Oromo oriental | `hae` | Latin, LTR | Adaptation partielle de l’oromo du Centre-Ouest |
| 113 | Pidgin camerounais (kamtok) | `wes` | Latin, LTR | Adaptation partielle du pidgin nigérian |
| 114 | Arabe mésopotamien du Nord | `ayp` | Arabe, RTL | Adaptation partielle de l’arabe standard |
| 115 | Mooré (mossi) | `mos` | Latin, LTR | Brouillon NLLB et corrections éditoriales |
| 116 | Min du Nord (minbei) | `mnp` | Han traditionnel, LTR | Adaptation partielle du chinois écrit traditionnel |
| 117 | Sylheti | `syl` | Bengali, LTR | Adaptation partielle du bengali écrit |

### Relecture éditoriale des dix catalogues

Les **24 350 entrées** ont été comparées à la référence anglaise pour contrôler les variables, les extraits de code, les liens, les nombres, les noms techniques et les anomalies de mise en forme. La passe éditoriale a corrigé **770 entrées**.

| Locale | Entrées corrigées |
| --- | ---: |
| Arabe du Hedjaz (`acw`) | 60 |
| Arabe de Taëz et d’Aden (`acq`) | 92 |
| Hongrois (`hu`) | 78 |
| Sadri (`sck`) | 72 |
| Oromo oriental (`hae`) | 66 |
| Pidgin camerounais (`wes`) | 53 |
| Arabe mésopotamien du Nord (`ayp`) | 61 |
| Mooré (`mos`) | 128 |
| Min du Nord (`mnp`) | 86 |
| Sylheti (`syl`) | 74 |

La révision a privilégié les aperçus, les autorisations d’outils, les confirmations de suppression, la mémoire et les messages de confidentialité. Elle a rétabli les liens de configuration des fournisseurs en arabe de Taëz et d’Aden et en mooré, séparé des libellés fusionnés en minbei et distingué des messages différents traduits à l’identique en mooré. Les aides techniques reprennent les noms, valeurs et prérequis de la référence actuelle.

Les sept adaptations partielles reprennent encore le registre écrit de leur base pour la majorité des clés. Les trois catalogues traduits par des modèles locaux restent des brouillons. La relecture par des locuteurs natifs reste ouverte pour les dix ajouts.

Le build Web **1.0.2** reprend ces catalogues sur la branche principale. Les 49 libellés Auto Tune propres à cette version ont été complétés dans les seize catalogues ajoutés depuis le dernier build Web public.

## Extension à 110 langues et variantes — 11 novembre 2026

Ce lot a porté l’inventaire à **110 locales d’interface sélectionnables**, avec **2 435 clés par catalogue** dans **15 espaces de noms**. Les six nouvelles locales couvrent le sélecteur, le choix au démarrage, la mémorisation de la préférence et les commandes du mode Auto.

| Rang de référence 2025 | Langue ou variante | Locale | Écriture et sens | Traduction |
| ---: | --- | --- | --- | --- |
| 101 | Dakhini (du Deccan) | `dcc` | Arabe, RTL | Adaptation partielle de l’ourdou écrit |
| 102 | Bajjika | `vjk` | Devanagari, LTR | Adaptation partielle du maïthili écrit |
| 103 | Luganda | `lg` | Latin, LTR | Brouillon Google Traduction et corrections éditoriales |
| 104 | Arabe de Sanaa | `ayn` | Arabe, RTL | Adaptation partielle de l’arabe standard |
| 105 | Arabe tunisien | `aeb` | Arabe, RTL | Adaptation partielle de l’arabe standard |
| 107 | Kituba (RDC) | `ktu` | Latin, LTR | Brouillon Google Traduction et corrections éditoriales |

L’ordre prolonge la [compilation communautaire de 2025](https://www.jetpunk.com/user-quizzes/2026529/top-200-languages-ethnologue-2025) utilisée pour la feuille de route historique. Le tchèque, classé 106ᵉ, figure déjà au sélecteur.

### Relecture éditoriale des six catalogues

Les **14 610 entrées** ont été comparées à la référence anglaise pour contrôler les variables, les extraits de code, les liens, les nombres, les noms techniques et les anomalies de mise en forme. La passe éditoriale a corrigé **451 entrées**.

| Locale | Entrées corrigées |
| --- | ---: |
| Dakhini (`dcc`) | 74 |
| Bajjika (`vjk`) | 89 |
| Luganda (`lg`) | 57 |
| Arabe de Sanaa (`ayn`) | 72 |
| Arabe tunisien (`aeb`) | 74 |
| Kituba (`ktu`) | 85 |

La relecture a privilégié les commandes courantes, la conversation, la voix, les aperçus, les confirmations de suppression et les autorisations des outils. Les aides de création image, musique et vidéo reprennent les réglages de la référence actuelle. Les noms de produits et de formats sont rétablis, notamment Hugging Face et OpenAI, ainsi que les noms d’exécutables tels que `imageio-ffmpeg`.

Le dakhini, le bajjika, l’arabe de Sanaa et l’arabe tunisien restent des **adaptations partielles**. Les parcours principaux sont davantage régionalisés et de nombreuses chaînes reprennent encore la base écrite. Les six catalogues sont complets sur le plan des clés. La relecture par des locuteurs natifs reste ouverte.

## Extension des catalogues — 6 novembre 2026

**Second contrôle des 24 ajouts :** 68 064 chaînes de catalogues et fragments README parcourus ; au moins 245 couples langue/texte repris, dont 329 occurrences JSON et 22 fragments README. Les contrôles supplémentaires ne détectent plus les anomalies recherchées. Les 1 118 tests ciblés passent ensemble, ainsi que TypeScript. Les sept adaptations régionales restent partielles : les essais locaux supplémentaires ne permettent pas de revendiquer une finition dialectale complète. Voir [le bilan approfondi](../deliverables/languages-104-2026-11-06/RAPPORT.md#deuxième-contrôle-complet-demandé).

**104 langues et variantes sélectionnables dans les sources**, avec **2,435 clés chacune** dans 15 espaces de noms. Le lot demandé vise 104 locales ; 24 ajouts sont intégrés et 0 restent ouverts. Les contrôles de clés, variables et code ne constituent pas une validation linguistique native. Voir [le détail du lot](#next-24).
## README du dépôt — 120 langues et variantes — 11 novembre 2026

Le sélecteur partagé donne accès aux **120 README**. Les seize nouveaux fichiers reprennent les rubriques, tableaux et liens techniques des versions existantes. Les notes de version antérieures restent datées. Le lien en tête de chaque README mène à Novera Web 1.0.2.

[دکنی](../README.dcc.md) · [बज्जिका](../README.vjk.md) · [Luganda](../README.lg.md) · [عربي صنعاني](../README.ayn.md) · [تونسي](../README.aeb.md) · [Kituba](../README.ktu.md) · [عربي حجازي](../README.acw.md) · [عربي تعزّي–عدني](../README.acq.md) · [Magyar](../README.hu.md) · [सादरी](../README.sck.md) · [Afaan Oromoo (Bahaa)](../README.hae.md) · [Kamtok](../README.wes.md) · [عربي شمال بلاد الرافدين](../README.ayp.md) · [Mòoré](../README.mos.md) · [閩北語](../README.mnp.md) · [সিলেটি](../README.syl.md).

Les fichiers en luganda, hongrois, mooré et arabe de Taëz et d’Aden sont des brouillons de traduction assistée. Le kituba est adapté à partir d’un brouillon produit en kongo écrit. Les onze autres variantes s’appuient sur les README écrits les plus proches. Les introductions ont été adaptées et les passages techniques douteux dans les brouillons automatiques peuvent reprendre le texte source. La relecture native reste ouverte.

Contrôle des seize ajouts : les neuf tableaux et leurs 134 lignes, les titres, les ancres et les liens locaux ont été vérifiés. Les noms de fournisseurs sont conservés, les valeurs numériques des tableaux ont été contrôlées et les indications sur le Web ont été alignées sur la version publique 1.0.2. Les passages automatiques répétitifs ont été repris ou remplacés par le passage anglais de référence. La qualité linguistique régionale reste à valider.

## README du dépôt — 80 langues et variantes — 4 novembre 2026

[English](../README.md), [Français](../README.fr.md), [Español](../README.es.md), [Deutsch](../README.de.md), [Italiano](../README.it.md), [Português (Brasil)](../README.pt-BR.md), [Русский](../README.ru.md), [简体中文](../README.zh-CN.md), [日本語](../README.ja.md), [العربية](../README.ar.md), [हिंदी](../README.hi.md), [বাংলা](../README.bn.md), [اردو](../README.ur.md), [मराठी](../README.mr.md), [తెలుగు](../README.te.md), [தமிழ்](../README.ta.md), [Kiswahili](../README.sw.md), [Hausa](../README.ha.md), [Tagalog](../README.tl.md), [فارسی (ایران)](../README.fa-IR.md), [አማርኛ](../README.am.md), [ไทย](../README.th.md), [Basa Jawa](../README.jv.md), [Bahasa Indonesia](../README.id.md), [Polski](../README.pl.md), [Tiếng Việt](../README.vn.md), [繁體中文](../README.zh-TW.md), [Čeština](../README.cs.md), [한국어](../README.ko.md), [Català](../README.ca.md), [ગુજરાતી](../README.gu.md), [ಕನ್ನಡ](../README.kn.md), [Yorùbá](../README.yo.md), [မြန်မာ](../README.my.md), [Lingála](../README.ln.md), [ଓଡ଼ିଆ](../README.or.md), [Українська](../README.uk.md), [മലയാളം](../README.ml.md), [ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ)](../README.pa.md), [Nederlands](../README.nl.md), [Naijíriá Píjin](../README.pcm.md), [مصري](../README.arz.md), [پنجابی (شاہ مکھی)](../README.pnb.md), [Português (Portugal)](../README.pt-PT.md), [粵語](../README.yue.md), [吴语（上海话）](../README.wuu.md), [عربي شامي](../README.apc.md), [عربي سوداني](../README.apd.md), [भोजपुरी](../README.bho.md), [晋语](../README.cjy.md), [閩南語](../README.nan.md), [دارجة جزائرية](../README.arq.md), [客家話](../README.hak.md), [الدارجة المغربية](../README.ary.md), [湘语](../README.hsn.md), [سنڌي](../README.sd.md), [Basa Sunda](../README.su.md), [Ìgbò](../README.ig.md), [دری](../README.prs.md), [नेपाली](../README.ne.md), [Bahasa Melayu](../README.ms.md), [O‘zbekcha (shimoliy)](../README.uzn.md), [isiZulu](../README.zu.md), [عربي صعيدي](../README.aec.md), [پښتو (شمالي)](../README.pbu.md), [Oromoo (Giddugaleessa-Lixaa)](../README.gaz.md), [سرائیکی](../README.skr.md), [Soomaali](../README.so.md), [Română](../README.ro.md), [অসমীয়া](../README.as.md), [Sinugbuanon](../README.ceb.md), [Қазақша](../README.kk.md), [සිංහල](../README.si.md), [isiXhosa](../README.xh.md), [ខ្មែរ](../README.km.md), [Afrikaans](../README.af.md), [मैथिली](../README.mai.md), [Wolof](../README.wo.md), [Kurmancî](../README.kmr.md), [Ikinyarwanda](../README.rw.md).

Les 80 langues et variantes de l’inventaire disposent d’un README complet. Le sélecteur commun, en haut de chaque version, donne accès aux 80 fichiers depuis la page du dépôt. Les versions reprennent les 13 rubriques principales, la sous-rubrique et les neuf tableaux du README anglais ; les guides liés conservent leur langue d’origine. Le fichier allemand existant conserve son nom `README.de.md` pour la locale d’interface `de-DE`.

Traductions assistées par Google Traduction et par le modèle local Nemotron-3.5-Bolt-E4B pour les variantes régionales et les corrections. Les adaptations régionales écrites sont signalées séparément ; elles ne constituent pas une certification dialectale. Contrôles de structure Markdown, liens, images, code, noms techniques, ancres, écriture attendue et adresse Bitcoin ; relecture native et adaptation régionale encore nécessaires. Les variantes RTL suivent la direction déclarée dans l’inventaire. Ce travail documentaire ne modifie pas les 80 catalogues de l’application ni leur inventaire de clés.

### Relecture technique et éditoriale — 4 novembre 2026

Une passe assistée sur les 80 README corrige des contresens de traduction : modèles de test non entraînés devenus des luminaires ou accessoires, données synthétiques, vérification arithmétique, interpréteur Python, backend CUDA Attention et médiane des mesures. Les unités du benchmark sont explicitées et les cinq modes s’appuient sur les libellés des catalogues existants, avec correction des faux amis (« Auto » traduit par automobile) et des séparateurs parasites. Des dates mal traduites et du texte corrompu sont corrigés ; les fragments contenant des identifiants temporaires en cantonais, népalais, sindhi et pachto sont remplacés à partir de leur texte source. Le paragraphe kinyarwanda sur les composants gérés est réécrit pour rétablir ses informations techniques.

Les contrôles locaux passent sur les 80 fichiers : structure Markdown, 13 titres de niveau 2 et un de niveau 3, neuf tableaux, 124 lignes et 277 cellules de données par version ; mêmes destinations et multiplicités des liens/images, mêmes blocs et fragments de code, sélecteurs complets et conteneurs RTL conservés. Les mesures 402,7 / 312,5 / 146,9 sont préservées ; aucun identifiant temporaire détecté ne subsiste. Cette passe éditoriale ne constitue pas une validation par 80 locuteurs natifs ; les formulations et adaptations régionales restent à relire par leurs communautés.

## Composants gérés — 1er novembre 2026

Inventaire actuel : **80 catalogues × 2 429 clés**, dans les mêmes 15 espaces de noms. Dix-sept nouvelles clés `common.components` couvrent le parcours des environnements privés, tailles interpolées, confirmation, maintenance et erreurs. Les aides runtime du Hub et l'aide d'upscale renvoient vers Configurations ; les mentions imposant Python 3.15.1 ont été retirées des aides média concernées. Les traductions existantes sans rapport sont conservées.

Contrôle structurel et variables sans erreur. Revue du français, variantes régionales rédigées et test visuel du panneau français/allemand/arabe RTL, dont 360 px sans débordement. Traductions assistées ; une relecture native complète reste nécessaire. Les résultats ne certifient pas le nouveau binaire.

## Infobulles et unités de durée — 29 octobre 2026

Inventaire courant : **80 catalogues × 2 402 clés**. Les clés courtes `chat:send` et `common:modelSettings.label` affichent « Envoyer » et « Paramètres du modèle » en français, avec une valeur explicite dans chaque langue. Le titre des paramètres garde séparément le nom du modèle. Les unités de secondes absentes et plusieurs unités de minutes erronées sont corrigées ; les tests vérifient secondes, minutes et heures dans les 80 catalogues réels. Les commandes déplacées autour du tableau de bord réutilisent leurs traductions existantes. Contrôle structurel sans erreur ; relecture native et vérification visuelle du binaire restent distinctes.

## Audit global de l’interface et quantités — 29 octobre 2026

Les **80 catalogues** contiennent explicitement les **2 400 clés** de la
référence anglaise dans 15 espaces de noms, dont 616 nouvelles entrées `ui`.
Menus, configurations, paramètres et métadonnées des modèles/fournisseurs,
aides de dépendances, progression et menu de notification utilisent les
catalogues. Les formes plurielles suivent les catégories Intl de chaque langue.
Les noms techniques et textes personnalisés conservent leur écriture propre.

Images, musique et vidéo disposent d’une quantité indépendante **de 1 à 10,
1 par défaut**, placée après la graine dans les panneaux locaux et proposée
aussi pour le cloud. Les tâches se suivent, libèrent leurs ressources avant la
suivante et s’arrêtent sur annulation ou erreur. L’aide explique ce fonctionnement
dans chaque langue. Les aides générales distinguent langue d’interface et langue
de réponse, et rappellent les vérifications utiles pour choisir un modèle.

Les compléments sont des traductions automatiques Google/Microsoft, des
brouillons du modèle local et des adaptations de l’assistant, vérifiés pour clés, variables, code et valeurs
techniques. Seuls les textes publics d’interface ont été transmis aux services.
Les contributions existantes sont conservées ; les phrases restées entièrement
anglaises sont complétées. **Couverture technique complète, relecture native
encore requise** : aucune certification linguistique ou dialectale nouvelle.
Les limites historiques des variantes décrites plus bas demeurent applicables.

Voir le [rapport détaillé](../deliverables/interface-audit-2026-10-29/RAPPORT.md).
Aucune compilation n’a été lancée ; le mainteneur compile et vérifie le binaire.

## Aide de structuration musicale — 28 octobre 2026

Un libellé `chat:creation.musicLyricsGuide` est ajouté dans les **80 locales**, avec interpolation du nom local du réglage Instrumental. Il explique style/voix, placement des paroles et activation du chant ; les balises `[Intro]`, `[Verse]`, `[Chorus]`, `[Bridge]`, `[Outro]` restent des identifiants de structure invariants. Aucune parole de l'échange n'est incluse dans l'aide. Inventaire courant : **1 769 clés** ; contrôle structurel et tests des catalogues réussis. Traductions rédigées/adaptées localement, avec conventions écrites communes des variantes existantes ; relecture native encore nécessaire.

## Commandes des lecteurs — 28 octobre 2026

Six libellés `chat:player` ajoutés aux **80 locales** : lecture, pause, position de lecture, sourdine, volume et vitesse. Les commandes image/agrandissement et l'erreur média réutilisent les traductions existantes. Inventaire courant : **1 768 clés par catalogue**, contrôle structurel sans erreur et suite de catalogues réussie. Noms de fichiers avec direction automatique, chronologie numérique LTR et disposition des commandes selon la langue. Les variantes écrites communes arabes/chinoises/persanes suivent les conventions existantes ; relecture native et contrôle visuel RTL encore nécessaires. Aucun service de traduction ni contenu utilisateur transmis.

## Catalogue musical cloud — sources locales du 27 octobre 2026

Les menus et contrôles musicaux cloud réutilisent les traductions existantes des **80 locales**, base **1 762 clés**. Fournisseurs, modèles, formats audio et CPU sont des identifiants techniques invariants ; les noms de modèles gardent `dir="auto"`. Aucun nouveau texte d'interface non traduit ni nouvelle clé. Les langues chantées dépendent du modèle distant et ne sont pas assimilées aux 80 langues de l'interface. Contrôle structurel sans erreur, sans nouvelle certification linguistique ni publication.

## Auto multilingue — correction locale du 27 octobre 2026

Les indicateurs Auto, les quatre sorties et les réglages musicaux réutilisent les libellés traduits des **80 locales**, sans nouvelle clé : base **1 762 clés**. Un vocabulaire local de commandes et de sorties couvre ces 80 locales ; exemples musicaux, sorties explicites traduites et régressions texte/image/vidéo sont testés indépendamment de la langue d'interface. Les variantes écrites communes arabes/chinoises/persanes suivent les regroupements précédents ; relecture native et adaptation dialectale restent nécessaires. Les unités temporelles proviennent des formes publiques Intl et les chiffres usuels sont normalisés. Les noms techniques des modèles restent invariants et leur direction est automatique. Cette couverture structurelle et ces exemples ne certifient pas toutes les formulations naturelles. Aucun contenu privé transmis à un traducteur ni service de classification, aucune publication.

## Musique et installation globale — sources locales du 27 octobre 2026

Seize clés ajoutées dans chacune des **80 locales** : Musique, durée, qualité, instrumental, paroles, rôles musicaux, installation automatique, configuration en cours, stockage/manque d'espace et explications propres aux quatre sections. Base courante : **1 762 clés dans 14 espaces de noms**, sans erreur structurelle. Les descriptions françaises et anglaises sont rédigées ; les autres descriptions composent les rôles et commandes traduits avec les spécifications publiques invariantes des modèles. Traductions rédigées/adaptées par l'assistant ; variantes écrites communes selon les correspondances précédentes, relecture native encore nécessaire. Les noms de modèles, quantifications et dépendances restent invariants. Aucun contenu privé transmis ni certification linguistique nouvelle, aucune publication.

## Finalisation de la vidéo — correction locale du 27 octobre 2026

Le libellé de finalisation de la vidéo est ajouté dans chacune des **80 locales**. Les libellés existants de chargement et de création en cours restent utilisés selon la phase réelle. Base courante : **1 746 clés**, contrôle structurel sans erreur. Traductions rédigées/adaptées par l’assistant ; relecture native encore nécessaire, sans certification linguistique ni nouvelle publication.

## Durée vidéo et assemblage — correction locale du 27 octobre 2026

Deux textes supplémentaires dans les **80 locales** : durée vidéo et explication des clips courts assemblés, raccords visibles possibles et temps de génération long. Base courante : **1 745 clés par catalogue**, 14 espaces de noms ; contrôle structurel sans erreur. Traductions rédigées/adaptées par l’assistant, avec variantes écrites communes comme dans les lots antérieurs ; relecture native encore nécessaire. Aucun contenu utilisateur envoyé à un service de traduction. Sources locales uniquement, publication suspendue.

## Guide de l’éditeur officiel — correction locale du 27 octobre 2026

Une clé ajoutée dans toutes les langues déjà disponibles précise que les trois catégories d’instructions de Novera se modifient uniquement depuis le carnet du tableau de bord. Le chemin utilise les libellés traduits d’accueil et de gestion des instructions ; la variable `{{path}}` est conservée dans les 80 catalogues. Base locale : **1 743 clés par catalogue**. Brouillons rédigés/adaptés par l’assistant ; variantes écrites communes selon le périmètre déjà documenté, relecture native encore nécessaire. Aucun contenu privé transmis à un traducteur. Les sources distantes restent au lot précédent : cette correction n’est pas publiée.

## Autorisations dans toutes les langues disponibles — 27 octobre 2026

Quatre textes publics ajoutés dans chacune des 80 locales : lecture seule, demander avant modification/suppression, autoriser ces changements, et choix d’accès au dossier. La base courante passe à **1 742 clés par catalogue**, dans 14 espaces de noms. Les autres commandes de projets, autorisations et vidéo réutilisent les traductions existantes.

Ces quatre textes sont des brouillons rédigés/adaptés par l’assistant, sans nouvelle certification Google, Microsoft ou Lara. Les variantes arabes/chinoises utilisent leur terminologie technique écrite commune ; dari et saraiki suivent les formulations techniques documentées des catalogues associés. Leur adaptation vernaculaire complète et la relecture native restent ouvertes. Le validateur confirme les clés et les variables, pas la qualité linguistique. Aucun fichier utilisateur ni conversation transmis à un service de traduction pour ce lot.

## Dix nouveaux catalogues — 27 octobre 2026

Les sources proposent désormais **80 locales**, chacune couvrant **1738 clés** dans **14 espaces de noms**. Ce lot ajoute cebuano, kazakh, cingalais, xhosa, khmer, afrikaans, maïthili, wolof, kurmandji et kinyarwanda. Il suit l’ordre de la feuille de route parmi les langues accessibles avec les services demandés. Les variantes non explicitement disponibles ne sont pas remplacées par une langue proche.

L’accès direct testé de Microsoft a renvoyé HTTP 401, mais son interface web fonctionne sans compte, par lots de 1 000 caractères. Google Translate a fourni les neuf premiers catalogues et la majeure partie du kinyarwanda (kurmandji : code de service `ku`). Après une limitation HTTP 429 de Google, Microsoft a fourni les 221 textes distincts restants en kinyarwanda, avec reprise des lignes rejetées et clarification de plusieurs termes IA. Deux commandes courtes ont reçu une correction éditoriale de l’assistant. Tous ces catalogues restent des brouillons. Variables, code, marques et sauts de ligne sont protégés. La relecture native reste nécessaire ; présence des clés et validation technique ne constituent pas une certification linguistique. Les nouveaux catalogues ne sont pas inclus dans le précédent binaire Windows ; aucune compilation ni publication de binaire pour ce lot.

Les essais Lara sans clé sont séparés : ils ne certifient aucun catalogue et n’ajoutent pas les six langues rares à ce lot. Les langues à traiter restent notamment gan, pachto du Sud, magahi, arabes najdi/mésopotamien, peul du Nigéria et chhattisgarhi, ce dernier restant hors du lot de dix catalogues. Les six essais Lara ont renvoyé du texte sans compte ni clé ; le magahi contenait un fragment parasite `WithOptions`. Ces essais courts ne prouvent pas la capacité gratuite à traiter six catalogues entiers.


Validation locale du lot : **589 tests réussis dans sept fichiers**, TypeScript sans émission et contrôle de **80 × 1 738 clés**, sans erreur. Aucun contrôle CI ni binaire supplémentaire.

## Consignes par catégorie et panneau compact — 26 octobre 2026

Quatre clés ajoutées dans chacune des 70 locales : le libellé compact de mémoire et les trois consignes par défaut Texte/Image/Vidéo, soit **210 consignes traduites**. Base actuelle : **1 738 clés**. Les instructions par défaut suivent la langue de l’interface ; les textes personnalisés restent inchangés. Réinitialiser, Annuler et Sauvegarder réutilisent les libellés existants. Les indications techniques ON/OFF et ×2/×4 restent identiques dans les langues, comme sur le panneau de référence.

Le contrôle des catalogues et 70 vérifications directes des consignes à l’exécution passent, avec tests de changement de langue et de remise à zéro. Les variantes arabes/chinoises conservent une terminologie technique écrite commune avec des formulations adaptées. Aucune conversation ni clé privée utilisée pour les traductions. Relecture native toujours nécessaire. Le lot est inclus dans un build Windows local ; il ne constitue pas une publication de binaire.


## Partage et dimensions média — 26 octobre 2026

Trente libellés ajoutés dans chacune des 70 locales : sélection/aperçu/format/partage, copie de fichier et aide Linux, ratio/résolution/personnalisé et ajustement automatique. Base de ce lot : **1 734 clés**. Anglais/français rédigés directement, pidgin adapté ; autres traductions assistées à partir des seules chaînes publiques de l’interface. Les variantes techniques arabes/chinoises partagent une terminologie ; saraiki et pendjabi occidental conservent leur écriture arabe. Aucun contenu de conversation ni identifiant transmis. La couverture et les variables sont contrôlées ; une relecture native reste nécessaire. Aucun nouveau binaire compilé pour ce lot.

## Graines et agrandissement d’image — 26 octobre 2026

Quinze nouveaux textes dans chacune des 70 locales portent la base à **1 704 clés** : modes de graine, valeur précédente/réutilisation, indication 2048 × 2048, facteur et modèle Real-ESRGAN, installation et aide/erreur de l’agrandissement optionnel. Les boutons Automatique et Parcourir réutilisent leurs traductions existantes. Brouillons rédigés/adaptés pour ce lot ; les variantes arabes et chinoises partagent une terminologie technique avec des formulations adaptées. Couverture complète des clés, sans certification ni relecture native. Pas de données privées transmises à un service de traduction. Le contrôle des 70 catalogues et des variables/littéraux passe ; aucun nouveau binaire compilé.

## Gestion mémoire — 26 octobre 2026

Huit nouveaux textes dans chacune des 70 locales portent la base actuelle à **1 689 clés** : titre du réglage, Automatique recommandé, Manuel parallèle, descriptions, conservation des données, attente/libération et échec. Le même composant traduit est utilisé dans la discussion et les paramètres généraux. Les changements concernent les sources ; aucune nouvelle application n’est compilée ici. Relecture native toujours nécessaire.

## Installation groupée et progression — 26 octobre 2026

Treize nouveaux textes dans chacune des 70 locales, plus correction du conseil devenu périmé sur la validation Vulkan du trio. Base : **1 681 clés**. Confirmation, dossier/espace, aide sur les discussions et créations pendant le téléchargement, pause/reprise, vérification, état prêt, moteur intégré et erreurs traduits. La bibliothèque Image/Vidéo réutilise les textes d’import, modification et suppression déjà traduits. Réalisé sans transmettre de conversation, clé ou fichier privé à un service de traduction ; la relecture native reste nécessaire. La couverture porte sur les sources, pas sur un nouveau binaire compilé.

État des sources du **27 octobre 2026** : **80 locales sélectionnables**, chacune à **1 762/1 762 clés anglaises (100 %)** dans **14 espaces de noms**. Cette mesure porte sur la présence des clés, pas sur la qualité linguistique ; la relecture native reste nécessaire. Les langues comprises et produites par l’IA dépendent du modèle choisi. Les nombres des lots antérieurs ci-dessus restent leurs instantanés historiques.

Le sélecteur présente les **80 langues sous leur nom natif**. Les attributs `lang` et `dir="auto"` accompagnent chaque entrée ; un menu élargi et défilant conserve les noms longs accessibles. Le nom indonésien est **Bahasa Indonesia**. Les noms de marques et identifiants API restent des littéraux invariants ; le premier lot de fournisseurs et d’icônes du 26 octobre réutilisait les traductions existantes. Le lot de création cloud décrit ci-dessous actualise ensuite les 70 catalogues de discussion.

## Sélecteur et création cloud — 26 octobre 2026

25 clés ajoutées et quatre textes de création actualisés dans les 70 catalogues, portant la base de 1 620 à **1 645**. Filtres, sorties, entrées, clé requise, aperçu, facturation/arrêt cloud et erreurs ont leurs traductions. Anglais/français rédigés directement, pidgin nigérian adapté ; autres textes assistés avec correspondances documentées aux langues écrites communes pour les variantes non fournies par le service. Saraiki reste partiellement fondé sur la terminologie shahmukhi commune. Couverture complète ne signifie pas certification linguistique ; relecture native requise. Aucun texte utilisateur ni identifiant transmis pour cette traduction de chaînes publiques. Aucun nouveau binaire ni publication.

## Réglages GGUF image — 26 octobre 2026

Huit clés ajoutées et trois aides de création mises à jour dans les 70 locales : moteur, exécutable, modèle de diffusion GGUF, encodeur Qwen3 GGUF, VAE, guidage et diagnostic de rôle. Base actuelle **1 653 clés**. Même méthode de traduction et mêmes limites de relecture native que le lot cloud précédent ; aucun texte de conversation ni fichier du mainteneur transmis au service de traduction.

## Formats mixtes et préparation NVFP4 — 26 octobre 2026

Six aides et libellés actualisés dans les 70 catalogues de discussion : choix indépendants GGUF/Safetensors, préparation NVFP4, conservation des originaux et coût disque/RAM. Aucune nouvelle clé : base inchangée à **1 653**. Anglais/français rédigés directement, pidgin adapté, autres textes assistés avec les mêmes correspondances de variantes et limites de relecture que les lots précédents. Aucun fichier ni texte personnel du mainteneur envoyé au service de traduction.

## Règle pour tout texte visible

Tout texte d’interface ajouté **ou modifié** doit être traduit dans les 80 locales dans la même modification : boutons, infobulles, menus, aides, confirmations, succès et erreurs. Le repli anglais ne remplace pas une traduction. Préserver variables, littéraux de code et identifiants techniques ; actualiser [language-support.json](language-support.json) puis exécuter depuis la racine :

```sh
python scripts/check-novera-locales.py
```

Le contrôle couvre JSON, espaces de noms, clés complètes/non vides, variables, littéraux et enregistrement des locales. Les 70 catalogues sont inclus dans la compilation Windows locale terminée le 26 octobre ; aucun binaire public n’est diffusé. Voir [l’état du build](../TABLEAU_DE_BORD_NOVERA.md).

## Compléments récents

Les modes de création dans la discussion ajoutent **33 textes** dans chacune des 70 locales : contrôles, paramètres, progression, sauvegarde, variantes et erreurs. Base locale actuelle : **1 620 clés**. Français et pidgin rédigés directement ; autres traductions assistées et variantes écrites selon les correspondances déjà documentées (saraiki : terminologie partagée avec le pendjabi shahmukhi pour ce lot). Les diagnostics techniques détaillés restent dans la console locale, les erreurs visibles utilisent les messages traduits. Relecture native requise. Ce lot n’est ni compilé dans l’application ni publié sur le dépôt.

Le 26 octobre, les catégories, le diagnostic et les conseils du Hub ajoutent **71 clés** dans chacune des 70 locales, portant alors la base de 1 516 à **1 587**. Les correctifs de pagination et de badge réutilisent ces traductions. Textes français rédigés directement, autres brouillons assistés et adaptations éditoriales selon les catalogues ; relecture native requise. Contrôle des 70 catalogues réussi. Les chiffres des ajouts datés ci-dessous restent historiques.

Le wu a reçu 757 traductions manquantes en conservant les 756 entrées existantes. Les 16 catalogues hérités encore incomplets ont reçu 9 219 traductions dans 176 fichiers, avec autorisation explicite d’utiliser Google Translate, puis 98 corrections ciblées. Deux anciens messages italien et polonais ont été corrigés pour leurs variables. Le libellé plat obsolète `common.preview` a été archivé avant remplacement par les messages imbriqués ; les autres anciennes clés supplémentaires ont été conservées.

Ces compléments portaient la base à 1 513 clés ; les trois nouveaux textes DSpark et suivi des erreurs indisponible ajoutent 108 traductions et portent chaque catalogue à **1 516**. Rapports vérifiables : [wu](../deliverables/wuu-completion-2026-10-25/report.md), [16 catalogues](../deliverables/locale-completion-2026-10-25/report.md). Les anciens comptes dans ces rapports décrivent leur étape historique.

## Quatre nouvelles langues — 25 octobre 2026

Gujarati (`gu`), kannada (`kn`), arabe levantin (`apc`) et arabe soudanais (`apd`) ajoutent **6 064 entrées**, avec **1 516 clés dans 14 fichiers chacune**. Elles sont enregistrées dans le sélecteur, les réglages persistants et la détection de langue système. Les deux variantes arabes utilisent la direction droite à gauche dans le document et les menus/dialogues ; les dates et nombres utilisent des locales arabes régionales compatibles avec Intl.

Le gujarati et le kannada sont des brouillons assistés par Google Translate, avec protection des variables/littéraux et correction des libellés courants. Pour les deux variantes arabes, les traductions techniques communes proviennent du catalogue arabe existant ; les consignes et messages sont adaptés séparément au registre levantin/soudanais. Ce sont des variantes éditoriales à relire, pas une traduction dialectale Google : [langues du service](https://docs.cloud.google.com/translate/docs/languages). Les codes et leur correspondance à l’arabe suivent les [données Unicode CLDR](https://cldr-smoke.unicode.org/cldr/charts/49/supplemental/language_matching.html).

**Couverture des clés complète ; relecture native non effectuée.** Les anciens catalogues ne sont pas modifiés. Aucun nouveau binaire n’est construit pour cet ajout.

## Dix langues supplémentaires — 25 octobre 2026

Yoruba (`yo`), bhojpuri (`bho`), jin/jinyu (`cjy`), min nan (`nan`), birman (`my`), arabe algérien (`arq`), hakka (`hak`), lingala (`ln`), arabe marocain (`ary`) et odia (`or`) ajoutent **15 160 entrées dans 140 fichiers**. Les 50 catalogues ont chacun les 1 516 clés anglaises actuelles. Les choix sont reliés au sélecteur, à la persistance et à la détection système. Algérien et marocain utilisent RTL et les formats régionaux ; jin, min nan et hakka ont des formats chinois compatibles avec Intl, sans prétendre que ces formats localisent tous leurs usages régionaux.

Yoruba, bhojpuri, birman, lingala et odia : brouillons Google Translate, littéraux protégés et corrections ciblées. Les cinq autres catalogues sont des **adaptations éditoriales écrites**, avec une terminologie technique commune aux catalogues arabe/chinois existants. Ils ne constituent pas une traduction Google dans ces variantes. Les sources et limites du service sont dans la [liste officielle](https://docs.cloud.google.com/translate/docs/languages).

Pour rendre cette limite vérifiable, sur 1 516 entrées : jin en adapte 221 et en partage 1 295 avec le chinois simplifié ; min nan et hakka en adaptent chacun 325 et en partagent 1 191 avec le chinois traditionnel ; algérien et marocain en adaptent chacun 317 et en partagent 1 199 avec l’arabe technique. Les consignes de démarrage, actions et confidentialité disposent de formulations distinctes. **Clés présentes à 100 % ne signifie pas traduction vernaculaire intégrale certifiée.** La relecture et l’approfondissement par des locuteurs natifs restent nécessaires, en particulier pour ces cinq variantes. Aucun ancien catalogue ni profil utilisateur n’est modifié, aucun binaire recompilé.

## De l’ukrainien au malais — 25 octobre 2026

Ukrainien (`uk`), xiang (`hsn`), malayalam (`ml`), sindhi arabe (`sd`), pendjabi oriental gurmukhi (`pa`), soundanais (`su`), igbo (`ig`), dari (`prs`), népalais (`ne`) et malais (`ms`) ajoutent **15 160 entrées dans 140 fichiers**. Les 60 catalogues couvrent chacun 1 516 clés. Sélecteur, persistance, détection système, formats régionaux et direction sont raccordés.

Les huit catalogues autres que xiang/dari sont des brouillons assistés par Google Translate, avec littéraux protégés et corrections de libellés. Xiang : adaptation éditoriale du chinois écrit commun, **196 entrées adaptées et 1 320 partagées** avec le chinois simplifié. Dari : adaptation du persan écrit commun, **185 entrées adaptées et 1 331 partagées** avec le persan iranien. Les actions, le démarrage, DSpark et les consentements disposent de formulations propres ; cela ne certifie pas une adaptation vernaculaire intégrale. **Relecture native et approfondissement de ces deux variantes restent ouverts**, ainsi que les limites des lots précédents.

Le code `prs` se canonicalise en `fa-AF` dans Intl : le détecteur le rattache explicitement au dari, sans changer le choix persan iranien enregistré. Sindhi/dari utilisent RTL. `pa` utilise le gurmukhi ; `pa-PK` sans écriture et `pa-Arab` conservent le catalogue `pnb` en shahmukhi. Un choix système `sd-Deva` n’est pas converti silencieusement en sindhi arabe : le détecteur essaie la préférence suivante. Formats compatibles : `hsn` → `zh-CN`, `prs` → `fa-AF`, `sd` → `sd-Arab-PK`, `pa` → `pa-Guru-IN`.

Les 50 anciens catalogues restent inchangés. Ces sources ne sont pas encore compilées dans l’application.

## De l’ouzbek du Nord à l’assamais — 25 octobre 2026

Ouzbek du Nord (`uzn`, latin), zoulou (`zu`), arabe saïdi (`aec`), pachto du Nord (`pbu`), oromo du Centre-Ouest (`gaz`), saraiki (`skr`), néerlandais (`nl`), somali (`so`), roumain (`ro`) et assamais (`as`) ajoutent **15 160 entrées dans 140 fichiers**. Les **70 catalogues** couvrent les **1 516 clés**. Sélecteur, persistance, détection système, formats régionaux et menus RTL sont raccordés. Les 840 JSON des 60 catalogues précédents sont conservés.

Méthodes : brouillons assistés par Microsoft Translator, DeepL et le modèle local [MADLAD-400-3B-MT](https://huggingface.co/google/madlad400-3b-mt), avec corrections éditoriales. Le moteur local CTranslate2 utilise la [conversion int8](https://huggingface.co/cstr/madlad400-3b-ct2-int8/tree/fd0b55729c074372eb84b52b9309a00dc65c40c4) sous Apache-2.0, sans exécuter de code distant. Les essais Google ont reçu HTTP 429 et n’ont fourni aucune traduction pour ce lot. DeepL a atteint son quota gratuit ; aucun abonnement ni nouveau compte n’a été créé. Les sorties locales oromo/saraiki jugées insuffisantes n’ont pas été retenues. L’oromo combine 816 textes uniques conservés de DeepL/libellés préparés et 490 compléments éditoriaux ; aucune sortie du modèle local oromo n’est livrée. Le néerlandais conserve aussi les textes vérifiés déjà obtenus de DeepL/Microsoft. Somali, zoulou et pachto sont repris avec Microsoft après contrôle des premiers brouillons. L’ouzbek local en cyrillique est translittéré en latin. Tous restent des brouillons à relire par des locuteurs natifs.

**Saïdi et saraiki : adaptation vernaculaire encore partielle.** Sur 1 516 entrées, le saïdi en adapte 250 et en partage 1 266 avec le catalogue égyptien ; le saraiki en adapte 320 et en partage 1 196 avec le pendjabi shahmukhi. Ils disposent de toutes les clés, mais ne constituent pas deux traductions dialectales intégrales validées. L’ouzbek, le pachto et l’oromo reposent sur les langues écrites correspondantes ; une validation régionale distincte reste ouverte. La présence des clés à 100 % ne certifie pas la justesse linguistique.

La détection tient compte de la canonicalisation Intl : `uz` → `uzn`, `ps` → `pbu`, `om` → `gaz`. Une préférence explicite ouzbek cyrillique/arabe, pachto latin, oromo non latin ou pachto du Sud est laissée à la préférence suivante. Le choix sauvegardé reste prioritaire. Les métadonnées du document utilisent `uz`, `ps`, `om` ; les formats utilisent `uz-Latn-UZ`, `ps-AF`, `om-ET`, `ar-EG` et `ur-PK` pour les cinq codes régionaux concernés. Un format de repli compatible avec Intl ne vaut pas localisation régionale complète.

Validation de cet ajout : 963 tests ciblés dans 45 fichiers, TypeScript sans émission, contrôle des 70 catalogues et architecture sans erreur. Cet ajout n’avait pas reconstruit le binaire. La correction du lanceur, terminée le 26 octobre, compile désormais les 70 catalogues dans un nouveau dossier Windows local ; la relecture native reste ouverte.

<a id="system-language"></a>

## Langue système et direction

Sans préférence sauvegardée, le premier démarrage choisit la langue système prise en charge puis l’enregistre. Un changement manuel remplace ce choix pour les démarrages suivants. La correspondance linguistique appartient à l’interface ; la lecture de locale native au service de plateforme. Le réglage sauvegardé reste prioritaire.

Arabe, arabe égyptien, arabe levantin, arabe soudanais, arabe algérien, arabe marocain, arabe saïdi, pachto du Nord, saraiki, sindhi, dari, ourdou, pendjabi occidental et persan iranien utilisent une interface droite à gauche, synchronisée avec les métadonnées du document et les menus/dialogues Radix. URL, courriels et nombres techniques restent gauche à droite ; les champs de texte libre ont une direction automatique.

## Complete selector inventory

État vérifié le **11 novembre 2026** avec **120 catalogues × 2 484 clés** dans **15 espaces de noms**. Couverture structurelle complète, avec relecture native et adaptation régionale encore nécessaires.

| Locale | Language | Native selector label | Direction | English keys covered | Source |
| --- | --- | --- | --- | ---: | --- |
| `en` | English | English | LTR | 2,484 / 2,484 | Inherited from Jan |
| `bn` | Bengali | বাংলা | LTR | 2,484 / 2,484 | [Contribution 9381](https://github.com/TRON-ABS/Novera/commit/5affd45c30b10057f5f7751f5550ce148a7adcfc) |
| `ar` | Modern Standard Arabic | العربية | RTL | 2,484 / 2,484 | [Contribution 9382](https://github.com/TRON-ABS/Novera/commit/a4bca7f321e6ea296de0e9d4fa45923e6828b689) |
| `ur` | Urdu | اردو | RTL | 2,484 / 2,484 | [Contribution 9397](https://github.com/TRON-ABS/Novera/commit/8aefadf68b30506d7327e55a978c85d68607d762) |
| `pcm` | Nigerian Pidgin | Naijíriá Píjin | LTR | 2,484 / 2,484 | [Contribution 9398](https://github.com/TRON-ABS/Novera/commit/9c6f6ae3caf4c9dd85f715ca38d44157bca2a245) |
| `arz` | Egyptian Arabic | مصري | RTL | 2,484 / 2,484 | [Contribution 9400](https://github.com/TRON-ABS/Novera/commit/482d429940d2cbdb68d5a0b3c7d685667c73533b) |
| `mr` | Marathi | मराठी | LTR | 2,484 / 2,484 | [Contribution 9401](https://github.com/TRON-ABS/Novera/commit/5d1787d233aa8edb6afed65985749fd970ea5dba) |
| `te` | Telugu | తెలుగు | LTR | 2,484 / 2,484 | [Contribution 9402](https://github.com/TRON-ABS/Novera/commit/039bf57e59537eaa043ab22ddc4a75e7a5567f8b) |
| `ta` | Tamil | தமிழ் | LTR | 2,484 / 2,484 | [Contribution 9403](https://github.com/TRON-ABS/Novera/commit/df665fdf9b70d06b9f10203d53eb5167bbd21e03) |
| `sw` | Swahili | Kiswahili | LTR | 2,484 / 2,484 | [Contribution 9404](https://github.com/TRON-ABS/Novera/commit/fc7127b9e45db9bd2c150b448c15edfe23f94123) |
| `ha` | Hausa | Hausa | LTR | 2,484 / 2,484 | [Contribution 9406](https://github.com/TRON-ABS/Novera/commit/e4259f6a100b26f71fa2e775fe43c054671149d8) |
| `pnb` | Western Punjabi (Shahmukhi) | پنجابی (شاہ مکھی) | RTL | 2,484 / 2,484 | [Contribution 9408](https://github.com/TRON-ABS/Novera/commit/cef56cd697fe9edfbcc1441ae97b69f03f0ea7a6) |
| `tl` | Tagalog | Tagalog | LTR | 2,484 / 2,484 | [Contribution 9409](https://github.com/TRON-ABS/Novera/commit/9a5c67ec3631d45bf9d093523c46c239ae6f3ea7) |
| `pt-PT` | Portuguese (Portugal) | Português (Portugal) | LTR | 2,484 / 2,484 | [Contribution 9410](https://github.com/TRON-ABS/Novera/commit/feebfd09e9790284a48c4412eec8bd0a1c725d48) |
| `yue` | Cantonese | 粵語 | LTR | 2,484 / 2,484 | [Contribution 9411](https://github.com/TRON-ABS/Novera/commit/c08f3313b074d6449fb4d08f9d6a7a1a10973723) |
| `wuu` | Wu (Shanghainese) | 吴语（上海话） | LTR | 2,484 / 2,484 | [Contribution 9412](https://github.com/TRON-ABS/Novera/commit/cea04c0e641ce91656c02ca79d11db318508afa7), completed on 25 October 2026 |
| `fa-IR` | Iranian Persian | فارسی (ایران) | RTL | 2,484 / 2,484 | [Contribution 9413](https://github.com/TRON-ABS/Novera/commit/7390c493df3373aae20a3598d6942fc59db71e3c) |
| `am` | Amharic | አማርኛ | LTR | 2,484 / 2,484 | [Contribution 9414](https://github.com/TRON-ABS/Novera/commit/5834c83c2c0134af807454ba5f9d155dd0c0cfae) |
| `th` | Thai | ไทย | LTR | 2,484 / 2,484 | [Contribution 9415](https://github.com/TRON-ABS/Novera/commit/9b9a4cab272ad9b96ae52a0c9c33f3d6ca891e70) |
| `jv` | Javanese | Basa Jawa | LTR | 2,484 / 2,484 | [Contribution 9416](https://github.com/TRON-ABS/Novera/commit/ea9a66394fcbee0da167ab8776fbb857285aa865) |
| `es` | Spanish | Español | LTR | 2,484 / 2,484 | Inherited from Jan |
| `fr` | French | Français | LTR | 2,484 / 2,484 | Inherited from Jan |
| `it` | Italian | Italiano | LTR | 2,484 / 2,484 | Inherited from Jan |
| `hi` | Hindi | हिंदी | LTR | 2,484 / 2,484 | Inherited from Jan |
| `id` | Indonesian | Bahasa | LTR | 2,484 / 2,484 | Inherited from Jan |
| `pl` | Polish | Polski | LTR | 2,484 / 2,484 | Inherited from Jan |
| `vn` | Vietnamese | Tiếng Việt | LTR | 2,484 / 2,484 | Inherited from Jan |
| `zh-CN` | Chinese (Simplified) | 简体中文 | LTR | 2,484 / 2,484 | Inherited from Jan |
| `zh-TW` | Chinese (Traditional) | 繁體中文 | LTR | 2,484 / 2,484 | Inherited from Jan |
| `de-DE` | German | Deutsch | LTR | 2,484 / 2,484 | Inherited from Jan |
| `cs` | Czech | Čeština | LTR | 2,484 / 2,484 | Inherited from Jan |
| `pt-BR` | Portuguese (Brazil) | Português (Brasil) | LTR | 2,484 / 2,484 | Inherited from Jan |
| `ko` | Korean | 한국어 | LTR | 2,484 / 2,484 | Inherited from Jan |
| `ja` | Japanese | 日本語 | LTR | 2,484 / 2,484 | Inherited from Jan |
| `ru` | Russian | Русский | LTR | 2,484 / 2,484 | Inherited from Jan |
| `ca` | Catalan | Català | LTR | 2,484 / 2,484 | Inherited from Jan |
| `gu` | Gujarati | ગુજરાતી | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `kn` | Kannada | ಕನ್ನಡ | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `apc` | Levantine Arabic | عربي شامي | RTL | 2,484 / 2,484 | Novera — draft, native review pending |
| `apd` | Sudanese Arabic | عربي سوداني | RTL | 2,484 / 2,484 | Novera — draft, native review pending |
| `yo` | Yoruba | Yorùbá | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `bho` | Bhojpuri | भोजपुरी | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `cjy` | Jin Chinese | 晋语 | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `nan` | Min Nan Chinese | 閩南語 | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `my` | Burmese | မြန်မာ | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `arq` | Algerian Arabic | دارجة جزائرية | RTL | 2,484 / 2,484 | Novera — draft, native review pending |
| `hak` | Hakka Chinese | 客家話 | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `ln` | Lingala | Lingála | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `ary` | Moroccan Arabic | الدارجة المغربية | RTL | 2,484 / 2,484 | Novera — draft, native review pending |
| `or` | Odia | ଓଡ଼ିଆ | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `uk` | Ukrainian | Українська | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `hsn` | Xiang Chinese | 湘语 | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `ml` | Malayalam | മലയാളം | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `sd` | Sindhi | سنڌي | RTL | 2,484 / 2,484 | Novera — draft, native review pending |
| `pa` | Eastern Punjabi | ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ) | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `su` | Sundanese | Basa Sunda | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `ig` | Igbo | Ìgbò | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `prs` | Dari | دری | RTL | 2,484 / 2,484 | Novera — draft, native review pending |
| `ne` | Nepali | नेपाली | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `ms` | Malay | Bahasa Melayu | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `uzn` | Northern Uzbek | O‘zbekcha (shimoliy) | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `zu` | Zulu | isiZulu | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `aec` | Saidi Arabic | عربي صعيدي | RTL | 2,484 / 2,484 | Novera — draft, native review pending |
| `pbu` | Northern Pashto | پښتو (شمالي) | RTL | 2,484 / 2,484 | Novera — draft, native review pending |
| `gaz` | West Central Oromo | Oromoo (Giddugaleessa-Lixaa) | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `skr` | Saraiki | سرائیکی | RTL | 2,484 / 2,484 | Novera — draft, native review pending |
| `nl` | Dutch | Nederlands | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `so` | Somali | Soomaali | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `ro` | Romanian | Română | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `as` | Assamese | অসমীয়া | LTR | 2,484 / 2,484 | Novera — draft, native review pending |
| `ceb` | Cebuano | Sinugbuanon | LTR | 2,484 / 2,484 | Google — draft, native review pending |
| `kk` | Kazakh | Қазақша | LTR | 2,484 / 2,484 | Google — draft, native review pending |
| `si` | Sinhala | සිංහල | LTR | 2,484 / 2,484 | Google — draft, native review pending |
| `xh` | Xhosa | isiXhosa | LTR | 2,484 / 2,484 | Google — draft, native review pending |
| `km` | Khmer | ខ្មែរ | LTR | 2,484 / 2,484 | Google — draft, native review pending |
| `af` | Afrikaans | Afrikaans | LTR | 2,484 / 2,484 | Google — draft, native review pending |
| `mai` | Maithili | मैथिली | LTR | 2,484 / 2,484 | Google — draft, native review pending |
| `wo` | Wolof | Wolof | LTR | 2,484 / 2,484 | Google — draft, native review pending |
| `kmr` | Northern Kurdish (Kurmanji) | Kurmancî | LTR | 2,484 / 2,484 | Google — draft, native review pending |
| `rw` | Kinyarwanda | Ikinyarwanda | LTR | 2,484 / 2,484 | Google + Microsoft — draft, native review pending |
| `gan` | Gan Chinese | 贛語 | LTR | 2,484 / 2,484 | Partial written regional adaptation — complete keys, native regional review pending |
| `pbt` | Southern Pashto | پښتو (سوېلي) | RTL | 2,484 / 2,484 | Partial written regional adaptation — complete keys, native regional review pending |
| `mag` | Magahi | मगही | LTR | 2,484 / 2,484 | Local MADLAD — draft, native review pending |
| `ars` | Najdi Arabic | عربي نجدي | RTL | 2,484 / 2,484 | Partial written regional adaptation — complete keys, native regional review pending |
| `acm` | Mesopotamian Arabic | عراقي | RTL | 2,484 / 2,484 | Partial written regional adaptation — complete keys, native regional review pending |
| `fuv` | Nigerian Fulfulde | Fulfulde (Naajeeriya) | LTR | 2,484 / 2,484 | Local MADLAD — draft, native review pending |
| `hne` | Chhattisgarhi | छत्तीसगढ़ी | LTR | 2,484 / 2,484 | Local MADLAD — draft, native review pending |
| `tts` | Northeastern Thai (Isan) | อีสาน | LTR | 2,484 / 2,484 | Partial written regional adaptation — complete keys, native regional review pending |
| `ny` | Chichewa | Chichewa | LTR | 2,484 / 2,484 | Google/MADLAD/local — draft, native review pending |
| `bm` | Bambara | Bamanankan | LTR | 2,484 / 2,484 | Google/MADLAD/local — draft, native review pending |
| `sn` | Shona | ChiShona | LTR | 2,484 / 2,484 | Google/MADLAD/local — draft, native review pending |
| `azb` | South Azerbaijani | تۆرکجه | RTL | 2,484 / 2,484 | Partial written regional adaptation — complete keys, native regional review pending |
| `tn` | Tswana | Setswana | LTR | 2,484 / 2,484 | Google/MADLAD/local — draft, native review pending |
| `nso` | Northern Sotho | Sesotho sa Leboa | LTR | 2,484 / 2,484 | Google/MADLAD/local — draft, native review pending |
| `bar` | Bavarian | Boarisch | LTR | 2,484 / 2,484 | Local Nemotron — written regional draft, native review pending |
| `ht` | Haitian Creole | Kreyòl ayisyen | LTR | 2,484 / 2,484 | Google/MADLAD/local — draft, native review pending |
| `ug` | Uyghur | ئۇيغۇرچە | RTL | 2,484 / 2,484 | Google/MADLAD/local — draft, native review pending |
| `st` | Southern Sotho | Sesotho | LTR | 2,484 / 2,484 | Google/MADLAD/local — draft, native review pending |
| `el` | Greek | Ελληνικά | LTR | 2,484 / 2,484 | Google/MADLAD/local — draft, native review pending |
| `ctg` | Chittagonian | চাটগাঁইয়া | LTR | 2,484 / 2,484 | Partial written regional adaptation — complete keys, native regional review pending |
| `rn` | Kirundi | Ikirundi | LTR | 2,484 / 2,484 | Google/MADLAD/local — draft, native review pending |
| `dyu` | Dyula | Julakan | LTR | 2,484 / 2,484 | Google/MADLAD/local — draft, native review pending |
| `tr` | Turkish | Türkçe | LTR | 2,484 / 2,484 | [Jan #8939](https://github.com/janhq/jan/pull/8939) + assisted completion; upstream PR still open |
| `sv` | Swedish | Svenska | LTR | 2,484 / 2,484 | [Jan #8829](https://github.com/janhq/jan/pull/8829) + assisted completion; upstream PR still open |
| `dcc` | Dakhini | دکنی | RTL | 2,484 / 2,484 | Partial written adaptation from Urdu |
| `vjk` | Bajjika | बज्जिका | LTR | 2,484 / 2,484 | Partial written adaptation from Maithili |
| `lg` | Luganda | Luganda | LTR | 2,484 / 2,484 | Google Translate draft with editorial corrections |
| `ayn` | Sanaani Arabic | عربي صنعاني | RTL | 2,484 / 2,484 | Partial written adaptation from Modern Standard Arabic |
| `aeb` | Tunisian Arabic | تونسي | RTL | 2,484 / 2,484 | Partial written adaptation from Modern Standard Arabic |
| `ktu` | Kituba (DR Congo) | Kituba | LTR | 2,484 / 2,484 | Google Translate draft with editorial corrections |
| `acw` | Hijazi Arabic | عربي حجازي | RTL | 2,484 / 2,484 | Partial adaptation from Modern Standard Arabic |
| `acq` | Taʻizzi-Adeni Arabic | عربي تعزّي–عدني | RTL | 2,484 / 2,484 | NLLB draft with editorial corrections |
| `hu` | Hungarian | Magyar | LTR | 2,484 / 2,484 | MADLAD draft with editorial corrections |
| `sck` | Sadri (Nagpuri) | सादरी | LTR | 2,484 / 2,484 | Partial adaptation from Hindi |
| `hae` | Eastern Oromo | Afaan Oromoo (Bahaa) | LTR | 2,484 / 2,484 | Partial adaptation from West Central Oromo |
| `wes` | Cameroon Pidgin | Kamtok | LTR | 2,484 / 2,484 | Partial adaptation from Nigerian Pidgin |
| `ayp` | Northern Mesopotamian Arabic | عربي شمال بلاد الرافدين | RTL | 2,484 / 2,484 | Partial adaptation from Modern Standard Arabic |
| `mos` | Mooré | Mòoré | LTR | 2,484 / 2,484 | NLLB draft with editorial corrections |
| `mnp` | Northern Min Chinese | 閩北語 | LTR | 2,484 / 2,484 | Partial adaptation using traditional written Chinese |
| `syl` | Sylheti | সিলেটি | LTR | 2,484 / 2,484 | Partial adaptation from Bengali |

<a id="next-20"></a>
<a id="next-24"></a>

## Objectif 104 langues et variantes — 6 novembre 2026

La demande porte sur les **22 langues encore « À faire »** de la feuille de route initiale, plus **le turc et le suédois**, soit **80 + 22 + 2 = 104 locales** si les 24 ajouts sont intégrés. Les variantes et écritures distinctes conservent le décompte de l’inventaire actuel ; ce total ne constitue pas un classement de 104 langues par nombre de locuteurs.

**État réel des sources : 104 catalogues**, chacun à **2,429 clés**, dans 15 espaces de noms. **0 ajouts restent ouverts**. Ce décompte mesure la couverture technique ; sept catalogues sont des adaptations écrites régionales partielles, détaillées ci-dessous.

| Ordre demandé | Langue | Locale | État local |
| ---: | --- | --- | --- |
| 1 | Gan | `gan` | Intégrée — adaptation écrite partielle, clés complètes ; relecture régionale requise |
| 2 | Pachto du Sud | `pbt` | Intégrée — adaptation écrite partielle, clés complètes ; relecture régionale requise |
| 3 | Magahi | `mag` | Intégrée — brouillon complet, relecture native requise |
| 4 | Arabe najdi | `ars` | Intégrée — adaptation écrite partielle, clés complètes ; relecture régionale requise |
| 5 | Arabe mésopotamien | `acm` | Intégrée — adaptation écrite partielle, clés complètes ; relecture régionale requise |
| 6 | Peul du Nigéria | `fuv` | Intégrée — brouillon complet, relecture native requise |
| 7 | Chhattisgarhi | `hne` | Intégrée — brouillon complet, relecture native requise |
| 8 | Thaï du Nord-Est (isan) | `tts` | Intégrée — adaptation écrite partielle, clés complètes ; relecture régionale requise |
| 9 | Chichewa | `ny` | Intégrée — brouillon complet, relecture native requise |
| 10 | Bambara | `bm` | Intégrée — brouillon complet, relecture native requise |
| 11 | Shona | `sn` | Intégrée — brouillon complet, relecture native requise |
| 12 | Azéri du Sud | `azb` | Intégrée — adaptation écrite partielle, clés complètes ; relecture régionale requise |
| 13 | Tswana | `tn` | Intégrée — brouillon complet, relecture native requise |
| 14 | Sotho du Nord | `nso` | Intégrée — brouillon complet, relecture native requise |
| 15 | Bavarois | `bar` | Intégrée — brouillon complet, relecture native requise |
| 16 | Créole haïtien | `ht` | Intégrée — brouillon complet, relecture native requise |
| 17 | Ouïghour | `ug` | Intégrée — brouillon complet, relecture native requise |
| 18 | Sotho du Sud | `st` | Intégrée — brouillon complet, relecture native requise |
| 19 | Grec | `el` | Intégrée — brouillon complet, relecture native requise |
| 20 | Chittagonien | `ctg` | Intégrée — adaptation écrite partielle, clés complètes ; relecture régionale requise |
| 21 | Kirundi | `rn` | Intégrée — brouillon complet, relecture native requise |
| 22 | Dioula | `dyu` | Intégrée — brouillon complet, relecture native requise |
| 23 | Turc | `tr` | Intégrée — brouillon complet, relecture native requise |
| 24 | Suédois | `sv` | Intégrée — brouillon complet, relecture native requise |

Les contributions turques Jan [#8939](https://github.com/janhq/jan/pull/8939) et [#9000](https://github.com/janhq/jan/pull/9000), ainsi que la contribution suédoise [#8829](https://github.com/janhq/jan/pull/8829), sont **ouvertes et non fusionnées au contrôle du 6 novembre**. Les répertoires `tr` et `sv` sont absents du `main` de Jan contrôlé. Les textes réutilisés sont limités aux clés dont la source anglaise correspond encore ; variables et code sont contrôlés, et les compléments restent des traductions assistées. Voir [les preuves de provenance](../deliverables/languages-104-2026-11-06/upstream-audit.json).

### Limites des adaptations régionales

Les catalogues `gan`, `ars`, `acm`, `tts` et `ctg` réutilisent un registre technique écrit partagé, respectivement depuis `zh-TW`, `ar`, `ar`, `th` et `bn`. Le modèle local Nemotron a proposé des adaptations pour les actions principales, la conversation, les assistants et la configuration ; les propositions rejetées peuvent conserver la traduction écrite commune déjà contrôlée. Quelques chaînes périmées ou contenant des mélanges d’écritures ont été retraduites via Google dans le registre écrit commun. Ces catalogues ne sont donc pas des traductions entièrement vernaculaires. Les écritures et variables sont contrôlées, mais la qualité dialectale reste à faire valider.

Le brouillon local `pbt` ayant échoué à des vérifications sémantiques, il a été remplacé par une traduction Google en pachto écrit (`ps`), puis normalisé avec des conventions d’écriture du Sud. Ce processus ne constitue pas une cible Google exacte `pbt` ni une traduction vernaculaire certifiée. La même limite s’applique au README pachto. Voir [le suivi pachto](../deliverables/languages-104-2026-11-06/pashto-source.json).

Le catalogue `azb` est un brouillon écrit obtenu à partir de traductions Google en azerbaïdjanais latin, puis d’une conversion en écriture arabe avec un lexique local. Google n’a pas fourni une cible exacte `azb` ; la conversion ne certifie ni l’orthographe ni la variété régionale. Voir [la provenance de la conversion](../deliverables/languages-104-2026-11-06/azb-writing-provenance.json).

MADLAD fournit les cibles exactes `mag`, `hne` et `fuv`. Le bavarois est rédigé avec Nemotron. Les autres catalogues utilisent Google et, pour le turc et le suédois, les contributions amont compatibles. Microsoft a été contrôlé via sa liste officielle de langues ; aucune traduction Microsoft n’est revendiquée. Une relecture native reste ouverte pour tous les nouveaux brouillons. Le suivi distingue présence des clés, qualité linguistique et disponibilité dans un binaire.

<a id="roadmap-100"></a>

## Feuille de route historique des 100 langues

Le tableau de planification ci-dessous conserve ses 100 langues ; l’état d’intégration et les compteurs des catalogues sont actualisés au 6 novembre 2026. L’ordre historique est conservé ; le lot demandé de 24 ajouts est détaillé ci-dessus. Ses estimations de locuteurs mélangent les relevés 2025/2026 et ne constituent ni un classement officiel actualisé ni 100 langues prises en charge. Les 120 locales effectives sont celles de l’inventaire ci-dessus. Portugal et Brésil ont des catalogues distincts mais ne comptent pas deux langues dans ce classement.

Les statuts des PR externes correspondent au relevé historique sur Jan `44aee093ae5a974c31ec43d24ceca163c0e59c14`, sans nouvelle vérification le 25 octobre. Les contributions Novera sont intégrées. Avant toute nouvelle traduction, vérifier les contributions existantes ; une recherche par titre ne garantit pas leur absence.

| Rang | Langue | Locuteurs (millions) | Année | État | À faire, ordre | PR |
| ---: | --- | ---: | ---: | --- | ---: | --- |
| 1 | Anglais | 1 493 | 2026 | Disponible | — | — |
| 2 | Mandarin / chinois standard écrit | 1 183 | 2026 | Disponible | — | — |
| 3 | Hindi | 611 | 2026 | Disponible | — | — |
| 4 | Espagnol | 561 | 2026 | Disponible | — | — |
| 5 | Arabe standard moderne | 335 | 2026 | Intégrée dans Novera | — | [#9382](https://github.com/janhq/jan/pull/9382) |
| 6 | Français | 334 | 2026 | Disponible | — | — |
| 7 | Bengali | 274 | 2026 | Intégrée dans Novera | — | [#9381](https://github.com/janhq/jan/pull/9381) |
| 8 | Portugais | 269 | 2026 | Disponible (Brésil) ; Portugal intégré dans Novera | — | [#9410 — Portugal](https://github.com/janhq/jan/pull/9410) |
| 9 | Indonésien | 255 | 2026 | Disponible | — | — |
| 10 | Ourdou | 246 | 2026 | Intégrée dans Novera | — | [#9397](https://github.com/janhq/jan/pull/9397) |
| 11 | Russe | 210 | 2026 | Disponible | — | — |
| 12 | Allemand | 133 | 2026 | Disponible | — | — |
| 13 | Japonais | 126 | 2026 | Disponible | — | — |
| 14 | Pidgin nigérian | 121 | 2026 | Intégrée dans Novera | — | [#9398](https://github.com/janhq/jan/pull/9398) |
| 15 | Arabe égyptien | 118 | 2026 | Intégrée dans Novera | — | [#9400](https://github.com/janhq/jan/pull/9400) |
| 16 | Marathi | 99 | 2026 | Intégrée dans Novera | — | [#9401](https://github.com/janhq/jan/pull/9401) |
| 17 | Vietnamien | 97 | 2026 | Disponible | — | — |
| 18 | Télougou | 96 | 2026 | Intégrée dans Novera | — | [#9402](https://github.com/janhq/jan/pull/9402) |
| 19 | Swahili | 95 | 2026 | Intégrée dans Novera | — | [#9404](https://github.com/janhq/jan/pull/9404) |
| 20 | Haoussa | 94 | 2026 | Intégrée dans Novera | — | [#9406](https://github.com/janhq/jan/pull/9406) |
| 21 | Turc | 94 | 2026 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | [#8939](https://github.com/janhq/jan/pull/8939), [#9000](https://github.com/janhq/jan/pull/9000) |
| 22 | Pendjabi occidental | 90 | 2026 | Intégrée dans Novera | — | [#9408](https://github.com/janhq/jan/pull/9408) |
| 23 | Tagalog | 87 | 2026 | Intégrée dans Novera | — | [#9409](https://github.com/janhq/jan/pull/9409) |
| 24 | Tamoul | 86 | 2026 | Intégrée dans Novera | — | [#9403](https://github.com/janhq/jan/pull/9403) |
| 25 | Yue / cantonais | 86 | 2026 | Intégrée dans Novera | — | [#9411](https://github.com/janhq/jan/pull/9411) |
| 26 | Wu / shanghaïen | 83 | 2026 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | [#9412](https://github.com/janhq/jan/pull/9412) |
| 27 | Persan iranien | 82 | 2026 | Intégrée dans Novera | — | [#9413](https://github.com/janhq/jan/pull/9413) |
| 28 | Coréen | 82 | 2026 | Disponible | — | — |
| 29 | Amharique | 78 | 2026 | Intégrée dans Novera | — | [#9414](https://github.com/janhq/jan/pull/9414) |
| 30 | Thaï | 71 | 2026 | Intégrée dans Novera | — | [#9415](https://github.com/janhq/jan/pull/9415) |
| 31 | Javanais | 69 | 2026 | Intégrée dans Novera | — | [#9416](https://github.com/janhq/jan/pull/9416) |
| 32 | Italien | 66 | 2026 | Disponible | — | — |
| 33 | Gujarati | 62 | 2026 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 34 | Kannada | 59 | 2026 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 35 | Arabe levantin | 58 | 2026 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 36 | Arabe soudanais | 54 | 2026 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 37 | Yoruba | 53 | 2026 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 38 | Bhojpuri | 53 | 2026 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 39* | Jin / jinyu | 48,0 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 40* | Min nan | 45,8 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 41* | Polonais | 45,3 | 2025 | Disponible | — | — |
| 42* | Birman | 44,4 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 43* | Arabe algérien | 41,6 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 44* | Hakka | 40,7 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 45* | Lingala | 40,6 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 46* | Arabe marocain | 40,2 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 47* | Odia | 39,5 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 48* | Ukrainien | 39,0 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 49* | Xiang | 38,2 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 50* | Malayalam | 38,2 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 51* | Sindhi | 36,9 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 52* | Pendjabi oriental | 36,5 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 53* | Soundanais | 35,5 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 54* | Igbo | 33,7 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 55* | Dari | 33,4 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 56* | Népalais | 33,1 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 57* | Malais | 29,5 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 58* | Ouzbek du Nord | 29,4 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 59* | Zoulou | 27,8 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 60* | Arabe saïdi | 27,3 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 61* | Pachto du Nord | 27,2 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 62* | Oromo du Centre-Ouest | 27,0 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 63* | Saraiki | 25,6 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 64* | Néerlandais | 25,4 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 65* | Somali | 24,7 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 66* | Roumain | 23,7 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 67* | Assamais | 23,6 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; relecture requise | — | — |
| 68* | Gan | 22,6 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 69* | Pachto du Sud | 21,7 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 70* | Cebuano | 21,4 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; brouillon Google, relecture requise | — | — |
| 71* | Kazakh | 21,4 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; brouillon Google, relecture requise | — | — |
| 72* | Magahi | 21,0 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 73* | Arabe najdi | 20,9 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 74* | Cingalais | 20,2 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; brouillon Google, relecture requise | — | — |
| 75* | Arabe mésopotamien | 20,1 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 76* | Xhosa | 19,2 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; brouillon Google, relecture requise | — | — |
| 77* | Khmer | 19,0 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; brouillon Google, relecture requise | — | — |
| 78* | Afrikaans | 18,1 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; brouillon Google, relecture requise | — | — |
| 79* | Peul du Nigéria | 18,0 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 80* | Maïthili | 17,6 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; brouillon Google, relecture requise | — | — |
| 81* | Wolof | 17,3 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; brouillon Google, relecture requise | — | — |
| 82* | Kurde du Nord (kurmandji) | 17,2 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; brouillon Google, relecture requise | — | — |
| 83* | Chhattisgarhi | 16,3 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 84* | Kinyarwanda | 15,3 | 2025 | Intégrée dans Novera — 2 429/2 429 clés ; brouillon Google, relecture requise | — | — |
| 85* | Thaï du Nord-Est (isan) | 15,1 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 86* | Chichewa | 14,5 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 87* | Bambara | 14,4 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 88* | Shona | 14,1 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 89* | Azéri du Sud | 13,8 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 90* | Tswana | 13,7 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 91* | Sotho du Nord | 13,7 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 92* | Bavarois | 13,7 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 93* | Créole haïtien | 13,7 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 94* | Ouïghour | 13,6 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 95* | Sotho du Sud | 13,5 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 96* | Grec | 13,3 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 97* | Suédois | 13,3 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | [#8829](https://github.com/janhq/jan/pull/8829) |
| 98* | Chittagonien | 13,0 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 99* | Kirundi | 12,9 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
| 100* | Dioula | 12,8 | 2025 | Intégrée dans Novera — 2,429/2,429 clés ; relecture requise | — | — |
Sources : positions 1–38, [tableau 2026 attribué à Ethnologue](https://en.wikipedia.org/wiki/List_of_languages_by_total_number_of_speakers) ; positions 39–100*, [compilation communautaire 2025](https://www.jetpunk.com/user-quizzes/2026529/top-200-languages-ethnologue-2025). **Les positions marquées * sont provisoires, à confirmer ; ce tableau mélange deux années et ne constitue pas un top 100 officiel 2026.** Les variétés arabes et chinoises sont distinguées ; les deux écritures chinoises de Jan comptent ensemble ici.

## NVFP4 natif, placement, durées et conseils — 26 octobre 2026

Quinze clés ajoutées depuis la base 1 653 : quatre pour NVFP4/placement, trois pour les durées, trois pour la recommandation FLUX/Qwen et cinq pour les conseils Hub NVFP4 et GGUF texte/image/vidéo. Les aides locales existantes sont actualisées. **70 × 1 668 clés** ; anglais/français rédigés directement, pidgin adapté, autres traductions assistées avec les correspondances déjà documentées. Relecture native toujours nécessaire. Seules les chaînes publiques ont été transmises au service de traduction, aucun modèle ni prompt privé.
