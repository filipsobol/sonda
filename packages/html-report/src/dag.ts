import type { Connection } from 'sonda';

interface DagLayoutOptions {
	nodeWidth: number;
	nodeHeight: number;
	horizontalGap: number;
	verticalGap: number;
	paddingX: number;
	paddingY: number;
	maxNodesPerColumn: number;
}

export interface DagLayoutNode {
	id: string;
	layer: number;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface DagLayoutEdge extends Connection {
	path: string;
}

export interface DagLayout {
	width: number;
	height: number;
	nodes: Array<DagLayoutNode>;
	edges: Array<DagLayoutEdge>;
	roots: Array<string>;
	leaves: Array<string>;
}

export interface DagCamera {
	scale: number;
	x: number;
	y: number;
}

const DEFAULT_LAYOUT_OPTIONS: DagLayoutOptions = {
	nodeWidth: 250,
	nodeHeight: 36,
	horizontalGap: 120,
	verticalGap: 16,
	paddingX: 36,
	paddingY: 24,
	maxNodesPerColumn: Number.POSITIVE_INFINITY
};

const EDGE_SIBLING_OFFSET_STEP = 6;
const KEY_SEPARATOR = '\u0000';

interface DagGraphIndex {
	outgoing: Record<string, Array<Connection>>;
	incoming: Record<string, Array<Connection>>;
}

interface DagNodePlacement {
	nodes: Array<DagLayoutNode>;
	positions: Map<string, DagLayoutNode>;
}

// Layout pipeline:
// 1) Assign nodes to DAG layers (cycles collapsed via SCCs).
// 2) Split each layer into visual columns to limit backward-looking in-layer links.
// 3) Place node rectangles from left to right.
// 4) Route edges as cubic SVG paths.
export function createDagLayout(connections: Array<Connection>, options: Partial<DagLayoutOptions> = {}): DagLayout {
	const layoutOptions = {
		...DEFAULT_LAYOUT_OPTIONS,
		...options
	};
	const columnGap = layoutOptions.horizontalGap;
	const edges = connections;
	const nodeIds = collectNodeIds(edges);

	if (!nodeIds.length) {
		return createEmptyLayout();
	}

	const { outgoing, incoming } = buildGraphIndex(nodeIds, edges);
	const { roots, leaves } = collectRootsAndLeaves(nodeIds, incoming, outgoing);
	const layers = computeLayers(nodeIds, outgoing);
	const { maxLayer, layersMap } = groupNodesByLayer(nodeIds, layers, outgoing);
	const layerColumns = splitLayersIntoColumns(layersMap, maxLayer, layoutOptions.maxNodesPerColumn, outgoing);
	const { innerHeight, width, height } = computeLayoutSize(layerColumns, maxLayer, layoutOptions, columnGap);
	const { nodes, positions } = placeLayerNodes(layerColumns, maxLayer, innerHeight, layoutOptions, columnGap);
	const edgeSiblingOffsets = createEdgeSiblingOffsets(edges);
	const layoutEdges = createLayoutEdges(edges, positions, edgeSiblingOffsets);

	return {
		width,
		height,
		nodes,
		edges: layoutEdges,
		roots,
		leaves
	};
}

function createEmptyLayout(): DagLayout {
	return {
		width: 0,
		height: 0,
		nodes: [],
		edges: [],
		roots: [],
		leaves: []
	};
}

// Adjacency lists are sorted for deterministic output across runs.
function buildGraphIndex(nodeIds: Array<string>, edges: Array<Connection>): DagGraphIndex {
	const outgoing: Record<string, Array<Connection>> = {};
	const incoming: Record<string, Array<Connection>> = {};

	for (const id of nodeIds) {
		outgoing[id] = [];
		incoming[id] = [];
	}

	for (const edge of edges) {
		outgoing[edge.source]!.push(edge);
		incoming[edge.target]!.push(edge);
	}

	for (const id of nodeIds) {
		outgoing[id]!.sort((a, b) => compareText(a.target, b.target) || compareText(a.kind, b.kind));
		incoming[id]!.sort((a, b) => compareText(a.source, b.source) || compareText(a.kind, b.kind));
	}

	return {
		outgoing,
		incoming
	};
}

// Roots and leaves are exposed to the UI for entry/exit highlighting.
function collectRootsAndLeaves(
	nodeIds: Array<string>,
	incoming: Record<string, Array<Connection>>,
	outgoing: Record<string, Array<Connection>>
): { roots: Array<string>; leaves: Array<string> } {
	const roots: Array<string> = [];
	const leaves: Array<string> = [];

	for (const id of nodeIds) {
		if (incoming[id]!.length === 0) {
			roots.push(id);
		}

		if (outgoing[id]!.length === 0) {
			leaves.push(id);
		}
	}

	return {
		roots,
		leaves
	};
}

// Bucket nodes by layer and apply a stable in-layer ordering.
function groupNodesByLayer(
	nodeIds: Array<string>,
	layers: Map<string, number>,
	outgoing: Record<string, Array<Connection>>
): { maxLayer: number; layersMap: Map<number, Array<string>> } {
	let maxLayer = 0;
	const layersMap = new Map<number, Array<string>>();

	for (const id of nodeIds) {
		const layer = layers.get(id) || 0;

		if (layer > maxLayer) {
			maxLayer = layer;
		}

		if (!layersMap.has(layer)) {
			layersMap.set(layer, []);
		}

		layersMap.get(layer)!.push(id);
	}

	for (let layer = 0; layer <= maxLayer; layer++) {
		const ids = layersMap.get(layer) || [];

		// Place "busier" nodes first so column splitting gets better packing.
		ids.sort((a, b) => {
			const outgoingDiff = outgoing[b]!.length - outgoing[a]!.length;

			if (outgoingDiff !== 0) {
				return outgoingDiff;
			}

			return compareText(a, b);
		});

		layersMap.set(layer, ids);
	}

	return {
		maxLayer,
		layersMap
	};
}

// Split each layer into one or more columns while preserving layer order.
function splitLayersIntoColumns(
	layersMap: Map<number, Array<string>>,
	maxLayer: number,
	maxNodesPerColumn: number,
	outgoing: Record<string, Array<Connection>>
): Map<number, Array<Array<string>>> {
	const layerColumns = new Map<number, Array<Array<string>>>();

	for (let layer = 0; layer <= maxLayer; layer++) {
		const ids = layersMap.get(layer)!;
		const columns = splitLayerNodes(ids, maxNodesPerColumn, outgoing);
		layerColumns.set(layer, columns.length ? columns : [[]]);
	}

	return layerColumns;
}

// Compute outer canvas size from layer columns and layout options.
function computeLayoutSize(
	layerColumns: Map<number, Array<Array<string>>>,
	maxLayer: number,
	options: DagLayoutOptions,
	columnGap: number
): { innerHeight: number; width: number; height: number } {
	let maxRows = 1;

	for (const columns of layerColumns.values()) {
		for (const column of columns) {
			maxRows = Math.max(maxRows, column.length);
		}
	}

	// Layout is centered vertically using the tallest column as a shared reference height.
	const innerHeight = Math.max(options.nodeHeight, maxRows * options.nodeHeight + (maxRows - 1) * options.verticalGap);
	let innerWidth = 0;

	for (let layer = 0; layer <= maxLayer; layer++) {
		const columns = layerColumns.get(layer)!;
		const layerWidth = columns.length * options.nodeWidth + Math.max(columns.length - 1, 0) * columnGap;

		innerWidth += layerWidth;

		if (layer < maxLayer) {
			innerWidth += options.horizontalGap;
		}
	}

	return {
		innerHeight,
		width: options.paddingX * 2 + innerWidth,
		height: options.paddingY * 2 + innerHeight
	};
}

// Convert layer/column assignments into concrete node rectangles.
function placeLayerNodes(
	layerColumns: Map<number, Array<Array<string>>>,
	maxLayer: number,
	innerHeight: number,
	options: DagLayoutOptions,
	columnGap: number
): DagNodePlacement {
	const nodes: Array<DagLayoutNode> = [];
	const positions = new Map<string, DagLayoutNode>();
	let layerStartX = options.paddingX;

	for (let layer = 0; layer <= maxLayer; layer++) {
		const columns = layerColumns.get(layer)!;
		const layerWidth = columns.length * options.nodeWidth + Math.max(columns.length - 1, 0) * columnGap;

		for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
			const ids = columns[columnIndex]!;
			const columnHeight = ids.length * options.nodeHeight + Math.max(ids.length - 1, 0) * options.verticalGap;
			const yStart = options.paddingY + (innerHeight - columnHeight) / 2;
			const x = layerStartX + columnIndex * (options.nodeWidth + columnGap);

			for (let index = 0; index < ids.length; index++) {
				const id = ids[index]!;
				const node: DagLayoutNode = {
					id,
					layer,
					x,
					y: yStart + index * (options.nodeHeight + options.verticalGap),
					width: options.nodeWidth,
					height: options.nodeHeight
				};

				nodes.push(node);
				positions.set(id, node);
			}
		}

		layerStartX += layerWidth;

		if (layer < maxLayer) {
			layerStartX += options.horizontalGap;
		}
	}

