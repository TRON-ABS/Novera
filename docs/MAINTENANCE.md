# Novera — maintenance et suivi des erreurs

## Diagnostics des composants gérés — 1er novembre 2026

Les échecs du gestionnaire utilisent l'opération existante `configuration`, avec des raisons `COMPONENT_*` fixes et une classification bornée (stockage, intégrité, timeout, runtime absent). Les chemins, contenus de modèles, paquets pip bruts et journaux ne sont pas envoyés. Les annulations volontaires ne déclenchent pas un rapport d'erreur. Le consentement v2 reste indépendant et requis ; aucune modification des alertes ou destinations distantes. Le journal technique local du dernier processus est plafonné à 64 Kio.

État du **1er novembre 2026**. Projet : [PostHog EU 319433](https://eu.posthog.com/project/319433/error-tracking). Ce document sépare les fonctions préparées dans les sources, les vérifications réellement faites et les réglages distants restant à terminer.

## État vérifié

- Collecteur enrichi dans les sources ; le prochain binaire doit intégrer ces modifications.
- Envoi synthétique accepté puis **issue réellement visible** dans le bon projet : [Novera monitoring: pipeline test](https://eu.posthog.com/project/319433/error-tracking/01a19487-c02b-73c1-8566-e158a3a069d6). Identifiant de build de test : `maintenance-preflight-20261101`. Aucun contenu utilisateur envoyé.
- Préparation privée des source maps testée, y compris sur un petit build Vite réel de fixture. Aucun nouveau build complet Novera.
- **Envoi authentifié des symboles de la prochaine release : à terminer.** Aucun accès CLI privé n'est actuellement configuré. La préparation locale ne remplace pas l'envoi et sa vérification dans PostHog.
- **Alerte e-mail activée**, à la demande du mainteneur, pour le membre du compte connecté **TRON ABS** : [alerte de production](https://eu.posthog.com/project/319433/alerts?alert_type=insights&alert_id=01a1949f-bbfe-0000-927b-ac67a1b98504). Vérification horaire, seuil strictement supérieur à zéro sur l'heure terminée. État activé et première évaluation sans déclenchement vérifiés dans la liste générale. Test de livraison envoyé à un destinataire e-mail ; réception confirmée par le mainteneur le 1er novembre 2026.

## Ce qui remonte avec le consentement

| Parcours | Instrumentation |
| --- | --- |
| JavaScript / promesses | Erreurs non interceptées, piles limitées aux assets applicatifs empaquetés. |
| React / routeur | Frontière d'erreur globale ; le collecteur est réinstallé avec le consentement existant lorsque le fournisseur normal a été démonté. |
| Modèles texte | Échecs de chargement et de création du modèle, erreurs du flux de réponse. |
| Téléchargements | Événements d'échec et échecs de validation ; erreurs du pack de configuration, dédupliquées par transition d'état du transfert. |
| Mémoire | Échecs de transition entre modèles, OOM natif reçu par l'application. |
| Moteur llama.cpp | Erreur de backend et arrêt inattendu du worker détecté par `get_engine_info`. Événement local fixe, relayé uniquement avec consentement. |
| Image / musique / vidéo | Échecs locaux et cloud, dont les sauvegardes cloud après génération. Annulation volontaire exclue. |

Les erreurs qui restent entièrement internes à un moteur sans être retournées à l'application ne deviennent pas automatiquement observables. Un arrêt brutal du processus principal, un crash avant le démarrage du collecteur ou un téléphone qui tue l'application peuvent empêcher tout envoi ; il ne s'agit pas d'un système universel de crash dumps natifs.

## Informations utiles au diagnostic

Les rapports contiennent uniquement une liste de champs contrôlés : version, `build_id`, commit, état des sources (`clean`/`dirty`/`unknown`), environnement (`production`/`development`/`test`/`unknown`), OS, architecture, opération, tâche, famille de moteur, code d'erreur stable et statut HTTP borné lorsqu'il est disponible. Certains refus applicatifs ajoutent un `reason_code` issu d'une liste fixe ; ce code précis sert aussi au regroupement des erreurs interceptées. Les positions JavaScript utilisent le nom public du bundle et, si présent, son `chunk_id` PostHog.

Codes : mémoire, timeout, réseau, authentification, quota/débit, stockage, intégrité, moteur arrêté/absent, modèle absent, incompatibilité ou cause inconnue. Une cause inconnue reste inconnue ; aucun texte arbitraire n'est utilisé pour compléter le rapport.

Ne sont pas envoyés : prompts, conversations, réponses de fournisseurs, fichiers joints, clés, noms ou chemins personnels de modèles, fonctions extraites de piles, messages d'erreur bruts, causes et propriétés arbitraires. Pas de replay, cookies ou profil de personne. Les symboles privés sont du code applicatif destiné au mainteneur ; ils suivent une procédure d'envoi distincte.

Un UUID temporaire commun aux événements d'une même activation est gardé **en mémoire uniquement**, puis renouvelé. Les compteurs PostHog « utilisateurs » et « sessions » ne mesurent donc pas des personnes ou installations uniques. Le consentement aux statistiques reste indépendant.

Les occurrences répétées sont conservées jusqu'à **60 rapports par minute et par activation**. Les suivantes sont comptées localement ; leur nombre est joint au prochain rapport admissible dans `suppressed_since_last_report`. Les échecs d'envoi précédents sont indiqués dans `delivery_failures_since_last_report`. Requêtes bornées à dix secondes, annulées au retrait du consentement, sans file persistante ni réessai automatique. Les volumes ne sont pas une mesure exhaustive de tous les incidents.

## Préparer la prochaine compilation

Le lanceur source `scripts/Compiler-Novera.bat` et sa copie réellement utilisée `C:/msys64/home/jmsga/Compiler-Novera.bat` disposent désormais de `NOVERA_BUILD_MONITORING=1`. Cela configure les possibilités de diagnostic du build, **pas le consentement des utilisateurs**. `0` permet un build sans cette préparation ; le switch PowerShell `-WithTelemetry` reste disponible.

La destination et le token public de projet sont lus depuis les deux variables `NOVERA_ANALYTICS_HOST` et `NOVERA_ANALYTICS_PROJECT_KEY` de `web-app/.env.local`, sans exécuter son contenu. Le token privé CLI n'entre jamais dans ces constantes distribuées.

La version enrichie du schéma utilise un consentement `novera-error-tracking-v2`, lié au même destinataire. Les anciens accords v1 n'activent pas silencieusement les données supplémentaires. Les champs techniques sont présentés avec des libellés existants dans les 80 langues. Les autres choix de confidentialité sont conservés.

Chaque build reçoit un identifiant propre ; un arbre avec changements locaux est signalé comme tel. Le frontend embarque `build-info.json` et le dossier desktop un `BUILD_INFO.md`, repris par le portable. Les sources et symboles sont conservés sous `.build/monitoring-symbols/<build_id>`, hors de `frontendDist`. Les `.map` JS **et CSS** sont retirées du répertoire distribué avant la compilation native.

## Symboles privés : envoi et contrôle avant publication

La préparation locale injecte le registre `_posthogChunkIds`, inscrit le même `chunk_id` dans chaque source map et décale ses mappings de la ligne ajoutée. Ce format est vérifié contre [le code officiel PostHog](https://github.com/PostHog/posthog/blob/master/cli/src/sourcemaps/constant.rs). L'envoi utilise la **CLI officielle 0.19.0**, installée localement dans `.build/posthog-tools` ; aucun SDK de collecte automatique n'est ajouté à l'application.

Sur un autre checkout, installer cet outil dans le cache local :

```powershell
npm.cmd install --prefix .build/posthog-tools --no-audit --no-fund @posthog/cli@0.19.0
```

Pour l'envoi, fournir **localement** `POSTHOG_CLI_API_KEY`, avec accès limité `error tracking write` et `organization read` selon la [documentation officielle](https://posthog.com/docs/error-tracking/upload-source-maps/cli). Ne pas coller cette clé dans un chat, le frontend, le dépôt ou les journaux. L'hôte d'envoi et le projet sont fixés à PostHog EU / 319433 par notre script.

```powershell
node scripts/monitoring/symbols.mjs upload .build/monitoring-symbols/<build_id>
node scripts/monitoring/symbols.mjs check .build/monitoring-symbols/<build_id>
```

Le contrôle refuse les fichiers modifiés, les chemins sortant du dossier privé et les fichiers supplémentaires non inventoriés. Il exige un reçu d'envoi réussi. Il vérifie le reçu local de la CLI, pas une approbation de release. Vérifier ensuite les identifiants dans **Error tracking → Configuration → Symbol sets / Releases**, puis la résolution d'une pile d'un build de test correspondant. Si la variable privée existe pendant le build, l'envoi est tenté automatiquement ; un échec arrête cette préparation. Sinon, les symboles restent privés avec état `pending` et un avertissement explicite. **Ne pas publier en prétendant les symboles disponibles tant que cette étape reste en attente.**

## Alerte e-mail active et extensions possibles

Le mainteneur a choisi l'e-mail de son compte PostHog. La tendance enregistrée [Novera — erreurs de production](https://eu.posthog.com/project/319433/insights/UshFEX8p) compte les `$exception` par heure avec quatre filtres combinés : `$lib=novera`, `build_environment=production`, `test_only` différent de `true` et `operation` différente de `smoke_test`. L'alerte vérifie chaque heure terminée, sans exclusion des week-ends ou heures calmes, et notifie le membre TRON ABS si la valeur dépasse zéro. Aucun webhook ni canal externe connecté.

Le bouton **Test delivery** a lancé un test pour un destinataire e-mail. Le mainteneur a confirmé sa réception le 1er novembre 2026 ; ce test valide la livraison e-mail, sans remplacer le déclenchement sur une erreur du prochain binaire. La tendance de production est actuellement vide ; les anciens événements sans `build_environment=production` sont volontairement exclus. Le prochain binaire doit donc embarquer ce champ.

L'alerte de volume ne remplace pas les règles spécialisées par cycle de vie d'issue. Extensions encore non activées :

1. Nouvelle issue ou réouverture pour les diagnostics Novera.
2. Pic inhabituel d'une issue existante, avec le détecteur PostHog ; garder un seuil minimal de volume pour ne pas notifier sur un seul échec.
3. Priorité élevée pour `runtime_exit`, échec de sauvegarde/stockage et intégrité ; regrouper les répétitions par issue.
4. Exclure `operation=smoke_test` et `test_only=true` des alertes de production. Une panne du fournisseur cloud est distinguée d'une panne locale grâce à `engine=cloud`.

Les règles natives de nouvelles issues/réouvertures/pics ne sont pas déclarées actives avec cette alerte de tendance. Les statistiques de démarrage étant consenties séparément, ne pas annoncer un taux global de sessions sans erreur à partir du seul compteur d'exceptions.

## Procédure de correction

1. Relever lien de l'issue, build, OS/architecture, moteur, tâche et code ; distinguer erreur locale, fournisseur, stockage et configuration.
2. Retrouver le reçu du build et ses symboles. Pour des sources `dirty`, le commit seul ne décrit pas le binaire : utiliser les symboles exacts conservés.
3. Reproduire avec une fixture et sans données ou appels payants d'un utilisateur. Ajouter un test qui échoue avant le correctif.
4. Corriger, exécuter les contrôles affectés puis produire un nouveau build identifié. Un succès de test local ne signifie pas qu'un binaire déjà distribué a changé.
5. Marquer l'issue corrigée après validation du nouveau binaire ; surveiller les réouvertures et pics de ce build.

Un test synthétique peut être envoyé explicitement avec `scripts/monitoring/smoke-test.ps1 -BuildId <identifiant>`. Il ne remplace pas le test du binaire avec consentement activé. Conserver les rapports de test séparés des incidents réels.

## Validation de ce lot

- **616 tests web réussis / 32 fichiers, 1 scénario non-Windows ignoré**, incluant transport texte, profils légers, consentement, collecteur, génération, mémoire et téléchargements.
- TypeScript, architecture et lint ciblé : réussis.
- **4 tests Node** pour les symboles : registre et mappings, intégrité/périmètre d'envoi, build Vite réel de fixture, retrait des maps JS/CSS.
- **16 assertions** de lecture sûre de configuration et **69 assertions** du lanceur, sans compilation applicative.
- `cargo check --offline --locked --manifest-path src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml --no-default-features` : réussi ; deux avertissements de nommage préexistants du plugin matériel AMD. Pas de nouveau binaire Novera.
- **80 catalogues / 2 412 clés**, aucune erreur structurelle ; présence des libellés de consentement supplémentaires vérifiée.
- Test synthétique reçu et visible dans le projet 319433. Alerte e-mail horaire activée et réception du test confirmée par le mainteneur. **Upload authentifié des symboles de release et essai du prochain binaire restent à confirmer.**
