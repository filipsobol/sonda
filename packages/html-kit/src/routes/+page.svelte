<div class="grid grid-cols-12 gap-4 max-w-[1200px]">
  <p class="col-span-12 text-2xl font-bold text-gray-900">Assets by type</p>

  <button
    class="flex flex-col col-span-12 rounded-xl border shadow p-6 cursor-pointer hover:bg-gray-50"
    onclick={ () => goto( '#/assets', { state: { outputType: 'all' } } ) }
  >
    <span class="text-gray-900">All</span>
    <span class="text-gray-500 text-sm">Size of all JavaScript assets</span>
    <span class="mt-4 text-3xl text-gray-800">{ sizeAll } <span class="text-gray-400">({ all.length })</span></span>
  </button>

  <button
    class="flex flex-col col-span-12 lg:col-span-6 rounded-xl border shadow p-6 hover:bg-gray-50 disabled:bg-gray-100"
    onclick={ () => goto( '#/assets', { state: { outputType: 'js' } } ) }
    disabled={ !js.length }
  >
    <p class="text-gray-900">JavaScript</p>
    <p class="text-gray-500 text-sm">Size of all JavaScript files</p>
    <p class="mt-4 text-3xl text-gray-800">{ sizeJs } <span class="text-gray-400">({ js.length })</span></p>
  </button>

  <button
    class="flex flex-col col-span-12 lg:col-span-6 rounded-xl border shadow p-6 hover:bg-gray-50 disabled:bg-gray-100"
    onclick={ () => goto( '#/assets', { state: { outputType: 'css' } } ) }
    disabled={ !css.length }
  >
    <p class="text-gray-900">CSS</p>
    <p class="text-gray-500 text-sm">Size of all CSS files</p>
    <p class="mt-4 text-3xl text-gray-800">{ sizeCss } <span class="text-gray-400">({ css.length })</span></p>
  </button>

  <button
    class="flex flex-col col-span-12 lg:col-span-6 rounded-xl border shadow p-6 hover:bg-gray-50 disabled:bg-gray-100"
    onclick={ () => goto( '#/assets', { state: { outputType: 'other' } } ) }
    disabled={ !other.length }
  >
    <p class="text-gray-900">Other assets</p>
    <p class="text-gray-500 text-sm">Size of all other assets</p>
    <p class="mt-4 text-3xl text-gray-800">{ sizeOther } <span class="text-gray-400">({ other.length })</span></p>
  </button>

  <p class="col-span-12 text-2xl font-bold mt-12 text-gray-900">Dependencies</p>

  <div class="flex flex-col col-span-12 lg:col-span-6 rounded-xl border shadow p-6 hover:bg-gray-100">
    <p class="text-gray-900">External Dependencies</p>
    <p class="text-gray-500 text-sm">Size of external dependencies</p>
    <p class="mt-4 text-3xl text-gray-800">{ sizeDependencies } <span class="text-gray-400">({ Object.keys( store.report.dependencies ).length })</span></p>
  </div>

  <div class="flex flex-col col-span-12 lg:col-span-6 rounded-xl border shadow p-6 hover:bg-gray-100">
    <p class="text-gray-900">Duplicate dependencies</p>
    <p class="text-gray-500 text-sm">Number of duplicate dependencies</p>
    <p class="mt-4 text-3xl text-gray-800">0</p>
  </div>
</div>

<script lang="ts">
import { goto } from '$app/navigation';
import { store } from '$lib/store.svelte';
import { formatSize } from '$lib/helpers/format';

const all = $derived( Object.values( store.report.outputs ) );
const js = $derived( Object.values( store.outputTypes.js ) );
const css = $derived( Object.values( store.outputTypes.css ) );
const other = $derived( Object.values( store.outputTypes.other ) );

const sizeAll = $derived( formatSize( all.reduce( ( acc, output ) => acc + output[ store.compression ], 0 ) ) );
const sizeJs = $derived( formatSize( js.reduce( ( acc, output ) => acc + output[ store.compression ], 0 ) ) );
const sizeCss = $derived( formatSize( css.reduce( ( acc, output ) => acc + output[ store.compression ], 0 ) ) );
const sizeOther = $derived( formatSize( other.reduce( ( acc, output ) => acc + output[ store.compression ], 0 ) ) );

const sizeDependencies = $derived.by( () => {
  let size = 0;

  for ( const output of all ) {
    for ( const [ name, data ] of Object.entries( output.inputs ) ) {
      if ( name.includes( 'node_modules' ) ) {
        size += data[ store.compression ];
      }
    }
  }

  return formatSize( size );
} );
</script>
