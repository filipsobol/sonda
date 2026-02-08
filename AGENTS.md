# AGENTS Guide for `sonda`

This guide is for coding agents working in this monorepo.
Focus on `packages/sonda`, `packages/html-report`, and `packages/load-source-map`.
Ignore `packages/unplugin-sourcemaps` unless a task explicitly asks for it.

## 1. What this project is

- `sonda` is a source-map-based analyzer for JS/CSS build outputs.
- It generates HTML reports (interactive) and/or JSON reports (automation).
- It stays bundler-agnostic by analyzing final source maps.
- It supports major bundlers and frameworks through integration wrappers.
- Main value: accurate size attribution after tree-shaking and minification.

## 2. Architecture overview

### `packages/sonda` (core analyzer)

- Integrations collect resources/connections and emitted asset paths.
- The `Report` model stores normalized state and drives report generation.
- Processors analyze outputs, source maps, and dependencies.
- Formatters serialize final reports to HTML and JSON.

Key areas:

- `src/config.ts`: option defaults and normalized runtime config.
- `src/report/*`: report model, processors, and formatters.
- `src/integrations/*`: bundler adapters.
- `src/entrypoints/*`: framework/bundler public entrypoints.

Important invariants:

- Keep report paths normalized (`normalizePath`).
- Preserve stable schema keys (`resources`, `connections`, `dependencies`, `issues`, `sourcemaps`).
- Handle missing sourcemaps gracefully (asset-only fallback).

### `packages/html-report` (report UI)

- Vue 3 app shipped as a single static HTML file.
- Sonda injects compressed report data into `__REPORT_DATA__`.
- Runtime code decompresses payload and exposes typed selectors.
- Uses a custom hash router and a treemap-based UI.

### `packages/load-source-map` (map loader utility)

- Loads code and source-map metadata from file or inline comments.
- Resolves map file, normalizes `sources`, and backfills `sourcesContent` when possible.

## 3. First-time agent notes

- Monorepo uses `pnpm` workspaces (`packages/**`, `playground/**`).
- `sonda` build depends on `load-source-map` and `html-report` builds.
- Main tests are in `packages/sonda/tests` (Vitest).
- Deterministic output matters because tests compare full report objects.
- `deep` and `sources` options can significantly increase runtime/report size.
- If report schema changes, update both producer (`sonda`) and consumer (`html-report`).

## 4. Build / lint / test commands

From repository root:

- `pnpm install`
- `pnpm build`
- `pnpm test`
- `pnpm format`
- `pnpm docs:dev`, `pnpm docs:build`, `pnpm docs:preview`

Package builds:

- `pnpm --filter sonda build`
- `pnpm --filter html-report build`
- `pnpm --filter load-source-map build`

Sonda tests:

- All: `pnpm --filter sonda test`
- Single file: `pnpm --filter sonda run test -- tests/vite.test.ts`
- Single test name: `pnpm --filter sonda exec vitest run tests/vite.test.ts -t "<test name>"`

Linting reality:

- No dedicated `lint` script currently.
- Formatting is enforced via `oxfmt` (`.oxfmtrc.jsonc`).

## 6. Code style guidelines

Formatting and imports:

- Use tabs, semicolons, and single quotes.
- Avoid trailing commas; keep lines near 120 chars.
- Group imports as: Node built-ins, third-party, internal.
- Use `import type` for type-only imports.
- Keep local `.js` extensions in TS imports where existing code does.

Types, naming, and errors:

- Keep strict typing; avoid `any` unless unavoidable.
- Prefer interfaces/discriminated unions for shared report models.
- Use `PascalCase` (types/classes/components), `camelCase` (variables/functions), `UPPER_SNAKE_CASE` (constants).
- Prefer guard clauses and explicit early returns.
- Return `null`/fallbacks for optional map/file paths; throw only for unsupported states.

Implementation guardrails:

- Keep changes focused and avoid unrelated refactors.
- Preserve deterministic output and schema contracts.
- Preserve the `__REPORT_DATA__` producer/consumer contract.
