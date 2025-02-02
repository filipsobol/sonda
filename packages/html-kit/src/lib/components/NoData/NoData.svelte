<div class="grow flex flex-col mt-24 items-center w-full h-full">
	<Meh
		size={ 96 }
		class="text-yellow-400 fill-yellow-100"
	/>

	<h2 class="mt-8 text-3xl font-bold text-gray-800">No data to display</h2>
	<p class="mt-4 text-lg text-gray-500">Did you enable source maps in the bundler configuration?</p>
</div>

<script lang="ts">
import { Meh } from 'lucide-svelte';
</script>
