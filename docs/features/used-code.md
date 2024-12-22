---
outline: deep
---

# Used code

Usually, a list of the modules that make up an asset and how much code they contribute is sufficient. However, in rare cases, you may need to inspect the specific code from modules that is included in the final bundle. This is where the `sources` option becomes useful.

When enabled, the `sources` option adds source maps to the report, allowing you to visualize which parts of the code contribute to the final asset size.

::: danger ⚠️ Be cautious when sharing the report with the `sources` option enabled
Enabling this option significantly increases the size of the report and embeds the **source code** of the assets. If you are working with proprietary code, ensure you share the report responsibly.
:::

Clicking on a file tile in the tree map opens a modal with a `Show Used Code` button. Clicking this button opens another modal that displays the code of the selected file, with the portions included in the final bundle highlighted.

<CustomImage
  src="/used-code-highlighting.jpg"
  alt="Modal containing the code of the selected file with the code included in the final bundle highlighted"
/>
