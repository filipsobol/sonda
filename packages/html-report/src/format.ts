const sizeUnits = [
	'b',
	'KiB',
	'MiB',
	'GiB',
	'TiB',
	'PiB',
];

const timeUnits = [
	'ms',
	's'
];

function format( units: Array<string>, distance: number, value: number ): string {
	let size = value;
	let iterations = 0;

	while ( size > distance && ( units.length > iterations + 1 ) ) {
		size = size / distance;
		iterations++;
	}

	// Round only if the size is represented in unit other than the base unit
	return `${ iterations ? size.toFixed( 2 ) : size } ${ units[ iterations ] }`;
}

export function formatSize( bytes: number ): string {
	return format( sizeUnits, 1024, bytes );
}

export function formatTime( ms: number ): string {
	return format( timeUnits, 1000, ms );
}
