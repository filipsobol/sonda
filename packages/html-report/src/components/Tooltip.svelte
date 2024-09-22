<svelte:body
	bind:clientWidth={ bodyWidth }
	bind:clientHeight={ bodyHeight }
	onmouseover={ onMouseMove }
	onmousemove={ onMouseMove }
	onmouseleave={ () => content = '' }
/>

<div
	bind:clientWidth={ width }
	bind:clientHeight={ height }
	role="tooltip"
	class="fixed z-10 px-2 py-1 bg-gray-800 text-gray-100 rounded-md whitespace-nowrap pointer-events-none font-mono will-change-transform"
	class:invisible={ !content }
	style="transform: translate( var(--x), var(--y) )"
	style:--x={ x }
	style:--y={ y }
>
	{ content }
</div>

<script lang="ts">
const margin = 12;

let width = $state<number>( 0 );
let height = $state<number>( 0 );
let bodyWidth = $state<number>( 0 );
let bodyHeight = $state<number>( 0 );
let mouseX = $state<number>( 0 );
let mouseY = $state<number>( 0 );
let content = $state<string>( '' );
let x = $state<string>( '0px' );
let y = $state<string>( '0px' );

$effect(() => {
	if ( !content ) return;

	// Update tooltip position in one batch
	x = ( mouseX + width + margin > bodyWidth ? mouseX - width - margin : mouseX + margin ) + 'px';
	y = ( mouseY + height + margin > bodyHeight ? mouseY - height : mouseY + margin ) + 'px';
});

function onMouseMove( { target, clientX, clientY }: MouseEvent ) {
	content = target instanceof Element && target.getAttribute( 'data-hover' ) || '';
	mouseX = clientX;
	mouseY = clientY;
}
</script>
