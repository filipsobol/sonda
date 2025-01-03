<div class="flex mb-4 items-center">
  <div class="flex-grow flex gap-4">
    <p class="col-span-12 text-2xl font-bold text-gray-900">Build overview</p>
  </div>

  <div class="flex gap-4">
    <Tabs values={ colors } bind:active={ activeColor } />
    <Tabs
      values={ types }
      bind:active={
        () => page.state.outputType ??= types[ 0 ][ 0 ],
        v => pushState( page.url.hash, { outputType: v } )
      }
    />
    <Tabs values={ store.compressions } bind:active={ store.compression } />
  </div>
</div>

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
import { page } from '$app/state';
import { pushState } from '$app/navigation';
import Treemap from '$lib/components/Treemap/Treemap.svelte';
import Tabs from '$lib/components/Tabs/Tabs.svelte';
import { store, type OutputType } from '$lib/store.svelte.js';
import { getBuildTrie } from '$lib/helpers/FileSystemTrie';

const colors: Array<[ string, string ]> = [
	[ 'size', 'Size' ],
	[ 'difference', 'Difference' ],
	[ 'duplicate', 'Duplicate' ],
];

const types: Array<[ OutputType, string ]> = [
  [ 'all', 'All' ],
	[ 'js', 'JavaScript' ],
	[ 'css', 'CSS' ],
	[ 'other', 'Other' ],
];

let width = $state<number>( 0 );
let height = $state<number>( 0 );
let activeColor = $state( colors[ 0 ][ 0 ] );

const trie = $derived( getBuildTrie( store.outputTypes[ page.state.outputType! ] ) );
</script>
