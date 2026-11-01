# Novera — suivi des essais avant les compilations par système

## Paquets Windows propres et vitrine publiée — 1er novembre 2026

Le mainteneur autorise désormais la préparation **desktop, portable et installateur Windows** depuis son desktop testé, sans discussions ni données personnelles incluses. Les sources et la nouvelle capture sont publiées sur **main** ; les vitrines anglais/français portent le message souhaitant une belle aventure et la signature TRON-ABS. Les notes plus anciennes ci-dessous décrivent leur état au moment de rédaction.

Voir le [résultat de préparation, les empreintes et les limites avant release publique](DISTRIBUTION_WINDOWS_2026-11-01.md). Les paquets restent des candidats locaux non signés ; aucun binaire de release publique ni tag n’est publié, et Actions reste désactivé. Les données présentes sur le PC sont conservées.

## Retour du mainteneur et publication sur main — 1er novembre 2026

Le mainteneur confirme **« tout marche bien »** et fournit une nouvelle capture réelle du desktop montrant une image créée et les commandes du tableau de bord. Il demande explicitement la publication des sources sur **main**, la mise à jour de la vitrine et la signature **TRON-ABS — The art of Human with AI** en bas des README anglais/français.

Ce retour est une validation manuelle déclarée du desktop utilisé, sans relevé détaillé par moteur, profil ou scénario. Il ne remplace pas les essais propres aux profils CUDA/ExLlama/GenAI, aux installations sur PC neuf, au mobile ou à chaque autre système. Aucun nouveau binaire, portable, tag ou release n’est publié par cette mise à jour ; Actions n’est pas activé. L’embarquement Python/PyTorch dans l’EXE reste reporté.

La capture originale est conservée sans retouche sous `.github/assets/novera-dashboard-2026-11-01.png`. Les attributions et licences existantes restent présentes. Les éléments publiés, vérifications et identifiant du commit sont consignés dans les résultats de publication de ce lot.

## Nouveau lot : composants privés — 1er novembre 2026

Les sources incluent le gestionnaire Windows x64 et ses dix profils, la résolution native centrale et l'interface dans les **80 langues / 2 429 clés**. Le mobile n'installe aucune pile Python/PyTorch desktop ; cloud conservé. L'embarquement des bibliothèques dans l'EXE est reporté par le mainteneur.

Résultats locaux : **1 161 tests Rust réussis, 5 optionnels ignorés** ; **3 intégrations privées réelles réussies** (vidéo, ONNX CPU, génération Transformers CPU synthétique), dont cycle de maintenance, annulation, échec sans remplacement de l'actif, conservation des fichiers utilisateur et journal plafonné. Contrôle de distribution des 11 variantes et 9 tests réussi, architecture 6 domaines sans violation et 7 tests réussis, TypeScript réussi. Python ciblé : **17 tests réussis**. La suite média complète du Python global a trois dépendances absentes ; ce n'est pas une validation de la pile média gérée. Interface contrôlée à 360 px en allemand et arabe RTL, et en français ; confirmations/focus accessibles.

Web Windows final : **174 tests réussis / 1 scénario non-Windows ignoré**, 12 fichiers ; variante sans drapeau Windows : 172 réussis / 3 ignorés. TypeScript réussi ; lint ciblé sans erreur, deux avertissements de hooks existants dans CreationControls. Les dix SHA-256 des verrous correspondent. Dernier cycle vidéo privé réussi malgré des chemins Python/FFmpeg externes hérités volontairement invalides. La description publique GitHub, le site associé et les sujets ont été contrôlés en lecture seule : 80 langues, 42 fournisseurs et 49 préréglages restent cohérents ; aucun réglage distant ni README public remplacé par ce lot local. Aucune compilation desktop, installation du nouveau binaire, nouvelle archive portable, signature ou publication. Les profils CUDA/ExLlama/GenAI/médias complets, le Windows neuf et les autres plateformes restent à valider séparément. Les anciens essais desktop/portable ne valident pas ce gestionnaire. [Détail et matrice](REPRISE_COMPOSANTS_GERES_80_LANGUES.md).

