<div class="flex min-h-svh w-full font-mono">
	<Sidebar class={ collapsed ? 'w-0' : 'w-[300px]' } />

	<div class="relative flex min-h-svh flex-1 flex-col { !collapsed && 'w-[calc(100%-300px)]' }">
		<Header bind:collapsed={ collapsed } />

		<main class="w-full h-full flex flex-col">
			{@render children()}
		</main>
	</div>

	<Tooltip />
</div>

<script lang="ts">
import Sidebar from '$lib/Sidebar/Sidebar.svelte';
import Header from '$lib/Header/Header.svelte';
import Tooltip from '$lib/Tooltip.svelte';
import '../app.css';

let { children } = $props();

let collapsed = $state( false );
</script>
