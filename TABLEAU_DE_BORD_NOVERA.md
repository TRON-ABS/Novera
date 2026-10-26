# Novera — tableau de bord

État des sources au **26 octobre 2026**. Ce fichier est le point d’entrée ; les procédures, tâches et preuves détaillées sont dans les documents ci-dessous.

## Où trouver l’information ?

| Besoin | Document de référence |
| --- | --- |
| Présentation | [Français](README.fr.md) · [English](README.md) |
| Utiliser Novera : premier démarrage, modèles, discussions, confidentialité | [Guide utilisateur](docs/USER_GUIDE.md) |
| Architecture, moteur, compatibilité, dépendances et logos | [Développement](docs/DEVELOPMENT.md) |
| Suivi local des moteurs, Safetensors CPU/GPU et versions PyTorch | [Suivi des moteurs](docs/SUIVI_MOTEURS.md) |
| Compiler, préparer Windows/Android, signer et distribuer | [Construction et distribution](docs/BUILD_AND_RELEASE.md) |
| Couverture des 70 locales, traductions et feuille de route des langues | [Langues](docs/LANGUAGES.md) |
| Prochaines tâches | [Feuille de route unique](ROADMAP.md) |
| Changements et preuves historiques | [Historique](docs/CHANGELOG.md) |
| Revue de la modification courante | [PR.md](PR.md) |
| Consignes du projet | [NOVERA.md](NOVERA.md) · [Contribuer](CONTRIBUTING.md) |
| Identité, licences et publication officielle | [Identité](BRANDING.md) · [Versions officielles](OFFICIAL_RELEASES.md) · [Licence](LICENSE) |

## Sources actuelles

- Version préparée : **1.0.0** ; 35 corrections Windows intégrées, architecture en six domaines et nouveaux noms internes Novera.
- **70/70 catalogues**, chacun à **1 587/1 587 clés anglaises (100 %)** dans 14 espaces de noms. Dernier lot : ouzbek du Nord, zoulou, arabe saïdi, pachto du Nord, oromo du Centre-Ouest, saraiki, néerlandais, somali, roumain et assamais. Relecture native encore nécessaire.
- Premier démarrage : langue système sauvegardée, recommandation desktop LFM2.5-2.6B Q6_K, compagnon DSpark Q8_0 facultatif avec explication RAM/VRAM/contexte, demande distincte pour le suivi des erreurs.
- **Hugging Face : environ 3,19 millions de dépôts de modèles** (3 187 159 au 26 octobre 2026), dont 214 900 GGUF et 27 295 MLX ; découverte directe des formats compatibles par lots, avec six présélections Novera conservées ; **27 fournisseurs cloud** et **69 modèles présélectionnés**, avec neuf fournisseurs et leurs icônes ajoutés le 26 octobre (listes initiales relevées le 25). Disponibilité et capacités réelles dépendent du modèle, du compte et du matériel.
- Dernière suite web complète enregistrée : **5 187 tests réussis, 2 ignorés** ; TypeScript sans émission, catalogues et frontières d’architecture validés. Ce résultat précède la consolidation documentaire et ne prouve pas un fonctionnement natif complet.

Lot Hub antérieur : **257 tests web réussis dans 11 fichiers**, TypeScript sans émission, sept tests d’architecture réussis et 70 locales complètes. Essai API publique : 44 dépôts avec tailles, pagination disponible, aucun poids téléchargé. Aucun exécutable reconstruit.

Dernier lot cloud : **310 tests ciblés réussis dans quatorze fichiers**, TypeScript sans émission, 70 catalogues complets et 980 JSON inchangés ; 27 fournisseurs et six modèles locaux avec icônes officielles vérifiées ; les 70 noms de langues restent natifs. Aucun exécutable reconstruit pour ce lot.

Dernier lot langues : **963 tests ciblés réussis dans 45 fichiers**, TypeScript sans émission, 70 catalogues complets en clés et contrôles d’architecture validés. Relecture native et adaptation vernaculaire intégrale des variantes éditoriales restent ouvertes. Ces tests ne reconstruisent pas le programme.

