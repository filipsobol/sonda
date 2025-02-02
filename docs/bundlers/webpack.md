---
outline: deep
---

# Visualizing webpack bundles with Sonda

To analyze and visualize your webpack bundles, you need to install the Sonda npm package and add the Sonda plugin to your webpack configuration.

## Installation

### Install the package

To get started, install the Sonda package using the following command:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Next, register the Sonda plugin for webpack and enable source maps in the `webpack.config.js` file:

```js{1,4,6}
const Sonda = require( 'sonda/webpack' ); // [!code focus]

module.exports = {
  devtool: 'source-map', // [!code focus]
  plugins: [
    new Sonda() // [!code focus]
  ]
};
```

Now, every time you build your project, Sonda will generate a report with information about your bundles.

Sonda requires source maps to function correctly, but some other plugins may not support or generate them by default. If Sonda does not work as expected, check the documentation for the other plugins you are using to ensure source maps are enabled.

::: warning ⚠️ webpack plugin
Currently, the Sonda plugin for webpack modifies the default configuration to use absolute paths in the generated source maps instead of webpack-specific paths (`devtoolModuleFilenameTemplate: '[absolute-resource-path]'`). This change may affect how paths appear in browser devtools.
:::

### Configure the plugin

The steps above will allow you to generate your first report. However, if the report does not contain the information you need, refer to the [Configuration](/configuration) page to explore additional options and learn how to enable them.
