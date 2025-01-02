<p>Assets summary</p>

<div
	role="application"
	bind:clientWidth={ width }
	bind:clientHeight={ height }
	class="flex-grow overflow-hidden w-full h-full"
>
  <Treemap
    content={ trie.root }
    { width }
    { height }
  />
</div>

<script lang="ts">
import Treemap from '$lib/components/Treemap/Treemap.svelte';
import { FileSystemTrie } from '$lib/helpers/FileSystemTrie';
import { store } from '$lib/store.svelte.js';

let width = $state<number>( 0 );
let height = $state<number>( 0 );

const trie = new FileSystemTrie();

trie.root.name = '';
trie.root.uncompressed = 0;
trie.root.gzip = 0;
trie.root.brotli = 0;

for ( const [ path, data ] of Object.entries( store.report.outputs ) ) {
  trie.insert( path, data );

  trie.root.uncompressed += data.uncompressed;
  trie.root.gzip += data.gzip;
  trie.root.brotli += data.brotli;
}

trie.optimize();
</script>
