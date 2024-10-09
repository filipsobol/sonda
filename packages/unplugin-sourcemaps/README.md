# unplugin-sourcemaps

Universal plugin for loading existing source maps from imported modules.

Works with Vite, Rollup, esbuild, and Webpack.

## Installation

Start by installing the package:

```bash
npm install unplugin-sourcemaps --save-dev
```

Then register the bundler-specific plugin and enable the source maps.

<details>
<summary>Vite</summary>

```javascript
// vite.config.js

import { defineConfig } from 'vite';
import { ViteSourcemap } from 'unplugin-sourcemaps';

export default defineConfig( {
  plugins: [
    ViteSourcemap()
  ],
  build: {
    sourcemap: true
  }
} );
```

</details>

<details>
<summary>esbuild</summary>

```javascript
// rollup.config.js

import { defineConfig } from 'rollup';
import { RollupSourcemap } from 'unplugin-sourcemaps';

export default defineConfig( {
  output: {
    // Other options are skipped for brevity
    sourcemap: true,
  },
  plugins: [
    RollupSourcemap()
  ]
} );
```

</details>

<details>
<summary>esbuild</summary>

```javascript
import { build } from 'esbuild';
import { EsbuildSourcemap } from 'unplugin-sourcemaps';

build( {
  sourcemap: true,
  plugins: [
    SondaEsbuildPlugin()
  ]
} );
```

</details>

<details>
<summary>webpack</summary>

```javascript
// webpack.config.js

const { WebpackSourcemap } = require( 'unplugin-sourcemaps' );

module.exports = {
  devtool: 'source-map',
  plugins: [
    WebpackSourcemap()
  ],
};
```

</details>
