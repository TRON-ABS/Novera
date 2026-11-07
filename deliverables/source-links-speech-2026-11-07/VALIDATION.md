# Sources, liens et langue de la voix — 7 novembre 2026

Préparation 1.0.1 ; manifests toujours en 1.0.0. Aucune livraison Desktop compilée ou publiée dans ce lot ; le mainteneur effectuera sa compilation.

## Reproduction et correction

Le mainteneur signale un changement de langue lors de la lecture des phrases avec 1889, 2,50 francs, 2026, 80,05 kilomètres et 1,5 heure, entourées de sources. La forme copiée de l'interface contient des liens dont le libellé est « image » ou une URL. Le nettoyage conservait ces libellés au lieu de les écarter.

L'inspection en lecture seule du message correspondant confirme aussi une variante réelle : `[[cite:source]](https://en.wikipedia.org/wiki/Addition)`. Le nettoyage retirait le marqueur `[[cite:source]]` mais laissait son adresse entre parenthèses. Il ne suffisait donc pas de tester des marqueurs standards `[[cite:https://...]]`.

Le nettoyage vocal traite désormais les deux formes. Un scanner local de destinations Markdown équilibrées retire les images, les libellés décoratifs et les libellés composés d'une adresse ; il conserve les libellés descriptifs. Les marqueurs de citation suivis d'une destination sont retirés avec celle-ci, avant le nettoyage des marqueurs standards. Les URL nues et enveloppes devenues vides sont écartées. Les parenthèses d'URL et les titres cités sont gérés sans laisser de morceau de destination. Aucun lien n'est ouvert par cette préparation et aucune dépendance n'est ajoutée.

Ce traitement est commun au contrôleur vocal : il s'applique à LFM3-Omni/Audio et à la voix système des modèles classiques avant la verbalisation des nombres. Les messages affichés et enregistrés restent inchangés. La langue de l'utilisateur continue à être transmise au backend ; le nettoyage évite de lui envoyer les adresses et icônes parasites. Ce lot n'est pas une correction de la véracité des citations inventées par le modèle.

## Validation

- 241 tests dans 10 fichiers, tous réussis. Régression sur le texte copié exact et sur la vraie forme `[[cite:source]](URL)`, conservation des phrases et des nombres, parenthèses/titres équilibrés, URL nues, ancien format de citation et contrôle du texte réellement transmis au backend.
- TypeScript et ESLint des bibliothèques modifiées réussis. Build web Windows réussi en 6,31 secondes ; avertissements préexistants de découpage et taille de bundles.
- Vraie application Windows debug, vrai LFM3-Omni Q4_K_M, moteur llama.cpp v0.9.0 build12110 (cd959bae99ff4bed22bef2604f45241c09bbb8c8). Réponse de test reproduite, contrôleur réel en mode lecture seule : aucune capture micro, aucun appel LLM pour inventer une nouvelle réponse.
- Deux phrases jouées dans chacune des deux voix natives : quatre WAV, quatre démarrages, quatre fins de lecture. Requêtes toutes en langue fr, avec seulement les phrases françaises et les nombres verbalisés ; aucune URL ni mention image/favicon/Wikipedia envoyée au modèle vocal.
- Dernier WAV masculin et féminin retranscrits localement : « En 2026, le trajet mesure 80,05 km et dure 1,5 heure. » La retranscription par le même modèle n'est pas une expertise indépendante de qualité.
- Zéro intervalle ajouté entre les deux extraits de chaque voix, selon l'horloge audio et les durées réelles. Tous les contextes fermés. Voix système Windows : même réponse nettoyée lue jusqu'à son terme avec succès.
- Le mainteneur confirme après l'essai : **« Oui, les deux restent en français, sans lien »**.

Les premiers passages du banc ont révélé des défauts de ses contrôles : champ lang non enregistré, vérification exigeant le mot kilomètres plutôt que l'abréviation km et compteur externe ended incomplet. Le banc final enregistre la langue, accepte l'abréviation de la retranscription et compte l'événement utilisé par le lecteur. Les validations finales ci-dessus proviennent du passage complet réussi ; ces corrections du banc ne relâchent pas les erreurs de synthèse du produit.

Les profils et journaux de test sont supprimés après validation. Aucun audio conservé, aucun réglage ou historique personnel réécrit. Les autres modèles utilisent le même nettoyage ; ce lot ne certifie pas tous les modèles, toutes les langues ou les autres plateformes. Un modèle génératif peut encore mal prononcer un autre texte ; la preuve porte sur cette reproduction et les cas automatisés joints.
