# docs(site): show beginner music and video prompt examples

New users cannot tell what belongs in a musical description, the Lyrics field, or the video controls. Add an always-visible beginner guide to the existing showcase, keeping its colors and static, script-free delivery. Cover instrumentals, songs with accompaniment and a cappella; show Verse/Chorus lyrics and a video scene template. Include a compact English explanation and a linked repository guide.

Explain that descriptive bracket labels are textual hints and that duration/aspect ratio must be set in Novera controls. Examples are input templates, not claimed generated demonstrations. Web remains explicitly in preparation; no download versions, updater feeds, keys, providers or media binaries change.

Validation: node --test scripts/distribution/__tests__/prepare-pages-site.test.mjs passed all three tests. A locally generated page was inspected in actual Edge; the three musical cards and video instructions are visible and retain the existing theme. Source contracts are dispatched separately. This guide can ship independently of the unfinished Web runtime in #43 and release delivery in #44.
