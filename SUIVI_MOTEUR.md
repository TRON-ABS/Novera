# Suivi du moteur llama.cpp de Novera

Relevé technique historique du **23 octobre 2026**, inclus dans les sources le **25 octobre 2026**. Le pin actuel des sources reste b11823. Les chemins et mesures ci-dessous décrivent leur époque ; les noms internes récents sont documentés dans [NOVERA_INTERNAL_NAMES.md](docs/NOVERA_INTERNAL_NAMES.md). La publication de ce relevé ne constitue pas une nouvelle compilation ni une modification de l’installation.

**Version actuellement installée : llama.cpp b11823**, commit
`5c19a5a7560024bb19745b4ae04a75613d4b9aa3`. Application complète et runtime
CPU/CUDA reconstruits, M02/M03/M01/M04 déployés et testés sur l’exécutable installé.
Les 324 fichiers de configuration contrôlés et les réglages racine sont inchangés.
Les modes mesuré et n-grammes restent optionnels, avec leurs gardes de compatibilité.
La calibration b11823 confirme −13,8 % de TTFT à 8 192 tokens en 2048/2048
contre 512/512 sur Tron Q6/f16. Cette mesure ne s’applique pas directement au
profil utilisateur long en bf16. [Rapport de mise à jour et preuves](deliverables/engine-update-2026-10-22/report.md).
Les chiffres b11721 ci-dessous décrivent les campagnes historiques.

Ce fichier regroupe les pistes de performance, les mesures locales et les travaux
restants. **M02, M03, M01 et M04 sont implémentés dans les sources et validés
localement. Les 18 points du suivi sont traités ; les six validations finales ont été
exécutées localement, avec leurs résultats limités ou négatifs documentés.** Aucun réglage du profil Jan installé n'a été
modifié pour ces tests. Aucun commit ni PR n'a été créé pour ces travaux.

## Priorités proposées

L’ordre demandé M02 → M03 → M01 → M04 a été suivi. Les
gains observés dans des scénarios différents ne doivent pas être additionnés.

| Priorité | ID | Amélioration possible | Preuve disponible | État |
| --- | --- | --- | --- | --- |
| 1 | M02 | Charger les modèles hors du verrou global du registre | A déjà prêt : premier token à 37 ms normalement, 930 ms pendant le chargement de B | Implémenté : 930 → 34 ms pendant B ; contrôles natifs réussis |
| 2 | M03 | Choisir batch/microbatch selon le modèle, le GPU et la mémoire disponible | À 8 192 tokens : 512/512 → 2 048/2 048 réduit le TTFT de 15,2 %, avec +282 MiB observés | Profil mesuré volontaire + repli manuel ; UI réelle testée ; hydratation des modes corrigée |
| 3 | M01 | Garder plusieurs conversations récentes dans des slots résidents, avec repli disque | À 8 192 tokens : 20 ms en mémoire, 187 ms via disque, 1 586 ms par recalcul | Affinité bornée et repli disque ; 219 → 43 ms avec deux slots |
| 4 | M04 | Réserver la spéculation n-gramme aux usages qui en bénéficient | Copie répétitive : 128 → 430 tokens/s ; pas de gain clair en prose/code | Option texte répétitif ; désactivée par défaut |

## Conditions des mesures

- Modèle principal : **Tron-v1-Q6_K**, LFM2 2,7B, fichier de 2 221 614 624 octets.
- GPU : **RTX 5070 Laptop**, mémoire totale annoncée 8 151 MiB, pilote 617.42.
- Campagnes initiales : worker local précompilé, llama.cpp **b11721**, version 0.7.0 ; son empreinte
  SHA-256 figure dans chaque rapport. Aucune compilation nouvelle de l'arbre
  courant n'a été effectuée pour ces campagnes initiales. Pour les implémentations,
  le worker Rust et le shim ont ensuite été recompilés avec les archives natives
  b11721 existantes ; empreintes distinctes conservées dans les données.
- Workers isolés du profil utilisateur, requêtes HTTP locales authentifiées.
- TTFT : délai jusqu'au premier fragment de texte généré. Le débit natif de
  génération mesure une autre phase et ne doit pas être confondu avec ce délai.
