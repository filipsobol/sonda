---
outline: deep
---

# Visualizing Rollup bundles with Sonda

To analyze and visualize your Rollup bundles, you need to install the Sonda npm package and add the Sonda plugin to your Rollup configuration.

## Installation

### Install the package

To get started, install the Sonda package using the following command:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Next, register the Sonda plugin for Rollup and enable source maps in the `rollup.config.js` file:

```js{2,6,9}
import { defineConfig } from 'rollup';
import Sonda from 'sonda/rollup'; // [!code focus]

export default defineConfig( {
  output: {
    sourcemap: true // [!code focus]
  },
  plugins: [
    Sonda() // [!code focus]
  ]
} );
```

:::warning Placement of the Sonda plugin
When adding the Sonda plugin to your Rollup configuration, it is important to **place it at the beginning of the `plugins` array**. This allows Sonda to properly analyze the connections between modules before the other plugins process them.
:::

Now, every time you build your project, Sonda will generate a report with information about your bundles.

Sonda requires source maps to function correctly, but some other plugins may not support or generate them by default. If Sonda does not work as expected, check the documentation for the other plugins you are using to ensure source maps are enabled.

### Configure the plugin

The steps above will allow you to generate your first report. However, if the report does not contain the information you need, refer to the [Configuration](/configuration) page to explore additional options and learn how to enable them.