Ouvert le **1er novembre 2026**. Le mainteneur a confirmé la compilation de la **version desktop Windows**, puis les essais **desktop et portable réussis : « tout marche »**. Le reçu local et le journal confirment la compilation en release. Le portable a été préparé à partir de ce runtime complet, sans recompiler l'application. Ce retour est une validation manuelle déclarée par le mainteneur, sans relevé détaillé de chaque scénario. Les nouveaux profils légers décrits ci-dessous sont postérieurs à ces binaires ; ils nécessitent une recompilation et de nouveaux essais. Les autres variantes restent une étape ultérieure.

## Dernier retour desktop et correctif des boutons média — 1er novembre 2026

Autre anomalie signalée : musique refusée avec le conseil de réduire le modèle/contexte. Le profil local rapporte 15 789 Mio sur la machine nominale de 16 Gio ; le filtre imposait 16 384 Mio avant même d'appeler le moteur. Les seuils de RAM totale admettent maintenant 5 % de réserve matérielle, sans modifier la mémoire disponible réellement mesurée ni les contrôles natifs. **106 tests réussis / 6 fichiers** avec régression sur les chiffres réels. Refaire une génération musique après recompilation ; aucune nouvelle génération réelle n'est déclarée réussie par cette correction de sources.

Le mainteneur indique avoir recompilé et testé le desktop après la correction Clang ; le chemin du nouveau runtime reste à relever. Il constate que Musique et Vidéo ne sont pas visibles avant une demande écrite en mode Auto. Le filtre matériel masquait leurs boutons lorsqu'aucun moteur local n'était admis et aucun cloud déjà choisi.

Correctif dans les sources : les modes Image/Musique/Vidéo restent visibles, même avant configuration cloud. Cliquer Musique ou Vidéo sans prompt permet d'accéder aux réglages. Les gardes d'exécution locale restent actives. **103 tests réussis / 6 fichiers et TypeScript réussi** ; aucun libellé ajouté dans les 80 langues.

- [ ] Recompiler le desktop avec ce correctif, relever le runtime et son build ID.
- [ ] Au démarrage, vérifier les cinq modes Auto/Texte/Image/Musique/Vidéo sans saisir de prompt.
- [ ] Cliquer Musique puis Vidéo et vérifier l'accès aux réglages et aux sélecteurs cloud avant configuration.
- [ ] Confirmer les essais desktop avant préparation du portable depuis ce runtime exact.

## Historique de l'échec Clang — 1er novembre 2026

La tentative `.build/launcher-desktop-2026-11-01_02-07-58-188` s'est arrêtée à `engine-toolchain` : Clang installé dans MSYS2 mais absent du PATH du lanceur. Journal : `.build/launcher-desktop-2026-11-01_02-07-58-188/engine-toolchain.log`. La détection de Clang est corrigée dans les sources du lanceur ; **24 assertions réussies**, et contrôle Bash réel des prérequis réussi après initialisation MSVC. Cela ne constitue pas une compilation réussie du nouveau desktop.

- [x] Corriger et vérifier la découverte de Clang sans remplacer la priorité du linker MSVC.
- [ ] Le mainteneur relance le BAT desktop et confirme le résultat de compilation.
- [ ] Vérifier « Novera 1.0.0 » en haut du panneau latéral ; le numéro suit la version déclarée aux prochaines compilations.
- [ ] Le mainteneur valide les parcours desktop avant préparation d'un nouveau portable à partir du même runtime.

## Diagnostics à vérifier sur le prochain binaire

Les essais réussis ci-dessus précèdent également le nouveau suivi des erreurs. Voir [la procédure de maintenance](MAINTENANCE.md) pour les 616 tests web réussis, les contrôles Rust et les symboles privés. La réception d'un événement synthétique est confirmée dans PostHog ; elle ne valide pas encore le prochain exécutable.

