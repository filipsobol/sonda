<button
	title="Show details of the active output"
	aria-label="Details of the entire build output"
	class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-1 focus:ring-blue-300 rounded-lg text-sm px-5 h-10"
	{ onclick }
>
	<FileSearch size={ 20 } />
</button>

<script lang="ts">
import { FileSearch } from 'lucide-svelte';

function onclick() {
	// TODO: Open dialog
	// dialog.open( 'output', activeOutput.output! )
}
</script>
