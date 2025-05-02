import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  Config,
  ReportProducer,
  getTypeByName,
  normalizePath,
  type UserOptions
} from '../index.js';
import type { Metafile, Plugin } from 'esbuild';

export default function SondaEsbuildPlugin( userOptions: UserOptions = {} ): Plugin {
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

      build.onEnd( result => processEsbuildBuild( result.metafile!, options ) );
    }
  };
}

export async function processEsbuildBuild(
	metafile: Metafile,
	options: Config
): Promise<void> {
  const report = new ReportProducer( options );
  const cwd = process.cwd();

  for ( const [ path, input ] of Object.entries( metafile.inputs ) ) {
		const name = normalizePath( path );
    const type = getTypeByName( path );
    let content: string | null = null;

    if ( options.sources ) {
      try {
        content = readFileSync( resolve( cwd, path ), 'utf8' );
      } catch {
        content = null;
      }
    }

    report.resources.push( {
			kind: 'source',
      name,
      type,
      format: input.format || null,
      uncompressed: input.bytes,
      gzip: 0,
      brotli: 0,
      parent: null,
      content,
      mappings: null
    } );

		input.imports.forEach( imp => report.edges.push( {
			source: name,
			target: normalizePath( imp.path )
		} ) );
  }

  await report.generate( Object.keys( metafile.outputs ) );
}
