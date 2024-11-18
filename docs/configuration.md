---
outline: deep
---

# Configuration

All Sonda plugins accept the same configuration options. The configuration object is optional and **it is recommended to only enable additional features when needed**, as they may affect the performance of the build process, the size of the generated report, or the information included in it.

These are the default options:

```js
{
  format: 'html',
  filename: 'sonda-report.html',
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

### `filename`

* **Type:** `string`
* **Default:** `'sonda-report.html'` or `'sonda-report.json'` depending on the `format` option

Determines the path of the generated report. The values can be either a filename, a relative path, or an absolute path.

By default, the report is saved in the current working directory.

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

See the [Detailed view](/features/detailed-view) section for more information.

### `sources`

* **Type:** `boolean`
* **Default:** `false`

Determines whether to include the source maps of the assets in the report to visualize which parts of the code contribute to the final asset size.

See the [Used code](/features/used-code) section for more information.

::: danger ⚠️ Be careful when sharing the report with the `sources` option enabled
Enabling this option will significantly increase the size of the report and include it in the **source code** of the assets. If you are working with proprietary code, be careful who you share the report with.
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
