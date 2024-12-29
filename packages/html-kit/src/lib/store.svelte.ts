import type { JsonReport, Sizes } from 'sonda';
import { getTrie, type FileSystemTrie } from './helpers/FileSystemTrie';

export type CompressionType = keyof Sizes;

interface Store {
  report: JsonReport;
  trie: Record<string, FileSystemTrie>;
  compression: CompressionType;
}

function Store(): Store {
  let compression = $state<CompressionType>( 'uncompressed' );

  const report: JsonReport = JSON.parse( decodeURIComponent( import.meta.env.VITE_SONDA_REPORT_DATA ) );
  const trie = getTrie( report );

  return {
    get report() { return report },

    get trie() { return trie },

    get compression() { return compression },
    set compression( newCompression: CompressionType ) { compression = newCompression },
  }
}

export const store = Store();
