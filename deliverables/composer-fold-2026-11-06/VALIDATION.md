# Repli manuel du bloc de saisie — préparation 1.0.1

**État historique remplacé :** le retour utilisateur a précisé que les commandes du bas doivent se replier en conservant la saisie visible. Les résultats ci-dessous décrivent la première implémentation, corrigée depuis. Voir [la disposition et les contrôles actuels](../composer-controls-voice-2026-11-06/VALIDATION.md).

Demande confirmée le 6 novembre 2026 : garder la saisie et ses boutons identiques ; permettre uniquement de replier ce bloc sur la partie située dessous pour gagner de la place, sur toutes les interfaces.

## Comportement

- Petite commande à chevron dans la barre d'outils existante, à côté des commandes ; aucune ligne de commande supplémentaire.
- Le bloc supérieur se masque, la partie inférieure reste visible. Le champ reste monté : texte et pièces jointes ne sont pas effacés. La réouverture conserve ses dimensions et lui rend le focus.
- Repli exclusivement manuel, ouvert au premier lancement. Préférence mémorisée sur l'appareil ; seul un booléen est stocké. Le repli reste utilisable si le stockage du webview est bloqué.
- Pendant une réponse ou l'exécution d'outils, le bloc reste ouvert et la commande de repli est désactivée afin de conserver le bouton d'arrêt accessible.
- Même composant partagé par les builds Windows, macOS, Linux, Android, iOS et l'interface web. Libellés accessibles et infobulles réutilisent `common:expand`, `common:collapse` et le libellé existant de saisie, présents dans les 104 langues.

## Validation locale

- `corepack yarn exec vitest run --project @janhq/web-app web-app/src/containers/__tests__/ChatInput.test.tsx web-app/src/hooks/__tests__/useComposerDisclosure.test.ts` : **71 réussites, zéro échec**. Inclut conservation du même nœud de saisie, brouillon et pièces jointes, barre inférieure visible, focus, persistance du choix, stockage bloqué et accès à Stop pendant les outils.
- `corepack yarn build:web` : **réussi**, TypeScript et Vite ; avertissements existants de taille des chunks et de chargement des configurations Vite.
- Contrôle Edge headless de la compilation web servie localement, avec un fournisseur fictif sans requête d'inférence, profil de navigateur isolé et requêtes externes bloquées. Formats 1280×800, 390×844, 320×568 et 740×360 : repli/réouverture réussis, brouillon conservé, même champ, focus restauré et aucun débordement horizontal. Résultats : [browser-results.json](browser-results.json).
- Gains mesurés sur ce scénario de deux lignes : respectivement **83, 105, 173 et 83 pixels** ; ils dépendent du contenu et de la largeur.

Ces essais de navigateur ne constituent pas des compilations ni des essais sur appareils natifs Android/iOS/macOS/Linux. Le clavier virtuel réel reste à vérifier sur appareil. Aucun paquet publié, aucune modification de l'installation personnelle 1.0.0.
