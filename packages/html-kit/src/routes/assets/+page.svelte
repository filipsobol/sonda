<div class="flex mb-4 items-center h-12">
  <div class="grow flex gap-4">
    <p class="col-span-12 text-2xl font-bold text-gray-900">Build overview</p>
  </div>

  <div class="flex gap-4">
    <Tabs values={ assetType.options } bind:current={ assetType.value } />
    <Tabs values={ store.compressions } bind:current={ store.compression } />
  </div>
</div>

<div
	role="application"
	bind:clientWidth={ width }
	bind:clientHeight={ height }
	class="overflow-hidden w-full h-full"
  { onclick }
>
  <Treemap
    content={ trie }
    { width }
    { height }
  />
</div>

<script module lang="ts">
declare global {
	namespace App {
		interface PageState {
      outputType?: OutputType;
			triePath?: string;
		}
	}
}
</script>

<script lang="ts">
import { page } from '$app/state';
import { goto, pushState } from '$app/navigation';
import Treemap from '$lib/components/Treemap/Treemap.svelte';
import Tabs from '$lib/components/Tabs.svelte';
import { store, type OutputType } from '$lib/store.svelte.js';
import { getBuildTrie } from '$lib/helpers/FileSystemTrie';
import type { Tab } from '$lib/types';

const assetType = {
  options: [
    { value: 'all',     label: 'All',       active: true },
    { value: 'script',  label: 'Script',    active: !!Object.keys( store.outputTypes.script ).length },
    { value: 'style',   label: 'Style',     active: !!Object.keys( store.outputTypes.style ).length },
    { value: 'other',   label: 'Other',     active: !!Object.keys( store.outputTypes.other ).length },
  ] satisfies Array<Tab<OutputType>>,

  get value() {
    return activeType;
  },
  set value( v: OutputType ) {
    pushState( page.url.hash, { outputType: v } );
  }
};

let width = $state<number>( 0 );
let height = $state<number>( 0 );

const triePath = $derived( page.state.triePath || '' );
const activeType = $derived( page.state.outputType || assetType.options[ 0 ].value );
const trie = $derived( getBuildTrie( store.outputTypes[ activeType ] ).get( triePath ) );

function onclick( { target }: Event ) {
	const path = target instanceof Element && target.getAttribute( 'data-tile' );

	if ( !path ) {
		return;
	}

  isFile( path )
    ? goto( '#/assets/' + path )
    : pushState( page.url.hash, { ...page.state, triePath: path } );
}

function isFile( path: string ) {
  return path.split( '/' ).pop()!.includes( '.' );
}
</script>
