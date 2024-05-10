<script context="module" lang="ts">
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
  import { tick } from "svelte";
  import { crossfade, fade } from "svelte/transition";
  import { sleep } from "../sleep";
 
  const item = $derived(NOW.$?.data.items.find(item => item.id === id) ?? null);
  const days = $derived(HISTORIC().$?.data.items.find(item => item.id === id)?.days ?? null);

  let range: Range = $state("7D");
 
  // let setting_range = $state(false);

  const set_range = async (v: Range) => {
    // setting_range = true;
    // await tick();
    await document_transition(async () => {
      range = v
    })
    // setting_range = false;
  }


  // fix quirk in view transition
  let show_selection = $state(false);
  
  $effect(() => {
    sleep(10).then(() => show_selection = true);
  })


  // const [selection_enter, selection_leave] = crossfade({
  //   duration: 200,
  //   fallback: (node) => fade(node, { duration: 200 }),
  // })
</script>

<style>
  .screen {
    padding: 1rem 0.75rem;
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
    width: min(100%, var(--screen-max-width));
    align-self: center;
    
    transition: background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
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
  }

  .chart {
    margin-top: 1rem;
    position: relative;
    height: 300px;
  }
</style>

<div class="screen">
  
  <div class="box" style:view-transition-name="item-box--{item?.id}">
    <div class="summary" >
      {#if item != null}
        <ItemSummary {item} />
      {/if}
    </div>

    <div class="chart-and-ranges">

      <div class="ranges">
        {#each ranges as r (r)}
          {@const selected = range === r}
          <button class="range-btn" class:selected onclick={() => set_range(r)}>
            {r}
            {#if show_selection && selected}
              <!-- <span class="selection" style:view-transition-name={setting_range ? `item-range-selection--${item?.id}` : undefined}></span> -->
              <!-- <span class="selection" in:selection_enter={{ key: null }} out:selection_leave={{ key: null }} ></span> -->
              <span class="selection" style:view-transition-name="item-selection-selection--{item?.id}"></span>
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