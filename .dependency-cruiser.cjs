/**
 * Boundary enforcement (ENGINEERING-PROTOCOL §1.3 + ADR-0003).
 * Backend ⟂ Frontend; vendors/Electron only inside the host/adapters.
 */
module.exports = {
  forbidden: [
    {
      name: 'frontend-no-electron',
      comment: 'Frontend must not import Electron — use the preload bridge (window.saathi).',
      severity: 'error',
      from: { path: '^packages/frontend' },
      to: { path: '^electron($|/)' },
    },
    {
      name: 'frontend-no-backend',
      comment: 'Frontend must not import the backend — talk over the IPC contract only.',
      severity: 'error',
      from: { path: '^packages/frontend' },
      to: { path: '^packages/backend' },
    },
    {
      name: 'backend-no-electron',
      comment: 'Backend must stay platform-agnostic (no Electron).',
      severity: 'error',
      from: { path: '^packages/backend' },
      to: { path: '^electron($|/)' },
    },
    {
      name: 'backend-no-frontend',
      comment: 'Backend must not import the frontend.',
      severity: 'error',
      from: { path: '^packages/backend' },
      to: { path: '^packages/frontend' },
    },
    {
      name: 'domain-stays-pure',
      comment: 'Domain is the pure core — no Electron, no other layers, no vendor libs.',
      severity: 'error',
      from: { path: '^packages/domain' },
      to: { path: '^electron($|/)|^packages/(backend|frontend|desktop)|node_modules/(exceljs|docx|pptxgenjs|pdf-lib|pdfjs-dist|katex)' },
    },
    {
      name: 'vendor-only-in-adapter',
      comment:
        'Wrapper Rule: backend vendors (exceljs/docx/pptxgenjs/pdf-lib/pdfjs-dist) only in backend/adapters; ' +
        'frontend render vendors (katex) only in frontend/src/adapters (tests exempt).',
      severity: 'error',
      from: {
        path: '^packages',
        pathNot: '^packages/backend/src/adapters/|^packages/frontend/src/adapters/|/test/',
      },
      to: { path: 'node_modules/(exceljs|docx|pptxgenjs|pdf-lib|pdfjs-dist|katex)|^(exceljs|docx|pptxgenjs|pdf-lib|pdfjs-dist|katex)($|/)' },
    },
    {
      name: 'no-circular',
      comment: 'No circular dependencies.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(out|dist|coverage)(/|$)' },
    tsPreCompilationDeps: true,
  },
}