	return {
		nodes,
		positions
	};
}

// Precompute per-edge Y offsets for sibling source->target edges.
function createEdgeSiblingOffsets(edges: Array<Connection>): Array<number> {
	const edgeIndexesByPair: Record<string, Array<number>> = {};

	for (let index = 0; index < edges.length; index++) {
		const edge = edges[index]!;
		const key = getPairKey(edge.source, edge.target);

		edgeIndexesByPair[key] ||= [];
		edgeIndexesByPair[key]!.push(index);
	}

	const edgeSiblingOffsets = new Array<number>(edges.length).fill(0);

	// Sibling edges (same source->target pair, different kind) are fanned out slightly.
	for (const key in edgeIndexesByPair) {
		const siblingIndexes = edgeIndexesByPair[key]!;
		siblingIndexes.sort((a, b) => compareText(edges[a]!.kind, edges[b]!.kind));

		const center = (siblingIndexes.length - 1) / 2;

		for (let index = 0; index < siblingIndexes.length; index++) {
			edgeSiblingOffsets[siblingIndexes[index]!] = (index - center) * EDGE_SIBLING_OFFSET_STEP;
		}
	}

	return edgeSiblingOffsets;
}

// Convert node positions into SVG edge path data.
function createLayoutEdges(
	edges: Array<Connection>,
	positions: Map<string, DagLayoutNode>,
	edgeSiblingOffsets: Array<number>
): Array<DagLayoutEdge> {
	const layoutEdges: Array<DagLayoutEdge> = [];

	// Convert edge endpoints into SVG cubic paths.
	for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
		const edge = edges[edgeIndex]!;
		const source = positions.get(edge.source);
		const target = positions.get(edge.target);

		if (!source || !target) {
			continue;
		}

		const siblingOffset = edgeSiblingOffsets[edgeIndex] || 0;
		const sourceY = source.y + source.height / 2 + siblingOffset;
		const targetY = target.y + target.height / 2 + siblingOffset;
		const sourceX = source.x + source.width;
		const targetX = target.x;
		const curve = Math.max(28, Math.min(120, (targetX - sourceX) * 0.35));
		const path =
			edge.source === edge.target
				? `M ${sourceX} ${sourceY} c 18 -15 18 15 0 0`
				: `M ${sourceX} ${sourceY} C ${sourceX + curve} ${sourceY}, ${targetX - curve} ${targetY}, ${targetX} ${targetY}`;

		layoutEdges.push({
			...edge,
			path
		});
	}

	return layoutEdges;
}

