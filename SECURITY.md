# Sécurité de Novera

## Lecture seule et outils web — complément du 7 novembre

Une nouvelle réponse au clavier peut être lue sans ouvrir le microphone, via une préférence persistante désactivable. Aucun démarrage de capture ni lecture des conversations enregistrées au chargement. Annulation au changement de contexte ou à la perte du premier plan conservée ; ouverture du micro contrôlée à zéro dans le test natif.

La compatibilité web des imports LFM3 n'ajoute que les outils web connus lorsque la recherche est activée ; les choix explicites de capacités restent respectés. La première recherche obligatoire est limitée aux intentions reconnues, puis revient en mode automatique après résultat ou erreur. Web désactivé reste appliqué dans les annonces et l'exécution ; aucun affaiblissement des contrôles réseau, CORS, URL ou secrets. Recherche DuckDuckGo et lecture d'une page réelles vérifiées, sans certifier le contenu météo généré. [Tests et limites](deliverables/typed-replies-web-2026-11-07/VALIDATION.md).

## Citations dans le texte parlé — complément du 7 novembre

Les marqueurs de citation web et leurs URL cachées sont retirés du texte envoyé à la voix, avant la préparation numérique. Ils restent affichés et stockés normalement dans la discussion. Aucun appel réseau ou changement de permission ajouté. Essai du contrôleur vocal complet avec réponse citée : deux lectures natives françaises confirmées sans lien prononcé, contextes fermés. 60 tests vocaux, TypeScript, ESLint ciblé et compilation web réussis. [Preuves et limites](deliverables/cited-speech-2026-11-07/VALIDATION.md).

## Langue des messages et de la voix — complément multimodèle du 7 novembre

Détection de langue locale avec `tinyld` 1.3.4, version et verrou fixés, sans dépendance transitive ni transmission à un service externe. Analyse bornée de la prose utilisateur ; code, citations de bloc, URL et réponses d'outils exclus. Aucun nouveau stockage de messages ou enregistrement audio. La consigne commune couvre les adaptateurs du chat et Cowork ; la voix suit le message et prépare les formules numériques pour la lecture sans changer leur affichage.

21 scénarios réels réussis sur Qwen3, Nemotron et LFM3-Omni ; voix masculine/féminine françaises confirmées sur le calcul numérique. Contrats des autres fournisseurs testés sans appels cloud. OSV ne retourne aucun avis pour la nouvelle dépendance à cette date ; cela ne prouve pas l'absence de vulnérabilité. [Tests, preuves et limites](deliverables/multimodel-language-2026-11-07/VALIDATION.md).

## Sortie vocale native — complément du 7 novembre, préparation 1.0.1

LFM3-Omni et LFM3-Audio utilisent maintenant leur propre synthèse locale avec voix masculine/féminine, choisie dans les paramètres. Route loopback authentifiée, corps/texte/durée/tokens/audio bornés, paramètres reconstruits sans référence de locuteur ni accès à des fichiers ou URL. Le WAV est transporté en base64 pour préserver les octets de la FFI. Stop et perte du véritable premier plan Windows coupent génération et lecture ; les contextes audio sont fermés. Aucun repli système silencieux dans ce parcours.

Contrôles API 401/405/400/413 et annulation réellement vérifiés ; lecture des deux voix confirmée audible et distincte par le mainteneur. Cycle complet essayé avec entrée synthétique et vrai modèle. 352 tests ciblés, TypeScript, ESLint ciblé et compilation web réussis ; 104 catalogues à 2 433 clés. Langues vocales limitées à celles des modèles, essais natifs Windows x64 seulement. [Preuves, limites et paramètres exacts](deliverables/omni-speech-2026-11-07/VALIDATION.md). Les sections précédentes restent le journal des étapes antérieures, sans validation globale de release.

## Entrée audio Omni — complément du 6 novembre, préparation 1.0.1

