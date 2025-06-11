#!/usr/bin/env node

import { parseArgs } from 'util';
import Sonda from 'sonda/angular';

const { values } = parseArgs( {
  options: {
    config: { type: 'string' },
    projects: { type: 'string', multiple: true },
    format: { type: 'string' },
    outputDir: { type: 'string' },
    'no-open': { type: 'boolean' },
    deep: { type: 'boolean' },
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
