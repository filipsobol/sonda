---
outline: deep
---

# Analyzing Rollup bundles with Sonda

To analyze and visualize your Rollup bundles, you need to install the Sonda npm package and add the Sonda plugin to your Rollup configuration.

## Installation

### Install the package

To get started, install the following package:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Then register the Sonda plugin for Rollup and enable the source maps in the `rollup.config.js` file.

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

Sonda requires source maps, but some other plugins may not support or generate them by default. If you see that Sonda is not working properly, check the documentation of other plugins you are using to enable source maps.

### Configure the plugin

The steps above are enough to generate the first report. However, if you do not see the information you need, see the [configuration](/configuration) page to learn about additional options and how to enable them.
