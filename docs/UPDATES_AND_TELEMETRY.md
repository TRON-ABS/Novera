# Préparer les mises à jour et les statistiques Novera

État au 24 octobre 2026 : préparation intégrée dans le build local de correction recherche/menu, sans activer les envois, créer de clé de production, publier de release ou activer GitHub Actions. Le build portable conserve les mises à jour désactivées et aucune destination statistique configurée ; la mise en service décrite ci-dessous reste nécessaire.

## Mises à jour : GitHub Releases et signature Novera

Le client utilise exclusivement le flux :

`https://github.com/TRON-ABS/Novera/releases/latest/download/latest.json`

Il utilise le plugin Tauri, sans proxy analytique, identifiant d’installation ni en-têtes HMAC Jan. Une compilation ordinaire garde l’updater désactivé. Pour une compilation de distribution, il faut **à la fois** une configuration contenant la clé publique Novera et le flux ci-dessus, et `NOVERA_ENABLE_UPDATER=true`. Le backend refuse d’enregistrer le plugin si le flux diffère ou si la clé est absente ; le plugin valide la clé et vérifie la signature des fichiers téléchargés. Aucun contournement de vérification n’est ajouté.

Le téléchargement signé est terminé avant l’arrêt des moteurs/outils. Si la vérification ou le téléchargement échoue, ils restent actifs. Si l’installation échoue après l’arrêt, un redémarrage des serveurs MCP est tenté.

### Première mise en service

1. Le mainteneur génère sa paire de clés Tauri une seule fois, hors du dépôt, et conserve une sauvegarde privée. Exemple : `corepack yarn tauri signer generate -w "$env:LOCALAPPDATA/Novera/release-signing/novera.key"`. Créer le dossier au préalable. Ne jamais publier la clé privée ou son mot de passe ; conserver la même clé publique pour les versions futures. Le présent travail n’a pas créé cette clé.
2. Préparer la configuration publique avec `node scripts/updates/novera-update.mjs config --public-key CHEMIN/novera.key.pub --out .build/novera-updater.json`. Le fichier de sortie doit être nouveau. Les clés absentes, factices ou de format incorrect sont refusées.
3. Choisir une nouvelle version stable et synchroniser `web-app/package.json`, `src-tauri/Cargo.toml` et `src-tauri/tauri.conf.json`. Configurer `TAURI_SIGNING_PRIVATE_KEY` et, le cas échéant, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` uniquement dans l’environnement de construction. Puis définir `$env:NOVERA_ENABLE_UPDATER='true'` et lancer `corepack yarn tauri build --config .build/novera-updater.json --bundles nsis`. Cette opération nécessite les dépendances, ressources et outils Windows de construction habituels.
4. Préparer le manifeste, par exemple : `node scripts/updates/novera-update.mjs manifest --version 1.0.1 --artifact CHEMIN/Novera_1.0.1_x64-setup.exe --signature CHEMIN/Novera_1.0.1_x64-setup.exe.sig --notes CHEMIN/notes.md --out .build/latest.json`. L’outil écrit aussi `.build/latest.json.sha256` pour l’installateur. Il refuse un exécutable portable, une version incohérente, une préversion ou une signature de format incorrect. Cette validation de structure ne remplace pas une vérification cryptographique de signature.
5. Tester l’installation, une mise à jour depuis la version précédente et un rejet de signature invalide sur un profil de test. Préparer un brouillon de release `v1.0.1` dans **TRON-ABS/Novera**, avec l’installateur, sa signature, `latest.json`, les empreintes et les notices. La publication finale reste une action du mainteneur, après validation. Aucun script ajouté ici ne téléverse de fichiers.

Le flux actuel préparé couvre **Windows x64 avec installateur NSIS**. Ajouter les autres plateformes seulement après leur construction et validation. Les chemins du manifeste sont fixés au dépôt Novera et au tag correspondant à la version. Une nouvelle publication doit avoir une version strictement supérieure à celle de l’application installée. Un commit source seul ne constitue pas une mise à jour distribuable.

La version portable actuelle exige une **première installation manuelle** de la version signée contenant la clé publique et l’updater activé. Elle ne se transforme pas en installation actualisable en recevant seulement un nouveau manifeste. Une signature Tauri d’update est distincte d’une signature de code Windows Authenticode ; aucune certification Windows n’est revendiquée ici.

Référence de format et de signature : [documentation officielle Tauri Updater](https://v2.tauri.app/plugin/updater/).

## Statistiques facultatives : configuration locale et mise en service

Le 25 octobre 2026, après clarification des régions US/Europe, le mainteneur a fourni un nouveau jeton déclaré issu du projet Europe. Il remplace le premier jeton uniquement dans le fichier local ignoré par Git. Vite charge bien ce nouveau jeton et l’origine européenne ; aucun appel réseau de vérification n’a été effectué. La publication des sources et documents est autorisée, sans publier ce fichier local ni aucun jeton.

Actualisation du 25 octobre 2026 : le mainteneur a fourni le jeton public de son projet PostHog et confirmé la région Europe. La configuration est préparée localement dans `web-app/.env.local`, ignoré par Git, avec l’origine de collecte `https://eu.i.posthog.com`. Le jeton n’est pas recopié dans cette documentation. Aucune compilation, aucun changement du consentement utilisateur et aucun événement réel envoyé pendant cette préparation ; la région et la réception effectives du projet restent à vérifier lors du raccordement réel. Le lanceur de compilation Desktop et les scripts Android continuent de forcer les variables statistiques à vide : leur activation devra faire l’objet d’une modification explicite avant une compilation destinée à tester la collecte. Une invocation directe de Vite peut lire le fichier local ; le consentement reste alors désactivé par défaut.

