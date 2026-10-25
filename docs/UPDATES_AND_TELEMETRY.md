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

Actualisation du 25 octobre 2026 : le mainteneur a fourni le jeton public de son projet PostHog et confirmé la région Europe. La configuration est préparée localement dans `web-app/.env.local`, ignoré par Git, avec l’origine de collecte `https://eu.i.posthog.com`. Le jeton n’est pas recopié dans cette documentation. Aucune compilation, aucun changement du consentement utilisateur et aucun événement réel envoyé pendant cette préparation ; la région et la réception effectives du projet restent à vérifier lors du raccordement réel. Le lanceur Desktop vidait alors les variables statistiques, comme les scripts Android. Le paramètre explicite ajouté ensuite pour Desktop est décrit dans la section de compilation et validation ci-dessous. Une invocation directe de Vite peut lire le fichier local ; le consentement reste alors désactivé par défaut.

Choix du mainteneur : statistiques minimales avec accord explicite. Par défaut, les lanceurs produisent des compilations **sans destination de collecte**. Le lanceur Desktop accepte désormais `-WithTelemetry` pour incorporer explicitement la configuration locale ; cela n’accorde aucun consentement. Sans destination disponible, le choix est désactivé dans Confidentialité et l’assistant de démarrage ne demande pas de consentement.

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