- [ ] Compiler avec la préparation des diagnostics activée et relever le `build_id` dans `BUILD_INFO.md`.
- [ ] Envoyer les symboles privés avec la CLI authentifiée, vérifier le reçu et leur présence dans PostHog.
- [x] Activer l'alerte horaire de production par e-mail au compte PostHog TRON ABS ; état activé et test de livraison lancé vérifiés.
- [x] Réception de l'e-mail de test confirmée par le mainteneur le 1er novembre 2026.
- [ ] Vérifier le consentement v2 : aucun envoi avant accord, erreur de test reçue après accord, arrêt des envois au retrait.
- [ ] Vérifier qu'une pile du binaire est résolue avec ses symboles exacts, sans donnée utilisateur dans l'événement.
- [ ] Refaire les parcours affectés sur desktop puis portable avant les autres distributions.

## Identifier le desktop testé

| Information | Valeur à renseigner |
| --- | --- |
| Version et chemin du dossier compilé | 1.0.0 — `deliverables/Novera-desktop-1.0.0-2026-11-01_00-20-48-287` |
| Date de compilation | Terminée le 1er novembre 2026 à 00:29 CET, selon le reçu local |
| Révision et modifications locales incluses | À confirmer ; HEAD observé à l'ouverture du suivi : `45f2550c0`, avec des modifications locales |
| Résultat de compilation et chemin du journal | Release réussie ; `.build/launcher-desktop-2026-11-01_00-20-48-287/desktop.log` et `result.json` ; Cargo : 7 min 18 s, un avertissement de liaison |
| Windows, processeur, GPU et mémoire | À renseigner |
| Profil existant ou profil neuf | À renseigner |
| Modèles et moteurs essayés | À renseigner |

Ne cocher un essai qu'après l'avoir exécuté sur le binaire identifié ci-dessus. Noter « non testé » ou « non applicable » pour une fonction sans modèle ou matériel disponible. Ne pas effacer le profil habituel pour simuler un premier démarrage.

## Essais manuels du desktop Windows

| État | Essai | Résultat attendu / point à observer |
| --- | --- | --- |
| À tester | Démarrer, fermer et rouvrir Novera | Interface utilisable, absence d'erreur au lancement ; arrêt des moteurs après fermeture. |
| À tester | Retrouver le profil existant | Conversations, réglages, modèles et chemins conservés. |
| À tester | Choisir un modèle et envoyer deux messages | Réponses terminées, streaming et contexte de conversation conservés. |
| À tester | Arrêter une réponse puis renvoyer un message | Annulation effective, commandes libérées, nouvelle réponse possible. |
| À tester | Changer de modèle en mémoire automatique | Attente compréhensible, chargement correct et absence de blocage. |
| À tester | Générer deux images successivement avec le scénario Nemotron | La seconde génération attend la fin de la requête texte native au lieu d'échouer sur le refus temporaire de déchargement. |
| À tester | Annuler pendant l'attente mémoire puis réessayer | Annulation possible et reprise sans attente permanente. |
| À tester | Générer musique et vidéo, si modèles disponibles | Résultat lisible ; deux demandes successives et annulation fonctionnelles. |
| À tester | Retrouver les créations après redémarrage | Fichiers, lecteurs et informations réellement enregistrées restaurés. |
| À tester | Ouvrir le fichier d'une création et utiliser le partage Windows | Fichier correct ; interface encore cliquable après fermeture du volet de partage. |
| À tester | Importer un modèle depuis un chemin avec espaces ou accents | Import et chargement corrects, sans déplacer les modèles existants. |
| À tester | Rencontrer une erreur réelle : modèle absent ou composant manquant | Cause et action utiles affichées ; possibilité de reprendre après correction. |
| À tester | Réduire la fenêtre et changer le zoom | Saisie, Envoyer/Arrêter, sélecteur et réglages accessibles sans chevauchement. |
| À tester | Vérifier les moteurs supplémentaires utilisés : ONNX, Safetensors, LoRA, FP8/NVFP4 | Noter chaque combinaison effectivement essayée ; ne pas déduire la validation d'un moteur de celle d'un autre. |

