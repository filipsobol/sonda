---
outline: deep
---

# Visualizing Rolldown bundles with Sonda

To analyze and visualize your Rolldown bundles, you need to install the Sonda npm package and add the Sonda plugin to your Rolldown configuration.

## Installation

### Install the package

To get started, install the Sonda package using the following command:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Next, register the Sonda plugin for Rolldown and enable source maps in the `rolldown.config.js` file:

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

Now, every time you build your project, Sonda will generate a report with information about your bundles.

Sonda requires source maps to function correctly, but some other plugins may not support or generate them by default. If Sonda does not work as expected, check the documentation for the other plugins you are using to ensure source maps are enabled.

::: warning ⚠️ Rolldown plugin
Currently, Sonda reports for Rolldown incorrectly display CommonJS modules as ES modules. This is a known limitation and is being tracked in this [GitHub issue](https://github.com/rolldown/rolldown/issues/3002).
:::

### Configure the plugin

The steps above will allow you to generate your first report. However, if the report does not contain the information you need, refer to the [Configuration](/configuration) page to explore additional options and learn how to enable them.
