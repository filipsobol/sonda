import { resolve } from "path";
import { readFileSync } from "fs";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { viteSingleFile } from "vite-plugin-singlefile";
import { createHtmlPlugin } from "vite-plugin-html";

let REPORT_DATA = `
  __REPORT_DATA__
`;

if ( process.env.NODE_ENV !== "production" ) {
  const dataFilePath = resolve( process.cwd(), process.env.REPORT_DATA );

  REPORT_DATA = readFileSync( dataFilePath, {
    encoding: "utf-8",
  } );
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
          SONAR_REPORT_DATA: `<script type="module">window.SONAR_JSON_REPORT = JSON.parse(\`${REPORT_DATA}\`);</script>`,
        },
      },
    }),
  ],
  build: {
    emptyOutDir: false,
    outDir: resolve(import.meta.dirname, "../sonar/dist"),
  },
});
