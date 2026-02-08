const SIZE_UNITS = ['b', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

const TIME_UNITS = ['ms', 's'];

const MODULES = 'node_modules';

function format(units: Array<string>, distance: number, value: number): string {
	let size = value;
	let iterations = 0;

	while (size > distance && units.length > iterations + 1) {
		size = size / distance;
		iterations++;
	}

	// Round only if the size is represented in unit other than the base unit
	return `${iterations ? size.toFixed(2) : size} ${units[iterations]}`;
}

export function formatSize(bytes: number): string {
	return format(SIZE_UNITS, 1024, bytes);
}

export function formatTime(ms: number): string {
	return format(TIME_UNITS, 1000, ms);
}

export function formatPath(path: string): string {
	// Path may containg multiple `node_modules` directories, so we need to find the last one.
	const index = path.lastIndexOf(MODULES);

	return index >= 0 ? path.slice(index + MODULES.length + 1) : path;
}
