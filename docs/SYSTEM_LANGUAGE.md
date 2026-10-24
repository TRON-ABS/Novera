# Première langue de Novera

Au premier lancement, lorsqu’aucune langue prise en charge n’est enregistrée, Novera interroge la locale du système via le plugin OS Tauri. En mode navigateur, ou si cette lecture échoue, les langues préférées du navigateur servent de repli. La première langue prise en charge est retenue ; à défaut, l’anglais est utilisé.

Les variantes sont rapprochées des 36 catalogues existants : `fr-CA` vers français, `de-AT` vers allemand, `pt-BR` et `pt-PT` séparément, chinois simplifié/traditionnel selon l’écriture ou la région, `vi-VN` vers le catalogue vietnamien `vn`, `fil-PH` vers tagalog, et `pa-Arab-PK` vers pendjabi occidental.

Le résultat est sauvegardé dans les réglages généraux avant la fin de leur hydratation. La présence de `currentLanguage` constitue le marqueur de première initialisation : les préférences antérieures, y compris l’anglais, sont respectées. Quand l’utilisateur sélectionne une autre langue, cette nouvelle langue remplace la précédente dans la sauvegarde. Les démarrages suivants utilisent ce dernier choix, sans nouvelle sélection par Novera ni remplacement par la langue système. Une sélection manuelle effectuée pendant la détection conserve la priorité.

Un échec de lecture du stockage n’est pas traité comme un premier lancement et ne déclenche aucune réinitialisation. Les autres réglages sont conservés. Le fournisseur de traductions applique la langue hydratée avant le premier affichage et conserve le support droite à gauche existant.

## Validation du 24 octobre 2026

141 tests ciblés réussis ; suite web complète : 4 937 réussis, 2 ignorés. Contrôle TypeScript sans émission réussi. Les scénarios couvrent les variantes, le repli après erreur OS, les préférences existantes, les redémarrages, le changement manuel et la lecture de stockage en échec.

Cette modification est désormais **incluse dans la compilation locale 1.0.0 du 24 octobre 2026**. La suite web a été relancée avant compilation : **4 975 tests réussis, 2 ignorés**, et TypeScript sans émission réussi. Sur un profil natif vierge, le français a été détecté et sauvegardé. Une préférence anglaise injectée dans le stockage isolé est restée anglaise au redémarrage ; cette simulation vérifie la persistance native, sans revendiquer un clic manuel dans l’interface. Aucun profil utilisateur modifié. Preuves : `.build/novera-local-build-2026-10-24_03-26-05/startup-language.json`.