Les appels cloud ne font pas partie des essais indispensables ; un essai éventuel utilise un fournisseur choisi par le mainteneur et doit être consigné séparément.

## Anomalies et reprises

| ID | Binaire / environnement | Étapes pour reproduire | Attendu | Observé | Gravité | Correction / nouvel essai |
| --- | --- | --- | --- | --- | --- | --- |
| BUILD-CLANG-01 | Tentative desktop du 01/11/2026 à 02:07 | Lancer le BAT par double-clic avec Clang MSYS2 hors PATH | Prérequis moteur détectés | Arrêt « needs clang on PATH » | Bloque la compilation | Détection corrigée ; 24 assertions et prérequis réels réussis ; recompilation par le mainteneur en attente |
| MUSIC-RAM-01 | Desktop nominal 16 Gio / 15 789 Mio utilisables | Lancer une musique locale | Atteindre le moteur et ses contrôles réels | Refus immédiat par le seuil 16 384 Mio | Bloque la musique | Tolérance de 5 % sur les paliers totaux ; test profil et routage réussi ; génération réelle après recompilation à vérifier |

Ne pas copier de clés API ni de contenu privé dans ce fichier. Référencer les journaux locaux utiles et résumer l'erreur.

## Étape suivante : portable Windows

Préparation demandée après confirmation de la compilation desktop. Le ZIP provient du runtime identifié ci-dessus. Si les sources changent après ces essais, identifier le nouveau binaire et refaire les parcours affectés avant de le conditionner.

Tests du packager exécutés le 1er novembre 2026 : **223 assertions, 12 scénarios réussis**, avec des fixtures PE synthétiques jamais lancées. Rapport local : `.build/portable-validation-2026-11-01.json`. Ces tests valident le paquetage, pas les générations ni le lancement de l'application.

**Portable créé et intégrité vérifiée** : [Novera_1.0.0_x64-portable.zip](../deliverables/Novera-portable-1.0.0-2026-11-01/Novera_1.0.0_x64-portable.zip), **1 243 378 323 octets**, 95 entrées. SHA-256 : `d464b3e621abbbb0e4c14f6c60725b79667f13ec2452d2a7b2fae1dec6f20659`. L'empreinte du ZIP, les empreintes et tailles du manifeste et les empreintes de `SHA256SUMS` ont été vérifiées par relecture de l'archive. L'exécutable archivé correspond exactement au desktop source. Rapport : `deliverables/Novera-portable-1.0.0-2026-11-01/verification.json`. Application non lancée par l’agent ; essais ensuite confirmés réussis par le mainteneur. Paquet local non signé, sans publication.

- [x] Identifier le runtime utilisé, le ZIP et son empreinte SHA-256.
- [ ] Vérifier l'inventaire : ressources, moteurs, DLL, Bun, uv et licences ; aucun modèle ni profil personnel embarqué.
- [ ] Extraire tout le ZIP dans un nouveau dossier avec espaces ou accents et lancer l'exécutable extrait.
- [ ] Vérifier lancement, génération, annulation et redémarrage depuis ce dossier.
- [ ] Essayer sur un Windows sans outils de développement ; relever WebView2, runtime Visual C++ et pilotes nécessaires.
- [ ] Confirmer le comportement du profil : ce portable est sans installation, les données restent dans le profil Novera habituel.

## Conditions avant les compilations des autres variantes

