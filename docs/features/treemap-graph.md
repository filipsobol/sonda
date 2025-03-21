---
outline: deep
---

# Treemap chart

The tree map chart visualizes the contents of the selected asset, with each tile representing a single source file or folder.

<CustomImage
  src="/treemap.jpg"
  alt="Tree map chart for a folder containing multiple folders and files from the Sonda project itself"
  caption="Tree map chart of the Sonda project itself"
/>

## Reading the tree map

The size and color of each tile represent the amount of code it contributed to the asset. Larger and redder tiles indicate a greater contribution of code. The actual size of the file or folder is displayed next to its name and reflects the currently selected size option (Uncompressed, GZIP, or Brotli). By default, the tree map shows uncompressed sizes.

<CustomImage
  src="/sizes-switcher.jpg"
  alt="Switches containing three options - Uncompressed, GZIP, and Brotli"
  caption="Size toggle is only available if the compression settings are enabled"
/>

Clicking a tile opens a modal. If the tile represents a file, the modal contains detailed information about that file. If the tile represents a folder, the modal displays a new tree map for the files within that folder, allowing you to “zoom in” on specific parts of the asset.

## The `[unassigned]` tile

Occasionally, the tree map may include a tile labeled `[unassigned]`. This tile represents parts of the bundle that could not be mapped to a specific file. These are typically code comments or code added during the build process by bundler plugins without proper source map support. Some plugins may require additional configuration to correctly generate or update source maps.

If you notice a large `[unassigned]` tile, it may be worth investigating its source. For this purpose, you can use a tool like the [Source Map Visualizer](https://evanw.github.io/source-map-visualization/).
