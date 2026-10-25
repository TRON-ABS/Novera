# Langues d’interface Novera

État du **25 octobre 2026** : **36 locales sélectionnables**, chacune à **1 516/1 516 clés anglaises (100 %)** dans **14 espaces de noms**. Cette mesure porte sur la présence des clés, pas sur la qualité linguistique ; la relecture native reste nécessaire. Les langues comprises et produites par l’IA dépendent du modèle choisi.

## Règle pour tout texte visible

Tout texte d’interface ajouté **ou modifié** doit être traduit dans les 36 locales dans la même modification : boutons, infobulles, menus, aides, confirmations, succès et erreurs. Le repli anglais ne remplace pas une traduction. Préserver variables, littéraux de code et identifiants techniques ; actualiser [language-support.json](language-support.json) puis exécuter depuis la racine :

```sh
python scripts/check-novera-locales.py
```

Le contrôle couvre JSON, espaces de noms, clés complètes/non vides, variables, littéraux et enregistrement des locales. Les ajouts récents sont publiés dans les sources mais n’ont pas encore été recompilés dans le dernier exécutable ; [état du build](../TABLEAU_DE_BORD_NOVERA.md).

## Compléments récents

Le wu a reçu 757 traductions manquantes en conservant les 756 entrées existantes. Les 16 catalogues hérités encore incomplets ont reçu 9 219 traductions dans 176 fichiers, avec autorisation explicite d’utiliser Google Translate, puis 98 corrections ciblées. Deux anciens messages italien et polonais ont été corrigés pour leurs variables. Le libellé plat obsolète `common.preview` a été archivé avant remplacement par les messages imbriqués ; les autres anciennes clés supplémentaires ont été conservées.

Ces compléments portaient la base à 1 513 clés ; les trois nouveaux textes DSpark et suivi des erreurs indisponible ajoutent 108 traductions et portent chaque catalogue à **1 516**. Rapports vérifiables : [wu](../deliverables/wuu-completion-2026-10-25/report.md), [16 catalogues](../deliverables/locale-completion-2026-10-25/report.md). Les anciens comptes dans ces rapports décrivent leur étape historique.

<a id="system-language"></a>

## Langue système et direction

Sans préférence sauvegardée, le premier démarrage choisit la langue système prise en charge puis l’enregistre. Un changement manuel remplace ce choix pour les démarrages suivants. La correspondance linguistique appartient à l’interface ; la lecture de locale native au service de plateforme. Le réglage sauvegardé reste prioritaire.

Arabe, arabe égyptien, ourdou, pendjabi occidental et persan iranien utilisent une interface droite à gauche, synchronisée avec les métadonnées du document et les menus/dialogues Radix. URL, courriels et nombres techniques restent gauche à droite ; les champs de texte libre ont une direction automatique.

## Complete selector inventory