| Contrôle | État au 1er novembre 2026 |
| --- | --- |
| `node scripts/distribution/check-release-readiness.mjs` | Réussi : définitions des 11 variantes valides ; compilations et prérequis natifs non certifiés. |
| `node --test scripts/distribution/__tests__/check-release-readiness.test.mjs` | 9 tests réussis, 0 échec. |
| Suites complètes web, core, extensions, Rust et moteurs Python sur les sources retenues | À exécuter ou à rattacher à un rapport correspondant exactement aux sources compilées. |
| Tests des scripts de préparation moteur, lanceur, portable et mises à jour | Portable : 223 assertions / 12 scénarios réussis ; autres scripts à relever pour la préparation finale. |
| Essais manuels desktop et traitement des anomalies bloquantes | Le mainteneur confirme « tout marche » ; aucun blocage signalé sur le binaire précédent. |
| Essais du portable extrait | Réussis selon le mainteneur ; nouveaux profils légers non inclus dans ce ZIP. |
| Revue des workflows Novera et des ressources propres à chaque système | À terminer avant lancement distant. |
| Android : audits dépendances, permissions et stockage | Non validés dans `scripts/android/readiness.json` lors de l'ouverture du suivi. |
| iOS : équipe Apple et signature ; autres architectures : ressources natives | À vérifier sur les environnements correspondants. |

La réussite Windows ne valide pas Linux, macOS, ARM64 ou les appareils mobiles. Prévoir un lancement, une génération compatible, une sauvegarde et un arrêt propre sur chaque cible produite. Consigner séparément compilation, signature, essai et publication.

## Décision du mainteneur

### Sources actualisées : configuration automatique mobile et petites machines

Demande du 1er novembre 2026, après les essais du portable : intégrer dans **Novera · Configurations** un profil adapté au mobile et aux petites configurations, dans les 80 langues, en conservant image, musique et vidéo **cloud**. Implémentation locale dans les sources ; aucune compilation supplémentaire ou publication de binaire pour cette évolution.

- Déterminer le profil à partir du système, de l'architecture, de la mémoire disponible et des moteurs effectivement compatibles ; la taille de l'écran seule ne décide pas des capacités de génération.
- Prévoir une configuration texte légère avec contexte et charge de calcul bornés. Le modèle et les seuils mémoire restent à choisir après essais sur appareil ; ne pas reprendre automatiquement le modèle desktop.
- Masquer les actions de génération locale image, vidéo et, pour les configurations les plus limitées, musique lorsqu'elles ne sont pas prises en charge. Appliquer la même décision au routage Auto et à l'exécution, pas seulement aux boutons.
- Garder dans Configurations une explication des fonctions indisponibles et des prérequis. Distinguer génération locale, accès cloud configuré et lecture des médias existants ; masquer une génération locale ne doit pas rendre l'historique illisible.
- Respecter les choix manuels compatibles ; ne pas télécharger de modèle ou basculer vers un fournisseur payant sans action explicite. En l'absence de détection fiable, afficher un état à vérifier plutôt que déclarer le matériel compatible.
- Vérifier sur appareils : démarrage, mémoire réellement disponible, chargement et réponse texte, annulation, échauffement, reprise après mise en arrière-plan et conservation du profil. Couvrir aussi un petit écran sur une machine puissante et un grand écran sur une petite machine.

#### Budgets initiaux implémentés

Ces seuils sont des choix conservateurs du produit, non une certification de performance. Les entrées matérielles sont en Mio ; les budgets ci-dessous sont exprimés en Gio.

| Décision | Conditions |
| --- | --- |
| Profil léger | Mobile, RAM totale inconnue ou < 16 Gio, ou GPU actif < 4 Gio sans mémoire unifiée Apple Silicon. |
| Omni Q4 avec projecteur Q4 | Profil léger, RAM totale ≥ 8 Gio, RAM disponible mesurée ≥ 4 Gio, numéro de build moteur valide ≥ 11960. |
| Texte Q4 de repli | LFM3-1.7B ; avertissement sous 4 Gio de RAM totale ou 2,5 Gio disponibles, ou indication de matériel inconnu. |
| Contexte du choix léger | 2 048 tokens, appliqués après action explicite « utiliser » ; synchronisés dans le modèle et ses réglages en mémoire, sans modifier les autres modèles. |
| Image locale | Hors mobile, RAM ≥ 12 Gio et GPU actif ≥ 4 Gio, ou mémoire unifiée. |
| Musique locale conseillée | Hors mobile, Windows et RAM ≥ 16 Gio. |
| Vidéo locale | Hors mobile, RAM ≥ 16 Gio et GPU actif ≥ 6 Gio, ou mémoire unifiée avec RAM ≥ 24 Gio. |
| Pack complet | Windows, profil non léger, trois tâches locales admises et RAM disponible ≥ 10 Gio. |

