# Novera — plan pour une version propriétaire et une base indépendante de Jan

Date : 23 octobre 2026.
Statut : document de préparation ; aucun changement de licence ni remplacement de code effectué.

## 1. Deux objectifs à distinguer

**Distribuer une version propriétaire de Novera ne nécessite pas de remplacer tout Jan.** Apache 2.0 autorise des conditions différentes pour les modifications et une œuvre dérivée dans son ensemble, sous réserve de respecter les obligations sur les éléments hérités. Cela ne transfère pas leur propriété. Les copies déjà diffusées sous Apache conservent les permissions accordées. La licence prévoit notamment sa fourniture aux destinataires, le signalement des fichiers modifiés, la conservation des mentions applicables et la transmission des attributions NOTICE lorsqu’elles existent. Elle n’accorde pas une autorisation générale d’utiliser les marques. Voir les articles 2, 4 et 6 de la [licence officielle Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).

**Détenir les droits sur une base applicative indépendante de Jan est un objectif supplémentaire.** Il faut établir la provenance de chaque élément, remplacer les expressions protégées héritées ou obtenir les autorisations nécessaires. Aucun pourcentage de lignes modifiées ne prouve cette indépendance.

Le présent plan couvre ce second objectif tout en identifiant les composants tiers qui pourraient rester dans un produit propriétaire. Il ne constitue ni une nouvelle licence ni une certification juridique.

## 2. Périmètre et limites du relevé

Le relevé porte sur l’arborescence locale de Novera, dont les manifestes indiquent une version applicative 0.8.7. Le HEAD local observé est `648e8da55438150ccfab78808fa97a7a8e458c9f`, avec de nombreuses modifications non validées. Cet état ne doit pas être confondu avec la version publiée sur GitHub.

Les chemins ci-dessous sont relatifs à la racine du projet. Leur présence a été observée ; leur origine exacte et leurs titulaires ne sont pas encore établis fichier par fichier. « À examiner » ne signifie donc pas « propriété prouvée de Jan ».

Le fichier `LICENSE` actuel mentionne Jan, Copyright 2025 Menlo Research, et Apache 2.0. Certains manifestes conservent `@janhq/*`, `Jan` ou une licence Apache. Un nom conservé peut servir à la compatibilité ; le changer ne résout pas une question de droits.

## 3. Inventaire des ensembles à examiner

Pour chaque ligne : identifier les fichiers réellement hérités, les créations ultérieures, les apports de contributeurs et les éléments externes. Remplacer seulement ce qui doit l’être pour l’objectif retenu. Ne pas présumer que tout le dossier appartient au même titulaire.

