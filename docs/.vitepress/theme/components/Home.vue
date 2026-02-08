<template>
	<section id="hero">
		<h1 class="tagline">
			<span class="accent">Universal</span>
			<br />bundle analyzer
		</h1>
		<p class="description">Bundle visualizer and analyzer that works with most bundlers and frameworks</p>
	</section>

	<section class="actions">
		<a
			class="brand"
			href="/getting-started"
		>
			<span>Get Started</span>

			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M5 12h14" />
				<path d="m12 5 7 7-7 7" />
			</svg>
		</a>

		<a
			href="/demo"
			target="_blank"
			>Live Demo</a
		>
	</section>

	<section class="features">
		<div class="feature">
			<p class="title">Accurate by design</p>
			<p class="details">Analyze final source maps to capture tree-shaking and minification, not pre-build estimates.</p>
		</div>

		<div class="feature">
			<p class="title">Practical insights</p>
			<p class="details">Trace dependencies, compare compressed sizes, and pinpoint heavy files in seconds.</p>
		</div>

		<div class="feature">
			<p class="title">Ship anywhere</p>
			<p class="details">Generate interactive HTML reports for deep dives or JSON for automation and CI checks.</p>
		</div>
	</section>

	<hr style="margin: 48px 0" />

	<div class="works-with">
		<h2>Supported technologies</h2>

		<p>
			Sonda works seamlessly with these technologies, but is not officially associated, sponsored, or endorsed by them.
		</p>

		<div class="grid">
			<a href="/bundlers/vite.html">
				<img
					src="/logos/vite.svg"
					alt="Vite logo"
				/>
			</a>

			<a href="/bundlers/rollup.html">
				<img
					src="/logos/rollup.svg"
					alt="Rollup logo"
				/>
			</a>

			<a href="bundlers/esbuild.html">
				<img
					src="/logos/esbuild.svg"
					alt="esbuild logo"
				/>
			</a>

			<a href="bundlers/webpack.html">
				<img
					src="/logos/webpack.svg"
					alt="webpack logo"
				/>
			</a>

			<a href="bundlers/rolldown.html">
				<img
					src="/logos/rolldown.svg"
					alt="Rolldown logo"
				/>
			</a>

			<a href="bundlers/rspack.html">
				<img
					src="/logos/rspack.svg"
					alt="Rspack logo"
				/>
			</a>
		</div>
	</div>

	<div class="works-with">
		<div class="grid">
			<a href="frameworks/nextjs.html">
				<div
					class="logo logo-nextjs"
					role="img"
					aria-label="Next.js logo"
				></div>
			</a>

			<a href="frameworks/nuxt.html">
				<div
					class="logo logo-nuxt"
					role="img"
					aria-label="Nuxt logo"
				></div>
			</a>

			<a href="frameworks/astro.html">
				<div
					class="logo logo-astro"
					role="img"
					aria-label="Astro logo"
				></div>
			</a>

			<a href="frameworks/sveltekit.html">
				<div
					class="logo logo-svelte"
					role="img"
					aria-label="Svelte logo"
				></div>
			</a>

			<a href="frameworks/angular-cli.html">
				<div
					class="logo logo-angular"
					role="img"
					aria-label="Angular logo"
				></div>
			</a>
		</div>
	</div>
</template>

<style scoped>
section {
	padding: 16px;
}

#hero {
	padding-top: 96px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	.tagline {
		max-width: 960px;
		margin: 0px auto;
		font-size: 76px;
		line-height: 1.1;
		font-weight: 900;
		letter-spacing: -1.5px;
		text-align: center;
	}

	.dark .tagline {
		color: var(--vt-c-text-2);
	}

	.tagline .accent {
		color: #fbbf24;
	}

	.description {
		max-width: 960px;
		line-height: 1.5;
		color: var(--vp-c-text-2);
		font-size: 22px;
		text-align: center;
	}

	@media (max-width: 960px) {
		.tagline {
			font-size: 64px;
			letter-spacing: -0.5px;
		}
		.description {
			font-size: 18px;
			margin-bottom: 48px;
		}
	}

	@media (max-width: 794px) {
		.tagline {
			font-size: 48px;
			letter-spacing: -0.5px;
		}
		.actions .security {
			margin-top: 18px;
		}
	}

	@media (max-width: 576px) {
		#hero {
			padding: 56px 32px;
		}
		.description {
			font-size: 16px;
			margin: 18px 0 30px;
		}
	}

	@media (max-width: 370px) {
		.tagline {
			font-size: 36px;
		}
	}
}

