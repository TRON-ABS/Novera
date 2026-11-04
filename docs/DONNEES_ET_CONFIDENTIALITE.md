# Novera — données et confidentialité

Information officielle du projet, mise à jour le **4 novembre 2026** à partir des sources. Contact : [contact.novera.tronabs@gmail.com](mailto:contact.novera.tronabs@gmail.com).

## Utiliser un modèle local

L'inférence locale s'exécute sur votre appareil : elle ne nécessite pas d'envoyer votre conversation à un fournisseur de modèles cloud. **Choisir un modèle local ne coupe toutefois pas toutes les connexions réseau de Novera.** Les statistiques et diagnostics facultatifs, les mises à jour, les téléchargements et les outils externes sont des fonctions distinctes.

| Fonction | Ce qui peut quitter l'appareil | Destination et déclenchement |
| --- | --- | --- |
| Inférence avec un moteur et un modèle locaux | Pas d'envoi de la conversation à une API cloud par cette inférence. Les messages et fichiers de travail sont conservés dans le profil local. | Moteur local sélectionné ; les autres fonctions ci-dessous restent indépendantes. |
| Statistiques facultatives | Événement de démarrage, version de l'application, système d'exploitation et identifiant aléatoire neuf pour chaque événement. | Projet PostHog configuré dans le build, uniquement après consentement. Destination affichée dans Paramètres → Confidentialité ; la préparation de maintenance du projet utilise PostHog EU. |
| Rapports d'erreurs facultatifs | Version/build/commit, OS/architecture, opération, tâche, famille de moteur, codes techniques contrôlés, statut HTTP d'erreur si disponible et positions dans les bundles JavaScript de l'application. Compteurs d'occurrences et identifiant temporaire en mémoire pendant l'activation. | Même destination configurée, avec un consentement distinct de celui des statistiques. Aucun envoi si cette destination n'est pas configurée. |
| Vérification et installation de mises à jour | Requête de manifeste, métadonnées HTTP et informations techniques nécessaires au protocole de mise à jour, puis téléchargement du paquet choisi. Pas de conversation jointe par ce mécanisme. | GitHub et ses serveurs de téléchargement, canal officiel TRON-ABS/Novera. Indépendant des consentements PostHog. Selon le build, vérification automatique ou manuelle ; l'updater est désactivé sans activation explicite à la compilation. |
| Catalogue, modèles et composants | Requêtes de catalogue, noms/révisions des ressources demandées et téléchargements ; éventuellement les identifiants d'accès nécessaires au service choisi. | Hébergeurs des ressources consultées ou téléchargées, notamment Hugging Face et GitHub. Le fonctionnement varie selon le parcours utilisé. |
| Modèles cloud et fonctions externes | Demande, contexte et pièces jointes transmis par le parcours choisi ; requêtes ou résultats nécessaires aux outils activés. | Fournisseur API configuré, serveur MCP, moteur de recherche ou autre service appelé. Un outil externe peut utiliser le réseau même si le modèle principal est local. |

Comme pour toute connexion réseau, le destinataire peut voir l'adresse IP et les métadonnées de connexion. Le filtrage effectué par Novera ne constitue pas une garantie d'anonymat des journaux du destinataire.

## Statistiques et rapports d'erreurs : deux choix séparés

Les deux options sont **désactivées par défaut**, mémorisées séparément et liées au destinataire/projet. Accepter les statistiques n'active pas les rapports d'erreurs. Le schéma enrichi de diagnostic v2 exige sa propre décision ; changer de destination exige un nouvel accord.

Dans **Paramètres → Confidentialité**, vous pouvez consulter ces choix et les désactiver. Le retrait arrête les envois suivants et annule les requêtes en attente ; il ne supprime pas rétroactivement les événements déjà reçus par le serveur.

Les collecteurs de statistiques et d'erreurs décrits ici ne sérialisent pas les prompts, conversations, réponses, fichiers joints, résultats d'outils, clés API, noms ou chemins personnels de modèles, ni messages d'erreur bruts. Les erreurs sont classées par une liste contrôlée de codes ; les piles sont limitées aux ressources applicatives empaquetées. Pas de cookies, de capture automatique des interactions ni d'enregistrement de session dans ces collecteurs.

