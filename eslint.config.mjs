import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['**/out/**', '**/dist/**', 'node_modules/**', 'coverage/**', '**/.vite/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { module: 'readonly', require: 'readonly', __dirname: 'readonly', process: 'readonly' },
    },
  },
  {
    // Frontend (UI) must never import Electron or the backend — only the bridge + shared/domain types.
    // Vendor render libs are wrapped under frontend/src/adapters (frontend Wrapper-Rule, reset below).
    files: ['packages/frontend/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'electron', message: 'Frontend must use window.saathi via the bridge.' }],
          // `^katex(/|$)` anchors to the package import — it must NOT match our own
          // relative `adapters/katex/…` path (which doesn't start with "katex").
          patterns: [
            { group: ['@saathi/backend', '@saathi/backend/*'], message: 'Frontend talks over IPC, not the backend.' },
            { regex: '^katex(/|$)', message: 'Wrap KaTeX in frontend/src/adapters, not here.' },
          ],
        },
      ],
    },
  },
  {
    // The frontend Wrapper-Rule: vendor render libs (katex, …) may be imported ONLY inside
    // frontend/src/adapters (resets the rule above; Electron + backend stay forbidden).
    files: ['packages/frontend/src/adapters/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'electron', message: 'Frontend must use window.saathi via the bridge.' }],
          patterns: [
            { group: ['@saathi/backend', '@saathi/backend/*'], message: 'Frontend talks over IPC, not the backend.' },
          ],
        },
      ],
    },
  },
  {
    // Backend (and shared) src must stay framework-agnostic; vendor libs are wrapped (not in tests).
    files: ['packages/backend/src/**/*.ts', 'packages/shared/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'exceljs', message: 'Wrap ExcelJS in backend/adapters, not here.' },
            { name: 'docx', message: 'Wrap docx in backend/adapters, not here.' },
            { name: 'pptxgenjs', message: 'Wrap pptxgenjs in backend/adapters, not here.' },
            { name: 'pdf-lib', message: 'Wrap pdf-lib in backend/adapters, not here.' },
          ],
          patterns: [
            'electron',
            'electron/*',
            '@saathi/frontend',
            '@saathi/frontend/*',
            'pdfjs-dist',
            'pdfjs-dist/*',
          ],
        },
      ],
    },
  },
  {
    // The Wrapper Rule: ExcelJS may be imported ONLY inside its adapter folder (resets the rule above).
    files: ['packages/backend/src/adapters/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['electron', 'electron/*', '@saathi/frontend', '@saathi/frontend/*'] },
      ],
    },
  },
  {
    // Domain is the pure core: no Electron, no DOM (enforced by tsconfig lib), no other layers.
    files: ['packages/domain/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'electron',
            'electron/*',
            '@saathi/frontend',
            '@saathi/backend',
            '@saathi/desktop',
            'exceljs',
            'docx',
            'pptxgenjs',
            'pdf-lib',
            'pdfjs-dist',
            'pdfjs-dist/*',
          ],
        },
      ],
    },
  },
)
