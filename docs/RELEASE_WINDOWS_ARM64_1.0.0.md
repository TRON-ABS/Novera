# Windows ARM64 — Novera 1.0.0

La version Windows ARM64 est [publiée le 2 novembre 2026](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-windows-arm64) et conserve la version applicative **1.0.0**. La release originale `v1.0.0` est immuable ; le complément `v1.0.0-windows-arm64` ajoute neuf assets sans remplacer les paquets x64/Linux existants. Le tag pointe vers le commit de distribution `9b4b85e9961e4a3c1ef7041d547a06e78946d80f`, issu de la [PR #8](https://github.com/TRON-ABS/Novera/pull/8).

Le candidat provient du commit `428299c34d66170f543722ea98a11de6e3e50979`, run `41358869680`, artefact `13105967267`. Le digest GitHub, les 24 empreintes, la signature updater et la clé embarquée sont contrôlés indépendamment. Les sept PE sont ARM64 ; les neuf fichiers du runtime concordent avec le NSIS extrait. SHA-256 de l'installateur : `85cab2cb6ececd8d85cb9198769a5076f03ba72c3847ab857af9b3406762a3f3`.

Le moteur texte CPU est natif ARM64. Le moteur d'image CUDA x64 n'est pas inclus. Les modèles ne sont pas embarqués ; les capacités cloud nécessitent les accès configurés par l'utilisateur. La signature updater ne vaut pas Authenticode Windows.

## Contrôles de sortie

La cible `validate-arm64` utilise un runner Windows ARM64 jetable, installe le NSIS exact et exerce le vrai composant updater natif. Elle vérifie le rejet d'altération, l'absence d'offre à version égale, le remplacement, les fichiers runtime et le témoin de profil.

Le nouveau banc [WebView2 documenté par Playwright](https://playwright.dev/docs/webview2) démarre l'application installée avec un profil isolé et un port CDP local uniquement dans le test CI. Il refuse les postes locaux, les hôtes x64 et les runners auto-hébergés. Il ne change pas le binaire, ne simule pas l'IPC et ne transmet aucun secret à l'application. Le port de diagnostic n'est pas une configuration de distribution.

Le parcours ouvre directement Général, contrôle la version, clique le vrai bouton puis conserve capture et reçu. Avant publication, le feed sans entrée ARM64 doit produire l'erreur explicite. Après publication, le feed officiel incluant ARM64 doit produire le message de version à jour. Ces contrôles ne certifient pas l'onboarding, tous les modèles ni une transition entre deux versions publiques.

Le premier run `41455224313` a atteint le banc UI après les essais natifs, puis a échoué à joindre CDP. L'application fonctionnait et son journal montrait le moteur CPU ARM64 chargé. Le comportement correspond au [durcissement WebView2 sur les processus élevés](https://github.com/tauri-apps/wry/issues/1782). Le lanceur de test utilise désormais le token utilisateur moyen lié, ou un token restreint qui désactive le groupe Administrateurs et les privilèges supplémentaires. Il vérifie le niveau d'intégrité réel du processus enfant ; aucune stratégie machine n'est modifiée. Les reçus d'installation sont écrits avant ce contrôle distinct pour conserver leur résultat même en cas d'échec UI.

Le manifeste complémentaire conserve les URL des paquets Windows x64, Linux x64 et des deux CLI. Il ajoute seulement l'installateur ARM64. Le contrôle public vérifie les dix-neuf fichiers référencés sur les deux releases, leurs empreintes, leurs URL officielles et les cinq signatures de paquets. Le complément contient neuf assets ; le client Web et la CLI ARM64 ne sont pas ajoutés à cette sortie.

## Résultats après publication

- [Essais natifs ARM64 41466831298](https://github.com/TRON-ABS/Novera/actions/runs/41466831298) : installation NSIS, signature native, rejet d’altération, absence d’offre à version égale, remplacement effectif, neuf empreintes runtime et témoin de profil conservé. Le contrôle dans la vraie interface affiche « You’re running the latest version » avec l’entrée ARM64 du canal officiel. Le processus UI est ARM64, non élevé, au niveau d’intégrité moyen 8192.
- [Contrôle public 41466838497](https://github.com/TRON-ABS/Novera/actions/runs/41466838497) : dix-neuf fichiers publics, deux manifests et cinq signatures validés. Le contrôle manuel Linux et la CLI Linux passent également avec le canal combiné.
- Les artefacts CI téléchargés sont vérifiés contre leur digest SHA-256 fourni par GitHub ; les captures réelles sont examinées séparément. Le contrôle UI avant publication [41465337216](https://github.com/TRON-ABS/Novera/actions/runs/41465337216) avait correctement montré l’erreur du canal sans entrée ARM64.

Ces résultats valident l’installation, le remplacement et la consultation du canal public. Ils ne prouvent pas une mise à jour entre deux versions publiques ni le fonctionnement de tous les modèles et matériels. Le moteur CUDA x64 et une CLI ARM64 ne sont pas distribués dans ce complément.
