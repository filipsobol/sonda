---
outline: deep
---

# Analyzing Rspack bundles with Sonda

To analyze and visualize your Rspack bundles, you need to install the Sonda npm package and add the Sonda plugin to your Rspack configuration.

## Installation

### Install the package

To get started, install the following package:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Then register the Sonda plugin for Rspack and enable the source maps in the `rspack.config.js` file.

```js{1,4,6}
import Sonda from 'sonda/rspack'; // [!code focus]

export default {
  devtool: 'source-map', // [!code focus]
  plugins: [
    new Sonda() // [!code focus]
  ]
};
```

Sonda requires source maps, but some other plugins may not support or generate them by default. If you see that Sonda is not working properly, check the documentation of other plugins you are using to enable source maps.

::: warning ⚠️ Rspack plugin
Currently, plugin for Rspack changes the default configuration to use absolute paths in the generated source maps instead of using webpack-specific paths (`devtoolModuleFilenameTemplate: '[absolute-resource-path]'`). This may affect the paths you see in browser devtools.
:::

### Configure the plugin

The steps above are enough to generate the first report. However, if you do not see the information you need, see the [configuration](/configuration) page to learn about additional options and how to enable them.
