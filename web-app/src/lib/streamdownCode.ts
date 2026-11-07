import { createCodePlugin } from '@streamdown/code'
import type { CodeHighlighterPlugin } from 'streamdown'

// Streamdown's current plugin contract accepts arbitrary theme strings, while
// the new Shiki plugin also accepts theme objects. Keep our existing bundled
// light/dark pair explicit at the boundary instead of casting either API.
const themes: ['github-light', 'github-dark'] = ['github-light', 'github-dark']
const highlighter = createCodePlugin({ themes })

export const streamdownCode: CodeHighlighterPlugin = {
  ...highlighter,
  getThemes: () => themes,
  supportsLanguage: (language) => highlighter.getSupportedLanguages().some(candidate => candidate === language),
  highlight: ({ code, language }, callback) => {
    const supported = highlighter.getSupportedLanguages().find(candidate => candidate === language)
    return supported ? highlighter.highlight({ code, language: supported, themes }, callback) : null
  },
}
