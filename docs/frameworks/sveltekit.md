---
outline: deep
---

# Visualizing SvelteKit bundles with Sonda

To analyze and visualize your SvelteKit bundles, you need to install the Sonda npm package and add the Sonda plugin to your SvelteKit configuration.

## Installation

### Install the package

To get started, install the Sonda package using the following command:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Next, register the Sonda plugin for SvelteKit and enable source maps in the `vite.config.ts` file:

```js{3,7,11}
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Sonda from 'sonda/sveltekit';  // [!code focus]

export default defineConfig({
  build: {
    sourcemap: true  // [!code focus]
  },
  plugins: [
    sveltekit(),
    Sonda()  // [!code focus]
  ]
});
```

Sonda requires source maps to function correctly, but some other plugins may not support or generate them by default. If Sonda does not work as expected, check the documentation for the other plugins you are using to ensure source maps are enabled.

### Configure the plugin

The steps above will allow you to generate your first report. However, if the report does not contain the information you need, refer to the [Configuration](/configuration) page to explore additional options and learn how to enable them.

#### Generating a report for the server bundle

In addition to the options listed on the configuration page, the SvelteKit integration has an additional option called `server`. This option enables Sonda to generate a report for the server bundle as well and it requires the `build.sourcemap` option to be enabled in the SvelteKit configuration.

```js{11-13}
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Sonda from 'sonda/sveltekit';

export default defineConfig({
  build: {
    sourcemap: true
  },
  plugins: [
    sveltekit(),
    Sonda( { // [!code focus]
      server: true // [!code focus]
    } ) // [!code focus]
  ]
} );
```
