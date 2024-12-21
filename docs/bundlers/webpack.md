---
outline: deep
---

# Visualizing webpack bundles with Sonda

To analyze and visualize your webpack bundles, you need to install the Sonda npm package and add the Sonda plugin to your webpack configuration.

## Installation

### Install the package

To get started, install the following package:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Then register the Sonda plugin for webpack and enable the source maps in the `webpack.config.js` file.

```js{1,4,6}
const Sonda = require( 'sonda/webpack' ); // [!code focus]

module.exports = {
  devtool: 'source-map', // [!code focus]
  plugins: [
    new Sonda() // [!code focus]
  ]
};
```

Sonda requires source maps, but some other plugins may not support or generate them by default. If you see that Sonda is not working properly, check the documentation of other plugins you are using to enable source maps.

::: warning ⚠️ webpack plugin
Currently, plugin for webpack changes the default configuration to use absolute paths in the generated source maps instead of using webpack-specific paths (`devtoolModuleFilenameTemplate: '[absolute-resource-path]'`). This may affect the paths you see in browser devtools.
:::

### Configure the plugin

The steps above are enough to generate the first report. However, if you do not see the information you need, see the [configuration](/configuration) page to learn about additional options and how to enable them.
