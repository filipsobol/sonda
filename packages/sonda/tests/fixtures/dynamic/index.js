export async function loadValue() {
	const module = await import('./lazy.js');

	return module.value;
}
