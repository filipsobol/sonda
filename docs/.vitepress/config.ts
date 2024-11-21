import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'Sonda',
  description: 'Universal visualizer and analyzer for JavaScript and CSS bundles. Works with Vite, Rollup, webpack, Rspack, and esbuild',
  head: [ [ 'link', { rel: 'icon', href: '/sonda.ico' } ] ],
  sitemap: {
    hostname: 'https://sonda.dev'
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/sonda.jpg',

    nav: [
      { text: 'Guide', link: '/introduction' },
      { text: 'Demo', link: '/demo.html', target: '_blank' },
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
          { text: 'Treemap graph', link: '/features/treemap-graph' },
          { text: 'Compression sizes', link: '/features/compression-sizes' },
          { text: 'Dependency tree', link: '/features/dependency-tree' },
          { text: 'Detailed view', link: '/features/detailed-view' },
          { text: 'Used code', link: '/features/used-code' },
          { text: 'Dependency warnings', link: '/features/dependency-warnings' },
        ]
      },
      {
        text: 'Blog',
        items: [
          { text: 'What makes Sonda accurate?', link: '/blog/what-makes-sonda-accurate' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/filipsobol/sonda' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/sonda' },
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
