import { defineConfig } from 'vitepress';

const URL = 'https://sonda.dev';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'Sonda',
  description: 'Universal bundle analyzer and visualizer. Works with Vite, Rollup, esbuild, webpack, Rolldown, Rspack, Next.js, Nuxt, Astro, SvelteKit and Angular CLI.',
  head: [
    [ 'link', { rel: 'icon', href: '/sonda.ico' } ],
    [ 'meta', { property: 'og:title', content: 'Sonda' } ],
    [ 'meta', { property: 'og:description', content: 'Universal bundle analyzer and visualizer that works with most popular bundlers and frameworks.' } ],
    [ 'meta', { property: 'og:type', content: 'website' } ],
    [ 'meta', { property: 'og:image', content: URL + '/og-image.png' } ],
    [ 'meta', { name: 'twitter:card', content: 'summary_large_image' } ],
    [ 'meta', { name: 'twitter:image', content: URL + '/og-image.png' } ],
  ],
  sitemap: {
    hostname: URL
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/sonda.jpg',

    nav: [
      { text: 'Documentation', link: '/getting-started' },
      { text: 'Demo', link: '/demo.html', target: '_blank' },
    ],

    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Getting started', link: '/getting-started' },
          { text: 'Configuration', link: '/configuration' },
        ]
      },
      {
        text: 'Integrations',
        items: [
          {
            text: 'Bundlers',
            items: [
              { text: 'Vite', link: '/bundlers/vite' },
              { text: 'Rollup', link: '/bundlers/rollup' },
              { text: 'Rolldown', link: '/bundlers/rolldown' },
              { text: 'esbuild', link: '/bundlers/esbuild' },
              { text: 'webpack', link: '/bundlers/webpack' },
              { text: 'Rspack', link: '/bundlers/rspack' },
            ]
          },
          {
            text: 'Frameworks',
            items: [
              { text: 'Next.js', link: '/frameworks/nextjs' },
              { text: 'Nuxt', link: '/frameworks/nuxt' },
              { text: 'Astro', link: '/frameworks/astro' },
              { text: 'SvelteKit', link: '/frameworks/sveltekit' },
              { text: 'Angular CLI', link: '/frameworks/angular-cli' },
            ]
          }
        ]
      },
      {
        text: 'Features',
        items: [
          { text: 'Treemap graph', link: '/features/treemap-graph' },
          { text: 'Compression sizes', link: '/features/compression-sizes' },
          { text: 'Dependency tree', link: '/features/dependency-tree' },
          { text: 'Deep view', link: '/features/deep-view' },
          { text: 'Inspect code', link: '/features/used-code' },
          { text: 'JSON report', link: '/features/json-report' },
          // { text: 'Dependency warnings', link: '/features/dependency-warnings' },
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
