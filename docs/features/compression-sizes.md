---
outline: deep
---

# Compression sizes

By default, Sonda only shows the uncompressed sizes of the assets and individual files that make up the bundle. However, you can enable the [`gzip`](/configuration#gzip) and [`brotli`](/configuration#brotli) options to see the compressed sizes as well.

The compressed sizes shown for the bundles should be close to the actual sizes you would get when serving the files with a web server that supports GZIP or Brotli compression. However, the actual sizes may vary slightly depending on the specific compression settings you use.

The compressed sizes of individual files in the bundle are less accurate and should be treated as estimates. This is because in general compression algorithms work more effectively on larger amounts of data due to the increased opportunities to identify patterns. When compressing a smaller, individual files, the compression ratio will likely be lower than when compressing an entire bundle.
