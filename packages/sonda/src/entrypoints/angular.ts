import { readFileSync, readdirSync } from 'fs';
import { basename, relative, resolve } from 'path';
import { processEsbuildMetafile, Config, type UserOptions } from 'sonda';
import type { Metafile } from 'esbuild';

interface AngularUserOptions extends UserOptions {
  config: string;
  projects: string[];
}

interface Paths {
  base: string;
  browser: string;
  server: string;
}

export default async function SondaAngular( {
  config = 'angular.json',
  projects = [],
  ...userOptions
}: AngularUserOptions ): Promise<void> {
  const options = new Config( userOptions, {
    integration: 'angular',
    filename: 'sonda_[env]_[index]'
  } );

  const angularConfig = loadJson( config );
  const projectsToGenerate = projects.length ? projects : Object.keys( angularConfig.projects );

  for ( const project of projectsToGenerate ) {
    const { outputPath } = angularConfig.projects[ project ].architect.build.options;
    const paths: Paths = typeof outputPath === 'object'
      ? outputPath
      : { base: outputPath };

    paths.base = resolve( process.cwd(), paths.base );
    paths.browser = resolve( paths.base, paths.browser || 'browser' );
    paths.server = resolve( paths.base, paths.server || 'server' );

    const metafile = updateMetafile(
      loadJson<Metafile>( resolve( paths.base, 'stats.json' ) ),
      paths.base
    );

    // Because this configuration is shared between multiple projects, we need to clone it
    const sondaOptions = options.clone();

    // Replace the "[project]" token with the current project name
    sondaOptions.filename = sondaOptions.filename.replace( '[env]', project );

    // Resolve the source map paths relative to the current working directory, not the path of the file itself
    sondaOptions.sourcesPathNormalizer = ( path: string ) => resolve( process.cwd(), path );

    await processEsbuildMetafile( metafile, sondaOptions );
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
  basePath: string
): Metafile {
  const cwd = process.cwd();

  // Clone the original outputs object
  const outputs = Object.assign( {}, metafile.outputs );

  // Reset the outputs
  metafile.outputs = {};

  for ( const path of readdirSync( basePath, { encoding: 'utf8', recursive: true } ) ) {
    const absolutePath = resolve( basePath, path );
    const filename = basename( absolutePath );
    const originalOutput = outputs[ filename ];

    // If the output file name exists in the original outputs, add the updated relative path
    if ( originalOutput ) {
      metafile.outputs[ relative( cwd, absolutePath ) ] = originalOutput;
    }
  }

  return metafile;
}
