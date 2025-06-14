---
outline: deep
---

# Deep view

By default, Sonda includes only the files the bundler loads during the build. This applies to both your project’s own files and any external dependencies.

<CustomImage
  src="/treemap.jpg"
  alt="Treemap chart for a folder containing multiple folders and files from the Sonda project itself"
  caption="Treemap chart for the main JavaScript bundle of Sonda"
/>

Many npm packages ship only their compiled distribution files to improve performance. As a result, Sonda can’t inspect their original source code, so only the distribution files appear in the report.

In most cases, knowing which dependencies are included and how much space they occupy is sufficient. Including every source file would add noise and slow down report generation.

There are cases when you need to inspect dependencies as if the bundler had used their original source code. To do so, enable the [`deep`](/configuration#deep) option. Sonda will read each dependency’s source maps and map used code back to its original source files.

<CustomImage
  src="/treemap-detailed.jpg"
  alt="Tree map chart showing original source files instead of distribution files"
  caption="Deep view: source-file tiles replace distribution-file tiles"
/>

Notice how tiles representing distribution files were broken into smaller tiles for individual source files.

## Caveats

There are two important caveats to consider:

* This feature only works for dependencies that publish valid source maps.
* Enabling this feature will increase the report generation time, especially for large projects with many dependencies.
