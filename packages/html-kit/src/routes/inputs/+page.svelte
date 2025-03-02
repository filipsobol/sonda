<div class="flex mb-4 items-center h-12">
  <div class="grow flex gap-4">
    <p class="col-span-12 text-2xl font-bold text-gray-900">Inputs</p>
  </div>
</div>

<div class="relative overflow-x-auto">
  <table class="w-full text-sm text-left table-auto text-gray-500">
    <thead class="text-xs text-gray-700 uppercase bg-gray-50">
      <tr>
        <th class="px-6 py-3">Path</th>
        <th class="px-6 py-3">Bytes</th>
        <th class="px-6 py-3">Format</th>
        <th class="px-6 py-3">Source</th>
        <th class="px-6 py-3">Used in</th>
        <th class="px-6 py-3">Imports</th>
        <th class="px-6 py-3">Imported by</th>
      </tr>
    </thead>
    <tbody class="align-top">
      {#each mappedInputs as input}
        <tr class="bg-white border-b border-gray-200">
          <th class="px-6 py-4 font-medium text-gray-900">
            <span data-hover={ input.path }>{ input.name }</span>
          </th>
          <td class="px-6 py-4 whitespace-nowrap text-gray-900">{ input.formattedBytes }</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <Badge variant={ formatVariant[ input.format ] }>{ input.format }</Badge>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <Badge variant={ sourceVariant[ input.source ] }>{ input.source }</Badge>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <ul>
              {#each input.usedIn as path}
                <li>
                  <a
                    href={ '#/assets/' + path }
                    data-hover={ path }
                    class="text-blue-500 hover:underline underline-offset-4"
                  >
                    { path }
                  </a>
                </li>
              {/each}
            </ul>
          </td>
          <td class="px-6 py-4">
            <ul>
              {#each input.imports as path}
                <li>
                  <span data-hover={ path }>{ path }</span>
                </li>
              {/each}
            </ul>
          </td>
          <td class="px-6 py-4">
            <ul>
              {#each input.importedBy as path}
                <li>
                  <span data-hover={ path }>{ path }</span>
                </li>
              {/each}
            </ul>
          </td>
        </tr>
        {/each}
    </tbody>
  </table>
</div>

<script lang="ts">
import { store } from '$lib/store.svelte.js';
import { formatSize } from '$lib/helpers/format';
import Badge from '$lib/components/Badge.svelte';

const modules = 'node_modules';

const mappedInputs = Object
  .entries( store.report.inputs )
  .map( ( [ path, input ] ) => ({
    path,
    ...input,
    name: removeNodeModulesPath( path ),
    formattedBytes: formatSize( input.bytes ),
    usedIn: getUsedIn( path ),
    imports: input.imports.map( removeNodeModulesPath ),
    importedBy: getImportedBy( path ),
    source: path.includes( modules ) ? 'external' : 'internal'
  }) )
  .toSorted( ( a, b ) => a.path.localeCompare( b.path ) );

const sourceVariant: Record<any, any> = {
  internal: 'dark',
  external: 'default'
};

const formatVariant: Record<any, any> = {
  esm: 'yellow',
  cjs: 'default',
  unknown: 'dark'
};

function removeNodeModulesPath( path: string ): string {
  const index = path.lastIndexOf( modules );

  return index !== -1
    ? path.slice( index + modules.length + 1 )
    : path;
}

function getUsedIn( path: string ): Array<string> {
  return Object.entries( store.report.outputs )
    .filter( ( [ , output ] ) => output.inputs[ path ] )
    .map( ( [ path ] ) => path );
}

function getImportedBy( path: string ): Array<string> {
  return Object.entries( store.report.inputs )
    .filter( ( [ , input ] ) => input.imports.includes( path ) )
    .map( ( [ path ] ) => removeNodeModulesPath( path ) );  
}
</script>
