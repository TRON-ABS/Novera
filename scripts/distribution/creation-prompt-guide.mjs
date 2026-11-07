/** Static, copyable beginner examples; these are input templates, not generated media. */
export function creationPromptGuide(repository) {
  return `<section class="notice creation-guide" aria-labelledby="creation-guide-title">
<h2 id="creation-guide-title">Votre première musique ou vidéo : quoi écrire ?</h2>
<p>Décrivez simplement ce que vous souhaitez. Les exemples ci-dessous sont des textes à adapter, pas des résultats déjà générés. Choisissez d’abord le format Musique ou Vidéo dans Novera. Novera Web reste en préparation.</p>
<h3>Musique : séparez la description et les paroles</h3>
<p><strong>Description musicale :</strong> style + ambiance + instruments + tempo. <strong>Paroles :</strong> le texte à chanter, avec <code>[Verse]</code> pour un couplet et <code>[Chorus]</code> pour un refrain. Les balises de description comme <code>[Mood: …]</code> sont des indications textuelles ; elles ne règlent pas automatiquement les paramètres du modèle.</p>
<div class="cards">
<article class="card"><h3>1 · Instrumental, sans voix</h3><p>Description à copier :</p><pre>Neoclassical cinematic instrumental, emotional grand piano and warm strings. Tender, hopeful and awe-inspiring mood. Slow tempo. No vocals, no drums.</pre><p>Dans Paroles :</p><pre>[Instrumental]</pre></article>
<article class="card"><h3>2 · Chanson avec instruments</h3><p>Description à copier :</p><pre>Chanson pop douce en français. Voix claire, piano et guitare acoustique. Ambiance chaleureuse, tempo lent.</pre><p>Dans Paroles :</p><pre>[Verse]
Le jour se lève et je souris
Une lumière éclaire ma vie

[Chorus]
On avance ensemble vers demain
Un peu de soleil dans nos mains</pre></article>
<article class="card"><h3>3 · A cappella, sans instruments</h3><p>Description à copier :</p><pre>Chant a cappella en français, voix seule et expressive. Ambiance tendre, tempo lent. Aucun instrument, aucun accompagnement musical.</pre><p>Dans Paroles : ajoutez les couplets et le refrain que vous souhaitez entendre.</p></article>
</div>
<p>Choisissez la durée et la langue dans les réglages disponibles. Si vous fixez un tempo en BPM, gardez-le cohérent avec la description. Commencez par un extrait court ; écoutez le résultat puis changez une indication à la fois.</p>
<h3>Vidéo : décrivez une scène précise</h3>
<p><strong>Sujet + action + décor + lumière + caméra + style.</strong> Réglez aussi la durée et le format d’image dans Novera : écrire « 5 secondes » dans le texte ne remplace pas le réglage de durée.</p>
<pre>Un petit renard marche lentement dans une forêt au lever du soleil. Une brume légère flotte entre les arbres. Lumière dorée et douce. La caméra suit le renard de côté, avec un mouvement lent et stable. Style cinématographique réaliste.</pre>
<p>Pour commencer : une scène, un sujet principal et un mouvement de caméra. Ajoutez ensuite les détails. Précisez « caméra fixe » si vous ne souhaitez pas de mouvement.</p>
<details lang="en"><summary>English · Quick guide</summary><p><strong>Music:</strong> describe the genre, mood, instruments and tempo. Put the actual words to sing in the Lyrics field, with <code>[Verse]</code> and <code>[Chorus]</code>. Use <code>[Instrumental]</code> for music without singing. For a cappella, request a solo voice without instruments.</p><p><strong>Video:</strong> describe the subject, action, setting, lighting, camera movement and visual style. Set duration and aspect ratio in Novera’s controls.</p><pre>A small fox walks slowly through a forest at sunrise. Light mist between the trees, soft golden lighting. Slow, steady side tracking shot. Realistic cinematic style.</pre></details>
<p><a href="${repository}/blob/main/docs/CREATION_PROMPT_GUIDE.md">Lire le guide complet · descriptions, paroles et exemples</a></p>
</section>`
}