function computeLayers(nodeIds: Array<string>, outgoing: Record<string, Array<Connection>>): Map<string, number> {
	// Collapse cycles first (SCCs). The condensed graph is a DAG,
	// so we can safely assign monotonically increasing left-to-right layers.
	const components = computeStronglyConnectedComponents(nodeIds, outgoing);
	const componentByNode = new Map<string, number>();
	const componentKeys = components.map(component => component[0]!);

	for (let componentIndex = 0; componentIndex < components.length; componentIndex++) {
		for (const id of components[componentIndex]!) {
			componentByNode.set(id, componentIndex);
		}
	}

	const componentOutgoing = components.map(() => [] as Array<number>);
	const componentIncomingCount = new Array<number>(components.length).fill(0);
	const seenComponentEdges = new Set<string>();

	for (const sourceId of nodeIds) {
		for (const edge of outgoing[sourceId]!) {
			const sourceComponent = componentByNode.get(edge.source)!;
			const targetComponent = componentByNode.get(edge.target)!;

			if (sourceComponent === targetComponent) {
				continue;
			}

			const componentEdgeKey = `${sourceComponent}${KEY_SEPARATOR}${targetComponent}`;

			if (seenComponentEdges.has(componentEdgeKey)) {
				continue;
			}

			seenComponentEdges.add(componentEdgeKey);
			componentOutgoing[sourceComponent]!.push(targetComponent);
			componentIncomingCount[targetComponent]! += 1;
		}
	}

	for (let componentIndex = 0; componentIndex < componentOutgoing.length; componentIndex++) {
		componentOutgoing[componentIndex]!.sort((a, b) => compareText(componentKeys[a]!, componentKeys[b]!));
	}

	// Kahn-style topological walk on SCC components.
	const queue = components
		.map((_, componentIndex) => componentIndex)
		.filter(componentIndex => componentIncomingCount[componentIndex] === 0)
		.sort((a, b) => compareText(componentKeys[a]!, componentKeys[b]!));
	const componentLayers = new Array<number>(components.length).fill(0);
	let queueIndex = 0;

	while (queueIndex < queue.length) {
		const sourceComponent = queue[queueIndex++]!;

		for (const targetComponent of componentOutgoing[sourceComponent]!) {
			const nextLayer = componentLayers[sourceComponent]! + 1;
			const currentLayer = componentLayers[targetComponent]!;

			if (nextLayer > currentLayer) {
				componentLayers[targetComponent] = nextLayer;
			}

			componentIncomingCount[targetComponent]! -= 1;

			if (componentIncomingCount[targetComponent] === 0) {
				queue.push(targetComponent);
			}
		}
	}

	const layers = new Map<string, number>();

	// Expand component layers back to per-node layers.
	for (let componentIndex = 0; componentIndex < components.length; componentIndex++) {
		const layer = componentLayers[componentIndex]!;

		for (const id of components[componentIndex]!) {
			layers.set(id, layer);
		}
	}

	return layers;
}

