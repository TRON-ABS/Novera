# Audit de sécurité local de Novera — 6 novembre 2026

## Conclusion et périmètre

Quatre constats prioritaires ressortent : permissions natives accordées à des origines HTTP distantes, serveur réseau utilisable sans authentification, dérivation prévisible de la clé de chiffrement de secours desktop et dépendance Excel vulnérable sur un chemin réellement utilisé. Les deux premiers dépendent d'une navigation ou d'une configuration particulière. Aucune compromission d'utilisateur ni exploitation des binaires publics n'est démontrée.

Audit des **sources locales**, commit de référence `d28074830637783586e3026e7fd3c8424f83f41e`, branche `codex/data-disclosure`, avec changements non committés préexistants. Les empreintes de 19 fichiers examinés sont conservées dans [scope.json](scope.json). Ce commit seul ne reproduit donc pas l'état audité.

Méthode : revue manuelle des frontières WebView/native, permissions des outils, aperçus HTML, stockage des clés, API locale, import documentaire, extraction d'archives et mises à jour ; exécution de tests existants ; consultation des bases npm et OSV/RustSec. Les contrôles statiques et la démonstration cryptographique sont reproductibles avec [check-evidence.mjs](check-evidence.mjs).

Les niveaux ci-dessous sont des priorités d'audit contextuelles, pas des scores CVSS attribués à Novera. Les constats de configuration, démonstrations synthétiques et avis de dépendances restent distingués.

## Constats prioritaires

### SEC-01 — Permissions natives pour les pages HTTP distantes

**Priorité élevée, exploitation conditionnelle ; configuration confirmée.**

Dans [default.json](../../src-tauri/capabilities/default.json), la fenêtre `main` accorde ses permissions aux origines correspondant à `http://*`. Cela inclut notamment les outils d'agent, le lecteur documentaire, le store et le client HTTP natif. Cette capacité est activée dans [tauri.conf.json](../../src-tauri/tauri.conf.json). La [documentation Tauri](https://v2.tauri.app/security/capabilities/#remote-api-access) confirme que `remote.urls` donne accès aux permissions aux origines distantes correspondantes.

Condition : une page contrôlée par un tiers doit parvenir à se charger dans le contexte auquel cette capacité s'applique. Une page visitée dans le navigateur externe n'acquiert pas ces droits. Aucune navigation hostile ni invocation IPC dans une application compilée n'a été réalisée ; aucune exécution arbitraire de commande shell n'est revendiquée.

Correction proposée : retirer les origines distantes de la capacité principale ; si un usage distant est indispensable, lui réserver une capacité minimale et une WebView séparée. Vérifier également les navigations de la fenêtre principale et les redirections. Critère de validation : une page HTTP de test ne peut invoquer aucun outil natif privilégié, tandis que l'interface locale conserve ses fonctions.

### SEC-02 — API accessible sur le réseau avec une clé vide

**Priorité élevée lorsque l'écoute réseau est activée ; chemin de code confirmé.**

Dans [proxy.rs](../../src-tauri/src/core/server/proxy.rs), l'authentification des routes protégées n'est vérifiée que si `proxy_api_key` n'est pas vide. `start_server_internal` accepte une écoute hors loopback avec une clé vide et émet seulement un avertissement dans les journaux. La validation de clé dans [local-api-server.tsx](../../web-app/src/routes/settings/local-api-server.tsx) est commentée.

Condition : choisir `0.0.0.0`, démarrer le serveur sans clé et rendre son port accessible. Les contrôles de l'en-tête Host ne remplacent pas une authentification : un client réseau peut présenter l'IP privée attendue. L'inférence et les routes accessibles peuvent alors être utilisées sans secret ; le risque augmente si l'exécution d'outils côté serveur est activée. Par défaut, l'écoute est `127.0.0.1` et l'exécution d'outils serveur est désactivée : aucune exposition réseau par défaut n'est affirmée.

Correction proposée : refuser côté Rust une écoute hors loopback sans clé non vide après nettoyage des espaces ; générer une clé forte et présenter l'erreur dans l'interface. Critère de validation : la combinaison réseau/clé vide échoue avant l'ouverture du port ; les requêtes sans clé reçoivent 401 en mode authentifié. Aucun serveur n'a été démarré pendant cet audit.