Le modèle LFM3-Omni local reçoit maintenant le PCM du microphone via l'API loopback authentifiée ; aucun repli sur la reconnaissance Windows dans ce parcours. Capture après action et permission, durée bornée, fermeture des pistes sur arrêt/annulation et contrôle du véritable premier plan Windows avant capture puis toutes les 100 ms. La synthèse de réponse reste Windows. Aucune permission distante ni politique CORS élargie.

Le serveur limite corps, durée audio et sortie, vérifie le format et joint les threads avant de libérer le moteur. Mauvaise clé (401), données invalides (400), corps trop gros (413) et annulation suivie d'une nouvelle discussion sont vérifiés. Aucun fichier audio du micro enregistré ; la transcription envoyée suit le stockage normal des discussions. Profil et journal de l'essai humain isolés puis supprimés. Référence française reconnue exactement et réponse entendue confirmées par le mainteneur ; ceci ne valide pas toutes les langues ni plateformes. [Preuves, limites et résultats finaux](deliverables/omni-microphone-2026-11-06/VALIDATION.md). Les mentions précédentes d'audio Omni non intégré décrivent les étapes historiques ; l'entrée est désormais intégrée, la sortie vocale native Omni reste distincte.

**Migration complète en cours après le premier lot de corrections :** les versions et tests de cette étape sont consignés dans [le suivi détaillé](deliverables/full-update-2026-11-06/SUIVI.md). Les réussites du premier lot ci-dessous ne valident pas automatiquement les dépendances majeures introduites ensuite.

**Compilation Desktop Windows x64 du 6 novembre : réussie.** Verrous Cargo remis en cohérence sans retirer `--locked`, six résolutions contrôlées, exécutable et 92 fichiers assemblés vérifiés. Le moteur CPU/CUDA du dossier final détecte la RTX 5070. Ce contrôle de compilation et d'assemblage ne constitue pas un audit final de sécurité ni une validation d'inférence ou multiplateforme. [Preuves et limites](deliverables/full-update-2026-11-06/BUILD_DESKTOP.md).

## Correctifs préparés pour la version 1.0.1

### Conversation vocale — sources préparées ensuite

Le nouveau vocal n'est pas inclus dans le binaire de la compilation Desktop citée ci-dessus ; le mainteneur effectuera la prochaine compilation. Sous Windows, le bridge utilise les moteurs locaux installés de reconnaissance/synthèse, un programme fixe et des données JSON séparées. Chaque helper est protégé par un job à arrêt automatique ; capture arrêtée sur annulation, perte de focus ou changement de contexte. Les adaptateurs de navigateur exigent explicitement la reconnaissance et les voix locales, sans repli cloud ni téléchargement automatique. Les autres hôtes natifs restent indisponibles.

Le texte reconnu suit le parcours normal de la discussion et du modèle choisi ; Novera ne crée pas d'enregistrement audio ni de journal technique contenant la transcription. L'écoute est coupée durant la génération et la lecture des réponses. Le vocal ne s'active pas au démarrage et reste indépendant du consentement de diagnostic. Trois tests natifs et les contrôles de cycle/annulation passent sans utiliser le microphone. Les essais audio réels et les autres plateformes restent à valider. [Détails et preuves](deliverables/composer-controls-voice-2026-11-06/VALIDATION.md).

État du 6 novembre 2026 : les corrections ci-dessous sont préparées dans les sources locales. La version publiée reste 1.0.0 jusqu'à compilation, validation et publication de nouveaux paquets. Une modification de ce document ne met pas à jour les applications déjà installées.

