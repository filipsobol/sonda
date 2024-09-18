import { resolve } from "path";
import { readFileSync } from "fs";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { viteSingleFile } from "vite-plugin-singlefile";
import { createHtmlPlugin } from "vite-plugin-html";

let REPORT_DATA = "__REPORT_DATA__";

if ( process.env.NODE_ENV !== "production" ) {
  const dataFilePath = resolve( process.cwd(), 'sample_data.json' );

  REPORT_DATA = readFileSync( dataFilePath, 'utf-8' );
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    viteSingleFile({
      removeViteModuleLoader: true,
    }),
    createHtmlPlugin({
      minify: false,
      inject: {
        data: {
          SONDA_REPORT_DATA: `<script type="module">window.SONDA_JSON_REPORT = JSON.parse(String.raw\`${REPORT_DATA}\`);</script>`,
        },
      },
    }),
  ],
  build: {
    emptyOutDir: false,
    outDir: resolve(import.meta.dirname, "../sonda/dist"),
  },
});
