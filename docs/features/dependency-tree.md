---
outline: deep
---

# Dependency tree

Clicking on a file tile in the tree map chart opens a modal with detailed information about that file. Among other details, the modal includes a dependency tree that shows the files that imported it, explaining why it is included in the bundle.

<CustomImage
  src="/dependency-tree.jpg"
  alt="Dependency tree showing the import chain from the selected file up to the project file that imported it"
/>

In the example above, the selected file is in the bundle because:

1. The file `src/main.ts` imports `sonda` (or more specifically, its distribution file `sonda/dist/index.js`).
2. Sonda imports the `@ampproject/remapping` package.
3. That package imports the `@jridgewell/gen-mapping` package.
4. That package imports the `@jridgewell/set-array` package.
5. That package contains the selected file.

## Types of nodes

There are two types of nodes in the dependency tree:

1. The root node may state that it is `part of the X bundle`. This only occurs if the [Deep view](/features/deep-view) feature is enabled and the selected file was identified by inspecting the dependency's source maps. In this case, it was the bundle that was imported, not the selected file directly.
2. In all other cases, the node will state that it is `imported by X`, meaning the selected file (or a file higher in the chain) was explicitly imported by that file.
