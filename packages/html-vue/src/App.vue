<template>
  <div class="flex min-h-screen w-screen overflow-y-scroll text-gray-900">
    <Sidebar />

    <div class="flex-grow flex flex-col w-full overflow-hidden">
      <Breadcrumbs class="p-4" />

      <div class="p-4 flex-grow">
        <transition
          mode="out-in"
          enter-active-class="transition-opacity duration-150"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <component :is="currentPage" class="relative" />
        </transition>
      </div>
    </div>
  </div>

  <MobileOverlay />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { router } from '@router';
import Breadcrumbs from '@components/layout/Breadcrumbs.vue';
import Sidebar from '@layout/Sidebar.vue';
import MobileOverlay from '@layout/MobileOverlay.vue';

const components = import.meta.glob( './pages/**/*.vue' );

const pages: Record<string, any> = Object.fromEntries(
  Object.entries( components ).map( ( [ path, component ] ) => {
    const parts = path
      .replace( './pages/', '' )
      .replace( '.vue', '' )
      .toLowerCase()
      .split( '/' );
    
    if ( parts.at( -1 ) === 'index' ) {
      parts.pop();
    }

    return [ parts.join( '/' ) , component ];
  } )
);

const currentPage = computed( () => defineAsyncComponent( pages[ router.path ] ) )
</script>
