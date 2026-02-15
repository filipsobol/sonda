<template>
	<div
		ref="viewport"
		class="relative size-full overflow-hidden"
		:class="[isDragging ? 'cursor-grabbing' : 'cursor-grab', isDragging && hasDragged && '[&_svg]:pointer-events-none']"
		@mousedown="onMouseDown"
		@click.capture="onClickCapture"
		@wheel.prevent="onWheel"
	>
		<div
			v-if="activeNodeData"
			class="max-w-420px absolute top-3 left-3 z-1 cursor-default rounded-[10px] border border-gray-200 bg-white p-4 shadow-xs"
			@mousedown.stop
			@click.stop
		>
			<p class="text-sm text-gray-500">Selected node</p>
			<p
				:title="activeNodeData.id"
				class="mt-2 truncate text-sm font-semibold"
			>
				{{ activeNodeData.displayName }}
			</p>
			<p class="mt-1 text-sm">Kind: {{ activeNodeData.kind }}</p>
			<a
				:href="activeNodeData.url"
				class="mt-4 inline-flex rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-800 hover:bg-gray-50"
			>
				Open details
			</a>
		</div>

		<div
			v-if="isControlsPanelOpen"
			class="max-w-360px absolute right-3 bottom-14 z-20 cursor-default rounded-[10px] border border-gray-200 bg-white p-4 shadow-xs"
			@mousedown.stop
			@click.stop
		>
			<p class="text-sm text-gray-500">Controls</p>

			<ul class="mt-2 space-y-1 text-sm text-gray-700">
				<li><span class="font-semibold">Drag with left mouse button</span>: pan graph</li>
				<li><span class="font-semibold">Mouse wheel</span>: pan graph</li>
				<li><span class="font-semibold">Ctrl + mouse wheel</span>: zoom in/out at cursor</li>
				<li><span class="font-semibold">+ and - buttons</span>: zoom in/out</li>
				<li><span class="font-semibold">Reset button</span>: set zoom back to 1x</li>
				<li><span class="font-semibold">Click node</span>: select/deselect node details</li>
			</ul>
		</div>

		<div
			class="absolute right-3 bottom-3 z-20 flex gap-1.5"
			@mousedown.stop
			@click.stop
		>
			<BaseButton
				:active="isControlsPanelOpen"
				:aria-label="isControlsPanelOpen ? 'Hide controls' : 'Show controls'"
				class="p-4"
				@click="toggleControlsPanel"
			>
				<IconCircleQuestionMark class="h-5 w-5" />
			</BaseButton>
			<BaseButton
				aria-label="Reset zoom"
				class="p-4"
				@click="resetZoom"
			>
				<IconReset class="h-5 w-5" />
			</BaseButton>
			<BaseButton
				aria-label="Zoom out"
				class="p-4"
				@click="zoomBy(-ZOOM_BUTTON_STEP)"
			>
				<IconZoomOut class="h-5 w-5" />
			</BaseButton>
			<BaseButton
				aria-label="Zoom in"
				class="p-4"
				@click="zoomBy(ZOOM_BUTTON_STEP)"
			>
				<IconZoomIn class="h-5 w-5" />
			</BaseButton>
		</div>

		<svg
			ref="canvas"
			:width="layout.width"
			:height="layout.height"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			class="block select-none"
		>
			<defs>
				<marker
					id="arrow-head"
					viewBox="0 0 10 10"
					refX="9"
					refY="5"
					markerWidth="5"
					markerHeight="5"
					orient="auto-start-reverse"
				>
					<path
						d="M 0 0 L 10 5 L 0 10 z"
						fill="context-stroke"
					/>
				</marker>
				<marker
					id="arrow-head-active"
					viewBox="0 0 10 10"
					refX="9"
					refY="5"
					markerWidth="5"
					markerHeight="5"
					orient="auto-start-reverse"
				>
					<path
						d="M 0 0 L 10 5 L 0 10 z"
						transform="rotate(-10 5 5)"
						fill="context-stroke"
					/>
				</marker>
			</defs>

			<g>
				<path
					v-if="renderedEdges.paths.idle"
					:d="renderedEdges.paths.idle"
					data-state="idle"
					fill="none"
					marker-end="url(#arrow-head)"
					:class="EDGE_CLASS"
				/>
				<path
					v-if="renderedEdges.paths.dimmed"
					:d="renderedEdges.paths.dimmed"
					data-state="dimmed"
					fill="none"
					marker-end="url(#arrow-head)"
					:class="EDGE_CLASS"
				/>
				<path
					v-if="renderedEdges.paths.connected"
					:d="renderedEdges.paths.connected"
					data-state="connected"
					fill="none"
					marker-end="url(#arrow-head)"
					:class="EDGE_CLASS"
				/>
				<path
					v-for="edge in renderedEdges.active"
					:key="edge.key"
					:d="edge.path"
					data-state="active"
					fill="none"
					marker-end="url(#arrow-head-active)"
					:class="EDGE_CLASS"
				/>
			</g>

			<g>
				<a
					v-for="node in renderedNodes"
					:key="node.id"
					:xlink:href="node.url"
					:data-state="node.state"
					class="[&[data-state=active]_.node]:fill-orange-100 [&[data-state=active]_.node]:stroke-orange-500 [&[data-state=active]_.node-label]:fill-orange-800 [&[data-state=connected]_.node]:fill-orange-100 [&[data-state=connected]_.node]:stroke-orange-500 [&[data-state=matched]_.node]:fill-amber-100 [&[data-state=matched]_.node]:stroke-amber-500 [&[data-state=matched]_.node-label]:fill-amber-700"
					@click.prevent="onNodeClick(node.id)"
				>
					<rect
						:x="node.x"
						:y="node.y"
						:width="node.width"
						:height="node.height"
						:rx="8"
						:ry="8"
						:data-hover="node.id"
						class="node fill-white stroke-gray-400 stroke-1"
					/>

					<text
						:x="node.x + node.width / 2"
						:y="node.y + node.height / 2"
						text-anchor="middle"
						dominant-baseline="middle"
						class="node-label pointer-events-none fill-gray-700 text-[12px] select-none"
					>
						{{ node.label }}
					</text>
				</a>
			</g>
		</svg>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { formatPath } from '@/format.js';
