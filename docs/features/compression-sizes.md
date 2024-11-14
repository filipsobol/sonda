---
outline: deep
---

# Compression sizes

By default, Sonda only shows the uncompressed sizes of the assets and individual source files that make up the asset. However, you can enable the [`gzip`](/configuration#gzip) and [`brotli`](/configuration#brotli) options to see the compressed sizes as well.

## Asset sizes

<CustomImage
  src="/sizes-asset.jpg"
  alt="Table containing sizes of an asset before and after compression and estimated download times"
  caption="Modal showing asset data also contains the estimated download times using slow 3G"
/>

The GZIP and Brotli sizes shown in the asset modals are close to the actual sizes you would get when serving the files from a web server that supports GZIP or Brotli compression. However, the actual sizes may vary slightly depending on the specific compression settings you use.

## Source sizes

<CustomImage
  src="/sizes-source.jpg"
  alt="Table containing sizes of an individual source before and after compression"
/>

The GZIP and Brotli sizes shown in individual sources modals are less accurate and should be treated only as estimates. This is because in general compression algorithms work more effectively on larger amounts of data due to the increased opportunities to identify patterns. When compressing a smaller, individual sources, the compression ratio will likely be lower than when compressing an entire asset.