Le serveur destinataire voit nécessairement les informations réseau de connexion. Le mainteneur doit configurer les journaux serveur, la rétention et l’absence de conservation/enrichissement des IP. Le client ne prétend pas garantir à lui seul l’anonymat des journaux d’un service tiers. La préparation initiale n’effectuait aucun envoi ; la validation ultérieure d’un unique rapport synthétique est décrite ci-dessous. [API PostHog](https://posthog.com/docs/api).

Les journaux locaux de diagnostic restent distincts de ces statistiques. Le mécanisme avancé OpenTelemetry des agents reste lui aussi distinct, désactivé par défaut et activable seulement par sa configuration explicite de collecteur ; il n’est pas activé par le bouton de statistiques. La mise à jour du CLI historique reste désactivée. Les modèles sont désormais téléchargés directement depuis leur URL source, sans détour par le miroir Jan ni identifiant HMAC.

## Contrôles de préparation

### Suivi des erreurs — 25 octobre 2026

À la demande du mainteneur, les sources préparent aussi PostHog **Error tracking** avec la même destination européenne. Le réglage indépendant Paramètres → Confidentialité → Suivi des erreurs est désactivé par défaut, sans reprendre le consentement aux statistiques. Ses deux textes sont traduits dans les 36 locales. Le consentement est persisté séparément pour chaque hôte/projet et version du schéma ; il est restauré après initialisation du stockage. Le retrait retire les écouteurs et annule les requêtes en cours. Les anciennes promesses génériques de données toujours agrégées ont été retirées de cet écran : les rapports d’erreurs sont des événements individuels.

L’adaptateur HTTP envoie des événements `$exception` selon le [schéma manuel officiel PostHog](https://posthog.com/docs/error-tracking/installation/manual). Il écoute uniquement les erreurs JavaScript non interceptées (`error`) et les promesses rejetées sans gestionnaire (`unhandledrejection`) pendant l’accord. Aucun SDK de capture automatique, enregistrement de session, breadcrumb, profil utilisateur ou cookie n’est activé.

Chaque rapport contient un type d’erreur parmi une liste fermée, un message technique constant, la version et le système, une identité aléatoire non réutilisée et éventuellement des positions numériques dans le bundle principal de l’application. Les URL, noms de fichiers et fonctions sont remplacés ou omis ; messages bruts, causes, propriétés personnalisées, conversations, prompts et clés ne sont jamais sérialisés. Seules les positions reconnues dans les URL de ressources `tauri.localhost/assets/index-*.js` sont retenues ; les autres piles sont omises. La pile est plafonnée à dix positions, les rapports identiques sont dédupliqués et le nombre d’envois est limité à dix par période d’activation du collecteur. Aucune file persistante ni relance réseau.

Limites : les erreurs déjà interceptées par React/le routeur ou les fournisseurs ne sont pas couvertes, ni les crashs natifs Rust/Android ou du moteur. Aucune source map n’est publiée : les positions disponibles concernent le code compilé, sans résolution vers les sources. La validation ultérieure décrite ci-dessous confirme le projet Europe et le traitement d’un rapport synthétique ; le transport d’une erreur depuis le WebView reste à vérifier. Sans option explicite, les lanceurs continuent de vider les variables de destination. La préparation initiale seule ne compilait aucun binaire et n’envoyait aucun rapport. La conservation des IP et la rétention côté service restent à configurer.

Validation locale : 44 tests ciblés réussis dans huit fichiers (télémétrie, filtrage des erreurs, consentements indépendants, révocation, limites, stockage et écran de confidentialité). TypeScript sans émission réussi ; inventaire des 36 locales validé, 1 513 clés anglaises, wu partiel à 756 clés. Les appels réseau sont simulés dans les tests. Aucune compilation de l’application ni publication distante.

`node --test scripts/__tests__/novera-update.test.mjs` vérifie la construction de la configuration et du manifeste sur des données synthétiques, sans clé de production ni réseau. `python scripts/check-novera-locales.py` vérifie les 36 catalogues. Les tests web couvrent le consentement, la révocation, l’absence de destination, le contenu autorisé et l’ordre téléchargement/arrêt/installation. Les vérifications de sources ne constituent pas un essai de mise à jour réelle : celui-ci reste nécessaire avec une première release signée.

## Compilation Desktop et validation Europe — 25 octobre 2026

Le mainteneur a ensuite autorisé la compilation et le test réel du raccordement Europe. Le lanceur Desktop accepte maintenant :

```powershell
./scripts/distribution/build-novera-local.ps1 -WithTelemetry
```

`scripts/distribution/read-novera-telemetry.ps1` lit uniquement les deux valeurs publiques de `web-app/.env.local`, sans exécuter le contenu. Il refuse les doublons, clés privées, hôtes Jan, HTTP et origines avec identifiants, chemin, paramètres ou fragment. Aucun jeton n’est affiché dans les journaux. Sans `-WithTelemetry`, les variables sont toujours vidées. Android n’est pas modifié. Aucun changement des valeurs par défaut des consentements.

Résultat : compilation web et Rust release réussie, sortie `deliverables/Novera-desktop-1.0.0-2026-10-25_02-59-20-029`. Exécutable de 60 113 408 octets, SHA-256 `3EA0AB5571BF9EFEDF2584C0EE5D4DEAD87B8E12CA4E94AB2A9EC04A2A19B426`. Ressources et empreintes livrées avec l’exécutable. L’ancien dossier de distribution a été conservé et son exécutable revérifié. La présence de la destination et du nouveau jeton Europe dans les ressources web compilées a été contrôlée sans les afficher.

Le nouveau programme démarre sur un profil isolé sous `.build/posthog-desktop-validation-2026-10-25/profile`, avec `JAN_DATA_ROOT` et un dossier WebView2 dédiés. L’écran Confidentialité en français affiche `eu.i.posthog.com` et les deux interrupteurs désactivés. Aucun interrupteur n’a été actionné ; le profil de test a été fermé. Cette vérification ne touche pas les conversations ou consentements du profil habituel.

Un harnais Node compile le même adaptateur et envoie **un seul** `$exception` synthétique, avec la version `1.0.0-validation` et un identifiant aléatoire. Le message sentinelle est exclu du corps envoyé. Le point de collecte européen répond HTTP 200 / `Ok` ; le précontrôle CORS accepte l’origine `http://tauri.localhost`. Le rapport a ensuite été observé dans Activity du projet Europe **319433**, puis dans Error tracking : **TypeError — Unhandled application error**, une occurrence. Ces observations confirment la région et le traitement/regroupement du rapport synthétique. Elles ne constituent pas un envoi depuis le WebView du programme : ce transport et une vraie erreur d’utilisation restent non testés. Aucun crash volontaire n’a été provoqué dans l’application et aucun événement de démarrage utilisateur n’a été envoyé.

Contrôles supplémentaires : douze cas de configuration réussis, trois tests du mécanisme de mise à jour réussis. Les 44 tests web et les 36 locales validés précédemment restent la référence du code de consentement et de filtrage, inchangé pendant cette compilation. Preuves locales : `.build/posthog-desktop-validation-2026-10-25/validation.json` et journaux du lanceur. Le projet PostHog doit conserver sa politique de suppression des IP et sa rétention adaptées ; le serveur voit toujours les informations de connexion.

Le code initial du suivi des erreurs est publié dans le commit `0990a25c761910b7b7b39b2d269b0b117e655ce2`. Le paramètre du lanceur, le présent compte rendu et les fichiers compilés restent **locaux** à cette étape. Aucun nouvel envoi Git, binaire public, workflow, APK ou mécanisme de mise à jour automatique.

## Inclusion dans la synchronisation des sources — 25 octobre 2026

Le paramètre `-WithTelemetry`, son lecteur de configuration et ce compte rendu sont inclus dans la publication des dernières sources. Le lecteur passe 16 assertions de sécurité sur des valeurs synthétiques, sans réseau ; les contrôles du lanceur passent 69 assertions sans compilation. Le fichier `web-app/.env.local`, ses valeurs et les fichiers compilés restent locaux et exclus. Les états « locaux » des paragraphes précédents décrivent leurs étapes historiques. Aucun nouveau rapport PostHog, consentement utilisateur ou binaire n’est envoyé pour cette synchronisation.

## Question du premier démarrage — 25 octobre 2026

Le suivi des erreurs possède maintenant sa propre étape Autoriser / Refuser, après l’éventuelle demande de statistiques et avant le modèle. Le choix est mémorisé dans le store existant et reste désactivé par défaut. Sans destination configurée, l’autorisation est impossible et aucun rapport n’est envoyé. L’acceptation des statistiques ne répond pas à cette question. Les filtres, le contenu limité des rapports et le retrait du consentement restent inchangés. Voir [premier démarrage](FIRST_RUN_OPTIONS.md).