function computeStronglyConnectedComponents(
	nodeIds: Array<string>,
	outgoing: Record<string, Array<Connection>>
): Array<Array<string>> {
	// Tarjan's algorithm: O(nodes + edges), deterministic after we sort each component.
	const stack: Array<string> = [];
	const onStack = new Set<string>();
	const indexes = new Map<string, number>();
	const lowLinks = new Map<string, number>();
	const components: Array<Array<string>> = [];
	let currentIndex = 0;

	const visit = (id: string): void => {
		// Assign DFS index/low-link and push to the active stack.
		indexes.set(id, currentIndex);
		lowLinks.set(id, currentIndex);
		currentIndex += 1;
		stack.push(id);
		onStack.add(id);

		for (const edge of outgoing[id]!) {
			const target = edge.target;

			if (!indexes.has(target)) {
				visit(target);
				lowLinks.set(id, Math.min(lowLinks.get(id)!, lowLinks.get(target)!));
				continue;
			}

			if (onStack.has(target)) {
				lowLinks.set(id, Math.min(lowLinks.get(id)!, indexes.get(target)!));
			}
		}

		if (lowLinks.get(id) !== indexes.get(id)) {
			return;
		}

		// Root of an SCC: pop until we get back to this node.
		const component: Array<string> = [];

		while (stack.length) {
			const node = stack.pop()!;
			onStack.delete(node);
			component.push(node);

			if (node === id) {
				break;
			}
		}

		component.sort(compareText);
		components.push(component);
	};

	for (const id of nodeIds) {
		if (indexes.has(id)) {
			continue;
		}

		visit(id);
	}

	return components;
}

export function deduplicateConnections(connections: Array<Connection>): Array<Connection> {
	const seen = new Set<string>();

	return connections.filter(connection => {
		const key = getConnectionKey(connection);

		if (seen.has(key)) {
			return false;
		}

		seen.add(key);
		return true;
	});
}

function collectNodeIds(connections: Array<Connection>): Array<string> {
	const nodeIds = new Set<string>();

	for (const connection of connections) {
		nodeIds.add(connection.source);
		nodeIds.add(connection.target);
	}

	return Array.from(nodeIds).sort(compareText);
}

function getPairKey(source: string, target: string): string {
	return `${source}${KEY_SEPARATOR}${target}`;
}

