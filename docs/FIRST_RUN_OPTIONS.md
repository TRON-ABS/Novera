# Premier démarrage : DSpark et suivi des erreurs

Mise à jour du **25 octobre 2026**. Modifications des sources, sans compilation
de l’application ni modification d’un profil utilisateur.

## Accélération optionnelle de LFM2.5-2.6B

Le premier démarrage propose une case **DSpark**, décochée par défaut, avec le
modèle de bureau recommandé **LFM2.5-2.6B Q6_K**. Le téléchargement démarre
uniquement après l’action de l’utilisateur. Si la case est cochée, le chemin
d’import existant ajoute le compagnon Q8_0 avec le type `dspark` ; il prépare
le décodage spéculatif `draft-dspark`. Le modèle principal reste le même.
Le choix reste associé au téléchargement si le contrôle de support est encore
en attente et ne peut pas changer pendant le téléchargement.

Le [dépôt officiel LiquidAI](https://huggingface.co/LiquidAI/LFM2.5-2.6B-DSpark-GGUF)
décrit ce fichier comme un brouillon auxiliaire à associer à LFM2.5-2.6B.
[Fichier demandé](https://huggingface.co/LiquidAI/LFM2.5-2.6B-DSpark-GGUF/resolve/main/LFM2.5-2.6B-DSpark-Q8_0.gguf?download=true).
Les métadonnées Hugging Face consultées donnent **356 491 776 octets**, soit
environ 356 MB à télécharger. Les poids n’ont pas été téléchargés pour ce travail.
La taille du fichier ne mesure pas la consommation totale en mémoire.

L’explication visible avant le téléchargement précise que DSpark **peut**
accélérer la génération, utilise davantage de RAM ou de VRAM et laisse moins
de mémoire pour le contexte. L’utilisateur doit tester son matériel et régler
la longueur du contexte, ou désactiver le décodage spéculatif dans les paramètres
du modèle. La valeur du contexte n’est pas réduite automatiquement, aucun gain
de vitesse ni capacité matérielle n’est garanti. L’option 2.6B n’est pas proposée
pour la recommandation Android 1.2B ni pour un autre modèle.

## Demande indépendante pour le suivi des erreurs

Le parcours contient une étape dédiée au suivi des erreurs avant le modèle,
distincte du consentement aux statistiques. Elle présente le destinataire et
le contenu limité des rapports, puis **Autoriser / Refuser**. Aucun consentement
aux statistiques n’active les rapports d’erreurs. Le suivi reste désactivé par
défaut ; le choix est enregistré dans le même état persistant, lié à sa
destination, pour éviter de reposer la question à chaque démarrage.

Sans service configuré, l’étape indique qu’aucun rapport n’est envoyé et le
bouton d’autorisation est désactivé. Un profil ayant déjà autorisé le suivi ne
reçoit pas une nouvelle demande. Un import de modèle en arrière-plan ne peut
pas contourner la question encore en attente. Le nombre d’étapes reste stable
une fois les consentements présentés. Le réglage reste modifiable dans
Confidentialité ; le filtre des données envoyées est inchangé.

## Langues et validation

Deux textes DSpark et un message de suivi indisponible ajoutent **trois clés**
dans chacune des **36 langues**, soit **108 traductions**. Chaque catalogue
couvre maintenant les **1 516 clés anglaises**. Les variables et noms techniques
sont conservés ; la relecture native reste nécessaire.

Les tests vérifient l’absence de téléchargement automatique, le choix DSpark
direct et différé, l’exclusion du modèle Android, la séparation des deux
consentements, le refus mémorisé, la destination absente et l’impossibilité de
contourner une demande par un import. Les contrôles TypeScript, d’architecture
et de catalogues sont exécutés sans compilation applicative. Les mesures de
vitesse, de RAM/VRAM et une vraie première installation restent à valider sur
un exécutable reconstruit. Aucun rapport réel ni consentement utilisateur
n’a été modifié pendant les tests.