| Sujet | Correction dans les sources | Validation |
| --- | --- | --- |
| Pages distantes et accès natifs | Retrait de `remote.urls = ["http://*"]` de la capacité principale. Les pages HTTP distantes ne reçoivent plus cette autorisation native. | Contrôles de configuration ; essai d'invocation hostile sur les WebViews des différentes plateformes encore nécessaire. |
| API réseau | Refus côté Rust d'une écoute hors loopback sans clé, y compris une clé composée d'espaces. Une clé est aussi exigée pour les outils serveur, même sur loopback. L'interface signale le champ manquant avant le démarrage. | Tests de politique native ; contrôles HTTP et démarrage réel à compléter. |
| Clés fournisseurs | Nouvelle clé aléatoire de 256 bits, protégée par DPAPI sous Windows et par le coffre système sur Linux/macOS. Plus de chiffrement nouveau à partir de l'identifiant machine. Sans protection système disponible, la persistance échoue et le fournisseur reste utilisable dans la session. | Tests Windows de chiffrement, migration et préservation des fichiers corrompus ; validation des coffres Linux/macOS encore nécessaire. |
| Migration des secrets | Authentification et lecture de tout l'ancien fichier avant remplacement atomique par le format versionné. Les données originales sont conservées si la migration échoue. Les fichiers temporaires Unix sont privés dès leur création. | Tests sur données synthétiques ; aucun secret personnel utilisé. |
| Documents Excel | Passage de calamine 0.23.1 à 0.38.0 pour traiter RUSTSEC-2026-0436. Adaptation aux cellules et dates du nouveau lecteur. | Tests du parseur natif ; tests de vrais classeurs et de fichiers malformés à compléter. |
| Scripts et fichiers média | Suppression de `unsafe-eval` et des scripts chargés par le protocole asset. Seul le droit distinct `wasm-unsafe-eval` est conservé. Le protocole asset démarre sans autorisation globale du disque ; accès aux répertoires gérés et aux choix natifs explicites de l'utilisateur. Les fichiers de secrets et les réglages du profil Novera sont exclus ; les fichiers settings.json des projets restent consultables. | Contrôle Rust et tests d'accès aux fichiers ; essais réels des médias encore nécessaires. |
| Dépendances JavaScript | Actualisation des versions compatibles, retrait des anciennes chaînes de téléchargement et de coloration inutilisées, mises à jour du rendu mathématique et des outils de test. Les résolutions ciblées sont consignées dans package.json et yarn.lock. Adaptation au routeur et aux nouveaux SDK : aucun outil shell interdit n'est annoncé au modèle. | Scan npm complet après modifications : aucun avis de sécurité URL ; dix avis de dépréciation. Compilation web réussie ; suite web complète : 7 294 tests réussis, zéro échec, 17 ignorés. |
| ZIP, XML et updater | ZIP 9.4 pour les usages directs et mise à jour compatible du plugin updater 2.14.1, de Tauri et de wayland-scanner. Suppression des anciennes versions ZIP/XML concernées des verrous runtime. XML conserve les espaces et ne développe pas les entités externes. Suppression des fonctionnalités SQLx inutilisées : SQLite reste actif. | Parseurs testés sur données synthétiques ; compilation Rust Windows. Les paquets, signatures et migrations réelles restent à valider. |
| Statistiques et erreurs | Destination publique de collecte commune aux builds futurs ; un identifiant public de projet n'est pas une clé d'administration. Configuration désactivable à la compilation. Deux accords indépendants, désactivés par défaut, révocables ; aucun texte de conversation, document, message d'erreur brut ou clé API dans le rapport filtré. | 38 tests ciblés de confidentialité et de chemins navigateur ; 25 assertions PowerShell de configuration. 16 textes contrôlés dans 104 catalogues, aucun manquant. Aucun rapport réel envoyé pendant ces contrôles. |

