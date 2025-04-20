import Sonda from 'sonda/nuxt';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig( {
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  sourcemap: {
    server: true,
    client: true
  },
  modules: [
    Sonda( {
			format: 'json',
      server: true
    } )
  ]
} );
