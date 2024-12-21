---
outline: deep
---

# Analyzing esbuild bundles with Sonda

To analyze and visualize your esbuild bundles, you need to install the Sonda npm package and add the Sonda plugin to your esbuild configuration.

## Installation

### Install the package

To get started, install the following package:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Then register the Sonda plugin for esbuild and enable the source maps.

```js{2,5,7}
import { build } from 'esbuild';
import Sonda from 'sonda/esbuild'; // [!code focus]

build( {
  sourcemap: true, // [!code focus]
  plugins: [
    Sonda() // [!code focus]
  ]
} );
```

Sonda requires source maps, but some other plugins may not support or generate them by default. If you see that Sonda is not working properly, check the documentation of other plugins you are using to enable source maps.

### Configure the plugin

The steps above are enough to generate the first report. However, if you do not see the information you need, see the [configuration](/configuration) page to learn about additional options and how to enable them.
