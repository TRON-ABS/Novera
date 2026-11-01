# Suivi de TokenEconomizer pour Novera

## Relevé du chantier composants gérés — 1er novembre 2026

Relevé cumulatif du dépôt, obtenu via le point d'entrée `te_bootstrap.py cli --host codex --cwd C:/msys64/home/jmsga/Novera status` (le wrapper Bash ne démarre pas dans ce bac à sable Windows) :

```text
TokenEconomizer -- tron-abs/novera (codex)
  repository   C:\msys64\home\jmsga\Novera, identified by its origin remote (github.com/tron-abs/novera)
  state        C:\Users\jmsga\.tokeneconomizer\repos\novera-ec0512828e\codex
  config       microskills=envfacts toolprune=auto loopguard=nudge repomap=off mode=auto shadow=False
  sessions     5 folded, 22.6M effective tokens, plugin overhead 102.8k (0.5%)
  microskills  0 fact(s) injected at session start (5 sessions learned from)
  toolprune    2 sessions (60 prompts) observed, catalog: capabilities; proposed capabilities: collaboration, goals; applied: -
  loopguard    envelope 69 tool calls (35 ended-green turns); 0 redirect(s), 0 still-stuck notice(s) over 43 turns
```

Ce cumul n'isole pas le coût du présent chantier. Aucun gain de tokens, de qualité ou de quota n'est démontré ; aucune exclusion appliquée ni redirection observée dans ce relevé. Les changements du gestionnaire et leurs validations sont décrits dans le suivi des composants, sans attribution de leurs résultats au plugin.

Date de mise en place : 31 octobre 2026.

## Objectif du test

Apprendre les particularités récurrentes de Novera sans appel de modèle pour cet apprentissage, et détecter les boucles d'échecs. Aucun gain de quota Plus ni maintien systématique de la qualité n'est établi pour notre installation.

## Installation locale

