// import { join, relative, resolve } from 'path';
// import type { Reporter as ReporterOpts } from '@parcel/types';
// import {
//   generateReport,
//   getTypeByName,
//   normalizePath,
//   type Report,
//   type Input,
//   type UserOptions
// } from 'sonda';

// class Reporter {
//   constructor ( opts: ReporterOpts ) {
//     // @ts-ignore
//     this[ Symbol.for( 'parcel-plugin-config' ) ] = opts;
//   }
// }

// const SondaParcelPlugin: Reporter = new Reporter( {
//   // @ts-ignore
//   async loadConfig( { config } ): Promise<UserOptions> {
//   // @ts-ignore
//     const conf = await config.getConfig<UserOptions>( [
//       resolve( '.sondarc' ),
//       resolve( '.sondarc.js' ),
//       resolve( 'sonda.config.js' ),
//     ], {} );

//     return conf!.contents;
//   },
//   async report( { event, options } ) {
//     if ( event.type !== 'buildSuccess' ) {
//       return;
//     }

//     let inputs: Report[ 'inputs' ] = {};
//     const assets: Array<string> = [];

//     for ( let bundle of event.bundleGraph.getBundles() ) {
//       assets.push( bundle.filePath );

//       // @ts-ignore
//       bundle.traverseAssets( asset => {
//         const input = {
//           bytes: asset.stats.size,
//           type: getTypeByName( asset.filePath ),

//           // TODO: What abount 'unknown'?
//           format: asset.meta.hasCJSExports ? 'cjs' : 'esm',
//           imports: [] as Array<string>,
//           belongsTo: null,
//         } satisfies Input;

//         for ( let dep of event.bundleGraph.getDependencies( asset ) ) {
//           let resolved = event.bundleGraph.getResolvedAsset( dep, bundle )!;

//           if ( resolved ) {
//             input.imports.push( normalizePath( relative( process.cwd(), resolved.filePath ) ) );
//           }
//         }

//         inputs[ normalizePath( relative( process.cwd(), asset.filePath ) ) ] = input;
//       } );
//     }

//     return generateReport(
//       assets,
//       inputs,
//       // TODO: Use user provided options
//       {
//         format: 'html',
//         detailed: true,
//         sources: true,
//         gzip: true,
//         brotli: true,
//         // TODO: `resolve` instead of `join`?
//         sourcesPathNormalizer: ( path: string ) => join( options.projectRoot, path ),
//       }
//     );
//   }
// } );

// export default SondaParcelPlugin;
