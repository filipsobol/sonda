<template>
	<span
		:class="[ variantClasses[variant] ]"
		class="font-medium px-2.5 py-0.5 rounded-sm border"
	>
		<slot />
	</span>
</template>

<script setup lang="ts">
type Variants = 'primary' | 'dark' | 'red' | 'green' | 'yellow';

interface Props {
	variant?: Variants;
}

withDefaults( defineProps<Props>(), {
	variant: 'primary'
} );

const variantClasses = {
	primary: 'bg-blue-100 text-blue-800 border-blue-200',
	dark: 'bg-gray-100 text-gray-800 border-gray-200',
	red: 'bg-red-100 text-red-800 border-red-200',
	green: 'bg-green-100 text-green-800 border-green-200',
	yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};
</script>
