import { markRaw } from 'vue';
import type { JsonReport } from 'sonda';

declare global {
  interface Window {
    SONDA_REPORT_DATA: string;
    SONDA_DECOMPRESSED_DATA: JsonReport;
  }
}

export async function decompressData(): Promise<any> {
  // Decode base64 string
  const data = await fetch( 'data:application/octet-stream;base64,' + window.SONDA_REPORT_DATA );
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
