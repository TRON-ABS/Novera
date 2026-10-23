<div align="center">
  <img src=".github/assets/novera-banner-en.png" alt="Novera — Knowledge for everyone. Cyan holographic hand above a connected world." width="100%" />
  <p><strong>Le savoir pour tous. Une IA qui avance avec son temps.</strong></p>
  <p>Un assistant IA indépendant porté par TRON-ABS, réunissant modèles locaux, fournisseurs cloud et outils évolutifs.</p>
  <p><strong>En développement</strong> · 36 langues et variantes d’interface · Apache 2.0</p>
  <p><a href="README.md">English</a> · <a href="docs/LANGUAGES.md">Langues</a> · <a href="ROADMAP.md">Feuille de route</a> · <a href="CONTRIBUTING.md">Contribuer</a></p>
</div>

---

## Pourquoi Novera

Notre objectif est de rendre le savoir et les capacités utiles de l’IA accessibles au plus grand nombre, quelles que soient la langue et l’expérience technique. Nous voulons développer un outil pour apprendre, créer et comprendre, avec l’éducation et les écoles dans notre ambition à long terme.

La direction du projet est claire : consolider les fondations, explorer rapidement les nouvelles capacités et transformer les expériences utiles en fonctions compréhensibles et accessibles.

## Les fondations

| Domaine | Présent dans les sources |
| --- | --- |
| IA locale et cloud | Des moteurs de modèles locaux et des connexions à des fournisseurs distants. La compatibilité dépend du modèle, du fournisseur et du matériel. |
| Outils et documents | Des intégrations MCP, la recherche dans les documents et des fonctions d’assistant héritées du code existant. |
| Interface multilingue | 36 locales sélectionnables, en comptant les variantes régionales et les écritures. La couverture varie selon la traduction. |
| Application extensible | Une application de bureau avec des points d’extension pour les moteurs, les outils et les futures capacités. |

Ces éléments décrivent les sources. La distribution Novera et sa validation en fonctionnement restent à préparer.

## 36 langues et variantes d’interface

Nos 19 contributions linguistiques sont intégrées aux 17 locales héritées. Les 18 nouveaux catalogues complets couvrent chacun les **1 465 clés anglaises**. Le **wu / shanghaïen reste partiel avec 706 clés** ; les textes manquants utilisent le repli anglais. Une relecture par des locuteurs natifs reste nécessaire.

L’arabe standard, l’arabe égyptien, l’ourdou, le pendjabi occidental et le persan iranien bénéficient du support de l’écriture de droite à gauche. Les capacités linguistiques des modèles dépendent du modèle choisi et sont distinctes de la traduction de l’interface.

**[Consulter toutes les langues, leurs noms et leur couverture →](docs/LANGUAGES.md)**

Au premier démarrage, Novera détecte et sauvegarde la langue système si aucun choix n’existe. Si l’utilisateur change de langue, son nouveau choix remplace la sauvegarde et est utilisé aux démarrages suivants. Cette [fonction de première arrivée](docs/SYSTEM_LANGUAGE.md) est disponible dans les sources et attend la prochaine compilation de bureau.

## Où en est le projet ?

Novera possède son identité et son dépôt de sources. **Aucun installateur ni binaire Novera n’a encore été publié.** Les téléchargements Jan existants ne sont pas des versions Novera.

Les sources actuelles incluent l’identité Novera, les évolutions du moteur et des conversations, ainsi qu’un premier modèle fixe : **LiquidAI LFM2.5-2.6B Q6_K**, température **0,1**, top-k **50**, pénalité de répétition **1,1**, contexte de **32 768 tokens**. Le téléchargement reste déclenché par l’utilisateur.

**Novera 1.0.0** intègre **35 corrections Windows**. La version locale Windows x64 a été compilée en release avec LTO fat et son démarrage isolé vérifié : **4 937 tests web réussis (2 ignorés)** et **96 tests natifs ciblés réussis**. Cela ne constitue pas une validation complète des générations ni des autres plateformes. Les mises à jour applicatives et GitHub Actions restent désactivés pendant la préparation d’une distribution indépendante.

Voir les [notes de mise à jour des sources](docs/UPDATES_2026-10-24.md).

**[Consulter la feuille de route →](ROADMAP.md)**

## Suivre le projet et contribuer

Le développement se déroule sur **[TRON-ABS/Novera](https://github.com/TRON-ABS/Novera)**. Les contributions doivent cibler ce dépôt. La relecture des traductions, les reproductions de bugs, la compatibilité des modèles et les améliorations d’accessibilité sont particulièrement utiles.

- [Guide de contribution](CONTRIBUTING.md)
- [Inventaire des langues et contrôles des traductions](docs/LANGUAGES.md)
- [Notes sur le projet et sa compatibilité](NOVERA.md)
- [Feuille de route](ROADMAP.md)

## Projet officiel et identité

Le développement et les versions officielles de Novera sont maintenus par **TRON-ABS** dans ce dépôt. Consultez la [politique d’identité](BRANDING.md) et les [règles des versions officielles](OFFICIAL_RELEASES.md) pour les distinguer des projets dérivés indépendants. Les droits accordés par Apache 2.0 restent inchangés.

## Origine et licence

Novera s’appuie sur [Jan](https://github.com/janhq/jan), créé par Menlo Research et ses contributeurs. Nous conservons l’attribution d’origine et la [licence Apache 2.0](LICENSE), ainsi que le crédit aux projets libres utilisés. Novera est porté par TRON-ABS avec sa propre direction.
