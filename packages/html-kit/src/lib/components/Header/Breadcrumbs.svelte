<nav>
  <ol class="flex flex-wrap items-center gap-1.5 break-words">
    {#each segments as [ name, href ], i }
      {#if i + 1 === segments.length}
        <li class="inline-flex gap-1.5">{ name }</li>
      {:else}
        <li class="inline-flex gap-1.5 text-gray-500 hover:text-gray-800">
          <a href={ href }>{ name }</a>
        </li>

        <li><ChevronRight size="16" class="text-gray-500" /></li>
      {/if}
    {/each}
  </ol>
</nav>

<script lang="ts">
import { page } from '$app/state';
import { ChevronRight } from 'lucide-svelte';

const segments = $derived.by( () => {
  const parts: Array<[ string, string ]> = [
    [ 'Home', '#/' ]
  ];

  const [ , route, ...path ] = page.url.hash.split( '/' );

  if ( route ) {
    parts.push( [ capitalize( route ), '#/' + route ] );
  }

  if ( path.length ) {
    parts.push( [ path.join( '#/' ), page.url.pathname ] );
  }

  return parts;
} );

function capitalize( text: string ): string {
  return text.charAt( 0 ).toUpperCase() + text.slice( 1 );
}
</script>
