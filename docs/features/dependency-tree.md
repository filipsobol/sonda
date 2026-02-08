---
outline: deep
---

# Dependency tree

The **Usage** section on the Input details page explains why a specific file is included in your bundle. A core element is the **Dependency tree**, which traces the import tree from the selected file back to the selected asset.

<CustomImage
  src="/dependency-tree.jpg"
  alt="Dependency tree showing the import chain from the selected file up to the asset it is part of"
/>

In this example, the selected file appears in the bundle because:

1. The file `src/index.ts` is the entry point for the asset,
2. it imports `./report/report.js`,
3. it imports `./processors/outputs.js`,
4. it imports `@jridgewell/remapping`,
5. it imports `@jridgewell/trace-mapping`,
6. it imports `@jridgewell/sourcemap-codec`,
7. its source map references `[...]/src/sourcemap-codec.ts` which is the inspected file.

## Types of nodes

There are three node types in the dependency tree:

1. **Entry point**: Represents the entry point of the currently selected asset. It is the root of the dependency tree and shows the file that starts the import chain.

   :::info Example
   "Entry point for the `dist/index.js` asset is `src/index.ts`"
   :::

2. **Imported, dynamically imported or required file**: Represents a file that is imported or required by another file in the chain. It shows the original path used to import the file and the resolved path to the file in the project.

   :::info Examples
   "It imports `./report/report.js`"

   "It requires `./report/report.js`"

   "It dynamically imports `./report/report.js`"
   :::

   :::warning Some integrations always show "import" nodes
   Some bundlers don't track whether a file was imported, dynamically imported, or required. In this case, all nodes in the dependency tree are marked as "import" nodes.

   It's best to assume that these node types just indicate a dependency on the file rather than how it was pulled.
   :::

3. **Source map file**: Only shows when [Deep view](/features/deep-view) feature is enabled. Represents a file that was not directly used during the build process, but was found in the source map of a file that was used.

   :::info Example
   "It has a source map that contains `[...]/node_modules/jridgewell/sourcemap-codec/src/sourcemap-codec.ts`"
   :::
