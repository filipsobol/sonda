<template>
  <Tile
    v-for="(tile, index) in tiles"
    :totalBytes
    :tile
    :content="children[ index ]"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import Tile from './Tile.vue';
import { generateTreeMap } from '@/treemap.js';
import type { Content } from '@/FileSystemTrie';

interface Props {
  content: Content | Content[];
  totalBytes: number;
  width: number;
  height: number;
  xStart: number;
  yStart: number;
}

const props = defineProps<Props>();

const children = computed<Content[]>( () => Array.isArray( props.content ) ? props.content: [ props.content ] );
const tiles = computed(() => generateTreeMap(
  children.value.map( child => child.uncompressed),
  props.width,
  props.height,
  props.xStart,
  props.yStart
) );
</script>
