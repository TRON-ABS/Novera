# Passage de 80 à 104 locales — 6 novembre 2026

Les 22 ajouts de la feuille de route et les catalogues turc et suédois sont intégrés aux sources : **104 langues et variantes sélectionnables**, **2 429 clés chacune**, 15 espaces de noms. Les **24 nouveaux README** sont générés ; les 104 README présentent le même sélecteur à 104 liens.

## Résultat vérifié

| Contrôle local | Résultat |
| --- | --- |
| Catalogues ajoutés | 360 fichiers JSON ; aucune clé manquante |
| Variables, code, identifiants et écritures | Aucune erreur détectée dans les 24 nouveaux catalogues |
| Catalogues antérieurs | 1 200 fichiers conservés à l’identique, comparaison SHA-256 |
| README ajoutés | 24 ; tableaux, emphase, liens, images, ancres, code et adresse Bitcoin contrôlés |
| README antérieurs | 80 corps conservés, sauf compteur, sélecteur et note de mise à jour anglais/français |
| Tests ciblés | 1 118 réussis, 7 fichiers de tests dans une même passe finale |
| TypeScript | `tsc -p tsconfig.app.json --noEmit` depuis `web-app` : code 0 |
| Compilation native, CI et publication | Non effectuées dans ce lot |

Preuves détaillées : [validation finale](final-validation.json), [provenance](source-decisions.json), [contrôles des README](readmes/validation.json).

## Deuxième contrôle complet demandé

Les **68 064 chaînes** des 24 nouveaux catalogues et fragments README ont été parcourues avec des contrôles supplémentaires : séparations de lignes, syntaxe complète des variables, écritures étrangères, caractères de contrôle, signes numériques, fragments anglais, répétitions et textes anormalement tronqués. Le premier passage relevait 132 occurrences ; les contrôles élargis ont ensuite identifié d’autres cas. Au moins **245 couples langue/texte distincts** ont été repris, correspondant à **329 occurrences dans les JSON** et **22 fragments README**. Ce décompte conservateur repose sur les paires avant/après enregistrées ; quelques corrections terminologiques supplémentaires ne sont pas comptées. Le dernier passage ne relève plus d’anomalie selon ces critères.

Des boutons contenaient le libellé suivant, des descriptions longues avaient été réduites à un identifiant comme `GPU`, des traductions se répétaient ou perdaient le signe `−1`, et plusieurs actions restaient en anglais. Les requêtes de correction isolent désormais chaque texte. Les termes essentiels ont été recoupés avec des références logicielles publiques et corrigés éditorialement. Le Kirundi comporte notamment une reprise du texte sur la conversion NVFP4 non validée, sans transformer cette limite en disponibilité acquise. Les README ont été régénérés et leur structure vérifiée à nouveau.

**24 tests de régression supplémentaires** contrôlent les frontières des libellés, les écritures, les variables et les signes numériques dans chacun des nouveaux catalogues. Les sept fichiers ciblés passent ensemble : **1 118 tests**, TypeScript sans erreur. Voir [le bilan du contrôle approfondi](full-review-summary.json) et [les références terminologiques](review-terminology-sources.json).

### Limite de la finition des sept variantes

La demande de finition a été poursuivie avec les modèles locaux. Un essai complémentaire NLLB-200, avec des cibles exactes pour `pbt`, `ars`, `acm` et `azb`, produit encore de l’arabe écrit standard ou des erreurs sémantiques sur les phrases d’essai ; il ne fournit pas de cible exacte `gan`, `tts` ou `ctg`. Ses 25 sorties pilotes n’ont pas été intégrées. Ce modèle de recherche sous CC-BY-NC-4.0 reste hors de l’application et du lot destiné au dépôt.

Les corrections améliorent donc les sept brouillons, mais **ne permettent pas de les déclarer entièrement vernaculaires ou validés linguistiquement**. Leurs statuts partiels et leurs avis README sont conservés. L’utilisateur ne dispose actuellement que des modèles locaux ; aucun autre accès ni aucune relecture native n’a été obtenu. Le contrôle automatique exhaustif et la relecture de cas ciblés ne sont pas une relecture native exhaustive de 68 064 textes.

## Qualité linguistique et provenance

**Ces ajouts sont des brouillons assistés, pas une validation par des locuteurs natifs.** La complétude des clés ne certifie ni la terminologie ni toutes les formulations naturelles.

Sept catalogues et leurs README sont explicitement des **adaptations écrites régionales partielles** : `gan`, `pbt`, `ars`, `acm`, `tts`, `azb`, `ctg`. Leurs métadonnées, le guide et les avis des README signalent cette limite.

- `gan`, `ars`, `acm`, `tts`, `ctg` combinent un registre technique écrit partagé et des propositions régionales Nemotron. Des chaînes périmées ou rejetées ont été retraduites dans le registre commun. Les comptes de chaînes communes et différentes figurent dans `source-decisions.json` ; une différence ne prouve pas la justesse dialectale.
- Le premier brouillon `pbt` échouait à des vérifications sémantiques et mélangeait des écritures. Il est remplacé par Google `ps`, avec des conventions d’écriture du Sud et quelques corrections terminologiques. Cela ne constitue pas une cible Google exacte `pbt`. Voir [le suivi pachto](pashto-source.json).
- `azb` part de Google `az`, puis d’une conversion lexicale et phonétique en écriture arabe. Ce n’est pas une cible Google exacte `azb` ; orthographe et variété régionale restent à relire. Voir [la provenance de conversion](azb-writing-provenance.json).
- `mag`, `hne`, `fuv` utilisent initialement les cibles exactes du modèle local MADLAD. Les reprises des README conservent les noms techniques hors du modèle. Les corrections fula emploient aussi la terminologie publique Mozilla `ff` et des traductions Google `ff` dans le registre écrit commun, sans certification de la variante nigériane.
- `bar` utilise Nemotron avec des exemples bavarois. Les autres nouveaux catalogues utilisent Google, avec des reprises locales contrôlées lorsque nécessaire.
- Le turc et le suédois réutilisent seulement les textes amont dont la source anglaise correspond encore : 1 174 chaînes turques distinctes depuis Jan #8939 et 1 178 suédoises depuis #8829, puis compléments. Les PR Jan #8939, #9000 et #8829 étaient ouvertes et non fusionnées au contrôle ; aucune fusion amont n’est revendiquée. Voir [l’audit amont](upstream-audit.json).

Microsoft a été examiné via sa [liste officielle de langues](https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation). Le formulaire public a refusé la requête anonyme et le pont de navigateur local était indisponible. **Aucune traduction Microsoft n’est utilisée.** Google et les modèles locaux ont servi à terminer les brouillons. Aucun accès Lara en volume n’a été utilisé.

Seuls les textes publics du projet ont été transmis aux services de traduction. Les caches, journaux, références brutes, pilotes et modèles ne font pas partie du lot destiné au dépôt.

## Préparation du dépôt

Le [guide des langues](../../docs/LANGUAGES.md#next-24), l’inventaire JSON, la feuille de route, le sélecteur, la détection des langues système, les alias Intl, les directions RTL et les commandes de création couvrent les 104 locales. Les anciens catalogues sont préservés. Les changements moteur déjà présents dans l’espace de travail restent distincts.

Voir [la description de contribution](PR.md) et [le manifeste des fichiers](files-to-review.json). Les sources sont prêtes à être examinées et intégrées ; une recompilation est nécessaire pour les retrouver dans les applications installées. Aucune branche distante, aucun commit ni aucune publication n’a été créé pour ce lot.
