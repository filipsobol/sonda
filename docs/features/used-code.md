---
outline: deep
---

# Used code

Usually, a list of the modules that make up an asset and how much code they contribute to it is sufficient. In rare cases, however, you may need to inspect the code from specific modules that is included in the final bundle. This is where the `sources` option comes in.

When this option is enabled, the report will include the source maps of the assets to visualize which parts of the code contribute to the final asset size.

::: danger ⚠️ Be careful when sharing the report with the `sources` option enabled
Enabling this option will significantly increase the size of the report and include it in the **source code** of the assets. If you are working with proprietary code, be careful who you share the report with.
:::

Clicking on a file tile in the tree map opens a modal with a `Show Used Code` button. Clicking this button opens a new modal with the code of the selected file. The code contained in the final bundle is highlighted.

<CustomImage
  src="/used-code-highlighting.jpg"
  alt="Modal containing the code of the selected file with the code included in the final bundle highlighted"
/>