| Locale | Language | Native selector label | Direction | English keys covered | Source |
| --- | --- | --- | --- | ---: | --- |
| `en` | English | English | LTR | 1516 / 1,516 | Inherited from Jan |
| `bn` | Bengali | বাংলা | LTR | 1516 / 1,516 | [Contribution 9381](https://github.com/TRON-ABS/Novera/commit/5affd45c30b10057f5f7751f5550ce148a7adcfc) |
| `ar` | Modern Standard Arabic | العربية | RTL | 1516 / 1,516 | [Contribution 9382](https://github.com/TRON-ABS/Novera/commit/a4bca7f321e6ea296de0e9d4fa45923e6828b689) |
| `ur` | Urdu | اردو | RTL | 1516 / 1,516 | [Contribution 9397](https://github.com/TRON-ABS/Novera/commit/8aefadf68b30506d7327e55a978c85d68607d762) |
| `pcm` | Nigerian Pidgin | Naijíriá Píjin | LTR | 1516 / 1,516 | [Contribution 9398](https://github.com/TRON-ABS/Novera/commit/9c6f6ae3caf4c9dd85f715ca38d44157bca2a245) |
| `arz` | Egyptian Arabic | مصري | RTL | 1516 / 1,516 | [Contribution 9400](https://github.com/TRON-ABS/Novera/commit/482d429940d2cbdb68d5a0b3c7d685667c73533b) |
| `mr` | Marathi | मराठी | LTR | 1516 / 1,516 | [Contribution 9401](https://github.com/TRON-ABS/Novera/commit/5d1787d233aa8edb6afed65985749fd970ea5dba) |
| `te` | Telugu | తెలుగు | LTR | 1516 / 1,516 | [Contribution 9402](https://github.com/TRON-ABS/Novera/commit/039bf57e59537eaa043ab22ddc4a75e7a5567f8b) |
| `ta` | Tamil | தமிழ் | LTR | 1516 / 1,516 | [Contribution 9403](https://github.com/TRON-ABS/Novera/commit/df665fdf9b70d06b9f10203d53eb5167bbd21e03) |
| `sw` | Swahili | Kiswahili | LTR | 1516 / 1,516 | [Contribution 9404](https://github.com/TRON-ABS/Novera/commit/fc7127b9e45db9bd2c150b448c15edfe23f94123) |
| `ha` | Hausa | Hausa | LTR | 1516 / 1,516 | [Contribution 9406](https://github.com/TRON-ABS/Novera/commit/e4259f6a100b26f71fa2e775fe43c054671149d8) |
| `pnb` | Western Punjabi (Shahmukhi) | پنجابی (شاہ مکھی) | RTL | 1516 / 1,516 | [Contribution 9408](https://github.com/TRON-ABS/Novera/commit/cef56cd697fe9edfbcc1441ae97b69f03f0ea7a6) |
| `tl` | Tagalog | Tagalog | LTR | 1516 / 1,516 | [Contribution 9409](https://github.com/TRON-ABS/Novera/commit/9a5c67ec3631d45bf9d093523c46c239ae6f3ea7) |
| `pt-PT` | Portuguese (Portugal) | Português (Portugal) | LTR | 1516 / 1,516 | [Contribution 9410](https://github.com/TRON-ABS/Novera/commit/feebfd09e9790284a48c4412eec8bd0a1c725d48) |
| `yue` | Cantonese | 粵語 | LTR | 1516 / 1,516 | [Contribution 9411](https://github.com/TRON-ABS/Novera/commit/c08f3313b074d6449fb4d08f9d6a7a1a10973723) |
| `wuu` | Wu (Shanghainese) | 吴语（上海话） | LTR | 1516 / 1,516 | [Contribution 9412](https://github.com/TRON-ABS/Novera/commit/cea04c0e641ce91656c02ca79d11db318508afa7), completed on 25 October 2026 |
| `fa-IR` | Iranian Persian | فارسی (ایران) | RTL | 1516 / 1,516 | [Contribution 9413](https://github.com/TRON-ABS/Novera/commit/7390c493df3373aae20a3598d6942fc59db71e3c) |
| `am` | Amharic | አማርኛ | LTR | 1516 / 1,516 | [Contribution 9414](https://github.com/TRON-ABS/Novera/commit/5834c83c2c0134af807454ba5f9d155dd0c0cfae) |
| `th` | Thai | ไทย | LTR | 1516 / 1,516 | [Contribution 9415](https://github.com/TRON-ABS/Novera/commit/9b9a4cab272ad9b96ae52a0c9c33f3d6ca891e70) |
| `jv` | Javanese | Basa Jawa | LTR | 1516 / 1,516 | [Contribution 9416](https://github.com/TRON-ABS/Novera/commit/ea9a66394fcbee0da167ab8776fbb857285aa865) |
| `es` | Spanish | Español | LTR | 1516 / 1,516 | Inherited from Jan |
| `fr` | French | Français | LTR | 1516 / 1,516 | Inherited from Jan |
| `it` | Italian | Italiano | LTR | 1516 / 1,516 | Inherited from Jan |
| `hi` | Hindi | हिंदी | LTR | 1516 / 1,516 | Inherited from Jan |
| `id` | Indonesian | Bahasa | LTR | 1516 / 1,516 | Inherited from Jan |
| `pl` | Polish | Polski | LTR | 1516 / 1,516 | Inherited from Jan |
| `vn` | Vietnamese | Tiếng Việt | LTR | 1516 / 1,516 | Inherited from Jan |
| `zh-CN` | Chinese (Simplified) | 简体中文 | LTR | 1516 / 1,516 | Inherited from Jan |
| `zh-TW` | Chinese (Traditional) | 繁體中文 | LTR | 1516 / 1,516 | Inherited from Jan |
| `de-DE` | German | Deutsch | LTR | 1516 / 1,516 | Inherited from Jan |
| `cs` | Czech | Čeština | LTR | 1516 / 1,516 | Inherited from Jan |
| `pt-BR` | Portuguese (Brazil) | Português (Brasil) | LTR | 1516 / 1,516 | Inherited from Jan |
| `ko` | Korean | 한국어 | LTR | 1516 / 1,516 | Inherited from Jan |
| `ja` | Japanese | 日本語 | LTR | 1516 / 1,516 | Inherited from Jan |
| `ru` | Russian | Русский | LTR | 1516 / 1,516 | Inherited from Jan |
| `ca` | Catalan | Català | LTR | 1516 / 1,516 | Inherited from Jan |

<a id="roadmap-100"></a>

## Feuille de route historique des 100 langues

Le tableau de planification ci-dessous est conservé intégralement. Ses estimations de locuteurs mélangent les relevés 2025/2026 et ne constituent ni un classement officiel actualisé ni 100 langues prises en charge. Les 36 locales effectives sont celles de l’inventaire ci-dessus. Portugal et Brésil ont des catalogues distincts mais ne comptent pas deux langues dans ce classement.

Les statuts des PR externes correspondent au relevé historique sur Jan `44aee093ae5a974c31ec43d24ceca163c0e59c14`, sans nouvelle vérification le 25 octobre. Les contributions Novera sont intégrées. Avant toute nouvelle traduction, vérifier les contributions existantes ; une recherche par titre ne garantit pas leur absence.

| Rang | Langue | Locuteurs (millions) | Année | État | À faire, ordre | PR |
| ---: | --- | ---: | ---: | --- | ---: | --- |
| 1 | Anglais | 1 493 | 2026 | Disponible | — | — |
| 2 | Mandarin / chinois standard écrit | 1 183 | 2026 | Disponible | — | — |
| 3 | Hindi | 611 | 2026 | Disponible | — | — |
| 4 | Espagnol | 561 | 2026 | Disponible | — | — |
| 5 | Arabe standard moderne | 335 | 2026 | Intégrée dans Novera | — | [#9382](https://github.com/janhq/jan/pull/9382) |
| 6 | Français | 334 | 2026 | Disponible | — | — |
| 7 | Bengali | 274 | 2026 | Intégrée dans Novera | — | [#9381](https://github.com/janhq/jan/pull/9381) |
| 8 | Portugais | 269 | 2026 | Disponible (Brésil) ; Portugal intégré dans Novera | — | [#9410 — Portugal](https://github.com/janhq/jan/pull/9410) |
| 9 | Indonésien | 255 | 2026 | Disponible | — | — |
| 10 | Ourdou | 246 | 2026 | Intégrée dans Novera | — | [#9397](https://github.com/janhq/jan/pull/9397) |
| 11 | Russe | 210 | 2026 | Disponible | — | — |
| 12 | Allemand | 133 | 2026 | Disponible | — | — |
| 13 | Japonais | 126 | 2026 | Disponible | — | — |
| 14 | Pidgin nigérian | 121 | 2026 | Intégrée dans Novera | — | [#9398](https://github.com/janhq/jan/pull/9398) |
| 15 | Arabe égyptien | 118 | 2026 | Intégrée dans Novera | — | [#9400](https://github.com/janhq/jan/pull/9400) |
| 16 | Marathi | 99 | 2026 | Intégrée dans Novera | — | [#9401](https://github.com/janhq/jan/pull/9401) |
| 17 | Vietnamien | 97 | 2026 | Disponible | — | — |
| 18 | Télougou | 96 | 2026 | Intégrée dans Novera | — | [#9402](https://github.com/janhq/jan/pull/9402) |
| 19 | Swahili | 95 | 2026 | Intégrée dans Novera | — | [#9404](https://github.com/janhq/jan/pull/9404) |
| 20 | Haoussa | 94 | 2026 | Intégrée dans Novera | — | [#9406](https://github.com/janhq/jan/pull/9406) |
| 21 | Turc | 94 | 2026 | PR tierces — en attente de fusion | — | [#8939](https://github.com/janhq/jan/pull/8939), [#9000](https://github.com/janhq/jan/pull/9000) |
| 22 | Pendjabi occidental | 90 | 2026 | Intégrée dans Novera | — | [#9408](https://github.com/janhq/jan/pull/9408) |
| 23 | Tagalog | 87 | 2026 | Intégrée dans Novera | — | [#9409](https://github.com/janhq/jan/pull/9409) |
| 24 | Tamoul | 86 | 2026 | Intégrée dans Novera | — | [#9403](https://github.com/janhq/jan/pull/9403) |
| 25 | Yue / cantonais | 86 | 2026 | Intégrée dans Novera | — | [#9411](https://github.com/janhq/jan/pull/9411) |
| 26 | Wu / shanghaïen | 83 | 2026 | Intégrée dans Novera — 1 516/1 516 clés ; relecture requise | — | [#9412](https://github.com/janhq/jan/pull/9412) |
| 27 | Persan iranien | 82 | 2026 | Intégrée dans Novera | — | [#9413](https://github.com/janhq/jan/pull/9413) |
| 28 | Coréen | 82 | 2026 | Disponible | — | — |
| 29 | Amharique | 78 | 2026 | Intégrée dans Novera | — | [#9414](https://github.com/janhq/jan/pull/9414) |
| 30 | Thaï | 71 | 2026 | Intégrée dans Novera | — | [#9415](https://github.com/janhq/jan/pull/9415) |
| 31 | Javanais | 69 | 2026 | Intégrée dans Novera | — | [#9416](https://github.com/janhq/jan/pull/9416) |
| 32 | Italien | 66 | 2026 | Disponible | — | — |
| 33 | Gujarati | 62 | 2026 | À faire | 1 | — |
| 34 | Kannada | 59 | 2026 | À faire | 2 | — |
| 35 | Arabe levantin | 58 | 2026 | À faire | 3 | — |
| 36 | Arabe soudanais | 54 | 2026 | À faire | 4 | — |
| 37 | Yoruba | 53 | 2026 | À faire | 5 | — |
| 38 | Bhojpuri | 53 | 2026 | À faire | 6 | — |
| 39* | Jin / jinyu | 48,0 | 2025 | À faire | 7 | — |
| 40* | Min nan | 45,8 | 2025 | À faire | 8 | — |
| 41* | Polonais | 45,3 | 2025 | Disponible | — | — |
| 42* | Birman | 44,4 | 2025 | À faire | 9 | — |
| 43* | Arabe algérien | 41,6 | 2025 | À faire | 10 | — |
| 44* | Hakka | 40,7 | 2025 | À faire | 11 | — |
| 45* | Lingala | 40,6 | 2025 | À faire | 12 | — |
| 46* | Arabe marocain | 40,2 | 2025 | À faire | 13 | — |
| 47* | Odia | 39,5 | 2025 | À faire | 14 | — |
| 48* | Ukrainien | 39,0 | 2025 | À faire | 15 | — |
| 49* | Xiang | 38,2 | 2025 | À faire | 16 | — |
| 50* | Malayalam | 38,2 | 2025 | À faire | 17 | — |
| 51* | Sindhi | 36,9 | 2025 | À faire | 18 | — |
| 52* | Pendjabi oriental | 36,5 | 2025 | À faire | 19 | — |
| 53* | Soundanais | 35,5 | 2025 | À faire | 20 | — |
| 54* | Igbo | 33,7 | 2025 | À faire | 21 | — |
| 55* | Dari | 33,4 | 2025 | À faire | 22 | — |
| 56* | Népalais | 33,1 | 2025 | À faire | 23 | — |
| 57* | Malais | 29,5 | 2025 | À faire | 24 | — |
| 58* | Ouzbek du Nord | 29,4 | 2025 | À faire | 25 | — |
| 59* | Zoulou | 27,8 | 2025 | À faire | 26 | — |
| 60* | Arabe saïdi | 27,3 | 2025 | À faire | 27 | — |
| 61* | Pachto du Nord | 27,2 | 2025 | À faire | 28 | — |
| 62* | Oromo du Centre-Ouest | 27,0 | 2025 | À faire | 29 | — |
| 63* | Saraiki | 25,6 | 2025 | À faire | 30 | — |
| 64* | Néerlandais | 25,4 | 2025 | À faire | 31 | — |
| 65* | Somali | 24,7 | 2025 | À faire | 32 | — |
| 66* | Roumain | 23,7 | 2025 | À faire | 33 | — |
| 67* | Assamais | 23,6 | 2025 | À faire | 34 | — |
| 68* | Gan | 22,6 | 2025 | À faire | 35 | — |
| 69* | Pachto du Sud | 21,7 | 2025 | À faire | 36 | — |
| 70* | Cebuano | 21,4 | 2025 | À faire | 37 | — |
| 71* | Kazakh | 21,4 | 2025 | À faire | 38 | — |
| 72* | Magahi | 21,0 | 2025 | À faire | 39 | — |
| 73* | Arabe najdi | 20,9 | 2025 | À faire | 40 | — |
| 74* | Cingalais | 20,2 | 2025 | À faire | 41 | — |
| 75* | Arabe mésopotamien | 20,1 | 2025 | À faire | 42 | — |
| 76* | Xhosa | 19,2 | 2025 | À faire | 43 | — |
| 77* | Khmer | 19,0 | 2025 | À faire | 44 | — |
| 78* | Afrikaans | 18,1 | 2025 | À faire | 45 | — |
| 79* | Peul du Nigéria | 18,0 | 2025 | À faire | 46 | — |
| 80* | Maïthili | 17,6 | 2025 | À faire | 47 | — |
| 81* | Wolof | 17,3 | 2025 | À faire | 48 | — |
| 82* | Kurde du Nord (kurmandji) | 17,2 | 2025 | À faire | 49 | — |
| 83* | Chhattisgarhi | 16,3 | 2025 | À faire | 50 | — |
| 84* | Kinyarwanda | 15,3 | 2025 | À faire | 51 | — |
| 85* | Thaï du Nord-Est (isan) | 15,1 | 2025 | À faire | 52 | — |
| 86* | Chichewa | 14,5 | 2025 | À faire | 53 | — |
| 87* | Bambara | 14,4 | 2025 | À faire | 54 | — |
| 88* | Shona | 14,1 | 2025 | À faire | 55 | — |
| 89* | Azéri du Sud | 13,8 | 2025 | À faire | 56 | — |
| 90* | Tswana | 13,7 | 2025 | À faire | 57 | — |
| 91* | Sotho du Nord | 13,7 | 2025 | À faire | 58 | — |
| 92* | Bavarois | 13,7 | 2025 | À faire | 59 | — |
| 93* | Créole haïtien | 13,7 | 2025 | À faire | 60 | — |
| 94* | Ouïghour | 13,6 | 2025 | À faire | 61 | — |
| 95* | Sotho du Sud | 13,5 | 2025 | À faire | 62 | — |
| 96* | Grec | 13,3 | 2025 | À faire | 63 | — |
| 97* | Suédois | 13,3 | 2025 | PR tierce — en attente de fusion | — | [#8829](https://github.com/janhq/jan/pull/8829) |
| 98* | Chittagonien | 13,0 | 2025 | À faire | 64 | — |
| 99* | Kirundi | 12,9 | 2025 | À faire | 65 | — |
| 100* | Dioula | 12,8 | 2025 | À faire | 66 | — |

Sources : positions 1–38, [tableau 2026 attribué à Ethnologue](https://en.wikipedia.org/wiki/List_of_languages_by_total_number_of_speakers) ; positions 39–100*, [compilation communautaire 2025](https://www.jetpunk.com/user-quizzes/2026529/top-200-languages-ethnologue-2025). **Les positions marquées * sont provisoires, à confirmer ; ce tableau mélange deux années et ne constitue pas un top 100 officiel 2026.** Les variétés arabes et chinoises sont distinguées ; les deux écritures chinoises de Jan comptent ensemble ici.
