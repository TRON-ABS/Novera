# Novera 1.0.0 — intégration des corrections

Version préparée dans les sources : **1.0.0**, nom produit **Novera**. Une compilation locale de cette version a été autorisée puis validée ; publication des sources autorisée le 24 octobre 2026, sans distribution binaire.

## Consigne du mainteneur

Intégrer les corrections Windows par lots (premier lot de cinq, puis trois lots de dix). Ne pas compiler l’application et ne rien envoyer au dépôt pendant cette phase. Toute reprise de compilation ou de publication nécessite une nouvelle autorisation du mainteneur.

## Lot 1 — intégré aux sources locales

| PR historique | Correction |
| --- | --- |
| #9365 | fix(tables): preserve literal code whitespace in exported cells |
| #9364 | fix(markdown): preserve fenced and inline code during math normalization |
| #9341 | fix(attachments): reserve context for already prepared inline documents |
| #9340 | fix(mcp): normalize image data URLs before encoding tool results |
| #9330 | fix(settings): serialize backend operations before deduplicating writes |

Validation : **133 tests réussis dans 8 fichiers**, couvrant les cinq correctifs et les suites associées. Avertissement React `act(...)` et avertissement Vite CJS conservés dans le journal ; aucun échec. Configurations desktop, frontend, CLI et verrous Cargo alignés sur 1.0.0. Les numéros des dépendances tierces restent inchangés.

## Lot 2 — dix corrections intégrées aux sources locales

| PR historique | Correction |
| --- | --- |
| #9380 | fix(chat): filter named SSE events after sampling retries |
| #9379 | fix(chat): preserve SSE responses across mixed line endings |
| #9378 | fix(assistants): preserve state when deletion fails |
| #9377 | fix(projects): await dialog saves and retain failed drafts |
| #9376 | fix(providers): isolate runtime engine discovery failures |
| #9375 | fix(projects): preserve saved projects when storage operations fail |
| #9373 | fix(chat): keep live stream statistics with their originating thread |
| #9372 | fix(chat): report history read failures and allow retry |
| #9371 | fix(settings): protect saved preferences after hydration read failures |
| #9369 | fix(chat): retain attachment drafts while a turn is running |

Validation finale : **4 800 tests de l’interface réussis, 2 ignorés, 383 fichiers de tests réussis et 1 ignoré**. Les 28 fichiers ciblés avaient également réussi (446 tests), avant l’ajout d’une régression combinant sauvegardes ordonnées et protection des lectures. Le contrôle des 36 catalogues de langues ne signale aucune erreur. Les 18 catalogues de contributions complets couvrent désormais 1 465 clés ; Wu reste partiel à 706 clés. Relecture native des deux nouveaux messages encore nécessaire.

Adaptations : isolation des fournisseurs autour du mapping actuel afin de conserver les modes moteur ; combinaison de #9371 avec la file de sauvegarde #9330 ; scénarios de lectures ajustés à leur sérialisation ; conservation du mock stable des sessions et adaptation de la route actuelle. Le test historique `custom-chat-transport-turn-model.test.ts` absent de cette base n’a pas été recréé à partir d’une autre branche : les tests présents du transport et les nouvelles régressions d’appartenance des statistiques valident cette intégration.

Aucune compilation de l’application, aucun commit et aucun envoi distant. **15 PR Windows intégrées au total aux sources ; 20 restent.**

## Lot 3 — dix corrections intégrées aux sources locales

| PR historique | Correction |
| --- | --- |
| #9368 | fix(threads): preserve selected model when removing an assistant |
| #9367 | fix(threads): preserve new chat drafts when creation fails |
| #9366 | fix(threads): preserve conversations when deletion fails |
| #9345 | fix(memory): serialize concurrent Remember saves per data folder |
| #9343 | fix(code): render escaped plain text when syntax highlighting fails |
| #9342 | fix(preview): keep Storage properties and methods in sync |
| #9339 | fix(chat): preserve manual titles when background generation finishes late |
| #9338 | fix(tools): isolate pending approvals by owning thread and call |
| #9337 | fix(attachments): queue concurrent ingestion choices without stranding callers |
| #9336 | fix(models): scope deletion records and cache updates by provider |

