---
outline: deep
---

# Configuration

All Sonda plugins accept the same configuration options. The configuration object is optional, and **it is recommended to enable additional features only when necessary**, as they may impact the performance of the build process, the size of the generated report, or the amount of information included in it.

These are the default options:

```js
{
  enabled: true,
  format: 'html',
  filename: 'sonda-report.html',
  open: true,
  detailed: false,
  sources: false,
  gzip: false,
  brotli: false,
}
```

You can override these options by passing a configuration object to the plugin. For example:

```js
Sonda( {
  enabled: false
} )
```

## Options

### `enabled` <Badge type="tip" text="Introduced in 0.7.0" />

* **Type:** boolean
* **Default:** `true`

Specifies whether the plugin is enabled.

### `format`

* **Type:** string
* **Default:** `'html'`

Specifies the output format of the report. Supported formats include:

* `'html'` - An HTML file with a treemap visualization.
* `'json'` - A JSON file.

### `filename` <Badge type="tip" text="Introduced in 0.6.0" />

* **Type:** string
* **Default:** `'sonda-report.html'` or `'sonda-report.json'` depending on the `format` option

Specifies the path of the generated report. This can be a filename, a relative path, or an absolute path. By default, the report is saved in the current working directory.

::: tip 💡 Framework integrations
Frameworks typically generate separate server and client bundles. Therefore, the `filename` option for frameworks must include a `[env]` token, which is replaced with the environment name (e.g., `'server'`, `'client'`, or similar).

The default value for the `filename` option in frameworks is `'sonda-report-[env].html'` or `'sonda-report-[env].json'`, depending on the `format` option.

This does not apply to bundler plugins, as they generate a single type of bundles.
:::

### `open`

* **Type:** boolean
* **Default:** `true`

Specifies whether to automatically open the report in the default program for the given file extension (`.html` or `.json`, depending on the `format` option) after the build process.

### `detailed`

* **Type:** boolean
* **Default:** `false`

Specifies whether to read the source maps of imported modules.

By default, external dependencies bundled into a single file appear as a single asset in the report. When this option is enabled, the report includes the source files of imported modules, if source maps are available.

Enabling this option may increase the time needed to generate the report and reduce the accuracy of estimated GZIP and Brotli sizes for individual files.

For more details, see the [Detailed view](/features/detailed-view) section.

### `sources` <Badge type="tip" text="Introduced in 0.5.0" />

* **Type:** boolean
* **Default:** `false`

Specifies whether to include source maps of the assets in the report to visualize which parts of the code contribute to the final asset size.

For more details, see the [Used code](/features/used-code) section.

::: danger ⚠️ Be cautious when sharing reports with the `sources` option enabled
This option significantly increases the size of the report and embeds the **source code** of the assets. If you are working with proprietary code, ensure you share the report responsibly.
:::

### `gzip`

* **Type:** boolean
* **Default:** `false`

Specifies whether to calculate the sizes of assets after compression with GZIP.

The report includes estimated compressed sizes for each file within an asset. However, these estimates are approximate and should be used as a general reference.

Enabling this option may increase the time required to generate the report.

For more details, see the [Compression sizes](/features/compression-sizes) section.

### `brotli`

* **Type:** boolean
* **Default:** `false`

Specifies whether to calculate the sizes of assets after compression with Brotli.

The report includes estimated compressed sizes for each file within an asset. However, these estimates are approximate and should be used as a general reference.

Enabling this option may increase the time required to generate the report.

For more details, see the [Compression sizes](/features/compression-sizes) section.

### `server` <Badge type="tip" text="Introduced in 0.7.0" />

* **Type:** boolean
* **Default:** `false`

Specifies whether to generate reports for server bundles in addition to client bundles.

::: tip 💡 Framework integrations
This option is available only in framework integrations.
:::
