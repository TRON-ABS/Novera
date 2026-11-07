# Commandes repliables et conversation vocale — sources pour 1.0.1

Retour utilisateur du 6 novembre 2026 : le premier repli visait le mauvais bloc. La saisie doit rester visible ; ce sont les commandes situées en dessous qui doivent disparaître. Le mainteneur effectuera lui-même la prochaine compilation Desktop.

## Disposition retenue

- Nouvelle discussion → commande de repli → champ de saisie → microphone → Envoyer/Arrêter.
- Les deux nouvelles commandes mesurent chacune **50 % de la largeur** des boutons Nouvelle discussion et Envoyer. Le champ conserve son comportement et ses dimensions automatiques.
- Le repli masque les modes de création, outils et réglages du bas, sans masquer la saisie, les pièces jointes, le microphone ni l'arrêt de génération. Les contrôles restent montés ; le brouillon et les sélections ne sont pas effacés.
- Repli manuel, mémorisé uniquement comme préférence d'interface. Nouvelle clé `novera.composer.controlsCollapsed` ; l'ancien état du repli incorrect de la saisie n'est pas migré. La conversation vocale n'est jamais activée automatiquement ni mémorisée comme consentement.

## Conversation vocale continue

Un clic démarre l'écoute ; une phrase reconnue est envoyée au modèle choisi par le parcours normal du chat. L'écoute se ferme pendant la génération et la lecture de la réponse, puis reprend. Le second clic arrête le mode vocal. La saisie manuelle, le changement de fil/modèle/langue, la perte de focus ou une erreur arrêtent également le mode vocal. L'arrêt du vocal ne remplace pas le bouton d'arrêt de génération.

Le mode démarre avec un modèle sélectionné, sans brouillon ni pièce jointe en attente, afin de ne pas envoyer ou écraser du contenu déjà préparé. Il concerne la discussion normale ; les surfaces agent/Cowork ne sont pas raccordées à cette boucle.

| Hôte | Traitement vocal |
| --- | --- |
| Application native Windows | Reconnaissance et synthèse par `System.Speech`, avec les moteurs et langues déjà installés. Processus caché, programme embarqué fixe, requêtes JSON sur stdin. |
| Navigateur web | Seulement si les API de reconnaissance **locale** et une voix de synthèse locale sont disponibles. Aucun repli vers une reconnaissance cloud ni installation automatique de langue. |
| Autres applications natives | Bouton traduit mais indisponible : un adaptateur natif et ses permissions restent à implémenter et valider. |

Les **104 langues concernent les libellés de l'interface**, pas une garantie de reconnaissance vocale de 104 langues. Sur ce poste, les contrôles sans enregistrement trouvent la reconnaissance `fr-FR` et la synthèse `fr-FR`/`en-US`.

## Protection des données et arrêt

- Aucun fichier audio ni journal technique de transcription n'est créé par Novera. Le texte reconnu devient un message normal, envoyé au modèle sélectionné et conservé selon le fonctionnement habituel de la discussion ; un modèle distant reçoit donc ce texte.
- Aucun contenu vocal dans la télémétrie. Aucun code utilisateur interpolé dans une commande PowerShell : le programme est fixe et les données sont transmises séparément en JSON.
- Helper Windows attaché à un job `KILL_ON_JOB_CLOSE` avant d'autoriser la capture. Annulation liée au webview et à sa session, y compris si elle précède l'enregistrement du processus. Contrôle du focus avant l'envoi de la requête au helper.
- Changement de contexte et résultats tardifs : identifiant de génération, session et contrôle du fil empêchent l'envoi d'une reconnaissance annulée ou la lecture d'une ancienne réponse d'un autre fil. Le passage de l'accueil au nouveau fil est testé.
- Pas d'écoute pendant la lecture de Novera. Inactivité bornée et délais maximums pour l'écoute, l'attente du modèle et la synthèse. Erreurs affichées par un libellé traduit, sans contenu brut de la conversation.

## Langues

`common:voiceConversation` et `common:voiceUnavailable` ajoutés aux **104 catalogues**, soit **208 textes**. Le repli réutilise les traductions existantes de Réduire/Agrandir/Commandes ; Démarrer/Arrêter restent traduits. Inventaire actualisé : **2 431 clés dans 15 espaces de noms** par catalogue. Contrôle de structure, variables, marqueurs et inventaire : zéro erreur. Les traductions assistées et adaptations régionales restent soumises à relecture native.

