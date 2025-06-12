---
outline: deep
---

# Treemap chart

The tree map page helps you visualize the size of your assets and their contents. By default, it displays the size of the entire build, with each tile representing a file or folder in the build.

<CustomImage
  src="/treemap.jpg"
  alt="Tree map chart for a folder containing multiple folders and files from the Sonda project itself"
  caption="Tree map chart of the Sonda project itself"
/>

Clicking on the folder file will zoom in on that folder, showing its contents. Clicking on an asset file will show a new tree map for that file, where each tile represents a single source file that contributed to the asset. Clicking on a source file will open a page showing its details, including file type, size, source, and more.

This allows you to quickly find the largest assets and zoom in on specific parts of your codebase to understand how each individual file contributes to the overall size of your build.

## Reading the tree map

The size and color of each tile represent the size of the file or input it represents. Larger and redder tiles indicate a greater size. The actual size of the file or folder is displayed next to its name and reflects the currently selected compression option (Uncompressed, GZIP, or Brotli). By default, the tree map shows uncompressed sizes.

<CustomImage
  src="/sizes-switcher.jpg"
  alt="Switches containing three options - Uncompressed, GZIP, and Brotli"
  caption="Dropdown is only available if the compression settings are enabled"
/>

## The `[unassigned]` tile

Occasionally, the tree map may include a tile labeled `[unassigned]`. This tile represents parts of the bundle that could not be mapped to a specific file. These are typically code comments or code added during the build process by bundler plugins without proper source map support. Some plugins may require additional configuration to correctly generate or update source maps.

If you notice a large `[unassigned]` tile, it may be worth investigating its source. For this purpose, you can use a tool like the [Source Map Visualizer](https://evanw.github.io/source-map-visualization/).
