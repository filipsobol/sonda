import type { JsonReport } from '../types';

/**
 * Find issues with the bundles.
 */
export function getIssues( report: JsonReport ): JsonReport['issues'] {
  const issues: JsonReport['issues'] = {};
  const duplicateDependencies = getDuplicateDependencies( report );

  if ( duplicateDependencies.length > 0 ) {
    issues.duplicateDependencies = duplicateDependencies;
  }

  return issues;
}

function getDuplicateDependencies( report: JsonReport ): Array<string> {
  return Object
    .entries( report.dependencies )
    .filter(  ( [ , paths ] ) => paths.length > 1 )
    .map( ( [ packageName ] ) => packageName );
}
