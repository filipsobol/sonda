export function formatSize( bytes: number ) {
	const distance = 1024;
	const sizes = [
		'b',
		'KiB',
		'MiB',
		'GiB',
		'TiB',
		'PiB',
	];

	let size = bytes;
	let iterations = 0;

	while ( size > distance && ( sizes.length > iterations + 1 ) ) {
		size = size / distance;
		iterations++;
	}

	// Use `toFixed` only if the size is in KiB or greater.
	return `${ iterations ? size.toFixed( 2 ) : size } ${ sizes[ iterations ] }`;
}
