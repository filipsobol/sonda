<template>
  <div
    ref="tooltipRef"
		:class="{ invisible: !content }"
    :style="{ '--x': x, '--y': y }"
    role="tooltip"
    class="fixed z-10 max-w-[400px] px-2 py-1 bg-gray-800 text-gray-100 rounded-md break-words pointer-events-none"
  >
    <span>{{ content }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const margin = 12;

// reactive dimensions
const bodyWidth = ref(0);
const bodyHeight = ref(0);
const width = ref(0);
const height = ref(0);

// tooltip state
const content = ref( '' );
const x = ref( '0px' );
const y = ref( '0px' );

// tooltip DOM ref
const tooltipRef = ref<HTMLElement | null>(null);

function resetContent() {
  content.value = '';
}

function onMouseMove(event: MouseEvent) {
  const target = event.target as Element;
  content.value = target.getAttribute( 'data-hover' ) || '';
  if (!content.value) return;

  const { clientX, clientY } = event;
  const calcX =
    clientX + width.value + margin > bodyWidth.value
      ? clientX - width.value - margin
      : clientX + margin;
  const calcY =
    clientY + height.value + margin > bodyHeight.value
      ? clientY - height.value
      : clientY + margin;

  x.value = `${calcX}px`;
  y.value = `${calcY}px`;
}

let resizeObserver: ResizeObserver;

onMounted(() => {
  resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width: w, height: h } = entry.contentRect;
      if (entry.target === document.body) {
        bodyWidth.value = w;
        bodyHeight.value = h;
      } else if (entry.target === tooltipRef.value) {
        width.value = w;
        height.value = h;
      }
    }
  });

  // start observing both targets
  resizeObserver.observe(document.body);
  if (tooltipRef.value) {
    resizeObserver.observe(tooltipRef.value);
  }

  document.body.addEventListener('mousemove', onMouseMove);
  document.body.addEventListener('mouseover', onMouseMove);
  document.body.addEventListener('mouseleave', resetContent);
});

onBeforeUnmount(() => {
  resizeObserver.disconnect();
  document.body.removeEventListener('mousemove', onMouseMove);
  document.body.removeEventListener('mouseover', onMouseMove);
  document.body.removeEventListener('mouseleave', resetContent);
});
</script>

<style scoped>
div[role="tooltip"] {
  transform: translate(var(--x), var(--y));
  will-change: transform, contents;
}
</style>
