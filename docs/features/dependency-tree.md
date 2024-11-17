---
outline: deep
---

# Dependency tree

Clicking on a file tile in the tree map chart opens a modal with detailed information about that file. Among other things, the modal includes a dependency tree that shows the files that imported it, thus the reason it is included in the bundle.

<CustomImage
  src="/dependency-tree.jpg"
  alt="Dependency tree showing the import chain from the selected file up to the project file that imported it"
/>

In the example above, the selected file is in the bundle because:

1. The file `src/main.ts` imports `sonda` (or more precisely, its distribution file `sonda/dist/index.js`).
2. Sonda imports the `@ampproject/remapping` package.
3. That package imports the `@jridgewell/gen-mapping` package.
4. That package imports the `@jridgewell/set-array` package.
5. That package contains the selected file.

## Types of nodes

There are two types of nodes in the dependency tree:

1. The root node may say that it's `part of the X bundle`. This only happens if the [Detailed view](/features/detailed-view) feature is enabled, and the selected file was found by inspecting the dependency's source maps. In this case, it was the bundle that was imported, not the selected file itself.
2. In all other cases, the node will say that it's `imported by X`. This means that the selected file (or a file higher in the list) was imported by that file.

## Multiple importers

If a file is imported by multiple files at any level of the tree, the tree will stop at that level and not show any more levels. This is because in some cases the tree would become too large and difficult to read.

<CustomImage
  src="/dependency-tree-multiple-importers.jpg"
  alt="Dependency tree showing the import chain but stopping at the level where a file is imported by multiple files"
/>

In the example above, the selected file is in the bundle because:

1. The `@jridgewell/gen-mapping` and `@ampproject/remapping` packages import the `@jridgewell/trace-mapping` package.
2. That package imports the `@jridgewell/resolve-uri` package.

If you want to see what caused these packages to be included in the bundle, you can click on them in the tree map and see their dependency trees.
