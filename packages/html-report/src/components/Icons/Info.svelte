<svg
	xmlns="http://www.w3.org/2000/svg"
	width="24"
	height="24"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	{ ...props }
>
	<path d="M0 0h24v24H0z" stroke="none"/>
	<path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 9h.01"/>
	<path d="M11 12h1v4h1"/>
</svg>

<script lang="ts">
import type { SVGAttributes } from 'svelte/elements';

let props: SVGAttributes<SVGSVGElement> = $props();
</script>
