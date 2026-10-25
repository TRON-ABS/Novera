# Nettoyage des éléments Jan — 25 octobre 2026

Retrait de 762 anciens chemins de fichiers, représentant environ 244,46 Mio de contenu
suivi par Git : ancien site Nextra et médias, ses configurations et verrous,
README japonais et chinois décrivant encore Jan, copie du README historique,
ancienne démonstration et logo `jan-logo.png` sans référence dans le code actuel.
La taille représente les fichiers retirés de l’arborescence, pas une réduction
mesurée de l’espace disque ou de l’historique Git.

Les installateurs `install-jan-agent.*`, qui proposaient les distributions Jan,
sont retirés. La [CLI locale](AGENT_CLI.md), ses sources et le lanceur
`novera-agent.sh` sont conservés. La recette Flatpak `ai.jan.Jan`, épinglée sur
Jan 0.8.5, et ses workflows dédiés sont retirés ; aucun paquet Flatpak Novera
n’est annoncé. Le workflow de déploiement de l’ancien site et sa tâche de purge
Cloudflare sont aussi retirés.

## Éléments conservés

- Documentation Markdown Novera et tests de compatibilité API dans `docs/tests`.
- Références CLI/protocole déplacées dans `docs/agent`, avec les quatre extraits
  ADK conservés et leur test ajusté au nouveau chemin.
- Licence Apache 2.0, attributions de Jan et dépendances.
- Moteur `jan-llama-worker`, shim `jan_llama_shim`, modules `useJan…` et noms
  internes encore utilisés par le code et les scripts.
- Logo du fournisseur Jan `web-app/public/images/model-provider/jan.png`,
  encore référencé dans les utilitaires d’interface.
- Sources et workflows Linux AppImage/deb, Windows, macOS et Android.
- Toutes les modifications locales sans rapport, les traductions, modèles,
  conversations et exécutables.

Les anciennes versions des fichiers restent récupérables dans Git. Les écarts
locaux des fichiers retirés ont été sauvegardés dans le dossier ignoré
`.build/jan-cleanup-2026-10-25/local-backups/` avant suppression. Les rapports
historiques peuvent mentionner les anciens chemins ; ils ne décrivent pas
l’arborescence actuelle. Les références de l’inventaire des dépendances au site
retiré pointent vers la version Git qui a servi de base au nettoyage.

## Validation

Contrôle des 762 anciens chemins retirés, des références dans les workflows,
des liens de la nouvelle documentation et des empreintes de 12 fichiers
fonctionnels conservés. Les quatre extraits ADK déplacés correspondent à leurs
sources, selon un contrôle local équivalent à celui du test Rust ; le test Rust
lui-même n’a pas été exécuté. Aucune compilation d’application, installation,
suppression de données utilisateur, réécriture d’historique ou activation de
GitHub Actions pour ce nettoyage. La publication porte uniquement sur ce lot,
pas sur les autres changements en cours dans le dossier de travail.