import { router } from '@/router.js';
import BaseButton from '../common/Button.vue';
import IconCircleQuestionMark from '../icon/CircleQuestionMark.vue';
import IconReset from '../icon/Reset.vue';
import IconZoomIn from '../icon/ZoomIn.vue';
import IconZoomOut from '../icon/ZoomOut.vue';
import type { DagCamera, DagLayout, DagLayoutEdge, DagLayoutNode } from '@/dag.js';
import type { ResourceKind } from 'sonda';

type VisualState = 'idle' | 'active' | 'connected' | 'dimmed' | 'matched';
type EdgeVisualState = Exclude<VisualState, 'matched'>;

interface Props {
	layout: DagLayout;
	resourceKinds: Record<string, Exclude<ResourceKind, 'chunk'> | undefined>;
	activeNode?: string;
	initialCamera?: DagCamera | null;
	focusNode?: string;
	focusToken?: string;
	matchedNodes?: Array<string>;
}

interface RenderedActiveEdge {
	key: string;
	path: string;
}

interface RenderedNode extends DagLayoutNode {
	url: string;
	label: string;
	state: VisualState;
}

const EDGE_CLASS =
	'pointer-events-none stroke-gray-300 stroke-2 opacity-30 [&[data-state=connected]]:stroke-orange-500 [&[data-state=connected]]:opacity-50 [&[data-state=active]]:stroke-orange-500 [&[data-state=active]]:opacity-50';

const props = withDefaults(defineProps<Props>(), {
	activeNode: '',
	initialCamera: null,
	focusNode: '',
	focusToken: '',
	matchedNodes: () => []
});

const emit = defineEmits<{
	'update:camera': [camera: DagCamera];
	'update:activeNode': [node: string];
}>();

const MIN_SCALE = 0.2;
const MAX_SCALE = 2.8;
const DRAG_THRESHOLD = 3;
const WHEEL_LINE_STEP = 16;
const WHEEL_PAGE_STEP = 120;
const CTRL_WHEEL_ZOOM_SENSITIVITY = 0.001;
const ZOOM_BUTTON_STEP = 0.25;
const DEFAULT_LEFT_PADDING = 30;
const NODE_LABEL_PADDING_X = 20;
const ELLIPSIS = '...';
const LABEL_FONT = '12px sans-serif';