Les différences de code, validations finales et limites de la préparation seront consignées dans [PR.md](PR.md). Les notes destinées à la version 1.0.1 figurent dans [l'historique consolidé](docs/CHANGELOG.md).

## Comportements à connaître

- Une API qui écoute sur le réseau nécessite une clé. Les contrôles Host/CORS ne remplacent pas l'authentification. L'écoute locale sans outil serveur reste possible pour les clients locaux existants.
- Si le coffre système ne fonctionne pas, rétablir son accès avant de compter sur la conservation des clés après redémarrage. Un échec de sauvegarde est signalé ; les clés présentes en mémoire restent limitées à la session. La reconnexion peut être nécessaire sur un autre compte ou appareil.
- La clé de l'ancien format n'est conservée dans le code que pour sa lecture et sa migration. En cas d'échec de migration, l'ancien fichier est conservé pour éviter la perte de données ; son ancien niveau de protection subsiste jusqu'à migration réussie. Il ne faut pas annoncer les anciennes sauvegardes comme rechiffrées.
- L'accès asset sert à lire un média ou afficher un fichier. Il n'accorde pas le droit d'exécuter des scripts, de lancer une commande ou de modifier le fichier. Les extensions actives actuelles sont intégrées au bundle de l'application.
- Un avis trouvé dans un verrou de dépendances doit être rapproché du code réellement utilisé, de la plateforme et du paquet distribué. L'absence d'avis dans une base ne prouve pas l'absence de vulnérabilité.

## Vérifications avant publication de la 1.0.1

- [ ] Compiler les paquets concernés depuis les sources finales et conserver leurs versions, commits et empreintes.
- [ ] Tester les navigations HTTP distantes et les refus IPC sur les WebViews réelles Windows, Linux, macOS, Android et iOS selon disponibilité.
- [ ] Vérifier l'authentification réseau et les outils serveur, les réglages persistés et le démarrage automatique.
- [ ] Vérifier migration des clés, coffre indisponible, redémarrage, déplacement du profil et refus des données altérées sur les plateformes concernées.
- [ ] Vérifier images, musique, vidéo, pièces jointes, glisser-déposer et projets déjà enregistrés avec le nouveau périmètre asset.
- [ ] Tester les classeurs Excel des deux systèmes de dates et les documents malformés. L'isolation du parsing documentaire avec limites mémoire/temps reste un travail distinct ; une mise à jour de calamine ne constitue pas cette isolation.
- [ ] Refaire les scans de dépendances Rust, JavaScript et Python ; documenter les avis restants par chemin d'utilisation. Les moteurs C/C++ et les binaires distribués demandent leurs propres contrôles.
- [ ] Vérifier la transition réelle de la version publique 1.0.0 vers la 1.0.1, la conservation des données et les signatures des paquets.
- [ ] Finaliser l'information de confidentialité : responsable, destinataire, durée de conservation réellement configurée, sous-traitance et transferts éventuels. Le consentement facultatif ne remplace pas ces obligations. Voir les [recommandations CNIL sur les SDK](https://www.cnil.fr/fr/applications-mobiles-comment-integrer-des-sdk-et-respecter-la-vie-privee-des-utilisateurs).

## Résultats locaux et avis restants

Les preuves après correction sont conservées dans [le dossier de validation](deliverables/security-remediation-2026-11-06/). La compilation web avec contrôle TypeScript passe. Les tests ciblés couvrent notamment le refus du shell, les fournisseurs, le rendu de documents, le consentement et la configuration. Le contrôle complet des traductions passe pour 104 catalogues de 2 429 clés ; il ne constitue pas une relecture native des textes.

La première suite web globale relevait 19 échecs. Après correction des attentes obsolètes et des défauts de compteur persan/pendjabi et d'icône TabbyAPI, la suite complète passe : **7 294 tests réussis, zéro échec, 17 ignorés**. Les tests d'extensions passent également (390/390), ainsi que le cœur (172/172). Le contrôle d'architecture passe pour 47 fichiers, avec huit tests de politique réussis. Ces résultats ne couvrent pas les essais natifs sur chaque appareil.

Le scan OSV de six verrous runtime relève encore des avis : il distingue les dépréciations et les vulnérabilités. En particulier, `glib 0.18.5`, imposé par la pile GTK/WebKit Linux, reste concerné par RUSTSEC-2024-0429 sur un itérateur ; aucun appel à `VariantStrIter` n'a été repéré dans les sources propres examinées, sans preuve d'inaccessibilité dans les dépendances. Une migration compatible de la pile ou un correctif amont reste nécessaire. Les notices de maintenance (`bincode`, `paste`, `unic-*`, `unsafe-libyaml`, `zvariant`, etc.) ne sont pas présentées comme corrigées. Voir le [résultat brut OSV](deliverables/security-remediation-2026-11-06/rust-osv.json) pour le périmètre exact et les alias d'avis.

Les essais locaux Windows et la configuration commune ne prouvent pas le fonctionnement de nouveaux exécutables Linux, macOS, Android ou iOS. La configuration absente constatée sur Windows 1.0.0 vient des builds officiels ; les sources communes et scripts ont été corrigés pour les prochains paquets. Les applications déjà installées sont inchangées.

### Runtime ExLlama optionnel : avis supplémentaires identifiés

Le contrôle élargi des exigences Python repère encore `torch==2.9.0+cu128` et `transformers==4.57.1` dans `transformers-server/requirements-exllama.txt`. Le scan OSV de 18 versions Python épinglées renvoie 18 identifiants d'avis, dont des alias, uniquement pour ces deux anciennes versions. Certains avis concernent l'exécution de code lors du chargement de contenus non fiables ; l'exploitabilité dans le parcours ExLlama de Novera n'a pas été démontrée. Ces versions ne sont **pas considérées comme corrigées**. Aucun environnement ExLlama géré n'a été trouvé au chemin local prévu lors du contrôle.

Les roues ExLlama y sont liées à Python 3.12, Torch 2.9.0 et CUDA 12.8. Une mise à jour isolée de Torch/Transformers ne constitue pas une correction validée : il faut reconstruire ou remplacer la combinaison, puis tester EXL2/EXL3 sur GPU avant diffusion de ce runtime. Ce point reste ouvert pour la préparation de la 1.0.1. Voir [le scan Python et ses limites](deliverables/security-remediation-2026-11-06/python-osv.json) et [le bilan global](deliverables/security-remediation-2026-11-06/ETAT_GLOBAL.md). Les dépendances Python transitives et les exigences non verrouillées par `==` ne sont pas couvertes par ce scan.

## Signaler une vulnérabilité

Contacter le mainteneur à [contact.novera.tronabs@gmail.com](mailto:contact.novera.tronabs@gmail.com), en indiquant version, plateforme, conditions et reproduction minimale. Ne pas inclure de clés API, mots de passe, conversations privées ou documents confidentiels. Pour une vulnérabilité exploitable, privilégier ce contact privé avant une issue publique.

## Références et limites

L'[audit local du 6 novembre 2026](deliverables/security-audit-2026-11-06/AUDIT.md) conserve l'état initial et ses preuves. Il décrit des sources antérieures aux corrections ; ses contrôles de reproduction ne sont pas des assertions sur l'état corrigé.

[RUSTSEC-2026-0436](https://rustsec.org/advisories/RUSTSEC-2026-0436.html) · [Permissions distantes Tauri](https://v2.tauri.app/security/capabilities/#remote-api-access) · [Disponibilité des versions publiques](docs/LAUNCH_STATUS.md).

Ces contrôles ne constituent ni une certification indépendante ni un pentest exhaustif. Une correction locale, une compilation réussie, une CI réussie et une publication sont des étapes différentes.


## Complément : transcription visible et intégrité des bundles

Le retour du mainteneur sur `kv_unified` provient de constantes `SETTINGS` non substituées à la compilation des extensions. Les options Rolldown sont corrigées et huit bundles sont contrôlés avant assemblage. Ce défaut de fonctionnement n'est pas présenté comme une vulnérabilité exploitable démontrée.

Les hypothèses vocales Windows sont maintenant transmises par événements au seul webview appelant, avec identifiant de capture et lecture JSON bornée (64 Kio par ligne, 256 Kio au total). Les écouteurs sont retirés et les réponses tardives/étrangères ignorées. Aucun transcript dans les journaux techniques ; le texte devient visible dans le brouillon et suit le parcours normal de conversation s'il est envoyé. Une reconnaissance incertaine reste manuelle. Les protections de focus, annulation et processus attaché au job restent en place. Le navigateur garde sa restriction aux API vocales locales.

Validation : 377 tests interface/extension, trois tests natifs, audio français synthétique reconnu avec 14 hypothèses, vraie réponse textuelle du GGUF dans un worker CPU isolé et quatre formats navigateur avec reconnaissance simulée. Aucun enregistrement de microphone ni son joué durant ces tests ; pas de nouvelle livraison Desktop. [Preuves et limites](deliverables/model-start-voice-2026-11-06/VALIDATION.md).


## Complément : maintien du mode vocal après correction

Le seuil supplémentaire de confiance 0,5 n'est plus appliqué aux résultats finaux acceptés par Windows : il provoquait un faux arrêt « indisponible ». Les hypothèses seules et le silence ne sont pas auto-envoyés. La correction manuelle coupe la capture ; Envoyer conserve la session autorisée, permet la lecture et la reprise de l'écoute. Un clic Arrêter, la perte de focus et le changement de contexte continuent à terminer la session. Capture et synthèse ont des identifiants distincts pour qu'une annulation ne révoque pas l'opération suivante.

Les diagnostics ne contiennent que la phase de l'erreur ; pas de mots reconnus ni de réponse. La synthèse vise le périphérique Windows par défaut, sans changer les réglages audio système. Les tests ont produit un WAV synthétique non silencieux, sans enregistrement utilisateur ni lecture sur haut-parleurs. 111 tests ciblés et trois tests natifs réussis. La précision réelle et l'audio natif Omni restent à valider. [Preuves et limites](deliverables/voice-continuous-2026-11-06/VALIDATION.md).


## Complément : contrôle de premier plan du vocal Windows

Le défaut persistant a été reproduit : WebView2 et fenêtre au premier plan, mais cache `is_focused()` de Tauri faux. Le vocal compare désormais le HWND de la fenêtre appelante à la véritable fenêtre racine au premier plan. Une autre fenêtre du même processus ne suffit pas. Les contrôles avant capture et après enregistrement restent en place ; une surveillance native toutes les 75 ms interrompt le helper lors d'une perte réelle de premier plan, même si aucun événement de focus fiable n'arrive. Les faux événements liés au focus d'un enfant WebView2 ne ferment plus la session. Fermeture/destruction et annulation explicite restent prioritaires.

L'annulation est conservée avant l'analyse d'une sortie interrompue et ne provoque plus de faux message d'indisponibilité. Aucun élargissement d'ACL ni autorisation de capture en arrière-plan. Le test de capture matérielle est explicitement ignoré par défaut, et n'a été lancé qu'après la demande du mainteneur de faire les tests.

Validation réelle sur un profil temporaire : micro reconnu, cinq hypothèses et résultat final, synthèse jouée et confirmée audible par le mainteneur ; minimisation du même exécutable interrompt la capture avec `cancelled`. Aucun audio ni texte capturé conservé. 115 tests interface, quatre tests natifs et un diagnostic micro manuel réussis. Une compilation **debug de test**, distincte d'une livraison Desktop, a permis cette validation ; l'installation personnelle reste inchangée. [Preuves et limites](deliverables/voice-focus-2026-11-06/VALIDATION.md).


## 7 novembre — son, régénération et réglages LFM3

Petit bouton de son sous le micro, préférence persistante commune aux voix natives LFM3 et système pour les modèles classiques. Lecture restaurée après régénération ; mode muet sans synthèse et sans interrompre durablement la conversation. Nombres français dans les phrases préparés en mots. Réglages personnels Omni contrôlés en lecture seule : température texte du GGUF déjà à 0, contexte 32768 ; valeurs manquantes bornées à 2048 tokens et raisonnement Omni auto désactivé par requête. Choix explicites préservés, fichiers personnels inchangés. 206 tests ciblés, TypeScript et build web réussis ; 104 catalogues à 2434 clés. Test réel Windows : lecture initiale/régénérée, silence après coupure, deux voix Omni et voix système terminées. Qualité phonétique des nouveaux essais et autres plateformes non certifiées. [Preuves et limites](deliverables/voice-controls-2026-11-07/VALIDATION.md).


## 7 novembre — fluidité vocale

Lecture continue optimisée pour les deux chemins vocaux : préparation d’un extrait LFM3 en avance et programmation sur l’horloge audio ; file navigateur locale limitée à deux énoncés ; réponses Windows usuelles conservées dans une session système jusqu’à 4500 caractères. Dernière phrase conservée et attendue avant reprise de l’écoute, erreurs natives signalées, annulation maintenue. Test réel Omni masculin/féminin : huit phrases jouées, six transitions sans intervalle ajouté ; dernière phrase retranscrite exactement dans les deux voix. Voix système Windows terminée. Le mainteneur confirme « Oui, lecture fluide et complète ». 214 tests, TypeScript, ESLint ciblé et build web réussis. La vitesse du matériel et les moteurs système peuvent encore imposer des pauses ; les autres plateformes ne sont pas certifiées. [Preuves et limites](deliverables/speech-flow-2026-11-07/VALIDATION.md).


## 7 novembre — tolérance de saisie pour la météo

Le déclencheur météo accepte désormais « quel temp aujourd’hui » sans s. La recherche restait auparavant facultative et LFM3 pouvait refuser malgré Internet activé. Test réel Windows Omni : recherche avec la formulation exacte, sources récupérées, réponse citée ; régénération avec nouvelle recherche et lecture de page réussie. 238 tests dans 10 fichiers, TypeScript, ESLint ciblé et build web réussis ; contrats vérifiés sur 12 routes de fournisseurs. Réglages personnels inchangés, véracité des prévisions non certifiée. [Preuves et limites](deliverables/weather-typo-2026-11-07/VALIDATION.md).


## 7 novembre — citations et langue de la voix

Nettoyage vocal renforcé pour les liens « image », les URL utilisées comme libellés et la forme réelle [[cite:source]](URL), dont l’adresse restait auparavant à lire. Traitement commun aux voix natives LFM3 et système, sans modifier les messages ni ouvrir les liens. Test réel Windows : deux phrases dans les deux voix LFM3, quatre WAV terminés, langue fr, zéro adresse envoyée, enchaînement sans intervalle ajouté ; voix système terminée. Le mainteneur confirme « Oui, les deux restent en français, sans lien ». 241 tests, TypeScript, ESLint ciblé et build web réussis ; fidélité de tout autre texte et autres plateformes non certifiées. [Preuves et limites](deliverables/source-links-speech-2026-11-07/VALIDATION.md).


## 7 novembre — reprise après recherche et préparation web

Correction de la réponse météo qui reprenait un exercice précédent : synthèse web LFM3 recentrée sur la question actuelle et ses résultats, historique conservé ; rappel commun après outils et date locale. Le vocal attend la vraie réponse finale, sans consommer une étape vide ni une ancienne réponse. Test Windows réel des trois questions puis régénération : météo lue les deux fois, confirmé par le mainteneur. Préparation DuckDuckGo en arrière-plan après restauration des réglages quand Web est actif, sans recherche fictive ; service prêt avant la demande, essai indicatif 10 s contre 22 s auparavant. Web-off respecté sur un nouveau démarrage. 298 tests réussis, un ignoré, TypeScript, ESLint ciblé et build web réussis. Le ciblage du contexte des petites familles audio locales et la variabilité du réseau sont détaillés dans les limites. [Preuves et limites](deliverables/web-turns-prewarm-2026-11-07/VALIDATION.md).


## 7 novembre — modèle commun et intégrité de la paire

LFM3-Omni-2B Q4_K_M et son mmproj deviennent la recommandation par défaut des interfaces Desktop, Android et iOS ; Nemotron reste disponible en alternative texte. Explications dans les 104 catalogues (2 435 clés). Contexte initial : 32 768 jetons sur ordinateur, 2 048 sur mobile, sans écraser les réglages existants. Vérification native de la paire par taille et SHA-256, import dans le même dossier. 161 tests ciblés web, quatre tests de réglages et treize tests Rust réussis ; TypeScript et cinq builds de l'interface réussis. Les builds natifs et essais sur les autres systèmes restent à réaliser ; la voix native LFM3 reste Windows. [Preuves et limites](deliverables/default-omni-2026-11-07/VALIDATION.md).


## 7 novembre — catalogues API dans les 104 langues

Contrôle des 43 fournisseurs prédéfinis à partir des sources officielles et de trois API publiques. Mise à jour des présélections : GPT-6.1 Terra, Kimi K3.1 Pro, MiniMax M3.1 Flash, GLM 5.3 Flash, Hy4 ; ajout des variantes GPT Image 2.6, Gemini Omni 1.2 et FLUX 3 prises en charge. Les 104 langues utilisent le même catalogue, avec noms et identifiants officiels ; action de rafraîchissement accessible traduite partout. Suppression de la limite de dix résultats ; nouveaux champs BFL testés. 194 tests ciblés et trois tests publics réels réussis ; TypeScript, lint des sources concernées et cinq builds de l'interface réussis. Aucun appel payant ni clé utilisateur, aucun paquet natif publié. Les déploiements Azure/IBM et la disponibilité régionale restent propres au compte. [Contrôle détaillé et limites](deliverables/api-catalog-2026-11-07/VALIDATION.md).


## 7 novembre — passage des sources en 1.0.1 et notes complètes

Sur demande explicite du mainteneur, les sources de l’application et de la CLI passent en **1.0.1** le 7 novembre ; verrous Cargo applicatifs synchronisés. Android passe au **versionCode 1000013**, avec la même identité et le même certificat. Le configurateur synchronise aussi les propriétés Gradle déjà générées pour éviter de reconstruire avec une ancienne version. Aucun paquet 1.0.1 compilé ou publié dans ce lot. Le mainteneur a confirmé « tout marche au top » sur sa compilation Desktop avant ce changement de numéro.

Les **104 README** contiennent désormais les notes complètes de préparation : sécurité, confidentialité, 24 langues supplémentaires, moteur llama.cpp v0.9.0/b12110 et commit, modèles LFM3/Nemotron, contexte 32K ordinateur/2K mobile, catalogues API, voix, micro et son, recherche web, optimisations et repli des commandes du bas sans déplacer la saisie. Tableaux synchronisés avec les sources : 43 profils dont 42 cloud, 58 préréglages média (30 image, 24 vidéo, quatre musique), 2 435 clés dans les 104 catalogues. Traductions assistées et registres écrits régionaux signalés ; relecture native non certifiée.

Contrôles : 104 fichiers appliqués et empreintes vérifiées, aucun nouveau lien local cassé, liens publics 1.0.0 conservés ; 24 tests de préparation version/Android/readiness/vitrine réussis ; métadonnées Cargo verrouillées/hors ligne Desktop et CLI en 1.0.1. Vitrine préparée et vérifiée localement à 1365 et 390 px, notes fermées et ouvertes, 104 liens de langues, aucune image cassée ni débordement. Une référence moteur longue débordait sur mobile : retour à la ligne corrigé. Aucun changement GitHub/Pages en ligne, commit, push ou publication ; les paquets natifs et la vraie transition publique 1.0.0 → 1.0.1 restent à valider. [Résultats et empreintes](deliverables/full-update-2026-11-06/readmes-1.0.1/validation.json).
