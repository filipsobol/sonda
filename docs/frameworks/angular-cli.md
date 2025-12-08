---
outline: deep
---

# Visualizing Angular CLI bundles with Sonda

To analyze and visualize your Angular CLI bundles, you need to install the Sonda npm package and run the `sonda-angular` CLI command.

## Installation

### Install the package

To get started, install the Sonda package using the following command:

```bash
npm install sonda --save-dev
```

### Run Sonda

The `sonda-angular` CLI command automatically builds your Angular projects with the required options (`--stats-json` and `--source-map`) and then analyzes the results. You can either use the JavaScript API or the CLI command.

::: tip Note
The `sonda-angular` command automatically enables JSON stats and source maps during the build, so you **don't need to manually configure** these options in your `angular.json` file.
:::

If you prefer to build your project separately and skip the automatic build, you can use the `--skip-build` flag and manually configure the options in `angular.json`:

```js{7-12}
{
  "projects": {
    "<YOUR_PROJECT_NAME>": {
      "architect": {
        "build": {
          "options": {
            "statsJson": true, // [!code focus]
            "sourceMap": { // [!code focus]
              "scripts": true, // [!code focus]
              "styles": true, // [!code focus]
              "vendor": true // [!code focus]
            } // [!code focus]
          }
        }
      }
    }
  }
}
```

You may need to repeat this step for every project in your workspace.

The `sourceMap.styles` and `sourceMap.vendor` options are optional. Enable them if you want to analyze styles and vendor scripts.

#### Option 1: Using the JavaScript API

Create a file named `sonda.mjs` with the following content:

```js
import Sonda from 'sonda/angular';

Sonda();
```

Then run the following command:

```bash
node sonda.mjs
```

#### Option 2: Using the CLI

Open the `package.json` file and add the following script:

```json
{
  "scripts": {
    "analyze": "sonda-angular"
  }
}
```

Then run the following command:

```bash
npm run analyze
```

The command accepts the following options. For more information about these options, refer to the next section.

* `--config=<path>`
* `--projects=<name>` (can be specified multiple times)
* `--include=<pattern>` (can be specified multiple times)
* `--exclude=<pattern>` (can be specified multiple times)
* `--format=<format>`
* `--filename=<filename>`
* `--outputDir=<dirname>`
* `--no-open`
* `--skip-build`
* `--detailed`
* `--sources`
* `--gzip`
* `--brotli`

### Configure the plugin

The steps above will allow you to generate your first report. However, if the report does not contain the information you need, refer to the [Configuration](/configuration) page to explore additional options and learn how to enable them.

#### Additional configuration options

In addition to the options listed on the configuration page, the Angular CLI integration accepts the following options.

##### `config`

* **Type:** `string`
* **Default:** `'angular.json'`

Specifies the path to the Angular CLI configuration file.

##### `projects`

* **Type:** `Array<string>`
* **Default:** All projects in the `angular.json` file

Specifies the projects to analyze. By default, Sonda will analyze all projects in the Angular CLI configuration file, but you can specify individual projects based on your needs.

##### `skip-build`

* **Type:** `boolean`
* **Default:** `false`
* **CLI only:** This option is only available when using the CLI command

When set to `true`, skips the automatic build step. Use this if you want to build your Angular projects manually or if you've already built them. When using this option, you must ensure that the required build options (`statsJson: true` and `sourceMap`) are configured in your `angular.json` file.

Example:

```bash
sonda-angular --skip-build
```

##### `include`

* **Type:** `Array<RegExp>` | `null`
* **Default:** `null`

Specifies a list of patterns used to match output assets to include in the report. By default, all assets are included.

The values will be escaped and used as regular expressions. Example:

```bash
sonda-angular --include=.js$
```

##### `exclude`

* **Type:** `Array<RegExp>` | `null`
* **Default:** `null`

Specifies a list of patterns used to match output assets to exclude from the report. By default, no assets are excluded, except for those with `.map` and `.d.ts` extensions, which are always excluded regardless of this setting.

The values will be escaped and used as regular expressions. Example:

```bash
sonda-angular --exclude=.css$
```
