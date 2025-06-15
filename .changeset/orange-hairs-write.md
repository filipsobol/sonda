---
"sonda": major
---

BREAKING CHANGE: Reports are now saved to the `.sonda` folder by default. The `filename` configuration option has been replaced with the `outputDir` option. Each new report will end with incremented numbers to avoid overwriting previous reports. For example:

- `.sonda/sonda_1.html`
- `.sonda/sonda_2.html`
- `.sonda/sonda_3.html`
