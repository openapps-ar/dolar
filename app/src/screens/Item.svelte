<script context="module" lang="ts">
  import { crossfade, fade } from "svelte/transition";
  import type { Item, Days, Range } from "../chart/PancakeDaysChart.svelte";
  export type { Item, Days, Range };
  import { ranges } from "../chart/PancakeDaysChart.svelte"
</script>

<script lang="ts">
  const {
    id
  }: {
    id: string
  } = $props();

  import { document_transition } from "../transitions";
  import DaysChart from "../chart/PancakeDaysChart.svelte";
  import ItemSummary from "../components/ItemSummary.svelte";
  import { HISTORIC, NOW } from "../client/client.svelte";

  const item = $derived(NOW.$?.data.items.find(item => item.id === id) ?? null);
  const days = $derived(HISTORIC().$?.data.items.find(item => item.id === id)?.days ?? null);

  let range: Range = $state("7D");

  const set_range = async (v: Range) => {
    await document_transition(() => range = v)
  }
</script>

<style>
  .screen {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
  }

  .box {
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
    background-color: var(--color-box-bg);
    transition: background-color var(--theme-color-transiton-duration) var(--theme-color-transition-timing-function);
    width: min(100%, var(--screen-max-width));
    align-self: center;
  }

  .summary {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    border-radius: inherit;
    --background: var(--color-box-bg);
  }

  .chart-and-ranges {
    border-top: var(--color-item-sep) 1px solid;
    padding-top: 1rem;  
  }

  .ranges {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .range-btn {
    position: relative;
    padding: 0.25rem 0.5rem;
    color: var(--color-chart-range-btn-text);
  }

  .selection {
    z-index: 1;
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: 0.25rem;
    background: var(--color-chart-range-selected-bg);
    view-transition-name: screen-item-chart-range-selection;
  }

  .chart {
    margin-top: 1rem;
    position: relative;
    height: 300px;
  }

  .chart-in {
    position: absolute;
    inset: 0;  
  }
</style>

<div class="screen">
  
  <div class="box">
    <div class="summary">
      {#if item}
        <ItemSummary {item} />
      {/if}
    </div>

    <div class="chart-and-ranges">
      <div class="ranges">
        {#each ranges as item (item)}
          {@const selected = item === range}
          <button class="range-btn" class:selected onclick={() => set_range(item)}>
            {item}
            {#if selected}
              <span class="selection"></span>
            {/if}
          </button>
        {/each}
      </div>

      <div class="chart">
        {#if item != null && days != null}
          {#key range}
            <DaysChart {item} {days} {range} />
          {/key}
        {/if}
      </div>
    </div>
  </div>
</div>