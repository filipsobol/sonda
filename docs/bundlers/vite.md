---
outline: deep
---

# Visualizing Vite bundles with Sonda

To analyze and visualize your Vite bundles, you need to install the Sonda npm package and add the Sonda plugin to your Vite configuration.

## Installation

### Install the package

To get started, install the following package:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Then register the Sonda plugin for Vite and enable the source maps in the `vite.config.js` file.

```js{2,6,9}
import { defineConfig } from 'vite';
import Sonda from 'sonda/vite'; // [!code focus]

export default defineConfig( {
  build: {
    sourcemap: true // [!code focus]
  },
  plugins: [
    Sonda() // [!code focus]
  ]
} );
```

Sonda requires source maps, but some other plugins may not support or generate them by default. If you see that Sonda is not working properly, check the documentation of other plugins you are using to enable source maps.

::: warning ⚠️ Vite plugin
Currently, Sonda reports for Vite don't include CSS files, because Vite doesn't generate source maps for them. Please see this [GitHub issue](https://github.com/vitejs/vite/issues/2830) for more information.
:::

### Configure the plugin

The steps above are enough to generate the first report. However, if you do not see the information you need, see the [configuration](/configuration) page to learn about additional options and how to enable them.