Le suivi d'erreurs limite les envois à 60 rapports par minute et par activation, avec dix positions par pile. L'identifiant temporaire reste en mémoire et n'est pas un identifiant permanent d'installation. Les requêtes d'erreurs expirent après dix secondes ; il n'existe pas de file persistante de rapports ni de réessai automatique. Un arrêt brutal avant envoi peut rester invisible : ce dispositif n'est pas un collecteur universel de dumps natifs.

Les réglages de conservation et le traitement des IP côté serveur ne sont pas attestés par le code client. Le projet ne publie donc ici ni délai de conservation vérifié ni promesse de suppression automatique. Pour une question ou une demande concernant les données déjà transmises, écrire à l'adresse de contact ci-dessus.

## CLI, agents et journaux locaux

Les journaux et diagnostics locaux sont distincts des envois PostHog ; ils peuvent contenir des informations utiles au dépannage. Vérifiez leur contenu avant de les partager.

L'export OpenTelemetry avancé des agents est un mécanisme séparé, désactivé sans activation explicite. S'il est activé, des traces, métriques et journaux sont envoyés au collecteur configuré par l'utilisateur ; les garanties de filtrage PostHog ci-dessus ne doivent pas être étendues à cet export. Les options `OTEL_LOG_USER_PROMPTS` et `OTEL_LOG_TOOL_DETAILS` peuvent inclure le texte des demandes et les arguments des outils si elles sont activées. `OTEL_SDK_DISABLED=true` permet de désactiver cet export.

La CLI utilise son propre canal signé Novera lorsqu'il est activé dans le build ; les builds sans ce canal refusent la mise à jour avant accès réseau. `NOVERA_CLI_NO_UPDATE_CHECK=1` désactive la vérification automatique au démarrage ; une commande explicite de mise à jour reste une action distincte.

## Travailler sans connexion externe

Préparer les modèles et composants nécessaires, sélectionner un moteur local, désactiver statistiques et rapports d'erreurs, ne pas activer l'export OpenTelemetry et éviter les fournisseurs cloud, téléchargements et outils réseau. La vérification des mises à jour reste distincte : utiliser un build où elle est désactivée ou bloquer le réseau au niveau du système pour imposer l'absence de connexion. Désactiver les diagnostics seuls ne garantit pas un fonctionnement entièrement hors ligne.

## Portée et sources vérifiables

Cette page décrit les sources disponibles à cette date. Les fonctionnalités et réglages embarqués dépendent de la version et du build ; cette lecture des sources n'est pas une capture réseau ni un audit exhaustif de chaque binaire publié, moteur, extension ou service tiers.

- Consentements : [statistiques](../web-app/src/hooks/useAnalytic.ts), [erreurs](../web-app/src/hooks/useErrorTracking.ts), [activation des collecteurs](../web-app/src/providers/AnalyticProvider.tsx).
- Champs envoyés : [statistiques de démarrage](../web-app/src/lib/noveraTelemetry.ts), [rapports d'erreurs](../web-app/src/lib/noveraErrorTracking.ts), [filtrage des diagnostics](../web-app/src/lib/noveraDiagnostics.ts).
- Mises à jour : [configuration de compilation](../web-app/vite.config.ts), [service desktop](../web-app/src/services/updater/tauri.ts), [canal desktop](../src-tauri/tauri.updater.conf.json), [politique CLI](../src-tauri/src/core/cli/updater.rs), [canal CLI signé](../src-tauri/src/core/cli/signed_update.rs).
- Export agent : [configuration OpenTelemetry](../src-tauri/src/core/agent/otel/config.rs).
- Détails complémentaires : [guide utilisateur — confidentialité](USER_GUIDE.md#confidentialité), [maintenance et limites](MAINTENANCE.md).
- Licence du projet : [Apache 2.0](../LICENSE) ; [attribution conservée](../NOTICE). Les modèles, composants et services tiers gardent leurs propres licences et conditions.
