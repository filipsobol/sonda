export function formatTeaser(text) {
	return text.trim().split(/\s+/).slice(0, 12).join(' ');
}
