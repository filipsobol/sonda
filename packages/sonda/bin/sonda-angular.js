'use strict';

import { parseArgs } from 'util';
import Sonda from 'sonda/angular';

const { values } = parseArgs( {
  options: {
    config: { type: 'string' },
    project: { type: 'string', multiple: true },
    format: { type: 'string' },
    filename: { type: 'string' },
    'no-open': { type: 'boolean' },
    detailed: { type: 'boolean' },
    sources: { type: 'boolean' },
    gzip: { type: 'boolean' },
    brotli: { type: 'boolean' }
  },
  
  // Skip `node sonda-angular`
  args: process.argv.slice( 2 ),

  // Fail when unknown argument is used
  strict: true
} );

if ( values[ 'no-open' ] ) {
  values.open = false;
  delete values[ 'no-open' ];
}

Sonda( values );
