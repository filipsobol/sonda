---
outline: deep
---

# Visualizing Nuxt bundles with Sonda

To analyze and visualize your Nuxt bundles, you need to install the Sonda npm package and add the Sonda plugin to your Nuxt configuration.

## Installation

### Install the package

To get started, install the Sonda package using the following command:

::: code-group

```bash [npm]
npm install -D sonda
```

```bash [pnpm]
pnpm add -D sonda
```

```bash [yarn]
yarn add -D sonda
```

```bash [bun]
bun add -d sonda
```

:::

### Add the plugin and enable source maps

Next, register the Sonda plugin for Nuxt and enable source maps in the `nuxt.config.ts` file:

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

Now, every time you build your project, Sonda will generate a report with information about your bundles.

Sonda requires source maps to function correctly, but some other plugins may not support or generate them by default. If Sonda does not work as expected, check the documentation for the other plugins you are using to ensure source maps are enabled.

### Configure the plugin

The steps above will allow you to generate your first report. However, if the report does not contain the information you need, refer to the [Configuration](/configuration) page to explore additional options and learn how to enable them.

#### Generating a report for the server bundle

In addition to the options listed on the configuration page, the Nuxt integration has an additional option called `server`. This option enables Sonda to generate a report for the server bundle as well and it requires the `sourcemap.server` option to be enabled in the Nuxt configuration.

```js{6,9-11}
import Sonda from 'sonda/nuxt';

export default defineNuxtConfig( {
  sourcemap: {
    client: true,
    server: true // [!code focus]
  },
  modules: [
    Sonda( { // [!code focus]
      server: true // [!code focus]
    } ) // [!code focus]
  ]
} );
```