En l'absence de détection sur desktop, les parcours locaux manuels existants sont conservés, mais le pack automatique n'est pas proposé et le matériel reste signalé inconnu. Sur mobile, les générateurs locaux image/musique/vidéo sont masqués ou bloqués dans leurs réglages. Les boutons de mode et sélecteurs cloud restent accessibles même sans modèle cloud déjà sélectionné, afin de permettre la configuration directe. La garde d'exécution bloque également les demandes locales issues d'Auto ou d'un ancien mode enregistré. Aucun appel cloud de repli automatique.

Téléchargements épinglés : `LiquidAI/LFM3-1.7B-GGUF` à `bad5729bba61d076fff20d2548e62526665af215` ; `LiquidAI/LFM3-Omni-2B-GGUF` à `3d29af2ad166f8299c2d820937e47dc0add20ffc`. Métadonnées publiques vérifiées : texte Q4 **1 099 627 808 octets**, Omni Q4 **1 099 630 080 octets**, projecteur Q4 **291 586 720 octets**. Les poids n'ont pas été téléchargés pour ce travail. L'absence de version vérifiable du moteur conserve le modèle texte ; une mémoire suffisante seule ne sélectionne pas Omni. Le numéro du moteur est interrogé une fois par session et partagé entre les panneaux.

#### Validation de sources

- **469 tests réussis dans 21 fichiers, 1 scénario non-Windows ignoré** lors du passage configuré Windows : profils, seuils, Omni/repli, contexte, Configurations, installation, diagnostic Hub, démarrage, génération et mémoire.
- Téléchargement des recommandations épinglées : résolution des tailles et SHA-256 à la révision exacte ; arrêt avant transfert si métadonnées absentes, réseau indisponible ou projecteur provenant d’une autre révision. Projecteur choisi conservé dans le diagnostic.
- Tests de service sur un matériel Android simulé de 4 Gio : blocage local image/vidéo et conservation des générations cloud image/vidéo/musique ; aucun appel fournisseur réel.
- Test de présence des messages réutilisés dans **80 catalogues** ; contrôle complet : **2 412 clés par langue, aucune erreur structurelle**. Aucune nouvelle clé, aucun remplissage par copie anglaise.
- TypeScript et contrôle d'architecture réussis. Lint ciblé : zéro erreur, quatre avertissements existants : deux dépendances de hooks dans `CreationControls.tsx` et deux Fast Refresh dans `HubHardwareDiagnostic.tsx`.

État : **implémenté et testé sur contrats simulés ; seuils matériels, chargement Omni et projecteur, voix, batterie/échauffement et reprise mobile encore à vérifier sur appareil**. Les anciens tests manuels desktop/portable ne valident pas ces changements.

- Résultat des essais desktop : **réussis selon le mainteneur, avant les nouveaux profils**.
- Résultat des essais portable : **réussis selon le mainteneur, avant les nouveaux profils**.
- Anomalies bloquantes restantes : **aucune signalée sur ces deux binaires ; nouveaux profils à essayer après recompilation**.
- Lancement des autres compilations : **pas encore demandé dans cette étape**.

Références : [préparation des distributions](PREPARATION_DISTRIBUTIONS.md), [construction et portable](BUILD_AND_RELEASE.md), [checklist fonctionnelle](../tests/checklist.md).