| Ensemble et chemins observés | Éléments dont la provenance doit être vérifiée | Travail pour une implémentation indépendante de Jan |
| --- | --- | --- |
| Interface : `web-app/src/components`, `containers`, `routes`, `styles` | Composants, composition visuelle originale, styles, écrans, animations | Concevoir une interface Novera et programmer ses composants à partir des besoins ; traiter séparément les composants tiers. |
| Logique de l’interface : `web-app/src/hooks`, `stores`, `services`, `providers`, `utils`, `lib`, `constants`, `types` | État, orchestration des conversations, appels natifs, formats et utilitaires | Définir les comportements attendus et recréer la logique ; documenter les interfaces nécessaires à la compatibilité. |
| Socle TypeScript : `core/src` | Types, gestionnaires, abstractions, API et mécanismes de communication | Définir un socle propre à Novera ; éviter de recopier les implémentations et leur documentation. |
| Démarrage natif : `src-tauri/src/main.rs`, `lib.rs`, `core/app`, `core/setup.rs`, `core/state.rs` | Initialisation, commandes, configuration et état partagé | Reconcevoir le cycle de vie et le raccordement à Tauri ; Tauri reste un composant tiers distinct. |
| Agent : `src-tauri/src/core/agent` | Boucles d’exécution, outils, instructions, gestion du contexte et orchestration | Écrire des spécifications fonctionnelles puis une implémentation propre, avec des instructions originales. |
| Conversations : `src-tauri/src/core/threads` | Persistance, traitement des messages, migrations et helpers | Concevoir le stockage Novera ; définir et vérifier séparément les besoins d’import des données existantes. |
| Serveur et fournisseurs : `src-tauri/src/core/server`, `core/openai_schema.rs` | Adaptateurs, proxy, conversion de requêtes, gestion des secrets | Implémenter les protocoles à partir des spécifications et conditions autorisées des fournisseurs. |
| MCP : `src-tauri/src/core/mcp` | Connexions, OAuth, outils, serveur et transformations | Réimplémenter la logique propre au projet en utilisant les spécifications et bibliothèques dont les conditions conviennent. |
| Système : `src-tauri/src/core/filesystem`, `downloads`, `system` | Accès fichiers, téléchargements, gestion des processus et arrêt | Recréer les services Novera et leurs comportements nécessaires. |
| Mises à jour : `src-tauri/src/core/updater`, `src-tauri/latest.json.template` | Client, validation, modèles de métadonnées et configuration | Concevoir une chaîne Novera, avec son infrastructure et ses clés ; ne pas réutiliser les secrets ou services de Jan. |
| CLI et terminal : `src-tauri/src/core/cli`, `src-tauri/novera-cli`, `novera-agent.sh`, `build-tui.sh` | Commandes, interface terminal, aides et scripts | Concevoir les commandes Novera et réécrire leur implémentation et leurs textes. |
| Utilitaires Rust : `src-tauri/utils` | Fonctions partagées et code repris | Classer chaque fichier puis remplacer les implémentations héritées si nécessaire. |
| Plugins natifs : `src-tauri/plugins` | Plugins llama.cpp, MLX, RAG, vector-db, hardware, websearch, agent-tools ; API TypeScript associées | Recréer les couches d’intégration spécifiques à Jan ; distinguer ces couches des moteurs et bibliothèques externes. |
| Extensions : `extensions` | Assistant, conversation, téléchargement, llama.cpp, MLX, RAG, vector-db et configuration | Définir un contrat d’extension Novera puis réaliser les extensions indépendantes. |
| Serveur MLX : `mlx-server/Sources`, `Package.swift` | Serveur Swift, orchestration et dépendances | Réimplémenter la couche applicative héritée ; examiner séparément les composants Apple/MLX et leurs versions. |
| SDK et protocoles : `packages/adk`, `adk/python`, `protocol` | Clients, installateurs, types, schémas RPC et fichiers générés | Concevoir les contrats Novera, écrire les clients, puis régénérer depuis des entrées et générateurs dont les droits sont établis. |
| Langues : `web-app/src/locales`, `web-app/src/i18n`, `docs/LANGUAGES.md`, `docs/language-support.json` | Textes sources, traductions, contributions externes et catalogue de clés | Établir les droits sur chaque contribution ; rédiger les textes et traductions indépendants nécessaires, sans sacrifier la couverture linguistique. |
| Images et identité : `web-app/public`, `src-tauri/icons`, `src-tauri/app-icon.png`, `.github/assets`, `demo.gif` | Logos, captures, illustrations, polices, icônes, médias intégrés et métadonnées | Remplacer les médias hérités par des créations utilisables ; conserver les licences nécessaires des ressources tierces. |
| Documentation : `docs`, `README*.md`, `CONTRIBUTING.md`, guides dans les sous-projets | Explications, exemples, captures, modèles et traductions repris | Écrire une documentation propre à Novera ; garder les archives historiques identifiées comme telles. |
| Tests : `tests`, `e2e`, `autoqa`, tests intégrés aux modules, `scripts/fixtures` | Tests, snapshots, jeux d’essai, exemples et données | Écrire des critères et tests depuis les exigences ; remplacer les données et fixtures reprises si leurs droits l’exigent. |
| Construction et distribution : `.github/workflows`, `.github/actions`, `.github/scripts`, `scripts`, `Makefile`, `src-tauri/build-utils`, `build.rs`, `sign.ps1`, `flatpak` | Scripts, modèles d’installateurs, manifests et automatisations | Préparer une chaîne Novera indépendante, puis ses essais après autorisation de compiler. |
| Configuration : `package.json`, manifestes des sous-projets, `Cargo.toml`, `tauri*.conf.json`, lockfiles, `.devcontainer`, `.husky`, configurations de tests | Métadonnées, scripts incorporés, configuration originale et références externes | Recréer les réglages requis depuis les besoins ; conserver les contraintes et licences des outils choisis. |
| Autres fichiers à la racine, `examples`, `deliverables` | Exemples, rapports, démonstrations et fichiers hors des modules principaux | Décider ce qui entre dans la distribution ; examiner les droits de tout contenu livré, même hors du code de production. |

