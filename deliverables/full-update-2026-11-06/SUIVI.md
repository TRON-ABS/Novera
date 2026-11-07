# Migration complète de Novera — suivi du 6 novembre 2026

État : **en cours**. Le mainteneur demande la mise à jour de l'ensemble des composants avec tests de compatibilité, puis demande de prendre note de tout. Aucun paquet 1.0.1 n'est publié ; les versions applicatives restent 1.0.0.

## Point de départ conservé

Le lot précédent de sécurité/interface passe : 7 856 tests des workspaces, zéro échec, 17 ignorés. Ses journaux, scans et empreintes sont conservés dans `../security-remediation-2026-11-06/`. Ces résultats ne sont pas annoncés comme une validation des dépendances introduites ensuite. Les manifests/verrous de départ sont sauvegardés localement sous `.tmp/full-update-baseline` pour préserver les modifications préexistantes de l'utilisateur.

Le contrôle de versions a consulté les registres officiels : 138 noms de paquets JavaScript dans 11 manifests, 117 crates directes dans 14 manifests, 19 projets PyPI et les releases officielles des moteurs. Les écarts de versions incluent des migrations majeures et ne correspondent pas à un nombre de vulnérabilités.

## Changements et observations consignés

- Migration des dépendances directes JavaScript vers les versions stables consultées : React 19.3.1, Vite 8.3.6, Vitest 5.1.0, AI SDK 7.0.163 et nouveaux adaptateurs, composants d'interface, Tauri JS et outils. Les versions sont épinglées dans les manifests et le verrou.
- Yarn 4.5.3 → 4.18.1. La migration automatique avait ajouté des autorisations Git génériques ; la configuration minimale précédente a été rétablie sans cette autorisation globale.
- TypeScript 7.0.2 essayé : incompatibilité avec le patch de l'ancien Yarn et plage prise en charge par typescript-eslint. TypeScript **6.0.3** retenu comme dernière stable de la plage acceptée par typescript-eslint 8.72.1 (`<6.1.0`). Cette contrainte reste explicite ; aucune affirmation de compatibilité TypeScript 7.
- Ajout des pairs Vite nécessaires aux workspaces de tests et de router-core à l'interface. Suppression du type stub uuid, du SDK PostHog inutilisé et des paquets Istanbul directs inutilisés. Le consentement et les envois de diagnostics continuent de passer par les fonctions Novera filtrées.
- Remplacement du fork `@janhq/streamdown` 2.1.1 par le paquet officiel **streamdown 2.7.1**, avec les nouveaux plugins. Adaptation des options d'animation, des propriétés HTML de la section de raisonnement et de l'interface de coloration Shiki ; aucune conversion de type forcée pour masquer une incompatibilité.
- TypeScript 6 : rootDir explicite du cœur, bibliothèques ES2022 de l'interface, types Node explicites et temporisateurs typés avec ReturnType<typeof setTimeout>.
- Zustand récent renvoie une promesse depuis les setters persistés : attente explicite dans les tests React concernés pour éviter les portées act asynchrones qui se chevauchent.
- Correction réelle du composant Progress : bornage 0–100, CSS valide et valeur accessible transmise au composant Radix. Les anciens tests attendaient une transformation CSS invalide au-delà de 100 % ; ils vérifient désormais le comportement borné.
- Actualisation compatible de six verrous Rust : application, CLI, worker Android, plugins llama.cpp/RAG et support portable. Les six commandes cargo update ont réussi ; le contrôle de compilation est en cours.
- Le nouveau scan npm retrouve une dépendance ancienne de provider-utils apportée par @janhq/interfaces/AI SDK 5 : correction ciblée à maintenir avant validation finale. Les notices et défauts de métadonnées des pairs tiers sont suivis sans les présenter comme corrigés.
- Les anciennes roues ExLlama dépendent de Torch 2.9/CUDA 12.8. Les derniers assets officiels ne fournissent pas de roue Torch 2.15 : un simple remplacement de numéro ne prouve pas la compatibilité ABI. La combinaison moderne et son contrôle restent en cours.
- Les bornes MLX/Swift et la compatibilité Python/ONNX restent à traiter. Les essais macOS, Linux, mobiles et GPU ne sont pas annoncés comme réalisés sur ce seul poste Windows.

## Validations déjà obtenues pendant cette migration

- Compilation du cœur avec TypeScript 6 : réussie.
- Compilation web avec TypeScript 6, Vite 8 et Streamdown officiel : réussie, avec avertissements usuels sur la taille des chunks.
- 99 tests ciblés de création, installation, progression et Markdown : réussis avant la dernière relance générale ; les tests seront relancés après les adaptations finales.
- Première suite complète sur les nouvelles dépendances : 33 échecs ; causes identifiées et corrections engagées (promesses act et Progress). Le résultat final est encore en attente.

