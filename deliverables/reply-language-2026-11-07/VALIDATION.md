# Réponse anglaise après un message français — 7 novembre 2026

La capture du mainteneur montre un message français comprenant B0, BS et « 5 sigma », suivi d'une réponse anglaise. L'instruction générale ajoutée au lot vocal précédent ne suffit donc pas dans tous les contextes.

## Reproduction et correction

Avec le vrai LFM3-Omni Q4_K_M, le projecteur et le worker local, le message de la capture est envoyé après une ancienne réponse anglaise, avec les instructions de l'assistant par défaut. Avant correction : réponse anglaise, malgré la politique générale de langue. Avec le rappel explicite de la langue utilisateur configurée (`French`, `fr`) : réponse française.

Le transport commun du chat ajoute désormais le nom et le code de langue à la fin des consignes système. Il rappelle que les anciennes réponses, les notations techniques et la langue des sources ne déterminent pas la langue de sortie. Un nouveau message clairement dans une autre langue, ou une demande explicite de traduction, garde la priorité. Aucun ajout dans les messages utilisateur visibles ou enregistrés, aucune réécriture de l'historique.

Ce rappel utilise le réglage de langue déjà disponible ; aucune nouvelle chaîne d'interface ni modification des 104 catalogues. Les noms sont obtenus localement via `Intl.DisplayNames`, avec alias des codes hérités ; une valeur invalide conserve uniquement la politique générale. Le préfixe système reste identique entre les tours lorsque le réglage de langue reste identique.

## Vérifications

- Reproduction native avant correction : anglais.
- Message de la capture après correction : français.
- Nouvelle question française après l'historique anglais : français.
- Demande explicite en anglais : anglais.
- Nouveau message anglais avec interface française : anglais.
- Demande en espagnol avec interface française : espagnol.
- **103 tests réussis dans trois fichiers** : transport, stabilité du préfixe, instruction de langue ; test garantissant que le message et l'historique d'entrée ne sont pas modifiés.
- TypeScript, ESLint ciblé et compilation web réussis. Pas de nouvelle compilation native nécessaire pour ce changement JavaScript ; aucun paquet Desktop de livraison ni installation remplacée.

[Résultats natifs et empreintes](validation.json). Les tests natifs utilisent le helper de production exporté vers le banc d'essai, le vrai modèle sur CUDA et une génération à température zéro. Ils évaluent la langue, **pas la validité scientifique** des réponses sur les désintégrations. Ce petit ensemble ne garantit pas qu'un modèle génératif respectera toujours la consigne ; aucune validation des 104 langues n'est revendiquée. Le mainteneur doit intégrer ces sources dans sa prochaine compilation Desktop.
