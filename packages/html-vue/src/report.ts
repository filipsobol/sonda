import { markRaw } from 'vue';
import type { JsonReport } from 'sonda';

declare global {
	const SONDA_REPORT_DATA: string;
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

export const report: JsonReport = markRaw( await decompressData() );