## Point de reprise — demande « prends note de tout ça »

Cette section actualise les observations intermédiaires ci-dessus. La demande reste de mettre l'ensemble de Novera à jour avec des tests de compatibilité ; ce travail n'est pas terminé.

### Résultats obtenus après les premiers essais

- Suite JavaScript complète après les migrations majeures : **7 856 réussis, zéro échec, 17 ignorés** (`.tmp/full-update-all-tests.json`, champ `success: true`). Les premiers échecs mentionnés plus haut ont été corrigés.
- Tests natifs desktop Rust : **1 171 réussis, zéro échec, 5 ignorés** (`.tmp/full-update-rust-tests.log`). Compilation de la bibliothèque desktop réussie ; des avertissements restent présents.
- Validation séparée des secrets : **27 tests réussis**, dont lecture avec keyring 4 d'un identifiant synthétique créé avec keyring 3. Aucun identifiant personnel n'est utilisé pour ce contrôle.
- Compilation du cœur TypeScript et de l'interface web réussie sur les nouvelles versions. Les modifications ultérieures nécessiteront une validation finale.
- Retrait de `@janhq/interfaces`, qui apportait une ancienne chaîne AI SDK inutilisée. Le dernier audit npm du workspace principal est sorti avec le code zéro et sans rapport ; il reste à le renouveler après les changements finaux et à contrôler les workspaces autonomes.

### Migrations supplémentaires à conserver dans les notes 1.0.1

- Adaptations Rust aux nouvelles API : génération aléatoire, chiffrement, keyring, clients HTTP/OAuth, informations système et protocole MCP. L'adaptateur OAuth conserve les règles de redirection et les contrôles existants ; les fixtures MCP respectent désormais la découverte du serveur d'autorisation.
- Correctif de sécurité GLib rétroporté dans `src-tauri/vendor/glib-0.18.5/`, avec provenance et empreinte dans `NOVERA-PATCH.json`. La famille GTK 3 doit rester cohérente avec Tauri ; une simple montée de GLib isolée serait incompatible. La compilation Linux reste à vérifier.
- Contraintes de compatibilité explicites : TypeScript 6.0.3 avec typescript-eslint ; rusqlite 0.39 avec le SQLite partagé par SQLx ; windows-collections 0.3.2 avec les liaisons Windows utilisées. Les versions absolues les plus récentes ne sont pas toutes combinables.
- Python : préparation de Torch 2.15.0, Transformers 5.22.1, Diffusers 0.42.1 et du Python géré 3.12.15. Neuf profils de dépendances ont été régénérés avec empreintes. Leur résolution ne constitue pas encore un test d'inférence.
- ONNX Runtime : absence de roue Windows pour le Python système 3.15 lors de l'essai. Le runtime distribué utilise Python 3.12 ; son installation et ses tests doivent être validés séparément.
- ExLlama reste ouvert : les roues officielles EXL2/EXL3 dépendent de versions précises de Torch/CUDA. Le profil ancien ne doit pas être annoncé comme sécurisé ou modernisé tant qu'une combinaison corrigée et compatible n'a pas été prouvée.
- Préparation d'un verrou Bun 1.4.4 / uv 0.13.7 avec URL et SHA-256 par cible, et d'un utilitaire de vérification des téléchargements. L'intégration au script de distribution et ses tests restent à terminer.
- MLX : la dernière version de mlx-swift-lm consultée impose mlx-swift 0.32.x ; migrer isolément vers 0.33 n'est pas une combinaison démontrée. Mise à jour cohérente et validation macOS encore nécessaires.
- CLI : activation explicite des fonctions headless par défaut et adaptation ACP 5 en cours. **Le dernier essai de compilation échoue dans les sources C++ GGML sur des en-têtes introuvables** (`ggml.h`, `ggml-opt.h`). Aucun succès de compilation CLI ni test d'inférence CLI n'est revendiqué.

### Engagements et contrôles restants

Ajout demandé ensuite : repli **manuel uniquement** du bloc de saisie sur la partie du dessous, sans changer le champ ni ses boutons. Commande dans la barre existante, conservation du brouillon et des pièces jointes. Validation : 71 tests ciblés, compilation web et quatre formats de navigateur réussis. [Détails du lot interface](../composer-fold-2026-11-06/VALIDATION.md). Le reste de la migration décrit ci-dessus conserve son statut en cours.

