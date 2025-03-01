import type { Sizes, JsonReport, SourceType } from 'sonda';

type CompressionType = keyof Sizes;

type Compressions = Array< {
  value: CompressionType;
  label: string;
  active: boolean;
} >;

export type OutputType = SourceType | 'all';

type OutputsByTypes = {
  [ type in OutputType ]: JsonReport[ 'outputs' ];
};

interface Store {
  report: JsonReport;
  outputTypes: OutputsByTypes;
  compressions: Compressions;
  compression: CompressionType;
}

function Store(): Store {
  const report: JsonReport = JSON.parse( decodeURIComponent( SONDA_REPORT_DATA ) );
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
  const compressions: Compressions = [];
  const output = Object.values( report.outputs )[ 0 ];

  compressions.push( { value: 'uncompressed',   label: 'Uncompressed',  active: true } );
  compressions.push( { value: 'gzip',           label: 'GZIP',          active: !!output.gzip } );
  compressions.push( { value: 'brotli',         label: 'Brotli',        active: !!output.brotli } );

  return compressions;
}

/**
 * Returns the outputs grouped by type.
 */
function getOutputTypes( report: JsonReport ): OutputsByTypes {
  const outputTypes: OutputsByTypes = {
    all: {},
    script: {},
    style: {},
    other: {}
  };

  for ( const [ name, output ] of Object.entries( report.outputs ) ) {
    outputTypes.all[ name ] = output
    outputTypes[ output.type ][ name ] = output;
  }

  return outputTypes;
}

export const store = Store();
