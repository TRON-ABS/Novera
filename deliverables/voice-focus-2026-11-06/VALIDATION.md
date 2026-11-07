# Erreur vocale persistante : focus Windows — 6 novembre 2026

Le mainteneur a recompilé le lot précédent et voit toujours « Conversation vocale indisponible ». Son journal confirme une erreur pendant `listening` dans le dernier bundle ; le défaut ne vient donc pas simplement d'un ancien exécutable.

## Reproduction et cause confirmée

Sur son exécutable de livraison du 6 novembre à 21 h 48 :

- fenêtre visible : vrai ; document WebView2 focalisé : vrai ; fenêtre Windows au premier plan appartenant au processus : vrai ;
- contrôle `is_focused()` de Tauri : **faux** ;
- commande vocale : **`cancelled`**, que le frontend présentait comme une indisponibilité.

Le cache de focus de Tao 0.37.2 combine l'activation et le focus de la fenêtre native. Il peut rester faux alors que le contrôle WebView2 possède le focus clavier. [Reproduction native](before.json). Les tentatives initiales d'activation sur une fenêtre masquée ne sont pas utilisées comme preuve de ce défaut : la reproduction conservée concerne une fenêtre visible et effectivement au premier plan.

## Correction et protections conservées

- Sur Windows, vérifier le HWND de la fenêtre appelante avec [GetForegroundWindow](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getforegroundwindow) et la chaîne de parents [GetAncestor avec GA_ROOT](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getancestor). Le contrôle ne se contente pas du PID : une autre fenêtre Novera ne doit pas autoriser le micro de celle-ci. Refuser un handle absent ou une fenêtre invisible.
- Effectuer ce contrôle avant la capture, après l'enregistrement de l'opération, puis via une surveillance native toutes les 75 ms. Une perte réelle de premier plan arrête le helper ; ce délai d'échantillonnage n'est pas une garantie temps réel du système.
- Ignorer les faux événements natifs de perte de focus quand la même fenêtre racine est encore au premier plan. Fermeture et destruction annulent toujours la session.
- Préserver l'erreur `cancelled` avant d'interpréter la sortie tronquée d'un helper tué. Une annulation normale ne doit pas devenir une erreur de protocole ou de disponibilité.
- Côté interface, arrêter proprement les captures/lectures annulées (`cancelled` ou AbortError), sans toast d'indisponibilité. Les autres erreurs continuent à être signalées. Le repli et les libellés des 104 catalogues sont inchangés.

Aucune autorisation distante élargie, aucun contournement du contrôle de fenêtre et aucune capture en arrière-plan ajoutés. La fonctionnalité Win32 est déclarée explicitement sur la dépendance Windows existante ; les contrôles Cargo restent `--offline --locked`.

## Tests exécutés, dont matériel réel

1. **Vrai micro Windows**, helper isolé : phrase reconnue en français en **12,76 s**, six hypothèses et un résultat final ; zéro ligne JSON invalide. Aucun audio ni texte reconnu conservé. [Diagnostic](direct-microphone.json).
2. Même helper avec le **job Windows et le lecteur Rust de production** : test manuel réussi ; retour `timeout` après une hypothèse, cas valide sans résultat final. Il ne mesure pas la précision de reconnaissance. Ce test est ignoré par défaut et ne peut ouvrir le micro que si on le lance explicitement.
3. **115 tests interface/vocal réussis**, zéro échec. **4 tests natifs réussis**, zéro échec, avec un test manuel ignoré par défaut. Vérification avec de vraies fenêtres Windows cachées : enfant du même parent accepté, autre fenêtre racine et handle nul refusés.
4. TypeScript et ESLint ciblé réussis. Exécutable natif de **test debug** compilé avec les sources corrigées et `--offline --locked`, en **3 min 16 s**. Pas de nouveau paquet Desktop de livraison.
5. Exécutable corrigé lancé avec profil et dossier WebView2 temporaires, indépendants des conversations personnelles : commande de synthèse **`done`**, cinq hypothèses issues du micro réel puis résultat final **`recognized`**, aucune erreur native. Le getter Tauri reste faux ; le nouveau contrôle Windows autorise correctement cette fenêtre au premier plan. [Résultat natif](after.json).
6. La phrase neutre **« Test vocal de Novera »** a été jouée sur le périphérique par défaut. Le mainteneur confirme **« Oui, clairement »** à la question de son audibilité.
7. Deuxième capture du même exécutable, puis minimisation de la fenêtre de test : retour **`cancelled`**, confirmant l'arrêt en arrière-plan. Aucun texte reconnu ni enregistrement conservé.

[Résultats, versions et empreintes des sources et de l'exécutable de test](validation.json).

## Portée et suite

Le problème persistant de focus est reproduit puis corrigé sur un vrai exécutable Windows avec le micro et les haut-parleurs. Cela ne garantit pas l'exactitude de toutes les phrases ni une conversation vocale complète avec le modèle : la reconnaissance/synthèse reste celle de Windows, l'audio natif Omni et les autres adaptateurs natifs restent ouverts.

Le profil de test est resté isolé, et son processus et le serveur de développement sont arrêtés après validation. L'installation personnelle et le précédent binaire de livraison n'ont pas été remplacés. Le mainteneur effectuera sa prochaine compilation Desktop pour y intégrer ce correctif. Les notes et preuves précédentes restent des états historiques, pas des preuves de ce correctif.