Validation : **4 853 tests de l’interface réussis, 2 ignorés ; 390 fichiers de tests réussis et 1 ignoré**. Les tests couvrent aussi les deux lots précédents. Les 36 catalogues restent valides, sans nouvelle clé de traduction. La syntaxe des deux fichiers Rust modifiés est acceptée par rustfmt ; **les tests Rust n’ont pas été exécutés**, car ils nécessitent une compilation. Aucune validation native ou en fonctionnement de cette nouvelle suppression n’est revendiquée.

Adaptations : conservation du nom Novera dans les services de conversations, intégration de la suppression asynchrone dans le store actuel (arrêt de la génération avant suppression et maintien des données en cas d’échec), maintien du mock de sessions stable et des tests de lecture d’historique du lot 2 ; adaptation des tests à l’attente des suppressions. Les modifications locales du cache moteur et de l’espace de travail restent préservées.

**25 PR Windows intégrées au total aux sources ; 10 restent.** Aucun build, commit, push ni nouvelle PR distante.

## Lot 4 — dix dernières corrections Windows intégrées aux sources locales

| PR historique | Correction |
| --- | --- |
| #9335 | fix(models): keep individual deletions retryable on filesystem failure |
| #9334 | fix(code): ignore obsolete asynchronous highlighting results |
| #9333 | fix(chat): protect drafts from arrow-key history navigation |
| #9332 | fix(favorites): isolate models by provider and migrate unique legacy owners |
| #9331 | fix(chat): generate titles with the owning thread model |
| #9329 | fix(models): keep failed bulk deletions visible and retryable |
| #9328 | fix(chat): let disabled shell calls receive a refusal and continue |
| #9327 | fix(chat): activate remote auto compact without a manual context limit |
| #9326 | fix(chat): preserve branch metadata and order message persistence |
| #9325 | fix(agent): deduplicate MCP tool definitions consistently with routing |

Validation : **4 906 tests de l’interface réussis, 2 ignorés ; 394 fichiers de tests réussis et 1 ignoré**. Ce contrôle couvre les quatre lots. Les catalogues de langues restent valides. La syntaxe Rust du dédoublonnage MCP est acceptée par rustfmt ; les tests Rust ajoutés restent non exécutés, conformément à la suspension de compilation.

Adaptations : combinaison des suppressions après confirmation du système de fichiers avec les caches et favoris propres à chaque fournisseur ; conservation du contrôle empêchant un titre automatique d’écraser un renommage ; intégration des tests de concurrence du surlignage sans retirer le repli en texte échappé. La portée des statistiques du lot 2 reste inchangée pour les générations de titre en arrière-plan.

**35/35 PR Windows de l’inventaire sont intégrées aux sources locales de Novera 1.0.0.** Cela ne signifie pas qu’elles sont compilées ni validées dans un nouveau binaire. Aucun build, commit, push ni nouvelle PR distante.

## Reste à intégrer

**Aucune des 35 PR Windows inventoriées ne reste à intégrer aux sources.** Restent séparément la correction Linux #9346 et la distribution portable/CI #9302. Les validations graphiques exhaustives et les générations avec le modèle restent à effectuer. La compilation locale a ensuite été autorisée par le mainteneur et réalisée (voir ci-dessous). La publication des sources a ensuite été autorisée le 24 octobre 2026 ; aucune distribution binaire ni activation de GitHub Actions.

## Exécutable local actuel

**Novera Desktop 1.0.0**, Windows x64, dans `deliverables/Novera-Desktop-local-1.0.0/Novera-Desktop.exe`. Les **35 PR Windows sont incluses dans ce build local**.

SHA-256 : `20D6D569802B435E9DF66F618FB94C14F1F28262DA4CF47593BD42E47BD8B35C`. Release optimisée avec LTO fat ; compilation interface/TypeScript/extensions réussie et démarrage isolé de 10 secondes validé. 33 tests natifs de conversations et 63 tests natifs MCP/requêtes passent. Le lanceur de tests utilise une copie du binaire de tests avec manifeste Common-Controls v6 ; cette adaptation ne modifie pas l’exécutable produit. 24 tests de réglages relancés après un ajustement de déclaration TypeScript passent. Aucune génération avec le modèle ni validation de toute l’interface n’est revendiquée.

La version 0.8.7 précédente est conservée intacte. Version locale non signée, sans installateur. Les sources de ces lots font partie de la publication du 24 octobre 2026 ; les binaires restent locaux. Rapports : `deliverables/Novera-Desktop-local-1.0.0/BUILD_INFO.md` (les journaux locaux ne sont pas publiés).
