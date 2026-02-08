<template>
	<template v-if="sourceCode">
		<h4 class="mt-16 mb-4 text-lg font-bold text-gray-700">Code</h4>

		<Alert
			v-if="!supportsHighlight"
			variant="warning"
		>
			<template #header>
				<p>
					Your browser does not support the
					<a
						class="underline"
						href="https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API"
						target="_blank"
						>CSS Custom Highlight API</a
					>
				</p>
			</template>

			<template #body>
				<p>
					The code highlighting feature is disabled. Please update your browser to a version that supports CSS Custom
					Highlight API, or use a different browser. See the
					<a
						class="underline"
						href="https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API#browser_compatibility"
						target="_blank"
						>Browser Compatibility page</a
					>
					for more information.
				</p>
			</template>
		</Alert>

		<div
			v-bind="containerProps"
			class="flex max-h-[calc(100svh-12rem)] overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-gray-700 shadow-xs"
		>
			<div
				v-bind="wrapperProps"
				class="flex w-full"
				:style="{ lineHeight: LINE_HEIGHT + 'px' }"
			>
				<!-- Line numbers -->
				<div class="mr-2 shrink-0 border-r border-gray-200 pr-2 text-right text-gray-400 select-none">
					<div :style="{ width: gutterCh + 'ch' }">
						<p
							v-for="{ index } in vList"
							:key="index"
							class="w-full"
						>
							{{ index + 1 }}
						</p>
					</div>
				</div>

				<!-- Code -->
				<div class="min-w-0">
					<div
						class="whitespace-pre"
						ref="codeRoot"
					>
						<span
							v-for="{ index, data } in vList"
							:key="index"
							:data-abs-line="index"
							class="code-line"
						>
							{{ data }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</template>
</template>

<script setup lang="ts">
import { computed, watch, useTemplateRef } from 'vue';
import { useVirtualList } from '@vueuse/core';
import Alert from '@/components/common/Alert.vue';
import { getAssetResource, report } from '@/report.js';
import type { ChunkResource, DecodedReportSourceMap } from 'sonda';

interface Props {
	name: string;
}

const LINE_HEIGHT = 21;

const props = defineProps<Props>();
const codeRoot = useTemplateRef('codeRoot');

const asset = computed(() => {
	const parent = report.value!.resources.find(
		(resource): resource is ChunkResource => resource.kind === 'chunk' && resource.name === props.name
	)?.parent;

	return parent ? getAssetResource(parent) : null;
});

// Code highlighting
const supportsHighlight = 'CSS' in window && 'highlights' in window.CSS;
const sourceMap = computed<DecodedReportSourceMap | null>(() => {
	const encodedSourceMap = report.value!.sourcemaps.find(sm => sm.name === asset.value?.name);
	return encodedSourceMap ? JSON.parse(encodedSourceMap.map) : null;
});
const sourceIndex = computed(() => sourceMap.value?.sources.indexOf(props.name) ?? -1);
const sourceCode = computed(() =>
	sourceIndex.value > -1 ? sourceMap.value!.sourcesContent![sourceIndex.value] : null
);
const sourceCodeLines = computed(() => sourceCode.value?.split(/(?<=\r?\n)/) ?? []);
const gutterCh = computed(() => String(sourceCodeLines.value.length).length);

// Virtual list
const {
	list: vList,
	containerProps,
	wrapperProps
} = useVirtualList(sourceCodeLines, {
	itemHeight: LINE_HEIGHT,
	overscan: 10
});

const lineRanges = computed(() => {
	if (!supportsHighlight || !sourceCode.value || !sourceMap.value || sourceIndex.value < 0) {
		return [];
	}

	const lines = sourceCodeLines.value;
	const rangesByLine: Array<Array<[number, number]>> = Array(lines.length);

	const segments = sourceMap.value.mappings
		.flat()
		.filter(segment => segment[1] === sourceIndex.value)
		.map(segment => {
			const [, , line, column] = segment as [number, number, number, number];
			return { line, column };
		})
		.sort((a, b) => a.line - b.line || a.column - b.column);

	for (let i = 0; i < segments.length; i++) {
		const { line, column } = segments[i];
		const next = segments[i + 1];
		const end = next?.line === line ? next.column : (lines[line]?.length ?? 0);

		if (end <= column) {
			continue;
		}

		const arr = (rangesByLine[line] ||= []);
		const last = arr.at(-1);

		if (last && column <= last[1]) {
			last[1] = Math.max(last[1], end);
		} else {
			arr.push([column, end]);
		}
	}

	return rangesByLine;
});

watch(
	[vList],
	() => {
		if (!supportsHighlight || !codeRoot.value) {
			return;
		}

		const highlight = new Highlight();
		const nodes = codeRoot.value.querySelectorAll<HTMLSpanElement>('span.code-line');

		for (const element of nodes) {
			const line = Number(element.dataset.absLine);
			const ranges = lineRanges.value[line];
			const text = element.firstChild as Text | null;

			if (!ranges || !text) {
				continue;
			}

			const len = text.textContent?.length ?? 0;

			for (const [s0, e0] of ranges) {
				const start = Math.max(0, Math.min(len, s0));
				const end = Math.max(start, Math.min(len, e0));

				if (end <= start) {
					continue;
				}

				const range = new Range();
				range.setStart(text, start);
				range.setEnd(text, end);
				highlight.add(range);
			}
		}

		CSS.highlights.set('used-code', highlight);
	},
	{ flush: 'post' }
);
</script>

<style>
::highlight(used-code) {
	background-color: var(--color-orange-200);
	color: var(--color-orange-900);
}
</style>
