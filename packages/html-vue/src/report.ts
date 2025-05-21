import { markRaw } from 'vue';
import type { AssetResource, ChunkResource, JsonReport, SourceResource } from 'sonda';

declare global {
  const SONDA_REPORT_DATA: string;

  interface Window {
    SONDA_DECOMPRESSED_DATA: JsonReport;
  }
}

export async function decompressData(): Promise<any> {
  // Decode base64 string
  const data = await fetch( 'data:application/octet-stream;base64,' + SONDA_REPORT_DATA );
  const arrayBuffer = await ( data ).arrayBuffer();

  // Decompress data
  const decompressor = new DecompressionStream( 'gzip' );
  const stream = new Response( arrayBuffer ).body!.pipeThrough( decompressor );
  const buffer = await new Response( stream ).arrayBuffer();

  // Decode the data and parse JSON.
  return JSON.parse( new TextDecoder().decode( buffer ) );
}

window.SONDA_DECOMPRESSED_DATA = markRaw( await decompressData() );

export const report: JsonReport = window.SONDA_DECOMPRESSED_DATA;

export function getSourceResource( name: string ): SourceResource | undefined {
  return report.resources.find( ( resource ) : resource is SourceResource => resource.kind === 'source' && resource.name === name );
}

export function getChunkResource( name: string, assetName: string ): ChunkResource | undefined {
  return report.resources.find( ( resource ): resource is ChunkResource => resource.kind === 'chunk' && resource.name === name && resource.parent === assetName );
}

export function getAssetResource( name: string ): AssetResource | undefined {
  return report.resources.find( ( resource ): resource is AssetResource => resource.kind === 'asset' && resource.name === name );
}
