# Nettoyage local — 25 octobre 2026

À la demande du mainteneur, suppression de **41 dossiers générés et 2 archives**, représentant **14 378 737 833 octets** de fichiers (environ **14,4 Go / 13,39 Gio**). Il s’agit du volume logique supprimé ; la variation exacte de l’espace libre du disque n’a pas été mesurée. Les 43 suppressions ont réussi.

## Éléments retirés

- Ancienne distribution Desktop 0.8.7, deux sauvegardes Desktop intermédiaires et distribution horodatée du 24 octobre à 18 h 16.
- Copies de runtimes et extractions portables utilisées pour d’anciens essais.
- Anciennes bibliothèques moteur compilées et copies d’exécutables précédents.
- Résultats de compilation et caches Gradle/Kotlin des quatre projets Android expérimentaux.
- Copie temporaire du JDK 27 et son ZIP ; extraction temporaire des outils Android et son ZIP. Les installations de référence sont conservées.

## Éléments conservés et contrôles

La dernière distribution Desktop du 25 octobre à 02 h 37, celle du 24 octobre à 22 h 01 comme secours, la distribution de travail `Novera-Desktop-local-1.0.0`, les archives portables restantes et le projet Android principal sont conservés. Les empreintes SHA-256 des trois exécutables Desktop protégés, de l’APK du projet principal et du JDK installé sont identiques avant et après le nettoyage.

Les sources, modifications locales, dépôts et sauvegardes Git, rapports de tests, profils, modèles, conversations, identifiants, dépendances installées et outils SDK/NDK/JDK de référence ne font pas partie des cibles. Les sources des projets Android expérimentaux et le cache Maven de validation sont conservés. Les anciens rapports restent historiques : leurs chemins vers les artefacts supprimés ne désignent plus des fichiers disponibles.

Avant suppression : vérification des chemins absolus dans le projet, de l’absence de fichiers suivis par Git, de liens de redirection et de fichiers identifiables comme modèles ou bases de données utilisateur. Les suppressions utilisent des chemins explicites et restent dans PowerShell.

Le manifeste détaillé, les résultats et les empreintes sont conservés localement dans `.build/cleanup-2026-10-25/` : `plan.json`, `deleted.json`, `result.json`, `protected-before.json` et `protected-after.json`. Aucun changement fonctionnel, compilation ou envoi vers le dépôt n’a été effectué pour ce nettoyage.

## Pour les prochains nettoyages

Refaire un inventaire avant toute suppression ; ne pas relancer aveuglément une ancienne liste de cibles. Conserver la version actuelle, une version précédente vérifiée, les preuves utiles et les données utilisateur. Ne jamais supprimer un dossier sur son seul âge ou son nom. Vérifier les références des scripts et comparer les empreintes des fichiers conservés. Les caches externes au projet et les outils installés nécessitent un examen distinct.