## Vérifications exécutées

- Vitest : **627 réussites**, zéro échec, six fichiers ciblés couvrant saisie/repli, préférence, boucle vocale, adaptateurs et catalogues.
- Rust : **3 tests réussis**, zéro échec, pour validation des données, annulation anticipée/scopée et arrêt réel d'un helper inactif possédé par le test. Aucun accès au microphone.
- TypeScript `tsc -b` et ESLint ciblé : réussis. Contrôle de compilation Rust `cargo check --offline --locked --lib` réussi ; les tests Rust ultérieurs recompilent le module final.
- Analyse syntaxique du bridge PowerShell et inventaire des langues vocales : réussis, **sans ouvrir le microphone ni jouer de son**.
- Edge headless sur serveur de développement, API de reconnaissance simulée et requêtes externes bloquées : quatre formats 1280×800, 390×844, 320×568 et 740×360. Saisie et brouillon visibles après repli, position des commandes et rapport 1:2 vérifiés, démarrage/arrêt vocal simulés et aucun débordement horizontal. [Résultats](browser-results.json), [aperçu](preview.png).
- [Bilan des contrôles](validation.json), [catalogues](locale-validation.json), [langues installées](windows-capabilities.json).

Pas de conversation avec un vrai microphone ou un vrai modèle durant ces contrôles. Pas de nouvelle compilation Desktop de livraison, d'installateur, de publication ni de modification de l'installation personnelle. Le binaire du précédent lot Desktop ne contient pas ces retouches : la prochaine compilation du mainteneur est nécessaire pour les essayer dans l'application native.

## Question sur LiquidAI/LFM3-Omni-2B-GGUF

La [fiche GGUF officielle](https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF) annonce l'entrée audio et la sortie vocale, ainsi qu'un serveur de conversation temps réel `/v1/realtime` avec llama.cpp b11960/v0.8.0 ou ultérieur. La [fiche du modèle](https://huggingface.co/LiquidAI/LFM3-Omni-2B) liste le français parmi ses langues vocales ; cette liste n'est pas celle des 104 langues d'interface de Novera.

Le moteur Novera est épinglé sur v0.9.0, mais ce prérequis de version ne démontre pas la présence du transport WebSocket dans le worker personnalisé. Le code vocal de ce lot utilise le système Windows ou les API locales du navigateur ; charger le GGUF ne remplace pas ces adaptateurs par la voix du modèle. Il reste à raccorder capture, projecteur/composants audio, session temps réel et lecture de l'audio généré. Aucun téléchargement, raccordement Omni ou essai de qualité/latence de ce modèle n'a été effectué à la suite de cette question. Il constitue un candidat d'intégration à vérifier, pas une fonction déjà validée.

## Cercles du microphone — complément du 6 novembre

- Cercle **vert** quand le bouton peut démarrer, **rouge** pendant l'écoute, l'attente, la lecture ou une réponse du modèle en cours ; **gris** si indisponible. Le rouge n'indique pas à lui seul que le microphone enregistre : les phases restent distinctes.
- Le bouton vocal actif reste cliquable pour arrêter la session. Pendant une réponse hors mode vocal, il reste désactivé. Les libellés accessibles réutilisent Démarrer, Arrêter, Chargement et Indisponible, déjà présents dans les 104 catalogues.
- Cercle de 20 px, sans modifier la largeur des boutons : vérifié dans les quatre formats précédents, y compris le bouton mobile de 22 px.
- Contrôles supplémentaires : **101 tests réussis** dans quatre fichiers, TypeScript et ESLint du composant réussis ; Edge headless vérifie les couleurs réelles, les transitions et l'absence de débordement. Reconnaissance simulée, aucun microphone réel ni son joué.
- [Bilan et empreintes actualisées du composant/CSS](microphone-ring-validation.json), [prêt](microphone-ready.png), [occupé](microphone-busy.png). Les empreintes de `validation.json` décrivent le lot précédent.

Les demandes de choix Auto / Dicter et envoyer / Conversation continue et de raccordement audio natif LFM3-Omni restent à implémenter et valider. Le cercle ne constitue pas une validation de ces fonctions. Un chargement CPU isolé du GGUF et de son projecteur a été vérifié ; aucune conversation audio native Omni n'a encore été testée.
