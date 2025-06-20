<template>
	<div
		:class="classes"
		class="p-4 mb-8 text-sm rounded-lg border shadow-xs"
		role="alert"
	>
		<div
			v-if="$slots.header"
			class="font-bold"
		>
			<slot name="header" />
		</div>

		<div
			v-if="$slots.body"
			:class="bodyClasses"
			class="mt-4"
		>
			<slot name="body" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
	variant?: 'neutral' | 'error' | 'warning' | 'info';
}

const styles: Record<NonNullable<Props['variant']>, string> = {
	neutral: 'bg-gray-50 border-gray-200 text-gray-900',
	error: 'bg-red-50 border-red-200 text-red-900',
	warning: 'bg-orange-50 border-orange-200 text-orange-900',
	info: 'bg-blue-50 border-blue-200 text-blue-900',
};

const bodyStyles: Record<NonNullable<Props['variant']>, string> = {
	neutral: 'text-gray-900/70',
	error: 'text-red-900/70',
	warning: 'text-orange-900/70',
	info: 'text-blue-900/70',
};

const props = withDefaults( defineProps<Props>(), {
	variant: 'info',
} );

const classes = computed( () => styles[ props.variant ] );
const bodyClasses = computed( () => bodyStyles[ props.variant ] );
</script>
