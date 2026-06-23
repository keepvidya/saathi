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
    files: ['packages/frontend/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'electron', message: 'Frontend must use window.saathi via the bridge.' }],
          patterns: ['@saathi/backend', '@saathi/backend/*'],
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
          patterns: ['electron', 'electron/*', '@saathi/frontend', '@saathi/frontend/*'],
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
          ],
        },
      ],
    },
  },
)
