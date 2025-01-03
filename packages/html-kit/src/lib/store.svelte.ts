import type { Sizes, JsonReport } from 'sonda';

export type CompressionType = keyof Sizes;
export type Compressions = Array<[ CompressionType, string ]>;

export type OutputType = 'all' | 'js' | 'css' | 'other';

export type OutputsByTypes = {
  [ type in OutputType ]: JsonReport[ 'outputs' ];
};

interface Store {
  report: JsonReport;
  outputTypes: OutputsByTypes;
  compressions: Compressions;
  compression: CompressionType;
}

export const jsRegexp: RegExp = /\.[cm]?[tj]s[x]?$/;
export const cssRegexp: RegExp = /\.css$/;

function Store(): Store {
  const report: JsonReport = JSON.parse( decodeURIComponent( import.meta.env.VITE_SONDA_REPORT_DATA ) );
  const outputTypes = getOutputTypes( report );
  const compressions = getCompressions( report );

  let compression = $state<CompressionType>( 'uncompressed' );

  return {
    get report() { return report },
    get outputTypes() { return outputTypes },

    get compressions() { return compressions },
    get compression() { return compression },
    set compression( newCompression: CompressionType ) { compression = newCompression },
  }
}

/**
 * Returns the compressions available in the report.
 */
function getCompressions( report: JsonReport ): Compressions {
  const compressions: Compressions = [ [ 'uncompressed', 'Uncompressed' ] ];
  const output = Object.values( report.outputs )[ 0 ];

  if ( output ) {
    output.gzip && compressions.push( [ 'gzip', 'Gzip' ] );
    output.brotli && compressions.push( [ 'brotli', 'Brotli' ] );
  }

  return compressions;
}

/**
 * Returns the outputs grouped by type.
 */
function getOutputTypes( report: JsonReport ): OutputsByTypes {
  const outputTypes: OutputsByTypes = {
    all: {},
    js: {},
    css: {},
    other: {}
  };

  for ( const [ name, output ] of Object.entries( report.outputs ) ) {
    outputTypes.all[ name ] = output

    if ( jsRegexp.test( name ) ) {
      outputTypes.js[ name ] = output;
    } else if ( cssRegexp.test( name ) ) {
      outputTypes.css[ name ] = output;
    } else {
      outputTypes.other[ name ] = output;
    }
  }

  return outputTypes;
}

export const store = Store();
