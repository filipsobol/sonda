---
outline: deep
---

# Visualizing Vite bundles with Sonda

To analyze and visualize your Vite bundles, you need to install the Sonda npm package and add the Sonda plugin to your Vite configuration.

## Installation

### Install the package

To get started, install the Sonda package using the following command:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Next, register the Sonda plugin for Vite and enable source maps in the `vite.config.js` file:

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

Now, every time you build your project, Sonda will generate a report with information about your bundles.

Sonda requires source maps to function correctly, but some other plugins may not support or generate them by default. If Sonda does not work as expected, check the documentation for the other plugins you are using to ensure source maps are enabled.

::: warning ⚠️ Vite plugin
Currently, Sonda reports for Vite do not include CSS files, as Vite does not generate source maps for them. For more information, see this [GitHub issue](https://github.com/vitejs/vite/issues/2830).
:::

### Configure the plugin

The steps above will allow you to generate your first report. However, if the report does not contain the information you need, refer to the [Configuration](/configuration) page to explore additional options and learn how to enable them.