const viewport = ref<HTMLDivElement | null>(null);
const canvas = ref<SVGSVGElement | null>(null);
const viewportWidth = ref(0);
const viewportHeight = ref(0);
const labelWidthCache = new Map<string, number>();
const isControlsPanelOpen = ref(true);

const scale = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const isDragging = ref(false);
const hasManualCamera = ref(false);

const dragStartClientX = ref(0);
const dragStartClientY = ref(0);
const dragStartOffsetX = ref(0);
const dragStartOffsetY = ref(0);
const hasDragged = ref(false);

let transformFrame = 0;
let labelMeasureContext: CanvasRenderingContext2D | null = null;

const nodesById = computed(() => {
	const map = new Map<string, DagLayoutNode>();

	for (const node of props.layout.nodes) {
		map.set(node.id, node);
	}

	return map;
});
const rootNodeIds = computed(() => new Set(props.layout.roots));
const neighborNodeIdsByNode = computed(() => {
	const neighbors = new Map<string, Set<string>>();

	for (const node of props.layout.nodes) {
		neighbors.set(node.id, new Set([node.id]));
	}

	for (const edge of props.layout.edges) {
		neighbors.get(edge.source)?.add(edge.target);
		neighbors.get(edge.target)?.add(edge.source);
	}

	return neighbors;
});

const activeNodeData = computed(() => {
	if (!props.activeNode) {
		return null;
	}

	const node = nodesById.value.get(props.activeNode);

	if (!node) {
		return null;
	}

	return {
		id: node.id,
		displayName: formatPath(node.id),
		kind: props.resourceKinds[node.id] || 'unknown',
		url: getNodeUrl(node.id)
	};
});

const connectedNodeIds = computed(() => {
	if (!props.activeNode) {
		return new Set<string>();
	}

	return neighborNodeIdsByNode.value.get(props.activeNode) || new Set([props.activeNode]);
});
const matchedNodeIds = computed(() => new Set(props.matchedNodes));

const renderedNodeBase = computed<Array<Omit<RenderedNode, 'state'>>>(() => {
	return props.layout.nodes.map(node => ({
		...node,
		url: getNodeUrl(node.id),
		label: trimLabel(node.id, node.width)
	}));
});

const renderedNodes = computed<Array<RenderedNode>>(() => {
	return renderedNodeBase.value.map(node => ({
		...node,
		state: getNodeState(node.id)
	}));
});

const renderedEdges = computed(() => {
	const paths: Record<Exclude<EdgeVisualState, 'active'>, Array<string>> = {
		idle: [],
		connected: [],
		dimmed: []
	};
	const active: Array<RenderedActiveEdge> = [];

	for (let index = 0; index < props.layout.edges.length; index++) {
		const edge = props.layout.edges[index]!;
		const state = getEdgeState(edge);

		if (state === 'active') {
			active.push({
				key: [edge.kind, edge.source, edge.target, edge.original || '', String(index)].join('\u0000'),
				path: edge.path
			});
			continue;
		}

		paths[state].push(edge.path);
	}

	return {
		paths: {
			idle: paths.idle.join(' '),
			connected: paths.connected.join(' '),
			dimmed: paths.dimmed.join(' ')
		},
		active
	};
});

function getNodeUrl(name: string): string {
	const kind = props.resourceKinds[name];

	if (kind === 'asset') {
		return router.getUrl('assets/details', { item: name });
	}

	return router.getUrl('inputs/details', { item: name });
}

function trimLabel(name: string, nodeWidth: number): string {
	const normalized = formatPath(name);
	const maxWidth = Math.max(0, nodeWidth - NODE_LABEL_PADDING_X);

	if (measureLabelWidth(normalized) <= maxWidth) {
		return normalized;
	}

	if (measureLabelWidth(ELLIPSIS) > maxWidth) {
		return ELLIPSIS;
	}

	let low = 0;
	let high = normalized.length;

	while (low < high) {
		const middle = Math.floor((low + high + 1) / 2);
		const candidate = `${ELLIPSIS}${normalized.slice(-middle)}`;

		if (measureLabelWidth(candidate) <= maxWidth) {
			low = middle;
		} else {
			high = middle - 1;
		}
	}

	return low > 0 ? `${ELLIPSIS}${normalized.slice(-low)}` : ELLIPSIS;
}

