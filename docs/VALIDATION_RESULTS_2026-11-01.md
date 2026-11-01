# Résultats vérifiés des distributions — 1er novembre 2026

**Reprise du 2 novembre, feeds contrôlés à 00 h 24 (Paris)** : les deux feeds de production restent en HTTP 404. Le correctif est vérifié dans l'interface Windows native locale (build debug) et dans une vraie AppImage Linux signée. Le job Linux du run `41358869680` réussit ; l'artefact `13105425728` passe le digest GitHub, 15 empreintes, la signature, 42 tests frontend et neuf migrations, avec capture du message d'erreur explicite. Le nouveau Windows ARM64 est aussi vérifié : digest, 24 empreintes, signature et clé embarquée, sept PE ARM64 et neuf fichiers runtime identiques au NSIS signé, 42 tests frontend et neuf migrations. Il n’est pas exécuté sur ce poste x64. Seul le paquet Windows x64 est encore attendu. Voir [les résultats et limites précis](UPDATE_CHANNEL_CHECK_2026-11-01.md).

Les contrôles autonomes de cette phase sont terminés. **Aucune version ni aucun feed public n’est publié.** Les composants d’installation/remplacement sont vérifiés sur cinq desktops et trois CLI ; la disponibilité du canal de production et les validations propres aux autres formats restent distinctes.

## Résultats conservés

| Cible | Exécution vérifiée | Preuve principale |
| --- | --- | --- |
| Windows x64 / ARM64 NSIS | [41336767111](https://github.com/TRON-ABS/Novera/actions/runs/41336767111) | Installation, signature native, refus d’altération, absence d’offre à même version, restauration de 106/neuf fichiers, témoin de profil et démarrage avant/après. |
| Linux x64 AppImage | [41334675673](https://github.com/TRON-ABS/Novera/actions/runs/41334675673) | Même scénario ; AppImage restaurée à son empreinte exacte. |
| macOS ARM64 / Intel | [41334675673](https://github.com/TRON-ABS/Novera/actions/runs/41334675673) | Même scénario ; 22/30 fichiers identiques ; minima macOS 14/13 contrôlés sur les paquets. |
| CLI Windows x64 / Linux x64 / macOS ARM64 | [41341759700](https://github.com/TRON-ABS/Novera/actions/runs/41341759700) | Archives signées, architectures et clé embarquée vérifiées ; remplacement réel, exécution et témoin préservé. Trois artefacts téléchargés, onze empreintes chacun ; signatures et identités ZIP recontrôlées indépendamment. |
| Web | [41339452516](https://github.com/TRON-ABS/Novera/actions/runs/41339452516) | 595 empreintes vérifiées ; 588 fichiers servis contrôlés en HTTP local ; rechargement entre deux builds au navigateur conservant une préférence visible et la route. |

Les reçus desktop téléchargés correspondent aux digests GitHub des artefacts `13095099831`, `13096100578`, `13094373576`, `13095246856` et `13095525143`. Les CLI vérifiées sont `13098069269`, `13097997692` et `13098367758`. Le frontend Web est `13096367645`. Les preuves locales sont conservées ; les caches de compilation nettoyés ne les contenaient pas.

Le contrôle source [41345584039](https://github.com/TRON-ABS/Novera/actions/runs/41345584039), commit `6129a15a`, réussit : **55 contrats Node, 53 réussis et deux propres à Windows ignorés sur Ubuntu, aucun échec ; sept tests Python réussis**. Les 55 contrats Node passent localement sous Windows. Les trois jobs CLI passent chacun deux tests policy/help, sept tests cryptographiques et le test distinct de remplacement normalement ignoré localement.

Le déploiement Pages ajoute deux contrats : 57 tests Node passent localement ; le run `41346258656` passe 55 tests et ignore deux tests propres à Windows, avec sept tests Python réussis. HTTPS, empreinte HTML, révision et deux images publiques sont contrôlés ; aucun paquet applicatif ni feed n’est déployé.

## Limites exactes

Le programme desktop annonce une version synthétique `0.9.9` pour exercer le vrai paquet `1.0.0`. Il ne certifie pas le parcours complet d’update dans l’interface ni une transition entre deux applications publiées. L’essai CLI remplace un témoin par le vrai exécutable ; il ne couvre pas tous les scénarios d’un processus en cours d’utilisation. Le test Web couvre un rechargement et une préférence, pas toutes les discussions ni les fonctionnalités cloud/natives ; des avertissements de fonctions natives absentes sont documentés.

Les manifests desktop et CLI `1.0.0` sont préparés uniquement pour examen local. Le manifeste CLI recontrôle les signatures, les identités internes des ZIP, les reçus et les trois plateformes. Aucun `latest.json` ou `latest-cli.json` public n’est activé. Le brouillon privé `430498139` garde ses 15 assets vérifiés, chacun sous 2 Gio ; CLI, mobiles, Web, MSI, Debian et portable ne sont pas ses assets de diffusion.

## Informations et validations encore indispensables

- GitHub Pages est configuré avec HTTPS et sa [vitrine informative](https://tron-abs.github.io/Novera/) est vérifiée après le [déploiement 41346258656](https://github.com/TRON-ABS/Novera/actions/runs/41346258656). Le client reste interne : adapter les chemins et le routage au sous-chemin, satisfaire le contrat de cache et valider le renouvellement réel avant diffusion de l’application Web.
- Fournir les identités et accès Apple réels nécessaires à la signature/notarisation macOS et à une distribution iOS sur appareil. Aucun certificat n’est inventé.
- Définir et configurer la signature durable et le canal Android de production, puis valider sur appareil ; le candidat debug demeure interne.
- Planifier la validation des feeds de production, du parcours UI et des futures transitions de versions. Les scénarios MSI/Debian/portable exigent leurs propres canaux et essais avant inclusion dans une diffusion.

Les valeurs secrètes doivent être configurées hors du chat et du dépôt, dans les mécanismes prévus. La sauvegarde chiffrée de signature reste conservée sur ce PC ; le mainteneur doit encore en faire une copie externe et conserver le code de récupération séparément. Voir [la disponibilité de lancement](LAUNCH_STATUS.md), [le protocole](INSTALL_UPDATE_VALIDATION.md), [le canal CLI](CLI_SIGNED_UPDATES.md) et [la livraison Web](WEB_DELIVERY.md).
