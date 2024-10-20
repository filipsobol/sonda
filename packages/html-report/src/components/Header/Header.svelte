<div class="flex flex-row p-4 items-center space-y-0 h-16 justify-between bg-gray-50 shadow">
	<div class="flex flex-row space-x-2">
		<Output />
		<Details />
		<Duplicates />
	</div>
	
	<div class="flex flex-row space-x-2">
		<Compression />
		<Repository />
	</div>
</div>

<script lang="ts">
import Compression from './Compression.svelte';
import Details from './Details.svelte';
import Duplicates from './Duplicates.svelte';
import Output from './Output.svelte';
import Repository from './Repository.svelte';
</script>
