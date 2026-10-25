# Dépendances de Novera — inventaire et versions

> Inventaire historique du 24 octobre 2026 : le site Jan et ses dépendances ont été retirés le 25 octobre. Les liens vers ses manifestes et verrous désignent la version Git antérieure au nettoyage ; les totaux ci-dessous restent ceux du relevé historique. Voir [le nettoyage](JAN_CLEANUP.md).

Relevé des sources locales du **24 octobre 2026**, version applicative **1.0.0**. Les noms techniques hérités (`@janhq/*`, `jan-cli`, etc.) sont reproduits tels qu’ils existent dans les manifestes.

## Lecture des versions

- **Déclarée** : contrainte du manifeste (`^`, `~`, `>=`, Git…), pas nécessairement une version exacte.
- **Verrouillée** : version présente dans un fichier de verrouillage. Les listes regroupent tous les verrous inventoriés ; elles peuvent donc contenir plusieurs versions pour le même nom.
- Les dépendances internes au dépôt sont séparées des bibliothèques externes.
- L’inventaire inclut développement, tests, documentation, CLI et plateformes optionnelles. Il ne représente pas les bibliothèques réellement chargées par le seul exécutable Windows. Aucun registre distant n’a été interrogé : ce ne sont pas des recommandations de mise à jour.

## Totaux

| Périmètre | Nombre |
| --- | ---: |
| Manifestes JavaScript / TypeScript examinés | 21 |
| Dépendances externes directes JS/TS distinctes | 189 |
| Manifestes Rust examinés | 10 |
| Dépendances externes directes Rust distinctes | 112 |
| Total des dépendances externes directes JS/TS + Rust | 301 |
| Couples JS/TS nom + version dans tous les verrous Yarn inventoriés | 2938 |
| Triplets Rust nom + version + origine dans tous les verrous Cargo inventoriés | 1178 |

Les dépendances directes sont également présentes dans les verrous : ces lignes ne doivent pas être additionnées entre elles. Les mêmes bibliothèques peuvent apparaître dans plusieurs composants ou verrous. Le comptage précédent d’environ 2 900 entrées portait sur le verrou Yarn racine et le verrou Cargo principal ; les annexes ci-dessous incluent aussi les verrous des outils et composants séparés.

## Fichiers de verrouillage couverts

| Fichier | Entrées externes distinctes dans ce fichier |
| --- | ---: |
| [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) | 1290 |
| [e2e/yarn.lock](../e2e/yarn.lock) | 472 |
| [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) | 965 |
| [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) | 675 |
| [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock) | 409 |
| [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) | 482 |
| [src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) | 450 |
| [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) | 124 |
| [src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) | 194 |
| [yarn.lock](../yarn.lock) | 1936 |

Le fichier binaire `docs/bun.lockb` et le verrou alternatif `docs/bun.lock` ne sont pas analysés ici ; la documentation est couverte par `docs/yarn.lock`. Les verrous décrivent aussi des paquets optionnels ou propres à d’autres plateformes.

## Dépendances externes directes JavaScript / TypeScript

| Bibliothèque | Versions déclarées | Versions présentes dans les verrous Yarn | Usage | Manifestes |
| --- | --- | --- | --- | --- |
| `@ai-sdk/anthropic` | `^3.0.0` | `3.0.77` | application | [web-app/package.json](../web-app/package.json) |
| `@ai-sdk/google` | `^3.0.0` | `3.0.73` | application | [web-app/package.json](../web-app/package.json) |
| `@ai-sdk/mistral` | `^3.0.0` | `3.0.37` | application | [web-app/package.json](../web-app/package.json) |
| `@ai-sdk/openai` | `^3.0.0` | `3.0.63` | application | [web-app/package.json](../web-app/package.json) |
| `@ai-sdk/openai-compatible` | `^2.0.0` | `2.0.47` | application | [web-app/package.json](../web-app/package.json) |
| `@ai-sdk/react` | `^3.0.0` | `3.0.184` | application | [web-app/package.json](../web-app/package.json) |
| `@ai-sdk/xai` | `^3.0.0` | `3.0.90` | application | [web-app/package.json](../web-app/package.json) |
| `@code-hike/mdx` | `^0.9.0` | `0.9.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `@dnd-kit/core` | `6.3.1` | `6.3.1` | application | [web-app/package.json](../web-app/package.json) |
| `@dnd-kit/modifiers` | `9.0.0` | `9.0.0` | application | [web-app/package.json](../web-app/package.json) |
| `@dnd-kit/sortable` | `10.0.0` | `10.0.0` | application | [web-app/package.json](../web-app/package.json) |
| `@eslint/js` | `8.57.0` | `8.57.0`<br>`8.57.1`<br>`9.25.1` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@janhq/interfaces` | `0.0.2` | `0.0.2` | application | [web-app/package.json](../web-app/package.json) |
| `@next/third-parties` | `^14.1.4` | `14.2.32` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `@npmcli/arborist` | `^7.1.0` | `7.5.4` | développement/test | [core/package.json](../core/package.json) |
| `@radix-ui/react-accordion` | `1.2.11` | `1.2.11`<br>`1.2.12` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-avatar` | `1.1.10` | `1.1.10`<br>`1.1.11` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-collapsible` | `^1.1.12` | `1.1.11`<br>`1.1.12` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-dialog` | `^1.0.5`<br>`^1.1.15` | `1.1.15` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-direction` | `1.1.1` | `1.1.1` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-dropdown-menu` | `^2.1.16` | `2.1.16` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-hover-card` | `^1.1.15` | `1.1.15` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-icons` | `^1.3.0` | `1.3.2` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `@radix-ui/react-popover` | `1.1.14` | `1.1.14`<br>`1.1.15` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-progress` | `1.1.4` | `1.1.4`<br>`1.1.7` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-radio-group` | `^1.3.8` | `1.3.8` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-separator` | `^1.1.8` | `1.1.7`<br>`1.1.8` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-slider` | `^1.3.6` | `1.3.6` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-slot` | `^1.2.4` | `1.2.0`<br>`1.2.3`<br>`1.2.4` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-switch` | `1.2.2` | `1.2.2`<br>`1.2.6` | application | [web-app/package.json](../web-app/package.json) |
| `@radix-ui/react-tooltip` | `^1.0.7`<br>`^1.2.8` | `1.2.8` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `@rollup/plugin-typescript` | `^12.0.0` | `12.1.4` | développement/test | [src-tauri/plugins/tauri-plugin-agent-tools/package.json](../src-tauri/plugins/tauri-plugin-agent-tools/package.json)<br>[src-tauri/plugins/tauri-plugin-hardware/package.json](../src-tauri/plugins/tauri-plugin-hardware/package.json)<br>[src-tauri/plugins/tauri-plugin-llamacpp/package.json](../src-tauri/plugins/tauri-plugin-llamacpp/package.json)<br>[src-tauri/plugins/tauri-plugin-mlx/package.json](../src-tauri/plugins/tauri-plugin-mlx/package.json)<br>[src-tauri/plugins/tauri-plugin-rag/package.json](../src-tauri/plugins/tauri-plugin-rag/package.json)<br>[src-tauri/plugins/tauri-plugin-vector-db/package.json](../src-tauri/plugins/tauri-plugin-vector-db/package.json)<br>[src-tauri/plugins/tauri-plugin-websearch/package.json](../src-tauri/plugins/tauri-plugin-websearch/package.json) |
| `@scalar/api-reference-react` | `^0.1.31` | `0.1.98` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `@streamdown/cjk` | `^1.0.1` | `1.0.2` | application | [web-app/package.json](../web-app/package.json) |
| `@streamdown/code` | `^1.0.1` | `1.0.3` | application | [web-app/package.json](../web-app/package.json) |
| `@streamdown/math` | `^1.0.1` | `1.0.2` | application | [web-app/package.json](../web-app/package.json) |
| `@streamdown/mermaid` | `^1.0.1` | `1.0.2` | application | [web-app/package.json](../web-app/package.json) |
| `@tabler/icons-react` | `3.34.0` | `3.34.0` | application | [web-app/package.json](../web-app/package.json) |
| `@tailwindcss/vite` | `4.1.4` | `4.1.4` | application | [web-app/package.json](../web-app/package.json) |
| `@tanstack/react-router` | `^1.121.34` | `1.139.12` | application | [web-app/package.json](../web-app/package.json) |
| `@tanstack/react-router-devtools` | `1.121.34` | `1.121.34` | application | [web-app/package.json](../web-app/package.json) |
| `@tanstack/react-virtual` | `3.13.12` | `3.13.12` | application | [web-app/package.json](../web-app/package.json) |
| `@tanstack/router-plugin` | `1.121.34` | `1.121.34` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@tauri-apps/api` | `2.8.0`<br>`>=2.0.0-beta.6` | `2.11.1`<br>`2.5.0`<br>`2.8.0` | application | [extensions/download-extension/package.json](../extensions/download-extension/package.json)<br>[extensions/llamacpp-extension/package.json](../extensions/llamacpp-extension/package.json)<br>[extensions/mlx-extension/package.json](../extensions/mlx-extension/package.json)<br>[src-tauri/plugins/tauri-plugin-agent-tools/package.json](../src-tauri/plugins/tauri-plugin-agent-tools/package.json)<br>[src-tauri/plugins/tauri-plugin-hardware/package.json](../src-tauri/plugins/tauri-plugin-hardware/package.json)<br>[src-tauri/plugins/tauri-plugin-llamacpp/package.json](../src-tauri/plugins/tauri-plugin-llamacpp/package.json)<br>[src-tauri/plugins/tauri-plugin-mlx/package.json](../src-tauri/plugins/tauri-plugin-mlx/package.json)<br>[src-tauri/plugins/tauri-plugin-rag/package.json](../src-tauri/plugins/tauri-plugin-rag/package.json)<br>[src-tauri/plugins/tauri-plugin-vector-db/package.json](../src-tauri/plugins/tauri-plugin-vector-db/package.json)<br>[src-tauri/plugins/tauri-plugin-websearch/package.json](../src-tauri/plugins/tauri-plugin-websearch/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `@tauri-apps/cli` | `^2.7.0` | `2.8.4` | développement/test | [package.json](../package.json) |
| `@tauri-apps/plugin-deep-link` | `2.4.3` | `2.4.3` | application | [web-app/package.json](../web-app/package.json) |
| `@tauri-apps/plugin-http` | `2.5.9` | `2.5.9` | application | [extensions/llamacpp-extension/package.json](../extensions/llamacpp-extension/package.json)<br>[extensions/mlx-extension/package.json](../extensions/mlx-extension/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `@tauri-apps/plugin-log` | `^2.6.0` | `2.9.0` | application | [web-app/package.json](../web-app/package.json) |
| `@tauri-apps/plugin-opener` | `2.5.2` | `2.5.2` | application | [web-app/package.json](../web-app/package.json) |
| `@tauri-apps/plugin-os` | `2.2.1` | `2.2.1` | application | [web-app/package.json](../web-app/package.json) |
| `@tauri-apps/plugin-store` | `^2.4.2` | `2.4.2` | application | [web-app/package.json](../web-app/package.json) |
| `@tauri-apps/plugin-updater` | `2.8.1` | `2.8.1` | application | [web-app/package.json](../web-app/package.json) |
| `@testing-library/dom` | `10.4.1` | `10.4.0`<br>`10.4.1` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@testing-library/jest-dom` | `6.8.0` | `6.5.0`<br>`6.8.0` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@testing-library/react` | `16.3.0` | `16.3.0` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@testing-library/user-event` | `14.6.1` | `14.5.2`<br>`14.6.1` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@theguild/remark-mermaid` | `^0.0.6` | `0.0.5`<br>`0.0.6` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `@types/culori` | `2.1.1` | `2.1.1` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@types/istanbul-lib-report` | `3.0.3` | `3.0.3` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@types/istanbul-reports` | `3.0.4` | `3.0.4` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@types/lodash.clonedeep` | `4.5.9` | `4.5.9` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@types/lodash.debounce` | `4.0.9` | `4.0.9` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@types/matter-js` | `^0` | `0.20.2` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@types/mdast` | `^4.0.4` | `3.0.15`<br>`4.0.4` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@types/node` | `22.14.1`<br>`^20`<br>`^20.11.30`<br>`^22.10.0` | `20.19.17`<br>`20.19.24`<br>`20.19.43`<br>`22.14.1`<br>`22.18.3`<br>`24.5.2`<br>`26.5.1` | développement/test | [core/package.json](../core/package.json)<br>[docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[e2e/package.json](../e2e/package.json)<br>[packages/adk/package.json](../packages/adk/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `@types/react` | `19.1.2`<br>`^18` | `18.3.24`<br>`19.1.13`<br>`19.1.2` | développement/test | [core/package.json](../core/package.json)<br>[docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `@types/react-dom` | `19.1.2`<br>`^18` | `18.3.7`<br>`19.1.2` | développement/test | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `@types/react-syntax-highlighter` | `15.5.13` | `15.5.13` | application | [web-app/package.json](../web-app/package.json) |
| `@types/unist` | `^3.0.3` | `2.0.11`<br>`3.0.3` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@types/uuid` | `10.0.0` | `10.0.0` | application | [web-app/package.json](../web-app/package.json) |
| `@uiw/react-textarea-code-editor` | `3.1.1` | `3.1.1` | application | [web-app/package.json](../web-app/package.json) |
| `@vitejs/plugin-react` | `4.4.1` | `4.4.1` | développement/test | [web-app/package.json](../web-app/package.json) |
| `@vitest/coverage-v8` | `3.2.4`<br>`^2.1.8`<br>`^3.1.3` | `2.1.9`<br>`3.2.4` | développement/test | [core/package.json](../core/package.json)<br>[package.json](../package.json)<br>[web-app/package.json](../web-app/package.json) |
| `@vitest/ui` | `3.2.4`<br>`^2.1.8` | `2.1.9`<br>`3.2.4` | développement/test | [core/package.json](../core/package.json)<br>[extensions/llamacpp-extension/package.json](../extensions/llamacpp-extension/package.json) |
| `@wdio/cli` | `^9.30.0` | `9.31.9` | développement/test | [e2e/package.json](../e2e/package.json) |
| `@wdio/globals` | `^9.30.0` | `9.29.1`<br>`9.31.3` | développement/test | [e2e/package.json](../e2e/package.json) |
| `@wdio/local-runner` | `^9.30.0` | `9.31.9` | développement/test | [e2e/package.json](../e2e/package.json) |
| `@wdio/mocha-framework` | `^9.30.0` | `9.31.9` | développement/test | [e2e/package.json](../e2e/package.json) |
| `@wdio/spec-reporter` | `^9.30.0` | `9.30.1`<br>`9.31.2` | développement/test | [e2e/package.json](../e2e/package.json) |
| `@wdio/tauri-service` | `^1.4.0` | `1.4.0` | développement/test | [e2e/package.json](../e2e/package.json) |
| `ai` | `^6.0.0` | `5.0.108`<br>`6.0.182` | application | [web-app/package.json](../web-app/package.json) |
| `astro-mermaid` | `^1.0.4` | `1.0.4` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `autoprefixer` | `^10.0.1` | `10.4.21` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `axios` | `^1.6.8` | `1.12.2` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `class-variance-authority` | `^0.7.1` | `0.7.1` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `clsx` | `2.1.1` | `1.2.1`<br>`2.0.0`<br>`2.1.1` | développement/test | [web-app/package.json](../web-app/package.json) |
| `cpx` | `1.5.0`<br>`^1.5.0` | `1.5.0` | développement/test | [extensions/assistant-extension/package.json](../extensions/assistant-extension/package.json)<br>[extensions/conversational-extension/package.json](../extensions/conversational-extension/package.json)<br>[extensions/download-extension/package.json](../extensions/download-extension/package.json)<br>[extensions/llamacpp-extension/package.json](../extensions/llamacpp-extension/package.json)<br>[extensions/mlx-extension/package.json](../extensions/mlx-extension/package.json)<br>[extensions/rag-extension/package.json](../extensions/rag-extension/package.json)<br>[extensions/vector-db-extension/package.json](../extensions/vector-db-extension/package.json)<br>[package.json](../package.json) |
| `cross-env` | `^7.0.3` | `7.0.3` | développement/test | [package.json](../package.json) |
| `culori` | `4.0.1` | `4.0.1` | application | [web-app/package.json](../web-app/package.json) |
| `date-fns` | `^3.6.0` | `2.30.0`<br>`3.6.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `embla-carousel-auto-height` | `^8.0.0` | `8.6.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `embla-carousel-auto-scroll` | `^8.0.0` | `8.6.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `embla-carousel-autoplay` | `^8.0.0` | `8.6.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `embla-carousel-react` | `^8.0.0` | `8.6.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `emoji-picker-react` | `4.12.2` | `4.12.2` | application | [web-app/package.json](../web-app/package.json) |
| `eslint` | `8.57.0`<br>`9.25.1`<br>`^8` | `8.57.0`<br>`8.57.1`<br>`9.25.1` | développement/test | [core/package.json](../core/package.json)<br>[docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `eslint-config-next` | `14.1.4` | `14.1.4` | développement/test | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `eslint-plugin-react-hooks` | `5.2.0` | `5.0.0-canary-7118f5dd7-20230705`<br>`5.2.0` | développement/test | [web-app/package.json](../web-app/package.json) |
| `eslint-plugin-react-refresh` | `0.4.20` | `0.4.20` | développement/test | [web-app/package.json](../web-app/package.json) |
| `fetch-retry` | `^5.0.6` | `5.0.6` | application | [extensions/llamacpp-extension/package.json](../extensions/llamacpp-extension/package.json) |
| `framer-motion` | `12.23.12`<br>`^12.23.18` | `12.23.12`<br>`12.23.18`<br>`12.34.3`<br>`12.37.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `fs` | `^0.0.1-security` | `0.0.1-security` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `fuse.js` | `7.1.0` | `6.6.2`<br>`7.1.0` | application | [web-app/package.json](../web-app/package.json) |
| `fzf` | `0.5.2` | `0.5.2` | application | [web-app/package.json](../web-app/package.json) |
| `globals` | `16.0.0` | `11.12.0`<br>`13.24.0`<br>`14.0.0`<br>`15.15.0`<br>`16.0.0` | développement/test | [web-app/package.json](../web-app/package.json) |
| `gray-matter` | `^4.0.3` | `4.0.3` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `happy-dom` | `^20.0.0` | `20.0.1` | développement/test | [core/package.json](../core/package.json) |
| `husky` | `^9.1.5` | `9.1.7` | développement/test | [package.json](../package.json) |
| `i18next` | `25.0.2` | `25.0.2` | application | [web-app/package.json](../web-app/package.json) |
| `istanbul-api` | `3.0.0` | `3.0.0` | développement/test | [web-app/package.json](../web-app/package.json) |
| `istanbul-lib-coverage` | `2.0.5` | `2.0.5`<br>`3.2.2` | développement/test | [web-app/package.json](../web-app/package.json) |
| `istanbul-lib-report` | `2.0.8` | `2.0.8`<br>`3.0.1` | développement/test | [web-app/package.json](../web-app/package.json) |
| `istanbul-reports` | `3.1.7` | `2.2.7`<br>`3.1.7`<br>`3.2.0` | développement/test | [web-app/package.json](../web-app/package.json) |
| `jsdom` | `26.1.0`<br>`^26.1.0` | `26.1.0` | développement/test | [extensions/assistant-extension/package.json](../extensions/assistant-extension/package.json)<br>[extensions/conversational-extension/package.json](../extensions/conversational-extension/package.json)<br>[extensions/download-extension/package.json](../extensions/download-extension/package.json)<br>[extensions/llamacpp-extension/package.json](../extensions/llamacpp-extension/package.json)<br>[extensions/mlx-extension/package.json](../extensions/mlx-extension/package.json)<br>[extensions/rag-extension/package.json](../extensions/rag-extension/package.json)<br>[extensions/vector-db-extension/package.json](../extensions/vector-db-extension/package.json)<br>[package.json](../package.json)<br>[web-app/package.json](../web-app/package.json) |
| `katex` | `0.16.22` | `0.16.22`<br>`0.16.32` | application | [web-app/package.json](../web-app/package.json) |
| `lodash.clonedeep` | `4.5.0` | `4.5.0` | application | [web-app/package.json](../web-app/package.json) |
| `lodash.debounce` | `4.0.8` | `4.0.8` | application | [web-app/package.json](../web-app/package.json) |
| `lucide-react` | `^0.522.0`<br>`^0.563.0` | `0.522.0`<br>`0.560.0`<br>`0.562.0`<br>`0.563.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `matter-js` | `^0.20.0` | `0.20.0` | application | [web-app/package.json](../web-app/package.json) |
| `mermaid` | `^11.9.0` | `10.9.4`<br>`11.12.0`<br>`11.12.3` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `motion` | `^12.35.0` | `12.34.3`<br>`12.37.0` | application | [web-app/package.json](../web-app/package.json) |
| `next` | `^14.1.4` | `14.2.32` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `next-seo` | `^6.5.0` | `6.8.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `next-sitemap` | `^4.2.3` | `4.2.3` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `next-themes` | `0.4.6` | `0.2.1`<br>`0.4.6` | application | [web-app/package.json](../web-app/package.json) |
| `nextra` | `^2.13.4` | `2.13.4` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `nextra-theme-docs` | `^2.13.4` | `2.13.4` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `pacote` | `^21.0.0` | `18.0.6`<br>`21.0.1` | développement/test | [core/package.json](../core/package.json) |
| `path` | `^0.12.7` | `0.12.7` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `plop` | `^4.0.1` | `4.0.3` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `plop-helper-date` | `^1.0.0` | `1.0.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `postcss` | `^8` | `8.4.31`<br>`8.5.3`<br>`8.5.6` | développement/test | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `posthog-js` | `1.255.1`<br>`^1.194.6` | `1.255.1`<br>`1.268.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `prettier` | `^3.2.5` | `3.6.2` | développement/test | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `radix-ui` | `^1.4.3` | `1.4.3` | application | [web-app/package.json](../web-app/package.json) |
| `react` | `19.0.0`<br>`^18` | `18.3.1`<br>`19.0.0` | application<br>développement/test<br>pair | [core/package.json](../core/package.json)<br>[docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `react-colorful` | `5.6.1` | `5.6.1` | application | [web-app/package.json](../web-app/package.json) |
| `react-dom` | `19.0.0`<br>`^18` | `18.3.1`<br>`19.0.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `react-hook-form` | `^7.51.1` | `7.63.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `react-i18next` | `15.5.1` | `15.5.1` | application | [web-app/package.json](../web-app/package.json) |
| `react-icons` | `^5.0.1` | `5.5.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `react-markdown` | `10.1.0`<br>`^9.0.1` | `10.1.0`<br>`9.1.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `react-resizable-panels` | `3.0.5` | `3.0.5` | application | [web-app/package.json](../web-app/package.json) |
| `react-share` | `^5.1.0` | `5.2.2` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `react-syntax-highlighter` | `15.6.1` | `15.6.1`<br>`5.8.0` | application | [web-app/package.json](../web-app/package.json) |
| `react-syntax-highlighter-virtualized-renderer` | `1.1.0` | `1.1.0` | application | [web-app/package.json](../web-app/package.json) |
| `react-textarea-autosize` | `8.5.9` | `8.5.9` | application | [web-app/package.json](../web-app/package.json) |
| `react-tweet` | `^3.3.0` | `3.3.0` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `rehype-katex` | `7.0.1` | `7.0.1` | application | [web-app/package.json](../web-app/package.json) |
| `rehype-raw` | `7.0.0` | `7.0.0` | application | [web-app/package.json](../web-app/package.json) |
| `remark-breaks` | `4.0.0` | `4.0.0` | application | [web-app/package.json](../web-app/package.json) |
| `remark-emoji` | `5.0.1` | `5.0.1` | application | [web-app/package.json](../web-app/package.json) |
| `remark-gfm` | `4.0.1` | `3.0.1`<br>`4.0.1` | application | [web-app/package.json](../web-app/package.json) |
| `remark-math` | `6.0.0` | `5.1.1`<br>`6.0.0` | application | [web-app/package.json](../web-app/package.json) |
| `request` | `^2.88.2` | `2.88.2` | développement/test | [core/package.json](../core/package.json) |
| `request-progress` | `^3.0.0` | `3.0.0` | développement/test | [core/package.json](../core/package.json) |
| `rimraf` | `3.0.2`<br>`6.0.1`<br>`^3.0.2`<br>`^6.0.1` | `2.7.1`<br>`3.0.2`<br>`6.0.1` | développement/test | [core/package.json](../core/package.json)<br>[extensions/assistant-extension/package.json](../extensions/assistant-extension/package.json)<br>[extensions/conversational-extension/package.json](../extensions/conversational-extension/package.json)<br>[extensions/download-extension/package.json](../extensions/download-extension/package.json)<br>[extensions/llamacpp-extension/package.json](../extensions/llamacpp-extension/package.json)<br>[extensions/mlx-extension/package.json](../extensions/mlx-extension/package.json)<br>[extensions/rag-extension/package.json](../extensions/rag-extension/package.json)<br>[extensions/vector-db-extension/package.json](../extensions/vector-db-extension/package.json)<br>[package.json](../package.json) |
| `rolldown` | `1.0.0-beta.1` | `1.0.0-beta.1` | développement/test | [core/package.json](../core/package.json)<br>[extensions/assistant-extension/package.json](../extensions/assistant-extension/package.json)<br>[extensions/conversational-extension/package.json](../extensions/conversational-extension/package.json)<br>[extensions/download-extension/package.json](../extensions/download-extension/package.json)<br>[extensions/llamacpp-extension/package.json](../extensions/llamacpp-extension/package.json)<br>[extensions/mlx-extension/package.json](../extensions/mlx-extension/package.json)<br>[extensions/rag-extension/package.json](../extensions/rag-extension/package.json)<br>[extensions/vector-db-extension/package.json](../extensions/vector-db-extension/package.json) |
| `rollup` | `^4.9.6` | `2.79.2`<br>`4.40.0`<br>`4.50.1`<br>`4.50.2`<br>`4.52.1` | développement/test | [src-tauri/plugins/tauri-plugin-agent-tools/package.json](../src-tauri/plugins/tauri-plugin-agent-tools/package.json)<br>[src-tauri/plugins/tauri-plugin-hardware/package.json](../src-tauri/plugins/tauri-plugin-hardware/package.json)<br>[src-tauri/plugins/tauri-plugin-llamacpp/package.json](../src-tauri/plugins/tauri-plugin-llamacpp/package.json)<br>[src-tauri/plugins/tauri-plugin-mlx/package.json](../src-tauri/plugins/tauri-plugin-mlx/package.json)<br>[src-tauri/plugins/tauri-plugin-rag/package.json](../src-tauri/plugins/tauri-plugin-rag/package.json)<br>[src-tauri/plugins/tauri-plugin-vector-db/package.json](../src-tauri/plugins/tauri-plugin-vector-db/package.json)<br>[src-tauri/plugins/tauri-plugin-websearch/package.json](../src-tauri/plugins/tauri-plugin-websearch/package.json) |
| `run-script-os` | `1.1.6`<br>`^1.1.6` | `1.1.6` | développement/test | [extensions/assistant-extension/package.json](../extensions/assistant-extension/package.json)<br>[extensions/download-extension/package.json](../extensions/download-extension/package.json)<br>[package.json](../package.json) |
| `rxjs` | `^7.8.1` | `7.8.2` | application | [core/package.json](../core/package.json) |
| `sass` | `^1.72.0` | `1.93.1` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `serve` | `14.2.5` | `14.2.5` | développement/test | [web-app/package.json](../web-app/package.json) |
| `sharp` | `^0.33.3` | `0.33.5` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| `shiki` | `^3.19.0` | `0.14.7`<br>`3.22.0` | application | [web-app/package.json](../web-app/package.json) |
| `sonner` | `2.0.5` | `2.0.5`<br>`2.0.7` | application | [web-app/package.json](../web-app/package.json) |
| `streamdown` | `npm:@janhq/streamdown@^2.1.1` | `1.1.6`<br>`2.1.1` | application | [web-app/package.json](../web-app/package.json) |
| `tailwind-merge` | `3.3.1`<br>`^2.2.2` | `2.6.0`<br>`3.3.1`<br>`3.5.0` | application<br>développement/test | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `tailwindcss` | `4.1.17`<br>`^3.3.0` | `3.4.17`<br>`4.1.17`<br>`4.1.4` | application | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `tar` | `^4.4.19` | `4.4.19`<br>`6.2.1`<br>`7.4.3`<br>`7.5.22` | développement/test | [package.json](../package.json) |
| `tslib` | `^2.6.2` | `2.8.1` | développement/test | [core/package.json](../core/package.json)<br>[src-tauri/plugins/tauri-plugin-agent-tools/package.json](../src-tauri/plugins/tauri-plugin-agent-tools/package.json)<br>[src-tauri/plugins/tauri-plugin-hardware/package.json](../src-tauri/plugins/tauri-plugin-hardware/package.json)<br>[src-tauri/plugins/tauri-plugin-llamacpp/package.json](../src-tauri/plugins/tauri-plugin-llamacpp/package.json)<br>[src-tauri/plugins/tauri-plugin-mlx/package.json](../src-tauri/plugins/tauri-plugin-mlx/package.json)<br>[src-tauri/plugins/tauri-plugin-rag/package.json](../src-tauri/plugins/tauri-plugin-rag/package.json)<br>[src-tauri/plugins/tauri-plugin-vector-db/package.json](../src-tauri/plugins/tauri-plugin-vector-db/package.json)<br>[src-tauri/plugins/tauri-plugin-websearch/package.json](../src-tauri/plugins/tauri-plugin-websearch/package.json) |
| `tsx` | `^4.19.2` | `4.20.5`<br>`4.23.13` | développement/test | [e2e/package.json](../e2e/package.json) |
| `tw-animate-css` | `1.2.8` | `1.2.8` | application | [web-app/package.json](../web-app/package.json) |
| `typescript` | `5.8.3`<br>`5.9.2`<br>`^5`<br>`^5.3.3`<br>`^5.6.0`<br>`^5.6.2`<br>`^5.8.3` | `5.8.3`<br>`5.9.2`<br>`5.9.3` | développement/test | [core/package.json](../core/package.json)<br>[docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json)<br>[e2e/package.json](../e2e/package.json)<br>[extensions/assistant-extension/package.json](../extensions/assistant-extension/package.json)<br>[extensions/conversational-extension/package.json](../extensions/conversational-extension/package.json)<br>[extensions/download-extension/package.json](../extensions/download-extension/package.json)<br>[extensions/llamacpp-extension/package.json](../extensions/llamacpp-extension/package.json)<br>[extensions/mlx-extension/package.json](../extensions/mlx-extension/package.json)<br>[extensions/rag-extension/package.json](../extensions/rag-extension/package.json)<br>[extensions/vector-db-extension/package.json](../extensions/vector-db-extension/package.json)<br>[packages/adk/package.json](../packages/adk/package.json)<br>[src-tauri/plugins/tauri-plugin-agent-tools/package.json](../src-tauri/plugins/tauri-plugin-agent-tools/package.json)<br>[src-tauri/plugins/tauri-plugin-hardware/package.json](../src-tauri/plugins/tauri-plugin-hardware/package.json)<br>[src-tauri/plugins/tauri-plugin-llamacpp/package.json](../src-tauri/plugins/tauri-plugin-llamacpp/package.json)<br>[src-tauri/plugins/tauri-plugin-mlx/package.json](../src-tauri/plugins/tauri-plugin-mlx/package.json)<br>[src-tauri/plugins/tauri-plugin-rag/package.json](../src-tauri/plugins/tauri-plugin-rag/package.json)<br>[src-tauri/plugins/tauri-plugin-vector-db/package.json](../src-tauri/plugins/tauri-plugin-vector-db/package.json)<br>[src-tauri/plugins/tauri-plugin-websearch/package.json](../src-tauri/plugins/tauri-plugin-websearch/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `typescript-eslint` | `8.31.0` | `8.31.0` | développement/test | [web-app/package.json](../web-app/package.json) |
| `ulidx` | `2.4.1`<br>`^2.3.0` | `2.4.1` | application | [core/package.json](../core/package.json)<br>[extensions/llamacpp-extension/package.json](../extensions/llamacpp-extension/package.json)<br>[web-app/package.json](../web-app/package.json) |
| `unified` | `11.0.5` | `10.1.2`<br>`11.0.5` | application | [web-app/package.json](../web-app/package.json) |
| `unist-util-visit` | `^5.0.0` | `3.1.0`<br>`4.1.2`<br>`5.0.0` | application | [web-app/package.json](../web-app/package.json) |
| `unzipper` | `^0.12.3` | `0.12.3` | développement/test | [package.json](../package.json) |
| `use-stick-to-bottom` | `^1.0.48` | `1.1.3` | application | [web-app/package.json](../web-app/package.json) |
| `uuid` | `11.1.0` | `11.1.0`<br>`3.4.0`<br>`9.0.1` | application | [web-app/package.json](../web-app/package.json) |
| `vaul` | `^1.1.2` | `1.1.2` | application | [web-app/package.json](../web-app/package.json) |
| `vite` | `6.3.2` | `5.4.20`<br>`6.3.2`<br>`7.1.5` | développement/test | [web-app/package.json](../web-app/package.json) |
| `vite-plugin-node-polyfills` | `0.23.0` | `0.23.0` | développement/test | [web-app/package.json](../web-app/package.json) |
| `vite-plugin-pwa` | `1.0.3` | `1.0.3` | développement/test | [web-app/package.json](../web-app/package.json) |
| `vitest` | `3.2.4`<br>`^2.1.8`<br>`^3.1.3` | `2.1.9`<br>`3.2.4` | développement/test | [core/package.json](../core/package.json)<br>[extensions/assistant-extension/package.json](../extensions/assistant-extension/package.json)<br>[extensions/conversational-extension/package.json](../extensions/conversational-extension/package.json)<br>[extensions/download-extension/package.json](../extensions/download-extension/package.json)<br>[extensions/llamacpp-extension/package.json](../extensions/llamacpp-extension/package.json)<br>[extensions/mlx-extension/package.json](../extensions/mlx-extension/package.json)<br>[extensions/rag-extension/package.json](../extensions/rag-extension/package.json)<br>[extensions/vector-db-extension/package.json](../extensions/vector-db-extension/package.json)<br>[package.json](../package.json)<br>[web-app/package.json](../web-app/package.json) |
| `webdriverio` | `^9.30.0` | `9.30.1`<br>`9.31.9` | développement/test | [e2e/package.json](../e2e/package.json) |
| `zod` | `^4.1.13` | `3.24.3`<br>`3.25.76`<br>`4.3.6` | application | [web-app/package.json](../web-app/package.json) |
| `zustand` | `5.0.3` | `5.0.3` | application | [web-app/package.json](../web-app/package.json) |

## Dépendances externes directes Rust

| Bibliothèque | Versions déclarées | Versions présentes dans les verrous Cargo | Usage | Manifestes |
| --- | --- | --- | --- | --- |
| `aes-gcm` | `0.10` | `0.10.3` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `agent-client-protocol` | `2.2.0` | `2.2.0` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `arboard` | `3` | `3.6.1` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `ash` | `0.37` | `0.37.3+1.3.251` | application (ciblée) | [src-tauri/plugins/tauri-plugin-hardware/Cargo.toml](../src-tauri/plugins/tauri-plugin-hardware/Cargo.toml) |
| `async-trait` | `0.1` | `0.1.89`<br>`0.1.92` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-websearch/Cargo.toml](../src-tauri/plugins/tauri-plugin-websearch/Cargo.toml) |
| `base64` | `0.22`<br>`0.22.1` | `0.21.7`<br>`0.22.1`<br>`0.23.1` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `block2` | `0.6` | `0.6.2` | application (ciblée) | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `byteorder` | `1.5.0` | `1.5.0` | application | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml) |
| `bytes` | `1` | `1.12.0`<br>`1.12.1` | application | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml) |
| `cairo-rs` | `0.18` | `0.18.5` | application (ciblée) | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `calamine` | `0.23` | `0.23.1` | application | [src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml) |
| `cc` | `1` | `1.2.65`<br>`1.2.67`<br>`1.4.5` | compilation | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml) |
| `chardetng` | `0.1` | `0.1.17` | application | [src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml) |
| `chrono` | `0.4` | `0.4.45` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/novera-cli/Cargo.toml](../src-tauri/novera-cli/Cargo.toml) |
| `clap` | `4` | `4.6.1`<br>`4.6.6` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/novera-cli/Cargo.toml](../src-tauri/novera-cli/Cargo.toml) |
| `comfy-table` | `7.2` | `7.2.2` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `console` | `0.15` | `0.15.11` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/novera-cli/Cargo.toml](../src-tauri/novera-cli/Cargo.toml) |
| `csv` | `1.3` | `1.4.0` | application | [src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml) |
| `dirs` | `6.0.0` | `6.0.0` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `ed25519-dalek` | `2.1` | `2.2.0` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `encoding_rs` | `0.8` | `0.8.35`<br>`0.8.41` | application | [src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml) |
| `env` | `1.0.1` | `1.0.1` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `env_logger` | `0.11` | `0.11.11` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/novera-cli/Cargo.toml](../src-tauri/novera-cli/Cargo.toml) |
| `fix-path-env` | ` ; Git https://github.com/tauri-apps/fix-path-env-rs @ branche par défaut` | `0.0.0` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `flate2` | `1.0` | `1.1.10`<br>`1.1.9` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `form_urlencoded` | `1.2` | `1.2.2` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `futures` | `0.3` | `0.3.32`<br>`0.3.34` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `futures-util` | `0.3`<br>`0.3.31` | `0.3.32`<br>`0.3.34` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml) |
| `genai` | `=0.7.0-beta.19` | `0.7.0-beta.19` | application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `gio` | `0.18` | `0.18.4` | application (ciblée) | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `glib` | `0.18` | `0.18.5`<br>`0.21.5` | application (ciblée) | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `glob` | `0.3` | `0.3.3`<br>`0.3.4` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `gtk` | `0.18` | `0.18.2` | application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `hex` | `0.4` | `0.4.3` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `hmac` | `0.12`<br>`0.12.1` | `0.12.1` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `hostname` | `0.4` | `0.4.2` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `html2text` | `0.11` | `0.11.0` | application | [src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml) |
| `http-body-util` | `0.1` | `0.1.3`<br>`0.1.4`<br>`0.1.5` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml) |
| `hyper` | `1` | `1.10.1`<br>`1.11.1` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml) |
| `hyper-util` | `0.1` | `0.1.20` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml) |
| `ignore` | `0.4` | `0.4.28`<br>`0.4.33` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `indicatif` | `0.17` | `0.17.11` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `infer` | `0.15` | `0.15.0`<br>`0.19.0` | application | [src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml) |
| `insta` | `1.46` | `1.49.0` | développement/test | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `keyring` | `3` | `3.6.3` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `lddtree` | `0.5` | `0.5.0`<br>`0.5.1` | application (ciblée) | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml) |
| `libc` | `0.2`<br>`0.2.172` | `0.2.186`<br>`0.2.189` | application<br>application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.toml](../src-tauri/plugins/tauri-plugin-hardware/Cargo.toml) |
| `libloading` | `0.8`<br>`0.8.7` | `0.7.4`<br>`0.8.9` | application<br>application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.toml](../src-tauri/plugins/tauri-plugin-hardware/Cargo.toml) |
| `log` | `0.4` | `0.4.33`<br>`0.4.34` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.toml](../src-tauri/plugins/tauri-plugin-hardware/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-mlx/Cargo.toml](../src-tauri/plugins/tauri-plugin-mlx/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml](../src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-websearch/Cargo.toml](../src-tauri/plugins/tauri-plugin-websearch/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `machine-uid` | `0.5` | `0.5.4` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `nix` | `=0.30.1` | `0.29.0`<br>`0.30.1`<br>`0.31.3` | application (ciblée)<br>développement/test (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/novera-cli/Cargo.toml](../src-tauri/novera-cli/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-mlx/Cargo.toml](../src-tauri/plugins/tauri-plugin-mlx/Cargo.toml) |
| `nvml-wrapper` | `0.10.0` | `0.10.0` | application (ciblée) | [src-tauri/plugins/tauri-plugin-hardware/Cargo.toml](../src-tauri/plugins/tauri-plugin-hardware/Cargo.toml) |
| `oauth2` | `5.0` | `5.0.0` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `objc2` | `0.6` | `0.6.4` | application (ciblée) | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `objc2-app-kit` | `0.3` | `0.3.2` | application (ciblée) | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `objc2-foundation` | `0.3` | `0.3.2` | application (ciblée) | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `objc2-web-kit` | `0.3` | `0.3.2` | application (ciblée) | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `once_cell` | `1.18` | `1.21.4` | application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `pdf-extract` | `0.12` | `0.12.0` | application | [src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml) |
| `percent-encoding` | `2` | `2.3.2` | application | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `png` | `0.17` | `0.17.16`<br>`0.18.1` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `pulldown-cmark` | `0.13` | `0.13.4` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `quick-xml` | `0.31` | `0.31.0`<br>`0.39.4`<br>`0.41.0`<br>`0.42.0` | application | [src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml) |
| `rand` | `0.8` | `0.10.2`<br>`0.8.6`<br>`0.8.7`<br>`0.8.8`<br>`0.9.4`<br>`0.9.5` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `ratatui` | `0.30` | `0.30.2` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `regex` | `1` | `1.12.4`<br>`1.13.0`<br>`1.13.1` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `reqwest` | `0.12`<br>`0.13` | `0.12.28`<br>`0.13.4`<br>`0.13.5` | application<br>application (ciblée)<br>développement/test | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-websearch/Cargo.toml](../src-tauri/plugins/tauri-plugin-websearch/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `rfd` | `0.15.4` | `0.15.4`<br>`0.16.0` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `rmcp` | `3.2.0` | `3.2.0` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `rusqlite` | `0.32` | `0.32.1` | application | [src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml](../src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml) |
| `schemars` | `1` | `0.8.22`<br>`0.9.0`<br>`1.2.1`<br>`1.2.2` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `serde` | `1.0` | `1.0.228`<br>`1.0.229` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.toml](../src-tauri/plugins/tauri-plugin-hardware/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-mlx/Cargo.toml](../src-tauri/plugins/tauri-plugin-mlx/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml](../src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-websearch/Cargo.toml](../src-tauri/plugins/tauri-plugin-websearch/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `serde_json` | `1.0`<br>`1.0.149` | `1.0.150`<br>`1.0.151` | application<br>compilation<br>développement/test | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/novera-cli/Cargo.toml](../src-tauri/novera-cli/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.toml](../src-tauri/plugins/tauri-plugin-hardware/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml](../src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-websearch/Cargo.toml](../src-tauri/plugins/tauri-plugin-websearch/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `serde_yaml` | `0.9.34` | `0.9.34+deprecated` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `sha2` | `0.10`<br>`0.10.9` | `0.10.9` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `similar` | `2.6` | `2.7.0` | application | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `sqlx` | `0.8` | `0.8.6` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `syntect` | `5.3` | `5.3.0` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `sysinfo` | `0.34.2` | `0.34.2` | application<br>application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.toml](../src-tauri/plugins/tauri-plugin-hardware/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-mlx/Cargo.toml](../src-tauri/plugins/tauri-plugin-mlx/Cargo.toml) |
| `tar` | `0.4` | `0.4.46` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tauri` | `2.5.0`<br>`2.8.5` | `2.11.3`<br>`2.11.5` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.toml](../src-tauri/plugins/tauri-plugin-hardware/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-mlx/Cargo.toml](../src-tauri/plugins/tauri-plugin-mlx/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml](../src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-websearch/Cargo.toml](../src-tauri/plugins/tauri-plugin-websearch/Cargo.toml) |
| `tauri-build` | `2.0.2` | `2.6.3` | compilation | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tauri-plugin` | `2.3.1` | `2.6.3` | compilation | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.toml](../src-tauri/plugins/tauri-plugin-hardware/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-mlx/Cargo.toml](../src-tauri/plugins/tauri-plugin-mlx/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml](../src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-websearch/Cargo.toml](../src-tauri/plugins/tauri-plugin-websearch/Cargo.toml) |
| `tauri-plugin-deep-link` | `2` | `2.4.9` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tauri-plugin-dialog` | `2.2.1` | `2.7.1` | application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tauri-plugin-http` | `2` | `2.5.9` | application<br>application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tauri-plugin-log` | `2.0.0-rc` | `2.9.0` | application<br>application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tauri-plugin-opener` | `2.2.7` | `2.5.4` | application<br>application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tauri-plugin-os` | `2.2.1` | `2.3.2` | application<br>application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tauri-plugin-shell` | `2.2.0` | `2.3.5` | application<br>application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tauri-plugin-single-instance` | `2` | `2.4.3` | application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tauri-plugin-store` | `2` | `2.4.3` | application<br>application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tauri-plugin-updater` | `2` | `2.10.1` | application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tauri-plugin-wdio-webdriver` | `1.4` | `1.4.0` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tempfile` | `3.0`<br>`3.20.0` | `3.27.0` | développement/test | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `thiserror` | `2.0`<br>`2.0.12` | `1.0.69`<br>`2.0.18`<br>`2.0.20` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-mlx/Cargo.toml](../src-tauri/plugins/tauri-plugin-mlx/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml](../src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-websearch/Cargo.toml](../src-tauri/plugins/tauri-plugin-websearch/Cargo.toml) |
| `tokio` | `1` | `1.52.3`<br>`1.53.1` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/novera-cli/Cargo.toml](../src-tauri/novera-cli/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-mlx/Cargo.toml](../src-tauri/plugins/tauri-plugin-mlx/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml](../src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-websearch/Cargo.toml](../src-tauri/plugins/tauri-plugin-websearch/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `tokio-stream` | `0.1` | `0.1.18`<br>`0.1.19` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `tokio-util` | `0.7.14` | `0.7.18`<br>`0.7.19` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `toml` | `0.8` | `0.8.2`<br>`0.8.23`<br>`0.9.12+spec-1.1.0`<br>`1.1.2+spec-1.1.0`<br>`1.1.3+spec-1.1.0`<br>`1.1.5+spec-1.1.0` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `toml_edit` | `0.23` | `0.19.15`<br>`0.20.2`<br>`0.20.7`<br>`0.22.27`<br>`0.23.10+spec-1.0.0`<br>`0.25.13+spec-1.1.0` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `unicode-segmentation` | `1` | `1.13.3` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `unicode-width` | `0.2` | `0.1.14`<br>`0.2.2` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `url` | `2.5` | `2.5.8` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `uuid` | `1.7` | `1.23.3`<br>`1.23.5`<br>`1.26.0` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml](../src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml) |
| `vulkano` | `0.34` | `0.34.2` | application (ciblée) | [src-tauri/plugins/tauri-plugin-hardware/Cargo.toml](../src-tauri/plugins/tauri-plugin-hardware/Cargo.toml) |
| `webkit2gtk` | `2.0` | `2.0.2` | application (ciblée) | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `webview2-com` | `0.38` | `0.38.2` | application (ciblée) | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `windows` | `0.61` | `0.57.0`<br>`0.61.3`<br>`0.62.2` | application (ciblée) | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| `windows-sys` | `0.60.2` | `0.45.0`<br>`0.48.0`<br>`0.52.0`<br>`0.59.0`<br>`0.60.2`<br>`0.61.2` | application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml)<br>[src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |
| `zbus` | `5` | `4.4.0`<br>`5.17.0` | application (ciblée) | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| `zip` | `0.6` | `0.6.6`<br>`4.6.1` | application | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml) |

## Composants internes du dépôt

Ils ne sont pas inclus dans le total des 301 bibliothèques externes directes. Une version absente du manifeste est indiquée explicitement.

| Écosystème | Composant | Version du composant | Manifeste |
| --- | --- | --- | --- |
| JS/TS | `@janhq/core` | `0.1.10` | [core/package.json](../core/package.json) |
| JS/TS | `docs` | `0.1.0` | [docs/package.json](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/package.json) |
| JS/TS | `@janhq/e2e` | `0.0.0` | [e2e/package.json](../e2e/package.json) |
| JS/TS | `@janhq/assistant-extension` | `1.0.2` | [extensions/assistant-extension/package.json](../extensions/assistant-extension/package.json) |
| JS/TS | `@janhq/conversational-extension` | `1.0.0` | [extensions/conversational-extension/package.json](../extensions/conversational-extension/package.json) |
| JS/TS | `@janhq/download-extension` | `1.0.0` | [extensions/download-extension/package.json](../extensions/download-extension/package.json) |
| JS/TS | `@janhq/llamacpp-extension` | `1.0.1` | [extensions/llamacpp-extension/package.json](../extensions/llamacpp-extension/package.json) |
| JS/TS | `@janhq/mlx-extension` | `1.0.0` | [extensions/mlx-extension/package.json](../extensions/mlx-extension/package.json) |
| JS/TS | `@janhq/rag-extension` | `0.1.0` | [extensions/rag-extension/package.json](../extensions/rag-extension/package.json) |
| JS/TS | `@janhq/vector-db-extension` | `0.1.0` | [extensions/vector-db-extension/package.json](../extensions/vector-db-extension/package.json) |
| JS/TS | `novera-app` | `0.0.0` | [package.json](../package.json) |
| JS/TS | `@janhq/adk` | `0.1.0` | [packages/adk/package.json](../packages/adk/package.json) |
| JS/TS | `sans nom` | `non déclarée` | [src-tauri/plugins/package.json](../src-tauri/plugins/package.json) |
| JS/TS | `@janhq/tauri-plugin-agent-tools-api` | `0.8.3` | [src-tauri/plugins/tauri-plugin-agent-tools/package.json](../src-tauri/plugins/tauri-plugin-agent-tools/package.json) |
| JS/TS | `@janhq/tauri-plugin-hardware-api` | `0.8.3` | [src-tauri/plugins/tauri-plugin-hardware/package.json](../src-tauri/plugins/tauri-plugin-hardware/package.json) |
| JS/TS | `@janhq/tauri-plugin-llamacpp-api` | `0.7.0` | [src-tauri/plugins/tauri-plugin-llamacpp/package.json](../src-tauri/plugins/tauri-plugin-llamacpp/package.json) |
| JS/TS | `@janhq/tauri-plugin-mlx-api` | `0.8.3` | [src-tauri/plugins/tauri-plugin-mlx/package.json](../src-tauri/plugins/tauri-plugin-mlx/package.json) |
| JS/TS | `@janhq/tauri-plugin-rag-api` | `0.1.0` | [src-tauri/plugins/tauri-plugin-rag/package.json](../src-tauri/plugins/tauri-plugin-rag/package.json) |
| JS/TS | `@janhq/tauri-plugin-vector-db-api` | `0.1.0` | [src-tauri/plugins/tauri-plugin-vector-db/package.json](../src-tauri/plugins/tauri-plugin-vector-db/package.json) |
| JS/TS | `@janhq/tauri-plugin-websearch-api` | `0.8.3` | [src-tauri/plugins/tauri-plugin-websearch/package.json](../src-tauri/plugins/tauri-plugin-websearch/package.json) |
| JS/TS | `@janhq/web-app` | `1.0.0` | [web-app/package.json](../web-app/package.json) |
| Rust | `Novera` | `1.0.0` | [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) |
| Rust | `jan-cli` | `1.0.0` | [src-tauri/novera-cli/Cargo.toml](../src-tauri/novera-cli/Cargo.toml) |
| Rust | `tauri-plugin-agent-tools` | `0.8.3` | [src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml](../src-tauri/plugins/tauri-plugin-agent-tools/Cargo.toml) |
| Rust | `tauri-plugin-hardware` | `0.8.3` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.toml](../src-tauri/plugins/tauri-plugin-hardware/Cargo.toml) |
| Rust | `tauri-plugin-llamacpp` | `0.7.0` | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml) |
| Rust | `tauri-plugin-mlx` | `0.8.3` | [src-tauri/plugins/tauri-plugin-mlx/Cargo.toml](../src-tauri/plugins/tauri-plugin-mlx/Cargo.toml) |
| Rust | `tauri-plugin-rag` | `0.1.0` | [src-tauri/plugins/tauri-plugin-rag/Cargo.toml](../src-tauri/plugins/tauri-plugin-rag/Cargo.toml) |
| Rust | `tauri-plugin-vector-db` | `0.1.0` | [src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml](../src-tauri/plugins/tauri-plugin-vector-db/Cargo.toml) |
| Rust | `tauri-plugin-websearch` | `0.8.3` | [src-tauri/plugins/tauri-plugin-websearch/Cargo.toml](../src-tauri/plugins/tauri-plugin-websearch/Cargo.toml) |
| Rust | `jan-utils` | `0.1.0` | [src-tauri/utils/Cargo.toml](../src-tauri/utils/Cargo.toml) |

## Python — outils et SDK

Les tests AutoQA déclarent **8 paquets distincts**. `cua-agent` a deux déclarations (contrainte de version et référence Git) : les deux sont conservées ci-dessous, sans présumer de leur compatibilité. Aucun verrou Python n’établit ici de version effectivement résolue.

| Paquet | Déclaration | Origine |
| --- | --- | --- |
| `PyAutoGUI` | `PyAutoGUI~=0.9.54` | [autoqa/requirements.txt](../autoqa/requirements.txt) |
| `cua-agent` | `cua-agent @ git+https://github.com/janhq/cua.git@compute-agent-0.3.0-patch#subdirectory=libs/python/agent`<br>`cua-agent[all]~=0.3.0` | [autoqa/requirements.txt](../autoqa/requirements.txt) |
| `cua-computer` | `cua-computer[all]~=0.3.5` | [autoqa/requirements.txt](../autoqa/requirements.txt) |
| `cua-computer-server` | `cua-computer-server~=0.1.19` | [autoqa/requirements.txt](../autoqa/requirements.txt) |
| `numpy` | `numpy~=2.2.6` | [autoqa/requirements.txt](../autoqa/requirements.txt) |
| `opencv-python` | `opencv-python~=4.10.0` | [autoqa/requirements.txt](../autoqa/requirements.txt) |
| `psutil` | `psutil~=7.0.0` | [autoqa/requirements.txt](../autoqa/requirements.txt) |
| `reportportal-client` | `reportportal-client~=5.6.5` | [autoqa/requirements.txt](../autoqa/requirements.txt) |
| `setuptools` | `setuptools>=68` — construction du SDK | [adk/python/pyproject.toml](../adk/python/pyproject.toml) |

