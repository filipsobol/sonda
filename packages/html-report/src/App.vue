<template>
  <Treemap :content="content" />
</template>

<script setup lang="ts">
import { markRaw } from 'vue';
import Treemap from './Treemap.vue';
import { parse } from './data';
import data from './output';

const content = markRaw( parse( data ) );
</script>
