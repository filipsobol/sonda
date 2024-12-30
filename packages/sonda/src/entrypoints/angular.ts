import { relative, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import type { UserOptions } from '../types';
import type { Metafile } from 'esbuild';
import { processEsbuildMetaFile } from './esbuild';

interface AngularUserOptions extends UserOptions {
  config: string;
  projects: string[];
}

export default function SondaAngular( options: Partial<AngularUserOptions> = {} ): void {
  const cwd = process.cwd();
  const {
    config = 'angular.json',
    projects = [],
    ...opts
  } = options;

  opts.format ??= 'html';
  opts.filename ??= `sonda-report-[project].${ opts.format }`;

  // Angular workspaces can have multiple projects, so we need to generate a report for each
  if ( !opts.filename.includes( '[project]' ) ) {
    throw new Error( 'SondaAngular: The "filename" option must include the "[project]" token.' );
  }

  const angularConfig = loadJson( config );
  const projectsToGenerate = projects.length ? projects : Object.keys( angularConfig.projects );

  for ( const project of projectsToGenerate ) {
    const { statsJson, outputPath } = angularConfig.projects[ project ].architect.build.options;

    if ( !statsJson ) {
      continue;
    }

    const paths: Record<'base' | 'browser' | 'server', string> = typeof outputPath === 'object'
      ? outputPath
      : { base: outputPath };

    paths.base = resolve( cwd, paths.base );
    paths.browser = resolve( paths.base, paths.browser || 'browser' );
    paths.server = resolve( paths.base, paths.server || 'server' );

    const metafile = loadJson<Metafile>( resolve( paths.base, 'stats.json' ) );

    for ( const [ output, data ] of Object.entries( metafile.outputs ) ) {
      // Paths in outputs don't include the server and browser directories, so we need to add them
      const isBrowserFile = existsSync( resolve( paths.browser, output ) );
      const newOutput = relative( cwd, resolve( isBrowserFile ? paths.browser : paths.server, output ) );

      metafile.outputs[ newOutput ] = data;
      delete metafile.outputs[ output ];
    }

    // Because this configuration is shared between multiple projects, we need to clone it
    const sondaOptions = Object.assign( {}, opts );

    // Replace the "[project]" token with the current project name
    sondaOptions.filename = sondaOptions.filename!.replace( '[project]', project );

    processEsbuildMetaFile( metafile, sondaOptions );
  }
}

function loadJson<T extends any = any>( path: string ): T {
  return JSON.parse(
    readFileSync( resolve( process.cwd(), path ), 'utf8' )
  );
}
