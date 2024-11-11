---
outline: deep
---

# Configuration

All Sonda plugins accept the same configuration options. The configuration object is optional and **it is recommended to only enable additional features when needed**, as they may affect the performance of the build process, the size of the generated report, or the information included in it.

These are the default options:

```js
{
  format: 'html',
  open: true,
  detailed: false,
  sources: false,
  gzip: false,
  brotli: false,
}
```

You may override these options by passing a configuration object to the plugin, for example:

```js
SondaRollupPlugin( {
  open: false
} );
```

## Options

### `format`

* **Type:** `string`
* **Default:** `'html'`

Determines the output format of the report. The following formats are supported:

* `'html'` - HTML file with treemap
* `'json'` - JSON file

### `open`

* **Type:** `boolean`
* **Default:** `true`

Determines whether to open the report in the default program for given file extension (`.html` or `.json` depending on the `format` option) after the build.

### `detailed`

* **Type:** `boolean`
* **Default:** `false`

Determines whether to read the source maps of imported modules.

By default, external dependencies that are bundled into a single file appear as a single asset in the report. When this option is enabled, the report will instead include the source files of the imported modules, if they have source maps.

Enabling this option will increase the time needed to generate the report and reduce the accuracy of estimated GZIP and Brotli sizes for individual files.

### `sources`

* **Type:** `boolean`
* **Default:** `false`

Determines whether to include the source maps of the assets in the report to visualize which parts of the code contribute to the final bundle size.

::: warning ⚠️ Be cautious when sharing the report
Enabling this option will significantly increase the report size and include it in the **source code** of the bundles. If you work with proprietary code, be cautious when sharing the report.
:::

### `gzip`

* **Type:** `boolean`
* **Default:** `false`

Determines whether to calculate the sizes of assets after compression with GZIP.

The report will include estimated compressed sizes for each file within an asset. However, unlike the compressed size of the entire asset, these individual file estimates are approximate and should be used as a general reference.

Enabling this option will increase the time needed to generate the report.

See the [Compression sizes](/features/compression-sizes) section for more information.

### `brotli`

* **Type:** `boolean`
* **Default:** `false`

Determines whether to calculate the sizes of assets after compression with Brotli.

The report will include estimated compressed sizes for each file within an asset. However, unlike the compressed size of the entire asset, these individual file estimates are approximate and should be used as a general reference.

Enabling this option will increase the time needed to generate the report.

See the [Compression sizes](/features/compression-sizes) section for more information.