function getConnectionKey(connection: Connection): string {
	return [connection.kind, connection.source, connection.target, connection.original || ''].join(KEY_SEPARATOR);
}

function compareText(a: string, b: string): number {
	return a.localeCompare(b);
}

function splitLayerNodes(
	ids: Array<string>,
	maxNodesPerColumn: number,
	outgoing: Record<string, Array<Connection>>
): Array<Array<string>> {
	if (!ids.length) {
		return [];
	}

	if (!Number.isFinite(maxNodesPerColumn) || maxNodesPerColumn <= 0) {
		return [ids];
	}

	const columnSize = Math.max(1, Math.floor(maxNodesPerColumn));
	const { conflictsByNode, incomingSourcesByNode, hasConflicts } = buildLayerConflictIndex(ids, outgoing);

	if (!hasConflicts && ids.length <= columnSize) {
		return [ids];
	}

	const columns: Array<Array<string>> = [];
	const columnNodeSets: Array<Set<string>> = [];
	const columnByNode = new Map<string, number>();

	for (const id of ids) {
		const conflicts = conflictsByNode.get(id);
		const incomingSources = incomingSourcesByNode.get(id);
		let startColumnIndex = 0;

		// If a predecessor in the same layer is already placed, avoid searching columns to its left.
		if (incomingSources) {
			for (const sourceId of incomingSources) {
				const sourceColumnIndex = columnByNode.get(sourceId);

				if (sourceColumnIndex !== undefined && sourceColumnIndex > startColumnIndex) {
					startColumnIndex = sourceColumnIndex;
				}
			}
		}

		let placed = false;

		for (let columnIndex = startColumnIndex; columnIndex < columns.length; columnIndex++) {
			const column = columns[columnIndex]!;

			if (column.length >= columnSize) {
				continue;
			}

			if (conflicts && hasConflictInColumn(conflicts, columnNodeSets[columnIndex]!)) {
				continue;
			}

			column.push(id);
			columnNodeSets[columnIndex]!.add(id);
			columnByNode.set(id, columnIndex);
			placed = true;
			break;
		}

		if (placed) {
			continue;
		}

		columns.push([id]);
		columnNodeSets.push(new Set([id]));
		columnByNode.set(id, columns.length - 1);
	}

	return columns;
}

// Build all same-layer relationships in one pass and reuse during placement.
function buildLayerConflictIndex(
	ids: Array<string>,
	outgoing: Record<string, Array<Connection>>
): {
	conflictsByNode: Map<string, Set<string>>;
	incomingSourcesByNode: Map<string, Set<string>>;
	hasConflicts: boolean;
} {
	const idSet = new Set(ids);
	const conflictsByNode = new Map<string, Set<string>>();
	const incomingSourcesByNode = new Map<string, Set<string>>();
	let hasConflicts = false;

	// Build relationships between nodes that live in this layer only.
	for (const id of ids) {
		for (const edge of outgoing[id]!) {
			const target = edge.target;

			if (target === id || !idSet.has(target)) {
				continue;
			}

			hasConflicts = true;

			// Treat in-layer links as a symmetric conflict: both endpoints should avoid sharing a column.
			addMapSetValue(conflictsByNode, id, target);
			addMapSetValue(conflictsByNode, target, id);

			// Used as a placement hint to keep same-layer links mostly left-to-right.
			addMapSetValue(incomingSourcesByNode, target, id);
		}
	}

	return {
		conflictsByNode,
		incomingSourcesByNode,
		hasConflicts
	};
}

// Tiny helper to avoid repeating "get-or-create Set" boilerplate.
function addMapSetValue(map: Map<string, Set<string>>, key: string, value: string): void {
	if (!map.has(key)) {
		map.set(key, new Set());
	}

	map.get(key)!.add(value);
}

function hasConflictInColumn(conflicts: Set<string>, columnNodeSet: Set<string>): boolean {
	// Iterate the smaller set first to reduce lookups on dense layers.
	if (conflicts.size <= columnNodeSet.size) {
		for (const conflictedId of conflicts) {
			if (columnNodeSet.has(conflictedId)) {
				return true;
			}
		}

		return false;
	}

	for (const id of columnNodeSet) {
		if (conflicts.has(id)) {
			return true;
		}
	}

	return false;
}