### SEC-03 — Clé de chiffrement de secours desktop prévisible

**Priorité moyenne ; dérivation confirmée et démonstration synthétique réussie.**

Dans [provider_secrets.rs](../../src-tauri/src/core/server/provider_secrets.rs), le secours desktop hors mode portable utilise AES-256-GCM avec une clé dérivée de `SHA256(sel public || identifiant machine)`. Si la lecture de l'identifiant échoue, une chaîne constante le remplace. Ces entrées ne constituent pas un secret cryptographique.

Condition : le stockage de secours doit être utilisé et l'attaquant doit obtenir son fichier ainsi que l'identifiant machine, ou rencontrer le cas de repli constant. Le coffre système reste le premier choix ; ce constat ne démontre pas un accès distant aux clés ni une faiblesse d'AES-GCM. Les chemins mobile et portable utilisent d'autres mécanismes et ne sont pas couverts par ce constat.

[check-evidence.mjs](check-evidence.mjs) reproduit la dérivation publique et déchiffre un message AES-GCM entièrement synthétique, dans les cas identifiant connu et repli constant. Aucun identifiant réel de ce poste ni fichier de secrets utilisateur n'a été lu. Le contrôle d'accès au fichier reste une protection distincte ; sur Windows, la fonction locale `restrict_permissions` ne fait rien, sans que cela prouve à lui seul une ACL Windows permissive.

Correction proposée : utiliser un secret aléatoire protégé par le système et prévoir une migration du fichier existant ; supprimer le repli vers une clé commune. Si aucun stockage sûr n'est disponible, proposer explicitement un fonctionnement sans persistance des clés. Critère : posséder le fichier et connaître l'identifiant machine ne suffit plus à déchiffrer les clés.

### SEC-04 — Import Excel exposé à une dépendance vulnérable

**Priorité élevée pour la disponibilité ; version affectée et chemin d'appel confirmés, attaque non exécutée.**

Le plugin RAG dépend de `calamine = "0.23"`, résolu en **0.23.1** dans le verrou principal. [parser.rs](../../src-tauri/plugins/tauri-plugin-rag/src/parser.rs) dirige notamment les `.xls` vers `open_workbook_auto` dans `parse_spreadsheet`.

L'avis [RUSTSEC-2026-0436](https://rustsec.org/advisories/RUSTSEC-2026-0436.html) décrit des paniques et allocations mémoire non bornées sur des classeurs OLE2 malformés ; le correctif annoncé est **0.38.0 ou ultérieur**. Dans Novera, l'import d'un fichier fourni par un tiers constitue le point d'entrée. La limite de 200 Mo porte sur le fichier d'entrée et ne borne pas les allocations du parseur. `commands.rs` intercepte les paniques : cela réduit leur effet, mais ne récupère pas un arrêt pour épuisement mémoire. L'avis amont ne démontre ni vol de données ni exécution de code.

Correction proposée : migrer vers une version corrigée en adaptant l'API et les tests de lecture ; isoler le parsing documentaire avec limites de mémoire et de temps. Critère : formats Excel existants toujours lisibles et fichiers malformés refusés dans un processus isolé aux ressources limitées. Aucun fichier provoquant un épuisement mémoire n'a été ouvert pendant cet audit.

## Autres points à traiter

- **Réduire la portée du protocole média et durcir la CSP.** `assetProtocol.scope.allow = ["**/*"]`, y compris les chemins cachés, et `script-src` autorise `unsafe-eval` et des sources asset. Cela augmente l'impact possible d'une injection ou d'une dépendance compromise. Ce n'est pas une preuve d'injection XSS autonome. Restreindre aux racines nécessaires et vérifier les usages avant retrait des autorisations.
- **Trier les dépendances par chemin réellement livré.** Le scan npm retourne 159 enregistrements, 139 URL d'avis distinctes, 41 noms de paquets ; les sévérités par enregistrement sont 8 critiques, 67 élevées, 70 modérées et 14 faibles. Malgré le filtre production, les résultats contiennent des outils de développement via les espaces de travail. Ces nombres ne sont donc pas des vulnérabilités exploitables confirmées du binaire. Examiner en particulier les dépendances de rendu et de désérialisation, et séparer les outils de build/tests.
- **Compléter le tri Rust.** OSV a contrôlé 998 versions de paquets du verrou principal ; 36 correspondent à 59 identifiants d'avis, alias GHSA/RustSec et avertissements de maintenance compris. Ce n'est pas un total de 59 failles distinctes. Les alertes ZIP ne doivent pas être attribuées automatiquement au code Novera : son extraction utilise une boucle `by_index`/`enclosed_name`, et non nécessairement les fonctions `extract` visées par certains avis. Les limites d'expansion et les liens préexistants restent à éprouver.

