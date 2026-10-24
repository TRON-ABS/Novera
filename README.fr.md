<div align="center">
  <img src=".github/assets/novera-banner-en.png" alt="Novera — Knowledge for everyone. Cyan holographic hand above a connected world." width="100%" />
  <p><strong>Le savoir pour tous. Une IA qui avance avec son temps.</strong></p>
  <p>Un assistant IA indépendant porté par TRON-ABS, réunissant modèles locaux, fournisseurs cloud et outils évolutifs.</p>
  <p><strong>En développement</strong> · 36 langues et variantes d’interface · Apache 2.0</p>
  <p>Contact officiel : <a href="mailto:contact.novera.tronabs@gmail.com">contact.novera.tronabs@gmail.com</a></p>
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

Nos 19 contributions linguistiques sont intégrées aux 17 locales héritées. Les 18 nouveaux catalogues complets couvrent chacun les **1 510 clés anglaises**. Le **wu / shanghaïen reste partiel avec 753 clés** ; les textes manquants utilisent le repli anglais. Une relecture par des locuteurs natifs reste nécessaire.

L’arabe standard, l’arabe égyptien, l’ourdou, le pendjabi occidental et le persan iranien bénéficient du support de l’écriture de droite à gauche. Les capacités linguistiques des modèles dépendent du modèle choisi et sont distinctes de la traduction de l’interface.

**[Consulter toutes les langues, leurs noms et leur couverture →](docs/LANGUAGES.md)**

Au premier démarrage, Novera détecte et sauvegarde la langue système si aucun choix n’existe. Si l’utilisateur change de langue, son nouveau choix remplace la sauvegarde et est utilisé aux démarrages suivants. Cette [fonction de première arrivée](docs/SYSTEM_LANGUAGE.md) est disponible dans les sources et attend la prochaine compilation de bureau.

## Où en est le projet ?

Novera possède son identité et son dépôt de sources. **Aucun installateur ni binaire Novera n’a encore été publié.** Les téléchargements Jan existants ne sont pas des versions Novera.

Les sources actuelles incluent l’identité Novera, les évolutions du moteur et des conversations, ainsi qu’un premier modèle fixe : **LiquidAI LFM2.5-2.6B Q6_K**, température **0,1**, top-k **50**, pénalité de répétition **1,1**, contexte de **32 768 tokens**. Le téléchargement reste déclenché par l’utilisateur.

**Novera 1.0.0** intègre **35 corrections Windows**. La version locale Windows x64 a été compilée en release avec LTO fat et son démarrage isolé vérifié : **4 975 tests web réussis (2 ignorés)**, démarrage natif et persistance de langue vérifiés. Les **96 tests natifs ciblés** avaient réussi sur l’ancien build et n’ont pas été relancés pour cette compilation. Cela ne constitue pas une validation complète des générations ni des autres plateformes. Les mises à jour applicatives et GitHub Actions restent désactivés pendant la préparation d’une distribution indépendante.

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

## Centre de contrôle du développement

Le [tableau de bord Novera](TABLEAU_DE_BORD_NOVERA.md) centralise les fichiers essentiels, l’état des sources et du binaire, les validations et les travaux restants.

Voir l’[architecture en six domaines](docs/ARCHITECTURE.md) pour les règles extraites, les adaptateurs, la compatibilité et les migrations restantes. Ces changements sont inclus dans cette publication des sources.

Les sources locales ajoutent les [commandes de discussion](docs/CONVERSATION_CONTROLS.md), l’export et la suppression confirmée. Ces changements, la restructuration modulaire et la sélection de langue système sont inclus dans le build local du 24 octobre 2026. Démarrage et persistance de langue sont vérifiés sur profil isolé. Les dialogues natifs d’enregistrement/impression restent à valider manuellement.

Dernière mise à jour des sources (24 octobre 2026) : infobulles dans les 36 langues, dates/statistiques localisées, recherche Internet active par défaut avec choix sauvegardé conservé, filtrage du protocole outil brut et fermeture du menu au clic extérieur. Mises à jour signées et statistiques avec consentement préparées, sans activation ni configuration de production. Voir [la préparation](docs/UPDATES_AND_TELEMETRY.md). Démarrage isolé du dernier build local vérifié ; aucun binaire publié avec les sources. Les chiffres de tests précédents décrivent leurs builds historiques.

Le Hub propose six petits modèles GGUF épinglés, estimation mémoire selon le matériel, tri et filtres par taille, comparaison de trois modèles, scores fabricant sourcés et test local annulable des modèles déjà lancés. Les 29 nouveaux textes sont traduits dans les 36 langues. [Fonctionnement et limites des mesures](docs/HUB_DISCOVERY.md). Validation locale : 5 103 tests web réussis, 2 ignorés ; TypeScript et langues réussis. Démarrage du build Windows local vérifié ; binaires exclus de cette publication des sources.

Les scripts Android intègrent désormais SDK 37.2, JDK 27.0.1.0.3, NDK r30, Gradle 9.8.1, AGP 9.4.0 et Kotlin 2.4.21. La compilation locale d’APK debug ARM64 est vérifiée ; le fonctionnement sur téléphone et la distribution publique restent à valider. Le lanceur garde Android désactivé pendant les audits mobiles. [Versions, configuration reproductible et limites](docs/ANDROID_TOOLCHAIN.md).