**Précision et correction après essai :** la première implémentation repliait le mauvais bloc. Les commandes du **bas** se replient désormais et la saisie reste visible. Commande à droite de Nouvelle discussion, microphone à gauche d'Envoyer ; les deux à 50 % de la largeur des actions principales. Conversation vocale continue demandée : écoute, envoi au modèle, lecture puis reprise de l'écoute. Adaptateur natif Windows local et API de navigateur locales ; autres hôtes natifs indisponibles. Deux libellés ajoutés aux 104 catalogues, inventaire actualisé à 2 431 clés. 627 tests interface/vocal/langues et trois tests natifs passent, ainsi que types, lint, syntaxe PowerShell et quatre formats navigateur. Aucune utilisation du vrai microphone ni nouvelle compilation Desktop de livraison : le mainteneur a indiqué qu'il la ferait. [État actuel et preuves](../composer-controls-voice-2026-11-06/VALIDATION.md).

Compilation demandée ensuite : **Desktop Windows x64 jusqu'au bout — terminée**. Correction du verrou autonome du moteur qui bloquait `--locked`, contrôle de six résolutions, compilation native CPU/CUDA, interface et exécutable réussis. Worker final revalidé avec le verrou corrigé et les bibliothèques natives compilées localement ; 92 fichiers du runtime vérifiés, version du moteur et détection de la RTX 5070 contrôlées depuis le dossier final. Pas d'inférence, d'essai interactif de l'application personnelle ni de publication. [Preuves et limites](BUILD_DESKTOP.md). La migration complète demeure en cours pour les autres lots.