## Hub et Safetensors — suivi local du 26 octobre

Le Hub prépare 23 entrées de navigation, des conseils matériels expliqués et une revue avant téléchargement. Safetensors textuel : Python 3.15.1, PyTorch 2.14.1 CPU/CUDA, tests réels CPU/GPU réussis sur le modèle minuscule. Image, vidéo et autres modalités restent dépendantes de moteurs à intégrer. [Versions, résultats et limites](docs/SUIVI_MOTEURS.md).

Dernier correctif : chargement progressif au défilement sans bouton « Suivant », résultats de la catégorie active ajoutés en bas dans un ordre stable, badge raccordé au diagnostic traduit ; 16 tests ciblés réussis dans 5 fichiers et TypeScript validé. Les 70 catalogues existants sont réutilisés. Le mainteneur prend en charge sa compilation. Mise à jour des sources du dépôt autorisée ensuite par le mainteneur ; aucun binaire publié.

## Compilations locales enregistrées

Le journal `.build/launcher-desktop-2026-10-26_02-58-48-043/result.json` enregistre une compilation desktop réussie, sans publication, avant le dernier correctif de pagination/badge. Le dossier de sortie consigné n’est plus présent à son emplacement lors de ce contrôle ; sa disponibilité actuelle n’est donc pas attestée ici. Aucun nouveau build lancé pour les correctifs ou cette mise à jour documentaire.

### Compilation antérieure du 25–26 octobre

Compilation Windows x64 terminée le **26 octobre 2026 à 00:04 (Paris)**, démarrée le 25 à 23:59, dans `deliverables/Novera-desktop-1.0.0-2026-10-25_23-59-09-633`. Elle intègre les **70 catalogues**, les noms internes Novera et les options DSpark/consentements. Elle précède les neuf ajouts cloud et la découverte directe Hugging Face du 26 octobre ; ceux-ci nécessitent une nouvelle compilation.

EXE : **65 208 832 octets**, SHA-256 `1D3E1F545BF11CDC50F6E5F031ABFCA2DBD1E6293818F3D12A049263CDAC187A`.

Le BAT fourni a terminé les étapes moteur, interface et desktop. Le dossier contient 26 exécutables/DLL contrôlés x64 ; worker `novera-llama-worker.exe` version 0.7.0, llama.cpp b11823, CUDA x64 et CPU chargés. Le worker du dossier final détecte la RTX 5070 Laptop. L’ancien worker n’est pas livré. Réutilisation du moteur vérifiée sans environnement de compilation spécial, après contrôle des empreintes. Preuves locales : `.build/engine-launcher-fix-2026-10-25/runtime-audit.json` et `.build/launcher-desktop-2026-10-25_23-59-09-633/result.json`.

La compilation ne remplace pas l’application installée et ne modifie aucun profil. Aucun nouveau démarrage de l’interface, génération de modèle ou essai de mise à niveau n’a été réalisé pour cette correction. Suivi des erreurs, statistiques et mises à jour restent désactivés dans ce build sans télémétrie configurée. Les premiers démarrages et le transport réel d’erreurs depuis le WebView restent à valider.

## Limites de distribution

**Aucun binaire Novera public.** GitHub Actions et mises à jour automatiques restent désactivés. Les sources publiées peuvent être plus récentes que le programme installé. La consolidation documentaire ne compile ni ne remplace l’application.

Android : APK debug ARM64 assemblée dans les essais antérieurs ; trois audits restent ouverts. Essais sur téléphone, signature de production et parcours de construction gardé complet non validés. Android reste désactivé dans le lanceur.

Les validations à réaliser sont centralisées dans [ROADMAP.md](ROADMAP.md), sans les recopier dans chaque guide.

Contrôle final avant publication des sources : **309 tests réussis dans 17 fichiers**, TypeScript sans émission réussi ; contrôles des 70 locales et des frontières d’architecture sans erreur. Aucun nouveau build ni binaire publié pour cette synchronisation.
