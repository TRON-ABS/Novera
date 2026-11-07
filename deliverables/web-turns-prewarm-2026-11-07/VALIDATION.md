# Réponse météo après un autre sujet, voix et préparation web — 7 novembre 2026

Préparation 1.0.1 ; versions applicatives toujours 1.0.0. Aucune publication, compilation Desktop de livraison ou modification des réglages personnels. Le mainteneur compilera son application.

## Diagnostic reproduit

Scénario réel Windows, LFM3-Omni Q4_K_M, contexte 32768 : lecture des années/décimales, explication du ciel bleu en cinq phrases avec une phrase de fin imposée, puis demande de météo actuelle aux Sables-d'Olonne avec date et sources. La recherche et la lecture de page ont bien lieu, mais le texte final reprend l'exercice précédent et n'est pas lu.

La même erreur de sujet apparaît sans synthèse vocale, et dans un essai où le cache_prompt natif est désactivé. La requête météo correcte et les résultats web sont présents dans le message envoyé au modèle. Ces essais ne justifient donc pas une correction du cache ou une désactivation générale de celui-ci. Aucun changement de cache natif n'est livré.

Une simple consigne de reprise et un rappel de la demande sans ciblage du contexte ne suffisent pas : un essai intermédiaire reprend même le premier exercice numérique avec une citation météo. Les vérifications finales rejettent explicitement ces deux anciens sujets, plutôt que de compter la simple présence d'une citation ou d'un WAV comme preuve de bonne réponse. Les comparaisons conservées portent uniquement sur les questions publiques du banc.

Le lecteur présente aussi trois défauts reproduits par des tests initialement en échec : il peut consommer une étape d'outil vide, lire l'ancienne réponse pendant une transition ready, ou lire le texte intermédiaire d'un appel d'outil. Cela peut clore une session de lecture avant l'arrivée de la réponse finale.

## Corrections

Le vocal attend une réponse non vide, distincte de la précédente, et une étape finale. Le motif finishReason tool-calls rend la réponse intermédiaire non lisible. La réutilisation du même identifiant reste possible pour une régénération explicitement armée, sans étendre cette exception aux nouveaux envois. Le contrôle est partagé par les voix natives et système.

Après un résultat web disponible ou une erreur, un rappel de la demande actuelle est transmis à la priorité utilisateur, pour cette inférence uniquement. Les contenus de fichiers référencés ne sont pas recopiés comme consigne. Le rappel est compté dans le budget de contexte, borné à 4000 caractères, jamais enregistré dans l'historique et jamais interprété comme une nouvelle demande de recherche obligatoire. Les continuations explicites sont exclues.

Pour les familles locales LFM3-Omni/Audio, la synthèse après les résultats web reçoit la question actuelle et les outils de ce tour, avec ce rappel. L'historique complet continue à servir au choix des outils et reste stocké intact ; les autres modèles conservent leur contexte complet. Ce ciblage évite la reprise des exercices précédents. Il peut réduire la réutilisation du préfixe KV au passage des étapes web et retire les anciennes consignes conversationnelles de cette seule synthèse locale ; les paramètres de l'assistant, la mémoire système et la langue calculée à partir de la conversation restent transmis. Les suivis très implicites hors du scénario testé ne sont pas certifiés.

La consigne web inclut la date locale du calendrier et demande de vérifier les dates des sources, de revenir à la dernière demande et de signaler l'insuffisance des preuves plutôt que d'inventer une prévision. La date change au changement de jour, pas à chaque token. Cela ne certifie pas la véracité de toute prévision produite.

## Préparation de la première recherche

Le mainteneur demande ensuite de réduire l'attente de la première recherche. Le démarrage de DuckDuckGo via uvx se faisait à la première utilisation ; le service connecté est réutilisé ensuite. Le temps affiché inclut aussi les requêtes réseau, la lecture des pages et les passages du modèle, dont les coûts n'ont pas été ventilés individuellement.

La version corrigée prépare ce service en arrière-plan après restauration des réglages et initialisation des services, lorsque Web est activé et que DuckDuckGo est le fournisseur choisi. L'interface n'attend pas cette préparation. Aucune recherche fictive, lecture de page, question ou audio n'est envoyé pour chauffer le service. Le démarrage reste partagé avec une vraie recherche concurrente, la configuration existante reste prioritaire et une préparation échouée peut être retentée par la recherche réelle.

Un choix Web désactivé sauvegardé est respecté avant toute préparation ; les autres fournisseurs, le navigateur web, Android et iOS ne démarrent pas ce processus Desktop. Le moteur mobile utilise son autre chemin HTTP. Les règles d'outils et de permissions existantes sont conservées. Désactiver Web interdit les recherches ; ce lot n'ajoute pas une règle de fermeture du service déjà démarré.

## Validation finale

- 298 tests réussis dans 14 fichiers, un test d'intégration conditionnel ignoré, zéro échec. Contrôles du lecteur entre étapes, de la régénération, de la sélection de contexte local/cloud, du budget et de la non-duplication des fichiers, du démarrage partagé, de la restauration Web-off et des plateformes non Desktop.
- TypeScript et ESLint ciblé réussis ; build web Windows réussi en 8,47 secondes. Avertissements de découpage/taille de bundles préexistants. Les erreurs de lint préexistantes de la route chat ne sont pas annoncées comme corrigées.
- Vraie application Windows debug, vrai LFM3-Omni, vrai DuckDuckGo et lecture de page : les trois questions dans un même chat donnent désormais une réponse météo datée du 7 novembre 2026, sans texte sur le ciel bleu ni reprise des années/billets. Synthèse native produite et terminée, puis régénération météo également lue.
- Confirmation du mainteneur : **« Oui, météo lue les deux fois »**.
- Nouveau démarrage réel avec préparation : interface visible pendant le lancement ; service connecté dès le deuxième exercice, avant la demande météo, avec **zéro requête de recherche**. Première réponse météo affichée environ **10 s**, contre **22 s** dans le passage précédent sans préparation. Comparaison indicative de deux essais Internet, avec des résultats/réseau variables : ce n'est pas un gain garanti de 12 secondes ni une mesure isolée du coût d'initialisation.
- Nouveau démarrage réel avec Web-off sauvegardé : enabled false, service DuckDuckGo non connecté. La préparation n'a pas réactivé le choix utilisateur.
- Après préparation, le scénario complet puis sa régénération terminent encore correctement et avec voix.

Moteur conservé : llama.cpp v0.9.0 build12110 (cd959bae99ff4bed22bef2604f45241c09bbb8c8). Les traductions ne changent pas. La véracité des températures/précipitations et la validité quotidienne des données ne sont pas certifiées par ce test fonctionnel ; la vérification de date est une consigne au modèle. Les autres modèles et plateformes ne sont pas annoncés comme testés matériellement dans ce lot.

Les profils et journaux du banc sont supprimés après les essais. Aucun audio ni conversation personnelle conservé ; seules les sorties des questions publiques de test et leurs métadonnées sont jointes.
