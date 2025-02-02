<!-- Re-render the entire SVG when path, width, or height change -->
{#key [ content.path, width, height ]}
	<svg
		{ width }
		{ height }
		xmlns="http://www.w3.org/2000/svg"
		role="img"
	>
		<!-- Substract 1 and start at 0.5 to prevent stroke clipping at viewport edges -->
		<Level
			{ content }
			totalBytes={ content[ store.compression ] }
			width={ width - 1 }
			height={ height - 1 }
			xStart={ 0.5 }
			yStart={ 0.5 }
		/>
	</svg>
{/key}

<script lang="ts">
import Level from './Level.svelte';
import { store } from '$lib/store.svelte.js';
import type { Folder } from '$lib/helpers/FileSystemTrie';

interface Props {
	width: number;
	height: number;
	content: Folder;
}

let {
	width,
	height,
	content
}: Props = $props();
</script>