- Fréquences GPU variables ; cache de fichiers Windows non vidé. La VRAM des
  tests 3 et 4 est un relevé global après requête, pas un pic par processus.
- Les conclusions sont locales à ce matériel, ce modèle et ces charges. Les
  rapports détaillent les limites et les variations entre répétitions.

## M01 — Conversations résidentes et cache KV

**Implémentation du 22/10 :** affinité sur deux slots déjà alloués au maximum,
réservation jusqu’à la fin du flux, remplacement LRU inactif et repli disque.
Le routage n’augmente pas le nombre de slots natifs. Un seul slot conserve le
comportement disque ; deux slots nécessitent une allocation native préalable.
42 mesures sur le worker final : 8 192 tokens **219,0 → 42,9 ms**, sauvegarde
104,1 ms et restauration 54,4 ms avec un slot, toutes deux nulles avec deux.
Surcoût relevé après requête : +146 MiB GPU global, +137,4 MiB mémoire privée du
worker, contexte constant par slot. Pas une mesure de pic ni un stress OOM.
Conversation C/repli B, clients anonymes, suppression et conversations croissantes
contrôlés. [Preuves finales](deliverables/engine-improvements-2026-10-22/report.md).

Les chiffres ci-dessous décrivent la **campagne initiale**, avant implémentation.

**Objectif :** réduire la pause au retour sur une conversation, en conservant
son état en mémoire quand le budget le permet.

Résultats médians, sept répétitions par cellule, 84 mesures de confirmation :

| Tokens du prompt | Préfixe résident | Retour par disque | Recalcul sans cache |
| ---: | ---: | ---: | ---: |
| 256 | 15,9 ms | 36,2 ms | 76,2 ms |
| 512 | 18,9 ms | 35,8 ms | 142,7 ms |
| 2 048 | 14,9 ms | 63,7 ms | 385,5 ms |
| 8 192 | 19,5 ms | 187,3 ms | 1 585,6 ms |

L'écart observé à 8 192 tokens est d'environ **168 ms entre résidence et disque**.
Il indique une marge possible, pas le gain garanti d'un moteur à plusieurs slots.
Le disque reste utile : il évite ici environ 1,4 seconde de recalcul. La sauvegarde
sortante et la restauration entrante n'ont pas été chronométrées séparément.

Suivi des travaux :

- [x] Mesurer séparément sauvegarde, restauration et sélection de slot.
- [x] Prototyper une affinité conversation → slot, avec nombre de slots et budget
  mémoire bornés ; préserver le cache résident de la conversation active.
- [x] Mesurer le coût réel des slots supplémentaires en RAM/VRAM. La taille d'un
  fichier KV sur disque ne suffit pas à déterminer ce coût.
- [x] Préserver le repli disque, les contrôles d'identité du cache, l'effacement
  des conversations et l'absence d'écrasement d'un slot occupé.
- [x] Comparer avant/après sur des conversations croissantes, des changements
  fréquents de conversation et une situation de mémoire limitée. Conversations
  croissantes et changements validés ; stress final sous plafond processus de
  6 656 Mio et caches 16/192 Mio réussi, deux contextes GPU chargés.

Preuves : [rapport](deliverables/kv-cache-benchmark-2026-10-22/report.md),
[données](deliverables/kv-cache-benchmark-2026-10-22/results.json),
[harnais](scripts/benchmark-kv-cache.py).
Code principal : [gestion HTTP et slots](src-tauri/plugins/tauri-plugin-llamacpp/src/engine/http.rs),
[persistance](src-tauri/plugins/tauri-plugin-llamacpp/src/engine/slots.rs).

## M02 — Chargement hors du verrou global

**Implémentation du 22/10 :** réservation, initialisation hors verrou puis
publication contrôlée. Chargements natifs sérialisés séparément, plafond de
modèles préservé, demandes doublonnées mutualisées. Unload/reload/arrêt annulent
la publication obsolète ; les générations gardent leur moteur et leur réservation.
Après correction, sept répétitions : TTFT **34,2 ms pendant B** contre 930,3 ms
avant, `/models` **20,8 ms** contre 907,7. Trois essais GPU/GPU avec Tron et d1
distincts : 34,7 ms avant B, 33,6 pendant B. Cinq contrôles natifs finaux réussis.
[Rapport et données](deliverables/engine-improvements-2026-10-22/report.md).

