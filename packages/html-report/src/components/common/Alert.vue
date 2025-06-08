<template>
	<div
		class="p-4 mb-8 text-sm rounded-lg bg-red-50 border border-red-200 shadow-xs"
		role="alert"
	>
		<div class="font-bold text-red-900">
			<slot name="header" />
		</div>

		<div class="mt-4 text-red-900/70">
			<slot name="body" />
		</div>
	</div>
</template>
