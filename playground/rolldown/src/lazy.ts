export function formatTeaser(text: string): string {
	return text.trim().split(/\s+/).slice(0, 12).join(' ');
}