Les chiffres ci-dessous décrivent la **campagne initiale**, avant correction.

**Objectif :** continuer à servir un modèle prêt pendant qu'un autre se charge.

Sept répétitions par mode, 14 essais et 168 requêtes de contrôle :

| Requête sur A déjà chargé | Avant B dans le worker partagé | B charge dans le worker partagé | B charge dans un worker indépendant |
| --- | ---: | ---: | ---: |
| Premier token | 37,2 ms | 930,3 ms | 39,0 ms |
| Tokenisation | 20,5 ms | 912,1 ms | 21,7 ms |
| Liste des modèles | 20,6 ms | 907,7 ms | 21,3 ms |
| Contrôle HTTP sans registre | 20,9 ms | 21,2 ms | 21,4 ms |

B est un second contexte du même GGUF, chargé sur CPU pour écarter la concurrence
GPU/GPU. Les routes prenant le registre attendent presque toute son initialisation.
Le contrôle séparé appuie l'attribution au verrou ; **il ne représente pas un
moteur corrigé**. Aucun chronométrage interne du mutex n'a été réalisé.

Suivi des travaux :

- [x] Concevoir une réservation de chargement sous verrou, une initialisation
  native hors verrou, puis une publication du résultat sous verrou.
- [x] Préserver le plafond de modèles résidents et dédupliquer les demandes
  simultanées de chargement du même modèle.
- [x] Définir le comportement en cas d'échec, annulation, arrêt du worker,
  rechargement de configuration ou déchargement concurrent.
- [x] Vérifier les requêtes en cours et les transitions d'état pendant ces cas.
- [x] Relancer le harnais avant/après, puis compléter par un chargement GPU/GPU
  et plusieurs modèles différents. Mesurer la contention matérielle restante.

Critère de réussite : les requêtes sur A ne doivent plus attendre la fin complète
du chargement de B à cause du registre ; quantifier le délai résiduel.

Preuves : [rapport](deliverables/load-lock-benchmark-2026-10-22/report.md),
[données](deliverables/load-lock-benchmark-2026-10-22/results.json),
[harnais](scripts/benchmark-engine-load-lock.py).
Code principal : [chargement et dispatch](src-tauri/plugins/tauri-plugin-llamacpp/src/engine/http.rs),
[registre](src-tauri/plugins/tauri-plugin-llamacpp/src/engine/registry.rs).

## M03 — Réglages GPU et batching

**Implémentation du 22/10 :** réglage `Performance profile`, manuel par défaut.
Le mode mesuré utilise 2 048/2 048 seulement pour le domaine local calibré :
Tron Q6, b11721, RTX 5070 Laptop, contexte borné, un slot et marge mémoire.
Les autres cas gardent les valeurs manuelles. Après erreur native récupérable,
repli sur les batchs manuels sans modifier le preset utilisateur. Cette branche
a été testée avec une erreur de paramètre injectée ; un abort natif ne peut pas
être récupéré ainsi. Aucun autotuning général ni mesure d’autres GPU revendiqués.
[Domaine précis et validation](deliverables/engine-improvements-2026-10-22/report.md).

**Objectif :** retenir un compromis mesuré entre premier token, débit et mémoire,
avec une configuration adaptée au matériel et au modèle.

Sept profils explorés, 63 mesures ; confirmation des deux finalistes par 24
mesures, six par taille/profil. À 8 192 tokens, Flash Attention activé et K/V f16 :

| Mesure | Batch/microbatch 512/512 | Batch/microbatch 2 048/2 048 |
| --- | ---: | ---: |
| Premier token | 1 623 ms | 1 376 ms — réduction de 15,2 % |
| Traitement du prompt | 5 161 tokens/s | 6 083 tokens/s |
| Génération | 112,1 tokens/s | 121,2 tokens/s — hausse médiane de 8,1 % |
| Mémoire GPU globale observée | 3 248 MiB | 3 530 MiB — hausse de 282 MiB |

Le gain de génération est plus variable que celui sur le traitement du long
prompt. Les douze textes de confirmation à 8 192 tokens sont identiques par
empreinte. Les résultats à 2 048 tokens ne garantissent pas cette identité.

