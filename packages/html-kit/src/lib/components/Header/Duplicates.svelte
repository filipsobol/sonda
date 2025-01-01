{#if hasDuplicates}
	<button
		title="See duplicated modules found in the build"
		aria-label="List of duplicated modules found in the build output"
		class="text-gray-900 bg-red-50 border border-red-400 focus:outline-none hover:bg-red-100 focus:ring-1 focus:ring-blue-300 rounded-lg text-sm px-5 h-10"
		{ onclick }
	>
		<TriangleAlert />
	</button>
{/if}

<script lang="ts">
import { TriangleAlert } from 'lucide-svelte';
import { store } from '$lib/store.svelte.js';

const hasDuplicates = ( store.report.issues.duplicateDependencies?.length || 0 ) > 0;

function onclick() {
	// TODO: Open modal
	// dialog.open( 'duplicates', true );
}
</script>