Choix du mainteneur : statistiques minimales avec accord explicite. Les compilations produites par les lanceurs actuels restent **sans destination de collecte**, malgré la configuration locale préparée ci-dessus. Aucune requête statistique n’est envoyée par ces compilations. Sans destination disponible, le choix est désactivé dans Confidentialité et l’assistant de démarrage ne demande pas de consentement.

La configuration d’un projet PostHog appartenant à Novera utilise :

- `NOVERA_ANALYTICS_HOST` : origine HTTPS du service de collecte, sans chemin, identifiants, paramètres ou redirection ;
- `NOVERA_ANALYTICS_PROJECT_KEY` : jeton **public du projet**, jamais une clé d’administration personnelle.

Les anciennes variables `POSTHOG_KEY`, `POSTHOG_HOST` et Google Analytics ne peuvent plus activer la collecte. Aucun script GA ou SDK de capture automatique n’est initialisé. Les domaines Jan sont refusés comme destination statistique. Aucune ancienne identité analytique n’est restaurée. Les clés locales de consentement Novera sont nouvelles : un ancien accord Jan ne vaut pas accord pour ce dispositif.

Le consentement est lié à l’hôte et au projet destinataires : changer l’un ou l’autre demande une nouvelle décision, sans réutiliser l’accord précédent.

Après configuration et compilation, l’utilisateur doit autoriser l’envoi dans le dialogue ou dans Paramètres → Confidentialité. Le texte indique l’hôte destinataire. Le refus laisse toutes les fonctions disponibles ; le retrait du consentement annule la requête en attente et empêche les suivantes. Les textes spécifiques sont présents dans les 36 langues.

L’événement de statistiques d’usage préparé est `novera_app_started`, contenant :

- la version de Novera et le système d’exploitation ;
- un UUID aléatoire propre à cet événement, exigé par le protocole PostHog, jamais conservé ou réutilisé ;
- les indicateurs désactivant la création de profils de personnes et l’enrichissement géographique.

Pas de conversations, prompts, recherches, résultats d’outils, noms de modèles, chemins, identité utilisateur ou identifiant d’installation persistant. Pas de cookies, référent, enregistrement de session, capture de page ou collecte automatique. Les statistiques comptent des démarrages consentis, **pas des utilisateurs uniques**. La requête ne contient ni le consentement refusé ni un événement de refus.