.actions {
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	justify-content: center;

	a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 24px;
		border-radius: 8px;
		text-decoration: none;
		font-size: 16px;
		border-color: var(--vp-button-alt-border);
		color: var(--vp-button-alt-text);
		background-color: var(--vp-button-alt-bg);

		&:hover {
			border-color: var(--vp-button-alt-hover-border);
			color: var(--vp-button-alt-hover-text);
			background-color: var(--vp-button-alt-hover-bg);
		}

		&.brand {
			border-color: var(--vp-button-brand-border);
			color: var(--vp-button-brand-text);
			background-color: var(--vp-button-brand-bg);

			&:hover {
				border-color: var(--vp-button-brand-hover-border);
				color: var(--vp-button-brand-hover-text);
				background-color: var(--vp-button-brand-hover-bg);
			}
		}
	}
}

.features {
	margin-top: 48px;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: 24px;

	.feature {
		display: block;
		border-radius: 8px;
		height: 100%;
		padding: 36px;

		.title {
			margin: 0;
			line-height: 24px;
			font-size: 16px;
			font-weight: 600;
			overflow-wrap: break-word;
		}

		.details {
			margin: 0;
			flex-grow: 1;
			padding-top: 8px;
			line-height: 24px;
			font-size: 14px;
			font-weight: 500;
			color: var(--vp-c-text-2);
			overflow-wrap: break-word;
		}
	}
}

.works-with {
	h2 {
		border: 0;
		text-align: center;
		font-size: 32px;
	}

	p {
		line-height: 1.5;
		color: var(--vp-c-text-2);
		font-size: 16px;
		text-align: center;
	}

	.grid {
		margin-top: 36px;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 24px;

		a {
			display: flex;
			justify-content: center;
			padding: 24px;
			height: 128px;
			border: 0;
			border-radius: 8px;
			background-color: var(--vp-c-bg-soft);
			filter: grayscale(1);
			transition: all 0.25s ease;

			a {
				display: block;
				width: 100%;
				height: 100%;
			}

			img {
				border: 0;
			}

			.logo {
				display: block;
				width: 100%;
				height: 100%;
				border: 0;
				background-size: contain;
				background-position: center;
				background-repeat: no-repeat;
			}

			&:hover {
				background-color: color-mix(in srgb, var(--vp-c-bg-soft) 97%, black);
				filter: grayscale(0);
			}
		}
	}
}

/* Next.js logo */
.logo-nextjs {
	background-image: url('/logos/nextjs.svg');
}

.dark .logo-nextjs {
	background-image: url('/logos/nextjs-dark.svg');
}

/* Nuxt logo */
.logo-nuxt {
	background-image: url('/logos/nuxt.svg');
}

.dark .logo-nuxt {
	background-image: url('/logos/nuxt-dark.svg');
}

/* Astro logo */
.logo-astro {
	background-image: url('/logos/astro.svg');
}
.dark .logo-astro {
	background-image: url('/logos/astro-dark.svg');
}

/* Svelte logo */
.logo-svelte {
	background-image: url('/logos/svelte.svg');
}
.dark .logo-svelte {
	background-image: url('/logos/svelte-dark.svg');
}

/* Angular logo */
.logo-angular {
	background-image: url('/logos/angular.svg');
}
.dark .logo-angular {
	background-image: url('/logos/angular-dark.svg');
}
</style>
