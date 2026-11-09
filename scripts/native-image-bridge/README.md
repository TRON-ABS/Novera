# Novera Web 1.0.1 · passerelle image native locale

Cette option fait calculer les images Web par le moteur CUDA de cet ordinateur. Le calcul WebGPU autonome reste disponible séparément. Aucun modèle n’est envoyé au serveur Web et aucun service cloud n’est utilisé par la passerelle.

Validation locale sur RTX 5070 Laptop / Edge : **30,5 s dans la conversation Web**, sauvegarde comprise, pour FLUX.2 Klein Q4, **2048 × 880, 4 étapes, graine 42, puis RealESRGAN ×2 → 4096 × 1760**. Deux autres essais HTTP avec le moteur reconstruit ont pris **29,28 s** et **29,82 s**. Ces essais courts ne garantissent pas le même temps pour tous les appareils ou toutes les demandes. La version reste **1.0.1** ; aucune publication n’est incluse.

## Moteur

Le moteur installé testé ne reconnaissait pas les 12 canaux d’entrée de `RealESRGAN_x2plus.pth`. Il pouvait retourner un code de succès en enregistrant seulement l’image de base. La correction réutilise la topologie officielle déjà vérifiée côté Web : pixel unshuffle ×2 puis les deux blocs appris d’agrandissement. Les poids, la résolution et les étapes ne sont pas réduits. La passerelle refuse un résultat dont les dimensions ne correspondent pas à la demande.

Le helper Windows reconstruit uniquement le module de l’agrandisseur et relie les objets du cache natif de la révision épinglée. Il réutilise les plugins CUDA existants de la même révision. Il écrit dans un répertoire séparé et ne remplace pas les fichiers de Novera Desktop.

Depuis la racine du dépôt, avec Python 3.11+ et MSVC x64 Build Tools :

```powershell
powershell -NoProfile -File scripts/native-image-bridge/build-runtime.ps1 `
  -NativeBuild .build/cuda134-image-2026-10-26/build-cuda `
  -Source .build/cuda134-image-2026-10-26/source
```

Le cache doit contenir les objets Release du moteur `e41fbcf455e0fbb45e08bd535b00d6cba865e921` et GGML `a5915eb0e47adef21c3f25b889a008925ea838c2`. Le helper vérifie les révisions et les empreintes du patch et du fichier source. Le résultat et son manifeste sont placés dans `.build/native-image-bridge/runtime`. Les bibliothèques et licences originales restent dans l’installation Desktop. Cette procédure a été exécutée et testée avec le backend CUDA Windows ; les autres plateformes ne sont pas certifiées.

## Configuration et lancement

Pour essayer les modifications localement, construire le Web puis lancer son aperçu dans un premier terminal. Le mode passerelle peut fonctionner sans activer le moteur image WebGPU :

```powershell
corepack yarn build:web:browser
corepack yarn workspace @janhq/web-app exec vite preview --host 127.0.0.1 --port 5197
```

Ouvrir `http://127.0.0.1:5197`, puis lancer la passerelle dans un second terminal.

Créer un fichier JSON local à partir de `config.example.json`. Renseigner les chemins du moteur reconstruit, des trois modèles Desktop et de l’agrandisseur officiel. `libraryDirectory` désigne le répertoire CUDA de l’installation Desktop ; il est utilisé uniquement par le processus enfant. Le manifeste de compilation du moteur est vérifié avant le lancement du service.

```powershell
powershell -NoProfile -File scripts/native-image-bridge/start.ps1 `
  -Config C:/chemin/native-image-config.json `
  -WebOrigin http://127.0.0.1:5197
```

Utiliser l’origine exacte du site Novera, sans chemin ni barre oblique finale. Le service écoute uniquement sur `127.0.0.1`, sur un port libre. Il crée un fichier de connexion dans `%LOCALAPPDATA%/Novera/native-image-bridge/connection.json`. Il reste actif dans ce terminal ; Ctrl+C l’arrête et annule son éventuelle création.

Dans Novera Web : **Réglages de création → Moteur natif local → Fichier de connexion locale**. Importer ce fichier. Le modèle « FLUX.2 Klein 4B · Moteur natif local » est sélectionné. Choisir la résolution et, si nécessaire, Real-ESRGAN ×2. La connexion n’est pas enregistrée dans le navigateur ; après rechargement ou redémarrage du service, importer le nouveau fichier.

Le fichier de connexion contient un jeton de session : le garder sur cet ordinateur. Le service n’accepte que l’origine configurée et ce jeton. L’API n’accepte ni chemins de modèles, ni exécutable, ni commande, ni fichier à importer. Une seule création native s’exécute à la fois. L’arrêt vise uniquement le processus appartenant à cette création, y compris si la réponse initiale a été interrompue.

Les fichiers temporaires du service sont limités aux 16 derniers résultats de sa session, puis supprimés à son arrêt. Les images terminées sont conservées dans le stockage média existant du navigateur et peuvent être téléchargées.

## Vérifications

```powershell
python -m unittest discover -s scripts/native-image-bridge -p 'test_*.py'
corepack yarn workspace @janhq/web-app exec vitest run src/services/browser-preview/native-image-bridge.test.ts src/services/browser-preview/native-image-stream.test.ts
```

Les tests Python utilisent un processus de simulation clairement séparé des benchmarks réels. Ils vérifient notamment l’origine, le Host, l’authentification, les arguments refusés, la concurrence, l’annulation et le rejet d’un faux succès ×2. Le protocole prévoit un identifiant créé par le client pour annuler aussi une création dont la réponse POST est perdue.

Preuves : `deliverables/native-image-web-2026-11-08/VALIDATION.md`. Le test de l’interface a été fait sur une origine HTTP loopback locale. La version du site public, HTTPS, sa distribution et son éventuelle autorisation d’accès au réseau local restent à valider lors d’un déploiement.
