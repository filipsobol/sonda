---
outline: deep
---

# Visualizing Next.js bundles with Sonda

To analyze and visualize your Next.js bundles, you need to install the Sonda npm package and add the Sonda plugin to your Next.js configuration.

## Installation

### Install the package

To get started, install the following package:

```bash
npm install sonda --save-dev
```

### Add the plugin and enable source maps

Then register the Sonda plugin for Next.js and enable the source maps in the `next.config.ts` file.

```js{1,4,7,10}
import Sonda from 'sonda/next'; // [!code focus]
import type { NextConfig } from 'next';

const withSondaAnalyzer = Sonda(); // [!code focus]

const config: NextConfig = {
  productionBrowserSourceMaps: true // [!code focus]
};

export default withSondaAnalyzer( config ); // [!code focus]
```

Sonda requires source maps, but some other plugins may not support or generate them by default. If you see that Sonda is not working properly, check the documentation of other plugins you are using to enable source maps.

### Configure the plugin

The steps above are enough to generate the first report. However, if you do not see the information you need, see the [configuration](/configuration) page to learn about additional options and how to enable them.

#### Generating a report for the server bundle

On top of the options listed on the [configuration](/configuration) page, there is one additional option specific to the Next.js integration, which is `server`. This option allows Sonda to generate a report for the server bundle as well and it requires the `experimental.serverSourceMaps` option to be enabled in the Next.js configuration.

```js{4-6,11}
import Sonda from 'sonda/next';
import type { NextConfig } from 'next';

const withSondaAnalyzer = Sonda( { // [!code focus]
  server: true  // [!code focus]
} ); // [!code focus]

const config: NextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    serverSourceMaps: true // [!code focus]
  }
};

export default withSondaAnalyzer( config );
```
