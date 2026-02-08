---
outline: deep
---

# Visualizing Next.js bundles with Sonda

To analyze and visualize your Next.js bundles, you need to install the Sonda npm package and add the Sonda plugin to your Next.js configuration.

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

Next, register the Sonda plugin for Next.js and enable source maps in the `next.config.ts` file:

```js{1,4,7,10}
import Sonda from 'sonda/next'; // [!code focus]
import type { NextConfig } from 'next';

const withSondaAnalyzer = Sonda(); // [!code focus]

const config: NextConfig = {
  productionBrowserSourceMaps: true // [!code focus]
};

export default withSondaAnalyzer( config ); // [!code focus]
```

Now, every time you build your project, Sonda will generate a report with information about your bundles.

Sonda requires source maps to function correctly, but some other plugins may not support or generate them by default. If Sonda does not work as expected, check the documentation for the other plugins you are using to ensure source maps are enabled.

### Configure the plugin

The steps above will allow you to generate your first report. However, if the report does not contain the information you need, refer to the [Configuration](/configuration) page to explore additional options and learn how to enable them.

#### Generating a report for the server bundle

In addition to the options listed on the configuration page, the Next.js integration has an additional option called `server`. This option enables Sonda to generate a report for the server bundle as well and it requires the `experimental.serverSourceMaps` option to be enabled in the Next.js configuration.

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
