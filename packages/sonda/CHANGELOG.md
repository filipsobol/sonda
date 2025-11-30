# Changelog

## 0.10.1

### Patch Changes

- fd2b4e2: Update the `--format` and `--open` options in the Angular CLI integration to align with changes introduced in v0.10.
- 56a53dd: Correctly resolve path to the `index.html` template when Sonda is bundled by a consuming project.

## 0.10.0

### Minor Changes

- 1cda204: Allow passing an array to the [`format` option](https://sonda.dev/configuration.html#format) to generate multiple reports.
- 1cda204: Allow passing a string to the [`open` option](https://sonda.dev/configuration.html#open) to automatically open only a specific report format.
- c212e9a: Ensure only one consolidated report is generated when Vite or Rollup produce multiple outputs or formats.

### Patch Changes

- a595b6d: Add `--include` and `--exclude` options to the Angular CLI integration.
- 8e8728b: Migrate from `@ampproject/remapping` to `@jridgewell/remapping`.
- 1b9cdc9: Add virtual scrolling to Code block to improve performance.

## 0.9.0

### Minor Changes

- 87d59f9: Add `include` and `exclude` options

## 0.8.2

### Patch Changes

- 3ec00ae: (Performance) Prevent duplicate resolution of some imports in Rollup
- 9f34bbf: Add a search field to the Treemap view for filtering inputs
- 1c14126: Log report path after generation
- 5ae02e5: Fix edge case in Treemap where items fail to sort in descending order by size
- 9d25830: Always show input code when available, even if CSS Custom Highlighting API is unsupported
- b230643: Allow filtering inputs by "type" when inspecting asset in Treemap view
- ab2f385: Reintroduce the `filename` configuration option

## 0.8.1

### Patch Changes

- f4144e0: HTML Report: Maintain active compression type when zooming on Treemap folder
- 28b1f8d: HTML Report: If there is only one assets, immediately show its details in the Treemap view

## 0.8.0

This is the biggest release of Sonda to date, featuring a complete rewrite of both the backend and frontend. The goals of this rewrite were to:

- Make it easier to inspect large projects with multiple outputs
- Display much more information about assets, inputs, external dependencies, and import relationships
- Significantly reduce the size of the HTML report files
- Prepare the codebase for future improvements and features

### Highlights

- **New HTML report design** – The report has been redesigned to improve navigation and clarity, especially for large projects with multiple outputs. See the [demo page](https://sonda.dev/demo) for an example.
- **New JSON report format** – The JSON format has been overhauled to better differentiate resource types and expose relationships between them. For details, refer to the [JSON report](https://sonda.dev/features/json-report.html) documentation.
- **ESM-only** – Sonda is now ESM-only and requires Node.js 20.19 or 22.12+. This change helps reduce the distribution size.
- **New output directory** – Reports are now saved to the `.sonda` directory and are prefixed with a unique number to avoid overwriting existing reports.

### Migration

If you're upgrading from version 0.7, you'll need to update your import paths and configuration.

#### Import Paths

Each integration now has its own import path. It's recommended to use the path specific to your framework or bundler, as these may include optimizations that improve performance and accuracy.

For example, if you're using Vite or Rolldown, use their dedicated import paths instead of the generic Rollup integration path.

Available import paths:

- `sonda/angular`
- `sonda/astro`
- `sonda/esbuild`
- `sonda/next`
- `sonda/nuxt`
- `sonda/rolldown`
- `sonda/rollup` (make sure that Sonda is at the top of the `plugins` array)
- `sonda/rspack`
- `sonda/sveltekit`
- `sonda/vite`
- `sonda/webpack`

#### Configuration

- The `filename` option has been removed and replaced with `outputDir`, which defaults to `.sonda`. All reports are saved to this directory, and filenames are prefixed with a unique number to prevent overwriting.
- The `detailed` option has been renamed to `deep`.

#### JSON Report

The JSON report format has been completely redesigned. For complete details, refer to the updated [JSON report](https://sonda.dev/features/json-report.html) documentation.

---

### Major Changes

- 0c0113f: BREAKING CHANGE: Drop support for Node 18 and require at least Node 20.19 or 22.12
- 0c0113f: BREAKING CHANGE: Distribute only the ESM builds
- 0c0113f: BREAKING CHANGE: Rename the `detailed` configuration option to `deep`.
- 0c0113f: BREAKING CHANGE: Reports are now saved to the `.sonda` folder by default. The `filename` configuration option has been replaced with the `outputDir` option. Each new report will end with incremented numbers to avoid overwriting previous reports. For example:

  - `.sonda/sonda_1.html`
  - `.sonda/sonda_2.html`
  - `.sonda/sonda_3.html`

- 0c0113f: BREAKING CHANGE: Change format of the JSON report
- 0c0113f: BREAKING CHANGE: Redesign the HTML report

### Minor Changes

- 0c0113f: Add new `sonda/rolldown`, `sonda/rspack` and `sonda/vite` entrypoints
- 0c0113f: GZIP data in HTML report to reduce its size

### Patch Changes

- 0c0113f: Run Vite integration only in production build
- 0c0113f: Fix detection of input files in Next.js integration
- 0c0113f: Update all dependencies
- 0c0113f: Don't change paths in sourcemaps generated by webpack and add handling webpack specific path formats

## 0.7.1

### Patch Changes

- e05d444: Add Angular CLI integration

## 0.7.0

### Changes

#### New import paths

This release includes a breaking change. Now every bundler and framework has its own unique import path. For example, if you are using Vite, this is how the import has changed:

```diff
- import { SondaRollupPlugin } from 'sonda';
+ import Sonda from 'sonda/vite';
```

Please refer to the [Getting started](https://sonda.dev/getting-started.html) page for more information.

#### New integrations

Sonda now has integrations for the following frameworks:

- [Next.js](https://sonda.dev/frameworks/nextjs.html)
- [Nuxt](https://sonda.dev/frameworks/nuxt.html)
- [Astro](https://sonda.dev/frameworks/astro.html)
- [SvelteKit](https://sonda.dev/frameworks/sveltekit.html)

#### New `enabled` option

You can now control whether the Sonda plugin is enabled or not using the `enabled` option.

---

### Minor Changes

- 215b289: Create an individual export path for each integration
- 215b289: Add Next.js integration
- 519ddea: Add Nuxt integration
- b450e5b: Add Astro integration
- dc237e5: Add SvelteKit integration
- 215b289: Add the `enabled` option to control whether to run the plugin

### Patch Changes

- 215b289: Update dependencies

## 0.6.2

### Patch Changes

- ff135df: Add `mjs` and `cjs` as accepted asset extensions

## 0.6.1

Sonda has a new home. You can now visit [https://sonda.dev](https://sonda.dev) for installation and usage instructions, or try it out at [https://sonda.dev/demo](https://sonda.dev/demo).

### Patch Changes

- d6e2d76: Add links to Sonda documentation

## 0.6.0

### Minor Changes

- 0e92901: Add the `filename` option to allow changing the report output path

## 0.5.0

### Minor Changes

- 744143d: Add `sources` option for visualizing parts of the code included in the final bundle.
- 3427bb0: Show the estimated download time using "Slow 3G" for assets

## 0.4.1

### Patch Changes

- 05de327: Sort `inputs` and `outputs.inputs` in JSON report for easier diffing

## 0.4.0

### Minor Changes

- ca8322a: Add modal showing list of duplicated modules

### Patch Changes

- e20ec92: Rollup plugin: Fix detection of the ES modules when `@rollup/plugin-commonjs` plugin is not installed
- 52ae692: Update dependencies
- e20ec92: Webpack plugin: Fix reported files sizes, which sometimes included imported dependencies.

## 0.3.0

### Minor Changes

- b7831e3: Update the webpack plugin to make it work with Rspack

### Patch Changes

- 30ddb2b: Add missing `sourcesContent` to source maps when they are available in the filesystem
- e825cfa: Configure npm package provenance
- e825cfa: Fix missing `inputs` in the report created by the esbuild plugin.

## 0.2.2

### Patch Changes

- 97fcbb3: Round module type percentages to two decimal places

## 0.2.1

### Patch Changes

- a64e6d8: Update README.md to include information about the new `detailed` configuration option.

## 0.2.0

Besides the new features listed below, this release changes some default behaviors. Now, sonda will not read external source maps or calculate file sizes after compression with GZIP and Brotli. If you want to use these features, use the following new configuration options:

```json
{
  "detailed": true,
  "gzip": true,
  "brotli": true
}
```

Please refer to README.md for more information.

### Minor Changes

- Add switch to toggle between uncompressed, GZIP, and Brotli treemap diagrams.
- Do not read dependency source maps by default. Use the `detailed` configuration option to read them.
- Update modal for assets to display how much code comes from ESM, CJS, or unknown sources.
- Improve GZIP and Brotli compression size estimations instead of showing worst-case sizes.
- Add modal for assets that displays the bundled, GZIP, and Brotli sizes.
- Update modal for assets to list external dependencies.
- Do not calculate GZIP and Brotli sizes by default. Use the `gzip` and `brotli` configuration options to calculate them.

### Patch Changes

- Correctly load source maps when `sourceMappingURL` contains URL params.
- Remove unnecessary `#__PURE__` comments.

## 0.1.4

- Show "No data to display" with a helpful message when there is no data to display in the report.
- Prevent black boxes in tree maps with large `[unassigned]` tiles.

## 0.1.3

- Show the approximate file and folder size after GZIP and Brotli compression

## 0.1.2

- Use the `open` package to open the generated reports.

## 0.1.1

- Use `execFileSync` instead of `exec` to prevent potential shell injection when the path contains characters that the shell interprets in a special way, for instance quotes and spaces.

## 0.1.0

- Initial release of sonda that allowed generating an `'html'` and `'json'` report for bundles generated by Vite, Rollup, Webpack, and esbuild.
