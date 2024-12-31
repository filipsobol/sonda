import { readFileSync, readdirSync } from 'fs';
import { basename, relative, resolve } from 'path';
import type { UserOptions } from '../types';
import type { Metafile } from 'esbuild';
import { processEsbuildMetaFile } from './esbuild';

interface AngularUserOptions extends UserOptions {
  config: string;
  projects: string[];
}

interface Paths {
  base: string;
  browser: string;
  server: string;
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
    const { outputPath } = angularConfig.projects[ project ].architect.build.options;
    const paths: Paths = typeof outputPath === 'object'
      ? outputPath
      : { base: outputPath };

    paths.base = resolve( cwd, paths.base );
    paths.browser = resolve( paths.base, paths.browser || 'browser' );
    paths.server = resolve( paths.base, paths.server || 'server' );

    const metafile = updateMetafile(
      loadJson<Metafile>( resolve( paths.base, 'stats.json' ) ),
      paths
    );

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

/**
 * Output paths in metafile only include file name, without the relative path from the current
 * working directory. For example, in the metafile the output path is "main-xxx.js", but in the
 * file system it's "dist/project/browser/en/main-xxx.js". This function updates the output paths
 * to include the relative path from the current working directory.
 */
function updateMetafile(
  metafile: Metafile,
  paths: Paths
): Metafile {
  const cwd = process.cwd();

  // Clone the original outputs object
  const outputs = Object.assign( {}, metafile.outputs );

  // Reset the outputs
  metafile.outputs = {};

  for ( const path of readdirSync( paths.base, { encoding: 'utf8', recursive: true } ) ) {
    const absolutePath = resolve( paths.base, path );
    const filename = basename( absolutePath );
    const originalOutput = outputs[ filename ];

    // If the output file name exists in the original outputs, add the updated relative path
    if ( originalOutput ) {
      metafile.outputs[ relative( cwd, absolutePath ) ] = originalOutput;
    }
  }

  return metafile;
}
