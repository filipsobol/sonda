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
  outputDir: '.sonda',
  open: true,
  deep: false,
  sources: false,
  gzip: false,
  brotli: false,
}
```

You can override these options by passing a configuration object to the plugin. For example:

```js
Sonda( {
  open: false
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
* **Default:** `'sonda_[index]'` for bundler integrations and `'sonda_[env]_[index]'` for framework integrations.

Specifies the filename of the generated report. If this value is an absolute path, it will override the `outputDir` option.

The default value includes placeholders like `[index]` and `[env]`, which are replaced during report generation.

The `[index]` placeholder is replaced with a version number that increments each time a new report is generated. This allows you to keep multiple revisions of the report without overwriting previous ones. If you want to generate only a single report and always overwrite the previous one, you can set this option to a static value, such as `'sonda'`.

Additionally, framework integrations that can generate reports for both the client and server (with the [`server`](#server) option) will include the `[env]` placeholder in the filename. This is replaced with the environment name (e.g., `client`, `server`), allowing you to distinguish between client and server reports.

### `outputDir` <Badge type="tip" text="Introduced in 0.8.0" />
* **Type:** string
* **Default:** `'.sonda'`
* **Description:** The directory where the report will be saved.

Specifies the directory where the report will be saved. This can be a relative path or an absolute path. By default, the report is saved in a directory named `.sonda` relative to the current working directory.

The directory is created if it does not exist.

### `open`

* **Type:** boolean
* **Default:** `true`

Specifies whether to automatically open the report in the default program for the given file extension (`.html` or `.json`, depending on the `format` option) after the build process.

### `deep`

* **Type:** boolean
* **Default:** `false`

Specifies whether to read the source maps of imported modules.

By default, external dependencies bundled into a single file appear as a single asset in the report. When this option is enabled, the report includes the source files of imported modules, if source maps are available.

Enabling this option may increase the time needed to generate the report and reduce the accuracy of estimated GZIP and Brotli sizes for individual files.

For more details, see the [Deep view](/features/deep-view) page.

### `sources` <Badge type="tip" text="Introduced in 0.5.0" />

* **Type:** boolean
* **Default:** `false`

Specifies whether to include source maps of the assets in the report to visualize which parts of the code contribute to the final asset size.

For more details, see the [Inspect code](/features/used-code) page.

::: danger ⚠️ Be cautious when sharing reports with the `sources` option enabled
This option significantly increases the size of the report and embeds the **source code** of the assets. If you are working with proprietary code, ensure you share the report responsibly.
:::

### `gzip`

* **Type:** boolean
* **Default:** `false`

Specifies whether to calculate the sizes of assets after compression with GZIP.

The report includes estimated compressed sizes for each file within an asset. However, these estimates are approximate and should be used as a general reference.

Enabling this option may increase the time required to generate the report.

For more details, see the [Compression sizes](/features/compression-sizes) page.

### `brotli`

* **Type:** boolean
* **Default:** `false`

Specifies whether to calculate the sizes of assets after compression with Brotli.

The report includes estimated compressed sizes for each file within an asset. However, these estimates are approximate and should be used as a general reference.

Enabling this option may increase the time required to generate the report.

For more details, see the [Compression sizes](/features/compression-sizes) page.

### `server` <Badge type="tip" text="Introduced in 0.7.0" />

* **Type:** boolean
* **Default:** `false`

Specifies whether to generate reports for server bundles in addition to client bundles.

::: tip 💡 Only available in framework integrations
This option is available only in **framework** integrations.
:::

## Deprecated options

### `detailed` <Badge type="danger" text="Removed in 0.8.0" />

* **Type:** boolean
* **Default:** `false`

Renamed to `deep`.
