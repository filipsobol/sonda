import { Config, type UserOptions } from '../config.js';
import { getTypeByName, normalizePath } from '../utils.js';
import { Report } from '../report/report.js';
import type { Metafile, Plugin } from 'esbuild';

export function SondaEsbuildPlugin( userOptions: UserOptions = {} ): Plugin {
  const options = new Config( userOptions, {
		integration: 'esbuild'
	} );

  return {
    name: 'sonda-esbuild',
    setup( build ) {
      if ( !options.enabled ) {
        return;
      }

      build.initialOptions.metafile = true;

      build.onEnd( result => processEsbuildMetafile( result.metafile!, options ) );
    }
  };
}

export async function processEsbuildMetafile(
	metafile: Metafile,
	options: Config
): Promise<void> {
  const report = new Report( options );

  for ( const [ path, input ] of Object.entries( metafile.inputs ) ) {
		const name = normalizePath( path );

    report.resources.push( {
			kind: 'source',
      name,
      type: getTypeByName( path ),
      format: input.format || 'other',
      uncompressed: input.bytes,
      parent: null
    } );

		input.imports.forEach( imp => report.edges.push( {
			source: name,
			target: normalizePath( imp.path ),
      original: imp.original || null
		} ) );
  }

  const assets = Object
    .entries( metafile.outputs )
    .map( ( [ path, output ] ) => [ path, output.entryPoint ? [ output.entryPoint ] : undefined ] as [ string, Array<string> | undefined ] )

  await report.generate( assets );
}
