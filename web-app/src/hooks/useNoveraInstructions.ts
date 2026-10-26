import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { backendStorage } from '@/lib/backendStorage'
import i18n from '@/i18n'

export type InstructionCategory = 'text' | 'image' | 'video'
export const defaultNoveraInstructions: Record<InstructionCategory, string> = {
  text: 'Tu es Novera. Réponds dans la langue de l’utilisateur avec précision, clarté et concision. Respecte ses contraintes et donne une réponse directement utile. Vérifie les points essentiels lorsque les outils le permettent ; distingue faits, hypothèses et incertitudes. N’invente jamais de sources, de résultats ni d’actions accomplies. Pose une question seulement si une information indispensable manque.',
  image: 'Respecte fidèlement le sujet, le style, le cadrage et le format demandés. Construis une composition lisible avec un point focal clair, un éclairage cohérent, des couleurs harmonieuses et des détails soignés. Préserve les identités et les éléments de référence. Évite les déformations, les éléments parasites et les ajouts non demandés. Ajoute du texte uniquement sur demande.',
  video: 'Respecte fidèlement le sujet, le style, le cadrage et la durée demandés. Maintiens l’identité des sujets, la géométrie des objets et la cohérence de l’éclairage entre les images. Privilégie des mouvements fluides, une caméra maîtrisée et une progression naturelle de l’action. Évite le scintillement, les déformations et les changements brusques non demandés. Ajoute du texte uniquement sur demande.',
}

/** Instructions only: this store never writes model or generation parameters. */
export const useNoveraInstructions = create<{
  instructions: Partial<Record<InstructionCategory, string>>
  setInstructions: (instructions: Record<InstructionCategory, string>) => void
}>()(
  persist(
    (set) => ({
      instructions: {},
      setInstructions: (instructions) => {
        const defaults = getDefaultNoveraInstructions()
        set({ instructions: Object.fromEntries((['text', 'image', 'video'] as const)
          .filter((category) => instructions[category] !== defaults[category])
          .map((category) => [category, instructions[category]])) })
      },
    }),
    {
      name: 'novera-category-instructions',
      storage: createJSONStorage(() => backendStorage),
      skipHydration: true,
      partialize: ({ instructions }) => ({ instructions }),
      merge: (saved, current) => {
        const values = (saved as { instructions?: Partial<Record<InstructionCategory, unknown>> } | undefined)?.instructions
        return { ...current, instructions: Object.fromEntries(
          (['text', 'image', 'video'] as const).filter((category) => typeof values?.[category] === 'string')
            .map((category) => [category, values![category]])
        ) as Partial<Record<InstructionCategory, string>> }
      },
    }
  )
)

export function getNoveraInstructions(): Record<InstructionCategory, string> {
  const saved = useNoveraInstructions.getState().instructions
  return { ...getDefaultNoveraInstructions(), ...saved }
}

export function getDefaultNoveraInstructions(): Record<InstructionCategory, string> {
  return Object.fromEntries((['text', 'image', 'video'] as const).map((category) => [category,
    i18n.t(`chat:instructions.${category}Default`, { defaultValue: defaultNoveraInstructions[category] })
  ])) as Record<InstructionCategory, string>
}

export function withNoveraInstructions(category: InstructionCategory, prompt: string) {
  const instructions = getNoveraInstructions()[category].trim()
  return instructions ? `${instructions}\n\n${prompt}` : prompt
}
