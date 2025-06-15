---
outline: deep
---

# Inspect code

If you need to inspect the exact source code included in the final bundle, you can enable the `sources` option in your Sonda configuration.

When enabled, the `sources` option adds source maps to the report, allowing you to visualize which parts of the code contribute to the final asset size.

::: danger ⚠️ Be cautious sharing reports with `sources` enabled
Enabling this option significantly increases report size and embeds the **source code** of your assets. If your code is proprietary, share these reports responsibly.
:::

To view used code, open the Input details page for a file and expand the **Usage** section. This view displays the file's source code with the portions included in the bundle highlighted.

<CustomImage
  src="/used-code-highlighting.jpg"
  alt="Code block showing source code with some parts highlighted"
  caption="Code used in the bundle is highlighted"
/>
