<div class="inline-flex h-12 items-center justify-center gap-1 rounded-lg bg-gray-100 p-2 text-gray-600">
  {#each values as { value, label, active }}
    <button
      class={ [
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1',
        // Value is selected
        value === current
          ? 'bg-gray-700 shadow text-gray-100'
          // Value is available
          : active === false
          ? 'cursor-not-allowed text-gray-400'
          // Value is available, but not selected
          : 'hover:bg-gray-200',
      ] }
      onclick={() => { if ( active !== false ) current = value } }
    >
      { label }
    </button>
  {/each}
</div>

<script lang="ts">
import type { Tab } from '$lib/types';

interface Props {
  values: Array<Tab>;
  current: string;
}

let { values, current = $bindable() }: Props = $props();
</script>
