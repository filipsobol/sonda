import type { Report } from '../report.js';

export function updateInputs( report: Report ): void {
	const usedInputs = Object
		.values( report.outputs )
		.flatMap( output => Object.keys( output.inputs || {} ) )
		.filter( ( input, index, array ) => array.indexOf( input ) === index );

	for ( const input of Object.keys( report.inputs ) ) {
		if ( !usedInputs.includes( input ) ) {
			report.removeInput( input );
		}
	}
}
