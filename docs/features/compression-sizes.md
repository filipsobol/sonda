---
outline: deep
---

# Compression sizes

By default, Sonda displays the uncompressed sizes of assets and the individual source files that make up each asset. However, you can enable the [`gzip`](/configuration#gzip) and [`brotli`](/configuration#brotli) options to view the compressed sizes as well.

## Accuracy

### Asset sizes

<CustomImage
  src="/sizes-asset.jpg"
  alt="Table containing sizes of an asset before and after compression and estimated download times"
  caption="Modal showing asset data also contains the estimated download times using slow 3G"
/>

The GZIP and Brotli sizes displayed in the assets modal closely reflect the actual sizes you would see when serving files with these compression methods enabled on a server. While there may be slight variations due to specific compression settings, these differences are generally minimal.

### Source sizes

<CustomImage
  src="/sizes-source.jpg"
  alt="Table containing sizes of an individual source before and after compression"
/>

The GZIP and Brotli sizes shown for individual source files are estimates rather than exact measurements. This is because compression algorithms like GZIP and Brotli are more effective when applied to larger datasets. Larger assets benefit from more opportunities to identify and compress repeated patterns, whereas smaller, isolated files tend to compress less efficiently.

To estimate the compressed size of each source file:

1. Each source file is individually compressed using GZIP and Brotli to calculate its "worst case" compressed size.
2. The sizes of all individually compressed files are summed.
3. The sum is scaled down to match the actual compressed size of the whole asset, and the difference is redistributed proportionally across all the files.

::: info Example
Consider an asset that consists of two source files. When compressed individually, each file is 500 bytes, for a total of 1000 bytes. However, when the entire asset is compressed, the result is 800 bytes due to shared patterns. The 200 bytes of compression benefit are distributed proportionally, so the displayed compressed size of each file is 400 bytes. This ensures that the sum of the individual sizes equals the total compressed asset size.
:::

While this method provides reasonable estimates, the sizes displayed for individual files may still differ slightly from their actual contribution to the compressed asset. The actual impact of each file depends on the patterns it shares with other files and how they collectively influence the compression process.