Cette table couvre les familles observées, pas une liste juridiquement certifiée de tous les fichiers protégés. L’inventaire fichier par fichier reste à réaliser avant toute affirmation d’indépendance complète.

## 4. Composants tiers : conserver avec leurs conditions ou remplacer

Une version propriétaire peut utiliser des bibliothèques libres compatibles avec sa distribution. Cela ne rend pas ces bibliothèques propriétaires de Novera.

À inventorier séparément :

- Dépendances JavaScript/TypeScript directes et transitives : manifestes et `yarn.lock`, notamment React, composants d’interface, SDK de fournisseurs et paquets `@janhq/*` externes.
- Dépendances Rust directes, transitives et issues de Git : `Cargo.toml` et `Cargo.lock`, notamment Tauri et ses plugins.
- Dépendances Swift : `mlx-server/Package.swift` et résolutions associées.
- Dépendances Python et composants des SDK.
- Moteurs et exécutables téléchargés : examiner `scripts/download-lib.mjs`, `scripts/download-bin.mjs`, les ressources natives et leur provenance effective.
- Modèles IA, poids, tokenizers, embeddings, modèles de prompts et catalogues : contrôler les conditions de chaque version et l’autorisation de redistribuer ou d’utiliser commercialement.
- Polices, packs d’icônes, images, jeux de données, exemples et ressources embarquées.

Pour chacun : nom, version, source, empreinte, licence, mentions, mode d’intégration, contenu effectivement distribué, obligations et décision. Ne pas supposer qu’une licence autorise tout parce qu’un téléchargement est public. Une éventuelle obligation de copyleft doit être analysée selon le composant et son intégration ; toutes les licences libres ne produisent pas les mêmes effets.

## 5. Registre des droits à créer avant les remplacements

Utiliser une ligne par fichier ou groupe réellement homogène. Le statut initial est « à examiner », jamais « indépendant » par défaut.

| Chemin / version | Origine et preuve | Titulaire(s) identifiés | Licence / autorisation | Décision | Preuve du remplacement | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| À renseigner | Commit d’origine, source externe, contrat ou création documentée | À établir | À vérifier | Conserver sous licence / remplacer / obtenir des droits / exclure | Spécification, commits, auteurs, revue | En attente |

Le registre doit inclure les copies, déplacements, traductions, fichiers générés et éléments ajoutés après le changement de nom. Un fichier nouveau dans Git peut contenir du code ancien copié ailleurs.

Pour les contributions extérieures, vérifier les conditions de contribution et, si nécessaire, obtenir une autorisation ou cession adaptée. Le contrôle d’un dépôt et l’acceptation d’une PR ne prouvent pas à eux seuls la propriété exclusive de son contenu.

Les créations assistées par IA demandent une traçabilité des sources et des apports humains. Leur génération ne garantit ni originalité, ni exclusivité, ni absence de reprise d’un élément tiers.

## 6. Méthode pour les créations indépendantes

