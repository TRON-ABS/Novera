# Commandes de discussion Novera

État du 24 octobre 2026 : changements désormais inclus dans le nouveau build local 1.0.0 ; aucune publication distante.

## Paramètres et outils

Style actualisé dans les sources : ⚙️ réglages, 🌐 recherche web, 💻 shell, ⚡ raisonnement, 💾 sauvegarde, 🗑️ suppression. Les emoji décoratifs partagent une boîte centrée de 20 px, une taille de police de 18 px et des boutons de 32 px. Les infobulles et libellés accessibles traduits restent portés par les boutons ; les états actifs et les restrictions existantes sont conservés. Cette modification visuelle est incluse dans le build local du 24 octobre 2026, vérifié dans .build/novera-desktop-emoji-2026-10-24.

Le panneau de l’assistant indique si le modèle conserve ses valeurs par défaut ou si des paramètres de l’assistant les remplacent. La roue dentée ouvre les paramètres avancés ; « Add parameter » reste dans cette partie. Le bouton de réinitialisation retire les paramètres d’échantillonnage propres à l’assistant et conserve ses autres réglages. Sans remplacement, le modèle reprend ses valeurs configurées, y compris le profil LFM de Novera.

La portée des réglages existants est conservée : dans une discussion, sa copie de l’assistant est mise à jour, ainsi que l’assistant canonique s’il existe encore. Cette copie canonique sert aux futures discussions ; les copies des autres discussions existantes ne sont pas réécrites. Les paramètres du modèle restent distincts.

Web Search, Shell et Raisonnement partagent un contour arrondi, une épaisseur de trait cohérente et un fond teinté quand le réglage est actif. Les restrictions du Shell, les capacités nécessaires et les différents modes de raisonnement sont conservés. La recherche web possède désormais un libellé accessible et un état `aria-pressed`.

## Disquette : sauvegarder la discussion ouverte

Placement actualisé : disquette puis corbeille immédiatement après Raisonnement, dans le groupe d’outils à gauche de la barre de saisie. Sur une fenêtre étroite, elles suivent ces outils dans le menu de débordement. Ce déplacement est inclus dans l’exécutable local recompilé le 24 octobre 2026 ; preuves dans `.build/novera-desktop-buttons-2026-10-24/verification.json`.

| Choix | Contenu |
| --- | --- |
| Markdown `.md` | Texte de la branche affichée, organisé par rôle |
| Texte `.txt` | Texte de la branche affichée |
| JSON `.json` | Messages utilisateur/assistant filtrés de toutes les branches, références de branche et identifiants actifs ; schéma version 2 |
| HTML `.html` | Document autonome lisible ; les contenus des messages sont échappés |
| CSV `.csv` | Une ligne par message de la branche affichée ; UTF-8 et protection contre les formules de tableur |
| Imprimer / Enregistrer en PDF | Dialogue d’impression système, avec choix PDF s’il est disponible |

Aucune connexion externe n’est nécessaire pour l’export. Les fichiers externes joints ne sont pas regroupés dans une archive : les formats lisibles indiquent leurs références ; le JSON conserve les données et références déjà présentes dans les messages. Il ne constitue pas une sauvegarde complète du profil, des réglages globaux ou des modèles. Aucun import JSON n’est ajouté par cette modification.

Correction du 24 octobre 2026 : tous les formats, y compris JSON et PDF, excluent les blocs de réflexion, les appels/résultats des outils et leurs métadonnées internes. Les anciens blocs `<think>`, `<thought>`, `<thinking>`, `<reasoning>`, `<analysis>` et le canal `analysis` sont également retirés du texte de l’assistant ; les blocs incomplets ne sont pas exportés. Les messages utilisateur, les réponses visibles, leurs liens et les exemples de code restent disponibles. Les messages contenant seulement des traces internes ne créent pas d’entrée vide. La branche affichée est calculée avant filtrage afin de conserver la réponse qui suit un nœud outil. Le JSON filtré utilise la version 2 et ne constitue plus une archive brute des données de session. Aucun historique stocké n’est modifié.

Sous Tauri, l’utilisateur choisit le fichier dans le dialogue natif, puis l’écriture passe par la commande existante. Dans le navigateur, l’action télécharge un fichier. Annuler ne modifie rien ; une erreur d’écriture est affichée. Le PDF passe par une impression réelle, sans renommer un autre format en `.pdf`. Sa feuille de style est également fournie comme ressource locale pour respecter la CSP de WebView2.

## Corbeille : supprimer et repartir à zéro

La corbeille se trouve à droite de la disquette et demande confirmation. Elle vise uniquement la discussion ouverte. L’écriture des messages en attente est terminée avant la suppression persistante. Les mécanismes existants nettoient la session et demandent le nettoyage du cache moteur, de l’index documentaire et de l’espace des outils.

Après une suppression réussie, les messages en mémoire, la file d’attente et les pièces jointes préparées de cette discussion sont retirés ; la saisie et son brouillon sont réinitialisés. L’écran d’accueil permet de commencer une nouvelle discussion : un nouvel identifiant et un nouveau titre sont créés par le fonctionnement habituel au premier envoi. Aucune discussion vide supplémentaire n’est enregistrée immédiatement.

Les autres discussions restent disponibles. Une erreur conserve la discussion et la saisie, et permet de réessayer. Si l’utilisateur a changé de discussion ou est revenu à l’accueil pendant l’opération, son nouveau brouillon n’est pas effacé. Les commandes sont indisponibles pendant une génération ou le traitement des pièces jointes. La discussion de démarrage reste protégée tant que sa configuration n’est pas terminée. Cowork garde ses propres commandes et son propre cycle de session.

Il s’agit d’une suppression applicative, sans garantie d’effacement sécurisé du disque ou des copies exportées. Les nettoyages secondaires hérités sont effectués au mieux et ne transforment pas une suppression persistante réussie en échec.

## Organisation du code

- [Règles de sérialisation](../web-app/src/modules/conversations/export.ts) : pures, sans UI ni accès système.
- [Fichiers et impression](../web-app/src/adapters/platform/conversation-files.ts) : adaptation Tauri/navigateur.
- [Commandes de discussion](../web-app/src/containers/ConversationActions.tsx) : confirmation, erreurs et remise à zéro.
- [Paramètres de l’assistant](../web-app/src/containers/SamplerPopover.tsx) et [barre de saisie](../web-app/src/containers/ChatInput.tsx).

## Validation

Les tests couvrent les branches, l’archivage JSON, Unicode, les noms de fichiers Windows, les contenus HTML, les cellules CSV, l’annulation, les erreurs d’écriture et de suppression, la sauvegarde, le routage PDF, le nettoyage après confirmation, la navigation pendant une suppression et les paramètres avancés. Le contrôle TypeScript, les frontières d’architecture et les catalogues de langue sont également vérifiés. Les styles de la barre sont traités avec la chaîne Tailwind existante, avant la nouvelle compilation applicative ; le bundle et le binaire sont maintenant construits.

Le dialogue natif d’enregistrement, l’impression/PDF réelle sous WebView2 et le rendu graphique final restent à vérifier dans le build local actualisé. Aucun fichier de discussion réel n’a été supprimé pour ces tests. Les cinq nouveaux libellés sont traduits en français et dans les catalogues des contributions ; la relecture native reste à effectuer.