Le serveur destinataire voit nécessairement les informations réseau de connexion. Avant activation réelle, le mainteneur doit configurer les journaux serveur, la rétention, l’absence de conservation/enrichissement des IP et vérifier CORS depuis WebView2. Le client ne prétend pas garantir à lui seul l’anonymat des journaux d’un service tiers. Aucune collecte réelle n’a été testée ou activée ici. [API PostHog](https://posthog.com/docs/api).

Les journaux locaux de diagnostic restent distincts de ces statistiques. Le mécanisme avancé OpenTelemetry des agents reste lui aussi distinct, désactivé par défaut et activable seulement par sa configuration explicite de collecteur ; il n’est pas activé par le bouton de statistiques. La mise à jour du CLI historique reste désactivée. Les modèles sont désormais téléchargés directement depuis leur URL source, sans détour par le miroir Jan ni identifiant HMAC.

## Contrôles de préparation

### Suivi des erreurs — 25 octobre 2026

À la demande du mainteneur, les sources préparent aussi PostHog **Error tracking** avec la même destination européenne. Le réglage indépendant Paramètres → Confidentialité → Suivi des erreurs est désactivé par défaut, sans reprendre le consentement aux statistiques. Ses deux textes sont traduits dans les 36 locales. Le consentement est persisté séparément pour chaque hôte/projet et version du schéma ; il est restauré après initialisation du stockage. Le retrait retire les écouteurs et annule les requêtes en cours. Les anciennes promesses génériques de données toujours agrégées ont été retirées de cet écran : les rapports d’erreurs sont des événements individuels.

L’adaptateur HTTP envoie des événements `$exception` selon le [schéma manuel officiel PostHog](https://posthog.com/docs/error-tracking/installation/manual). Il écoute uniquement les erreurs JavaScript non interceptées (`error`) et les promesses rejetées sans gestionnaire (`unhandledrejection`) pendant l’accord. Aucun SDK de capture automatique, enregistrement de session, breadcrumb, profil utilisateur ou cookie n’est activé.

Chaque rapport contient un type d’erreur parmi une liste fermée, un message technique constant, la version et le système, une identité aléatoire non réutilisée et éventuellement des positions numériques dans le bundle principal de l’application. Les URL, noms de fichiers et fonctions sont remplacés ou omis ; messages bruts, causes, propriétés personnalisées, conversations, prompts et clés ne sont jamais sérialisés. Seules les positions reconnues dans les URL de ressources `tauri.localhost/assets/index-*.js` sont retenues ; les autres piles sont omises. La pile est plafonnée à dix positions, les rapports identiques sont dédupliqués et le nombre d’envois est limité à dix par période d’activation du collecteur. Aucune file persistante ni relance réseau.

Limites : les erreurs déjà interceptées par React/le routeur ou les fournisseurs ne sont pas couvertes, ni les crashs natifs Rust/Android ou du moteur. Aucune source map n’est publiée : les positions disponibles concernent le code compilé, sans résolution vers les sources. La région réelle du projet, CORS/WebView2 et l’affichage/regroupement dans PostHog restent à valider sur une compilation de test et un rapport explicitement consenti. Les lanceurs Desktop/Android continuent de vider les variables de destination ; cette préparation ne change aucun binaire et n’effectue aucun envoi réel. La conservation des IP et la rétention côté service restent à configurer.

Validation locale : 44 tests ciblés réussis dans huit fichiers (télémétrie, filtrage des erreurs, consentements indépendants, révocation, limites, stockage et écran de confidentialité). TypeScript sans émission réussi ; inventaire des 36 locales validé, 1 513 clés anglaises, wu partiel à 756 clés. Les appels réseau sont simulés dans les tests. Aucune compilation de l’application ni publication distante.

`node --test scripts/__tests__/novera-update.test.mjs` vérifie la construction de la configuration et du manifeste sur des données synthétiques, sans clé de production ni réseau. `python scripts/check-novera-locales.py` vérifie les 36 catalogues. Les tests web couvrent le consentement, la révocation, l’absence de destination, le contenu autorisé et l’ordre téléchargement/arrêt/installation. Les vérifications de sources ne constituent pas un essai de mise à jour réelle : celui-ci reste nécessaire avec une première release signée.
