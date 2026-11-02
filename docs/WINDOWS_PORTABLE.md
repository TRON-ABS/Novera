# Novera 1.0.0 — Windows x64 portable

**En préparation : la disponibilité publique sera annoncée après validation du paquet signé.**

La distribution portable conserve ses données dans son propre dossier, pour pouvoir emporter l’ensemble sur une clé USB. Elle possède un canal de mise à jour distinct de l’installateur Windows.

## Utilisation

Extraire l’archive complète dans un dossier accessible en écriture, puis ouvrir `Novera.exe` à sa racine. Conserver ensemble le lanceur, `novera-portable.json`, `Program` et `Data`.

- `Program` contient l’application et ses moteurs.
- `Data` conserve les discussions, réglages, téléchargements de modèles, caches et données WebView.
- Les modèles téléchargés par l’application vont dans `Data/Models`. Pour emporter un modèle déjà présent ailleurs, le copier dans ce dossier avant de l’importer : un lien vers un fichier externe ne copie pas ses octets.

Fermer Novera avant de déplacer le dossier complet ou d’éjecter la clé USB. Garder une sauvegarde de `Data`. Ne pas lancer simultanément deux instances utilisant le même dossier portable.

## Mise à jour

Les mises à jour intégrées utilisent le canal `latest-portable.json` et la clé publique Novera. Le paquet signé contient uniquement le remplacement de `Program`. Le lanceur peut récupérer un échange interrompu au prochain démarrage. Ne pas écraser `Data` avec une archive neuve.

Chaque future release choisie comme dernière release GitHub doit conserver les trois manifests `latest.json`, `latest-cli.json` et `latest-portable.json`, avec les dernières cibles réellement disponibles et vérifiées de chaque canal. Une sortie portable ne doit pas interrompre les mises à jour des versions installées ou CLI.

## Compatibilité

Windows x64 avec WebView2 déjà installé ; le portable ne l’installe pas sur le PC. Les modèles et les pilotes doivent convenir au matériel utilisé. Aucun modèle ni profil personnel n’est inclus dans le paquet.

Les accès cloud restent protégés par Windows. Sur un autre PC ou compte Windows, il peut être nécessaire de reconnecter les fournisseurs ; les secrets ne sont pas exportés en clair. Les environnements Python facultatifs peuvent demander une réparation après déplacement.

La signature updater est distincte d’Authenticode ; Windows peut afficher un éditeur inconnu. Les essais de déplacement et de remplacement avec des données synthétiques ne certifient pas tous les modèles, toutes les clés USB ni une transition entre deux versions publiques.

**TRON-ABS** — *The art of Human with AI*
