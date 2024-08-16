import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'always-full-reload',
      handleHotUpdate( { server } ) {
        server.ws.send( { type: "full-reload" } )
        return []
      },
    } satisfies PluginOption
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
