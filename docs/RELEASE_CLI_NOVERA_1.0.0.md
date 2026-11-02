# CLI Novera — nom canonique et canal dédié

Préparation commencée le 2 novembre et poursuivie le 3 novembre 2026 à la demande du mainteneur : la commande, le nom de l'exécutable, l'aide, les identités terminal/ACP/MCP/RPC, les constructions et les archives doivent porter le nom Novera. Les attributions des dépendances et les références historiques aux versions publiées sont conservées.

Les exécutables canoniques sont **`novera.exe` sous Windows** et **`novera` sous Linux/macOS**. Le paquet Cargo est `novera-cli`. Les exemples et l'aide emploient `novera`. Les profils déjà situés dans `~/.novera` et les données Desktop ne changent pas d'emplacement. Les variables `NOVERA_API_KEY`, `NOVERA_BASE_URL`, `NOVERA_CUSTOM_HEADERS`, `NOVERA_EXPERIMENTAL_ACP`, `NOVERA_DATA_FOLDER` et `NOVERA_CLI_NO_UPDATE_CHECK` sont reconnues ; les anciens alias restent acceptés pour les intégrations existantes.

Les nouveaux ZIP portent une identité **formatVersion 2**, avec exactement l'exécutable canonique et `CLI-UPDATE.json`, liés à la version, à l'architecture, au commit et à l'empreinte du binaire. Le vérificateur refuse les archives d'identité historique au lieu de les relabeller.

La release canonique prévue est `v1.0.0-cli-novera`, avec le canal **`latest-novera-cli.json`**. À la demande du mainteneur, les anciens ZIP CLI et leur ancien canal public seront retirés après validation et disponibilité des nouveaux paquets. Les téléchargements Desktop sont conservés. Le canal distinct évite de proposer un ZIP `novera` aux anciens clients qui exigent un fichier `jan`. La première transition depuis un ancien exécutable est donc **manuelle** : extraire le nouveau ZIP dans un dossier distinct, lancer `novera --help`, vérifier les fournisseurs et discussions, puis adapter ses raccourcis/PATH. Aucun profil n'est effacé et aucun nouveau paquet ne s'installe automatiquement sous le nom historique.

Les paquets doivent être compilés, signés et vérifiés sur chaque hôte, avec essais de remplacement isolé et rejet d'un paquet altéré. La présence de la clé publique dans le binaire ou un test d'aide ne remplace pas ces preuves. Les résultats locaux, CI, publication et contrôle du canal public seront consignés séparément.

Android reste suivi dans [RELEASE_ANDROID_1.0.0.md](RELEASE_ANDROID_1.0.0.md) ; le mainteneur teste le build 1000006 pendant cette préparation. La vitrine doit conserver ce statut d'essai et ne pas annoncer une sortie Android validée avant son retour.
