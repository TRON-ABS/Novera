# Découverte des modèles Novera — 24 octobre 2026

Le Hub ajoute un catalogue Novera embarqué de six petits modèles : LiquidAI LFM2.5-230M, 350M, 1.2B-Instruct, 2.6B et Qwen3.5-0.8B, 2B. Les modèles du catalogue historique restent accessibles sans priorité Jan. Le catalogue Novera est disponible même si le flux distant échoue. Aucune préférence de modèle installée, aucun modèle ni profil utilisateur n'est remplacé.

## Taille et classement

Les tailles et révisions des GGUF ont été vérifiées via les métadonnées Hugging Face le 24 octobre 2026 ; aucun poids téléchargé pour ce travail. Les URL pointent une révision précise. La version Q4_K_M proposée par défaut pèse respectivement 153 406 304, 229 312 224, 730 895 168, 1 674 455 040, 532 517 120 et 1 280 835 840 octets. Q6_K et Q8_0 sont également proposés lorsqu'ils existent. Le choix initial de l'assistant au premier démarrage reste LFM2.5-2.6B Q6_K.

Le tri par défaut « Adaptés à mon PC » applique l'estimation mémoire existante (RAM, GPU, contexte de 8 192 jetons), puis la sélection Novera et le compromis 1.2B/2.6B, puis le poids. Ce n'est pas un score de qualité ni une garantie de compatibilité moteur. Les modèles aux besoins mémoire trop élevés sont classés après ceux qui paraissent tenir en mémoire. Les dimensions inconnues restent inconnues. La détection ne constitue pas une mesure instantanée de mémoire libre.

Le tri « Les plus petits » utilise le poids réel de la variante proposée, avec les tailles inconnues en dernier. Les filtres sont moins de 1 Go, 1–2 Go, 2–4 Go, 4 Go et plus, avec bornes inférieures incluses et supérieures exclues. Ils s'appliquent aussi aux recherches directes Hugging Face. La mémoire estimée représente les poids et une heuristique de cache de contexte, hors système et avec des limites selon l'architecture ; elle ne remplace pas une mesure réelle.

## Comparaison et performances

Jusqu'à trois modèles peuvent être sélectionnés ; la comparaison reste visible au-dessus de la liste et n'est pas perdue pendant le filtrage ou le défilement. Le poids, les paramètres, la mémoire estimée et les scores publiés sont présentés côte à côte.

Les scores de qualité viennent des fiches des fabricants :

- [LFM2.5-230M](https://huggingface.co/LiquidAI/LFM2.5-230M), [350M](https://huggingface.co/LiquidAI/LFM2.5-350M) et [1.2B-Instruct](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct) : MMLU-Pro et IFEval.
- [LFM2.5-2.6B](https://huggingface.co/LiquidAI/LFM2.5-2.6B) : IFBench et LiveCodeBench v6.
- [Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B) et [2B](https://huggingface.co/Qwen/Qwen3.5-2B) : MMLU-Pro et IFEval sans mode de raisonnement.
- GGUF LiquidAI : dépôts officiels ; GGUF Qwen3.5 : dépôts [Unsloth 0.8B](https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF) et [2B](https://huggingface.co/unsloth/Qwen3.5-2B-GGUF).

Ces chiffres ne sont pas des évaluations Novera des fichiers quantifiés sélectionnés. Les méthodes, versions et modes peuvent différer. Aucun classement global commun, aucune vitesse matérielle inventée et aucun score français indépendant ne sont affichés. La date visible est celle de vérification des sources, pas la date d'exécution du benchmark fabricant.

« Tester sur mon PC » nécessite une variante locale téléchargée et déjà lancée ; le test n'effectue aucun téléchargement ni changement de modèle automatique. Il utilise un prompt fixe en anglais, identique pour tous les modèles, sans historique ni outils, avec raisonnement désactivé dans les paramètres de requête et un maximum de 128 jetons. L'anglais est une condition du protocole de mesure, pas un texte d'interface. Le modèle peut toutefois ne pas respecter ce mode.

Le débit global est calculé à partir du nombre de jetons réellement déclaré par le moteur et de toute la durée d'inférence, traitement de la question inclus, chargement du modèle exclu. Il n'est pas comparable à une mesure de décodage pur. Le premier délai correspond au premier texte reçu. Si le moteur ne rapporte pas le nombre de jetons, aucun débit n'est inventé à partir des caractères. La mémoire affichée est le dernier relevé de mémoire utilisée du système entier ; ce n'est pas la consommation propre au modèle ni un pic mémoire. La variante et la date sont conservées avec le résultat dans l'état de la page uniquement.

Le test est interdit pendant une génération de discussion ou Cowork, annulé si une génération commence, si le modèle quitte la sélection ou si l'utilisateur quitte le Hub. Annulation manuelle et limite d'une minute. Aucun message n'est enregistré dans une conversation, aucun résultat n'est envoyé à une destination statistique. Les mesures restent en mémoire et ne survivent pas à une nouvelle ouverture de la page.

## Langues et validation

29 nouveaux textes sont présents dans chacun des 36 catalogues ; le contrôle de langues impose leur présence même dans les catalogues historiquement partiels. L'inventaire compte 1 510 clés anglaises, avec Wu partiel à 753 clés. Les noms de modèles, métriques et formats techniques restent leurs noms officiels. Des textes historiques d'autres parties du Hub restent en migration.

Validation locale : 72 tests ciblés ; suite web complète 5 103 réussis et 2 ignorés ; TypeScript sans émission, 36 catalogues sans erreur et contrôle des frontières sans violation. Les tests couvrent le tri numérique, les bornes des filtres, le fonctionnement sans flux distant, la déduplication, les calculs de débit, les données manquantes, les erreurs, la localisation et l'annulation. Aucun benchmark matériel réel des six modèles ou parcours graphique exhaustif n'est revendiqué. La preuve de compilation et de démarrage est conservée localement dans `.build/novera-desktop-hub-2026-10-24`.
