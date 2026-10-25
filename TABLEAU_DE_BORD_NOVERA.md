# Novera — tableau de bord

État des sources au **25 octobre 2026**. Ce fichier est le point d’entrée ; les procédures, tâches et preuves détaillées sont dans les documents ci-dessous.

## Où trouver l’information ?

| Besoin | Document de référence |
| --- | --- |
| Présentation | [Français](README.fr.md) · [English](README.md) |
| Utiliser Novera : premier démarrage, modèles, discussions, confidentialité | [Guide utilisateur](docs/USER_GUIDE.md) |
| Architecture, moteur, compatibilité, dépendances et logos | [Développement](docs/DEVELOPMENT.md) |
| Compiler, préparer Windows/Android, signer et distribuer | [Construction et distribution](docs/BUILD_AND_RELEASE.md) |
| Couverture des 60 locales, traductions et feuille de route des langues | [Langues](docs/LANGUAGES.md) |
| Prochaines tâches | [Feuille de route unique](ROADMAP.md) |
| Changements et preuves historiques | [Historique](docs/CHANGELOG.md) |
| Revue de la modification courante | [PR.md](PR.md) |
| Consignes du projet | [NOVERA.md](NOVERA.md) · [Contribuer](CONTRIBUTING.md) |
| Identité, licences et publication officielle | [Identité](BRANDING.md) · [Versions officielles](OFFICIAL_RELEASES.md) · [Licence](LICENSE) |

## Sources actuelles

- Version préparée : **1.0.0** ; 35 corrections Windows intégrées, architecture en six domaines et nouveaux noms internes Novera.
- **60/60 catalogues**, chacun à **1 516/1 516 clés anglaises (100 %)** dans 14 espaces de noms. Dernier lot : ukrainien, xiang, malayalam, sindhi, pendjabi oriental, soundanais, igbo, dari, népalais et malais. Relecture native encore nécessaire.
- Premier démarrage : langue système sauvegardée, recommandation desktop LFM2.5-2.6B Q6_K, compagnon DSpark Q8_0 facultatif avec explication RAM/VRAM/contexte, demande distincte pour le suivi des erreurs.
- Catalogue Hub de six petits modèles et fournisseurs cloud actualisés selon les sources relevées le 25 octobre. Disponibilité et capacités réelles dépendent du modèle, du compte et du matériel.
- Dernière suite web complète enregistrée : **5 187 tests réussis, 2 ignorés** ; TypeScript sans émission, catalogues et frontières d’architecture validés. Ce résultat précède la consolidation documentaire et ne prouve pas un fonctionnement natif complet.

Dernier lot : **856 tests ciblés réussis dans 45 fichiers**, TypeScript sans émission, 60 catalogues complets en clés et contrôles d’architecture validés. Relecture native et adaptation vernaculaire intégrale des variantes éditoriales restent ouvertes. Ces tests ne reconstruisent pas le programme.

## Dernier exécutable local

Le dernier build Windows x64 date du **25 octobre 2026, 02:59**, dans `deliverables/Novera-desktop-1.0.0-2026-10-25_02-59-20-029`. Il précède les compléments de traductions, les renommages internes et les dernières options du premier démarrage.

EXE : **60 113 408 octets**, SHA-256 `3EA0AB5571BF9EFEDF2584C0EE5D4DEAD87B8E12CA4E94AB2A9EC04A2A19B426`.

Démarrage isolé et écran de confidentialité français vérifiés, deux consentements désactivés. Un seul rapport synthétique a été reçu par le projet PostHog Europe via un harnais Node ; le transport d’une erreur réelle depuis le WebView reste à vérifier. Les fichiers locaux de configuration, journaux et binaires ne sont pas publiés avec les sources.

## Limites de distribution

**Aucun binaire Novera public.** GitHub Actions et mises à jour automatiques restent désactivés. Les sources publiées peuvent être plus récentes que le programme installé. La consolidation documentaire ne compile ni ne remplace l’application.

Android : APK debug ARM64 assemblée dans les essais antérieurs ; trois audits restent ouverts. Essais sur téléphone, signature de production et parcours de construction gardé complet non validés. Android reste désactivé dans le lanceur.

Les validations à réaliser sont centralisées dans [ROADMAP.md](ROADMAP.md), sans les recopier dans chaque guide.
