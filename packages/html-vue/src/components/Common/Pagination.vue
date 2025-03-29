<template>
	<nav class="flex items-center justify-between mt-4">
		<p class="text-gray-600">Showing {{ firstItemNumber }} to {{ lastItemNumber }} of {{ count }} entries</p>
	
		<div class="flex items-center space-x-2">
			<p class="text-gray-600">Page {{ currentPage }} of {{ lastPage }}</p>

			<ul class="flex space-x-2">
				<li>
					<button
						:disabled="isFirstPage"
						:class="classes"
						@click="() => model = 1"
					>
						<IconChevronsLeft :size="16" />
					</button>
				</li>
				<li>
					<button
						:disabled="isFirstPage"
						:class="classes"
						@click="() => model -= 1"
					>
						<IconChevronLeft :size="16" />
					</button>
				</li>
				<li>
					<button
						:disabled="isLastPage"
						:class="classes"
						@click="() => model += 1"
					>
						<IconChevronLeft :size="16" class="rotate-180" />
					</button>
				</li>
				<li>
					<button
						:disabled="isLastPage"
						:class="classes"
						@click="() => model = lastPage"
					>
						<IconChevronsLeft :size="16" class="rotate-180" />
					</button>
				</li>
			</ul>
		</div>
	</nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import IconChevronLeft from '@components/Icon/ChevronLeft.vue';
import IconChevronsLeft from '@components/Icon/ChevronsLeft.vue';

const classes = `
	flex items-center justify-center p-2 text-gray-500 border border-gray-300 rounded-lg shadow-xs cursor-pointer
	transition-opacity transition-colors duration-150
	hover:bg-gray-100 hover:text-gray-700
	disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed
`;

interface Props {
	count: number;
	itemsPerPage: number;
}

defineEmits<{
  (e: 'pageChange', pageNumber: number): void;
}>()

const model = defineModel<number>( { default: 1 } );
const props = defineProps<Props>();

const firstItemNumber = computed( () => props.count > 0 ? ( model.value - 1 ) * props.itemsPerPage + 1 : 0 );
const lastItemNumber = computed( () => Math.min( model.value * props.itemsPerPage, props.count ) );

const isFirstPage = computed( () => model.value <= 1 );
const isLastPage = computed( () => model.value >= lastPage.value );

const currentPage = computed( () => props.count > 0 ? model.value : 0 );
const lastPage = computed( () => props.count > 0 ? Math.ceil( props.count / props.itemsPerPage ) : 0 );
</script>
