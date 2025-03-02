<div class="flex mb-4 items-center h-12">
  <div class="grow flex gap-4">
    <p class="col-span-12 text-2xl font-bold text-gray-900">Warnings</p>
  </div>
</div>

{#if groupedIssues['duplicate-dependency']}
  <p class="col-span-12 text-xl font-bold text-gray-900 mb-2">Duplicated dependencies</p>

  <div class="relative overflow-x-auto">
    <table class="w-full text-sm text-left table-auto text-gray-500">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50">
        <tr>
          <th class="px-6 py-3">Name</th>
          <th class="px-6 py-3">Paths</th>
          <th class="px-6 py-3">Used in</th>
        </tr>
      </thead>
      <tbody class="align-top">
        {#each groupedIssues['duplicate-dependency'] as dependency}
          <tr class="bg-white border-b border-gray-200">
            <th class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{ dependency.name }</th>
            <td class="px-6 py-4">
              <ul>
                {#each store.report.dependencies[ dependency.name ] as path}
                  <li>{ path }</li>
                {/each}
              </ul>
            </td>
            <td class="px-6 py-4 text-gray-900 whitespace-nowrap">
              <ul>
                {#each getUsedIn( dependency.name ) as path}
                  <li>
                    <a
                      href={ '#/assets/' + path }
                      class="text-blue-500 hover:underline underline-offset-4"
                    >
                      { path }
                    </a>
                  </li>
                {/each}
              </ul>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<script lang="ts">
import { store } from '$lib/store.svelte.js';

const groupedIssues = store.report.issues.reduce( ( acc, issue ) => {
  acc[ issue.type ] ||= [];
  acc[ issue.type ].push( issue.data );
  return acc;
}, {} as Record<string, any> );

function getUsedIn( dependencyName: string ) {
  return Object.entries( store.report.outputs )
    .filter( ( [ , output ] ) => {
      return Object.keys( output.inputs ).some( input => input.includes( dependencyName ) )
    } )
    .map( ( [ name ] ) => name );
}
</script>
