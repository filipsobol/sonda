import ContainerQueries from '@tailwindcss/container-queries';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    fontFamily: {
      'mono': ['"JetBrains Mono"', 'monospace']
    },
    extend: {
      containers: {
        '3xs': '10rem',
        '2xs': '16rem'
      }
    }
  },

  plugins: [
    ContainerQueries
  ]
} as Config;
