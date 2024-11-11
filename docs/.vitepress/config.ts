import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'Sonda',
  description: 'Universal visualizer and analyzer for JavaScript and CSS bundles. Works with Vite, Rollup, webpack, Rspack, and esbuild',
  head: [ [ 'link', { rel: 'icon', href: '/sonda.ico' } ] ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/sonda.png',

    nav: [
      { text: 'Guide', link: '/introduction' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Configuration', link: '/configuration' },
        ]
      },
      {
        text: 'Features',
        items: [
          { text: 'Compression sizes', link: '/features/compression-sizes' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/filipsobol/sonda' },
      { icon: 'bluesky', link: 'https://bsky.app/profile/filipsobol.bsky.social' },
      { icon: 'x', link: 'https://x.com/filipsobol' },
    ],

    editLink: {
      pattern: 'https://github.com/filipsobol/sonda/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Filip Sobol'
    }
  }
})
