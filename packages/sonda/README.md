# Sonda

Sonda is a universal visualizer and analyzer for JavaScript and CSS bundles. It analyzes the source maps and shows the size of each module after tree-shaking and minification to get the most accurate report.

Sonda works with the following bundlers:

* Vite
* Rollup
* esbuild
* Webpack

## Installation

Start by installing the package:

```bash
npm install sonda --save-dev
```

Then register the bundler-specific plugin and enable the source maps. **Remember to use Sonda in development mode only**.

### Vite

```javascript
// vite.config.js

import { defineConfig } from 'vite';
import { SondaRollupPlugin } from 'sonda';

export default defineConfig( {
  plugins: [
    SondaRollupPlugin(),
  ],
  build: {
    sourcemap: true
  }
} );
```

### Rollup

```javascript
// rollup.config.js

import { defineConfig } from 'rollup';
import { SondaRollupPlugin } from 'sonda';

export default defineConfig( {
 output: {
  // Other options are skipped for brevity
  sourcemap: true,
 },
 plugins: [
  SondaRollupPlugin(),
 ]
} );
```

Some Rollup plugins may not support source maps by default. Check their documentation to enable them. Examples for `@rollup/plugin-commonjs` and `rollup-plugin-styles` are shown below.

```javascript
commonjs( {
  sourceMap: true,
} ),
styles( {
  mode: 'extract',
  sourceMap: true,
} )
```

### esbuild

```javascript
import { build } from 'esbuild';
import { SondaEsbuildPlugin } from 'sonda';

build( {
 sourcemap: true,
 plugins: [
  SondaEsbuildPlugin()
 ]
} );
```

Unlike for other bundlers, the esbuild plugin relies not only on source maps but also on the metafile. The plugin should automatically enable the metafile option for you, but if you get the error, be sure to enable it manually (`metafile: true`).

### Webpack

```javascript
// webpack.config.js

const { SondaWebpackPlugin } = require( 'sonda' );

module.exports = {
  devtool: 'source-map',
  plugins: [
    new SondaWebpackPlugin(),
  ],
};
```

Internally, Sonda changes the default webpack configuration to output relative paths in the source maps instead of using the `webpack://` protocol (`devtoolModuleFilenameTemplate: '[absolute-resource-path]'`).

## Options

Each plugin accepts an optional configuration object. The following options are available.

### `format`

* **Type:** `string`
* **Default:** `'html'`

The format of the output. The following formats are supported:

* `'html'` - HTML file with treemap
* `'json'` - JSON file

### `open`

* **Type:** `boolean`
* **Default:** `true`

Whether to open the report in the default program for given file extension (`.html` or `.json` depending on the `format` option) after the build.