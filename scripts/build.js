import { resolve } from "path";
import { rm } from "fs/promises";
import { build } from "esbuild";
import pkg from "../package.json" with { type: "json" };

function cwdResolve(name) {
  return resolve(process.cwd(), name);
}

// Remove old build folder
await rm(cwdResolve("dist"), { recursive: true, force: true });

const sharedConfig = {
  entryPoints: [ cwdResolve( "src/index.ts" ) ],
  bundle: true,
  sourcemap: true,
  platform: "node",
  target: "node18",
  logLevel: "warning",
  external: [
    ...Object.keys( pkg.dependencies || {} ),
    ...Object.keys( pkg.peerDependencies || {} ),
  ],
};

// Build ESM version
await build({
  ...sharedConfig,
  outfile: cwdResolve("dist/index.js"),
  format: "esm",
});

// Build CJS version
await build( {
  ...sharedConfig,
  outfile: cwdResolve( "dist/index.cjs" ),
  format: "cjs",
} );
