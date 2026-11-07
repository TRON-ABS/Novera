# Créer une musique ou une vidéo avec Novera

Choisissez d’abord **Musique** ou **Vidéo**, puis décrivez ce que vous souhaitez. Ces exemples sont des textes de départ à adapter, pas des résultats générés. Les fonctions de Novera Web sont encore en préparation.

## Musique : deux textes différents

La **description musicale** indique le style, l’ambiance, les instruments, le tempo et le type de voix. Le champ **Paroles** contient les mots à chanter. Indiquez la langue et la durée dans les réglages disponibles.

Pour un instrumental sans voix, vous pouvez utiliser cette description :

```text
Neoclassical cinematic instrumental, emotional grand piano and warm strings. Tender, hopeful and awe-inspiring mood. Slow tempo. No vocals, no drums.
```

Dans **Paroles**, saisissez :

```text
[Instrumental]
```

Une description organisée en balises est également possible :

```text
[Style: neoclassical, cinematic, emotional piano]
[Mood: tender, hopeful, awe]
[Instrumentation: grand piano, strings, no vocals, no drums]
[Tempo: slow]
```

Ces balises restent du texte descriptif. Elles ne remplacent pas les réglages de durée, de tempo ou de langue et n’imposent pas un résultat garanti.

Pour une chanson accompagnée, essayez :

```text
Chanson pop douce en français. Voix claire, piano et guitare acoustique. Ambiance chaleureuse, tempo lent.
```

Puis ajoutez vos paroles, par exemple :

```text
[Verse]
Le jour se lève et je souris
Une lumière éclaire ma vie

[Chorus]
On avance ensemble vers demain
Un peu de soleil dans nos mains
```

`[Verse]` désigne le couplet et `[Chorus]` le refrain. Pour une création **a cappella**, conservez les paroles et décrivez une « voix seule, sans instruments et sans accompagnement musical ». Ne mettez pas `[Instrumental]` si vous souhaitez des paroles chantées.

Commencez par un extrait court, écoutez-le, puis modifiez une indication à la fois. Si un tempo en BPM est disponible, gardez-le cohérent avec « lent », « modéré » ou « rapide » dans votre description.

## Vidéo : une scène claire

Décrivez **le sujet, son action, le décor, la lumière, le mouvement de caméra et le style visuel**.

```text
Un petit renard marche lentement dans une forêt au lever du soleil. Une brume légère flotte entre les arbres. Lumière dorée et douce. La caméra suit le renard de côté, avec un mouvement lent et stable. Style cinématographique réaliste.
```

Choisissez la durée et le format d’image dans les commandes de Novera. Écrire « 5 secondes » ou « format vertical » dans le texte ne remplace pas ces réglages. Pour débuter, gardez une scène, un sujet principal et un seul mouvement de caméra. Écrivez « caméra fixe » pour éviter un déplacement.

## English quick guide

For music, describe **genre + mood + instruments + tempo + voice**. Keep the actual words in the **Lyrics** field. Use `[Instrumental]` for music without singing; use `[Verse]` and `[Chorus]` for a song. For a cappella, request a solo voice without instruments.

For video, describe **subject + action + setting + lighting + camera movement + visual style**. Choose duration and aspect ratio in Novera’s controls.

```text
A small fox walks slowly through a forest at sunrise. Light mist between the trees, soft golden lighting. Slow, steady side tracking shot. Realistic cinematic style.
```

Les démonstrations publiées doivent préciser le texte effectivement utilisé, le modèle et les réglages. Les essais techniques sont distincts de la validation de la qualité musicale, des paroles chantées ou du mouvement vidéo.
