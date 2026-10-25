# Novera — instructions du projet

Le produit est **Novera**, maintenu par TRON-ABS : https://github.com/TRON-ABS/Novera.

Contact officiel du projet : **[contact.novera.tronabs@gmail.com](mailto:contact.novera.tronabs@gmail.com)**. Adresse créée et confirmée par le mainteneur le 24 octobre 2026 ; à utiliser dans les mentions de contact de Novera.

Objectif : **Knowledge for everyone.** Rendre le savoir et les outils d’intelligence artificielle accessibles en plusieurs langues, avec des modèles locaux et distants.

## Point d’entrée du développement

Ouvrir [TABLEAU_DE_BORD_NOVERA.md](TABLEAU_DE_BORD_NOVERA.md) pour retrouver les fichiers essentiels, le statut des sources et du binaire, les travaux restants et les preuves. Mettre à jour ce tableau après un changement significatif, en distinguant ce qui est local, publié, compilé et validé.

## Architecture

Chaîne Android de référence : JDK 27.0.1.0.3, SDK 37.2, NDK r30, Gradle 9.8.1, AGP 9.4.0 et Kotlin 2.4.21. Utiliser `scripts/android/toolchain.json`, les scripts et modèles associés ; consulter [ANDROID_TOOLCHAIN.md](docs/ANDROID_TOOLCHAIN.md). Les fichiers générés et caches Cargo ne sont pas la source des réglages. La combinaison est validée localement à la compilation ; elle ne constitue pas une validation officielle JetBrains ni une validation sur téléphone. Le BAT conserve Android désactivé.

Consulter [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) et [architecture/modules.json](architecture/modules.json) avant d’étendre un domaine. Privilégier les modules extraits pour les nouvelles règles pures et les adaptateurs pour les accès système/UI. Vérifier `yarn check:architecture` et `yarn test:architecture` après modification des frontières. Les couches historiques restent en migration progressive.

## Règles de travail

- Sources : `C:\msys64\home\jmsga\Novera`.
- Application locale : `Novera-Desktop.exe` ; identifiant `io.github.tronabs.novera`.
- Instructions prioritaires de l’agent : `NOVERA.md` ; repli configurable sur `AGENTS.md`.
- Nouvel état de l’agent : `~/.novera` ; ne pas importer ni supprimer automatiquement les profils Jan existants.
- Préserver les modifications locales, modèles, conversations et identifiants.
- Fournisseurs et modèles cloud : suivre la [procédure de maintenance](docs/CLOUD_PROVIDERS.md#procédure-pour-les-futures-mises-à-jour), vérifier les sources officielles et dater le catalogue. Tout texte d’interface ajouté ou modifié doit être traduit dans les **36 langues prises en charge** ; actualiser aussi l’inventaire et la documentation des langues.
- Version en préparation : **Novera 1.0.0**. Consigne du 23 octobre 2026 : intégrer les corrections par lots ; **aucune compilation de l’application et aucune publication distante avant la fin des PR et une nouvelle autorisation**. Les tests ciblés restent autorisés. Ne pas réactiver GitHub Actions.
- Après les 35 intégrations Windows, le mainteneur a autorisé la compilation **locale** de Novera 1.0.0 le 23 octobre 2026. Cette autorisation inclut les validations nécessaires ; aucune publication distante ni activation de workflows.
- Le 24 octobre 2026, le mainteneur a autorisé la publication des dernières sources et de leur documentation sur Novera ; les exécutables locaux restent exclus et GitHub Actions reste désactivé.
- Le 24 octobre 2026, le mainteneur a demandé une nouvelle compilation locale des dernières sources. Sauvegarder le runtime existant, vérifier le nouveau binaire et préparer son ZIP portable ; aucune publication ni exécution de CI distante.
- Les mises à jour automatiques restent désactivées jusqu’à une chaîne Novera indépendante.
- Conserver les licences et attributions héritées. Le changement de nom ne modifie pas la propriété du code.
- Les interfaces internes de compatibilité et les noms des services ou modèles externes ne doivent pas être renommés sans adapter leurs consommateurs.

## Suivi

- `PR.md` et `Novera_Contributions.txt` : les entrées anciennes décrivent leur état historique.
- [Identité](BRANDING.md) ; [versions officielles](OFFICIAL_RELEASES.md).
- [Plan pour une version propriétaire](docs/NOVERA_VERSION_PROPRIETAIRE.md).
Actualisation du 24 octobre 2026 : le mainteneur a autorisé la publication des dernières corrections et de leur documentation après compilation locale de Novera-Desktop. Les exécutables et archives locaux restent exclus ; GitHub Actions, mises à jour automatiques et envois statistiques restent désactivés.

Actualisation du 25 octobre 2026 : le mainteneur a autorisé la publication des fournisseurs cloud, modèles, logos officiels, traductions et documents de maintenance mis à jour. Exécutables, APK, caches et fichiers temporaires locaux exclus ; GitHub Actions reste désactivé.
