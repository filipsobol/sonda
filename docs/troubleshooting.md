---
outline: deep
---

# Troubleshooting

Common issues and quick fixes when generating or interpreting reports.

## No report is generated

- Ensure source maps are enabled for your bundler or framework.
- Confirm the plugin is registered and the build actually runs.
- For Rollup and Rolldown, place Sonda at the start of the `plugins` array.

## The report is missing CSS

Vite does not emit CSS source maps by default, so CSS can be absent in Vite reports. Track progress in the Vite issue linked on the [Vite integration page](/bundlers/vite).

## The report is very large

These options add a lot of data to the report, which can increase file size:

- [`sources`](/configuration#sources) embeds source code in the report.
- [`deep`](/configuration#deep) expands dependencies into their original source files.

Enable only the options you need for the current analysis.

## Builds are slower than expected

These options increase the amount of work Sonda does during the build:

- [`deep`](/configuration#deep) reads source maps for dependencies and can be slow in large projects.
- [`gzip`](/configuration#gzip) and [`brotli`](/configuration#brotli) add compression passes for size estimates.

Enable only the options you need for the current analysis.

## `[unassigned]` is large in the treemap

This usually means code was injected by the bundler or a plugin without full source-map support. See the [`[unassigned]` Tile](/features/treemap-graph#unassigned-tile) section for more information.

## Deep view is incomplete

Deep view depends on dependencies shipping valid source maps. If a package does not publish them, it will stay grouped by distribution files.