- Garder les applications en **1.0.0** pendant la préparation ; réserver l'ensemble de ces notes à **1.0.1**, sans publier ni remplacer l'installation personnelle pour un essai.
- Conserver dans la note de version les **24 langues ajoutées, 104 au total**, les corrections de texte, les consentements distincts et désactivés par défaut, les protections des données et la version exacte de **llama.cpp v0.9.0, build 12110, commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`**.
- Terminer les dépendances JavaScript des plugins et des tests e2e, les verrous Rust autonomes, les profils Python/ExLlama, les outils embarqués et MLX ; relancer les contrôles après les dernières modifications.
- Distinguer tests unitaires, compilation, inférence réelle et tests de distribution. Windows seul ne valide pas Linux, macOS, Android ou iOS.
- Prévoir le test réel de mise à jour **1.0.0 → 1.0.1**, avec conservation des conversations, réglages, modèles et secrets, lorsque le paquet de mise à jour sera prêt.
- Consolider les preuves finales dans ce dossier puis actualiser `SECURITY.md`, `PR.md`, `docs/CHANGELOG.md` et `docs/FUTURES_VERSIONS.md`. Ne pas présenter les anciens audits comme des scans de l'état final.

Les preuves détaillées sont les journaux `.tmp/full-update-*` ; les résultats consolidés, limites et notes 1.0.1 seront mis à jour à l'issue des lots. Aucune CI, approbation, fusion ou publication n'est revendiquée.


### Microphone : état visuel demandé ensuite

Cercle vert disponible, rouge occupé (écoute, traitement/attente, lecture), gris indisponible. Le bouton reste utilisable pour arrêter une session vocale active, et conserve la demi-largeur demandée. Libellés accessibles réutilisés dans les 104 langues. Validation : 101 tests ciblés réussis, TypeScript, ESLint du composant et quatre formats Edge headless avec voix simulée. Aucun accès réel au micro, aucun son joué et aucune nouvelle compilation Desktop. [Preuves](../composer-controls-voice-2026-11-06/microphone-ring-validation.json).

Demandes vocales encore ouvertes : choix Auto / Dicter et envoyer / Discussion continue ; raccordement audio natif LFM3-Omni. Le GGUF public et son projecteur présents localement ont été chargés dans un worker CPU isolé pour une première sonde, sans conversation audio ni microphone. Ce contrôle ne valide pas le transport temps réel ni ces modes.


### Retour de compilation : `kv_unified` et micro sans texte

Cause confirmée dans le journal applicatif : `SETTINGS is not defined` empêche le chargement des réglages des extensions compilées. Migration des options Rolldown vers `transform.define`/`transform.inject`, contrôle de huit bundles et garde d'initialisation du moteur. Contrôle avant correction : quatre bundles en échec ; après reconstruction : zéro constante restante.

Le mainteneur confirme que le micro s'active sous Windows, mais rien ne s'écrit. Ajout de la transcription intermédiaire dans le champ, envoi seulement du résultat final, protection contre les anciennes erreurs du modèle et les résultats tardifs, conservation des mots après arrêt/échec sans écraser un nouveau brouillon. Le repli est validé par le mainteneur et conservé.

377 tests ciblés et trois tests natifs réussis ; TypeScript et ESLint réussis. Vraie reconnaissance Windows sur WAV synthétique : 14 hypothèses puis texte final ; vraie génération textuelle de LFM3-Omni avec son projecteur dans un worker CPU isolé. Quatre formats navigateur avec capture simulée. Aucun micro ouvert, aucun son joué, aucune nouvelle compilation Desktop ni modification de l'installation personnelle. Recompiler avant le prochain essai utilisateur. Les choix de modes et l'audio natif Omni restent ouverts. [Preuves](../model-start-voice-2026-11-06/VALIDATION.md).


### Retour suivant : dictée imprécise, envoi manuel et réponse inaudible

Cause de faux arrêt repérée : score Windows inférieur à 0,5 transformé en `uncertain`, puis en erreur fatale `unavailable`. Retrait du seuil supplémentaire pour les phrases finales acceptées par le moteur. Une incertitude ancienne reste corrigeable ; elle n'indique pas une indisponibilité. La saisie manuelle met le vocal en pause et Envoyer conserve la session pour lire la réponse puis réécouter. Identifiant natif neuf pour chaque opération afin que l'annulation de la capture ne révoque pas la synthèse suivante ; sortie Windows par défaut explicite.

111 tests ciblés et trois tests natifs réussis ; TypeScript et ESLint réussis. WAV synthétique reconnu avec 14 hypothèses ; vraie synthèse Windows dans un WAV non silencieux de 3,82 secondes ; quatre formats navigateur avec capture simulée. Libellé de correction existant présent dans les 104 catalogues. Aucun microphone ouvert, aucun haut-parleur utilisé et aucune nouvelle compilation Desktop. Le repli validé reste inchangé.

La précision du moteur Windows n'est pas garantie améliorée par ces corrections de flux. Expérience audio LFM3-Omni isolée sur le point d'accès HTTP existant : sortie textuelle partielle à 128 puis 512 jetons, donc non validée et non intégrée. Transport temps réel, voix native Omni et essai matériel réel restent ouverts. [Preuves](../voice-continuous-2026-11-06/VALIDATION.md).


### Test réel demandé : erreur vocale persistante et focus Tauri/WebView2

Le mainteneur a recompilé et l'erreur persiste. Journal de sa dernière version : échec pendant l'écoute. Le vrai micro fonctionne dans le helper isolé (six hypothèses, phrase reconnue en 12,76 s), puis le job/lecteur Rust passe aussi. Reproduction sur l'exécutable utilisateur : fenêtre visible et réellement au premier plan, document focalisé, mais `is_focused()` Tauri faux, donc commande annulée. Cette annulation était en plus affichée comme une indisponibilité.

Correctif : contrôler le HWND/racine Windows au premier plan, sans autoriser les autres fenêtres du même processus ; surveiller le premier plan toutes les 75 ms ; conserver `cancelled` malgré l'absence de JSON final après arrêt ; ignorer les annulations normales dans le toast. Test caché Windows des liens parent/enfant et des autres racines ; capture réelle seulement via un test manuel ignoré par défaut.

115 tests interface et quatre tests natifs réussis, un diagnostic natif micro explicitement exécuté, TypeScript/ESLint réussis. **Compilation debug de test** en 3 min 16 s, pas de nouvelle livraison. Profil et WebView temporaires : synthèse `done`, cinq hypothèses puis `recognized`, aucune erreur ; minimisation provoque `cancelled`. Le mainteneur confirme avoir entendu « Test vocal de Novera » : « Oui, clairement ». Aucun enregistrement ni texte capturé conservé et installation personnelle non remplacée. Le mainteneur recompilera sa Desktop habituelle. Précision générale de Windows, audio natif Omni et autres systèmes restent hors validation. [Preuves](../voice-focus-2026-11-06/VALIDATION.md).

### Microphone directement relié à LFM3-Omni — essai humain réussi

À la demande du mainteneur, l'entrée audio contourne la reconnaissance Windows pour le modèle local LFM3-Omni sélectionné : PCM 16 kHz, fin de phrase détectée, transcription native temps réel de llama.cpp v0.9.0/build 12110, envoi normal, réponse lue par Windows puis écoute reprise. Trois phrases synthétiques exactes sur CPU et CUDA/RTX 5070 ; essai humain de huit mots sans erreur, réponse audible confirmée : « Oui, texte exact et réponse lue ». Aucun ajout de clé de traduction ; les libellés des 104 catalogues sont réutilisés.

Le contrôle complémentaire de minimisation a révélé que WebView2 gardait document.hasFocus() vrai et document.hidden faux avec le micro ouvert. Ajout d'une commande qui contrôle le vrai HWND appelant, avant ouverture puis toutes les 100 ms. Après correction et nouvelle compilation debug isolée : fenêtre minimisée, bouton au repos et toutes les pistes fermées. Deux tests supplémentaires couvrent refus en arrière-plan et annulation d'une capture active.

Bilan final : 126 tests ciblés dans six fichiers, TypeScript et ESLint des modules vocaux réussis, compilation web réussie ; worker release compilé --offline --locked en 9,12 s, exécutable debug de test en 3 min 46 s. ESLint étendu à ChatInput relève trois erreurs React préexistantes, consignées dans le rapport ; aucune réussite globale de lint revendiquée. API : 401/400/413 vérifiés ; annulation libérant le moteur en 1,016 s puis nouvelle discussion fonctionnelle. Aucun fichier audio du micro enregistré ; discussion temporaire et journal de l'essai supprimés avec le profil isolé. Serveurs de test arrêtés, installation personnelle non remplacée. La conversation humaine précède l'ajout final de garde ; ce dernier a ses tests unitaires et son propre essai réel de minimisation. Prochaine compilation Desktop habituelle par le mainteneur.

La voix de réponse reste celle de Windows, pas la génération vocale native Omni. Validation française limitée, aucune promesse de précision générale ni de reconnaissance dans les 104 langues ; autres plateformes à adapter. [Preuves, mesures et empreintes](../omni-microphone-2026-11-06/VALIDATION.md).

### 7 novembre — synthèse native Omni/Audio, genre et langue

La sortie vocale passe maintenant par le vrai LFM3-Omni ou LFM3-Audio sélectionné. Le serveur natif de llama.cpp v0.9.0/build 12110 expose une route bornée et authentifiée, transporte les octets WAV en base64 et surveille annulation/délai. Paramètres → Général → Conversation vocale : masculin par défaut, choix féminin persistant. Deux nouvelles clés traduites dans les 104 catalogues, inventaire/documentation porté à 2 433 clés. Audio GGUF reconnu explicitement par le catalogue ; les autres familles audio restent filtrées.

Tests réels : Omni CUDA et CPU, Audio CUDA, deux voix françaises et voix masculine anglaise, WAV 24 kHz non silencieux. Français retranscrit exactement ; noms propres anglais parfois altérés par la vérification ASR inverse. Dans l'application debug isolée : deux lectures natives terminées, préférence conservée après rechargement ; confirmation du mainteneur « Oui, les deux voix sont audibles et distinctes ». Cycle complet avec entrée synthétique publique : transcription, envoi automatique, réponse en deux segments, lecture native puis écoute reprise. Réduction pendant lecture : annulation et contextes fermés. Aucun microphone humain ouvert pendant ces nouveaux tests de sortie.

Instruction commune de réponse dans la langue du message, maintenue après recherches/outils. Scénario français avec résultat anglais simulé et finalisation sans nouvel outil : réponse française ; espagnol et anglais également essayés. La langue de synthèse suit la langue utilisateur configurée. Aucun test de prévision météo actuelle ni validation universelle de détection de langue.

352 tests ciblés dans 14 fichiers, TypeScript, ESLint ciblé (un avertissement existant), compilation web et contrôle des 104 catalogues réussis. Mauvaise clé 401, méthode 405, paramètres 400, corps 413. Génération annulée : modèle libéré en environ 1,23 s et rechargement fonctionnel. Worker release compilé en 13,43 s et exécutable debug de test en 2 min 34 s, --offline --locked. Pas de nouvelle distribution ou installation remplacée ; prochaine compilation Desktop habituelle par le mainteneur. Langues vocales du modèle distinctes des 104 langues de l'interface, plateformes natives autres que Windows encore à adapter. [Preuves et empreintes](../omni-speech-2026-11-07/VALIDATION.md).

### 7 novembre — nouvelle capture : français suivi d'une réponse anglaise

Défaut reproduit avec le message B0/BS/5 sigma de la capture, un ancien tour assistant anglais, les instructions par défaut et le vrai LFM3-Omni : l'ancienne consigne générale produit encore de l'anglais. Correction du transport commun : rappel explicite du nom/code de la langue utilisateur configurée, priorité conservée à un nouveau message dans une autre langue ou à une demande explicite. Aucun changement du message enregistré ou de l'historique ; préfixe stable à réglage identique.

Même message corrigé : français. Question française de suivi : français. Nouveau message anglais, demande explicite en anglais et demande en espagnol : langues attendues. Helper de production utilisé par le banc natif ; génération déterministe CUDA. 103 tests ciblés, TypeScript, ESLint et compilation web réussis. Les tests vérifient la langue, pas les affirmations de physique. Aucune nouvelle clé ni changement des 104 catalogues, aucune installation remplacée ; correction à inclure dans la prochaine compilation Desktop. [Preuves](../reply-language-2026-11-07/VALIDATION.md).

### 7 novembre — vérification multimodèle et précision : c'est la voix qui changeait de langue

La vérification élargie à Qwen3 et Nemotron révèle des réponses suivant encore la langue de l'interface plutôt que celle du nouveau message. Ajout de tinyld 1.3.4, dépendance exacte sans dépendance transitive : détection entièrement locale de la prose des derniers messages utilisateur, analyse bornée et repli sur le dernier tour clair puis la langue de l'interface. Code/citations de bloc/URL et contenu assistant/outils exclus ; variantes régionales préservées. Consigne ajoutée après les prompts propres aux surfaces, notamment Cowork, avant tous les adaptateurs.

Vrais poids existants sur CUDA : Qwen3-4B, Nemotron-3.5-Bolt et LFM3-Omni passent chacun sept scénarios, soit 21 réponses dans la langue attendue, non tronquées. Les tests couvrent aussi les contrats de douze fournisseurs, sans appel cloud. Nemotron est essayé avec un budget de raisonnement 128 et une limite totale 1 536 ; les essais initiaux trop courts sont conservés comme limites du banc.

Nouvelle capture « 2 + 2 = 4 » : le mainteneur précise que le changement concerne la voix entendue. La voix suit désormais la langue du message reconnu ou envoyé ; les réponses numériques sont préparées pour la parole, sans modifier l'affichage. Application debug isolée, backend initial anglais puis question française : deux lectures Omni (masculine et féminine) terminées. Confirmation du mainteneur : « Oui, les deux voix sont en français ». Aucun micro ouvert pendant cet essai. Question courte aussi envoyée aux trois modèles ; contrôle de langue distinct de la justesse mathématique.

Validation finale : 344 tests dans 21 fichiers, TypeScript, ESLint ciblé, compilation web en 5,24 s et installation à verrou immuable réussis. OSV ne retourne aucun avis tinyld pour cette version au moment du contrôle, sans garantie universelle d'absence de vulnérabilité. Profil et journal temporaires supprimés, processus arrêtés, aucun modèle ou binaire personnel modifié. Autres moteurs matériels, API distantes et ensemble des 104 langues non certifiés par ces essais. Source à intégrer dans la prochaine compilation Desktop. [Preuves, résultats et limites](../multimodel-language-2026-11-07/VALIDATION.md).

### 7 novembre — récidive avec citation W : URL cachée dans la synthèse

La capture à 1 h 39 contient encore une formule et sa pastille « W » ; le mainteneur parle de la voix. Le dossier compilé à 1 h 29 est inspecté via ses source maps privées : les premiers correctifs sont bien présents, mais le retrait de [[cite:URL]] manque. Aucun processus utilisateur n'est visible pour attester son chemin de lancement. Le texte brut de citation survit au nettoyage vocal et empêche la reconnaissance d'une formule numérique seule : cas absent des essais précédents sans citation.

Correction : retirer les marqueurs complets, multiples ou tronqués et leur URL avant la préparation numérique, en conservant affichage et stockage. Test du contrôleur VoiceConversation de production dans une vraie application debug isolée, réponse citée fournie comme fixture après « quoi. » puis « tu pense a quoi ? ». Le vrai Omni reçoit « Calcul : trois plus sept égale dix. » en fr, deux lectures natives terminées, contextes fermés. Confirmation du mainteneur : « Oui, les deux sont en français, sans lien ». Aucun micro ouvert. Contrôle distinct chat natif/cache slot 0 → TTS → nouvelle question : réponse Bonjour, sans réutilisation du calcul.

60 tests vocaux dans cinq fichiers, TypeScript, ESLint ciblé et compilation web en 6,48 s réussis. Profil/journal supprimés, serveur et processus de test arrêtés, aucune installation modifiée. Le test de cache ne garantit pas la pertinence de toutes les réponses courtes. Correctif à inclure dans la prochaine compilation Desktop. [Preuves et limites](../cited-speech-2026-11-07/VALIDATION.md).

### 7 novembre — demande précisée : voix au clavier sans micro et accès Internet

Le mainteneur veut la lecture même avec le micro désactivé, sur LFM3-Omni/Audio. Ajout de la préférence persistante « Lire les réponses à voix haute », activée par défaut sur les hôtes pris en charge ; session de lecture seule après nouvel envoi, sans appel au micro ni reprise d'écoute. Le brouillon saisi ne doit plus interdire ce démarrage comme il interdisait celui du micro. Nouveau libellé dans les 104 catalogues, inventaire à 2 434 clés. Tests des contrôles et de la préférence, sans lecture des anciennes réponses au chargement.

Internet : compatibilité web seule pour les imports LFM3 connus sans étiquette tools, sans réactiver shell/MCP ni contourner un choix explicite. Le modèle peut encore refuser une demande météo avec les outils présents : imposer une première recherche pour les intentions reconnues, en respectant Web désactivé et les demandes sans recherche. La forme tool_choice objet a échoué pendant les essais ; la forme compatible est required avec seul web_search actif, puis retour auto après résultat/erreur. Aucune permission native affaiblie.

Essais réels : réponse d'un envoi clavier lue par le vrai Omni, zéro getUserMedia et retour au repos ; confirmation « Oui, la réponse a été lue ». Test Internet séparé en fenêtre réduite : question directe Les Sables-d'Olonne, DuckDuckGo search puis fetch_content, résultats réels, réponse terminée avec citation. La prévision générée cite le 6 novembre au lieu du 7 ; cette validation porte sur le parcours réseau, pas la justesse météo. Pas d'affirmation d'exactitude en temps réel.

Validation finale : 368 tests ciblés dans 24 fichiers, TypeScript, ESLint ciblé (un avertissement existant), compilation web en 7,28 s et contrôle des 104 catalogues réussis. Aucun nouveau paquet Desktop ni installation remplacée ; profils/journaux de test supprimés et processus arrêtés. Autres plateformes et nouvel essai matériel Audio non certifiés. Sources à inclure dans la prochaine compilation habituelle du mainteneur. [Preuves et limites](../typed-replies-web-2026-11-07/VALIDATION.md).


## 7 novembre — son, régénération et réglages LFM3

Petit bouton de son sous le micro, préférence persistante commune aux voix natives LFM3 et système pour les modèles classiques. Lecture restaurée après régénération ; mode muet sans synthèse et sans interrompre durablement la conversation. Nombres français dans les phrases préparés en mots. Réglages personnels Omni contrôlés en lecture seule : température texte du GGUF déjà à 0, contexte 32768 ; valeurs manquantes bornées à 2048 tokens et raisonnement Omni auto désactivé par requête. Choix explicites préservés, fichiers personnels inchangés. 206 tests ciblés, TypeScript et build web réussis ; 104 catalogues à 2434 clés. Test réel Windows : lecture initiale/régénérée, silence après coupure, deux voix Omni et voix système terminées. Qualité phonétique des nouveaux essais et autres plateformes non certifiées. [Preuves et limites](../voice-controls-2026-11-07/VALIDATION.md).


## 7 novembre — fluidité vocale

Lecture continue optimisée pour les deux chemins vocaux : préparation d’un extrait LFM3 en avance et programmation sur l’horloge audio ; file navigateur locale limitée à deux énoncés ; réponses Windows usuelles conservées dans une session système jusqu’à 4500 caractères. Dernière phrase conservée et attendue avant reprise de l’écoute, erreurs natives signalées, annulation maintenue. Test réel Omni masculin/féminin : huit phrases jouées, six transitions sans intervalle ajouté ; dernière phrase retranscrite exactement dans les deux voix. Voix système Windows terminée. Le mainteneur confirme « Oui, lecture fluide et complète ». 214 tests, TypeScript, ESLint ciblé et build web réussis. La vitesse du matériel et les moteurs système peuvent encore imposer des pauses ; les autres plateformes ne sont pas certifiées. [Preuves et limites](../speech-flow-2026-11-07/VALIDATION.md).


## 7 novembre — tolérance de saisie pour la météo

Le déclencheur météo accepte désormais « quel temp aujourd’hui » sans s. La recherche restait auparavant facultative et LFM3 pouvait refuser malgré Internet activé. Test réel Windows Omni : recherche avec la formulation exacte, sources récupérées, réponse citée ; régénération avec nouvelle recherche et lecture de page réussie. 238 tests dans 10 fichiers, TypeScript, ESLint ciblé et build web réussis ; contrats vérifiés sur 12 routes de fournisseurs. Réglages personnels inchangés, véracité des prévisions non certifiée. [Preuves et limites](../weather-typo-2026-11-07/VALIDATION.md).


## 7 novembre — citations et langue de la voix

Nettoyage vocal renforcé pour les liens « image », les URL utilisées comme libellés et la forme réelle [[cite:source]](URL), dont l’adresse restait auparavant à lire. Traitement commun aux voix natives LFM3 et système, sans modifier les messages ni ouvrir les liens. Test réel Windows : deux phrases dans les deux voix LFM3, quatre WAV terminés, langue fr, zéro adresse envoyée, enchaînement sans intervalle ajouté ; voix système terminée. Le mainteneur confirme « Oui, les deux restent en français, sans lien ». 241 tests, TypeScript, ESLint ciblé et build web réussis ; fidélité de tout autre texte et autres plateformes non certifiées. [Preuves et limites](../source-links-speech-2026-11-07/VALIDATION.md).


## 7 novembre — reprise après recherche et préparation web

Correction de la réponse météo qui reprenait un exercice précédent : synthèse web LFM3 recentrée sur la question actuelle et ses résultats, historique conservé ; rappel commun après outils et date locale. Le vocal attend la vraie réponse finale, sans consommer une étape vide ni une ancienne réponse. Test Windows réel des trois questions puis régénération : météo lue les deux fois, confirmé par le mainteneur. Préparation DuckDuckGo en arrière-plan après restauration des réglages quand Web est actif, sans recherche fictive ; service prêt avant la demande, essai indicatif 10 s contre 22 s auparavant. Web-off respecté sur un nouveau démarrage. 298 tests réussis, un ignoré, TypeScript, ESLint ciblé et build web réussis. Le ciblage du contexte des petites familles audio locales et la variabilité du réseau sont détaillés dans les limites. [Preuves et limites](../web-turns-prewarm-2026-11-07/VALIDATION.md).


## 7 novembre — modèle commun et intégrité de la paire

LFM3-Omni-2B Q4_K_M et son mmproj deviennent la recommandation par défaut des interfaces Desktop, Android et iOS ; Nemotron reste disponible en alternative texte. Explications dans les 104 catalogues (2 435 clés). Contexte initial : 32 768 jetons sur ordinateur, 2 048 sur mobile, sans écraser les réglages existants. Vérification native de la paire par taille et SHA-256, import dans le même dossier. 161 tests ciblés web, quatre tests de réglages et treize tests Rust réussis ; TypeScript et cinq builds de l'interface réussis. Les builds natifs et essais sur les autres systèmes restent à réaliser ; la voix native LFM3 reste Windows. [Preuves et limites](../default-omni-2026-11-07/VALIDATION.md).


## 7 novembre — catalogues API dans les 104 langues

Contrôle des 43 fournisseurs prédéfinis à partir des sources officielles et de trois API publiques. Mise à jour des présélections : GPT-6.1 Terra, Kimi K3.1 Pro, MiniMax M3.1 Flash, GLM 5.3 Flash, Hy4 ; ajout des variantes GPT Image 2.6, Gemini Omni 1.2 et FLUX 3 prises en charge. Les 104 langues utilisent le même catalogue, avec noms et identifiants officiels ; action de rafraîchissement accessible traduite partout. Suppression de la limite de dix résultats ; nouveaux champs BFL testés. 194 tests ciblés et trois tests publics réels réussis ; TypeScript, lint des sources concernées et cinq builds de l'interface réussis. Aucun appel payant ni clé utilisateur, aucun paquet natif publié. Les déploiements Azure/IBM et la disponibilité régionale restent propres au compte. [Contrôle détaillé et limites](../api-catalog-2026-11-07/VALIDATION.md).


## 7 novembre — passage des sources en 1.0.1 et notes complètes

Sur demande explicite du mainteneur, les sources de l’application et de la CLI passent en **1.0.1** le 7 novembre ; verrous Cargo applicatifs synchronisés. Android passe au **versionCode 1000013**, avec la même identité et le même certificat. Le configurateur synchronise aussi les propriétés Gradle déjà générées pour éviter de reconstruire avec une ancienne version. Aucun paquet 1.0.1 compilé ou publié dans ce lot. Le mainteneur a confirmé « tout marche au top » sur sa compilation Desktop avant ce changement de numéro.

Les **104 README** contiennent désormais les notes complètes de préparation : sécurité, confidentialité, 24 langues supplémentaires, moteur llama.cpp v0.9.0/b12110 et commit, modèles LFM3/Nemotron, contexte 32K ordinateur/2K mobile, catalogues API, voix, micro et son, recherche web, optimisations et repli des commandes du bas sans déplacer la saisie. Tableaux synchronisés avec les sources : 43 profils dont 42 cloud, 58 préréglages média (30 image, 24 vidéo, quatre musique), 2 435 clés dans les 104 catalogues. Traductions assistées et registres écrits régionaux signalés ; relecture native non certifiée.

Contrôles : 104 fichiers appliqués et empreintes vérifiées, aucun nouveau lien local cassé, liens publics 1.0.0 conservés ; 24 tests de préparation version/Android/readiness/vitrine réussis ; métadonnées Cargo verrouillées/hors ligne Desktop et CLI en 1.0.1. Vitrine préparée et vérifiée localement à 1365 et 390 px, notes fermées et ouvertes, 104 liens de langues, aucune image cassée ni débordement. Une référence moteur longue débordait sur mobile : retour à la ligne corrigé. Aucun changement GitHub/Pages en ligne, commit, push ou publication ; les paquets natifs et la vraie transition publique 1.0.0 → 1.0.1 restent à valider. [Résultats et empreintes](readmes-1.0.1/validation.json).