1. Décrire les besoins : conversation, gestion des modèles, langues, accessibilité, outils, stockage, compatibilité et sécurité.
2. Écrire des spécifications fonctionnelles sans recopier le code, les commentaires, les textes ou une organisation expressive propre à Jan.
3. Définir une architecture Novera et ses contrats internes à partir de ces besoins.
4. Produire les nouveaux modules avec l’historique des auteurs, sources utilisées et décisions de conception.
5. Vérifier les reprises éventuelles dans le code, les ressources, la documentation et les sorties générées.
6. Faire examiner la provenance et les droits avant de déclarer le module indépendant ou d’adopter des conditions exclusives.

Une démarche de séparation entre spécification et implémentation peut renforcer les preuves. Les personnes ayant déjà lu Jan doivent documenter cette exposition : elles ne peuvent pas revendiquer artificiellement n’avoir jamais eu accès au code. Le remplacement automatique de noms, une traduction de langage ou une réécriture par IA ne constituent pas une preuve d’indépendance.

Les fonctions et objectifs peuvent servir de besoins ; la protection de certains formats, interfaces, éléments de conception, ainsi que les éventuelles questions de brevets, doit être examinée selon le droit applicable. Aucune réécriture n’apporte à elle seule une garantie universelle.

## 7. Ordre de travail proposé

- **Étape 1 — provenance** : figer un état de référence et produire l’inventaire des fichiers et composants réellement livrés.
- **Étape 2 — choix de licence** : décider si le besoin est un produit propriétaire utilisant une base libre, une base indépendante de Jan, ou les deux.
- **Étape 3 — socle indépendant** : spécifier les données, protocoles et limites des modules ; prévoir la migration des conversations et paramètres.
- **Étape 4 — remplacement progressif** : interface, services natifs, moteur d’agent, extensions, SDK, traductions, médias et documentation, selon les dépendances techniques.
- **Étape 5 — distribution** : examiner les composants embarqués, préparer les notices, les conditions d’utilisation et la future chaîne de publication.
- **Étape 6 — validation** : revue technique et juridique du candidat exact avant toute déclaration d’indépendance complète.

Ne pas retirer une attribution au seul motif que le module a été renommé. Sa suppression éventuelle doit être justifiée par l’absence d’éléments concernés dans la distribution et une vérification des obligations restantes.

## 8. Conditions avant une version propriétaire

- [ ] Périmètre exact du produit et des sources distribuées défini.
- [ ] Inventaire des composants et registre des droits complétés.
- [ ] Droits nécessaires établis pour les créations Novera et les contributions.
- [ ] Éléments hérités conservés identifiés et obligations respectées.
- [ ] Si l’indépendance de Jan est revendiquée : absence de reprise protégée étayée par les preuves et la revue.
- [ ] Dépendances, modèles et médias compatibles avec le mode de distribution choisi.
- [ ] Conditions propriétaires limitées aux droits effectivement détenus, avec exceptions et notices des tiers.
- [ ] Aucun retrait rétroactif prétendu des permissions déjà accordées au public.
- [ ] Marque et identité traitées séparément ; aucune marque déposée présumée.
- [ ] Validation des données, migrations, fonctions et plateformes effectuée lorsque les essais seront autorisés.

**Décision actuelle : ce document prépare le travail. La licence du dépôt reste inchangée, aucune compilation n’est lancée et aucune conversion propriétaire n’est effectuée.**

## 9. Références

- [Apache License 2.0 — texte officiel](https://www.apache.org/licenses/LICENSE-2.0) : permissions et conditions de redistribution.
- [INPI — cas particulier des logiciels](https://www.inpi.fr/realiser-demarches/propriete-intellectuelle/cas-particulier-logiciels) : protection des logiciels et distinction avec les inventions techniques.
- [Politique d’identité Novera](../BRANDING.md).
- [Versions officielles et gouvernance](../OFFICIAL_RELEASES.md).
- [Licence actuellement présente dans le projet](../LICENSE).

La qualification précise des droits doit porter sur les fichiers et contrats réels. Ce plan technique ne remplace pas cette analyse avant un changement commercial de licence.
