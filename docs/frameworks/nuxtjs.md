---
outline: deep
---

# Visualizing Nuxt bundles with Sonda

To analyze and visualize your Nuxt bundles, you need to install the Sonda npm package and add the Sonda plugin to your Nuxt configuration.

## Installation

### Install the package

To get started, install the following package:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Then register the Sonda plugin for Nuxt and enable the source maps in the `nuxt.config.ts` file.

```js{1,5,8}
import Sonda from 'sonda/nuxt'; // [!code focus]

export default defineNuxtConfig( {
  sourcemap: {
    client: true // [!code focus]
  },
  modules: [
    Sonda() // [!code focus]
  ]
} );
```

Sonda requires source maps, but some other plugins may not support or generate them by default. If you see that Sonda is not working properly, check the documentation of other plugins you are using to enable source maps.

### Configure the plugin

The steps above are enough to generate the first report. However, if you do not see the information you need, see the [configuration](/configuration) page to learn about additional options and how to enable them.

#### Generating a report for the server bundle

On top of the options listed on the [configuration](/configuration) page, there is one additional option specific to the Nuxt integration, which is `server`. This option allows Sonda to generate a report for the server bundle as well and it requires the `sourcemap.server` option to be enabled in the Nuxt configuration.

```js{6,10}
import Sonda from 'sonda/nuxt';

export default defineNuxtConfig( {
  sourcemap: {
    client: true,
    server: true // [!code focus]
  },
  modules: [
    Sonda( {
      server: true // [!code focus]
    } )
  ]
} );
```