Les résultats bruts et détails des avis sont conservés dans ce dossier : [npm](npm-production-audit.jsonl), [npm depuis le workspace Web](npm-web-production-audit.jsonl), [OSV Rust](rust-osv-audit.json), [détails Rust](rust-osv-details.json), [compteurs](dependency-summary.json). Les requêtes aux bases ont transmis des noms et versions de dépendances, aucun fichier source ni secret.

## Protections observées et vérifications exécutées

**83 tests existants réussis, aucun échec :** 59 tests Web sur six fichiers et 24 tests Node sur trois fichiers. Ils couvrent notamment les accords d'outils, les réglages de l'API, les aperçus HTML et le rejet de signatures/paquets altérés. Ils ne constituent pas des preuves de correction des quatre constats.

L'aperçu HTML utilise une iframe sans `allow-same-origin` et une CSP dédiée ; le protocole preview canonicalise les chemins avant de vérifier les racines autorisées. Les clés fournisseurs sont retirées de l'état persistant frontend et le coffre système est privilégié. Le moteur HTTP llama.cpp examiné écoute sur loopback et exige un jeton. Les tests cryptographiques des mises à jour vérifient réellement Ed25519 et refusent les contenus altérés.

Commandes exécutées depuis la racine du dépôt :

```powershell
node node_modules/vitest/vitest.mjs run --project @janhq/web-app web-app/src/components/__tests__/HtmlArtifact.test.tsx web-app/src/components/ai-elements/__tests__/tool-approval-scope.test.tsx web-app/src/hooks/__tests__/useLocalApiServer.test.ts web-app/src/hooks/__tests__/useLocalApiServer.coverage.test.ts web-app/src/lib/__tests__/previewInspector.test.ts web-app/src/lib/__tests__/previewShim.test.ts
node --test scripts/distribution/__tests__/ci-check-updater.test.mjs scripts/__tests__/novera-update.test.mjs scripts/distribution/__tests__/verify-public-release.test.mjs
corepack yarn npm audit --all --recursive --json
corepack yarn npm audit --all --recursive --json --environment production
corepack yarn workspace @janhq/web-app npm audit --recursive --environment production --json
node deliverables/security-audit-2026-11-06/check-evidence.mjs
```

Les commandes npm audit signalent des alertes par un code de sortie 1 ; ce code n'est pas un échec des tests applicatifs. Le scan Rust utilise `https://api.osv.dev/v1/querybatch`, par lots de 300 paquets issus de `src-tauri/Cargo.lock`, puis récupère les détails par `/v1/vulns/ID`. Les résultats sont datés par le périmètre d'audit et doivent être actualisés avant une release.

## Limites et décision

Aucun correctif applicatif, changement de dépendance, compilation native, installation, publication ou réglage distant n'a été effectué. Pas d'essai d'exploitation dans les WebViews réelles, de capture réseau, d'audit exhaustif des secrets/historique Git, de revue complète des workflows et accès GitHub, ni de vérification des binaires publics. Les dépendances Python, le code C/C++ des moteurs et les autres verrous Rust ne sont pas couverts par les scans. Aucun pentest multiplateforme ni certification indépendante n'est revendiqué.

L'audit apporte des constats traçables sur un périmètre identifié. Il ne permet pas de déclarer Novera entièrement sûr. Priorité de correction : supprimer la confiance HTTP distante, imposer l'authentification réseau, corriger le lecteur Excel, puis remplacer la dérivation du chiffrement de secours et trier les autres dépendances. Chaque correction demande des tests de régression et une validation sur les builds concernés.