function measureLabelWidth(text: string): number {
	const cached = labelWidthCache.get(text);

	if (cached !== undefined) {
		return cached;
	}

	const context = getLabelMeasureContext();
	const width = context ? context.measureText(text).width : text.length * 6.5;

	labelWidthCache.set(text, width);
	return width;
}

function getLabelMeasureContext(): CanvasRenderingContext2D | null {
	if (labelMeasureContext) {
		return labelMeasureContext;
	}

	if (typeof document === 'undefined') {
		return null;
	}

	const measureCanvas = document.createElement('canvas');
	labelMeasureContext = measureCanvas.getContext('2d');

	if (!labelMeasureContext) {
		return null;
	}

	labelMeasureContext.font = LABEL_FONT;
	return labelMeasureContext;
}

function onNodeClick(nodeId: string): void {
	if (props.activeNode === nodeId) {
		emit('update:activeNode', '');
		return;
	}

	emit('update:activeNode', nodeId);
}

function getNodeState(nodeId: string): VisualState {
	if (!props.activeNode) {
		if (matchedNodeIds.value.has(nodeId)) {
			return 'matched';
		}

		return 'idle';
	}

	if (nodeId === props.activeNode) {
		return 'active';
	}

	if (connectedNodeIds.value.has(nodeId)) {
		return 'connected';
	}

	return 'dimmed';
}

function getEdgeState(edge: DagLayoutEdge): EdgeVisualState {
	if (!props.activeNode) {
		return 'idle';
	}

	if (edge.source === props.activeNode || edge.target === props.activeNode) {
		return 'active';
	}

	const sourceConnected = connectedNodeIds.value.has(edge.source);
	const targetConnected = connectedNodeIds.value.has(edge.target);

	if (!sourceConnected || !targetConnected) {
		return 'dimmed';
	}

	return 'connected';
}

function onMouseDown(event: MouseEvent): void {
	if (event.button !== 0) {
		return;
	}

	isDragging.value = true;
	hasDragged.value = false;
	dragStartClientX.value = event.clientX;
	dragStartClientY.value = event.clientY;
	dragStartOffsetX.value = offsetX.value;
	dragStartOffsetY.value = offsetY.value;
	scheduleCanvasTransform();

	window.addEventListener('mousemove', onMouseMove);
	window.addEventListener('mouseup', onMouseUp);

	event.preventDefault();
}

function onMouseMove(event: MouseEvent): void {
	if (!isDragging.value) {
		return;
	}

	const deltaX = event.clientX - dragStartClientX.value;
	const deltaY = event.clientY - dragStartClientY.value;

	if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
		hasDragged.value = true;
	}

	offsetX.value = dragStartOffsetX.value + deltaX;
	offsetY.value = dragStartOffsetY.value + deltaY;
	scheduleCanvasTransform();
}

function onMouseUp(): void {
	isDragging.value = false;

	window.removeEventListener('mousemove', onMouseMove);
	window.removeEventListener('mouseup', onMouseUp);
	scheduleCanvasTransform();

	if (hasDragged.value) {
		hasManualCamera.value = true;

		if (emitCameraTimeout) {
			window.clearTimeout(emitCameraTimeout);
			emitCameraTimeout = 0;
		}

		emitCamera();

		window.setTimeout(() => {
			hasDragged.value = false;
		}, 0);
	}
}

function onClickCapture(event: MouseEvent): void {
	if (!hasDragged.value) {
		return;
	}

	event.preventDefault();
	event.stopPropagation();
}

function onWheel(event: WheelEvent): void {
	if (!viewport.value) {
		return;
	}

	const deltaX = normalizeWheelValue(event.deltaX, event.deltaMode);
	const deltaY = normalizeWheelValue(event.deltaY, event.deltaMode);

	if (Math.abs(deltaX) <= 0.5 && Math.abs(deltaY) <= 0.5) {
		return;
	}

	if (event.ctrlKey) {
		zoomFromWheel(deltaY, event.clientX, event.clientY);
		return;
	}

	offsetX.value -= deltaX;
	offsetY.value -= deltaY;
	scheduleCanvasTransform();
	hasManualCamera.value = true;
	scheduleEmitCamera();
}

