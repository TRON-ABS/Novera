# Lecture au clavier sans micro et recherche web — 7 novembre 2026

Le mainteneur précise qu'il veut **entendre la réponse à un message saisi sans activer le microphone**, avec LFM3-Omni/Audio. Le parcours précédent liait cette lecture à une session de conversation vocale déjà démarrée. L'absence de son dans ce cas était donc un manque du parcours clavier, et ne démontrait pas une panne de synthèse.

## Lecture indépendante

`Paramètres → Général → Conversation vocale` propose **Lire les réponses à voix haute**, activé par défaut pour les interfaces vocales prises en charge et conservé dans les réglages. Un nouvel envoi au clavier arme une session de lecture seule : attendre sa réponse, la lire, puis revenir au repos. Il n'ouvre pas le microphone et ne relance pas l'écoute. Les réponses déjà enregistrées ne sont pas lues au chargement. Le bouton vocal permet toujours d'arrêter la lecture ; la perte de premier plan et le changement de contexte conservent leurs annulations.

Le démarrage de la lecture ne dépend plus de la condition « champ de saisie vide » utilisée pour démarrer le micro. Une saisie envoyée pendant un tour occupé n'ouvre pas un autre backend ni un faux message d'erreur ; la lecture des files de messages n'est pas validée par les essais ci-dessous.

Vraie application Windows debug, vrai LFM3-Omni : saisie au clavier « Réponds uniquement : La lecture au clavier fonctionne. », réponse native produite et session revenue au repos. **Zéro appel à `getUserMedia`** ; le banc aurait refusé toute tentative d'ouverture. Le mainteneur confirme **« Oui, la réponse a été lue »**. Aucun clic sur le microphone nécessaire.

Le nouveau libellé est présent dans **104 catalogues**, inventaire porté à **2 434 clés**. Couverture structurelle vérifiée ; relecture linguistique native non revendiquée.

## Recherche web : fournir les outils et obtenir un vrai appel

Les modèles LFM3-Omni/Audio importés peuvent ne pas avoir d'étiquette `tools`. La compatibilité locale connue permet alors d'annoncer **seulement** `web_search`/`web_fetch` lorsque Web est activé, sans réactiver les outils shell/MCP ni remplacer une modification explicite des capacités par l'utilisateur. Le modèle Omni proposé à l'installation indique désormais cette capacité.

L'essai réel montre aussi qu'un modèle peut refuser la météo actuelle **alors que les outils sont présents**, en continuant une ancienne réponse de refus. Pour les demandes météo actuelles claires en français/anglais et les demandes explicites de recherche reconnues par la règle, le premier tour impose une vraie recherche. Il utilise la forme compatible avec le serveur verrouillé : `tool_choice: "required"` et uniquement `web_search` parmi les outils actifs. Une tentative initiale avec choix nommé sous forme d'objet était rejetée par ce serveur et n'est pas retenue.

Après résultat ou erreur de l'outil, le choix revient à `auto` : aucune boucle de recherche forcée. Le bouton Web désactivé, une consigne de ne pas chercher, les questions de calcul et les salutations ne déclenchent pas cette recherche initiale. Les autres requêtes et langues gardent le choix automatique du modèle.

## Preuve réelle de réseau

Dans une seconde fenêtre isolée réduite, sans lecture vocale, l'envoi **« Quel temps fait-il aujourd’hui aux Sables-d’Olonne ? »** a suivi le parcours normal du chat :

1. requête native `required`, outils actifs limités à `web_search` ;
2. vraie recherche via DuckDuckGo, résultats non vides, aucune erreur ;
3. retour du modèle en `auto`, appel `fetch_content` et récupération de page ;
4. réponse terminée dans l'interface, avec une citation.

Les liens réellement retournés comprennent [Météo-France](https://meteofrance.com/previsions-meteo-france/les-sables-d-olonne/85100) et [La Chaîne Météo](https://www.lachainemeteo.com/meteo-france/ville-44281/previsions-meteo-les-sables-d-olonne-aujourdhui). Ce contrôle prouve le fonctionnement du parcours de recherche et de lecture de page ; il **ne valide pas les températures ni la fraîcheur de la prévision générée**. La réponse de cet essai mentionne le 6 novembre alors que la demande est faite le 7 : aucune exactitude météo n'est certifiée.

## Vérifications et limites

**368 tests ciblés réussis dans 24 fichiers**, TypeScript, ESLint ciblé (zéro erreur, avertissement Fast Refresh existant), compilation web et contrôle des 104 catalogues réussis. Tests de préférence et de bouton indépendants, absence de micro, lecture seule revenue au repos, outil web absent des métadonnées, Web désactivé, modification explicite des capacités et absence de nouvelle recherche forcée après résultat/erreur.

[Résultats et empreintes](validation.json). Moteur inchangé : llama.cpp **v0.9.0/build 12110**, commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`.

La validation native concerne Windows x64 et Omni ; Audio utilise le même parcours, avec reconnaissance de famille vérifiée par tests, sans nouvel essai matériel complet Audio ici. Les autres plateformes et API distantes ne sont pas certifiées. L'essai réseau est séparé de l'essai de son pour pouvoir réduire la fenêtre sans annuler une lecture par la protection du premier plan.

Aucune permission distante, règle CORS, restriction d'URL ou protection de secrets affaiblie. Aucun enregistrement de micro. Tous les profils et journaux temporaires sont supprimés après extraction des preuves ; les requêtes ne contiennent que les exemples publics du banc. Aucune installation personnelle remplacée ni distribution publiée : sources destinées à la prochaine compilation Desktop du mainteneur.
