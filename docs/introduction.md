---
outline: deep
---

# Introduction

[[toc]]

## What is Sonda?

Sonda is a universal visualizer and analyzer for JavaScript and CSS assets. It is designed to help you understand the structure of your assets and how various parts depend on each other, identify potential issues, and optimize them for better performance.

Unlike other tools, Sonda is not designed for a specific bundler, but rather to analyze the JavaScript and CSS assets themselves. Thanks to this approach, Sonda is more accurate and works with all popular bundlers, including:

* Vite
* Rollup
* esbuild
* webpack
* Rspack

To see what it can do, check out the <a href="/demo.html" target="_blank">demo</a>.

## Installation

### Install the package

To get started, install the following package:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Then register the bundler-specific plugin and enable the source maps. **Remember to use Sonda only during development**.

::: code-group

```js{4,8,11} [Vite]
// vite.config.js

import { defineConfig } from 'vite';
import Sonda from 'sonda/vite';

export default defineConfig( {
  plugins: [
    Sonda(),
  ],
  build: {
    sourcemap: true
  }
} );
```

```js{4,8,11} [Rollup]
// rollup.config.js

import { defineConfig } from 'rollup';
import Sonda from 'sonda/rollup';

export default defineConfig( {
  output: {
    sourcemap: true,
  },
  plugins: [
    Sonda(),
  ]
} );
```

```js{2,5,7} [esbuild]
import { build } from 'esbuild';
import Sonda from 'sonda/esbuild';

build( {
  sourcemap: true,
  plugins: [
    Sonda()
  ]
} );
```

```js{3,6,8} [webpack ⚠️]
// webpack.config.js

const Sonda = require( 'sonda/webpack' );

module.exports = {
  devtool: 'source-map',
  plugins: [
    new Sonda(),
  ],
};
```

```js{3,6,8} [Rspack ⚠️]
// rspack.config.js

import Sonda from 'sonda/rspack';

export default {
  devtool: 'source-map',
  plugins: [
    new Sonda(),
  ],
};
```

:::

Sonda requires source maps, but some other plugins may not support or generate them by default. If you see that Sonda is not working properly, check the documentation of other plugins you are using to enable source maps.

::: warning ⚠️ Webpack and Rspack plugins
Currently, plugins for webpack and Rspack change the default configuration of these bundlers to use absolute paths in the generated source maps instead of using webpack-specific paths (`devtoolModuleFilenameTemplate: '[absolute-resource-path]'`). This may affect the paths you see in browser devtools.
:::

### Configure the plugin

The steps above are enough to generate the first report. However, if you do not see the information you need, see the [configuration](/configuration) section to learn about additional options and how to enable them.
