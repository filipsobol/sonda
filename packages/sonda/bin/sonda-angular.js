#!/usr/bin/env node

import { parseArgs } from 'util';
import Sonda from 'sonda/angular';

/**
 * Use `RegExp.escape()` when it's more widely available.
 */
function stringToRegExp(value) {
  // 1) Grab optional ^, then any characters, then optional $
  const [, start, core, end] = /^(\^?)(.*?)(\$?)$/.exec( value );

  // 2) Escape all regex‑meta in the core
  const escaped = core.replace( /[-.*+?^${}()|[\]\\]/g, '\\$&' );

  // 3) Stitch back only the anchors the user really wrote
  return new RegExp( start + escaped + end );
}

const { values } = parseArgs( {
  options: {
    config: { type: 'string' },
    projects: { type: 'string', multiple: true },
    include: { type: 'string', multiple: true },
    exclude: { type: 'string', multiple: true },
    format: { type: 'string' },
    filename: { type: 'string' },
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

values.include = values.include?.map( stringToRegExp );
values.exclude = values.exclude?.map( stringToRegExp );

Sonda( values );