Dans la matrice, désactiver Flash Attention ou réduire le microbatch à 128
dégrade le cas long. Augmenter seulement le batch à 2 048, en gardant le microbatch
à 512, n'apporte pas le même gain. Q8/Q4 pour le cache K/V économisent de la mémoire
sans accélération nette démontrée ; leur qualité de réponse n'a pas été évaluée.

Suivi des travaux :

- [x] Valider 2 048/2 048 dans un usage applicatif réel sur cette machine,
  avec conversations mises en cache et mémoire partagée avec d'autres modèles.
  Réalisé dans Jan compilé avec Tron et Qwen, UI/YAML/preset, cache et API vérifiés ;
  un chat libre atteint la limite de contexte, résultat négatif conservé.
- [x] Définir un profil de performance par matériel/modèle/contexte, plutôt
  qu'imposer ce réglage comme valeur universelle.
- [x] Si un réglage automatique est développé : limiter son coût, mémoriser le
  résultat, conserver une marge mémoire et prévoir un repli après échec. Réalisé
  sous forme de calibration fixe versionnée, sans recherche au démarrage, avec
  marge mémoire et repli sur les batchs manuels après erreur récupérable.
- [x] Étendre les mesures à d'autres tailles de modèles et GPU, et mesurer les
  pics de mémoire avant toute sélection automatique. Deux modèles CUDA et
  Qwen sur GPU Intel/Vulkan testés, pics échantillonnés à 100 ms. Le profil
  automatique reste borné à la calibration initiale ; pas de généralisation.

Preuves : [rapport](deliverables/engine-tuning-benchmark-2026-10-22/report.md),
[matrice](deliverables/engine-tuning-benchmark-2026-10-22/matrix-results.json),
[confirmation](deliverables/engine-tuning-benchmark-2026-10-22/confirmation-results.json),
[harnais](scripts/benchmark-engine-tuning.py).
Code de configuration : [générateur de presets](extensions/llamacpp-extension/src/preset.ts).

## M04 — Décodage spéculatif ciblé

**Implémentation du 22/10 :** option volontaire `Repetitive text acceleration`,
désactivée par défaut, n-gramme lookup 3/draft 8. Priorité préservée au draft/MTP
existant et exclusion des embeddings. Les compteurs natifs confirment son
activation. Contrôle de six générations : copie 121,7 → 330,5 tokens/s, 91,2 %
d’acceptation ; simple contrôle à une répétition, pas une nouvelle campagne.
La faible acceptation en prose/code motive le défaut désactivé. Pas de coupure
adaptative par requête, ni de validation générale de qualité ou d’un couple MTP.
[Preuves et limites](deliverables/engine-improvements-2026-10-22/report.md).

**Objectif :** amortir le coût de génération lorsqu'un draft est suffisamment
souvent accepté, sans supposer que tous les contenus en bénéficient.

Tron ne possède pas de tête MTP identifiée et aucun draft compatible n'était
présent dans les emplacements vérifiés. **MTP, EAGLE, DFlash et DSpark ne sont pas
testés.** La campagne évalue `ngram-map-k`, sans modèle supplémentaire.

72 générations retenues, trois répétitions par tâche/profil/mode. Résultats
médians pour les réponses directes préfixées et des drafts de longueur 8 :

| Tâche | Référence | N-grammes | Acceptation des tokens proposés |
| --- | ---: | ---: | ---: |
| Prose | 120 tokens/s | 119 tokens/s | 4,2 % |
| Code | 121 tokens/s | 125 tokens/s | 7,1 % |
| Copie répétitive | 128 tokens/s | 430 tokens/s | 91,2 % |

Le gain de **3,37× sur la copie** concerne un cas synthétique très répétitif ; les
textes sont identiques à la référence dans les trois répétitions. Prose et code
produisent des textes différents : aucun gain à qualité identique n'est établi.

Le template de Tron ignore `enable_thinking=false` et ouvre systématiquement
`<think>`. Le volet direct préremplit donc explicitement `<think></think>` et deux
sauts de ligne, sans modifier le template installé. Le rapport sépare ce volet
du raisonnement habituel du modèle. La vérification d'activation utilise les slots
natifs et les compteurs d'acceptation, pas les seuls paramètres par défaut de `/props`.

