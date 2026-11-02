# Novera 1.0.0 — finalisation du 2 novembre 2026

Novera 1.0.0 est publiée pour Windows x64 (NSIS), Linux x64 (AppImage), et leurs deux CLI signées. La release canonique est `431069327`, tag `v1.0.0`, sur le commit revu `eb57eba6b912f3784d9666a8e5a05e20181da842`. Les autres formats et architectures restent internes ; le brouillon historique `430498139` conserve ses anciens candidats privés.

## Chaîne de validation

Les paquets desktop proviennent du commit `428299c34d66170f543722ea98a11de6e3e50979`, run `41358869680`. Leurs signatures updater sont revérifiées avec `ci-check-updater.mjs --publication-check`. Windows x64 conserve son contrôle des 125 empreintes et de l'interface native ; Linux conserve ses 15 empreintes et sa capture native. Les deux CLI du run `41341759700`, commit `78678bf6bd91218d11e441d6faaac52b54e47c2c`, sont récupérées à nouveau : digest GitHub, onze empreintes par archive, architecture, identité interne signée et reçu de remplacement sont revérifiés.

La nouvelle cible CI `validate-release` installe puis remplace les fichiers exacts du nouveau brouillon sur Windows x64 et Linux x64. Les plateformes non retenues ne sont pas exécutées dans cette cible. La provenance du reçu est propre à chaque plateforme, afin de conserver les références des anciens candidats exclus.

Avant publication, les quinze assets ont été transférés et leurs tailles et SHA-256 vérifiés côté GitHub. Les installations/remplacements natifs passent sur les deux hôtes et la PR #5 est fusionnée. Les manifests annoncent seulement les plateformes réellement livrées.

Après publication, les deux endpoints HTTPS, chaque paquet et signature, puis la vérification manuelle dans les vraies applications sont contrôlés. La première version n'a pas de version publique précédente : les preuves de remplacement natif restent distinctes d'une transition entre deux versions publiques. Cette dernière sera contrôlée lors de la prochaine sortie.

Les reçus d'installation référencent la release source `431053174`. Sa publication initiale a conservé un tag provisoire immuable ; elle est clairement marquée comme remplacée. Le [transfert vérifié 41388406260](https://github.com/TRON-ABS/Novera/actions/runs/41388406260) a copié les quinze assets inchangés vers la release canonique. Toutes les tailles et empreintes concordent. La vérification publique finale utilise exclusivement les URL `v1.0.0`, et le canal latest pointe sur cette release.

Le banc UI Linux accepte désormais les deux états réels : erreur explicite pour HTTP 404, ou message de version à jour pour un feed officiel signé de version égale ou antérieure. Il refuse les réponses inattendues et les offres nécessitant un scénario d'installation différent. Il ne simule pas le service updater.

## Limites de cette sortie

La signature updater ne vaut pas Authenticode Windows. ARM64 attend une validation visuelle appropriée ; Apple attend ses accès et identités réels ; Android/iOS, Web hébergé, MSI, Debian et portable conservent leurs conditions propres. Aucun modèle, profil utilisateur ou secret n'est inclus dans les assets. La vitrine Pages reste distincte du client Web.

## Résultat vérifié

[Version 1.0.0 publiée](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0), quinze assets publics. [Run natif 41386813422](https://github.com/TRON-ABS/Novera/actions/runs/41386813422) : les deux paquets exacts passent installation et remplacement, runtime conservé et témoin de profil préservé. [Run public 41388605836](https://github.com/TRON-ABS/Novera/actions/runs/41388605836) : deux feeds et quinze assets vérifiés sans authentification, signatures revérifiées, vraie AppImage contrôlée dans l'interface et vraie CLI Linux consultée sur le feed public. Le candidat Windows affiche « Vous utilisez la dernière version » sur le feed disponible ; la CLI Windows confirme aussi la version courante. Ces contrôles ne certifient pas encore une transition entre deux versions publiques.
