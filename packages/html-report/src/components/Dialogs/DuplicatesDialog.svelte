<Dialog heading="Duplicated modules found in the build" >
	{#snippet children()}
		{#if duplicates.size > 0}
			<p>The following dependencies are duplicated:</p>
			<pre class="mt-2 p-4 w-max leading-5 bg-slate-100 rounded-sm overflow-auto min-w-full"><code>{ tree }</code></pre>
		{/if}
	{/snippet}
</Dialog>

<script lang="ts">
import Dialog from './Dialog.svelte';
import { duplicates } from '../../stores/index.svelte.js';
import { AsciiTree } from '../../AsciiTree';

const tree = $derived(
	AsciiTree.generate(
		Array.from( duplicates.keys() ),
		key => duplicates.get( key )
	)
);
</script>