Suivi des travaux :

- [x] Évaluer les n-grammes sur des tâches réelles de répétition/édition.
  Une option volontaire est désormais exposée dans les sources ; son adoption
  a été évaluée sur six tâches réelles du dépôt, trois répétitions par mode.
  Même score strict avec/sans n-grammes, textes différents sur une tâche JSON ;
  aucune adoption générale justifiée.
- [x] Mesurer les régressions lorsque l'acceptation est faible, et étudier une
  désactivation adaptative plutôt qu'une activation générale. Faible acceptation
  confirmée ; choix retenu : désactivé par défaut, activation manuelle ciblée.
  Aucune adaptation automatique par requête implémentée.
- [x] Si la voie MTP/EAGLE doit être poursuivie, sélectionner un couple cible/draft
  compatible et réaliser une nouvelle campagne distincte. MTP testé sur
  Qwen 0,8B officiel avec sa tête native : 18 paires identiques, 94,3 %
  d’acceptation, 191,7 → 289,8 tokens/s. EAGLE reste hors de cette campagne.
- [x] Vérifier qualité et stabilité des sorties avant d'adopter un réglage.
  36 générations n-grammes et 36 MTP comparées, sorties/règles conservées.
  Qualité limitée déjà en référence : conserver le défaut désactivé, aucune
  certification générale ni assimilation de « vérifié » à « tous critères réussis ».

Preuves : [rapport](deliverables/speculative-benchmark-2026-10-22/report.md),
[raisonnement](deliverables/speculative-benchmark-2026-10-22/reasoning-results.json),
[réponses directes](deliverables/speculative-benchmark-2026-10-22/direct-results.json),
[comparaison des textes](deliverables/speculative-benchmark-2026-10-22/text-comparison.json),
[métadonnées](deliverables/speculative-benchmark-2026-10-22/model-metadata.json),
[harnais](scripts/benchmark-engine-speculative.py).

## Observations complémentaires

- Le statut spéculatif effectif doit être distingué de la configuration par
  défaut d'une requête : `/props` seul n'a pas suffi pour le vérifier dans ces tests.
- La désactivation du raisonnement mérite un contrôle de capacité du template et
  une vérification du prompt effectif ; ne pas annoncer son application si le
  template l'ignore.
- Les copies de chaînes et le transport streaming sont désormais **mesurés** :
  252 cellules de microbenchmark Rust et 48 complétions sur b11823, moteur direct
  puis Jan installé. Les 24 paires avec/sans streaming ont la même sortie ; lecture
  fragmentée Unicode, consommateur lent et reprise après annulation réussis.
  `String → Bytes` et le proxy OpenAI ne recopient pas le contenu. La copie/validation
  UTF-8 à la frontière native coûte environ 0,16–0,18 µs pour 512 octets ; coût estimé
  maximal de 0,047 ms par réponse mesurée. Aucune optimisation de production retenue.
  Le résidu client hors timers natifs vaut environ 25–40 ms en streaming via Jan,
  sans permettre d’isoler le coût du proxy. La route chat, les conversions Anthropic
  et le rendu UI ne sont pas couverts par cette campagne complémentaire.
  [Rapport et preuves](deliverables/engine-streaming-2026-10-22/report.md).

## Prochaine étape proposée

Les quatre implémentations et les **six validations finales sont exécutées**.
Le suivi contient **18 points traités sur 18**, aucun point de cette campagne
locale restant à exécuter. Cela ne signifie pas que tous les usages de production
ou tous les critères de qualité des modèles sont validés.

Les deux pistes secondaires copies/transport ont aussi été testées après
l’installation de b11823. Aucun gain utilisateur ne justifie de modifier leur
chemin actuel sur la base de ces résultats. Pour approfondir le délai initial,
instrumenter les frontières du même processus avant de tester TCP_NODELAY ou
l’ordonnancement ; les différences de deux campagnes successives ne suffisent pas.

