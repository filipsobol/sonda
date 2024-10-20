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
	class="fixed z-10 px-2 py-1 bg-gray-800 text-gray-100 rounded-md whitespace-nowrap pointer-events-none"
	class:invisible={ !content }
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
let content = $state<string>( '' );
let x = $state<string>( '0px' );
let y = $state<string>( '0px' );

function onMouseMove( { target, clientX, clientY }: MouseEvent ) {
	content = target instanceof Element && target.getAttribute( 'data-hover' ) || '';

	if ( !content ) return;

	x = ( clientX + width + margin > bodyWidth ? clientX - width - margin : clientX + margin ) + 'px';
	y = ( clientY + height + margin > bodyHeight ? clientY - height : clientY + margin ) + 'px';
}
</script>

<style>
div[role="tooltip"] {
	transform: translate( var(--x), var(--y) );
	will-change: transform, contents;
}
</style>
