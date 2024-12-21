---
outline: deep
---

# Analyzing Rolldown bundles with Sonda

To analyze and visualize your Rolldown bundles, you need to install the Sonda npm package and add the Sonda plugin to your Rolldown configuration.

## Installation

### Install the package

To get started, install the following package:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Then register the Sonda plugin for Rolldown and enable the source maps in the `rspack.config.js` file.

```js{2,6,9}
import { defineConfig } from 'rolldown';
import Sonda from 'sonda/rolldown'; // [!code focus]

export default defineConfig( {
  output: {
    sourcemap: true // [!code focus]
  },
  plugins: [
    Sonda() // [!code focus]
  ]
} );
```

Sonda requires source maps, but some other plugins may not support or generate them by default. If you see that Sonda is not working properly, check the documentation of other plugins you are using to enable source maps.

::: warning ⚠️ Rolldown plugin
Currently, Sonda reports for Rolldown incorrectly show the CommonJS modules as ES modules. This is a known limitation and is being tracked in this [GitHub issue](https://github.com/rolldown/rolldown/issues/3002).
:::

### Configure the plugin

The steps above are enough to generate the first report. However, if you do not see the information you need, see the [configuration](/configuration) page to learn about additional options and how to enable them.
