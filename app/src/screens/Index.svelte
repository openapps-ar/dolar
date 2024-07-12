<script lang="ts">
  const {
    items,
    onitemclick,
  }: {
    items: Item[]
    onitemclick: (id: string) => void
  } = $props();

  import { screen_enter, screen_leave } from "../transitions";
  import type { NOW } from '../client/client.svelte';
  import ItemSummary from '../components/ItemSummary.svelte';
  import { getContext, onMount } from "svelte";
  import { mdiTabUnselected } from "@mdi/js";
  import { shareable } from "../share";
  import Shareable from "../Shareable.svelte";

  type Item = Exclude<typeof NOW.$, null>["data"]["items"][number];
</script>

<style>
  .screen {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .share-screen {
    display: flex;
    flex-direction: column;
    align-self: stretch;
    align-items: stretch;
  }

  .items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(306px, 100% - 3rem), 1fr));
    gap: 0.75rem;
    padding: 1rem 0.75rem;
    align-self: center;
    min-width: 0;
    width: min(100%, var(--screen-max-width));
  }

  .summary {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: var(--color-box-bg);
    box-shadow: var(--shadow-item);
    border-radius: 0.5rem;
    --background: var(--color-box-bg);
    
    transition:
      background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      border-top-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      box-shadow var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
  }
</style>

{#snippet list()}
  <div class="items">
    {#each items as item (item.id)}
      <div class="summary" style:view-transition-name="item-box--{item.id}">  
        <ItemSummary {item} kind="index" onclick={() => onitemclick(item.id)} />
      </div>
    {:else}
      <div class="summary placeholder">  
        <ItemSummary placeholder />
      </div>
    {/each}
  </div>
{/snippet}

<div class="screen">
  {@render list()}
</div>

{#if items.length !== 0}
  <Shareable>
    <div class="share-screen">
      <div class="items">
        {#each items as item (item.id)}
          <div class="summary">  
            <ItemSummary {item} kind="index" />
          </div>
        {/each}
      </div>
    </div>
  </Shareable>
{/if}