function toggleControlsPanel(): void {
	isControlsPanelOpen.value = !isControlsPanelOpen.value;
}

function zoomFromWheel(deltaY: number, clientX: number, clientY: number): void {
	if (!viewport.value) {
		return;
	}

	const zoomFactor = Math.exp(-deltaY * CTRL_WHEEL_ZOOM_SENSITIVITY);

	const rect = viewport.value.getBoundingClientRect();
	const anchorX = clientX - rect.left;
	const anchorY = clientY - rect.top;
	zoomToScale(scale.value * zoomFactor, anchorX, anchorY);
}

function zoomBy(step: number): void {
	const center = getViewportCenter();

	if (!center) {
		return;
	}

	zoomToScale(scale.value + step, center.x, center.y);
}

function resetZoom(): void {
	const center = getViewportCenter();

	if (!center) {
		return;
	}

	zoomToScale(1, center.x, center.y);
}

function getViewportCenter(): { x: number; y: number } | null {
	if (!viewport.value) {
		return null;
	}

	const { width, height } = getViewportSize();

	if (!width || !height) {
		return null;
	}

	return {
		x: width / 2,
		y: height / 2
	};
}

function zoomToScale(nextScale: number, anchorX: number, anchorY: number): void {
	const clampedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);

	if (clampedScale === scale.value) {
		return;
	}

	const worldX = (anchorX - offsetX.value) / scale.value;
	const worldY = (anchorY - offsetY.value) / scale.value;

	scale.value = clampedScale;
	offsetX.value = anchorX - worldX * clampedScale;
	offsetY.value = anchorY - worldY * clampedScale;
	scheduleCanvasTransform();
	hasManualCamera.value = true;
	scheduleEmitCamera();
}

function normalizeWheelValue(delta: number, mode: number): number {
	if (mode === WheelEvent.DOM_DELTA_LINE) {
		return delta * WHEEL_LINE_STEP;
	}

	if (mode === WheelEvent.DOM_DELTA_PAGE) {
		return delta * WHEEL_PAGE_STEP;
	}

	return delta;
}

function fitToViewport(): void {
	const { width, height } = getViewportSize();

	if (!width || !height || !props.layout.width || !props.layout.height) {
		return;
	}

	const focusNodes = getDefaultFocusNodes();
	const focusBounds = getNodesBounds(focusNodes);
	const focusCenterY = (focusBounds.minY + focusBounds.maxY) / 2;

	scale.value = 1;
	offsetX.value = DEFAULT_LEFT_PADDING - focusBounds.minX;
	offsetY.value = height / 2 - focusCenterY;
	scheduleCanvasTransform();
}

function centerOnNode(nodeId: string): void {
	if (!nodeId) {
		return;
	}

	const node = nodesById.value.get(nodeId);

	if (!node) {
		return;
	}

	const { width, height } = getViewportSize();

	if (!width || !height) {
		return;
	}

	offsetX.value = width / 2 - (node.x + node.width / 2) * scale.value;
	offsetY.value = height / 2 - (node.y + node.height / 2) * scale.value;
	scheduleCanvasTransform();
	hasManualCamera.value = true;

	if (emitCameraTimeout) {
		window.clearTimeout(emitCameraTimeout);
		emitCameraTimeout = 0;
	}

	emitCamera();
}

function getViewportSize(): { width: number; height: number } {
	if (!viewport.value) {
		return { width: 0, height: 0 };
	}

	const rect = viewport.value.getBoundingClientRect();
	const measuredWidth = viewportWidth.value || viewport.value.clientWidth || rect.width;
	const measuredHeight = viewportHeight.value || viewport.value.clientHeight || rect.height;
	const visibleWidth = Math.max(window.innerWidth - Math.max(rect.left, 0) - 16, 1);
	const visibleHeight = Math.max(window.innerHeight - Math.max(rect.top, 0) - 16, 1);

	return {
		width: Math.min(measuredWidth, visibleWidth),
		height: Math.min(measuredHeight, visibleHeight)
	};
}