- Projet : [microsoft/TokenEconomizer](https://github.com/microsoft/TokenEconomizer).
- Révision téléchargée : `e428fc91b0f8ffecb5a596d56b14fe2f1485a5f9`.
- Plugin : `tokeneconomizer@tokeneconomizer`, version `0.1.0`.
- Clone conservé dans `.build/tokeneconomizer-trial/source` ; ne pas le déplacer ou le supprimer tant que le plugin en dépend.
- Copie installée : `C:/Users/jmsga/.codex/plugins/cache/tokeneconomizer/tokeneconomizer/0.1.0`.
- Configuration de Novera : `C:/Users/jmsga/.tokeneconomizer/repos/novera-ec0512828e/config.json`.
- Codex CLI détecté : `0.166.0-alpha.5.1` ; les versions annoncées comme testées par le projet vont de `0.153.1` à `0.164.0` lors de cette installation.

Le plugin est installé dans Codex. Son exécution automatique dans une nouvelle session de l'application Desktop reste à vérifier ; l'installation seule ne prouve pas que les hooks sont chargés dans ce chat déjà ouvert. Les réglages ci-dessous sont propres au dépôt Novera, pas une configuration globale des autres projets.

## Réglages retenus

| Mécanisme | Réglage | Effet |
| --- | --- | --- |
| Apprentissage | `microskills=envfacts` | Apprend des faits d'environnement à partir d'échecs et de corrections récurrents, sans appel au modèle pour proposer ces faits. |
| Contrôle des boucles | `loopguard=nudge` | Activé à la demande de l'utilisateur ; peut consulter un modèle pour confirmer une boucle et rédiger une redirection. |
| Suppression d'outils | `toolprune=auto` | Activée le 1er novembre 2026 à la demande de l'utilisateur ; observe les usages puis écarte automatiquement les capacités inutilisées après une période d'inactivité. Les exclusions prennent effet à la session suivante. |
| Carte du dépôt | `repomap=off` | Désactivée. |

Le contrôle des boucles peut consommer du quota via ses propres appels. Il ne stoppe pas automatiquement une tâche : il redirige l'agent puis signale une boucle persistante. Il a besoin d'observations avant d'établir son fonctionnement habituel. Les faits injectés dans de futures conversations occupent eux-mêmes du contexte : « sans appels supplémentaires pour apprendre » ne signifie pas « aucun coût de contexte ».

## Commandes PowerShell de suivi

À exécuter depuis la racine de Novera. Elles passent directement par le script local et ne lancent pas de conversation IA.

```powershell
python .build/tokeneconomizer-trial/source/plugin/scripts/te_bootstrap.py cli --host codex status
python .build/tokeneconomizer-trial/source/plugin/scripts/te_bootstrap.py cli --host codex microskills
python .build/tokeneconomizer-trial/source/plugin/scripts/te_bootstrap.py cli --host codex config show
python .build/tokeneconomizer-trial/source/plugin/scripts/te_bootstrap.py cli --host codex doctor
```

Pour désactiver le contrôle des boucles :

```powershell
python .build/tokeneconomizer-trial/source/plugin/scripts/te_bootstrap.py cli --host codex config set loopguard=off
```

Pour consulter les exclusions, désactiver les futures exclusions automatiques ou restaurer les outils déjà écartés :

```powershell
python .build/tokeneconomizer-trial/source/plugin/scripts/te_bootstrap.py cli --host codex toolprune show
python .build/tokeneconomizer-trial/source/plugin/scripts/te_bootstrap.py cli --host codex config set toolprune=off
python .build/tokeneconomizer-trial/source/plugin/scripts/te_bootstrap.py cli --host codex toolprune restore
```

`toolprune=off` désactive le mécanisme ; utiliser `toolprune restore` pour rendre les capacités déjà écartées disponibles à la prochaine session. On peut aussi nommer les capacités à restaurer après `restore`. Les capacités restaurées ne sont plus écartées automatiquement par le plugin.

Pour désactiver également l'apprentissage :

```powershell
python .build/tokeneconomizer-trial/source/plugin/scripts/te_bootstrap.py cli --host codex config set microskills=off
```

Les écritures dans le stockage utilisateur peuvent nécessiter une autorisation du bac à sable. Dans un nouveau Codex CLI, les hooks peuvent demander une approbation via `/hooks` ; suivre l'écran de confiance puis démarrer une nouvelle session, conformément à la documentation du plugin.

## Validation et observations

- Téléchargement du dépôt officiel et installation par les commandes natives `codex plugin marketplace add` et `codex plugin add` : réussis.
- Lecture des réglages effectifs : apprentissage `envfacts`, contrôle `nudge`, outils et carte désactivés ; aucune alerte de configuration.
- Tests hors ligne : 56 tests réussis (apprentissage `envfacts`, configuration et hooks d'apprentissage/redirection, juges simulés). Exécutés avec Python 3.15.1 ; avertissements de dépréciation `re.split` dans le code amont, sans échec.
- Diagnostic hors bac à sable : stockage utilisateur accessible en écriture, projet Novera reconnu comme approuvé, aucun `errors.log`. Une migration de l'identité de stockage est annoncée pour le prochain démarrage automatique ; elle reste à vérifier avec les premiers hooks réels.
- Aucun test réel de boucle impliquant un appel de modèle n'a été lancé pendant cette mise en place.
- Aucune économie réelle, aucun fait appris sur Novera et aucun fonctionnement automatique Desktop ne sont encore validés.

Pour chaque observation future, consigner ici la date, le problème détecté, la recommandation, son résultat et les éventuels coûts supplémentaires. Ne pas copier de clés, de contenu privé de conversations ou de journaux bruts.

Les coûts estimés par le plugin ne constituent pas une mesure exacte du quota hebdomadaire de l'abonnement ChatGPT.

## Références

- [Installation et fonctionnement du plugin Codex](https://github.com/microsoft/TokenEconomizer/blob/main/plugin/README.md#codex).
- [Réglages du projet](https://github.com/microsoft/TokenEconomizer#settings).
- [Expériences publiées](https://github.com/microsoft/TokenEconomizer/blob/main/experiments/README.md).


### Observation du 31 octobre 2026 — LoRA / PEFT

La commande locale `status`, exécutée pendant l’ajout du support base + adaptateur, reconnaît le dépôt `tron-abs/novera` et les réglages précédents. Elle indique 0 session consolidée, 0 token effectif, 0 token de surcoût, 0 fait injecté, 0 redirection et 0 notification de boucle persistante. Aucune économie ne peut donc être mesurée à ce stade. Les tests de la fonctionnalité LoRA ne constituent pas une validation des hooks TokenEconomizer ; leur exécution automatique dans ce chat reste non démontrée.


### Observation du 31 octobre 2026 — ONNX / classement du Hub

La commande officielle locale `status` reconnaît 1 session consolidée et **873,1 k tokens effectifs**, avec **0 token de surcoût plugin (0,0 %)**. Elle indique 0 fait injecté, 0 redirection et 0 notification de boucle persistante ; l'enveloppe du contrôle de boucles n'est pas encore apprise (1 tour terminé sans erreur). Les réglages restent `envfacts`, `toolprune=off`, `loopguard=nudge`, `repomap=off`. Ce cumul n'isole pas le travail ONNX en cours et ne mesure ni économie démontrée ni quota hebdomadaire ChatGPT. Le rapport conserve les statistiques affichées, sans extrapolation.


### Observation du 31 octobre 2026 — correction des tests Tauri Windows

Relevé actualisé après correction du manifeste Common Controls v6 et validation : **1 153 tests Tauri réussis, aucun échec, 2 tests optionnels ignorés**, puis **2 tests ONNX Tauri réussis séparément**. La compilation desktop debug réussit aussi. [Rapport de validation](../deliverables/tauri-windows-tests-2026-10-31/validation.md), [consignes et état Novera](../NOVERA.md).

Les totaux TokenEconomizer restent à **1 session consolidée, 873,1 k tokens effectifs et 0 % de surcoût plugin**. Le compteur de tours terminés sans erreur passe de **1 à 2** ; l’enveloppe du contrôle de boucles reste non apprise. Toujours 0 fait injecté, 0 redirection et 0 notification de boucle persistante. Les réglages sont inchangés.

Sortie exacte de la commande locale officielle `status` :

```text
TokenEconomizer -- tron-abs/novera (codex)
  repository   C:\msys64\home\jmsga\Novera, identified by its origin remote (github.com/tron-abs/novera)
  state        C:\Users\jmsga\.tokeneconomizer\repos\novera-ec0512828e\codex
  config       microskills=envfacts toolprune=off loopguard=nudge repomap=off mode=auto shadow=False
  sessions     1 folded, 873.1k effective tokens, plugin overhead 0 (0.0%)
  microskills  0 fact(s) injected at session start (1 sessions learned from)
  toolprune    0 sessions (0 prompts) observed, catalog: none yet; proposed capabilities: -; applied: -
  loopguard    envelope not learned yet (2 ended-green turns); 0 redirect(s), 0 still-stuck notice(s) over 1 turns
```

**Interprétation : aucun gain encore démontré.** Les tokens effectifs sont un cumul observé, pas des tokens économisés. Un surcoût nul ne prouve pas une réduction de consommation. Ce relevé n’isole pas le coût du correctif Tauri ni celui du chat en cours. Les tests réussis valident Novera ; aucune redirection observée ne permet d’attribuer cette correction à TokenEconomizer. Une comparaison sur davantage de sessions reste nécessaire pour évaluer un bénéfice réel.


### Observation du 31 octobre 2026 — FP8 / NVFP4 pour les LLM

Après le lot de quantifications natives des LLM, la commande locale officielle `status` affiche **2 sessions consolidées**, **3,3 M tokens effectifs** et **0 token de surcoût plugin (0,0 %)**. Le contrôle de boucles n’a pas encore appris son enveloppe : 3 tours terminés sans erreur observés, 0 redirection et 0 notification de boucle persistante sur 6 tours. Toujours 0 fait injecté ; 2 sessions ont servi à l’apprentissage. Les réglages restent inchangés.

```text
TokenEconomizer -- tron-abs/novera (codex)
  repository   C:\msys64\home\jmsga\Novera, identified by its origin remote (github.com/tron-abs/novera)
  state        C:\Users\jmsga\.tokeneconomizer\repos\novera-ec0512828e\codex
  config       microskills=envfacts toolprune=off loopguard=nudge repomap=off mode=auto shadow=False
  sessions     2 folded, 3.3M effective tokens, plugin overhead 0 (0.0%)
  microskills  0 fact(s) injected at session start (2 sessions learned from)
  toolprune    0 sessions (0 prompts) observed, catalog: none yet; proposed capabilities: -; applied: -
  loopguard    envelope not learned yet (3 ended-green turns); 0 redirect(s), 0 still-stuck notice(s) over 6 turns
```

Ces chiffres sont des cumuls consolidés par le plugin, **pas des tokens économisés**, ni le coût isolé du lot FP8/NVFP4, ni une mesure du quota de l’abonnement. Le passage de 873,1 k à 3,3 M ne permet pas d’attribuer toute la différence à cette tâche. Aucun gain par rapport à une exécution sans plugin n’est démontré. Les [tests et mesures des kernels](../deliverables/llm-float-2026-10-31/validation.md) valident Novera ; ils ne prouvent pas que TokenEconomizer a amélioré le résultat ou réduit la consommation.


### Observation finale — publication sur main, 31 octobre 2026

**3 sessions consolidées, 9,3 M tokens effectifs, surcoût plugin nul ; 0 fait injecté et 0 redirection.** Aucun gain de consommation ni amélioration du résultat attribuable au plugin n’est démontré. Les tokens effectifs ne sont pas des tokens économisés.

```text
TokenEconomizer -- tron-abs/novera (codex)
  repository   C:\msys64\home\jmsga\Novera, identified by its origin remote (github.com/tron-abs/novera)
  state        C:\Users\jmsga\.tokeneconomizer\repos\novera-ec0512828e\codex
  config       microskills=envfacts toolprune=off loopguard=nudge repomap=off mode=auto shadow=False
  sessions     3 folded, 9.3M effective tokens, plugin overhead 0 (0.0%)
  microskills  0 fact(s) injected at session start (3 sessions learned from)
  toolprune    0 sessions (0 prompts) observed, catalog: none yet; proposed capabilities: -; applied: -
  loopguard    envelope not learned yet (4 ended-green turns); 0 redirect(s), 0 still-stuck notice(s) over 6 turns
```

### Observation du 1er novembre 2026 — activation du tool pruning

Activation explicite pour Novera uniquement : `config set toolprune=auto`, confirmée par la commande locale puis par `status`. Le réglage s'applique à partir du prochain appel de hook. À ce relevé, aucun catalogue d'outils n'est encore disponible, aucune capacité n'est proposée ou écartée et aucune session n'est recensée par le mécanisme de tool pruning. L'activation ne démontre donc pas encore une réduction du contexte chargé.

```text
TokenEconomizer -- tron-abs/novera (codex)
  repository   C:\msys64\home\jmsga\Novera, identified by its origin remote (github.com/tron-abs/novera)
  state        C:\Users\jmsga\.tokeneconomizer\repos\novera-ec0512828e\codex
  config       microskills=envfacts toolprune=auto loopguard=nudge repomap=off mode=auto shadow=False
  sessions     3 folded, 9.3M effective tokens, plugin overhead 6.3k (0.1%)
  microskills  0 fact(s) injected at session start (3 sessions learned from)
  toolprune    0 sessions (0 prompts) observed, catalog: none yet; proposed capabilities: -; applied: -
  loopguard    envelope 62 tool calls (10 ended-green turns); 0 redirect(s), 0 still-stuck notice(s) over 6 turns
```

Le surcoût observé est désormais de **6,3 k tokens (0,1 %)** ; les relevés précédents restent conservés comme historique. Toujours **0 fait injecté, 0 redirection et 0 notification de boucle persistante**. Les 9,3 M tokens effectifs sont un cumul observé, pas une économie ni une mesure du quota ChatGPT. Aucun gain réel n'est encore démontré.

### Observation du 1er novembre 2026 — profils légers et mobile

Après confirmation des essais desktop et portable par le mainteneur et ajout des profils légers dans les sources : **3 sessions consolidées, 9,3 M tokens effectifs, 12,1 k tokens de surcoût plugin (0,1 %)**. Toujours aucun fait injecté, aucune redirection, aucune exclusion d'outil et aucun catalogue disponible pour le tool pruning. Les tests de Novera ne démontrent aucun bénéfice du plugin ; les nouveaux profils mobiles n'ont pas encore été essayés sur appareil.

```text
TokenEconomizer -- tron-abs/novera (codex)
  repository   C:\msys64\home\jmsga\Novera, identified by its origin remote (github.com/tron-abs/novera)
  state        C:\Users\jmsga\.tokeneconomizer\repos\novera-ec0512828e\codex
  config       microskills=envfacts toolprune=auto loopguard=nudge repomap=off mode=auto shadow=False
  sessions     3 folded, 9.3M effective tokens, plugin overhead 12.1k (0.1%)
  microskills  0 fact(s) injected at session start (3 sessions learned from)
  toolprune    0 sessions (0 prompts) observed, catalog: none yet; proposed capabilities: -; applied: -
  loopguard    envelope 43 tool calls (16 ended-green turns); 0 redirect(s), 0 still-stuck notice(s) over 6 turns
```

### Observation du 1er novembre 2026 — maintenance et diagnostics

Après instrumentation et validation locale du suivi des erreurs : **4 sessions consolidées, 13,9 M tokens effectifs, 55,1 k tokens de surcoût plugin (0,4 %)**. Le catalogue des capacités est désormais observé ; aucune capacité proposée ou écartée. Aucun fait injecté ni redirection. Ces compteurs cumulés ne mesurent ni une économie démontrée, ni le coût isolé de ce lot, ni le quota ChatGPT.

```text
TokenEconomizer -- tron-abs/novera (codex)
  repository   C:\msys64\home\jmsga\Novera, identified by its origin remote (github.com/tron-abs/novera)
  state        C:\Users\jmsga\.tokeneconomizer\repos\novera-ec0512828e\codex
  config       microskills=envfacts toolprune=auto loopguard=nudge repomap=off mode=auto shadow=False
  sessions     4 folded, 13.9M effective tokens, plugin overhead 55.1k (0.4%)
  microskills  0 fact(s) injected at session start (4 sessions learned from)
  toolprune    1 sessions (32 prompts) observed, catalog: capabilities; proposed capabilities: -; applied: -
  loopguard    envelope 65 tool calls (18 ended-green turns); 0 redirect(s), 0 still-stuck notice(s) over 6 turns
```

### Observation du 1er novembre 2026 — version affichée et correctif Clang

Relevé après le correctif de détection de Clang et le suivi documentaire : 4 sessions consolidées, 13,9 M tokens effectifs et 91,1 k de surcoût plugin (0,7 %). Aucun fait injecté, outil écarté ou gain démontré. Ces compteurs cumulés ne correspondent ni à une économie ni au quota ChatGPT.

```text
TokenEconomizer -- tron-abs/novera (codex)
  repository   C:\msys64\home\jmsga\Novera, identified by its origin remote (github.com/tron-abs/novera)
  state        C:\Users\jmsga\.tokeneconomizer\repos\novera-ec0512828e\codex
  config       microskills=envfacts toolprune=auto loopguard=nudge repomap=off mode=auto shadow=False
  sessions     4 folded, 13.9M effective tokens, plugin overhead 91.1k (0.7%)
  microskills  0 fact(s) injected at session start (4 sessions learned from)
  toolprune    1 sessions (32 prompts) observed, catalog: capabilities; proposed capabilities: -; applied: -
  loopguard    envelope 80 tool calls (24 ended-green turns); 0 redirect(s), 0 still-stuck notice(s) over 6 turns
```
