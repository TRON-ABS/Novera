# Novera 1.0.0 — finalisation du 2 novembre 2026

Le mainteneur autorise la finalisation et la sortie. Le périmètre initial retenu est Windows x64 (NSIS), Linux x64 (AppImage), et leurs deux CLI signées. Les autres formats et architectures restent internes. Le brouillon public prévu est `431053174`, tag `v1.0.0` ; le brouillon historique `430498139` reste privé et conserve ses anciens candidats.

## Chaîne de validation

Les paquets desktop proviennent du commit `428299c34d66170f543722ea98a11de6e3e50979`, run `41358869680`. Leurs signatures updater sont revérifiées avec `ci-check-updater.mjs --publication-check`. Windows x64 conserve son contrôle des 125 empreintes et de l'interface native ; Linux conserve ses 15 empreintes et sa capture native. Les deux CLI du run `41341759700`, commit `78678bf6bd91218d11e441d6faaac52b54e47c2c`, sont récupérées à nouveau : digest GitHub, onze empreintes par archive, architecture, identité interne signée et reçu de remplacement sont revérifiés.

La nouvelle cible CI `validate-release` installe puis remplace les fichiers exacts du nouveau brouillon sur Windows x64 et Linux x64. Les plateformes non retenues ne sont pas exécutées dans cette cible. La provenance du reçu est propre à chaque plateforme, afin de conserver les références des anciens candidats exclus.

Avant publication : transférer les quinze assets, vérifier leurs tailles et SHA-256 côté GitHub, réussir les installations/remplacements natifs sur les deux hôtes, intégrer la PR corrective et fixer le tag au commit revu. Les manifests ne doivent annoncer que les plateformes réellement livrées.

Après publication : vérifier sans authentification les deux endpoints HTTPS, chaque URL de paquet et signature, puis la vérification manuelle dans l'application. La première version n'a pas de version publique précédente : les preuves de remplacement natif restent distinctes d'une transition entre deux versions publiques. Cette dernière sera contrôlée lors de la prochaine sortie.

Le banc UI Linux accepte désormais les deux états réels : erreur explicite pour HTTP 404, ou message de version à jour pour un feed officiel signé de version égale ou antérieure. Il refuse les réponses inattendues et les offres nécessitant un scénario d'installation différent. Il ne simule pas le service updater.

## Limites de cette sortie

La signature updater ne vaut pas Authenticode Windows. ARM64 attend une validation visuelle appropriée ; Apple attend ses accès et identités réels ; Android/iOS, Web hébergé, MSI, Debian et portable conservent leurs conditions propres. Aucun modèle, profil utilisateur ou secret n'est inclus dans les assets. La vitrine Pages reste distincte du client Web.

Les résultats définitifs et liens de publication seront ajoutés après leurs contrôles réels.