function getDefaultFocusNodes() {
	if (!props.layout.nodes.length) {
		return [];
	}

	const rootNodes = props.layout.nodes.filter(node => rootNodeIds.value.has(node.id));

	if (rootNodes.length) {
		return rootNodes;
	}

	let firstLayer = Number.POSITIVE_INFINITY;

	for (const node of props.layout.nodes) {
		if (node.layer < firstLayer) {
			firstLayer = node.layer;
		}
	}

	return props.layout.nodes.filter(node => node.layer === firstLayer);
}

function getNodesBounds(nodes: Array<{ x: number; y: number; width: number; height: number }>): {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
} {
	if (!nodes.length) {
		return {
			minX: 0,
			maxX: props.layout.width,
			minY: 0,
			maxY: props.layout.height
		};
	}

	let minX = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;

	for (const node of nodes) {
		minX = Math.min(minX, node.x);
		maxX = Math.max(maxX, node.x + node.width);
		minY = Math.min(minY, node.y);
		maxY = Math.max(maxY, node.y + node.height);
	}

	return { minX, maxX, minY, maxY };
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function applyCanvasTransform(): void {
	if (!canvas.value) {
		return;
	}

	canvas.value.style.transform = `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) scale(${scale.value})`;
	canvas.value.style.transformOrigin = '0 0';
	canvas.value.style.willChange = isDragging.value ? 'transform' : 'auto';
}

function scheduleCanvasTransform(): void {
	if (transformFrame) {
		return;
	}

	transformFrame = window.requestAnimationFrame(() => {
		transformFrame = 0;
		applyCanvasTransform();
	});
}

function applyCamera(camera: DagCamera): void {
	scale.value = clamp(camera.scale, MIN_SCALE, MAX_SCALE);
	offsetX.value = camera.x;
	offsetY.value = camera.y;
	scheduleCanvasTransform();
}

function emitCamera(): void {
	emit('update:camera', {
		scale: scale.value,
		x: offsetX.value,
		y: offsetY.value
	});
}

let emitCameraTimeout = 0;

function scheduleEmitCamera(): void {
	if (emitCameraTimeout) {
		window.clearTimeout(emitCameraTimeout);
	}

	emitCameraTimeout = window.setTimeout(() => {
		emitCameraTimeout = 0;
		emitCamera();
	}, 120);
}

let resizeObserver: ResizeObserver | null = null;

function syncViewportSize(): void {
	if (!viewport.value) {
		return;
	}

	viewportWidth.value = viewport.value.clientWidth;
	viewportHeight.value = viewport.value.clientHeight;
}

function onWindowResize(): void {
	syncViewportSize();

	if (!hasManualCamera.value) {
		fitToViewport();
		emitCamera();
	}
}

onMounted(() => {
	if (!viewport.value) {
		return;
	}

	syncViewportSize();

	if (props.initialCamera) {
		applyCamera(props.initialCamera);
		hasManualCamera.value = true;
	} else {
		fitToViewport();
		emitCamera();
	}

	resizeObserver = new ResizeObserver(entries => {
		const entry = entries[0];

		if (!entry) {
			return;
		}

		viewportWidth.value = entry.contentRect.width;
		viewportHeight.value = entry.contentRect.height;

		if (!hasManualCamera.value) {
			fitToViewport();
			emitCamera();
		}
	});

	resizeObserver.observe(viewport.value);
	window.addEventListener('resize', onWindowResize);
});

onBeforeUnmount(() => {
	onMouseUp();
	resizeObserver?.disconnect();
	resizeObserver = null;
	window.removeEventListener('resize', onWindowResize);

	if (transformFrame) {
		window.cancelAnimationFrame(transformFrame);
		transformFrame = 0;
	}

	if (emitCameraTimeout) {
		window.clearTimeout(emitCameraTimeout);
		emitCameraTimeout = 0;
	}
});

watch(
	() => props.initialCamera,
	camera => {
		if (!camera) {
			return;
		}

		applyCamera(camera);
		hasManualCamera.value = true;
	}
);

watch(
	() => [props.focusNode, props.focusToken],
	() => {
		if (!props.focusNode) {
			return;
		}

		centerOnNode(props.focusNode);
	}
);

watch(
	() => [props.layout.width, props.layout.height],
	() => {
		syncViewportSize();

		if (!hasManualCamera.value) {
			fitToViewport();
			emitCamera();
		}
	}
);

watch(
	() => props.layout.nodes,
	() => {
		labelWidthCache.clear();
	}
);
</script>