| Validation finale | Résultat local |
| --- | --- |
| M01 mémoire contrainte | Deux contextes GPU, plafond processus 6 656 Mio, 48 changements, caches disque 16/192 Mio bornés ; réussi |
| M03 application réelle | Frontend et Jan compilés ; correction d’hydratation des deux options ; UI/YAML/preset, deux modèles, API et cache vérifiés ; un chat libre atteint sa limite de contexte |
| M03 autres GPU/modèles et pics | Tron/Qwen sur RTX CUDA, Qwen sur Intel Vulkan ; 36 mesures et pics échantillonnés ; batch 2 048 non universel |
| M04 tâches réelles | Six tâches du dépôt, 36 générations n-grammes comparées ; bénéfice ciblé, erreurs de consigne conservées |
| M04 couple MTP compatible | Qwen officiel avec tête MTP native ; 36 générations, 18 paires identiques, gain local mesuré |
| M04 qualité/stabilité | Même score strict avec/sans spéculation et sorties stables sur trois passages ; pas d’adoption générale justifiée |

**Décision :** garder les réglages manuels par défaut, limiter le profil mesuré à
son domaine calibré, laisser les n-grammes désactivés par défaut. Ne pas attribuer
les résultats MTP de Qwen à Tron. Les pics sont échantillonnés, pas des pics exacts
d’allocateur. EAGLE, AMD et macOS ne sont pas couverts par cette campagne.

[Rapport final des six validations et données](deliverables/engine-validation-2026-10-22/report.md).
La copie de test est arrêtée ; Jan installé et son profil utilisateur sont
inchangés. 173 tests web ciblés passent après la correction ; les 194 tests Rust
et 88 tests preset/profil de l’étape précédente ne sont pas annoncés réexécutés.
Aucun commit, PR, validation CI, approbation ni fusion pour ces changements.

Pour chaque évolution, ajouter ici : date, périmètre, fichiers modifiés, mesures
avant/après et limites. Renseigner ensuite le commit et la PR s'ils existent, en
distinguant validation locale, CI, approbation et fusion.

## Journal

| Date | Action | Résultat |
| --- | --- | --- |
| 22/10/2026 | Test 1 — cache KV | Résidence/disque/recalcul comparés ; prototype multi-slot restant |
| 22/10/2026 | Test 2 — chargement sous verrou | Blocage partagé reproduit ; contrôle séparé réactif |
| 22/10/2026 | Test 3 — GPU et batching | Candidat 2 048/2 048 confirmé localement ; pas de réglage appliqué |
| 22/10/2026 | Test 4 — spéculation | Gain sur copie répétitive ; autres méthodes et qualité non validées |
| 22/10/2026 | Création de ce suivi | Résultats, priorités, preuves et travaux restants regroupés |
| 22/10/2026 | M02 → M03 → M01 → M04 implémentés | Worker/shim compilés ; 194 + 88 + 136 tests réussis ; 42 mesures finales M01 et contrôles natifs |
| 22/10/2026 | Bilan actualisé | 12/18 points traités ; 6 validations restantes ; installation utilisateur inchangée |
| 22/10/2026 | Six validations finales exécutées | 48 changements sous plafond 6 656 Mio, 36 profils CUDA/Intel, 72 générations qualité/MTP ; application réelle et cache testés |
| 22/10/2026 | Défaut révélé et corrigé | Hydratation des deux options depuis model.yml ; 173 tests web ciblés réussis ; application reconstruite et retestée |
| 22/10/2026 | Bilan final local | 18/18 points traités ; limites de qualité/contexte conservées ; pas d’activation générale ni modification de l’installation |
| 22/10/2026 | Déploiement b11823 | Application complète, moteur CPU/CUDA et M01–M04 installés ; tests sur l’exécutable installé ; réglages préservés, sauvegarde conservée |
| 22/10/2026 | Copies de chaînes et streaming mesurés | 252 cellules Rust, 48 complétions direct/Jan b11823, 24 paires identiques, consommateur fragmenté/lent et annulation ; aucune optimisation de production justifiée ; rapport complémentaire conservé |
| 23/10/2026 | Spark-X2.6-4B Q6_K validé dans Jan installé | 7/7 contrôles : chat, désactivation effective du raisonnement, streaming Unicode, JSON structuré, outils classiques/streaming et résultat d’outil ; contexte réglé 68 192, bf16, quatre slots natifs ; pas de remplissage du contexte ; [rapport](deliverables/spark-validation-2026-10-23/report.md) |
