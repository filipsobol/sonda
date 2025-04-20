<template>
	<div
		v-click-outside="() => open = false"
		class="relative"
	>
		<BaseButton
			class="ps-3 pe-2 min-w-48"
			@click="() => open = !open"
		>
			<span ref="select-button">{{ title }}</span>

			<IconChevronLeft
				:size="16"
				:class="[
					'ms-2 text-gray-500 transition-[rotate] duration-150',
					open ? 'rotate-90' : 'rotate-270'
				]"
			/>
		</BaseButton>

		<transition
			enter-active-class="transition-opacity duration-150"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition-opacity duration-150"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-show="open"
				class="absolute mt-1 z-10 w-48 bg-white border border-gray-300 rounded-lg shadow-lg"
			>
			<ul class="p-3 flex flex-col gap-3 text-sm text-gray-900">
				<li
					v-for="option in props.options"
					:key="option.value"
					class="cursor-pointer"
				>
					<div class="flex items-center">
						<input
							v-model="model"
							:value="option.value"
							:id="'radio-' + option.value"
							type="radio"
							class="size-4"
						>
						<label
							:for="'radio-' + option.value"
							class="ps-2 w-full"
						>
							{{ option.label }}
							<span
								v-if="option.subLabel"
								class="text-gray-500"
							>
								({{ option.subLabel }})
							</span>
						</label>
					</div>
				</li>
			</ul>
			</div>
		</transition>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch, useTemplateRef } from 'vue';
import BaseButton from '@components/common/Button.vue';
import IconChevronLeft from '@icon/ChevronLeft.vue';

interface Option {
	label: string;
	subLabel?: string;
	value: string;
}

interface Props {
	options: Array<Option>;
}

const element = useTemplateRef<HTMLButtonElement>( 'select-button' );
const model = defineModel();
const props = defineProps<Props>();

const open = ref( false );
const title = computed( () => props.options.find( option => option.value === model.value )!.label );

watch( model, () => {
	open.value = false;
	
	// `element` is always empty when `ref` is directly on the `<BaseButton>` element.
	element.value!.closest( 'button' )!.focus();
} );
</script>
