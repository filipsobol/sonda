import { shallowRef, computed, type ShallowRef } from 'vue';
import type { AssetResource, ChunkResource, FilesystemResource, JsonReport, Resource, SourcemapResource } from 'sonda';

// The `__REPORT_DATA__` variable is replaced at build time with the actual report data, if available.
const EMBEDDED_REPORT = '__REPORT_DATA__';

// We use zero-width characters to create a unique placeholder that will not be replaced with report data. This allows us to check if the report data has been embedded or not.
const ZW = '\u200C';
const PLACEHOLDER = `__${ZW}REPORT_DATA${ZW}__`.split(ZW).join('');

export const report: ShallowRef<JsonReport | null> = shallowRef(null);

/**
 * Loads report data embedded in the HTML file. The data is expected to be a base64-encoded, gzipped JSON string.
 */
async function loadEmbeddedReport(): Promise<void> {
	if (EMBEDDED_REPORT === PLACEHOLDER) {
		return;
	}

	// Decode base64 string
	const compressedData = await fetch('data:application/octet-stream;base64,' + EMBEDDED_REPORT);
	const arrayBuffer = await compressedData.arrayBuffer();

	// Decompress data
	const decompressor = new DecompressionStream('gzip');
	const body = new Response(arrayBuffer).body;

	if (!body) {
		throw new Error('Unable to load embedded Sonda report.');
	}

	const stream = body.pipeThrough(decompressor);
	const buffer = await new Response(stream).arrayBuffer();

	// Decode the data and parse JSON.
	report.value = JSON.parse(new TextDecoder().decode(buffer));
}

/**
 * Loads report data from a JSON string.
 */
export function loadReportFromJson(json: string): void {
	try {
		report.value = JSON.parse(json);
	} catch {
		throw new Error('Report data is not valid JSON.');
	}
}

/**
 * Loads report data from a URL. The URL is expected to return a JSON string.
 */
export async function loadReportFromUrl(url: string): Promise<void> {
	let response: Response;

	try {
		response = await fetch(url);
	} catch {
		throw new Error('Unable to fetch the report URL.');
	}

	if (!response.ok) {
		throw new Error(`Unable to fetch report (${response.status} ${response.statusText}).`);
	}

	loadReportFromJson(await response.text());
}

await loadEmbeddedReport();

// ------------------------------ SOURCES ------------------------------
function isSource(resource: Resource): resource is FilesystemResource | SourcemapResource {
	return resource.kind === 'filesystem' || resource.kind === 'sourcemap';
}

export const sources = computed<Array<FilesystemResource | SourcemapResource>>(() => {
	return (
		report.value?.resources.filter((resource): resource is FilesystemResource | SourcemapResource =>
			isSource(resource)
		) ?? []
	);
});

export function getSourceResource(name: string): FilesystemResource | SourcemapResource | undefined {
	return report.value?.resources.find(
		(resource): resource is FilesystemResource | SourcemapResource => isSource(resource) && resource.name === name
	);
}

// ------------------------------ CHUNKS ------------------------------
function isChunk(resource: Resource): resource is ChunkResource {
	return resource.kind === 'chunk';
}

export function getChunks(assetName: string): Array<ChunkResource> {
	return (
		report.value?.resources.filter(
			(resource): resource is ChunkResource => isChunk(resource) && resource.parent === assetName
		) ?? []
	);
}

export function getChunkResource(name: string, assetName: string): ChunkResource | undefined {
	return report.value?.resources.find(
		(resource): resource is ChunkResource =>
			isChunk(resource) && resource.name === name && resource.parent === assetName
	);
}

// ------------------------------ CHUNKS ------------------------------
function isAsset(resource: Resource): resource is AssetResource {
	return resource.kind === 'asset';
}

export const assets = computed<Array<AssetResource>>(() => {
	return report.value?.resources.filter((resource): resource is AssetResource => isAsset(resource)) ?? [];
});

export function getAssetResource(name: string): AssetResource | undefined {
	return report.value?.resources.find(
		(resource): resource is AssetResource => isAsset(resource) && resource.name === name
	);
}
