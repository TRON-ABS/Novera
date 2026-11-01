# Livraison et renouvellement du client Web

Le client Web reste interne. À la demande du mainteneur, GitHub Pages est désormais configuré en mode workflow, avec HTTPS imposé : [vitrine Novera](https://tron-abs.github.io/Novera/). Le [déploiement 41346258656](https://github.com/TRON-ABS/Novera/actions/runs/41346258656), commit `5faf42a6`, réussit. La page, ses deux images et son reçu de révision sont vérifiés sur HTTPS puis au navigateur. Elle présente uniquement le lancement en préparation, sans application, téléchargements ni feeds.

Le premier audit Pages retournait 404 avant cette configuration. Le cache observé sur la page et `pages-probe.json` est `max-age=600` : il ne satisfait pas le contrat du client ci-dessous. Les chemins `/assets` et le routage du client doivent également être adaptés au sous-chemin `/Novera/` avant un éventuel déploiement applicatif. Cette vitrine ne valide donc pas le canal de renouvellement du client Web.

## Essai local réellement effectué — 1er novembre 2026

Le [candidat Web 41339452516](https://github.com/TRON-ABS/Novera/actions/runs/41339452516), commit `a1fe94cc`, est compilé sur GitHub puis téléchargé : 595 empreintes passent, archive SHA-256 `f44f29400dbc04f50f43d097e72a005343a4024b2d4cc3007f89f0623f519be5`. Le contrôleur HTTP vérifie les 588 fichiers du frontend servi localement et les headers attendus.

Dans un onglet isolé du navigateur intégré, l’ancien build `307fbb16` est remplacé par ce build à la même origine loopback, puis l’onglet est rechargé. Le bundle visible passe de `index-DDsSyHyA.js` à `index-CZiBpGzN.js`. La page Interface reste accessible et le thème sombre choisi dans l’ancien build reste coché après renouvellement. Aucun stockage n’est effacé, aucune clé cloud n’est saisie ; l’onglet et le serveur de test sont fermés ensuite.

Cet essai vérifie le rechargement et cette préférence, pas toutes les discussions ou fonctionnalités. Les deux builds journalisent notamment l’absence de fonctions natives de synchronisation des paramètres et d’une extension assistant ; leur bon fonctionnement complet au navigateur n’est pas revendiqué. **L’hébergement HTTPS réel, son cache/CDN et son renouvellement restent à valider.**

Les builds Web génèrent maintenant `novera-web-version.json` et un reçu `WEB-DELIVERY-READINESS.json` à côté du dossier `web`. Ils lient la version applicative, le commit et l’empreinte de l’entrée HTML aux fichiers compilés. Le reçu conserve explicitement `hostedChannelValidated:false`, `browserUpgradeValidated:false` et `publicReleaseAuthorized:false`.

## Contrat à appliquer sur l’hébergement retenu

- Servir le frontend sous HTTPS depuis une base stable, avec une barre oblique finale ; configurer le routage SPA selon l’hébergeur.
- Servir `novera-web-version.json` avec `Cache-Control: no-store` et l’entrée `index.html` avec `Cache-Control: no-cache` ou `no-store`. Les réponses SPA utilisant cette entrée suivent la même règle.
- Déployer les assets avant de basculer l’entrée HTML et la révision ; conserver les anciens assets nécessaires aux sessions déjà ouvertes. Les noms avec hash peuvent être immuables, les noms stables doivent être revalidés.
- Le renouvellement prévu est le rechargement du navigateur. Aucune page active n’est rechargée de force et aucun stockage du navigateur n’est effacé par les outils de validation.

L’hébergeur doit appliquer ces règles lui-même : le reçu ne configure pas un serveur ou un CDN. Un éventuel service worker, cache intermédiaire ou système de session impose ses essais propres.

## Vérifier le déploiement choisi

Après préparation d’un hébergement autorisé, vérifier la révision exacte et les empreintes de chaque fichier depuis le reçu examiné :

```powershell
node scripts/distribution/check-web-delivery.mjs CHEMIN/WEB-DELIVERY-READINESS.json https://HOTE-RETENU/BASE/
```

Le contrôle refuse les hôtes HTTP hors loopback, les identifiants dans l’URL, les redirections, les mauvais headers de cache et tout contenu différent du build examiné. Les essais locaux HTTP vérifient deux révisions successives à la même origine et le refus d’une ancienne révision ou de contenu périmé. Ils ne constituent **pas** un essai de mise à jour dans un navigateur réel ni une validation d’hébergement public.

Avant diffusion, vérifier au navigateur le premier lancement, le passage entre deux déploiements, le rechargement, les imports différés et la conservation des données locales. L’origine/domaine retenu et l’accès à son hébergement sont nécessaires pour cette dernière étape. La [publication reste bloquée](LAUNCH_STATUS.md) jusqu’aux preuves réellement obtenues.
