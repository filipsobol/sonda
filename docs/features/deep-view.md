---
outline: deep
---

# Deep view

By default, the report (in both `html` and `json` formats) includes only the distribution files of the dependencies (the files used by the bundler). This is because, in most cases, it is sufficient to know whether the dependency is in the bundle and how much space it takes. Including more detailed information would add noise to the report and increase build time unnecessarily.

<CustomImage
  src="/treemap.jpg"
  alt="Tree map chart for a folder containing multiple folders and distribution files from the Sonda project itself"
  caption="Default tree map chart of the Sonda project itself"
/>

However, if you need to inspect the contents of the dependencies, you can enable the [`deep`](/configuration#deep) option in the configuration. This allows Sonda to read the source maps of the dependencies and map the used code to the original source files.

<CustomImage
  src="/treemap-detailed.jpg"
  alt="Tree map chart for a folder containing multiple source folders and files from the Sonda project itself"
  caption="Deep view replaces the distribution files with source files"
/>

Note that this feature works only for dependencies that include source maps.

If you want to view the actual code that was included in the bundle, refer to the [Used code](/features/used-code) page.
