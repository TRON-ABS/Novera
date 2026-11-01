# Livraison et renouvellement du client Web

Le client Web reste interne. La lecture de l’API GitHub Pages le 1er novembre 2026 retourne 404 ; aucun hébergement Pages configuré n’a été constaté. Aucun domaine ou hébergement de production n’est inventé ni activé par ce travail.

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
