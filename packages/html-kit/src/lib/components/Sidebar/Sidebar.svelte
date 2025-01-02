<div class={ [ 'flex bg-gray-50 border-r border-r-gray-200 text-gray-700 overflow-hidden', classes ] } { ...props }>
  <div class="flex h-full w-full flex-col">
    <div class="flex flex-col h-14">
      <a href="https://sonda.dev/" target="_blank" class="p-4 text-center text-gray-700 hover:text-gray-900">
        <svg
          width="24"
          height="24"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="inline-block"
        >
          <path d="M0 0h512v512H0V0Z" fill="#FACC15"/>
          <path d="m264.536 203.704-41.984 89.6-21.504-9.728c-20.139-9.216-35.669-21.504-46.592-36.864-10.923-15.36-16.384-37.717-16.384-67.072 0-37.547 9.728-65.536 29.184-83.968 19.797-18.773 52.395-28.33 97.792-28.672 18.773 0 35.84.853 51.2 2.56s27.648 3.584 36.864 5.632l13.824 2.56-10.24 82.432-12.8-1.536c-8.192-1.024-18.432-1.877-30.72-2.56-12.288-1.024-24.235-1.536-35.84-1.536-12.288 0-21.675 1.877-28.16 5.632-6.144 3.413-9.216 10.069-9.216 19.968 0 5.461 2.219 9.899 6.656 13.312 4.437 3.413 10.411 6.827 17.92 10.24Zm-18.432 100.864 42.496-90.624 22.016 9.728c23.211 10.24 40.107 23.04 50.688 38.4 10.581 15.019 15.872 36.523 15.872 64.512 0 37.888-9.899 67.072-29.696 87.552-19.797 20.48-52.395 30.891-97.792 31.232-22.528 0-43.52-1.536-62.976-4.608-19.456-2.731-36.693-5.973-51.712-9.728l10.24-82.432 12.288 2.048c8.533 1.365 19.797 2.731 33.792 4.096 13.995 1.365 29.355 2.048 46.08 2.048 12.971 0 22.699-1.877 29.184-5.632 6.485-3.755 9.728-9.899 9.728-18.432 0-5.803-1.536-10.411-4.608-13.824-3.072-3.413-8.533-6.827-16.384-10.24l-9.216-4.096Z" fill="#000"/>
        </svg>

        <span class="font-bold max-sm:hidden">Sonda</span>
      </a>
    </div>

    <div class="flex-min-h-0 flex-1 flex-col p-2">
      <!-- <div class="mt-4">
        <Button variant="white" align="start">
        <Search size={ 18 } class="-mt-1/2 mr-2 text-gray-400" />

          Search
        </Button>
      </div> -->

      <div class="mt-4 flex flex-col gap-2">
        <Button
          element="link"
          variant="ghost"
          align="start"
          full={ true }
          href="#/"
        >
          <LayoutGrid
            size={ 18 }
            class="flex-shrink-0 text-gray--600 pointer-events-none"
          />

          <span class="truncate pointer-events-none">Home</span>
        </Button>

        <div>
          <Button
            element="link"
            variant="ghost"
            align="start"
            full={ true }
            href="#/assets"
          >
            <Boxes
              size={ 18 }
              class="flex-shrink-0 text-gray--600 pointer-events-none"
            />

            <span class="truncate pointer-events-none">Assets</span>
          </Button>

          <div class="ml-6 mt-2">
            <List items={ [ tree ] } />
          </div>
        </div>

        <Button
          element="link"
          variant="ghost"
          align="start"
          full={ true }
          href="#/inputs"
        >
          <FileInput
            size={ 18 }
            class="flex-shrink-0 text-gray--600 pointer-events-none"
          />

          <span class="truncate pointer-events-none">Inputs</span>
        </Button>

        <Button
          element="link"
          variant="ghost"
          align="start"
          full={ true }
          href="#/warnings"
        >
          <CircleAlert
            size={ 18 }
            class="flex-shrink-0 text-gray--600 pointer-events-none"
          />

          <span class="truncate pointer-events-none">Warnings</span>
        </Button>

        <Button
          element="link"
          variant="ghost"
          align="start"
          full={ true }
          href="#/dependencies"
        >
          <Share2
            size={ 18 }
            class="flex-shrink-0 text-gray--600 pointer-events-none"
          />

          <span class="truncate pointer-events-none">Dependencies</span>
        </Button>
      </div>
    </div>
  </div>
</div>

<script lang="ts">
import { LayoutGrid, Boxes, FileInput, CircleAlert, Share2 } from 'lucide-svelte';
import type { HTMLAttributes } from 'svelte/elements';
import List from '$lib/components/Sidebar/List.svelte';
import Button from '$lib/components/Button/Button.svelte';
import { store } from '$lib/store.svelte';
import { getTrie } from '$lib/helpers/OutputTrie';

const { class: classes, ...props }: HTMLAttributes<HTMLDivElement> = $props();

const tree = getTrie( Object.keys( store.report.outputs ) );
</script>