Le SDK Python `jan-adk` ne déclare aucune dépendance d’exécution. Les extras des outils Python peuvent installer des dépendances indirectes supplémentaires non verrouillées dans ces fichiers.

## Annexe A — versions JavaScript / TypeScript verrouillées

Toutes les dépendances externes directes et indirectes trouvées dans les verrous Yarn, regroupées par nom et version.

| Paquet | Version | Verrous contenant cette version |
| --- | --- | --- |
| `@adobe/css-tools` | `4.4.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@ai-sdk/anthropic` | `3.0.77` | [yarn.lock](../yarn.lock) |
| `@ai-sdk/gateway` | `2.0.18` | [yarn.lock](../yarn.lock) |
| `@ai-sdk/gateway` | `3.0.114` | [yarn.lock](../yarn.lock) |
| `@ai-sdk/google` | `3.0.73` | [yarn.lock](../yarn.lock) |
| `@ai-sdk/mistral` | `3.0.37` | [yarn.lock](../yarn.lock) |
| `@ai-sdk/openai` | `3.0.63` | [yarn.lock](../yarn.lock) |
| `@ai-sdk/openai-compatible` | `2.0.47` | [yarn.lock](../yarn.lock) |
| `@ai-sdk/provider` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `@ai-sdk/provider` | `3.0.10` | [yarn.lock](../yarn.lock) |
| `@ai-sdk/provider-utils` | `3.0.18` | [yarn.lock](../yarn.lock) |
| `@ai-sdk/provider-utils` | `4.0.27` | [yarn.lock](../yarn.lock) |
| `@ai-sdk/react` | `3.0.184` | [yarn.lock](../yarn.lock) |
| `@ai-sdk/xai` | `3.0.90` | [yarn.lock](../yarn.lock) |
| `@alloc/quick-lru` | `5.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@ampproject/remapping` | `2.3.0` | [yarn.lock](../yarn.lock) |
| `@antfu/install-pkg` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@antfu/utils` | `9.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@apideck/better-ajv-errors` | `0.3.6` | [yarn.lock](../yarn.lock) |
| `@asamuzakjp/css-color` | `3.2.0` | [yarn.lock](../yarn.lock) |
| `@babel/code-frame` | `7.26.2` | [yarn.lock](../yarn.lock) |
| `@babel/code-frame` | `7.27.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@babel/code-frame` | `7.29.0` | [yarn.lock](../yarn.lock) |
| `@babel/code-frame` | `7.29.7` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@babel/compat-data` | `7.26.8` | [yarn.lock](../yarn.lock) |
| `@babel/compat-data` | `7.28.4` | [yarn.lock](../yarn.lock) |
| `@babel/compat-data` | `7.29.0` | [yarn.lock](../yarn.lock) |
| `@babel/core` | `7.26.10` | [yarn.lock](../yarn.lock) |
| `@babel/core` | `7.28.4` | [yarn.lock](../yarn.lock) |
| `@babel/core` | `7.29.0` | [yarn.lock](../yarn.lock) |
| `@babel/generator` | `7.26.9` | [yarn.lock](../yarn.lock) |
| `@babel/generator` | `7.27.0` | [yarn.lock](../yarn.lock) |
| `@babel/generator` | `7.28.0` | [yarn.lock](../yarn.lock) |
| `@babel/generator` | `7.28.3` | [yarn.lock](../yarn.lock) |
| `@babel/generator` | `7.29.1` | [yarn.lock](../yarn.lock) |
| `@babel/helper-annotate-as-pure` | `7.27.3` | [yarn.lock](../yarn.lock) |
| `@babel/helper-compilation-targets` | `7.26.5` | [yarn.lock](../yarn.lock) |
| `@babel/helper-compilation-targets` | `7.27.2` | [yarn.lock](../yarn.lock) |
| `@babel/helper-compilation-targets` | `7.28.6` | [yarn.lock](../yarn.lock) |
| `@babel/helper-create-class-features-plugin` | `7.28.3` | [yarn.lock](../yarn.lock) |
| `@babel/helper-create-regexp-features-plugin` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/helper-define-polyfill-provider` | `0.6.5` | [yarn.lock](../yarn.lock) |
| `@babel/helper-globals` | `7.28.0` | [yarn.lock](../yarn.lock) |
| `@babel/helper-member-expression-to-functions` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/helper-module-imports` | `7.25.9` | [yarn.lock](../yarn.lock) |
| `@babel/helper-module-imports` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/helper-module-imports` | `7.28.6` | [yarn.lock](../yarn.lock) |
| `@babel/helper-module-transforms` | `7.26.0` | [yarn.lock](../yarn.lock) |
| `@babel/helper-module-transforms` | `7.28.3` | [yarn.lock](../yarn.lock) |
| `@babel/helper-module-transforms` | `7.28.6` | [yarn.lock](../yarn.lock) |
| `@babel/helper-optimise-call-expression` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/helper-plugin-utils` | `7.26.5` | [yarn.lock](../yarn.lock) |
| `@babel/helper-plugin-utils` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/helper-remap-async-to-generator` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/helper-replace-supers` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/helper-skip-transparent-expression-wrappers` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/helper-string-parser` | `7.25.9` | [yarn.lock](../yarn.lock) |
| `@babel/helper-string-parser` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/helper-validator-identifier` | `7.25.9` | [yarn.lock](../yarn.lock) |
| `@babel/helper-validator-identifier` | `7.27.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@babel/helper-validator-identifier` | `7.28.5` | [yarn.lock](../yarn.lock) |
| `@babel/helper-validator-identifier` | `7.29.7` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@babel/helper-validator-option` | `7.25.9` | [yarn.lock](../yarn.lock) |
| `@babel/helper-validator-option` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/helper-wrap-function` | `7.28.3` | [yarn.lock](../yarn.lock) |
| `@babel/helpers` | `7.27.0` | [yarn.lock](../yarn.lock) |
| `@babel/helpers` | `7.28.4` | [yarn.lock](../yarn.lock) |
| `@babel/helpers` | `7.28.6` | [yarn.lock](../yarn.lock) |
| `@babel/parser` | `7.26.9` | [yarn.lock](../yarn.lock) |
| `@babel/parser` | `7.27.0` | [yarn.lock](../yarn.lock) |
| `@babel/parser` | `7.27.7` | [yarn.lock](../yarn.lock) |
| `@babel/parser` | `7.28.0` | [yarn.lock](../yarn.lock) |
| `@babel/parser` | `7.28.4` | [yarn.lock](../yarn.lock) |
| `@babel/parser` | `7.29.0` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-bugfix-firefox-class-in-computed-class-key` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-bugfix-safari-class-field-initializer-scope` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-bugfix-safari-id-destructuring-collision-in-function-expression` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-bugfix-v8-spread-parameters-in-optional-chaining` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-bugfix-v8-static-class-fields-redefine-readonly` | `7.28.3` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-proposal-private-property-in-object` | `7.21.0-placeholder-for-preset-env.2` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-syntax-import-assertions` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-syntax-import-attributes` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-syntax-jsx` | `7.25.9` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-syntax-typescript` | `7.25.9` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-syntax-unicode-sets-regex` | `7.18.6` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-arrow-functions` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-async-generator-functions` | `7.28.0` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-async-to-generator` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-block-scoped-functions` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-block-scoping` | `7.28.4` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-class-properties` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-class-static-block` | `7.28.3` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-classes` | `7.28.4` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-computed-properties` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-destructuring` | `7.28.0` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-dotall-regex` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-duplicate-keys` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-duplicate-named-capturing-groups-regex` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-dynamic-import` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-explicit-resource-management` | `7.28.0` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-exponentiation-operator` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-export-namespace-from` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-for-of` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-function-name` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-json-strings` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-literals` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-logical-assignment-operators` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-member-expression-literals` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-modules-amd` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-modules-commonjs` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-modules-systemjs` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-modules-umd` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-named-capturing-groups-regex` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-new-target` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-nullish-coalescing-operator` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-numeric-separator` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-object-rest-spread` | `7.28.4` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-object-super` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-optional-catch-binding` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-optional-chaining` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-parameters` | `7.27.7` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-private-methods` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-private-property-in-object` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-property-literals` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-react-jsx-self` | `7.25.9` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-react-jsx-source` | `7.25.9` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-regenerator` | `7.28.4` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-regexp-modifiers` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-reserved-words` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-shorthand-properties` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-spread` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-sticky-regex` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-template-literals` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-typeof-symbol` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-unicode-escapes` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-unicode-property-regex` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-unicode-regex` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/plugin-transform-unicode-sets-regex` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/preset-env` | `7.28.3` | [yarn.lock](../yarn.lock) |
| `@babel/preset-modules` | `0.1.6-no-external-plugins` | [yarn.lock](../yarn.lock) |
| `@babel/runtime` | `7.27.0` | [yarn.lock](../yarn.lock) |
| `@babel/runtime` | `7.27.1` | [yarn.lock](../yarn.lock) |
| `@babel/runtime` | `7.27.6` | [yarn.lock](../yarn.lock) |
| `@babel/runtime` | `7.28.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@babel/template` | `7.26.9` | [yarn.lock](../yarn.lock) |
| `@babel/template` | `7.27.0` | [yarn.lock](../yarn.lock) |
| `@babel/template` | `7.27.2` | [yarn.lock](../yarn.lock) |
| `@babel/template` | `7.28.6` | [yarn.lock](../yarn.lock) |
| `@babel/traverse` | `7.26.9` | [yarn.lock](../yarn.lock) |
| `@babel/traverse` | `7.27.0` | [yarn.lock](../yarn.lock) |
| `@babel/traverse` | `7.27.7` | [yarn.lock](../yarn.lock) |
| `@babel/traverse` | `7.28.0` | [yarn.lock](../yarn.lock) |
| `@babel/traverse` | `7.28.4` | [yarn.lock](../yarn.lock) |
| `@babel/traverse` | `7.29.0` | [yarn.lock](../yarn.lock) |
| `@babel/types` | `7.26.9` | [yarn.lock](../yarn.lock) |
| `@babel/types` | `7.27.0` | [yarn.lock](../yarn.lock) |
| `@babel/types` | `7.27.7` | [yarn.lock](../yarn.lock) |
| `@babel/types` | `7.28.0` | [yarn.lock](../yarn.lock) |
| `@babel/types` | `7.28.4` | [yarn.lock](../yarn.lock) |
| `@babel/types` | `7.29.0` | [yarn.lock](../yarn.lock) |
| `@bcoe/v8-coverage` | `0.2.3` | [yarn.lock](../yarn.lock) |
| `@bcoe/v8-coverage` | `1.0.2` | [yarn.lock](../yarn.lock) |
| `@braintree/sanitize-url` | `6.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@braintree/sanitize-url` | `7.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@braintree/sanitize-url` | `7.1.2` | [yarn.lock](../yarn.lock) |
| `@chevrotain/cst-dts-gen` | `11.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@chevrotain/cst-dts-gen` | `11.1.1` | [yarn.lock](../yarn.lock) |
| `@chevrotain/gast` | `11.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@chevrotain/gast` | `11.1.1` | [yarn.lock](../yarn.lock) |
| `@chevrotain/regexp-to-ast` | `11.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@chevrotain/regexp-to-ast` | `11.1.1` | [yarn.lock](../yarn.lock) |
| `@chevrotain/types` | `11.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@chevrotain/types` | `11.1.1` | [yarn.lock](../yarn.lock) |
| `@chevrotain/utils` | `11.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@chevrotain/utils` | `11.1.1` | [yarn.lock](../yarn.lock) |
| `@code-hike/lighter` | `0.7.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@code-hike/mdx` | `0.9.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@codemirror/autocomplete` | `6.18.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@codemirror/commands` | `6.8.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@codemirror/lang-css` | `6.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@codemirror/lang-html` | `6.4.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@codemirror/lang-javascript` | `6.2.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@codemirror/lang-json` | `6.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@codemirror/lang-yaml` | `6.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@codemirror/language` | `6.11.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@codemirror/lint` | `6.8.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@codemirror/search` | `6.5.11` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@codemirror/state` | `6.5.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@codemirror/view` | `6.38.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@corex/deepmerge` | `4.0.43` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@csstools/color-helpers` | `5.1.0` | [yarn.lock](../yarn.lock) |
| `@csstools/css-calc` | `2.1.4` | [yarn.lock](../yarn.lock) |
| `@csstools/css-color-parser` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `@csstools/css-parser-algorithms` | `3.0.5` | [yarn.lock](../yarn.lock) |
| `@csstools/css-tokenizer` | `3.0.4` | [yarn.lock](../yarn.lock) |
| `@dnd-kit/accessibility` | `3.1.1` | [yarn.lock](../yarn.lock) |
| `@dnd-kit/core` | `6.3.1` | [yarn.lock](../yarn.lock) |
| `@dnd-kit/modifiers` | `9.0.0` | [yarn.lock](../yarn.lock) |
| `@dnd-kit/sortable` | `10.0.0` | [yarn.lock](../yarn.lock) |
| `@dnd-kit/utilities` | `3.2.2` | [yarn.lock](../yarn.lock) |
| `@emnapi/core` | `1.3.1` | [yarn.lock](../yarn.lock) |
| `@emnapi/core` | `1.4.3` | [yarn.lock](../yarn.lock) |
| `@emnapi/core` | `1.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@emnapi/runtime` | `1.3.1` | [yarn.lock](../yarn.lock) |
| `@emnapi/runtime` | `1.4.3` | [yarn.lock](../yarn.lock) |
| `@emnapi/runtime` | `1.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@emnapi/wasi-threads` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `@emnapi/wasi-threads` | `1.0.2` | [yarn.lock](../yarn.lock) |
| `@emnapi/wasi-threads` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@esbuild/aix-ppc64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/aix-ppc64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/aix-ppc64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/android-arm` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/android-arm` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/android-arm` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/android-arm64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/android-arm64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/android-arm64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/android-x64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/android-x64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/android-x64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/darwin-arm64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/darwin-arm64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/darwin-arm64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/darwin-x64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/darwin-x64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/darwin-x64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/freebsd-arm64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/freebsd-arm64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/freebsd-arm64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/freebsd-x64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/freebsd-x64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/freebsd-x64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/linux-arm` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/linux-arm` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/linux-arm` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/linux-arm64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/linux-arm64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/linux-arm64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/linux-ia32` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/linux-ia32` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/linux-ia32` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/linux-loong64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/linux-loong64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/linux-loong64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/linux-mips64el` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/linux-mips64el` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/linux-mips64el` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/linux-ppc64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/linux-ppc64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/linux-ppc64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/linux-riscv64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/linux-riscv64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/linux-riscv64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/linux-s390x` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/linux-s390x` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/linux-s390x` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/linux-x64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/linux-x64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/linux-x64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/netbsd-arm64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/netbsd-arm64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/netbsd-x64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/netbsd-x64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/netbsd-x64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/openbsd-arm64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/openbsd-arm64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/openbsd-x64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/openbsd-x64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/openbsd-x64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/openharmony-arm64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/openharmony-arm64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/sunos-x64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/sunos-x64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/sunos-x64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/win32-arm64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/win32-arm64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/win32-arm64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/win32-ia32` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/win32-ia32` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/win32-ia32` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@esbuild/win32-x64` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@esbuild/win32-x64` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `@esbuild/win32-x64` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@eslint-community/eslint-utils` | `4.4.1` | [yarn.lock](../yarn.lock) |
| `@eslint-community/eslint-utils` | `4.9.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@eslint-community/regexpp` | `4.12.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@eslint/config-array` | `0.20.0` | [yarn.lock](../yarn.lock) |
| `@eslint/config-helpers` | `0.2.1` | [yarn.lock](../yarn.lock) |
| `@eslint/core` | `0.13.0` | [yarn.lock](../yarn.lock) |
| `@eslint/eslintrc` | `2.1.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@eslint/eslintrc` | `3.3.1` | [yarn.lock](../yarn.lock) |
| `@eslint/js` | `8.57.0` | [yarn.lock](../yarn.lock) |
| `@eslint/js` | `8.57.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@eslint/js` | `9.25.1` | [yarn.lock](../yarn.lock) |
| `@eslint/object-schema` | `2.1.6` | [yarn.lock](../yarn.lock) |
| `@eslint/plugin-kit` | `0.2.8` | [yarn.lock](../yarn.lock) |
| `@floating-ui/core` | `1.7.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@floating-ui/dom` | `1.7.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@floating-ui/react-dom` | `2.1.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@floating-ui/utils` | `0.2.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@floating-ui/vue` | `1.1.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@headlessui/react` | `1.7.19` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@headlessui/vue` | `1.7.23` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@humanfs/core` | `0.19.1` | [yarn.lock](../yarn.lock) |
| `@humanfs/node` | `0.16.7` | [yarn.lock](../yarn.lock) |
| `@humanwhocodes/config-array` | `0.11.14` | [yarn.lock](../yarn.lock) |
| `@humanwhocodes/config-array` | `0.13.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@humanwhocodes/module-importer` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@humanwhocodes/momoa` | `3.3.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@humanwhocodes/object-schema` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@humanwhocodes/retry` | `0.4.2` | [yarn.lock](../yarn.lock) |
| `@humanwhocodes/retry` | `0.4.3` | [yarn.lock](../yarn.lock) |
| `@iconify/types` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@iconify/utils` | `3.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@iconify/utils` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `@img/sharp-darwin-arm64` | `0.33.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-darwin-x64` | `0.33.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-libvips-darwin-arm64` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-libvips-darwin-x64` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-libvips-linux-arm` | `1.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-libvips-linux-arm64` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-libvips-linux-s390x` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-libvips-linux-x64` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-libvips-linuxmusl-arm64` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-libvips-linuxmusl-x64` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-linux-arm` | `0.33.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-linux-arm64` | `0.33.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-linux-s390x` | `0.33.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-linux-x64` | `0.33.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-linuxmusl-arm64` | `0.33.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-linuxmusl-x64` | `0.33.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-wasm32` | `0.33.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-win32-ia32` | `0.33.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@img/sharp-win32-x64` | `0.33.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@inquirer/ansi` | `1.0.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/checkbox` | `4.3.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/confirm` | `5.1.21` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/core` | `10.3.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/editor` | `4.2.23` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/expand` | `4.0.23` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/external-editor` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@inquirer/external-editor` | `1.0.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/figures` | `1.0.13` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@inquirer/figures` | `1.0.15` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/input` | `4.3.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/number` | `3.0.23` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/password` | `4.0.23` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/prompts` | `7.10.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/rawlist` | `4.1.11` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/search` | `3.2.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/select` | `4.4.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@inquirer/type` | `3.0.10` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@isaacs/balanced-match` | `4.0.1` | [yarn.lock](../yarn.lock) |
| `@isaacs/brace-expansion` | `5.0.0` | [yarn.lock](../yarn.lock) |
| `@isaacs/cliui` | `8.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@isaacs/fs-minipass` | `4.0.1` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@isaacs/string-locale-compare` | `1.1.0` | [yarn.lock](../yarn.lock) |
| `@istanbuljs/schema` | `0.1.3` | [yarn.lock](../yarn.lock) |
| `@janhq/interfaces` | `0.0.2` | [yarn.lock](../yarn.lock) |
| `@janhq/remend` | `1.1.0` | [yarn.lock](../yarn.lock) |
| `@janhq/streamdown` | `1.1.6` | [yarn.lock](../yarn.lock) |
| `@janhq/streamdown` | `2.1.1` | [yarn.lock](../yarn.lock) |
| `@jest/diff-sequences` | `30.5.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@jest/expect-utils` | `30.5.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@jest/get-type` | `30.5.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@jest/pattern` | `30.5.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@jest/schemas` | `30.5.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@jest/types` | `30.5.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@jridgewell/gen-mapping` | `0.3.13` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@jridgewell/gen-mapping` | `0.3.8` | [yarn.lock](../yarn.lock) |
| `@jridgewell/remapping` | `2.3.5` | [yarn.lock](../yarn.lock) |
| `@jridgewell/resolve-uri` | `3.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@jridgewell/set-array` | `1.2.1` | [yarn.lock](../yarn.lock) |
| `@jridgewell/source-map` | `0.3.11` | [yarn.lock](../yarn.lock) |
| `@jridgewell/sourcemap-codec` | `1.5.0` | [yarn.lock](../yarn.lock) |
| `@jridgewell/sourcemap-codec` | `1.5.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@jridgewell/sourcemap-codec` | `1.6.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@jridgewell/trace-mapping` | `0.3.25` | [yarn.lock](../yarn.lock) |
| `@jridgewell/trace-mapping` | `0.3.29` | [yarn.lock](../yarn.lock) |
| `@jridgewell/trace-mapping` | `0.3.31` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@lezer/common` | `1.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@lezer/css` | `1.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@lezer/highlight` | `1.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@lezer/html` | `1.3.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@lezer/javascript` | `1.5.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@lezer/json` | `1.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@lezer/lr` | `1.4.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@lezer/yaml` | `1.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@marijn/find-cluster-break` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@mdx-js/mdx` | `2.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@mdx-js/react` | `2.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@mermaid-js/parser` | `0.6.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@mermaid-js/parser` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `@napi-rs/simple-git` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-android-arm-eabi` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-android-arm64` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-darwin-arm64` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-darwin-x64` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-freebsd-x64` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-linux-arm-gnueabihf` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-linux-arm64-gnu` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-linux-arm64-musl` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-linux-ppc64-gnu` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-linux-s390x-gnu` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-linux-x64-gnu` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-linux-x64-musl` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-win32-arm64-msvc` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-win32-ia32-msvc` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/simple-git-win32-x64-msvc` | `0.1.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/wasm-runtime` | `0.2.12` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@napi-rs/wasm-runtime` | `0.2.7` | [yarn.lock](../yarn.lock) |
| `@napi-rs/wasm-runtime` | `0.2.9` | [yarn.lock](../yarn.lock) |
| `@next/env` | `13.5.11` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@next/env` | `14.2.32` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@next/eslint-plugin-next` | `14.1.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@next/swc-darwin-arm64` | `14.2.32` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@next/swc-darwin-x64` | `14.2.32` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@next/swc-linux-arm64-gnu` | `14.2.32` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@next/swc-linux-arm64-musl` | `14.2.32` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@next/swc-linux-x64-gnu` | `14.2.32` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@next/swc-linux-x64-musl` | `14.2.32` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@next/swc-win32-arm64-msvc` | `14.2.32` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@next/swc-win32-ia32-msvc` | `14.2.32` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@next/swc-win32-x64-msvc` | `14.2.32` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@next/third-parties` | `14.2.32` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@nodelib/fs.scandir` | `2.1.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@nodelib/fs.stat` | `2.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@nodelib/fs.walk` | `1.2.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@nolyfill/is-core-module` | `1.0.39` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@npmcli/agent` | `2.2.2` | [yarn.lock](../yarn.lock) |
| `@npmcli/agent` | `3.0.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@npmcli/arborist` | `7.5.4` | [yarn.lock](../yarn.lock) |
| `@npmcli/fs` | `3.1.1` | [yarn.lock](../yarn.lock) |
| `@npmcli/fs` | `4.0.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@npmcli/git` | `5.0.8` | [yarn.lock](../yarn.lock) |
| `@npmcli/git` | `6.0.3` | [yarn.lock](../yarn.lock) |
| `@npmcli/installed-package-contents` | `2.1.0` | [yarn.lock](../yarn.lock) |
| `@npmcli/installed-package-contents` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `@npmcli/map-workspaces` | `3.0.6` | [yarn.lock](../yarn.lock) |
| `@npmcli/metavuln-calculator` | `7.1.1` | [yarn.lock](../yarn.lock) |
| `@npmcli/name-from-folder` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `@npmcli/node-gyp` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `@npmcli/node-gyp` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `@npmcli/package-json` | `5.2.1` | [yarn.lock](../yarn.lock) |
| `@npmcli/package-json` | `7.0.0` | [yarn.lock](../yarn.lock) |
| `@npmcli/promise-spawn` | `7.0.2` | [yarn.lock](../yarn.lock) |
| `@npmcli/promise-spawn` | `8.0.3` | [yarn.lock](../yarn.lock) |
| `@npmcli/query` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `@npmcli/redact` | `2.0.1` | [yarn.lock](../yarn.lock) |
| `@npmcli/redact` | `3.2.2` | [yarn.lock](../yarn.lock) |
| `@npmcli/run-script` | `10.0.0` | [yarn.lock](../yarn.lock) |
| `@npmcli/run-script` | `8.1.0` | [yarn.lock](../yarn.lock) |
| `@opentelemetry/api` | `1.9.0` | [yarn.lock](../yarn.lock) |
| `@opentelemetry/api` | `1.9.1` | [yarn.lock](../yarn.lock) |
| `@parcel/watcher` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-android-arm64` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-darwin-arm64` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-darwin-x64` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-freebsd-x64` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-linux-arm-glibc` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-linux-arm-musl` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-linux-arm64-glibc` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-linux-arm64-musl` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-linux-x64-glibc` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-linux-x64-musl` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-win32-arm64` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-win32-ia32` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@parcel/watcher-win32-x64` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@pkgjs/parseargs` | `0.11.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@polka/url` | `1.0.0-next.29` | [yarn.lock](../yarn.lock) |
| `@popperjs/core` | `2.11.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@posthog/core` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@promptbook/utils` | `0.69.5` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@puppeteer/browsers` | `2.13.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@radix-ui/number` | `1.1.1` | [yarn.lock](../yarn.lock) |
| `@radix-ui/primitive` | `1.1.2` | [yarn.lock](../yarn.lock) |
| `@radix-ui/primitive` | `1.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-accessible-icon` | `1.1.7` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-accordion` | `1.2.11` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-accordion` | `1.2.12` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-alert-dialog` | `1.1.15` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-arrow` | `1.1.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-aspect-ratio` | `1.1.7` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-avatar` | `1.1.10` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-avatar` | `1.1.11` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-checkbox` | `1.3.3` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-collapsible` | `1.1.11` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-collapsible` | `1.1.12` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-collection` | `1.1.7` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-compose-refs` | `1.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-context` | `1.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-context` | `1.1.3` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-context-menu` | `2.2.16` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-dialog` | `1.1.15` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-direction` | `1.1.1` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-dismissable-layer` | `1.1.10` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-dismissable-layer` | `1.1.11` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-dropdown-menu` | `2.1.16` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-focus-guards` | `1.1.2` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-focus-guards` | `1.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-focus-scope` | `1.1.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-form` | `0.1.8` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-hover-card` | `1.1.15` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-icons` | `1.3.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@radix-ui/react-id` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-label` | `2.1.7` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-label` | `2.1.8` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-menu` | `2.1.16` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-menubar` | `1.1.16` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-navigation-menu` | `1.2.14` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-one-time-password-field` | `0.1.8` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-password-toggle-field` | `0.1.3` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-popover` | `1.1.14` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-popover` | `1.1.15` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-popper` | `1.2.7` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-popper` | `1.2.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-portal` | `1.1.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-presence` | `1.1.4` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-presence` | `1.1.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-primitive` | `2.1.0` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-primitive` | `2.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-primitive` | `2.1.4` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-progress` | `1.1.4` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-progress` | `1.1.7` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-radio-group` | `1.3.8` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-roving-focus` | `1.1.11` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-scroll-area` | `1.2.10` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-select` | `2.2.6` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-separator` | `1.1.7` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-separator` | `1.1.8` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-slider` | `1.3.6` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-slot` | `1.2.0` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-slot` | `1.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-slot` | `1.2.4` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-switch` | `1.2.2` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-switch` | `1.2.6` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-tabs` | `1.1.13` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-toast` | `1.2.15` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-toggle` | `1.1.10` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-toggle-group` | `1.1.11` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-toolbar` | `1.1.11` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-tooltip` | `1.2.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-use-callback-ref` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-use-controllable-state` | `1.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-use-effect-event` | `0.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-use-escape-keydown` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-use-is-hydrated` | `0.1.0` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-use-layout-effect` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-use-previous` | `1.1.1` | [yarn.lock](../yarn.lock) |
| `@radix-ui/react-use-rect` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-use-size` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/react-visually-hidden` | `1.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@radix-ui/rect` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@replit/codemirror-css-color-picker` | `6.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rolldown/binding-darwin-arm64` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `@rolldown/binding-darwin-x64` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `@rolldown/binding-freebsd-x64` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `@rolldown/binding-linux-arm-gnueabihf` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `@rolldown/binding-linux-arm64-gnu` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `@rolldown/binding-linux-arm64-musl` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `@rolldown/binding-linux-x64-gnu` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `@rolldown/binding-linux-x64-musl` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `@rolldown/binding-wasm32-wasi` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `@rolldown/binding-win32-arm64-msvc` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `@rolldown/binding-win32-ia32-msvc` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `@rolldown/binding-win32-x64-msvc` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `@rollup/plugin-babel` | `5.3.1` | [yarn.lock](../yarn.lock) |
| `@rollup/plugin-inject` | `5.0.5` | [yarn.lock](../yarn.lock) |
| `@rollup/plugin-node-resolve` | `15.3.1` | [yarn.lock](../yarn.lock) |
| `@rollup/plugin-replace` | `2.4.2` | [yarn.lock](../yarn.lock) |
| `@rollup/plugin-terser` | `0.4.4` | [yarn.lock](../yarn.lock) |
| `@rollup/plugin-typescript` | `12.1.4` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/pluginutils` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `@rollup/pluginutils` | `5.3.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@rollup/rollup-android-arm-eabi` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-android-arm-eabi` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-android-arm-eabi` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-android-arm-eabi` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-android-arm64` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-android-arm64` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-android-arm64` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-android-arm64` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-darwin-arm64` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-darwin-arm64` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-darwin-arm64` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-darwin-arm64` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-darwin-x64` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-darwin-x64` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-darwin-x64` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-darwin-x64` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-freebsd-arm64` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-freebsd-arm64` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-freebsd-arm64` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-freebsd-arm64` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-freebsd-x64` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-freebsd-x64` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-freebsd-x64` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-freebsd-x64` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-linux-arm-gnueabihf` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-arm-gnueabihf` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-linux-arm-gnueabihf` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-arm-gnueabihf` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-linux-arm-musleabihf` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-arm-musleabihf` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-linux-arm-musleabihf` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-arm-musleabihf` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-linux-arm64-gnu` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-arm64-gnu` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-linux-arm64-gnu` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-arm64-gnu` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-linux-arm64-musl` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-arm64-musl` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-linux-arm64-musl` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-arm64-musl` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-linux-loong64-gnu` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-loong64-gnu` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-linux-loongarch64-gnu` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-loongarch64-gnu` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-linux-powerpc64le-gnu` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-ppc64-gnu` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-linux-ppc64-gnu` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-ppc64-gnu` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-linux-riscv64-gnu` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-riscv64-gnu` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-linux-riscv64-gnu` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-riscv64-gnu` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-linux-riscv64-musl` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-riscv64-musl` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-linux-riscv64-musl` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-riscv64-musl` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-linux-s390x-gnu` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-s390x-gnu` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-linux-s390x-gnu` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-s390x-gnu` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-linux-x64-gnu` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-x64-gnu` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-linux-x64-gnu` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-x64-gnu` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-linux-x64-musl` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-x64-musl` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-linux-x64-musl` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-linux-x64-musl` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-openharmony-arm64` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-openharmony-arm64` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-openharmony-arm64` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-win32-arm64-msvc` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-win32-arm64-msvc` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-win32-arm64-msvc` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-win32-arm64-msvc` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-win32-ia32-msvc` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-win32-ia32-msvc` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-win32-ia32-msvc` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-win32-ia32-msvc` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-win32-x64-gnu` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rollup/rollup-win32-x64-msvc` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-win32-x64-msvc` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `@rollup/rollup-win32-x64-msvc` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `@rollup/rollup-win32-x64-msvc` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rtsao/scc` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@rushstack/eslint-patch` | `1.12.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/api-client` | `1.2.39` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/api-reference` | `1.22.56` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/api-reference-react` | `0.1.98` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/components` | `0.8.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/oas-utils` | `0.1.16` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/openapi-parser` | `0.3.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/snippetz` | `0.1.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/snippetz-core` | `0.1.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/snippetz-plugin-js-fetch` | `0.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/snippetz-plugin-js-ofetch` | `0.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/snippetz-plugin-node-fetch` | `0.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/snippetz-plugin-node-ofetch` | `0.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/snippetz-plugin-node-undici` | `0.1.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/themes` | `0.7.11` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/use-codemirror` | `0.10.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/use-modal` | `0.3.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/use-toasts` | `0.6.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@scalar/use-tooltip` | `0.6.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@sec-ant/readable-stream` | `0.4.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@shikijs/core` | `3.22.0` | [yarn.lock](../yarn.lock) |
| `@shikijs/engine-javascript` | `3.22.0` | [yarn.lock](../yarn.lock) |
| `@shikijs/engine-oniguruma` | `3.22.0` | [yarn.lock](../yarn.lock) |
| `@shikijs/langs` | `3.22.0` | [yarn.lock](../yarn.lock) |
| `@shikijs/themes` | `3.22.0` | [yarn.lock](../yarn.lock) |
| `@shikijs/types` | `3.22.0` | [yarn.lock](../yarn.lock) |
| `@shikijs/vscode-textmate` | `10.0.2` | [yarn.lock](../yarn.lock) |
| `@sigstore/bundle` | `2.3.2` | [yarn.lock](../yarn.lock) |
| `@sigstore/bundle` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `@sigstore/core` | `1.1.0` | [yarn.lock](../yarn.lock) |
| `@sigstore/core` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `@sigstore/protobuf-specs` | `0.3.3` | [yarn.lock](../yarn.lock) |
| `@sigstore/protobuf-specs` | `0.5.0` | [yarn.lock](../yarn.lock) |
| `@sigstore/sign` | `2.3.2` | [yarn.lock](../yarn.lock) |
| `@sigstore/sign` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `@sigstore/tuf` | `2.3.4` | [yarn.lock](../yarn.lock) |
| `@sigstore/tuf` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `@sigstore/verify` | `1.2.1` | [yarn.lock](../yarn.lock) |
| `@sigstore/verify` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `@sinclair/typebox` | `0.34.52` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@sindresorhus/is` | `4.6.0` | [yarn.lock](../yarn.lock) |
| `@sindresorhus/merge-streams` | `2.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@sindresorhus/merge-streams` | `4.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@standard-schema/spec` | `1.1.0` | [yarn.lock](../yarn.lock) |
| `@storybook/global` | `5.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@storybook/instrumenter` | `8.6.14` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@storybook/test` | `8.6.14` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@streamdown/cjk` | `1.0.2` | [yarn.lock](../yarn.lock) |
| `@streamdown/code` | `1.0.3` | [yarn.lock](../yarn.lock) |
| `@streamdown/math` | `1.0.2` | [yarn.lock](../yarn.lock) |
| `@streamdown/mermaid` | `1.0.2` | [yarn.lock](../yarn.lock) |
| `@surma/rollup-plugin-off-main-thread` | `2.2.3` | [yarn.lock](../yarn.lock) |
| `@swc/counter` | `0.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@swc/helpers` | `0.5.17` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@swc/helpers` | `0.5.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@tabler/icons` | `3.34.0` | [yarn.lock](../yarn.lock) |
| `@tabler/icons-react` | `3.34.0` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/node` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide-android-arm64` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide-darwin-arm64` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide-darwin-x64` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide-freebsd-x64` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide-linux-arm-gnueabihf` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide-linux-arm64-gnu` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide-linux-arm64-musl` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide-linux-x64-gnu` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide-linux-x64-musl` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide-wasm32-wasi` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide-win32-arm64-msvc` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/oxide-win32-x64-msvc` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tailwindcss/vite` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `@tanstack/history` | `1.139.0` | [yarn.lock](../yarn.lock) |
| `@tanstack/history` | `1.161.4` | [yarn.lock](../yarn.lock) |
| `@tanstack/react-router` | `1.139.12` | [yarn.lock](../yarn.lock) |
| `@tanstack/react-router-devtools` | `1.121.34` | [yarn.lock](../yarn.lock) |
| `@tanstack/react-store` | `0.8.0` | [yarn.lock](../yarn.lock) |
| `@tanstack/react-virtual` | `3.13.12` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@tanstack/router-core` | `1.139.12` | [yarn.lock](../yarn.lock) |
| `@tanstack/router-core` | `1.162.2` | [yarn.lock](../yarn.lock) |
| `@tanstack/router-devtools-core` | `1.121.34` | [yarn.lock](../yarn.lock) |
| `@tanstack/router-generator` | `1.162.2` | [yarn.lock](../yarn.lock) |
| `@tanstack/router-plugin` | `1.121.34` | [yarn.lock](../yarn.lock) |
| `@tanstack/router-utils` | `1.161.4` | [yarn.lock](../yarn.lock) |
| `@tanstack/store` | `0.8.0` | [yarn.lock](../yarn.lock) |
| `@tanstack/store` | `0.9.1` | [yarn.lock](../yarn.lock) |
| `@tanstack/virtual-core` | `3.13.12` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@tanstack/virtual-file-routes` | `1.161.4` | [yarn.lock](../yarn.lock) |
| `@tanstack/vue-virtual` | `3.13.12` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@tauri-apps/api` | `2.11.1` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/api` | `2.5.0` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/api` | `2.8.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@tauri-apps/cli` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/cli-darwin-arm64` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/cli-darwin-x64` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/cli-linux-arm-gnueabihf` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/cli-linux-arm64-gnu` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/cli-linux-arm64-musl` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/cli-linux-riscv64-gnu` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/cli-linux-x64-gnu` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/cli-linux-x64-musl` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/cli-win32-arm64-msvc` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/cli-win32-ia32-msvc` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/cli-win32-x64-msvc` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/plugin-deep-link` | `2.4.3` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/plugin-http` | `2.5.9` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/plugin-log` | `2.9.0` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/plugin-opener` | `2.5.2` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/plugin-os` | `2.2.1` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/plugin-store` | `2.4.2` | [yarn.lock](../yarn.lock) |
| `@tauri-apps/plugin-updater` | `2.8.1` | [yarn.lock](../yarn.lock) |
| `@testing-library/dom` | `10.4.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@testing-library/dom` | `10.4.1` | [yarn.lock](../yarn.lock) |
| `@testing-library/jest-dom` | `6.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@testing-library/jest-dom` | `6.8.0` | [yarn.lock](../yarn.lock) |
| `@testing-library/react` | `16.3.0` | [yarn.lock](../yarn.lock) |
| `@testing-library/user-event` | `14.5.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@testing-library/user-event` | `14.6.1` | [yarn.lock](../yarn.lock) |
| `@theguild/remark-mermaid` | `0.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@theguild/remark-mermaid` | `0.0.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@theguild/remark-npm2yarn` | `0.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@tootallnate/quickjs-emscripten` | `0.23.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@tufjs/canonical-json` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `@tufjs/models` | `2.0.1` | [yarn.lock](../yarn.lock) |
| `@tufjs/models` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `@tybys/wasm-util` | `0.10.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@tybys/wasm-util` | `0.9.0` | [yarn.lock](../yarn.lock) |
| `@types/acorn` | `4.0.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/aria-query` | `5.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/babel__core` | `7.20.5` | [yarn.lock](../yarn.lock) |
| `@types/babel__generator` | `7.27.0` | [yarn.lock](../yarn.lock) |
| `@types/babel__template` | `7.4.4` | [yarn.lock](../yarn.lock) |
| `@types/babel__traverse` | `7.28.0` | [yarn.lock](../yarn.lock) |
| `@types/chai` | `5.2.2` | [yarn.lock](../yarn.lock) |
| `@types/culori` | `2.1.1` | [yarn.lock](../yarn.lock) |
| `@types/d3` | `7.4.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-array` | `3.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-axis` | `3.0.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-brush` | `3.0.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-chord` | `3.0.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-color` | `3.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-contour` | `3.0.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-delaunay` | `6.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-dispatch` | `3.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-drag` | `3.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-dsv` | `3.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-ease` | `3.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-fetch` | `3.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-force` | `3.0.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-format` | `3.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-geo` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-hierarchy` | `3.1.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-interpolate` | `3.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-path` | `3.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-polygon` | `3.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-quadtree` | `3.0.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-random` | `3.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-scale` | `4.0.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-scale-chromatic` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-selection` | `3.0.11` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-shape` | `3.1.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/d3-shape` | `3.1.8` | [yarn.lock](../yarn.lock) |
| `@types/d3-time` | `3.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-time-format` | `4.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-timer` | `3.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-transition` | `3.0.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/d3-zoom` | `3.0.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/debug` | `4.1.12` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/deep-eql` | `4.0.2` | [yarn.lock](../yarn.lock) |
| `@types/estree` | `0.0.39` | [yarn.lock](../yarn.lock) |
| `@types/estree` | `1.0.6` | [yarn.lock](../yarn.lock) |
| `@types/estree` | `1.0.7` | [yarn.lock](../yarn.lock) |
| `@types/estree` | `1.0.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/estree-jsx` | `1.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/fined` | `1.1.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/geojson` | `7946.0.16` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/har-format` | `1.2.16` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/hast` | `2.3.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/hast` | `3.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/inquirer` | `9.0.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/istanbul-lib-coverage` | `2.0.6` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/istanbul-lib-report` | `3.0.3` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/istanbul-reports` | `3.0.4` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/js-yaml` | `4.0.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/json-schema` | `7.0.15` | [yarn.lock](../yarn.lock) |
| `@types/json5` | `0.0.29` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/katex` | `0.16.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/liftoff` | `4.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/lodash` | `4.17.20` | [yarn.lock](../yarn.lock) |
| `@types/lodash.clonedeep` | `4.5.9` | [yarn.lock](../yarn.lock) |
| `@types/lodash.debounce` | `4.0.9` | [yarn.lock](../yarn.lock) |
| `@types/matter-js` | `0.20.2` | [yarn.lock](../yarn.lock) |
| `@types/mdast` | `3.0.15` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/mdast` | `4.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/mdx` | `2.0.13` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/mocha` | `10.0.10` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@types/ms` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/node` | `20.19.17` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/node` | `20.19.24` | [yarn.lock](../yarn.lock) |
| `@types/node` | `20.19.43` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@types/node` | `22.14.1` | [yarn.lock](../yarn.lock) |
| `@types/node` | `22.18.3` | [yarn.lock](../yarn.lock) |
| `@types/node` | `24.5.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/node` | `26.5.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@types/normalize-package-data` | `2.4.4` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@types/prismjs` | `1.26.5` | [yarn.lock](../yarn.lock) |
| `@types/prop-types` | `15.7.15` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/react` | `18.3.24` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/react` | `19.1.13` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/react` | `19.1.2` | [yarn.lock](../yarn.lock) |
| `@types/react-dom` | `18.3.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/react-dom` | `19.1.2` | [yarn.lock](../yarn.lock) |
| `@types/react-syntax-highlighter` | `15.5.13` | [yarn.lock](../yarn.lock) |
| `@types/resolve` | `1.20.2` | [yarn.lock](../yarn.lock) |
| `@types/sinonjs__fake-timers` | `8.1.5` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@types/stack-utils` | `2.0.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@types/through` | `0.0.33` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/trusted-types` | `2.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/unist` | `2.0.11` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/unist` | `3.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@types/uuid` | `10.0.0` | [yarn.lock](../yarn.lock) |
| `@types/web-bluetooth` | `0.0.20` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@types/whatwg-mimetype` | `3.0.2` | [yarn.lock](../yarn.lock) |
| `@types/which` | `2.0.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@types/ws` | `8.18.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@types/yargs` | `17.0.35` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@types/yargs-parser` | `21.0.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@types/yauzl` | `2.10.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@typescript-eslint/eslint-plugin` | `8.31.0` | [yarn.lock](../yarn.lock) |
| `@typescript-eslint/parser` | `6.21.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@typescript-eslint/parser` | `8.31.0` | [yarn.lock](../yarn.lock) |
| `@typescript-eslint/scope-manager` | `6.21.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@typescript-eslint/scope-manager` | `8.31.0` | [yarn.lock](../yarn.lock) |
| `@typescript-eslint/type-utils` | `8.31.0` | [yarn.lock](../yarn.lock) |
| `@typescript-eslint/types` | `6.21.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@typescript-eslint/types` | `8.31.0` | [yarn.lock](../yarn.lock) |
| `@typescript-eslint/typescript-estree` | `6.21.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@typescript-eslint/typescript-estree` | `8.31.0` | [yarn.lock](../yarn.lock) |
| `@typescript-eslint/utils` | `8.31.0` | [yarn.lock](../yarn.lock) |
| `@typescript-eslint/visitor-keys` | `6.21.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@typescript-eslint/visitor-keys` | `8.31.0` | [yarn.lock](../yarn.lock) |
| `@uiw/codemirror-themes` | `4.25.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@uiw/react-textarea-code-editor` | `3.1.1` | [yarn.lock](../yarn.lock) |
| `@ungap/structured-clone` | `1.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@unhead/dom` | `1.11.20` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unhead/schema` | `1.11.20` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unhead/shared` | `1.11.20` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-android-arm-eabi` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-android-arm64` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-darwin-arm64` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-darwin-x64` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-freebsd-x64` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-linux-arm-gnueabihf` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-linux-arm-musleabihf` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-linux-arm64-gnu` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-linux-arm64-musl` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-linux-ppc64-gnu` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-linux-riscv64-gnu` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-linux-riscv64-musl` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-linux-s390x-gnu` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-linux-x64-gnu` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-linux-x64-musl` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-wasm32-wasi` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-win32-arm64-msvc` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-win32-ia32-msvc` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@unrs/resolver-binding-win32-x64-msvc` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@vcarl/remark-headings` | `0.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@vercel/oidc` | `3.0.5` | [yarn.lock](../yarn.lock) |
| `@vercel/oidc` | `3.2.0` | [yarn.lock](../yarn.lock) |
| `@vitejs/plugin-react` | `4.4.1` | [yarn.lock](../yarn.lock) |
| `@vitest/coverage-v8` | `2.1.9` | [yarn.lock](../yarn.lock) |
| `@vitest/coverage-v8` | `3.2.4` | [yarn.lock](../yarn.lock) |
| `@vitest/expect` | `2.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@vitest/expect` | `2.1.9` | [yarn.lock](../yarn.lock) |
| `@vitest/expect` | `3.2.4` | [yarn.lock](../yarn.lock) |
| `@vitest/mocker` | `2.1.9` | [yarn.lock](../yarn.lock) |
| `@vitest/mocker` | `3.2.4` | [yarn.lock](../yarn.lock) |
| `@vitest/pretty-format` | `2.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@vitest/pretty-format` | `2.1.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@vitest/pretty-format` | `3.2.4` | [yarn.lock](../yarn.lock) |
| `@vitest/pretty-format` | `3.2.7` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@vitest/pretty-format` | `4.1.11` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@vitest/runner` | `2.1.9` | [yarn.lock](../yarn.lock) |
| `@vitest/runner` | `3.2.4` | [yarn.lock](../yarn.lock) |
| `@vitest/snapshot` | `2.1.9` | [yarn.lock](../yarn.lock) |
| `@vitest/snapshot` | `3.2.4` | [yarn.lock](../yarn.lock) |
| `@vitest/snapshot` | `3.2.7` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@vitest/snapshot` | `4.1.11` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@vitest/spy` | `2.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@vitest/spy` | `2.1.9` | [yarn.lock](../yarn.lock) |
| `@vitest/spy` | `3.2.4` | [yarn.lock](../yarn.lock) |
| `@vitest/ui` | `2.1.9` | [yarn.lock](../yarn.lock) |
| `@vitest/ui` | `3.2.4` | [yarn.lock](../yarn.lock) |
| `@vitest/utils` | `2.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@vitest/utils` | `2.1.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `@vitest/utils` | `3.2.4` | [yarn.lock](../yarn.lock) |
| `@vitest/utils` | `4.1.11` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@vueuse/core` | `10.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@vueuse/metadata` | `10.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@vueuse/shared` | `10.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `@wdio/cli` | `9.31.9` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/config` | `9.30.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/config` | `9.31.9` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/dot-reporter` | `9.31.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/globals` | `9.29.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/globals` | `9.31.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/local-runner` | `9.31.9` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/logger` | `9.29.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/mocha-framework` | `9.31.9` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/native-core` | `1.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/native-spy` | `1.3.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/native-types` | `2.5.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/native-utils` | `2.7.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/protocols` | `9.30.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/protocols` | `9.31.5` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/repl` | `9.16.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/reporter` | `9.30.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/reporter` | `9.31.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/runner` | `9.31.9` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/spec-reporter` | `9.30.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/spec-reporter` | `9.31.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/tauri-service` | `1.4.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/types` | `9.30.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/types` | `9.31.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/utils` | `9.30.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/utils` | `9.31.9` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@wdio/xvfb` | `9.31.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `@zeit/schemas` | `2.36.0` | [yarn.lock](../yarn.lock) |
| `@zip.js/zip.js` | `2.15.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `abbrev` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `abbrev` | `3.0.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `abbrev` | `5.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `abort-controller` | `3.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `acorn` | `8.14.0` | [yarn.lock](../yarn.lock) |
| `acorn` | `8.14.1` | [yarn.lock](../yarn.lock) |
| `acorn` | `8.15.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `acorn-jsx` | `5.3.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `agent-base` | `7.1.4` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `aggregate-error` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `ai` | `5.0.108` | [yarn.lock](../yarn.lock) |
| `ai` | `6.0.182` | [yarn.lock](../yarn.lock) |
| `ajv` | `6.12.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ajv` | `8.12.0` | [yarn.lock](../yarn.lock) |
| `ajv` | `8.17.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ajv-draft-04` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `ajv-formats` | `2.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `ansi-align` | `3.0.1` | [yarn.lock](../yarn.lock) |
| `ansi-colors` | `4.1.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `ansi-escapes` | `4.3.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `ansi-regex` | `5.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ansi-regex` | `6.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ansi-regex` | `6.3.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `ansi-sequence-parser` | `1.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `ansi-styles` | `3.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `ansi-styles` | `4.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ansi-styles` | `5.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ansi-styles` | `6.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ansis` | `4.2.0` | [yarn.lock](../yarn.lock) |
| `any-promise` | `1.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `anymatch` | `1.3.2` | [yarn.lock](../yarn.lock) |
| `anymatch` | `3.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `append-transform` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `arch` | `2.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `archiver` | `7.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `archiver-utils` | `5.0.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `arg` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `arg` | `5.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `argparse` | `1.0.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `argparse` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `aria-hidden` | `1.2.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `aria-query` | `5.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `aria-query` | `5.3.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `arr-diff` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `arr-diff` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `arr-flatten` | `1.1.0` | [yarn.lock](../yarn.lock) |
| `arr-union` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `array-buffer-byte-length` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `array-each` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `array-includes` | `3.1.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `array-slice` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `array-union` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `array-unique` | `0.2.1` | [yarn.lock](../yarn.lock) |
| `array-unique` | `0.3.2` | [yarn.lock](../yarn.lock) |
| `array.prototype.findlast` | `1.2.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `array.prototype.findlastindex` | `1.2.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `array.prototype.flat` | `1.3.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `array.prototype.flatmap` | `1.3.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `array.prototype.tosorted` | `1.1.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `arraybuffer.prototype.slice` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `asn1` | `0.2.6` | [yarn.lock](../yarn.lock) |
| `asn1.js` | `4.10.1` | [yarn.lock](../yarn.lock) |
| `assert` | `2.1.0` | [yarn.lock](../yarn.lock) |
| `assert-plus` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `assertion-error` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `assign-symbols` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `ast-types` | `0.13.4` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `ast-types` | `0.16.1` | [yarn.lock](../yarn.lock) |
| `ast-types-flow` | `0.0.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `ast-v8-to-istanbul` | `0.3.5` | [yarn.lock](../yarn.lock) |
| `astring` | `1.9.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `astro-mermaid` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `async` | `2.6.4` | [yarn.lock](../yarn.lock) |
| `async` | `3.2.6` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `async-each` | `1.0.6` | [yarn.lock](../yarn.lock) |
| `async-exit-hook` | `2.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `async-function` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `asynckit` | `0.4.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `at-least-node` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `atob` | `2.1.2` | [yarn.lock](../yarn.lock) |
| `autoprefixer` | `10.4.21` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `available-typed-arrays` | `1.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `aws-sign2` | `0.7.0` | [yarn.lock](../yarn.lock) |
| `aws4` | `1.13.2` | [yarn.lock](../yarn.lock) |
| `axe-core` | `4.10.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `axios` | `1.12.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `axobject-query` | `4.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `b4a` | `1.9.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `babel-dead-code-elimination` | `1.0.10` | [yarn.lock](../yarn.lock) |
| `babel-dead-code-elimination` | `1.0.12` | [yarn.lock](../yarn.lock) |
| `babel-plugin-polyfill-corejs2` | `0.4.14` | [yarn.lock](../yarn.lock) |
| `babel-plugin-polyfill-corejs3` | `0.13.0` | [yarn.lock](../yarn.lock) |
| `babel-plugin-polyfill-regenerator` | `0.6.5` | [yarn.lock](../yarn.lock) |
| `babel-runtime` | `6.26.0` | [yarn.lock](../yarn.lock) |
| `bail` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `balanced-match` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `bare-events` | `2.9.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `bare-fs` | `4.8.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `bare-path` | `3.1.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `bare-stream` | `2.13.4` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `bare-url` | `2.5.4` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `base` | `0.11.2` | [yarn.lock](../yarn.lock) |
| `base64-js` | `1.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `baseline-browser-mapping` | `2.8.4` | [yarn.lock](../yarn.lock) |
| `baseline-browser-mapping` | `2.8.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `basic-ftp` | `5.3.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `bcrypt-pbkdf` | `1.0.2` | [yarn.lock](../yarn.lock) |
| `bin-links` | `4.0.4` | [yarn.lock](../yarn.lock) |
| `binary-extensions` | `1.13.1` | [yarn.lock](../yarn.lock) |
| `binary-extensions` | `2.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `bindings` | `1.5.0` | [yarn.lock](../yarn.lock) |
| `bl` | `4.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `bluebird` | `3.7.2` | [yarn.lock](../yarn.lock) |
| `bn.js` | `4.12.2` | [yarn.lock](../yarn.lock) |
| `bn.js` | `5.2.2` | [yarn.lock](../yarn.lock) |
| `boolbase` | `1.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `boxen` | `7.0.0` | [yarn.lock](../yarn.lock) |
| `brace-expansion` | `1.1.12` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `brace-expansion` | `1.1.18` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `brace-expansion` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `brace-expansion` | `2.1.4` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `braces` | `1.8.5` | [yarn.lock](../yarn.lock) |
| `braces` | `2.3.2` | [yarn.lock](../yarn.lock) |
| `braces` | `3.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `brorand` | `1.1.0` | [yarn.lock](../yarn.lock) |
| `browser-resolve` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `browser-stdout` | `1.3.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `browserify-aes` | `1.2.0` | [yarn.lock](../yarn.lock) |
| `browserify-cipher` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `browserify-des` | `1.0.2` | [yarn.lock](../yarn.lock) |
| `browserify-rsa` | `4.1.1` | [yarn.lock](../yarn.lock) |
| `browserify-sign` | `4.2.3` | [yarn.lock](../yarn.lock) |
| `browserify-zlib` | `0.2.0` | [yarn.lock](../yarn.lock) |
| `browserslist` | `4.25.4` | [yarn.lock](../yarn.lock) |
| `browserslist` | `4.26.0` | [yarn.lock](../yarn.lock) |
| `browserslist` | `4.26.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `buffer` | `5.7.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `buffer` | `6.0.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `buffer-crc32` | `0.2.13` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `buffer-crc32` | `1.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `buffer-from` | `1.1.2` | [yarn.lock](../yarn.lock) |
| `buffer-xor` | `1.0.3` | [yarn.lock](../yarn.lock) |
| `builtin-status-codes` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `busboy` | `1.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `bytes` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `bytes` | `3.1.2` | [yarn.lock](../yarn.lock) |
| `cac` | `6.7.14` | [yarn.lock](../yarn.lock) |
| `cacache` | `18.0.4` | [yarn.lock](../yarn.lock) |
| `cacache` | `19.0.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `cacache` | `20.0.1` | [yarn.lock](../yarn.lock) |
| `cache-base` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `call-bind` | `1.0.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `call-bind-apply-helpers` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `call-bound` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `callsites` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `camelcase` | `6.3.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `camelcase` | `7.0.1` | [yarn.lock](../yarn.lock) |
| `camelcase-css` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `caniuse-lite` | `1.0.30001741` | [yarn.lock](../yarn.lock) |
| `caniuse-lite` | `1.0.30001743` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `caseless` | `0.12.0` | [yarn.lock](../yarn.lock) |
| `ccount` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `chai` | `5.2.0` | [yarn.lock](../yarn.lock) |
| `chai` | `5.3.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `chalk` | `2.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `chalk` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `chalk` | `4.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `chalk` | `5.0.1` | [yarn.lock](../yarn.lock) |
| `chalk` | `5.6.2` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `chalk-template` | `0.4.0` | [yarn.lock](../yarn.lock) |
| `change-case` | `5.4.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `char-regex` | `1.0.2` | [yarn.lock](../yarn.lock) |
| `character-entities` | `1.2.4` | [yarn.lock](../yarn.lock) |
| `character-entities` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `character-entities-html4` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `character-entities-legacy` | `1.1.4` | [yarn.lock](../yarn.lock) |
| `character-entities-legacy` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `character-reference-invalid` | `1.1.4` | [yarn.lock](../yarn.lock) |
| `character-reference-invalid` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `chardet` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `chardet` | `2.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `check-error` | `2.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `cheerio` | `1.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `cheerio-select` | `2.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `chevrotain` | `11.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `chevrotain` | `11.1.1` | [yarn.lock](../yarn.lock) |
| `chevrotain-allstar` | `0.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `chokidar` | `1.7.0` | [yarn.lock](../yarn.lock) |
| `chokidar` | `3.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `chokidar` | `4.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `chownr` | `1.1.4` | [yarn.lock](../yarn.lock) |
| `chownr` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `chownr` | `3.0.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ci-info` | `4.4.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `cipher-base` | `1.0.6` | [yarn.lock](../yarn.lock) |
| `class-utils` | `0.3.6` | [yarn.lock](../yarn.lock) |
| `class-variance-authority` | `0.7.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `classnames` | `2.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `clean-stack` | `2.2.0` | [yarn.lock](../yarn.lock) |
| `cli-boxes` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `cli-cursor` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `cli-spinners` | `2.9.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `cli-width` | `4.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `client-only` | `0.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `clipboardy` | `1.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `clipboardy` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `cliui` | `7.0.4` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `cliui` | `8.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `clone` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `clsx` | `1.2.1` | [yarn.lock](../yarn.lock) |
| `clsx` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `clsx` | `2.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `cmd-shim` | `6.0.3` | [yarn.lock](../yarn.lock) |
| `cmdk` | `1.1.1` | [yarn.lock](../yarn.lock) |
| `codemirror` | `6.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `collection-visit` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `color` | `4.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `color-convert` | `1.9.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `color-convert` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `color-name` | `1.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `color-name` | `1.1.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `color-string` | `1.9.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `combined-stream` | `1.0.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `comma-separated-tokens` | `1.0.8` | [yarn.lock](../yarn.lock) |
| `comma-separated-tokens` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `commander` | `14.0.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `commander` | `2.20.3` | [yarn.lock](../yarn.lock) |
| `commander` | `4.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `commander` | `7.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `commander` | `8.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `commander` | `9.5.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `common-ancestor-path` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `common-tags` | `1.8.2` | [yarn.lock](../yarn.lock) |
| `compare-versions` | `3.6.0` | [yarn.lock](../yarn.lock) |
| `component-emitter` | `1.3.1` | [yarn.lock](../yarn.lock) |
| `compress-commons` | `6.0.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `compressible` | `2.0.18` | [yarn.lock](../yarn.lock) |
| `compression` | `1.8.1` | [yarn.lock](../yarn.lock) |
| `compute-scroll-into-view` | `3.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `concat-map` | `0.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `confbox` | `0.1.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `confbox` | `0.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `console-browserify` | `1.2.0` | [yarn.lock](../yarn.lock) |
| `constants-browserify` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `content-disposition` | `0.5.2` | [yarn.lock](../yarn.lock) |
| `convert-source-map` | `2.0.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `cookie-es` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `copy-descriptor` | `0.1.1` | [yarn.lock](../yarn.lock) |
| `core-js` | `2.6.12` | [yarn.lock](../yarn.lock) |
| `core-js` | `3.45.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `core-js-compat` | `3.45.1` | [yarn.lock](../yarn.lock) |
| `core-util-is` | `1.0.2` | [yarn.lock](../yarn.lock) |
| `core-util-is` | `1.0.3` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `cose-base` | `1.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `cose-base` | `2.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `cpx` | `1.5.0` | [yarn.lock](../yarn.lock) |
| `crc-32` | `1.2.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `crc32-stream` | `6.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `create-ecdh` | `4.0.4` | [yarn.lock](../yarn.lock) |
| `create-hash` | `1.1.3` | [yarn.lock](../yarn.lock) |
| `create-hash` | `1.2.0` | [yarn.lock](../yarn.lock) |
| `create-hmac` | `1.1.7` | [yarn.lock](../yarn.lock) |
| `create-require` | `1.1.1` | [yarn.lock](../yarn.lock) |
| `create-wdio` | `9.31.6` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `crelt` | `1.0.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `cross-env` | `7.0.3` | [yarn.lock](../yarn.lock) |
| `cross-spawn` | `5.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `cross-spawn` | `7.0.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `crypto-browserify` | `3.12.1` | [yarn.lock](../yarn.lock) |
| `crypto-random-string` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `css-select` | `5.2.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `css-shorthand-properties` | `1.1.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `css-value` | `0.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `css-what` | `6.2.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `css.escape` | `1.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `cssesc` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `cssstyle` | `4.6.0` | [yarn.lock](../yarn.lock) |
| `csstype` | `3.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `culori` | `4.0.1` | [yarn.lock](../yarn.lock) |
| `cva` | `1.0.0-beta.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `cytoscape` | `3.33.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `cytoscape-cose-bilkent` | `4.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `cytoscape-fcose` | `2.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3` | `7.9.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-array` | `2.12.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-array` | `3.2.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-axis` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-brush` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-chord` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-color` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-contour` | `4.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-delaunay` | `6.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-dispatch` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-drag` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-dsv` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-ease` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-fetch` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-force` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-format` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `d3-format` | `3.1.2` | [yarn.lock](../yarn.lock) |
| `d3-geo` | `3.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-hierarchy` | `3.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-interpolate` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-path` | `1.0.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-path` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-polygon` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-quadtree` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-random` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-sankey` | `0.12.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-scale` | `4.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-scale-chromatic` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-selection` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-shape` | `1.3.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-shape` | `3.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-time` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-time-format` | `4.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-timer` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-transition` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `d3-zoom` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `dagre-d3-es` | `7.0.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `dagre-d3-es` | `7.0.11` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `dagre-d3-es` | `7.0.13` | [yarn.lock](../yarn.lock) |
| `damerau-levenshtein` | `1.0.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `dashdash` | `1.14.1` | [yarn.lock](../yarn.lock) |
| `data-uri-to-buffer` | `6.0.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `data-urls` | `5.0.0` | [yarn.lock](../yarn.lock) |
| `data-view-buffer` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `data-view-byte-length` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `data-view-byte-offset` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `date-fns` | `2.30.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `date-fns` | `3.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `dayjs` | `1.11.18` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `dayjs` | `1.11.19` | [yarn.lock](../yarn.lock) |
| `debug` | `2.6.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `debug` | `3.2.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `debug` | `4.4.0` | [yarn.lock](../yarn.lock) |
| `debug` | `4.4.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `debug` | `4.4.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `decamelize` | `4.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `decamelize` | `6.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `decimal.js` | `10.6.0` | [yarn.lock](../yarn.lock) |
| `decode-named-character-reference` | `1.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `decode-uri-component` | `0.2.2` | [yarn.lock](../yarn.lock) |
| `deep-eql` | `5.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `deep-extend` | `0.6.0` | [yarn.lock](../yarn.lock) |
| `deep-is` | `0.1.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `deepmerge` | `4.3.1` | [yarn.lock](../yarn.lock) |
| `deepmerge-ts` | `7.1.6` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `deepmerge-ts` | `8.0.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `default-require-extensions` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `defaults` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `define-data-property` | `1.1.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `define-properties` | `1.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `define-property` | `0.2.5` | [yarn.lock](../yarn.lock) |
| `define-property` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `define-property` | `2.0.2` | [yarn.lock](../yarn.lock) |
| `degenerator` | `5.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `delaunator` | `5.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `delayed-stream` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `dequal` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `des.js` | `1.1.0` | [yarn.lock](../yarn.lock) |
| `detect-file` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `detect-libc` | `1.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `detect-libc` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `detect-node-es` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `devlop` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `didyoumean` | `1.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `diff` | `5.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `diff` | `5.2.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `diff` | `8.0.3` | [yarn.lock](../yarn.lock) |
| `diff` | `8.0.4` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `diffie-hellman` | `5.0.3` | [yarn.lock](../yarn.lock) |
| `dir-glob` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `dlv` | `1.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `doctrine` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `doctrine` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `dom-accessibility-api` | `0.5.16` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `dom-accessibility-api` | `0.6.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `dom-helpers` | `5.2.1` | [yarn.lock](../yarn.lock) |
| `dom-serializer` | `2.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `domain-browser` | `4.22.0` | [yarn.lock](../yarn.lock) |
| `domelementtype` | `2.3.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `domhandler` | `5.0.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `dompurify` | `3.1.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `dompurify` | `3.2.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `dompurify` | `3.3.1` | [yarn.lock](../yarn.lock) |
| `domutils` | `3.2.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `dotenv` | `17.4.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `dunder-proto` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `duplexer` | `0.1.2` | [yarn.lock](../yarn.lock) |
| `duplexer2` | `0.1.4` | [yarn.lock](../yarn.lock) |
| `eastasianwidth` | `0.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `easy-table` | `1.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `ecc-jsbn` | `0.1.2` | [yarn.lock](../yarn.lock) |
| `edge-paths` | `3.0.5` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `edgedriver` | `6.3.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `ejs` | `3.1.10` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `electron-to-chromium` | `1.5.215` | [yarn.lock](../yarn.lock) |
| `electron-to-chromium` | `1.5.218` | [yarn.lock](../yarn.lock) |
| `electron-to-chromium` | `1.5.222` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `elkjs` | `0.9.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `elliptic` | `6.6.1` | [yarn.lock](../yarn.lock) |
| `embla-carousel` | `8.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `embla-carousel-auto-height` | `8.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `embla-carousel-auto-scroll` | `8.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `embla-carousel-autoplay` | `8.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `embla-carousel-react` | `8.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `embla-carousel-reactive-utils` | `8.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `emoji-picker-react` | `4.12.2` | [yarn.lock](../yarn.lock) |
| `emoji-regex` | `8.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `emoji-regex` | `9.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `emojilib` | `2.4.0` | [yarn.lock](../yarn.lock) |
| `emoticon` | `4.1.0` | [yarn.lock](../yarn.lock) |
| `encoding` | `0.1.13` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `encoding-sniffer` | `0.2.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `end-of-stream` | `1.4.5` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `enhanced-resolve` | `5.18.1` | [yarn.lock](../yarn.lock) |
| `entities` | `4.5.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `entities` | `6.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `entities` | `7.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `env-paths` | `2.2.1` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `err-code` | `2.0.3` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `error-ex` | `1.3.4` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `es-abstract` | `1.24.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `es-define-property` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `es-errors` | `1.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `es-iterator-helpers` | `1.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `es-module-lexer` | `1.7.0` | [yarn.lock](../yarn.lock) |
| `es-object-atoms` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `es-set-tostringtag` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `es-shim-unscopables` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `es-to-primitive` | `1.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `esbuild` | `0.21.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `esbuild` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `esbuild` | `0.28.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `escalade` | `3.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `escape-string-regexp` | `1.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `escape-string-regexp` | `2.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `escape-string-regexp` | `4.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `escape-string-regexp` | `5.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `escodegen` | `2.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `eslint` | `8.57.0` | [yarn.lock](../yarn.lock) |
| `eslint` | `8.57.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `eslint` | `9.25.1` | [yarn.lock](../yarn.lock) |
| `eslint-config-next` | `14.1.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `eslint-import-resolver-node` | `0.3.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `eslint-import-resolver-typescript` | `3.10.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `eslint-module-utils` | `2.12.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `eslint-plugin-import` | `2.32.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `eslint-plugin-jsx-a11y` | `6.10.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `eslint-plugin-react` | `7.37.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `eslint-plugin-react-hooks` | `5.0.0-canary-7118f5dd7-20230705` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `eslint-plugin-react-hooks` | `5.2.0` | [yarn.lock](../yarn.lock) |
| `eslint-plugin-react-refresh` | `0.4.20` | [yarn.lock](../yarn.lock) |
| `eslint-scope` | `7.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `eslint-scope` | `8.3.0` | [yarn.lock](../yarn.lock) |
| `eslint-visitor-keys` | `3.4.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `eslint-visitor-keys` | `4.2.0` | [yarn.lock](../yarn.lock) |
| `eslint-visitor-keys` | `4.2.1` | [yarn.lock](../yarn.lock) |
| `espree` | `10.3.0` | [yarn.lock](../yarn.lock) |
| `espree` | `10.4.0` | [yarn.lock](../yarn.lock) |
| `espree` | `9.6.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `esprima` | `4.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `esquery` | `1.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `esrecurse` | `4.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `estraverse` | `5.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `estree-util-attach-comments` | `2.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `estree-util-build-jsx` | `2.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `estree-util-is-identifier-name` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `estree-util-is-identifier-name` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `estree-util-to-js` | `1.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `estree-util-value-to-estree` | `3.4.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `estree-util-visit` | `1.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `estree-walker` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `estree-walker` | `2.0.2` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `estree-walker` | `3.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `esutils` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `event-target-shim` | `5.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `events` | `3.3.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `events-universal` | `1.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `eventsource-parser` | `3.0.6` | [yarn.lock](../yarn.lock) |
| `eventsource-parser` | `3.0.8` | [yarn.lock](../yarn.lock) |
| `evp_bytestokey` | `1.0.3` | [yarn.lock](../yarn.lock) |
| `execa` | `0.8.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `execa` | `5.1.1` | [yarn.lock](../yarn.lock) |
| `execa` | `9.6.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `exit-hook` | `4.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `expand-brackets` | `0.1.5` | [yarn.lock](../yarn.lock) |
| `expand-brackets` | `2.1.4` | [yarn.lock](../yarn.lock) |
| `expand-range` | `1.8.2` | [yarn.lock](../yarn.lock) |
| `expand-tilde` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `expect` | `30.5.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `expect-type` | `1.2.1` | [yarn.lock](../yarn.lock) |
| `expect-type` | `1.2.2` | [yarn.lock](../yarn.lock) |
| `expect-webdriverio` | `6.0.10` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `exponential-backoff` | `3.1.2` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `exponential-backoff` | `3.1.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `exsolve` | `1.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `extend` | `3.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `extend-shallow` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `extend-shallow` | `3.0.2` | [yarn.lock](../yarn.lock) |
| `extglob` | `0.3.2` | [yarn.lock](../yarn.lock) |
| `extglob` | `2.0.4` | [yarn.lock](../yarn.lock) |
| `extract-zip` | `2.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `extsprintf` | `1.3.0` | [yarn.lock](../yarn.lock) |
| `extsprintf` | `1.4.1` | [yarn.lock](../yarn.lock) |
| `fast-deep-equal` | `2.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `fast-deep-equal` | `3.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `fast-fifo` | `1.3.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `fast-glob` | `3.3.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `fast-json-stable-stringify` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `fast-levenshtein` | `2.0.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `fast-uri` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `fastq` | `1.19.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `fault` | `1.0.4` | [yarn.lock](../yarn.lock) |
| `fd-slicer` | `1.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `fdir` | `6.4.3` | [yarn.lock](../yarn.lock) |
| `fdir` | `6.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `fetch-retry` | `5.0.6` | [yarn.lock](../yarn.lock) |
| `fflate` | `0.4.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `fflate` | `0.8.2` | [yarn.lock](../yarn.lock) |
| `figures` | `6.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `file-entry-cache` | `6.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `file-entry-cache` | `8.0.0` | [yarn.lock](../yarn.lock) |
| `file-uri-to-path` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `filelist` | `1.0.4` | [yarn.lock](../yarn.lock) |
| `filelist` | `1.0.6` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `filename-regex` | `2.0.1` | [yarn.lock](../yarn.lock) |
| `fileset` | `2.0.3` | [yarn.lock](../yarn.lock) |
| `fill-range` | `2.2.4` | [yarn.lock](../yarn.lock) |
| `fill-range` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `fill-range` | `7.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `find-index` | `0.1.1` | [yarn.lock](../yarn.lock) |
| `find-up` | `5.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `find-up` | `6.3.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `find-up-simple` | `1.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `findup-sync` | `5.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `fined` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `flagged-respawn` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `flairup` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `flat` | `5.0.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `flat-cache` | `3.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `flat-cache` | `4.0.1` | [yarn.lock](../yarn.lock) |
| `flatted` | `3.3.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `flatted` | `3.4.2` | [yarn.lock](../yarn.lock) |
| `flexsearch` | `0.7.43` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `focus-visible` | `5.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `follow-redirects` | `1.15.11` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `for-each` | `0.3.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `for-in` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `for-own` | `0.1.5` | [yarn.lock](../yarn.lock) |
| `for-own` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `foreground-child` | `3.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `forever-agent` | `0.6.1` | [yarn.lock](../yarn.lock) |
| `form-data` | `2.3.3` | [yarn.lock](../yarn.lock) |
| `form-data` | `4.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `format` | `0.2.2` | [yarn.lock](../yarn.lock) |
| `formdata-node` | `4.4.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `fraction.js` | `4.3.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `fragment-cache` | `0.2.1` | [yarn.lock](../yarn.lock) |
| `framer-motion` | `12.23.12` | [yarn.lock](../yarn.lock) |
| `framer-motion` | `12.23.18` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `framer-motion` | `12.34.3` | [yarn.lock](../yarn.lock) |
| `framer-motion` | `12.37.0` | [yarn.lock](../yarn.lock) |
| `fs` | `0.0.1-security` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `fs-extra` | `11.3.1` | [yarn.lock](../yarn.lock) |
| `fs-extra` | `9.1.0` | [yarn.lock](../yarn.lock) |
| `fs-minipass` | `1.2.7` | [yarn.lock](../yarn.lock) |
| `fs-minipass` | `2.1.0` | [yarn.lock](../yarn.lock) |
| `fs-minipass` | `3.0.3` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `fs.realpath` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `fsevents` | `1.2.13` | [yarn.lock](../yarn.lock) |
| `fsevents` | `2.3.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `function-bind` | `1.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `function.prototype.name` | `1.1.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `functions-have-names` | `1.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `fuse.js` | `6.6.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `fuse.js` | `7.1.0` | [yarn.lock](../yarn.lock) |
| `fzf` | `0.5.2` | [yarn.lock](../yarn.lock) |
| `geckodriver` | `6.1.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `gensync` | `1.0.0-beta.2` | [yarn.lock](../yarn.lock) |
| `get-caller-file` | `2.0.5` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `get-east-asian-width` | `1.5.0` | [yarn.lock](../yarn.lock) |
| `get-intrinsic` | `1.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `get-nonce` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `get-own-enumerable-property-symbols` | `3.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `get-port` | `7.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `get-proto` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `get-stream` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `get-stream` | `5.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `get-stream` | `6.0.1` | [yarn.lock](../yarn.lock) |
| `get-stream` | `9.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `get-symbol-description` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `get-tsconfig` | `4.10.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `get-uri` | `6.0.5` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `get-value` | `2.0.6` | [yarn.lock](../yarn.lock) |
| `getpass` | `0.1.7` | [yarn.lock](../yarn.lock) |
| `git-up` | `7.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `git-url-parse` | `13.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `github-slugger` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `glob` | `10.3.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `glob` | `10.4.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `glob` | `10.5.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `glob` | `11.0.3` | [yarn.lock](../yarn.lock) |
| `glob` | `7.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `glob` | `8.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `glob-base` | `0.3.0` | [yarn.lock](../yarn.lock) |
| `glob-parent` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `glob-parent` | `5.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `glob-parent` | `6.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `glob2base` | `0.0.12` | [yarn.lock](../yarn.lock) |
| `global-modules` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `global-prefix` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `globals` | `11.12.0` | [yarn.lock](../yarn.lock) |
| `globals` | `13.24.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `globals` | `14.0.0` | [yarn.lock](../yarn.lock) |
| `globals` | `15.15.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `globals` | `16.0.0` | [yarn.lock](../yarn.lock) |
| `globalthis` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `globby` | `11.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `globby` | `14.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `goober` | `2.1.16` | [yarn.lock](../yarn.lock) |
| `gopd` | `1.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `graceful-fs` | `4.2.11` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `grapheme-splitter` | `1.0.4` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `graphemer` | `1.4.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `gray-matter` | `4.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `hachure-fill` | `0.5.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `handlebars` | `4.7.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `happy-dom` | `20.0.1` | [yarn.lock](../yarn.lock) |
| `har-schema` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `har-validator` | `5.1.5` | [yarn.lock](../yarn.lock) |
| `has-bigints` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `has-flag` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `has-flag` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `has-flag` | `4.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `has-property-descriptors` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `has-proto` | `1.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `has-symbols` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `has-tostringtag` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `has-value` | `0.3.1` | [yarn.lock](../yarn.lock) |
| `has-value` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `has-values` | `0.1.4` | [yarn.lock](../yarn.lock) |
| `has-values` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `hash-base` | `2.0.2` | [yarn.lock](../yarn.lock) |
| `hash-base` | `3.0.5` | [yarn.lock](../yarn.lock) |
| `hash-base` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `hash-obj` | `4.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `hash.js` | `1.1.7` | [yarn.lock](../yarn.lock) |
| `hasown` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `hast-util-embedded` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `hast-util-format` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `hast-util-from-dom` | `5.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast-util-from-html` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast-util-from-html-isomorphic` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast-util-from-parse5` | `8.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast-util-has-property` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `hast-util-is-body-ok-link` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `hast-util-is-element` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast-util-minify-whitespace` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `hast-util-parse-selector` | `2.2.5` | [yarn.lock](../yarn.lock) |
| `hast-util-parse-selector` | `3.1.1` | [yarn.lock](../yarn.lock) |
| `hast-util-parse-selector` | `4.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast-util-phrasing` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `hast-util-raw` | `9.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast-util-sanitize` | `5.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast-util-to-estree` | `2.3.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `hast-util-to-html` | `9.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast-util-to-jsx-runtime` | `2.3.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast-util-to-parse5` | `8.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast-util-to-string` | `3.0.1` | [yarn.lock](../yarn.lock) |
| `hast-util-to-text` | `4.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hast-util-whitespace` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `hast-util-whitespace` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hastscript` | `6.0.0` | [yarn.lock](../yarn.lock) |
| `hastscript` | `7.2.0` | [yarn.lock](../yarn.lock) |
| `hastscript` | `9.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `he` | `1.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `highlight.js` | `10.7.3` | [yarn.lock](../yarn.lock) |
| `highlight.js` | `11.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `highlight.js` | `9.12.0` | [yarn.lock](../yarn.lock) |
| `highlightjs-vue` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `hmac-drbg` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `homedir-polyfill` | `1.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `hookable` | `5.5.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `hosted-git-info` | `7.0.2` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hosted-git-info` | `8.1.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `hosted-git-info` | `9.0.0` | [yarn.lock](../yarn.lock) |
| `html-encoding-sniffer` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `html-escaper` | `2.0.2` | [yarn.lock](../yarn.lock) |
| `html-parse-stringify` | `3.0.1` | [yarn.lock](../yarn.lock) |
| `html-url-attributes` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `html-void-elements` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `html-whitespace-sensitive-tag-names` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `htmlfy` | `0.8.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `htmlparser2` | `10.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `http-cache-semantics` | `4.2.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `http-proxy-agent` | `7.0.2` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `http-signature` | `1.2.0` | [yarn.lock](../yarn.lock) |
| `https-browserify` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `https-proxy-agent` | `7.0.6` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `httpsnippet-lite` | `3.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `human-signals` | `2.1.0` | [yarn.lock](../yarn.lock) |
| `human-signals` | `8.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `husky` | `9.1.7` | [yarn.lock](../yarn.lock) |
| `i18next` | `25.0.2` | [yarn.lock](../yarn.lock) |
| `iconv-lite` | `0.6.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `iconv-lite` | `0.7.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `iconv-lite` | `0.7.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `idb` | `7.1.1` | [yarn.lock](../yarn.lock) |
| `ieee754` | `1.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ignore` | `5.3.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ignore` | `7.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `ignore-walk` | `6.0.5` | [yarn.lock](../yarn.lock) |
| `ignore-walk` | `8.0.0` | [yarn.lock](../yarn.lock) |
| `immediate` | `3.0.6` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `immutable` | `5.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `import-fresh` | `3.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `import-meta-resolve` | `4.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `imurmurhash` | `0.1.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `indent-string` | `4.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `inflight` | `1.0.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `inherits` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `inherits` | `2.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ini` | `1.3.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ini` | `4.1.3` | [yarn.lock](../yarn.lock) |
| `ini` | `5.0.0` | [yarn.lock](../yarn.lock) |
| `inline-style-parser` | `0.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `inline-style-parser` | `0.2.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `inquirer` | `12.11.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `inquirer` | `9.3.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `internal-slot` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `internmap` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `internmap` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `interpret` | `3.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `intersection-observer` | `0.12.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `ip-address` | `10.0.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ip-address` | `10.7.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `is-absolute` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-absolute-url` | `4.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-accessor-descriptor` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `is-alphabetical` | `1.0.4` | [yarn.lock](../yarn.lock) |
| `is-alphabetical` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-alphanumerical` | `1.0.4` | [yarn.lock](../yarn.lock) |
| `is-alphanumerical` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-arguments` | `1.2.0` | [yarn.lock](../yarn.lock) |
| `is-array-buffer` | `3.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-arrayish` | `0.2.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `is-arrayish` | `0.3.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-async-function` | `2.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-bigint` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-binary-path` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `is-binary-path` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-boolean-object` | `1.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-buffer` | `1.1.6` | [yarn.lock](../yarn.lock) |
| `is-buffer` | `2.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-bun-module` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-callable` | `1.2.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-core-module` | `2.16.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-data-descriptor` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `is-data-view` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-date-object` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-decimal` | `1.0.4` | [yarn.lock](../yarn.lock) |
| `is-decimal` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-descriptor` | `0.1.7` | [yarn.lock](../yarn.lock) |
| `is-descriptor` | `1.0.3` | [yarn.lock](../yarn.lock) |
| `is-docker` | `2.2.1` | [yarn.lock](../yarn.lock) |
| `is-dotfile` | `1.0.3` | [yarn.lock](../yarn.lock) |
| `is-equal-shallow` | `0.1.3` | [yarn.lock](../yarn.lock) |
| `is-extendable` | `0.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-extendable` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `is-extglob` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `is-extglob` | `2.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-finalizationregistry` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-fullwidth-code-point` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-generator-function` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-glob` | `2.0.1` | [yarn.lock](../yarn.lock) |
| `is-glob` | `4.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-hexadecimal` | `1.0.4` | [yarn.lock](../yarn.lock) |
| `is-hexadecimal` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-interactive` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-lambda` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `is-map` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-module` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `is-nan` | `1.3.2` | [yarn.lock](../yarn.lock) |
| `is-negative-zero` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-number` | `2.1.0` | [yarn.lock](../yarn.lock) |
| `is-number` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `is-number` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `is-number` | `7.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-number-object` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-obj` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-obj` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-path-inside` | `3.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-plain-obj` | `2.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `is-plain-obj` | `4.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-plain-object` | `2.0.4` | [yarn.lock](../yarn.lock) |
| `is-plain-object` | `5.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-port-reachable` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `is-posix-bracket` | `0.1.1` | [yarn.lock](../yarn.lock) |
| `is-potential-custom-element-name` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `is-primitive` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `is-reference` | `3.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-regex` | `1.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-regexp` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-relative` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-set` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-shared-array-buffer` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-ssh` | `1.4.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-stream` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-stream` | `2.0.1` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-stream` | `4.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `is-string` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-symbol` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-typed-array` | `1.1.15` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-typedarray` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `is-unc-path` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `is-unicode-supported` | `0.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `is-unicode-supported` | `2.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `is-weakmap` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-weakref` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-weakset` | `2.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-windows` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `is-wsl` | `2.2.0` | [yarn.lock](../yarn.lock) |
| `isarray` | `1.0.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `isarray` | `2.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `isbinaryfile` | `5.0.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `isbot` | `5.1.32` | [yarn.lock](../yarn.lock) |
| `isexe` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `isexe` | `3.1.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `isexe` | `4.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `isobject` | `2.1.0` | [yarn.lock](../yarn.lock) |
| `isobject` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `isomorphic-timers-promises` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `isomorphic.js` | `0.2.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `isstream` | `0.1.2` | [yarn.lock](../yarn.lock) |
| `istanbul-api` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `istanbul-lib-coverage` | `2.0.5` | [yarn.lock](../yarn.lock) |
| `istanbul-lib-coverage` | `3.2.2` | [yarn.lock](../yarn.lock) |
| `istanbul-lib-hook` | `2.0.7` | [yarn.lock](../yarn.lock) |
| `istanbul-lib-instrument` | `3.3.0` | [yarn.lock](../yarn.lock) |
| `istanbul-lib-report` | `2.0.8` | [yarn.lock](../yarn.lock) |
| `istanbul-lib-report` | `3.0.1` | [yarn.lock](../yarn.lock) |
| `istanbul-lib-source-maps` | `3.0.6` | [yarn.lock](../yarn.lock) |
| `istanbul-lib-source-maps` | `5.0.6` | [yarn.lock](../yarn.lock) |
| `istanbul-reports` | `2.2.7` | [yarn.lock](../yarn.lock) |
| `istanbul-reports` | `3.1.7` | [yarn.lock](../yarn.lock) |
| `istanbul-reports` | `3.2.0` | [yarn.lock](../yarn.lock) |
| `iterator.prototype` | `1.1.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `jackspeak` | `2.3.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `jackspeak` | `3.4.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `jackspeak` | `4.1.1` | [yarn.lock](../yarn.lock) |
| `jake` | `10.9.4` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `jest-diff` | `30.5.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `jest-matcher-utils` | `30.5.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `jest-message-util` | `30.5.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `jest-mock` | `30.5.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `jest-regex-util` | `30.5.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `jest-util` | `30.5.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `jiti` | `1.21.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `jiti` | `2.4.2` | [yarn.lock](../yarn.lock) |
| `jiti` | `2.7.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `js-tokens` | `4.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `js-tokens` | `9.0.1` | [yarn.lock](../yarn.lock) |
| `js-yaml` | `3.14.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `js-yaml` | `4.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `js-yaml` | `4.3.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `jsbn` | `0.1.1` | [yarn.lock](../yarn.lock) |
| `jsdom` | `26.1.0` | [yarn.lock](../yarn.lock) |
| `jsesc` | `3.0.2` | [yarn.lock](../yarn.lock) |
| `jsesc` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `json-buffer` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `json-parse-even-better-errors` | `3.0.2` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `json-parse-even-better-errors` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `json-schema` | `0.4.0` | [yarn.lock](../yarn.lock) |
| `json-schema-traverse` | `0.4.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `json-schema-traverse` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `json-stable-stringify-without-jsonify` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `json-stringify-nice` | `1.1.4` | [yarn.lock](../yarn.lock) |
| `json-stringify-safe` | `5.0.1` | [yarn.lock](../yarn.lock) |
| `json5` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `json5` | `2.2.3` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `jsonc-parser` | `3.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `jsonfile` | `6.2.0` | [yarn.lock](../yarn.lock) |
| `jsonp` | `0.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `jsonparse` | `1.3.1` | [yarn.lock](../yarn.lock) |
| `jsonpointer` | `5.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `jsprim` | `1.4.2` | [yarn.lock](../yarn.lock) |
| `jsx-ast-utils` | `3.3.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `jszip` | `3.10.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `just-diff` | `6.0.2` | [yarn.lock](../yarn.lock) |
| `just-diff-apply` | `5.5.0` | [yarn.lock](../yarn.lock) |
| `katex` | `0.16.22` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `katex` | `0.16.32` | [yarn.lock](../yarn.lock) |
| `keyv` | `4.5.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `khroma` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `kind-of` | `3.2.2` | [yarn.lock](../yarn.lock) |
| `kind-of` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `kind-of` | `6.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `kleur` | `4.1.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `kolorist` | `1.8.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `langium` | `3.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `langium` | `4.2.1` | [yarn.lock](../yarn.lock) |
| `language-subtag-registry` | `0.3.23` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `language-tags` | `1.0.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `layerr` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `layout-base` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `layout-base` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `lazystream` | `1.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `leven` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `leven` | `4.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `levn` | `0.4.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `lib0` | `0.2.114` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `lie` | `3.3.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `liftoff` | `5.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `lightningcss` | `1.29.2` | [yarn.lock](../yarn.lock) |
| `lightningcss-darwin-arm64` | `1.29.2` | [yarn.lock](../yarn.lock) |
| `lightningcss-darwin-x64` | `1.29.2` | [yarn.lock](../yarn.lock) |
| `lightningcss-freebsd-x64` | `1.29.2` | [yarn.lock](../yarn.lock) |
| `lightningcss-linux-arm-gnueabihf` | `1.29.2` | [yarn.lock](../yarn.lock) |
| `lightningcss-linux-arm64-gnu` | `1.29.2` | [yarn.lock](../yarn.lock) |
| `lightningcss-linux-arm64-musl` | `1.29.2` | [yarn.lock](../yarn.lock) |
| `lightningcss-linux-x64-gnu` | `1.29.2` | [yarn.lock](../yarn.lock) |
| `lightningcss-linux-x64-musl` | `1.29.2` | [yarn.lock](../yarn.lock) |
| `lightningcss-win32-arm64-msvc` | `1.29.2` | [yarn.lock](../yarn.lock) |
| `lightningcss-win32-x64-msvc` | `1.29.2` | [yarn.lock](../yarn.lock) |
| `lilconfig` | `3.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `lines-and-columns` | `1.2.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `lines-and-columns` | `2.0.4` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `local-pkg` | `1.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `locate-app` | `2.5.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `locate-path` | `6.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `locate-path` | `7.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `lodash` | `4.17.21` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `lodash` | `4.18.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `lodash-es` | `4.17.21` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `lodash-es` | `4.17.23` | [yarn.lock](../yarn.lock) |
| `lodash.clonedeep` | `4.5.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `lodash.debounce` | `4.0.8` | [yarn.lock](../yarn.lock) |
| `lodash.flattendeep` | `4.4.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `lodash.get` | `4.4.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `lodash.merge` | `4.6.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `lodash.pickby` | `4.6.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `lodash.sortby` | `4.7.0` | [yarn.lock](../yarn.lock) |
| `lodash.union` | `4.6.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `lodash.zip` | `4.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `log-symbols` | `4.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `loglevel` | `1.9.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `loglevel-plugin-prefix` | `0.8.4` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `longest-streak` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `loose-envify` | `1.4.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `loupe` | `3.1.4` | [yarn.lock](../yarn.lock) |
| `loupe` | `3.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `lowlight` | `1.20.0` | [yarn.lock](../yarn.lock) |
| `lowlight` | `1.9.2` | [yarn.lock](../yarn.lock) |
| `lowlight` | `3.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `lru-cache` | `10.4.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `lru-cache` | `11.2.1` | [yarn.lock](../yarn.lock) |
| `lru-cache` | `4.1.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `lru-cache` | `5.1.1` | [yarn.lock](../yarn.lock) |
| `lru-cache` | `7.18.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `lucide-react` | `0.522.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `lucide-react` | `0.560.0` | [yarn.lock](../yarn.lock) |
| `lucide-react` | `0.562.0` | [yarn.lock](../yarn.lock) |
| `lucide-react` | `0.563.0` | [yarn.lock](../yarn.lock) |
| `lz-string` | `1.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `magic-string` | `0.25.9` | [yarn.lock](../yarn.lock) |
| `magic-string` | `0.30.17` | [yarn.lock](../yarn.lock) |
| `magic-string` | `0.30.19` | [yarn.lock](../yarn.lock) |
| `magic-string` | `0.30.21` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `magicast` | `0.3.5` | [yarn.lock](../yarn.lock) |
| `make-dir` | `2.1.0` | [yarn.lock](../yarn.lock) |
| `make-dir` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `make-fetch-happen` | `13.0.1` | [yarn.lock](../yarn.lock) |
| `make-fetch-happen` | `14.0.3` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `make-fetch-happen` | `15.0.1` | [yarn.lock](../yarn.lock) |
| `map-cache` | `0.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `map-visit` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `markdown-extensions` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `markdown-table` | `3.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `marked` | `16.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `marked` | `16.4.2` | [yarn.lock](../yarn.lock) |
| `marked` | `17.0.3` | [yarn.lock](../yarn.lock) |
| `match-sorter` | `6.4.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `math-intrinsics` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `math-random` | `1.0.4` | [yarn.lock](../yarn.lock) |
| `matter-js` | `0.20.0` | [yarn.lock](../yarn.lock) |
| `md5.js` | `1.3.5` | [yarn.lock](../yarn.lock) |
| `mdast-util-definitions` | `5.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-find-and-replace` | `2.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-find-and-replace` | `3.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-from-markdown` | `1.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-from-markdown` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-gfm` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-gfm` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-gfm-autolink-literal` | `1.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-gfm-autolink-literal` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-gfm-footnote` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-gfm-footnote` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-gfm-strikethrough` | `1.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-gfm-strikethrough` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-gfm-table` | `1.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-gfm-table` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-gfm-task-list-item` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-gfm-task-list-item` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-math` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-math` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `mdast-util-mdx` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-mdx-expression` | `1.3.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-mdx-expression` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-mdx-jsx` | `2.1.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-mdx-jsx` | `3.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-mdxjs-esm` | `1.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-mdxjs-esm` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-newline-to-break` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `mdast-util-phrasing` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-phrasing` | `4.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-to-hast` | `12.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-to-hast` | `13.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-to-markdown` | `1.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-to-markdown` | `2.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mdast-util-to-string` | `3.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mdast-util-to-string` | `4.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `merge-stream` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `merge2` | `1.4.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mermaid` | `10.9.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mermaid` | `11.12.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mermaid` | `11.12.3` | [yarn.lock](../yarn.lock) |
| `micromark` | `3.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark` | `4.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-core-commonmark` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-core-commonmark` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-extension-cjk-friendly` | `1.2.3` | [yarn.lock](../yarn.lock) |
| `micromark-extension-cjk-friendly-gfm-strikethrough` | `1.2.3` | [yarn.lock](../yarn.lock) |
| `micromark-extension-cjk-friendly-util` | `2.1.1` | [yarn.lock](../yarn.lock) |
| `micromark-extension-gfm` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-extension-gfm` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-extension-gfm-autolink-literal` | `1.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-extension-gfm-autolink-literal` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-extension-gfm-footnote` | `1.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-extension-gfm-footnote` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-extension-gfm-strikethrough` | `1.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-extension-gfm-strikethrough` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-extension-gfm-table` | `1.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-extension-gfm-table` | `2.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-extension-gfm-tagfilter` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-extension-gfm-tagfilter` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-extension-gfm-task-list-item` | `1.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-extension-gfm-task-list-item` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-extension-math` | `2.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-extension-math` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `micromark-extension-mdx-expression` | `1.0.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-extension-mdx-jsx` | `1.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-extension-mdx-md` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-extension-mdxjs` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-extension-mdxjs-esm` | `1.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-factory-destination` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-factory-destination` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-factory-label` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-factory-label` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-factory-mdx-expression` | `1.0.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-factory-space` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-factory-space` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-factory-title` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-factory-title` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-factory-whitespace` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-factory-whitespace` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-character` | `1.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-character` | `2.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-chunked` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-chunked` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-classify-character` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-classify-character` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-combine-extensions` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-combine-extensions` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-decode-numeric-character-reference` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-decode-numeric-character-reference` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-decode-string` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-decode-string` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-encode` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-encode` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-events-to-acorn` | `1.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-html-tag-name` | `1.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-html-tag-name` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-normalize-identifier` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-normalize-identifier` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-resolve-all` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-resolve-all` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-sanitize-uri` | `1.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-sanitize-uri` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-subtokenize` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-subtokenize` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-symbol` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-symbol` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromark-util-types` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `micromark-util-types` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `micromatch` | `2.3.11` | [yarn.lock](../yarn.lock) |
| `micromatch` | `3.1.10` | [yarn.lock](../yarn.lock) |
| `micromatch` | `4.0.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `miller-rabin` | `4.0.1` | [yarn.lock](../yarn.lock) |
| `mime-db` | `1.33.0` | [yarn.lock](../yarn.lock) |
| `mime-db` | `1.52.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mime-db` | `1.54.0` | [yarn.lock](../yarn.lock) |
| `mime-types` | `2.1.18` | [yarn.lock](../yarn.lock) |
| `mime-types` | `2.1.35` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mimic-fn` | `2.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `min-indent` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `minimalistic-assert` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `minimalistic-crypto-utils` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `minimatch` | `10.0.3` | [yarn.lock](../yarn.lock) |
| `minimatch` | `3.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `minimatch` | `3.1.5` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `minimatch` | `5.1.6` | [yarn.lock](../yarn.lock) |
| `minimatch` | `5.1.9` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `minimatch` | `9.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `minimatch` | `9.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `minimatch` | `9.0.9` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `minimist` | `1.2.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `minipass` | `2.9.0` | [yarn.lock](../yarn.lock) |
| `minipass` | `3.3.6` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `minipass` | `5.0.0` | [yarn.lock](../yarn.lock) |
| `minipass` | `7.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `minipass` | `7.1.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `minipass-collect` | `2.0.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `minipass-fetch` | `3.0.5` | [yarn.lock](../yarn.lock) |
| `minipass-fetch` | `4.0.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `minipass-flush` | `1.0.5` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `minipass-pipeline` | `1.2.4` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `minipass-sized` | `1.0.3` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `minizlib` | `1.3.3` | [yarn.lock](../yarn.lock) |
| `minizlib` | `2.1.2` | [yarn.lock](../yarn.lock) |
| `minizlib` | `3.0.2` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `minizlib` | `3.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `mitt` | `3.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `mixin-deep` | `1.3.2` | [yarn.lock](../yarn.lock) |
| `mkdirp` | `0.5.6` | [yarn.lock](../yarn.lock) |
| `mkdirp` | `1.0.4` | [yarn.lock](../yarn.lock) |
| `mkdirp` | `3.0.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mlly` | `1.8.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mocha` | `10.8.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `modern-tar` | `0.7.7` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `motion` | `12.34.3` | [yarn.lock](../yarn.lock) |
| `motion` | `12.37.0` | [yarn.lock](../yarn.lock) |
| `motion-dom` | `12.23.12` | [yarn.lock](../yarn.lock) |
| `motion-dom` | `12.23.18` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `motion-dom` | `12.34.3` | [yarn.lock](../yarn.lock) |
| `motion-dom` | `12.37.0` | [yarn.lock](../yarn.lock) |
| `motion-utils` | `12.23.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `motion-utils` | `12.29.2` | [yarn.lock](../yarn.lock) |
| `motion-utils` | `12.36.0` | [yarn.lock](../yarn.lock) |
| `mri` | `1.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mrmime` | `2.0.1` | [yarn.lock](../yarn.lock) |
| `ms` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ms` | `2.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `mute-stream` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `mute-stream` | `2.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `mz` | `2.7.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `nan` | `2.23.0` | [yarn.lock](../yarn.lock) |
| `nanoid` | `3.3.11` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `nanoid` | `3.3.8` | [yarn.lock](../yarn.lock) |
| `nanoid` | `5.1.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `nanomatch` | `1.2.13` | [yarn.lock](../yarn.lock) |
| `nanospinner` | `1.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `napi-postinstall` | `0.3.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `natural-compare` | `1.4.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `negotiator` | `0.6.4` | [yarn.lock](../yarn.lock) |
| `negotiator` | `1.0.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `neo-async` | `2.6.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `netmask` | `2.1.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `next` | `14.2.32` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `next-mdx-remote` | `4.4.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `next-seo` | `6.8.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `next-sitemap` | `4.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `next-themes` | `0.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `next-themes` | `0.4.6` | [yarn.lock](../yarn.lock) |
| `nextra` | `2.13.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `nextra-theme-docs` | `2.13.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `node-addon-api` | `7.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `node-domexception` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `node-emoji` | `2.2.0` | [yarn.lock](../yarn.lock) |
| `node-fetch` | `2.7.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `node-gyp` | `10.3.1` | [yarn.lock](../yarn.lock) |
| `node-gyp` | `11.4.2` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `node-gyp` | `13.0.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `node-int64` | `0.4.0` | [yarn.lock](../yarn.lock) |
| `node-plop` | `0.32.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `node-releases` | `2.0.19` | [yarn.lock](../yarn.lock) |
| `node-releases` | `2.0.21` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `node-stdlib-browser` | `1.3.1` | [yarn.lock](../yarn.lock) |
| `non-layered-tidy-tree-layout` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `nopt` | `10.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `nopt` | `7.2.1` | [yarn.lock](../yarn.lock) |
| `nopt` | `8.1.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `normalize-package-data` | `6.0.2` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `normalize-package-data` | `7.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `normalize-path` | `2.1.1` | [yarn.lock](../yarn.lock) |
| `normalize-path` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `normalize-range` | `0.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `npm-bundled` | `3.0.1` | [yarn.lock](../yarn.lock) |
| `npm-bundled` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `npm-install-checks` | `6.3.0` | [yarn.lock](../yarn.lock) |
| `npm-install-checks` | `7.1.2` | [yarn.lock](../yarn.lock) |
| `npm-normalize-package-bin` | `3.0.1` | [yarn.lock](../yarn.lock) |
| `npm-normalize-package-bin` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `npm-package-arg` | `11.0.3` | [yarn.lock](../yarn.lock) |
| `npm-package-arg` | `12.0.2` | [yarn.lock](../yarn.lock) |
| `npm-package-arg` | `13.0.0` | [yarn.lock](../yarn.lock) |
| `npm-packlist` | `10.0.1` | [yarn.lock](../yarn.lock) |
| `npm-packlist` | `8.0.2` | [yarn.lock](../yarn.lock) |
| `npm-pick-manifest` | `10.0.0` | [yarn.lock](../yarn.lock) |
| `npm-pick-manifest` | `9.1.0` | [yarn.lock](../yarn.lock) |
| `npm-registry-fetch` | `17.1.0` | [yarn.lock](../yarn.lock) |
| `npm-registry-fetch` | `19.0.0` | [yarn.lock](../yarn.lock) |
| `npm-run-path` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `npm-run-path` | `4.0.1` | [yarn.lock](../yarn.lock) |
| `npm-run-path` | `6.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `npm-to-yarn` | `2.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `nth-check` | `2.1.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `nwsapi` | `2.2.22` | [yarn.lock](../yarn.lock) |
| `oauth-sign` | `0.9.0` | [yarn.lock](../yarn.lock) |
| `object-assign` | `4.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `object-copy` | `0.1.0` | [yarn.lock](../yarn.lock) |
| `object-hash` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `object-inspect` | `1.13.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `object-is` | `1.1.6` | [yarn.lock](../yarn.lock) |
| `object-keys` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `object-visit` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `object.assign` | `4.1.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `object.defaults` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `object.entries` | `1.1.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `object.fromentries` | `2.0.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `object.groupby` | `1.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `object.omit` | `2.0.1` | [yarn.lock](../yarn.lock) |
| `object.pick` | `1.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `object.values` | `1.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `on-headers` | `1.1.0` | [yarn.lock](../yarn.lock) |
| `once` | `1.4.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `onetime` | `5.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `oniguruma-parser` | `0.12.1` | [yarn.lock](../yarn.lock) |
| `oniguruma-to-es` | `4.3.4` | [yarn.lock](../yarn.lock) |
| `openapi-types` | `12.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `optionator` | `0.9.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ora` | `5.4.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `os-browserify` | `0.3.0` | [yarn.lock](../yarn.lock) |
| `own-keys` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `p-finally` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `p-limit` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `p-limit` | `4.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `p-locate` | `5.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `p-locate` | `6.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `p-map` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `p-map` | `7.0.3` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `pac-proxy-agent` | `7.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `pac-resolver` | `7.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `package-json-from-dist` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `package-manager-detector` | `1.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `package-manager-detector` | `1.6.0` | [yarn.lock](../yarn.lock) |
| `packrup` | `0.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `pacote` | `18.0.6` | [yarn.lock](../yarn.lock) |
| `pacote` | `21.0.1` | [yarn.lock](../yarn.lock) |
| `pako` | `1.0.11` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `parent-module` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `parse-asn1` | `5.1.7` | [yarn.lock](../yarn.lock) |
| `parse-conflict-json` | `3.0.1` | [yarn.lock](../yarn.lock) |
| `parse-entities` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `parse-entities` | `4.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `parse-filepath` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `parse-glob` | `3.0.4` | [yarn.lock](../yarn.lock) |
| `parse-json` | `7.1.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `parse-ms` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `parse-ms` | `4.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `parse-numeric-range` | `1.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `parse-passwd` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `parse-path` | `7.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `parse-url` | `8.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `parse5` | `7.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `parse5-htmlparser2-tree-adapter` | `7.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `parse5-parser-stream` | `7.1.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `pascalcase` | `0.1.1` | [yarn.lock](../yarn.lock) |
| `path` | `0.12.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `path-browserify` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `path-data-parser` | `0.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `path-exists` | `4.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `path-exists` | `5.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `path-is-absolute` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `path-is-inside` | `1.0.2` | [yarn.lock](../yarn.lock) |
| `path-key` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `path-key` | `3.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `path-key` | `4.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `path-parse` | `1.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `path-root` | `0.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `path-root-regex` | `0.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `path-scurry` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `path-scurry` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `path-to-regexp` | `3.3.0` | [yarn.lock](../yarn.lock) |
| `path-type` | `4.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `path-type` | `6.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `pathe` | `1.1.2` | [yarn.lock](../yarn.lock) |
| `pathe` | `2.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `pathval` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `pbkdf2` | `3.1.3` | [yarn.lock](../yarn.lock) |
| `pend` | `1.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `performance-now` | `2.1.0` | [yarn.lock](../yarn.lock) |
| `periscopic` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `picocolors` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `picomatch` | `2.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `picomatch` | `2.3.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `picomatch` | `4.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `picomatch` | `4.0.7` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `pify` | `2.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `pify` | `4.0.1` | [yarn.lock](../yarn.lock) |
| `pirates` | `4.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `pkg-dir` | `5.0.0` | [yarn.lock](../yarn.lock) |
| `pkg-types` | `1.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `pkg-types` | `2.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `plop` | `4.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `plop-helper-date` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `points-on-curve` | `0.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `points-on-path` | `0.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `posix-character-classes` | `0.1.1` | [yarn.lock](../yarn.lock) |
| `possible-typed-array-names` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `postcss` | `8.4.31` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `postcss` | `8.5.3` | [yarn.lock](../yarn.lock) |
| `postcss` | `8.5.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `postcss-import` | `15.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `postcss-js` | `4.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `postcss-load-config` | `4.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `postcss-nested` | `6.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `postcss-selector-parser` | `6.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `postcss-value-parser` | `4.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `posthog-js` | `1.255.1` | [yarn.lock](../yarn.lock) |
| `posthog-js` | `1.268.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `preact` | `10.27.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `prelude-ls` | `1.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `preserve` | `0.2.0` | [yarn.lock](../yarn.lock) |
| `prettier` | `3.6.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `pretty-bytes` | `5.6.0` | [yarn.lock](../yarn.lock) |
| `pretty-bytes` | `6.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `pretty-format` | `27.5.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `pretty-format` | `30.5.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `pretty-ms` | `8.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `pretty-ms` | `9.3.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `prismjs` | `1.27.0` | [yarn.lock](../yarn.lock) |
| `prismjs` | `1.30.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `proc-log` | `4.2.0` | [yarn.lock](../yarn.lock) |
| `proc-log` | `5.0.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `proc-log` | `7.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `process` | `0.11.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `process-nextick-args` | `2.0.1` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `proggy` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `progress` | `2.0.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `promise-all-reject-late` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `promise-call-limit` | `3.0.2` | [yarn.lock](../yarn.lock) |
| `promise-inflight` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `promise-retry` | `2.0.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `prop-types` | `15.8.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `property-information` | `5.6.0` | [yarn.lock](../yarn.lock) |
| `property-information` | `6.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `property-information` | `7.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `protocols` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `proxy-agent` | `6.5.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `proxy-from-env` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `pseudomap` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `psl` | `1.15.0` | [yarn.lock](../yarn.lock) |
| `public-encrypt` | `4.0.3` | [yarn.lock](../yarn.lock) |
| `pump` | `3.0.4` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `punycode` | `1.4.1` | [yarn.lock](../yarn.lock) |
| `punycode` | `2.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `qs` | `6.14.0` | [yarn.lock](../yarn.lock) |
| `qs` | `6.5.3` | [yarn.lock](../yarn.lock) |
| `quansync` | `0.2.11` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `query-selector-shadow-dom` | `1.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `querystring-es3` | `0.2.1` | [yarn.lock](../yarn.lock) |
| `queue-microtask` | `1.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `radix-ui` | `1.4.3` | [yarn.lock](../yarn.lock) |
| `randomatic` | `3.1.1` | [yarn.lock](../yarn.lock) |
| `randombytes` | `2.1.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `randomfill` | `1.0.4` | [yarn.lock](../yarn.lock) |
| `range-parser` | `1.2.0` | [yarn.lock](../yarn.lock) |
| `rc` | `1.2.8` | [yarn.lock](../yarn.lock) |
| `react` | `18.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `react` | `19.0.0` | [yarn.lock](../yarn.lock) |
| `react-colorful` | `5.6.1` | [yarn.lock](../yarn.lock) |
| `react-dom` | `18.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `react-dom` | `19.0.0` | [yarn.lock](../yarn.lock) |
| `react-hook-form` | `7.63.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `react-i18next` | `15.5.1` | [yarn.lock](../yarn.lock) |
| `react-icons` | `5.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `react-is` | `16.13.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `react-is` | `17.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `react-is` | `18.3.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `react-is` | `19.3.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `react-lifecycles-compat` | `3.0.4` | [yarn.lock](../yarn.lock) |
| `react-markdown` | `10.1.0` | [yarn.lock](../yarn.lock) |
| `react-markdown` | `9.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `react-refresh` | `0.17.0` | [yarn.lock](../yarn.lock) |
| `react-remove-scroll` | `2.7.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `react-remove-scroll-bar` | `2.3.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `react-resizable-panels` | `3.0.5` | [yarn.lock](../yarn.lock) |
| `react-share` | `5.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `react-style-singleton` | `2.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `react-syntax-highlighter` | `15.6.1` | [yarn.lock](../yarn.lock) |
| `react-syntax-highlighter` | `5.8.0` | [yarn.lock](../yarn.lock) |
| `react-syntax-highlighter-virtualized-renderer` | `1.1.0` | [yarn.lock](../yarn.lock) |
| `react-textarea-autosize` | `8.5.9` | [yarn.lock](../yarn.lock) |
| `react-tweet` | `3.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `react-virtualized` | `9.22.6` | [yarn.lock](../yarn.lock) |
| `read-cache` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `read-cmd-shim` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `read-package-json-fast` | `3.0.2` | [yarn.lock](../yarn.lock) |
| `read-pkg` | `8.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `read-pkg-up` | `10.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `readable-stream` | `2.3.8` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `readable-stream` | `3.6.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `readable-stream` | `4.7.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `readdir-glob` | `1.1.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `readdirp` | `2.2.1` | [yarn.lock](../yarn.lock) |
| `readdirp` | `3.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `readdirp` | `4.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `reading-time` | `1.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `recast` | `0.23.11` | [yarn.lock](../yarn.lock) |
| `rechoir` | `0.8.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `recursive-readdir` | `2.2.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `redent` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `reflect.getprototypeof` | `1.0.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `refractor` | `3.6.0` | [yarn.lock](../yarn.lock) |
| `refractor` | `4.9.0` | [yarn.lock](../yarn.lock) |
| `regenerate` | `1.4.2` | [yarn.lock](../yarn.lock) |
| `regenerate-unicode-properties` | `10.2.2` | [yarn.lock](../yarn.lock) |
| `regenerator-runtime` | `0.11.1` | [yarn.lock](../yarn.lock) |
| `regenerator-runtime` | `0.14.1` | [yarn.lock](../yarn.lock) |
| `regex` | `6.1.0` | [yarn.lock](../yarn.lock) |
| `regex-cache` | `0.4.4` | [yarn.lock](../yarn.lock) |
| `regex-not` | `1.0.2` | [yarn.lock](../yarn.lock) |
| `regex-recursion` | `6.0.2` | [yarn.lock](../yarn.lock) |
| `regex-utilities` | `2.3.0` | [yarn.lock](../yarn.lock) |
| `regexp.prototype.flags` | `1.5.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `regexpu-core` | `6.3.1` | [yarn.lock](../yarn.lock) |
| `registry-auth-token` | `3.3.2` | [yarn.lock](../yarn.lock) |
| `registry-url` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `regjsgen` | `0.8.0` | [yarn.lock](../yarn.lock) |
| `regjsparser` | `0.12.0` | [yarn.lock](../yarn.lock) |
| `rehype` | `13.0.2` | [yarn.lock](../yarn.lock) |
| `rehype-external-links` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `rehype-format` | `5.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `rehype-harden` | `1.1.8` | [yarn.lock](../yarn.lock) |
| `rehype-highlight` | `7.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `rehype-katex` | `7.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `rehype-parse` | `9.0.1` | [yarn.lock](../yarn.lock) |
| `rehype-pretty-code` | `0.9.11` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `rehype-prism-plus` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `rehype-raw` | `7.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `rehype-sanitize` | `6.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `rehype-stringify` | `10.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `remark-breaks` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `remark-cjk-friendly` | `1.2.3` | [yarn.lock](../yarn.lock) |
| `remark-cjk-friendly-gfm-strikethrough` | `1.2.3` | [yarn.lock](../yarn.lock) |
| `remark-emoji` | `5.0.1` | [yarn.lock](../yarn.lock) |
| `remark-gfm` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `remark-gfm` | `4.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `remark-math` | `5.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `remark-math` | `6.0.0` | [yarn.lock](../yarn.lock) |
| `remark-mdx` | `2.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `remark-parse` | `10.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `remark-parse` | `11.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `remark-reading-time` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `remark-rehype` | `10.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `remark-rehype` | `11.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `remark-stringify` | `11.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `remove-accents` | `0.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `remove-trailing-separator` | `1.1.0` | [yarn.lock](../yarn.lock) |
| `repeat-element` | `1.1.4` | [yarn.lock](../yarn.lock) |
| `repeat-string` | `1.6.1` | [yarn.lock](../yarn.lock) |
| `request` | `2.88.2` | [yarn.lock](../yarn.lock) |
| `request-progress` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `require-directory` | `2.1.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `require-from-string` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `resolve` | `1.22.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `resolve` | `2.0.0-next.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `resolve-dir` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `resolve-from` | `4.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `resolve-pkg-maps` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `resolve-url` | `0.2.1` | [yarn.lock](../yarn.lock) |
| `resq` | `1.11.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `restore-cursor` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `ret` | `0.1.15` | [yarn.lock](../yarn.lock) |
| `ret` | `0.5.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `retry` | `0.12.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `reusify` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `rgb2hex` | `0.2.5` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `rimraf` | `2.7.1` | [yarn.lock](../yarn.lock) |
| `rimraf` | `3.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `rimraf` | `6.0.1` | [yarn.lock](../yarn.lock) |
| `ripemd160` | `2.0.1` | [yarn.lock](../yarn.lock) |
| `ripemd160` | `2.0.2` | [yarn.lock](../yarn.lock) |
| `robust-predicates` | `3.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `rolldown` | `1.0.0-beta.1` | [yarn.lock](../yarn.lock) |
| `rollup` | `2.79.2` | [yarn.lock](../yarn.lock) |
| `rollup` | `4.40.0` | [yarn.lock](../yarn.lock) |
| `rollup` | `4.50.1` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `rollup` | `4.50.2` | [yarn.lock](../yarn.lock) |
| `rollup` | `4.52.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `roughjs` | `4.6.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `rrweb-cssom` | `0.8.0` | [yarn.lock](../yarn.lock) |
| `run-async` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `run-async` | `4.0.6` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `run-parallel` | `1.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `run-script-os` | `1.1.6` | [yarn.lock](../yarn.lock) |
| `rw` | `1.3.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `rxjs` | `7.8.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `sade` | `1.8.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `safaridriver` | `1.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `safe-array-concat` | `1.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `safe-buffer` | `5.1.2` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `safe-buffer` | `5.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `safe-push-apply` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `safe-regex` | `1.1.0` | [yarn.lock](../yarn.lock) |
| `safe-regex-test` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `safe-regex2` | `5.1.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `safer-buffer` | `2.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `sass` | `1.93.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `saxes` | `6.0.0` | [yarn.lock](../yarn.lock) |
| `scheduler` | `0.23.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `scheduler` | `0.25.0` | [yarn.lock](../yarn.lock) |
| `scroll-into-view-if-needed` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `section-matter` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `semver` | `5.7.2` | [yarn.lock](../yarn.lock) |
| `semver` | `6.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `semver` | `7.7.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `semver` | `7.8.5` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `serialize-error` | `12.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `serialize-javascript` | `6.0.2` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `seroval` | `1.3.2` | [yarn.lock](../yarn.lock) |
| `seroval` | `1.4.0` | [yarn.lock](../yarn.lock) |
| `seroval` | `1.5.0` | [yarn.lock](../yarn.lock) |
| `seroval-plugins` | `1.3.3` | [yarn.lock](../yarn.lock) |
| `seroval-plugins` | `1.4.0` | [yarn.lock](../yarn.lock) |
| `seroval-plugins` | `1.5.0` | [yarn.lock](../yarn.lock) |
| `serve` | `14.2.5` | [yarn.lock](../yarn.lock) |
| `serve-handler` | `6.1.6` | [yarn.lock](../yarn.lock) |
| `set-function-length` | `1.2.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `set-function-name` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `set-proto` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `set-value` | `2.0.1` | [yarn.lock](../yarn.lock) |
| `setimmediate` | `1.0.5` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `sha.js` | `2.4.12` | [yarn.lock](../yarn.lock) |
| `sharp` | `0.33.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `shebang-command` | `1.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `shebang-command` | `2.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `shebang-regex` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `shebang-regex` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `shell-quote` | `1.8.3` | [yarn.lock](../yarn.lock) |
| `shiki` | `0.14.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `shiki` | `3.22.0` | [yarn.lock](../yarn.lock) |
| `side-channel` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `side-channel-list` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `side-channel-map` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `side-channel-weakmap` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `siginfo` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `signal-exit` | `3.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `signal-exit` | `4.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `sigstore` | `2.3.1` | [yarn.lock](../yarn.lock) |
| `sigstore` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `simple-swizzle` | `0.2.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `sirv` | `3.0.2` | [yarn.lock](../yarn.lock) |
| `skin-tone` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `slash` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `slash` | `5.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `smart-buffer` | `4.2.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `smob` | `1.5.0` | [yarn.lock](../yarn.lock) |
| `smol-toml` | `1.8.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `snapdragon` | `0.8.2` | [yarn.lock](../yarn.lock) |
| `snapdragon-node` | `2.1.1` | [yarn.lock](../yarn.lock) |
| `snapdragon-util` | `3.0.1` | [yarn.lock](../yarn.lock) |
| `socks` | `2.8.10` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `socks` | `2.8.7` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `socks-proxy-agent` | `8.0.5` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `solid-js` | `1.9.9` | [yarn.lock](../yarn.lock) |
| `sonner` | `2.0.5` | [yarn.lock](../yarn.lock) |
| `sonner` | `2.0.7` | [yarn.lock](../yarn.lock) |
| `sort-keys` | `5.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `source-map` | `0.5.7` | [yarn.lock](../yarn.lock) |
| `source-map` | `0.6.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `source-map` | `0.7.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `source-map` | `0.8.0-beta.0` | [yarn.lock](../yarn.lock) |
| `source-map-js` | `1.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `source-map-resolve` | `0.5.3` | [yarn.lock](../yarn.lock) |
| `source-map-support` | `0.5.21` | [yarn.lock](../yarn.lock) |
| `source-map-url` | `0.4.1` | [yarn.lock](../yarn.lock) |
| `sourcemap-codec` | `1.4.8` | [yarn.lock](../yarn.lock) |
| `space-separated-tokens` | `1.1.5` | [yarn.lock](../yarn.lock) |
| `space-separated-tokens` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `spacetrim` | `0.11.59` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `spdx-correct` | `3.2.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `spdx-exceptions` | `2.5.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `spdx-expression-parse` | `3.0.1` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `spdx-license-ids` | `3.0.22` | [yarn.lock](../yarn.lock) |
| `spdx-license-ids` | `3.0.23` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `split-string` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `split2` | `4.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `sprintf-js` | `1.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `sshpk` | `1.18.0` | [yarn.lock](../yarn.lock) |
| `ssri` | `10.0.6` | [yarn.lock](../yarn.lock) |
| `ssri` | `12.0.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `stable-hash` | `0.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `stack-utils` | `2.0.6` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `stackback` | `0.0.2` | [yarn.lock](../yarn.lock) |
| `static-extend` | `0.1.2` | [yarn.lock](../yarn.lock) |
| `std-env` | `3.9.0` | [yarn.lock](../yarn.lock) |
| `stop-iteration-iterator` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `stream-browserify` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `stream-buffers` | `3.0.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `stream-http` | `3.2.0` | [yarn.lock](../yarn.lock) |
| `streamsearch` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `streamx` | `2.28.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `string-width` | `4.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `string-width` | `5.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `string-width-cjs` | `4.2.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `string.prototype.includes` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `string.prototype.matchall` | `4.0.12` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `string.prototype.repeat` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `string.prototype.trim` | `1.2.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `string.prototype.trimend` | `1.0.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `string.prototype.trimstart` | `1.0.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `string_decoder` | `1.1.1` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `string_decoder` | `1.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `stringify-entities` | `4.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `stringify-object` | `3.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `strip-ansi` | `6.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `strip-ansi` | `7.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `strip-ansi` | `7.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `strip-ansi-cjs` | `6.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `strip-bom` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `strip-bom-string` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `strip-comments` | `2.0.1` | [yarn.lock](../yarn.lock) |
| `strip-eof` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `strip-final-newline` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `strip-final-newline` | `4.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `strip-indent` | `3.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `strip-json-comments` | `2.0.1` | [yarn.lock](../yarn.lock) |
| `strip-json-comments` | `3.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `strip-literal` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `style-mod` | `4.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `style-to-js` | `1.1.17` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `style-to-object` | `0.4.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `style-to-object` | `1.0.9` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `styled-jsx` | `5.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `stylis` | `4.3.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `subarg` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `sucrase` | `3.35.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `supports-color` | `4.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `supports-color` | `6.1.0` | [yarn.lock](../yarn.lock) |
| `supports-color` | `7.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `supports-color` | `8.1.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `supports-preserve-symlinks-flag` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `swr` | `2.3.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `swr` | `2.4.0` | [yarn.lock](../yarn.lock) |
| `symbol-tree` | `3.2.4` | [yarn.lock](../yarn.lock) |
| `tailwind-merge` | `2.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `tailwind-merge` | `3.3.1` | [yarn.lock](../yarn.lock) |
| `tailwind-merge` | `3.5.0` | [yarn.lock](../yarn.lock) |
| `tailwindcss` | `3.4.17` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `tailwindcss` | `4.1.17` | [yarn.lock](../yarn.lock) |
| `tailwindcss` | `4.1.4` | [yarn.lock](../yarn.lock) |
| `tapable` | `2.2.3` | [yarn.lock](../yarn.lock) |
| `tar` | `4.4.19` | [yarn.lock](../yarn.lock) |
| `tar` | `6.2.1` | [yarn.lock](../yarn.lock) |
| `tar` | `7.4.3` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `tar` | `7.5.22` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `tar-fs` | `3.1.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `tar-stream` | `3.2.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `teex` | `1.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `temp-dir` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `tempy` | `0.6.0` | [yarn.lock](../yarn.lock) |
| `terser` | `5.44.0` | [yarn.lock](../yarn.lock) |
| `test-exclude` | `7.0.1` | [yarn.lock](../yarn.lock) |
| `text-decoder` | `1.2.7` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `text-table` | `0.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `thenify` | `3.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `thenify-all` | `1.6.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `third-party-capital` | `1.0.20` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `throttleit` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `throttleit` | `2.1.0` | [yarn.lock](../yarn.lock) |
| `timers-browserify` | `2.0.12` | [yarn.lock](../yarn.lock) |
| `tiny-invariant` | `1.3.3` | [yarn.lock](../yarn.lock) |
| `tiny-warning` | `1.0.3` | [yarn.lock](../yarn.lock) |
| `tinybench` | `2.9.0` | [yarn.lock](../yarn.lock) |
| `tinyexec` | `0.3.2` | [yarn.lock](../yarn.lock) |
| `tinyexec` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `tinyexec` | `1.0.2` | [yarn.lock](../yarn.lock) |
| `tinyglobby` | `0.2.12` | [yarn.lock](../yarn.lock) |
| `tinyglobby` | `0.2.14` | [yarn.lock](../yarn.lock) |
| `tinyglobby` | `0.2.15` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `tinyglobby` | `0.2.17` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `tinypool` | `1.1.1` | [yarn.lock](../yarn.lock) |
| `tinyrainbow` | `1.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `tinyrainbow` | `2.0.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `tinyrainbow` | `3.1.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `tinyspy` | `3.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `tinyspy` | `4.0.3` | [yarn.lock](../yarn.lock) |
| `title` | `3.5.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `title-case` | `4.3.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `titleize` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `tldts` | `6.1.86` | [yarn.lock](../yarn.lock) |
| `tldts-core` | `6.1.86` | [yarn.lock](../yarn.lock) |
| `to-buffer` | `1.2.1` | [yarn.lock](../yarn.lock) |
| `to-object-path` | `0.3.0` | [yarn.lock](../yarn.lock) |
| `to-regex` | `3.0.2` | [yarn.lock](../yarn.lock) |
| `to-regex-range` | `2.1.1` | [yarn.lock](../yarn.lock) |
| `to-regex-range` | `5.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `totalist` | `3.0.1` | [yarn.lock](../yarn.lock) |
| `tough-cookie` | `2.5.0` | [yarn.lock](../yarn.lock) |
| `tough-cookie` | `5.1.2` | [yarn.lock](../yarn.lock) |
| `tr46` | `0.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `tr46` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `tr46` | `5.1.1` | [yarn.lock](../yarn.lock) |
| `treeverse` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `trim-lines` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `trough` | `2.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ts-api-utils` | `1.4.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `ts-api-utils` | `2.1.0` | [yarn.lock](../yarn.lock) |
| `ts-dedent` | `2.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `ts-interface-checker` | `0.1.13` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `tsconfig-paths` | `3.15.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `tslib` | `2.8.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `tsx` | `4.20.5` | [yarn.lock](../yarn.lock) |
| `tsx` | `4.23.13` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `tty-browserify` | `0.0.1` | [yarn.lock](../yarn.lock) |
| `tuf-js` | `2.2.1` | [yarn.lock](../yarn.lock) |
| `tuf-js` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `tunnel-agent` | `0.6.0` | [yarn.lock](../yarn.lock) |
| `tw-animate-css` | `1.2.8` | [yarn.lock](../yarn.lock) |
| `tweetnacl` | `0.14.5` | [yarn.lock](../yarn.lock) |
| `type-check` | `0.4.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `type-fest` | `0.16.0` | [yarn.lock](../yarn.lock) |
| `type-fest` | `0.20.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `type-fest` | `0.21.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `type-fest` | `1.4.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `type-fest` | `2.19.0` | [yarn.lock](../yarn.lock) |
| `type-fest` | `3.13.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `type-fest` | `4.26.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `type-fest` | `4.41.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `typed-array-buffer` | `1.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `typed-array-byte-length` | `1.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `typed-array-byte-offset` | `1.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `typed-array-length` | `1.0.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `typescript` | `5.8.3` | [yarn.lock](../yarn.lock) |
| `typescript` | `5.9.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `typescript` | `5.9.3` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `typescript-eslint` | `8.31.0` | [yarn.lock](../yarn.lock) |
| `ufo` | `1.6.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `ufo` | `1.6.3` | [yarn.lock](../yarn.lock) |
| `uglify-js` | `3.19.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `ulidx` | `2.4.1` | [yarn.lock](../yarn.lock) |
| `unbox-primitive` | `1.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `unc-path-regex` | `0.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `undici` | `6.28.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `undici` | `7.29.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `undici` | `8.10.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `undici-types` | `6.21.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `undici-types` | `7.12.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `undici-types` | `8.9.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `unhead` | `1.11.20` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unicode-canonical-property-names-ecmascript` | `2.0.1` | [yarn.lock](../yarn.lock) |
| `unicode-emoji-modifier-base` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `unicode-match-property-ecmascript` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `unicode-match-property-value-ecmascript` | `2.2.1` | [yarn.lock](../yarn.lock) |
| `unicode-property-aliases-ecmascript` | `2.2.0` | [yarn.lock](../yarn.lock) |
| `unicorn-magic` | `0.3.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `unified` | `10.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unified` | `11.0.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `union-value` | `1.0.1` | [yarn.lock](../yarn.lock) |
| `unique-filename` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `unique-filename` | `4.0.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `unique-slug` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `unique-slug` | `5.0.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `unique-string` | `2.0.0` | [yarn.lock](../yarn.lock) |
| `unist-util-filter` | `5.0.1` | [yarn.lock](../yarn.lock) |
| `unist-util-find-after` | `5.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `unist-util-generated` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unist-util-is` | `5.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unist-util-is` | `6.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `unist-util-position` | `4.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unist-util-position` | `5.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `unist-util-position-from-estree` | `1.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unist-util-remove` | `4.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unist-util-remove-position` | `4.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unist-util-remove-position` | `5.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `unist-util-stringify-position` | `3.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unist-util-stringify-position` | `4.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `unist-util-visit` | `3.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unist-util-visit` | `4.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unist-util-visit` | `5.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `unist-util-visit-parents` | `4.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unist-util-visit-parents` | `5.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unist-util-visit-parents` | `6.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `universalify` | `2.0.1` | [yarn.lock](../yarn.lock) |
| `unplugin` | `2.3.10` | [yarn.lock](../yarn.lock) |
| `unrs-resolver` | `1.11.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `unset-value` | `1.0.0` | [yarn.lock](../yarn.lock) |
| `unzipper` | `0.12.3` | [yarn.lock](../yarn.lock) |
| `upath` | `1.2.0` | [yarn.lock](../yarn.lock) |
| `update-browserslist-db` | `1.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `update-check` | `1.5.4` | [yarn.lock](../yarn.lock) |
| `uri-js` | `4.4.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `urix` | `0.1.0` | [yarn.lock](../yarn.lock) |
| `url` | `0.11.4` | [yarn.lock](../yarn.lock) |
| `urlpattern-polyfill` | `10.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `use` | `3.1.1` | [yarn.lock](../yarn.lock) |
| `use-callback-ref` | `1.3.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `use-composed-ref` | `1.4.0` | [yarn.lock](../yarn.lock) |
| `use-isomorphic-layout-effect` | `1.2.1` | [yarn.lock](../yarn.lock) |
| `use-latest` | `1.3.0` | [yarn.lock](../yarn.lock) |
| `use-sidecar` | `1.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `use-stick-to-bottom` | `1.1.3` | [yarn.lock](../yarn.lock) |
| `use-sync-external-store` | `1.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `use-sync-external-store` | `1.6.0` | [yarn.lock](../yarn.lock) |
| `userhome` | `1.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `util` | `0.10.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `util` | `0.12.5` | [yarn.lock](../yarn.lock) |
| `util-deprecate` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `uuid` | `11.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `uuid` | `3.4.0` | [yarn.lock](../yarn.lock) |
| `uuid` | `9.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `uvu` | `0.5.6` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `v8flags` | `4.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `validate-npm-package-license` | `3.0.4` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `validate-npm-package-name` | `5.0.1` | [yarn.lock](../yarn.lock) |
| `validate-npm-package-name` | `6.0.2` | [yarn.lock](../yarn.lock) |
| `vary` | `1.1.2` | [yarn.lock](../yarn.lock) |
| `vaul` | `1.1.2` | [yarn.lock](../yarn.lock) |
| `verror` | `1.10.0` | [yarn.lock](../yarn.lock) |
| `vfile` | `5.3.7` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `vfile` | `6.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `vfile-location` | `5.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `vfile-matter` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `vfile-message` | `3.1.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `vfile-message` | `4.0.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `vite` | `5.4.20` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `vite` | `6.3.2` | [yarn.lock](../yarn.lock) |
| `vite` | `7.1.5` | [yarn.lock](../yarn.lock) |
| `vite-node` | `2.1.9` | [yarn.lock](../yarn.lock) |
| `vite-node` | `3.2.4` | [yarn.lock](../yarn.lock) |
| `vite-plugin-node-polyfills` | `0.23.0` | [yarn.lock](../yarn.lock) |
| `vite-plugin-pwa` | `1.0.3` | [yarn.lock](../yarn.lock) |
| `vitest` | `2.1.9` | [yarn.lock](../yarn.lock) |
| `vitest` | `3.2.4` | [yarn.lock](../yarn.lock) |
| `vm-browserify` | `1.1.2` | [yarn.lock](../yarn.lock) |
| `void-elements` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `vscode-jsonrpc` | `8.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `vscode-languageserver` | `9.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `vscode-languageserver-protocol` | `3.17.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `vscode-languageserver-textdocument` | `1.0.12` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `vscode-languageserver-types` | `3.17.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `vscode-oniguruma` | `1.7.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `vscode-textmate` | `8.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `vscode-uri` | `3.0.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `vscode-uri` | `3.1.0` | [yarn.lock](../yarn.lock) |
| `vue-demi` | `0.14.10` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `w3c-keyname` | `2.2.8` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `w3c-xmlserializer` | `5.0.0` | [yarn.lock](../yarn.lock) |
| `wait-port` | `1.1.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `walk-up-path` | `3.0.1` | [yarn.lock](../yarn.lock) |
| `wcwidth` | `1.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `web-namespaces` | `2.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `web-streams-polyfill` | `4.0.0-beta.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `web-vitals` | `4.2.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `web-worker` | `1.5.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `webdriver` | `9.30.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `webdriver` | `9.31.9` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `webdriverio` | `9.30.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `webdriverio` | `9.31.9` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `webidl-conversions` | `3.0.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `webidl-conversions` | `4.0.2` | [yarn.lock](../yarn.lock) |
| `webidl-conversions` | `7.0.0` | [yarn.lock](../yarn.lock) |
| `webpack-virtual-modules` | `0.6.2` | [yarn.lock](../yarn.lock) |
| `whatwg-encoding` | `3.1.1` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `whatwg-mimetype` | `3.0.0` | [yarn.lock](../yarn.lock) |
| `whatwg-mimetype` | `4.0.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `whatwg-url` | `14.2.0` | [yarn.lock](../yarn.lock) |
| `whatwg-url` | `5.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `whatwg-url` | `7.1.0` | [yarn.lock](../yarn.lock) |
| `which` | `1.3.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `which` | `2.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `which` | `4.0.0` | [yarn.lock](../yarn.lock) |
| `which` | `5.0.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `which` | `6.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `which` | `7.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `which-boxed-primitive` | `1.1.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `which-builtin-type` | `1.2.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `which-collection` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `which-typed-array` | `1.1.19` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `why-is-node-running` | `2.3.0` | [yarn.lock](../yarn.lock) |
| `widest-line` | `4.0.1` | [yarn.lock](../yarn.lock) |
| `word-wrap` | `1.2.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `wordwrap` | `1.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `workbox-background-sync` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-broadcast-update` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-build` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-cacheable-response` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-core` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-expiration` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-google-analytics` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-navigation-preload` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-precaching` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-range-requests` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-recipes` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-routing` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-strategies` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-streams` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-sw` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workbox-window` | `7.3.0` | [yarn.lock](../yarn.lock) |
| `workerpool` | `6.5.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `wrap-ansi` | `6.2.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `wrap-ansi` | `7.0.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `wrap-ansi` | `8.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `wrap-ansi-cjs` | `7.0.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `wrappy` | `1.0.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `write-file-atomic` | `5.0.1` | [yarn.lock](../yarn.lock) |
| `ws` | `8.18.3` | [yarn.lock](../yarn.lock) |
| `ws` | `8.21.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `xml-name-validator` | `5.0.0` | [yarn.lock](../yarn.lock) |
| `xmlchars` | `2.2.0` | [yarn.lock](../yarn.lock) |
| `xtend` | `4.0.2` | [yarn.lock](../yarn.lock) |
| `y-codemirror.next` | `0.3.5` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `y18n` | `5.0.8` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `yallist` | `2.1.2` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `yallist` | `4.0.0` | [src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `yallist` | `5.0.0` | [e2e/yarn.lock](../e2e/yarn.lock)<br>[src-tauri/plugins/yarn.lock](../src-tauri/plugins/yarn.lock) |
| `yaml` | `2.8.1` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `yaml` | `2.9.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `yargs` | `16.2.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `yargs` | `17.7.3` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `yargs-parser` | `20.2.9` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `yargs-parser` | `21.1.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `yargs-unparser` | `2.0.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `yauzl` | `2.10.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `yocto-queue` | `0.1.0` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `yocto-queue` | `1.2.2` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `yoctocolors` | `2.2.0` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `yoctocolors-cjs` | `2.1.3` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[e2e/yarn.lock](../e2e/yarn.lock) |
| `zhead` | `2.2.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock) |
| `zip-stream` | `6.0.1` | [e2e/yarn.lock](../e2e/yarn.lock) |
| `zod` | `3.24.3` | [yarn.lock](../yarn.lock) |
| `zod` | `3.25.76` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |
| `zod` | `4.3.6` | [yarn.lock](../yarn.lock) |
| `zustand` | `5.0.3` | [yarn.lock](../yarn.lock) |
| `zwitch` | `2.0.4` | [docs/yarn.lock](https://github.com/TRON-ABS/Novera/blob/0990a25c7/docs/yarn.lock)<br>[yarn.lock](../yarn.lock) |

## Annexe B — versions Rust verrouillées

Les sources Git comportent la révision enregistrée par Cargo. Les packages locaux sans champ `source` sont exclus de cette annexe.

| Crate | Version | Origine | Verrous contenant cette version |
| --- | --- | --- | --- |
| `adler2` | `2.0.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `adobe-cmap-parser` | `0.4.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `aead` | `0.5.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `aes` | `0.8.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `aes-gcm` | `0.10.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `agent-client-protocol` | `2.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `agent-client-protocol-derive` | `2.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `agent-client-protocol-schema` | `1.9.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ahash` | `0.8.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `aho-corasick` | `1.1.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `aho-corasick` | `1.1.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `alloc-no-stdlib` | `2.0.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `alloc-stdlib` | `0.2.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `allocator-api2` | `0.2.21` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `android_log-sys` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `android_logger` | `0.15.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `android_system_properties` | `0.1.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `android_system_properties` | `0.1.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `anstream` | `1.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `anstyle` | `1.0.14` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `anstyle-parse` | `1.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `anstyle-query` | `1.1.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `anstyle-wincon` | `3.0.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `anyhow` | `1.0.102` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `anyhow` | `1.0.103` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `anyhow` | `1.0.104` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `approx` | `0.5.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `arbitrary` | `1.4.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `arboard` | `3.6.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ash` | `0.37.3+1.3.251` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `ashpd` | `0.11.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `async-broadcast` | `0.7.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `async-channel` | `2.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `async-compression` | `0.4.43` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `async-compression` | `0.4.45` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `async-executor` | `1.14.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `async-fs` | `2.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `async-io` | `2.6.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `async-lock` | `3.4.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `async-process` | `2.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `async-recursion` | `1.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `async-signal` | `0.2.14` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `async-task` | `4.7.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `async-trait` | `0.1.89` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `async-trait` | `0.1.92` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `atk` | `0.18.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `atk-sys` | `0.18.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `atoi` | `2.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `atomic` | `0.6.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `atomic-waker` | `1.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `autocfg` | `1.5.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `aws-lc-rs` | `1.18.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `aws-lc-rs` | `1.18.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `aws-lc-sys` | `0.44.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `aws-lc-sys` | `0.45.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `axum` | `0.8.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `axum-core` | `0.5.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `base64` | `0.21.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `base64` | `0.22.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `base64` | `0.23.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `base64ct` | `1.8.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `bincode` | `1.3.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `bit-set` | `0.5.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `bit-set` | `0.8.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `bit-vec` | `0.6.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `bit-vec` | `0.8.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `bitflags` | `1.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `bitflags` | `2.13.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `bitflags` | `2.13.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `block-buffer` | `0.10.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `block-padding` | `0.3.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `block2` | `0.6.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `blocking` | `1.6.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `blocking` | `1.7.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `brotli` | `8.0.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `brotli-decompressor` | `5.0.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `bs58` | `0.5.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `bstr` | `1.12.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `bstr` | `1.13.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `bumpalo` | `3.20.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `by_address` | `1.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `bytemuck` | `1.25.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `bytemuck` | `1.25.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `bytemuck` | `1.25.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `bytemuck_derive` | `1.10.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `bytemuck_derive` | `1.11.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `byteorder` | `1.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `byteorder-lite` | `0.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `bytes` | `1.12.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `bytes` | `1.12.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `bzip2` | `0.4.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `bzip2-sys` | `0.1.13+1.0.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cairo-rs` | `0.18.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cairo-sys-rs` | `0.18.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `calamine` | `0.23.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `camino` | `1.2.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `camino` | `1.2.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `camino` | `1.2.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `cargo-platform` | `0.1.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cargo_metadata` | `0.19.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cargo_toml` | `0.22.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `castaway` | `0.2.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `cbc` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cc` | `1.2.65` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `cc` | `1.2.67` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cc` | `1.4.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `cesu8` | `1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cfb` | `0.7.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cff-parser` | `0.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cfg-expr` | `0.15.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cfg-expr` | `0.20.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `cfg-if` | `1.0.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `cfg_aliases` | `0.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `cfg_aliases` | `0.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `chacha20` | `0.10.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `chacha20` | `0.10.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `chardetng` | `0.1.17` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `chrono` | `0.4.45` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cipher` | `0.4.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `clap` | `4.6.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `clap` | `4.6.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `clap_builder` | `4.6.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `clap_builder` | `4.6.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `clap_derive` | `4.6.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `clap_derive` | `4.6.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `clap_lex` | `1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `clipboard-win` | `5.4.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `cmake` | `0.1.58` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `codepage` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `colorchoice` | `1.0.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `combine` | `4.6.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `combine` | `4.6.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `comfy-table` | `7.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `compact_str` | `0.9.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `compression-codecs` | `0.4.38` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `compression-codecs` | `0.4.40` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `compression-core` | `0.4.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `compression-core` | `0.4.33` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `concurrent-queue` | `2.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `console` | `0.15.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `const-oid` | `0.9.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `const-random` | `0.1.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `const-random-macro` | `0.1.16` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `constant_time_eq` | `0.1.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `convert_case` | `0.10.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `cookie` | `0.18.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cookie_store` | `0.22.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `core-foundation` | `0.10.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `core-foundation` | `0.9.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `core-foundation-sys` | `0.8.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `core-graphics` | `0.25.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `core-graphics-types` | `0.1.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `core-graphics-types` | `0.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `core_detect` | `1.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `cpufeatures` | `0.2.17` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `cpufeatures` | `0.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cpufeatures` | `0.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `crc` | `3.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `crc-catalog` | `2.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `crc32fast` | `1.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `crc32fast` | `1.5.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `critical-section` | `1.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `crossbeam-channel` | `0.5.15` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `crossbeam-channel` | `0.5.16` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `crossbeam-deque` | `0.8.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `crossbeam-deque` | `0.8.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `crossbeam-epoch` | `0.9.20` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `crossbeam-epoch` | `0.9.21` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `crossbeam-queue` | `0.3.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `crossbeam-queue` | `0.3.13` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `crossbeam-utils` | `0.8.21` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `crossbeam-utils` | `0.8.22` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `crossbeam-utils` | `0.8.23` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `crossterm` | `0.29.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `crossterm_winapi` | `0.9.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `crunchy` | `0.2.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `crypto-common` | `0.1.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `csscolorparser` | `0.6.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `cssparser` | `0.36.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `cssparser-macros` | `0.6.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `csv` | `1.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `csv-core` | `0.1.13` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ctor` | `0.8.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ctor-proc-macro` | `0.0.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ctr` | `0.9.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `curve25519-dalek` | `4.1.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `curve25519-dalek-derive` | `0.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `darling` | `0.20.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `darling` | `0.23.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `darling` | `0.24.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `darling_core` | `0.20.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `darling_core` | `0.23.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `darling_core` | `0.24.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `darling_macro` | `0.20.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `darling_macro` | `0.23.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `darling_macro` | `0.24.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `dashmap` | `5.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `data-url` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `dbus` | `0.9.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `dbus-secret-service` | `4.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `defmt` | `1.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `defmt-macros` | `1.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `defmt-parser` | `1.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `deltae` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `der` | `0.7.10` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `deranged` | `0.5.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `derive_arbitrary` | `1.4.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `derive_more` | `2.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `derive_more-impl` | `2.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `digest` | `0.10.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `dirs` | `6.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `dirs-sys` | `0.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `dispatch2` | `0.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `displaydoc` | `0.2.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `displaydoc` | `0.2.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `dlib` | `0.5.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `dlopen2` | `0.8.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `dlopen2_derive` | `0.4.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `dlv-list` | `0.5.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `document-features` | `0.2.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `dom_query` | `0.27.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `dotenvy` | `0.15.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `downcast-rs` | `1.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `dpi` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `dtoa` | `1.0.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `dtoa-short` | `0.3.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `dtor` | `0.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `dtor-proc-macro` | `0.0.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `dunce` | `1.0.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `dyn-clone` | `1.0.20` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ecb` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ed25519` | `2.2.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ed25519-dalek` | `2.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `either` | `1.16.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `either` | `1.18.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `embed-resource` | `3.0.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `embed-resource` | `3.0.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `embed_plist` | `1.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `encode_unicode` | `1.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `encoding_rs` | `0.8.35` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `encoding_rs` | `0.8.41` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `endi` | `1.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `enumflags2` | `0.7.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `enumflags2_derive` | `0.7.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `env` | `1.0.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `env_filter` | `0.1.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `env_filter` | `2.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `env_logger` | `0.11.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `equivalent` | `1.0.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `erased-serde` | `0.4.10` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `errno` | `0.3.14` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `error-code` | `3.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `error-code` | `3.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `etcetera` | `0.8.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `euclid` | `0.20.14` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `euclid` | `0.22.14` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `event-listener` | `5.4.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `event-listener` | `5.4.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `event-listener-strategy` | `0.5.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `eventsource-stream` | `0.2.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `fallible-iterator` | `0.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `fallible-streaming-iterator` | `0.1.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `fancy-regex` | `0.11.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `fancy-regex` | `0.16.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `fast-srgb8` | `1.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `fastrand` | `2.4.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `fastrand` | `2.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `fax` | `0.2.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `fdeflate` | `0.3.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `fern` | `0.7.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `fiat-crypto` | `0.2.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `field-offset` | `0.3.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `filedescriptor` | `0.8.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `filetime` | `0.2.29` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `find-msvc-tools` | `0.1.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `find-msvc-tools` | `0.1.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `finl_unicode` | `1.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `fix-path-env` | `0.0.0` | `git+https://github.com/tauri-apps/fix-path-env-rs#c4c45d503ea115a839aae718d02f79e7c7f0f673` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `fixedbitset` | `0.4.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `fixedbitset` | `0.5.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `flate2` | `1.1.10` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `flate2` | `1.1.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `flume` | `0.11.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `fnv` | `1.0.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `foldhash` | `0.1.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `foldhash` | `0.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `foreign-types` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `foreign-types` | `0.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `foreign-types-macros` | `0.2.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `foreign-types-shared` | `0.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `foreign-types-shared` | `0.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `form_urlencoded` | `1.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `fs-err` | `3.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `fs-err` | `3.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `fs_extra` | `1.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `futf` | `0.1.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `futures` | `0.3.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `futures` | `0.3.34` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `futures-channel` | `0.3.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `futures-channel` | `0.3.34` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `futures-concurrency` | `7.7.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `futures-core` | `0.3.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `futures-core` | `0.3.34` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `futures-executor` | `0.3.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `futures-executor` | `0.3.34` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `futures-intrusive` | `0.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `futures-io` | `0.3.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `futures-io` | `0.3.34` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `futures-lite` | `2.6.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `futures-macro` | `0.3.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `futures-macro` | `0.3.34` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `futures-sink` | `0.3.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `futures-sink` | `0.3.34` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `futures-task` | `0.3.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `futures-task` | `0.3.34` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `futures-util` | `0.3.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `futures-util` | `0.3.34` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `gdk` | `0.18.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `gdk-pixbuf` | `0.18.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `gdk-pixbuf-sys` | `0.18.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `gdk-sys` | `0.18.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `gdkwayland-sys` | `0.18.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `gdkx11` | `0.18.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `gdkx11-sys` | `0.18.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `genai` | `0.7.0-beta.19` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `generic-array` | `0.14.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `gethostname` | `1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `getrandom` | `0.2.17` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `getrandom` | `0.3.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `getrandom` | `0.4.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `ghash` | `0.5.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `gio` | `0.18.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `gio-sys` | `0.18.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `gio-sys` | `0.21.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `glib` | `0.18.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `glib` | `0.21.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `glib-macros` | `0.18.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `glib-macros` | `0.21.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `glib-sys` | `0.18.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `glib-sys` | `0.21.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `glob` | `0.3.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `glob` | `0.3.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `globset` | `0.4.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `globset` | `0.4.20` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `gobject-sys` | `0.18.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `gobject-sys` | `0.21.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `goblin` | `0.10.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `gtk` | `0.18.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `gtk-sys` | `0.18.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `gtk3-macros` | `0.18.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `h2` | `0.4.15` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `h2` | `0.4.19` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `half` | `2.7.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `hashbrown` | `0.12.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `hashbrown` | `0.14.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `hashbrown` | `0.15.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `hashbrown` | `0.16.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `hashbrown` | `0.17.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `hashlink` | `0.10.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `hashlink` | `0.9.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `heck` | `0.4.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `heck` | `0.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `hermit-abi` | `0.5.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `hermit-abi` | `0.5.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `hex` | `0.4.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `hkdf` | `0.12.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `hmac` | `0.12.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `home` | `0.5.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `hostname` | `0.4.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `html2text` | `0.11.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `html5ever` | `0.26.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `html5ever` | `0.38.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `http` | `1.4.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `http` | `1.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `http-body` | `1.0.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `http-body` | `1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `http-body-util` | `0.1.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `http-body-util` | `0.1.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `http-body-util` | `0.1.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `http-range` | `0.1.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `httparse` | `1.10.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `httpdate` | `1.0.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `hyper` | `1.10.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `hyper` | `1.11.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `hyper-rustls` | `0.27.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `hyper-tls` | `0.6.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `hyper-util` | `0.1.20` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `iana-time-zone` | `0.1.65` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `iana-time-zone-haiku` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ico` | `0.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `icu_collections` | `2.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `icu_collections` | `2.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `icu_locale_core` | `2.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `icu_locale_core` | `2.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `icu_normalizer` | `2.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `icu_normalizer` | `2.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `icu_normalizer_data` | `2.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `icu_normalizer_data` | `2.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `icu_properties` | `2.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `icu_properties` | `2.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `icu_properties_data` | `2.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `icu_properties_data` | `2.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `icu_provider` | `2.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `icu_provider` | `2.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ident_case` | `1.0.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `idna` | `1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `idna_adapter` | `1.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `ignore` | `0.4.28` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `ignore` | `0.4.33` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `image` | `0.25.10` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `indexmap` | `1.9.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `indexmap` | `2.14.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `indexmap` | `2.14.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `indicatif` | `0.17.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `indoc` | `2.0.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `infer` | `0.15.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `infer` | `0.19.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `inout` | `0.1.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `insta` | `1.49.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `instability` | `0.3.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `instability` | `0.3.13` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ipnet` | `2.12.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `ipnet` | `2.12.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `is-docker` | `0.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `is-wsl` | `0.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `is_terminal_polyfill` | `1.70.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `itertools` | `0.14.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `itoa` | `1.0.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `javascriptcore-rs` | `1.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `javascriptcore-rs-sys` | `1.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `jiff` | `0.2.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `jiff` | `0.2.35` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `jiff-core` | `0.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `jiff-static` | `0.2.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `jiff-static` | `0.2.35` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `jiff-tzdb` | `0.1.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `jiff-tzdb-platform` | `0.1.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `jni` | `0.21.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `jni` | `0.22.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `jni-macros` | `0.22.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `jni-sys` | `0.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `jni-sys` | `0.4.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `jni-sys-macros` | `0.4.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `jobserver` | `0.1.35` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `js-sys` | `0.3.102` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `js-sys` | `0.3.103` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `js-sys` | `0.3.105` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `json-patch` | `3.0.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `jsonptr` | `0.6.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `kasuari` | `0.4.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `keyboard-types` | `0.7.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `keyring` | `3.6.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `lab` | `0.11.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `lazy_static` | `1.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `lddtree` | `0.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `lddtree` | `0.5.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `libappindicator` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `libappindicator-sys` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `libc` | `0.2.186` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `libc` | `0.2.189` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `libdbus-sys` | `0.2.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `libloading` | `0.7.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `libloading` | `0.8.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `libm` | `0.2.16` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `libredox` | `0.1.17` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `libredox` | `0.1.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `libredox` | `0.1.23` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `libsqlite3-sys` | `0.30.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `line-clipping` | `0.3.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `line-clipping` | `0.3.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `linux-raw-sys` | `0.12.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `litemap` | `0.8.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `litemap` | `0.8.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `litrs` | `1.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `lock_api` | `0.4.14` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `log` | `0.4.33` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `log` | `0.4.34` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `lopdf` | `0.42.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `lru` | `0.18.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `lru` | `0.18.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `lru-slab` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `mac` | `0.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `mac_address` | `1.1.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `machine-uid` | `0.5.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `macro_rules_attribute` | `0.2.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `macro_rules_attribute-proc_macro` | `0.2.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `malloc_buf` | `0.0.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `markup5ever` | `0.11.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `markup5ever` | `0.38.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `matchit` | `0.8.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `md-5` | `0.10.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `memchr` | `2.8.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `memchr` | `2.8.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `memmap2` | `0.9.10` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `memmap2` | `0.9.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `memmem` | `0.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `memoffset` | `0.9.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `mime` | `0.3.17` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `mime_guess` | `2.0.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `minimal-lexical` | `0.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `minisign-verify` | `0.2.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `miniz_oxide` | `0.8.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `miniz_oxide` | `0.9.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `mio` | `1.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `mio` | `1.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `mio` | `1.2.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `moxcms` | `0.8.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `muda` | `0.19.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `multiversion` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `multiversion-macros` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `multiversion_no_op` | `1.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `native-tls` | `0.2.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `ndk` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `ndk-sys` | `0.6.0+11769913` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `new_debug_unreachable` | `1.0.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `nix` | `0.29.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `nix` | `0.30.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `nix` | `0.31.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `nom` | `7.1.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `nom` | `8.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ntapi` | `0.4.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `num` | `0.4.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `num-bigint` | `0.4.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `num-bigint-dig` | `0.8.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `num-complex` | `0.4.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `num-conv` | `0.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `num-derive` | `0.4.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `num-integer` | `0.1.46` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `num-integer` | `0.1.47` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `num-iter` | `0.1.46` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `num-rational` | `0.4.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `num-traits` | `0.2.19` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `num_enum` | `0.7.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `num_enum_derive` | `0.7.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `num_threads` | `0.1.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `number_prefix` | `0.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `nvml-wrapper` | `0.10.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `nvml-wrapper-sys` | `0.8.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `oauth2` | `5.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `objc` | `0.2.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `objc2` | `0.6.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `objc2-app-kit` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `objc2-cloud-kit` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `objc2-core-data` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `objc2-core-foundation` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `objc2-core-graphics` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `objc2-core-image` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `objc2-core-location` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `objc2-core-text` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `objc2-core-video` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `objc2-encode` | `4.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `objc2-exception-helper` | `0.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `objc2-foundation` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `objc2-io-surface` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `objc2-javascript-core` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `objc2-osa-kit` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `objc2-quartz-core` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `objc2-security` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `objc2-ui-kit` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `objc2-user-notifications` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `objc2-web-kit` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `once_cell` | `1.21.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `once_cell_polyfill` | `1.70.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `opaque-debug` | `0.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `open` | `5.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `openssl` | `0.10.81` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `openssl-macros` | `0.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `openssl-probe` | `0.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `openssl-sys` | `0.9.117` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `option-ext` | `0.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ordered-float` | `4.6.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ordered-multimap` | `0.7.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `ordered-stream` | `0.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `os_info` | `3.15.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `os_pipe` | `1.2.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `osakit` | `0.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `palette` | `0.7.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `palette` | `0.7.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `palette_derive` | `0.7.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `palette_derive` | `0.7.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `palette_math` | `0.7.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pango` | `0.18.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `pango-sys` | `0.18.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `parking` | `2.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `parking_lot` | `0.12.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `parking_lot_core` | `0.9.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `password-hash` | `0.4.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `paste` | `1.0.15` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pastey` | `0.2.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pbkdf2` | `0.11.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `pdf-extract` | `0.12.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `pem-rfc7468` | `0.7.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `percent-encoding` | `2.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `pest` | `2.8.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `pest` | `2.9.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pest_derive` | `2.8.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `pest_derive` | `2.9.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pest_generator` | `2.8.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `pest_generator` | `2.9.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pest_meta` | `2.8.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `pest_meta` | `2.9.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `petgraph` | `0.8.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `phf` | `0.10.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `phf` | `0.11.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `phf` | `0.13.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `phf_codegen` | `0.10.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `phf_codegen` | `0.11.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `phf_codegen` | `0.13.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `phf_generator` | `0.10.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `phf_generator` | `0.11.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `phf_generator` | `0.13.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `phf_macros` | `0.11.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `phf_macros` | `0.13.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `phf_shared` | `0.10.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `phf_shared` | `0.11.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `phf_shared` | `0.13.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `pin-project` | `1.1.13` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pin-project-internal` | `1.1.13` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pin-project-lite` | `0.2.17` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `piper` | `0.2.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pkcs1` | `0.7.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `pkcs8` | `0.10.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pkg-config` | `0.3.33` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `pkg-config` | `0.3.34` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `plain` | `0.2.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `plist` | `1.10.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `plist` | `1.10.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `plist` | `1.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `png` | `0.17.16` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `png` | `0.18.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `polling` | `3.11.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pollster` | `0.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `polyval` | `0.6.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pom` | `1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `portable-atomic` | `1.13.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `portable-atomic` | `1.15.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `portable-atomic-util` | `0.2.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `portable-atomic-util` | `0.2.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `postscript` | `0.14.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `potential_utf` | `0.1.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `potential_utf` | `0.1.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `powerfmt` | `0.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ppv-lite86` | `0.2.21` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `precomputed-hash` | `0.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `proc-macro-crate` | `1.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `proc-macro-crate` | `2.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `proc-macro-crate` | `2.0.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `proc-macro-crate` | `3.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `proc-macro-error` | `1.0.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `proc-macro-error-attr` | `1.0.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `proc-macro2` | `1.0.106` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `proc-macro2` | `1.0.107` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `process-wrap` | `9.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `psl-types` | `2.0.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `publicsuffix` | `2.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `pulldown-cmark` | `0.13.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `pxfm` | `0.1.30` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `quick-error` | `2.0.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `quick-xml` | `0.31.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `quick-xml` | `0.39.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `quick-xml` | `0.41.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `quick-xml` | `0.42.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `quinn` | `0.11.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `quinn` | `0.11.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `quinn-proto` | `0.11.14` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `quinn-proto` | `0.11.16` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `quinn-proto` | `0.11.17` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `quinn-udp` | `0.5.14` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `quinn-udp` | `0.5.15` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `quote` | `1.0.46` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `quote` | `1.0.47` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `r-efi` | `5.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `r-efi` | `6.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rand` | `0.10.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `rand` | `0.8.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rand` | `0.8.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `rand` | `0.8.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `rand` | `0.9.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rand` | `0.9.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `rand_chacha` | `0.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rand_chacha` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rand_core` | `0.10.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `rand_core` | `0.6.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rand_core` | `0.9.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rand_pcg` | `0.10.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `rangemap` | `1.7.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ratatui` | `0.30.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ratatui-core` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ratatui-crossterm` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ratatui-macros` | `0.7.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ratatui-termina` | `0.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ratatui-termwiz` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ratatui-widgets` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `raw-window-handle` | `0.5.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `raw-window-handle` | `0.6.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `redox_syscall` | `0.5.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `redox_syscall` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `redox_users` | `0.5.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ref-cast` | `1.0.25` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ref-cast` | `1.0.27` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `ref-cast-impl` | `1.0.25` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ref-cast-impl` | `1.0.27` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `regex` | `1.12.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `regex` | `1.13.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `regex` | `1.13.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `regex-automata` | `0.4.14` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `regex-automata` | `0.4.15` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `regex-automata` | `0.4.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `regex-syntax` | `0.8.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `reqwest` | `0.12.28` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `reqwest` | `0.13.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `reqwest` | `0.13.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `rfd` | `0.15.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `rfd` | `0.16.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `ring` | `0.17.14` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rmcp` | `3.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `rmcp-macros` | `3.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `rsa` | `0.9.10` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `rusqlite` | `0.32.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `rust-ini` | `0.21.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `rustc-hash` | `2.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rustc-hash` | `2.1.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `rustc_version` | `0.4.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `rustix` | `1.1.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rustls` | `0.23.40` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rustls` | `0.23.42` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `rustls` | `0.23.44` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `rustls-native-certs` | `0.8.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `rustls-pki-types` | `1.14.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rustls-pki-types` | `1.15.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `rustls-pki-types` | `1.15.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `rustls-platform-verifier` | `0.7.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `rustls-platform-verifier-android` | `0.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `rustls-webpki` | `0.103.13` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rustls-webpki` | `0.103.15` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `rustversion` | `1.0.22` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `rustversion` | `1.0.23` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `ryu` | `1.0.23` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `same-file` | `1.0.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `schannel` | `0.1.29` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `schemars` | `0.8.22` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `schemars` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `schemars` | `1.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `schemars` | `1.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `schemars_derive` | `0.8.22` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `schemars_derive` | `1.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `schemars_derive` | `1.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `scoped-tls` | `1.0.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `scopeguard` | `1.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `scroll` | `0.13.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `scroll_derive` | `0.13.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `secret-service` | `4.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `security-framework` | `2.11.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `security-framework` | `3.7.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `security-framework-sys` | `2.17.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `selectors` | `0.36.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `semver` | `1.0.28` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `serde` | `1.0.228` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `serde` | `1.0.229` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `serde-untagged` | `0.1.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `serde_core` | `1.0.228` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `serde_core` | `1.0.229` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `serde_derive` | `1.0.228` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `serde_derive` | `1.0.229` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `serde_derive_internals` | `0.29.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `serde_derive_internals` | `0.30.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `serde_json` | `1.0.150` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `serde_json` | `1.0.151` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `serde_path_to_error` | `0.1.20` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `serde_repr` | `0.1.20` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `serde_repr` | `0.1.21` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `serde_spanned` | `0.6.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `serde_spanned` | `1.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `serde_urlencoded` | `0.7.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `serde_with` | `3.21.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `serde_with` | `3.23.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `serde_with_macros` | `3.21.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `serde_with_macros` | `3.23.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `serde_yaml` | `0.9.34+deprecated` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `serialize-to-javascript` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `serialize-to-javascript-impl` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `servo_arc` | `0.4.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `sha1` | `0.10.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `sha2` | `0.10.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `shared_child` | `1.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `shell-words` | `1.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `shlex` | `2.0.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `sigchld` | `0.2.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `signal-hook` | `0.3.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `signal-hook-mio` | `0.2.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `signal-hook-registry` | `1.4.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `signature` | `2.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `simd-adler32` | `0.3.10` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `simd-adler32` | `0.3.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `simd_cesu8` | `1.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `simdutf8` | `0.1.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `similar` | `2.7.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `siphasher` | `0.3.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `siphasher` | `1.0.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `slab` | `0.4.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `smallvec` | `1.15.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `smallvec` | `1.16.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `socket2` | `0.6.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `socket2` | `0.6.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `softbuffer` | `0.4.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `soup3` | `0.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `soup3-sys` | `0.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `spin` | `0.9.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `spki` | `0.7.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `sqlx` | `0.8.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `sqlx-core` | `0.8.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `sqlx-macros` | `0.8.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `sqlx-macros-core` | `0.8.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `sqlx-mysql` | `0.8.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `sqlx-postgres` | `0.8.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `sqlx-sqlite` | `0.8.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `sse-stream` | `0.2.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `sse-stream` | `0.2.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `stable_deref_trait` | `1.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `static_assertions` | `1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `string_cache` | `0.8.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `string_cache` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `string_cache_codegen` | `0.5.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `string_cache_codegen` | `0.6.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `stringprep` | `0.1.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `strip-ansi-escapes` | `0.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `strsim` | `0.11.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `strum` | `0.28.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `strum_macros` | `0.28.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `subtle` | `2.6.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `swift-rs` | `1.0.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `swift-rs` | `1.0.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `syn` | `1.0.109` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `syn` | `2.0.118` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `syn` | `2.0.119` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `syn` | `3.0.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `sync_wrapper` | `1.0.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `synstructure` | `0.13.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `syntect` | `5.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `sys-locale` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `sysinfo` | `0.34.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `system-configuration` | `0.7.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `system-configuration-sys` | `0.6.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `system-deps` | `6.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `system-deps` | `7.0.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tao` | `0.35.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tao-macros` | `0.1.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tar` | `0.4.46` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `target-lexicon` | `0.12.16` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `target-lexicon` | `0.13.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri` | `2.11.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `tauri` | `2.11.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `tauri-build` | `2.6.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `tauri-codegen` | `2.6.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `tauri-macros` | `2.6.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `tauri-plugin` | `2.6.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `tauri-plugin-deep-link` | `2.4.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-plugin-dialog` | `2.7.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-plugin-fs` | `2.5.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-plugin-http` | `2.5.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-plugin-log` | `2.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-plugin-opener` | `2.5.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-plugin-os` | `2.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-plugin-shell` | `2.3.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-plugin-single-instance` | `2.4.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-plugin-store` | `2.4.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-plugin-updater` | `2.10.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-plugin-wdio-webdriver` | `1.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-runtime` | `2.11.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `tauri-runtime-wry` | `2.11.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tauri-utils` | `2.9.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `tauri-winres` | `0.3.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `tempfile` | `3.27.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tendril` | `0.4.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `tendril` | `0.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `tendril` | `0.5.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `termina` | `0.3.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `terminfo` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `termios` | `0.3.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `termwiz` | `0.23.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `thiserror` | `1.0.69` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `thiserror` | `2.0.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `thiserror` | `2.0.20` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `thiserror-impl` | `1.0.69` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `thiserror-impl` | `2.0.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `thiserror-impl` | `2.0.20` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `thread_local` | `1.1.10` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `thread_local` | `1.1.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `tiff` | `0.11.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `time` | `0.3.51` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `time` | `0.3.53` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `time` | `0.3.55` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `time-core` | `0.1.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `time-macros` | `0.2.30` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `time-macros` | `0.2.31` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `time-macros` | `0.2.32` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `tiny-keccak` | `2.0.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tinystr` | `0.8.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tinystr` | `0.8.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `tinyvec` | `1.11.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tinyvec` | `1.12.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `tinyvec` | `1.13.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `tinyvec_macros` | `0.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tokio` | `1.52.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tokio` | `1.53.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `tokio-macros` | `2.7.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tokio-macros` | `2.7.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `tokio-native-tls` | `0.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tokio-rustls` | `0.26.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tokio-rustls` | `0.26.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `tokio-stream` | `0.1.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tokio-stream` | `0.1.19` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `tokio-util` | `0.7.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tokio-util` | `0.7.19` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `toml` | `0.8.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `toml` | `0.8.23` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `toml` | `0.9.12+spec-1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `toml` | `1.1.2+spec-1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `toml` | `1.1.3+spec-1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `toml` | `1.1.5+spec-1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `toml_datetime` | `0.6.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `toml_datetime` | `0.6.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `toml_datetime` | `0.7.5+spec-1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `toml_datetime` | `1.1.1+spec-1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `toml_edit` | `0.19.15` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `toml_edit` | `0.20.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `toml_edit` | `0.20.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `toml_edit` | `0.22.27` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `toml_edit` | `0.23.10+spec-1.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `toml_edit` | `0.25.13+spec-1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `toml_parser` | `1.1.2+spec-1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `toml_parser` | `1.1.3+spec-1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `toml_write` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `toml_writer` | `1.1.1+spec-1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `toml_writer` | `1.1.2+spec-1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `tower` | `0.5.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tower-http` | `0.6.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tower-layer` | `0.3.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tower-service` | `0.3.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tracing` | `0.1.44` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tracing-attributes` | `0.1.31` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `tracing-core` | `0.1.36` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `tray-icon` | `0.24.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `tree_magic_mini` | `3.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `try-lock` | `0.2.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `ttf-parser` | `0.25.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `type1-encoding-parser` | `0.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `typeid` | `1.0.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `typenum` | `1.20.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `ucd-trie` | `0.1.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `uds_windows` | `1.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `unic-char-property` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `unic-char-range` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `unic-common` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `unic-ucd-ident` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `unic-ucd-version` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `unicase` | `2.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `unicode-bidi` | `0.3.18` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `unicode-ident` | `1.0.24` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `unicode-normalization` | `0.1.25` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `unicode-properties` | `0.1.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `unicode-segmentation` | `1.13.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `unicode-truncate` | `2.0.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `unicode-width` | `0.1.14` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `unicode-width` | `0.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `unicode-xid` | `0.2.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `universal-hash` | `0.5.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `unsafe-libyaml` | `0.2.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `untrusted` | `0.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `url` | `2.5.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `urlencoding` | `2.1.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `urlpattern` | `0.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `utf-8` | `0.7.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `utf8_iter` | `1.0.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `utf8parse` | `0.2.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `uuid` | `1.23.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `uuid` | `1.23.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `uuid` | `1.26.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `value-ext` | `0.1.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `vcpkg` | `0.2.15` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `version-compare` | `0.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `version_check` | `0.9.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `vk-parse` | `0.12.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `vswhom` | `0.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `vswhom-sys` | `0.1.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `vte` | `0.14.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `vtparse` | `0.6.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `vulkano` | `0.34.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `vulkano-macros` | `0.34.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `walkdir` | `2.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `want` | `0.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `wasi` | `0.11.1+wasi-snapshot-preview1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `wasip2` | `1.0.4+wasi-0.2.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `wasite` | `0.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `wasm-bindgen` | `0.2.125` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `wasm-bindgen` | `0.2.126` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `wasm-bindgen` | `0.2.128` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wasm-bindgen-futures` | `0.4.75` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `wasm-bindgen-futures` | `0.4.76` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `wasm-bindgen-futures` | `0.4.78` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wasm-bindgen-macro` | `0.2.125` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `wasm-bindgen-macro` | `0.2.126` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `wasm-bindgen-macro` | `0.2.128` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wasm-bindgen-macro-support` | `0.2.125` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `wasm-bindgen-macro-support` | `0.2.126` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `wasm-bindgen-macro-support` | `0.2.128` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wasm-bindgen-shared` | `0.2.125` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `wasm-bindgen-shared` | `0.2.126` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `wasm-bindgen-shared` | `0.2.128` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wasm-streams` | `0.4.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `wasm-streams` | `0.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `wayland-backend` | `0.3.15` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `wayland-backend` | `0.3.17` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wayland-client` | `0.31.14` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `wayland-client` | `0.31.15` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wayland-protocols` | `0.32.13` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wayland-protocols-wlr` | `0.3.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wayland-protocols-wlr` | `0.3.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `wayland-scanner` | `0.31.10` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `wayland-scanner` | `0.31.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wayland-sys` | `0.31.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `web-sys` | `0.3.102` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `web-sys` | `0.3.103` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `web-sys` | `0.3.105` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `web-time` | `1.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `web_atoms` | `0.2.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `web_atoms` | `0.2.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `webkit2gtk` | `2.0.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `webkit2gtk-sys` | `2.0.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `webpki-root-certs` | `1.0.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `webpki-root-certs` | `1.0.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `webpki-roots` | `1.0.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `webpki-roots` | `1.0.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `webview2-com` | `0.38.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `webview2-com-macros` | `0.8.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `webview2-com-sys` | `0.38.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `weezl` | `0.1.12` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `wezterm-bidi` | `0.2.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wezterm-blob-leases` | `0.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wezterm-color-types` | `0.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wezterm-dynamic` | `0.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wezterm-dynamic-derive` | `0.1.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wezterm-input-types` | `0.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `whoami` | `1.6.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `winapi` | `0.3.9` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `winapi-i686-pc-windows-gnu` | `0.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `winapi-util` | `0.1.11` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `winapi-x86_64-pc-windows-gnu` | `0.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `window-vibrancy` | `0.6.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows` | `0.57.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `windows` | `0.61.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows` | `0.62.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `windows-collections` | `0.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-collections` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `windows-core` | `0.57.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `windows-core` | `0.61.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-core` | `0.62.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-future` | `0.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-future` | `0.3.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `windows-implement` | `0.57.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `windows-implement` | `0.60.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-interface` | `0.57.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `windows-interface` | `0.59.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-link` | `0.1.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-link` | `0.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows-numerics` | `0.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-numerics` | `0.3.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `windows-registry` | `0.5.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `windows-registry` | `0.6.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows-result` | `0.1.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `windows-result` | `0.3.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-result` | `0.4.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows-strings` | `0.4.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-strings` | `0.5.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows-sys` | `0.45.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-sys` | `0.48.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `windows-sys` | `0.52.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows-sys` | `0.59.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-sys` | `0.60.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows-sys` | `0.61.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows-targets` | `0.42.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-targets` | `0.48.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `windows-targets` | `0.52.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows-targets` | `0.53.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows-threading` | `0.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows-threading` | `0.2.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `windows-version` | `0.1.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows_aarch64_gnullvm` | `0.42.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows_aarch64_gnullvm` | `0.48.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `windows_aarch64_gnullvm` | `0.52.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_aarch64_gnullvm` | `0.53.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_aarch64_msvc` | `0.42.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows_aarch64_msvc` | `0.48.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `windows_aarch64_msvc` | `0.52.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_aarch64_msvc` | `0.53.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_i686_gnu` | `0.42.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows_i686_gnu` | `0.48.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `windows_i686_gnu` | `0.52.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_i686_gnu` | `0.53.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_i686_gnullvm` | `0.52.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_i686_gnullvm` | `0.53.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_i686_msvc` | `0.42.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows_i686_msvc` | `0.48.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `windows_i686_msvc` | `0.52.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_i686_msvc` | `0.53.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_x86_64_gnu` | `0.42.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows_x86_64_gnu` | `0.48.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `windows_x86_64_gnu` | `0.52.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_x86_64_gnu` | `0.53.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_x86_64_gnullvm` | `0.42.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows_x86_64_gnullvm` | `0.48.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `windows_x86_64_gnullvm` | `0.52.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_x86_64_gnullvm` | `0.53.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_x86_64_msvc` | `0.42.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `windows_x86_64_msvc` | `0.48.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `windows_x86_64_msvc` | `0.52.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `windows_x86_64_msvc` | `0.53.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `winnow` | `0.5.40` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `winnow` | `0.7.15` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `winnow` | `1.0.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `winnow` | `1.0.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `winreg` | `0.55.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `wit-bindgen` | `0.57.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `wl-clipboard-rs` | `0.9.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wrapcenum-derive` | `0.4.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `writeable` | `0.6.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `writeable` | `0.6.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `wry` | `0.55.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `x11` | `2.21.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `x11-dl` | `2.21.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `x11rb` | `0.13.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `x11rb-protocol` | `0.13.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `xattr` | `1.6.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `xdg-home` | `1.3.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `xml-rs` | `0.8.28` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock) |
| `xml5ever` | `0.17.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `yoke` | `0.8.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `yoke-derive` | `0.8.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `zbus` | `4.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zbus` | `5.17.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `zbus_macros` | `4.4.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zbus_macros` | `5.17.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `zbus_names` | `3.0.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zbus_names` | `4.3.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `zerocopy` | `0.8.52` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `zerocopy` | `0.8.54` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `zerocopy` | `0.8.57` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zerocopy-derive` | `0.8.52` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `zerocopy-derive` | `0.8.54` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `zerocopy-derive` | `0.8.57` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zerofrom` | `0.1.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `zerofrom-derive` | `0.1.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `zeroize` | `1.9.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `zeroize_derive` | `1.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zerotrie` | `0.2.4` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `zerotrie` | `0.2.5` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zerovec` | `0.11.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `zerovec` | `0.11.8` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zerovec-derive` | `0.11.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `zerovec-derive` | `0.11.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zip` | `0.6.6` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `zip` | `4.6.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `zlib-rs` | `0.6.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zmij` | `1.0.21` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/plugins/tauri-plugin-hardware/Cargo.lock](../src-tauri/plugins/tauri-plugin-hardware/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock](../src-tauri/plugins/tauri-plugin-llamacpp/Cargo.lock)<br>[src-tauri/utils/Cargo.lock](../src-tauri/utils/Cargo.lock) |
| `zmij` | `1.0.23` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `zstd` | `0.11.2+zstd.1.5.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `zstd-safe` | `5.0.2+zstd.1.5.2` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `zstd-sys` | `2.0.16+zstd.1.5.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/plugins/tauri-plugin-rag/Cargo.lock](../src-tauri/plugins/tauri-plugin-rag/Cargo.lock) |
| `zstd-sys` | `2.1.0+zstd.1.5.7` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zune-core` | `0.5.1` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `zune-core` | `0.5.3` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zune-jpeg` | `0.5.15` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zvariant` | `4.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zvariant` | `5.13.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `zvariant_derive` | `4.2.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zvariant_derive` | `5.13.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
| `zvariant_utils` | `2.1.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock)<br>[src-tauri/novera-cli/Cargo.lock](../src-tauri/novera-cli/Cargo.lock) |
| `zvariant_utils` | `3.5.0` | `registry+https://github.com/rust-lang/crates.io-index` | [src-tauri/Cargo.lock](../src-tauri/Cargo.lock) |
