import { Traverse } from 'neotraverse/modern';
import { moduleLexerAsync, parseAsync } from 'oxc-parser';

/**
 * Returns a list of imports / require statements used in a given file
 *
 * @param code Source code to be analyzed
 * @param path File path used to determine whether the code is written in JavaScript or TypeScript
 */
export async function getImports( code: string, path: string ): Promise<Array<string>> {

  /**
   * Naively check if the file contains any `import` or `require(` statements to
   * avoid parsing files that can be easily determined to depend on other files.
   */
  if ( !code.includes( 'import' ) && !code.includes( 'require(' ) ) {
    return [];
  }

  const { hasModuleSyntax, imports } = await moduleLexerAsync( code, {
    sourceFilename: path
  } );

  // If file is an ES module, we can statically analyze imports
  if ( hasModuleSyntax ) {
    return imports
      .map( item => item.n )
      .filter( item => item !== undefined ); // Can be empty if dynamic import doesn't have a valid JS string.
  }

  // Otherwise, the file is a CommonJS module and we need to traverse the AST and look for `require` calls.
  const { program } = await parseAsync( code, {
    sourceFilename: path
  } );

  let requires: Array<string> = [];

  new Traverse( JSON.parse( program ).body ).forEach( ( ctx, item ) => {
    // TODO: This check is naive and should be improved in the future
    if ( ctx.notLeaf && item?.type === 'CallExpression' && item.callee.name === 'require' ) {
      requires.push( item.arguments[ 0 ].value );
    }
  } );

  return requires;
}
