---
outline: deep
---

# Visualizing Astro bundles with Sonda

To analyze and visualize your Astro bundles, you need to install the Sonda npm package and add the Sonda plugin to your Astro configuration.

## Installation

### Install the package

To get started, install the following package:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Then register the Sonda plugin for Astro and enable the source maps in the `astro.config.mjs` file.

```js{2,7,11}
import { defineConfig } from 'astro/config';
import Sonda from 'sonda/astro'; // [!code focus]

export default defineConfig({
 vite: {
  build: {
   sourcemap: true // [!code focus]
  }
 },
 integrations: [
  Sonda() // [!code focus]
 ]
});
```

Sonda requires source maps, but some other plugins may not support or generate them by default. If you see that Sonda is not working properly, check the documentation of other plugins you are using to enable source maps.

::: tip Astro without frontend JavaScript
Because by default Astro does not ship any JavaScript to client, the default configuration may not generate any report. In such case, you may need to generate a report for the server bundle as described below.
:::

### Configure the plugin

The steps above are enough to generate the first report. However, if you do not see the information you need, see the [configuration](/configuration) page to learn about additional options and how to enable them.

#### Generating a report for the server bundle

On top of the options listed on the [configuration](/configuration) page, there is one additional option specific to the Astro integration, which is `server`. This option allows Sonda to generate a report for the server bundle as well.

```js{16-18}
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import Sonda from 'sonda/astro';

export default defineConfig({
 output: 'server',
 adapter: node( {
  mode: 'standalone'
 } ),
 vite: {
  build: {
   sourcemap: true
  }
 },
 integrations: [
  Sonda( {  // [!code focus]
   server: true  // [!code focus]
  } )  // [!code focus]
 ]
});
```
