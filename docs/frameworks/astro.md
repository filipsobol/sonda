---
outline: deep
---

# Visualizing Astro bundles with Sonda

To analyze and visualize your Astro bundles, you need to install the Sonda npm package and add the Sonda plugin to your Astro configuration.

## Installation

### Install the package

To get started, install the Sonda package using the following command:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Next, register the Sonda plugin for Astro and enable source maps in the `astro.config.mjs` file:

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

Sonda requires source maps to function correctly, but some other plugins may not support or generate them by default. If Sonda does not work as expected, check the documentation for the other plugins you are using to ensure source maps are enabled.

::: tip Astro without frontend JavaScript
By default, Astro does not ship any JavaScript to the client, so the default configuration may not generate a report. In this case, you may need to generate a report for the server bundle, as described below.
:::

### Configure the plugin

The steps above will allow you to generate your first report. However, if the report does not contain the information you need, refer to the [Configuration](/configuration) page to explore additional options and learn how to enable them.

#### Generating a report for the server bundle

In addition to the options listed on the configuration page, the Astro integration has an additional option called `server`. This option enables Sonda to generate a report for the server bundle as well.

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
