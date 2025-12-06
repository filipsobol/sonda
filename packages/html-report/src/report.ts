import { markRaw } from 'vue';
import type { AssetResource, ChunkResource, JsonReport, FilesystemResource, SourcemapResource, Resource } from 'sonda';

declare global {
	const SONDA_REPORT_DATA: string;

	interface Window {
		SONDA_DECOMPRESSED_DATA: JsonReport;
	}
}

export async function decompressData(): Promise<any> {
	// Decode base64 string
	const data = await fetch('data:application/octet-stream;base64,' + SONDA_REPORT_DATA);
	const arrayBuffer = await data.arrayBuffer();

	// Decompress data
	const decompressor = new DecompressionStream('gzip');
	const stream = new Response(arrayBuffer).body!.pipeThrough(decompressor);
	const buffer = await new Response(stream).arrayBuffer();

	// Decode the data and parse JSON.
	return JSON.parse(new TextDecoder().decode(buffer));
}

window.SONDA_DECOMPRESSED_DATA = markRaw(await decompressData());

export const report: JsonReport = window.SONDA_DECOMPRESSED_DATA;

// ------------------------------ SOURCES ------------------------------
function isSource(resource: Resource): resource is FilesystemResource | SourcemapResource {
	return resource.kind === 'filesystem' || resource.kind === 'sourcemap';
}

export function getSources(): Array<FilesystemResource | SourcemapResource> {
	return report.resources.filter((resource): resource is FilesystemResource | SourcemapResource => isSource(resource));
}

export function getSourceResource(name: string): FilesystemResource | SourcemapResource | undefined {
	return report.resources.find(
		(resource): resource is FilesystemResource | SourcemapResource => isSource(resource) && resource.name === name
	);
}

// ------------------------------ CHUNKS ------------------------------
function isChunk(resource: Resource): resource is ChunkResource {
	return resource.kind === 'chunk';
}

export function getChunks(assetName: string): Array<ChunkResource> {
	return report.resources.filter(
		(resource): resource is ChunkResource => isChunk(resource) && resource.parent === assetName
	);
}

export function getChunkResource(name: string, assetName: string): ChunkResource | undefined {
	return report.resources.find(
		(resource): resource is ChunkResource =>
			isChunk(resource) && resource.name === name && resource.parent === assetName
	);
}

// ------------------------------ CHUNKS ------------------------------
function isAsset(resource: Resource): resource is AssetResource {
	return resource.kind === 'asset';
}

export function getAssets(): Array<AssetResource> {
	return report.resources.filter((resource): resource is AssetResource => isAsset(resource));
}

export function getAssetResource(name: string): AssetResource | undefined {
	return report.resources.find((resource): resource is AssetResource => isAsset(resource) && resource.name === name);
}
