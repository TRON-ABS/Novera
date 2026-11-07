# Recherche météo avec « quel temp » — 7 novembre 2026

Le mainteneur indique que le reste semble fonctionner sur sa compilation Desktop et confirme LFM3 + Internet activé pour la capture 03:40. Ce retour reste qualitatif ; il ne certifie pas tous les modèles et plateformes.

## Diagnostic

La capture a d'abord été lue comme « quel temps ». Le message enregistré, examiné en lecture seule, est exactement : « il fera quel temp aujourd'hui au Sable d'Olonne 85100 ? ». Le détecteur reconnaissait « temps », mais pas « quel temp » sans s. Les réponses de la branche concernée ne contenaient aucun outil, et le modèle déclarait son accès indisponible. Le dernier build personnel embarquait bien la politique actuelle ; le réglage web était activé et le modèle exposait tools. Aucun changement de réglage utilisateur n'était nécessaire.

Le contrôle de référence dans un profil isolé, avec « temps » correctement orthographié, effectue réellement une recherche. La correction accepte aussi la phrase « quel temp » suivie d'un repère actuel comme aujourd'hui, sans considérer une mention générique de « temp » de matériel comme une demande météo. Internet désactivé, les demandes sans recherche et la fin du tour après un résultat/une erreur gardent leurs règles existantes. Aucun assouplissement des outils shell/MCP ni de leurs permissions.

## Validation

- Test réel Windows debug + vrai LFM3-Omni Q4_K_M, capacités audio/tools, même question « quel temp » : première requête tool_choice required, outil actif web_search ; véritable recherche DuckDuckGo via le plugin natif ; résultat contenant plusieurs URL météo, puis réponse citée terminée.
- Régénération de cette réponse : nouvelle recherche réelle puis lecture de page (fetch_content), deux résultats sans erreur et réponse terminée. Le problème n'était pas propre au bouton de régénération.
- 238 tests dans 10 fichiers réussis, dont contrats de requêtes sur 12 routes de fournisseurs. Ces contrats simulés ne sont pas annoncés comme douze tests réels de modèles ou de services cloud.
- TypeScript et ESLint ciblé réussis ; build web Windows réussi en 9,83 secondes, avec avertissements de découpage/taille préexistants. Les traductions ne changent pas.

Le correctif est commun au transport des modèles proposant les outils web. L'essai matériel de ce lot porte sur LFM3-Omni Windows ; pas de certification des autres modèles. La date de validité et les températures des prévisions récupérées ne sont pas certifiées par cet essai : le résultat prouve l'accès aux outils et aux sources, pas la justesse de toute synthèse météo.

Profils et journaux temporaires supprimés après les essais ; seuls les résultats de la question publique de test sont conservés. Aucun fichier de conversation, réglage, poids ou exécutable personnel modifié. Préparation 1.0.1, manifests toujours en 1.0.0, aucune publication ni nouvelle compilation Desktop de livraison.
