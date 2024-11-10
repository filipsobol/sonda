<Dialog
  heading={ file.path }
  large={ true }
>
  {#snippet  children()}
    <div class="h-full flex flex-col overflow-auto p-1">
      {#if !supportsHighlight}
        <div class="p-4 mb-8 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
          <p class="font-bold">Your browser does not support the <a class="underline" href="https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API">CSS Custom Highlight API</a>.</p>

          <p class="mt-4">
            To use this feature, please update your browser to a version that supports it, or use a different browser. See the
            <a class="underline" href="https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API#browser_compatibility">Browser Compatibility page</a> for more information.
          </p>
        </div>
			{:else if sourceCode}
      	<p>Code that ended up in the bundle is highlighted</p>

				<pre class="h-full mt-2 p-4 w-full leading-5 bg-slate-100 text-slate-600 rounded overflow-auto text-xs flex">
					<div class="line-numbers flex flex-col flex-shrink mr-2 select-none text-slate-400">
						{#each sourceCodeLines as _, index}
							<span class="border-r border-slate-300 text-right pr-2">{ index }</span>
						{/each}
					</div>
					<code bind:this={ codeElement }>{ sourceCode }</code>
				</pre>
			{/if}
    </div>
  {/snippet}
</Dialog>

<script lang="ts">
import Dialog from './Dialog.svelte';
import type { File } from '../../FileSystemTrie';
import { activeOutput } from '../../stores/index.svelte';

interface Props {
	file: File;
}

let { file }: Props = $props();

let codeElement = $state<HTMLElement>();

const sourceMap = $derived( activeOutput.output!.root.map );
const sourceIndex = $derived( sourceMap?.sources.indexOf( file.path ) ?? -1 );
const sourceCode = $derived( sourceIndex >= 0 ? sourceMap!.sourcesContent![ sourceIndex ] : null );
const sourceCodeLines = $derived( sourceCode?.split( /(?<=\r?\n)/ ) ?? [] );
const supportsHighlight = $derived( 'CSS' in window && 'highlights' in window.CSS );

$effect( () => {
  if ( !sourceCode || !supportsHighlight ) {
    return;
  }

	const highlight = new Highlight();
	const sourceCodeNode = codeElement!.firstChild!;

	const lineStartOffsets = sourceCodeLines.reduce( ( offsets, line ) => {
		offsets.push( offsets[ offsets.length - 1 ] + line.length );
		return offsets;
	}, [ 0 ] as Array<number>);

	sourceMap!.mappings
		.flat()
		.filter( segment => segment[1] === sourceIndex )
		.forEach( ( segment, index, segments ) => {
			const [ , , line, column ] = segment as [ number, number, number, number ];
			const nextSegment = segments[ index + 1 ];
			const lineOffset = lineStartOffsets[ line ];
			const start = lineOffset + column;
			const end = line === nextSegment?.[2]
				? nextSegment[3]! + lineOffset
				: lineStartOffsets[ line + 1 ];

			const range = new Range();
			range.setStart( sourceCodeNode, start );
			range.setEnd( sourceCodeNode, end );
			// @ts-ignore
			highlight.add( range );
		} );

	// @ts-ignore
	CSS.highlights.set('used-code', highlight);
} );
</script>

<style>
::highlight(used-code) {
	background-color: theme( 'colors.orange.200' );
	color: theme( 'colors.orange.900' );
}
</style>
