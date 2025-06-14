<template>
  <g>
    <a :xlink:href="url">
      <rect
        :data-hover="hoverData"
        :x="tile.x"
        :y="tile.y"
        :width="tile.width"
        :height="tile.height"
        :style="{ '--percentage': percentage }"
        class="stroke-gray-400"
        :class="isFolder(content) ? 'cursor-zoom-in' : 'cursor-pointer'"
        shape-rendering="crispEdges"
        vector-effect="non-scaling-stroke"
      />
    </a>

    <foreignObject
      v-if="shouldDisplayText"
      :x="tile.x"
      :y="tile.y"
      :width="tile.width"
      :height="tile.height"
      class="pointer-events-none"
    >
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        class="@container px-2 py-0.5 size-full flex justify-center flex-nowrap text-sm gap-1"
      >
        <!-- https://stackoverflow.com/a/42551367/4617687 -->
        <p dir="rtl" class="text-gray-900 shrink truncate">&lrm;{{ content.name }}</p>
        <p class="text-gray-500 shrink-0 hidden @2xs:block">—</p>
        <p class="text-gray-500 shrink-0 hidden @2xs:block">{{ formattedSize }}</p>
      </div>
    </foreignObject>

    <Level
      v-if="children.length"
      :content="children"
      :totalBytes
      :compressionType
      :width
      :height
      :xStart="tile.x + padding"
      :yStart="tile.y + paddingTop"
    />
  </g>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import Level from './Level.vue';
import { getChunks } from '@/report';
import { router } from '@/router';
import { formatSize } from '@/format';
import { isFolder, type Content } from '@/FileSystemTrie';
import type { TileData } from '@/treemap';

const tresholdInPixels = 20;
const padding = 6;
const paddingTop = 26;

interface Props {
  tile: TileData;
  content: Content;
  totalBytes: number;
  compressionType: 'uncompressed' | 'gzip' | 'brotli';
}

const props = defineProps<Props>();

const url = computed( () => {
  const path = props.content.path;

  if ( isFolder( props.content ) ) {
    // Tile is a folder
    return router.getUrl( 'treemap', { item: router.query.item, chunk: path } );
  }

  if ( props.content.kind === 'chunk' ) {
    // Tile is a chunk
    return router.getUrl( 'inputs/details', { item: path, usage: 'true', usedIn: router.query.item } );
  }

  if ( !getChunks( path ).length ) {
    // Tile is an asset, but without chunks
    return router.getUrl( 'assets/details', { item: path } );
  }

  // Tile is an asset
  return router.getUrl( 'treemap', { item: path, compression: props.compressionType } );
} );
const width = computed( () => props.tile.width - padding * 2 );
const height = computed( () => props.tile.height - padding - paddingTop );
const formattedSize = computed( () => formatSize( props.content[ props.compressionType ] ) );
const percentageOfTotal = computed( () => Math.min( ( props.content[ props.compressionType ] / props.totalBytes ) * 100, 100 ) );
const hoverData = computed( () => `${props.content.name} — ${formattedSize.value} (${percentageOfTotal.value.toFixed(2)}%)` );
const percentage = computed( () => Math.round(percentageOfTotal.value) + '%' );
const shouldDisplayText = computed(  () => props.tile.width >= paddingTop * 1.75 && props.tile.height >= paddingTop );

const children = computed<Array<Content>>( () => {
  if (
    !isFolder( props.content )
		|| height.value <= tresholdInPixels
		|| width.value <= tresholdInPixels
  ) {
    return [];
  }

  return props.content.items;
} );
</script>

<style scoped>
rect {
  fill: color-mix(in oklch, var(--color-red-100) var(--percentage), var(--color-green-100));
}

rect:hover {
  fill: color-mix(in oklch, var(--color-red-200) var(--percentage), var(--color-green-200));
}
</style>
