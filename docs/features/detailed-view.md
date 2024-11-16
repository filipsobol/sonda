---
outline: deep
---

# Detailed view

By default, the report (in both `html` and `json` format) only includes the distribution files of the dependencies (the file used by the bundler). This is because in most cases it is only important to know if the dependency is in the bundle or how much space it takes. Including more information would only add noise to the report and increase build time.

<CustomImage
  src="/treemap.jpg"
  alt="Tree map chart for a folder containing multiple folders and distribution files from the Sonda project itself"
  caption="Default tree map chart of the Sonda project itself"
/>

However, if you need to inspect the contents of the dependencies, you can enable the [`detailed`](/configuration#detailed) option in the configuration. This allows Sonda to read the source maps of the dependencies and map the used code to the original source files.

<CustomImage
  src="/treemap-detailed.jpg"
  alt="Tree map chart for a folder containing multiple source folders and files from the Sonda project itself"
  caption="Detailed view does not show the distribution files, but source files instead"
/>

Note that this will only work for dependencies that include source maps.

If you would like to see the actual code that got included in the bundle, see the [Used code](/features/used-code) page.
