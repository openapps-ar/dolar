<script context="module" lang="ts">
  import type { Item, Days, Range } from "../chart/PancakeDaysChart.svelte";
  export type { Item, Days, Range };
</script>

<script lang="ts">
  const {
    id,
  }: {
    id: string;
  } = $props();

  import DaysChart from "../chart/PancakeDaysChart.svelte";
  import ItemSummary from "../components/ItemSummary.svelte";
  import { HISTORIC, NOW } from "../client/client.svelte";
  import { tick } from "svelte";

  const DAY = 1000 * 60 * 60 * 24;
  const MONTH = DAY * 30;
  const YEAR = DAY * 365;

  const ranges: Record<Range, number> = {
    "7D": DAY * 7,
    "1M": MONTH,
    "3M": MONTH * 3,
    "6M": MONTH * 6,
    "1A": YEAR,
    "5A": YEAR * 5,
    "10A": YEAR * 10,
    MAX: Number.MAX_SAFE_INTEGER,
  };

  const item = $derived(
    NOW.$?.data.items.find((item) => item.id === id) ?? null
  );
  const days = $derived(
    HISTORIC().$?.data.items.find((item) => item.id === id)?.days ?? null
  );

  let range: Range = $state("7D");

  const set_range = async (v: Range) => {
    range = v;
  };

  const first_day_date = $derived.by(() => {
    if (days == null) return null;
    const d = days.items[0]?.[0];
    if (d == null) return null;
    const match = d.match(/([0-9]{4})\/([0-9]{2})\/([0-9]{2})/);
    if (match == null) return null;
    const [_, yyyy, mm, dd] = match;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  });

  const selectable_ranges = $derived.by(() => {
    if (first_day_date == null) return [];
    const now = new Date();
    const diff = now.getTime() - first_day_date.getTime();
    const keys = Object.keys(ranges) as Range[];
    const all = keys.filter((_, i) => {
      const n = i === 0 ? 0 : ranges[keys[i - 1]];
      return diff > n;
    });

    all[all.length - 1] = "MAX";
    return all;
  });

  let selection_pos: { x: number, y: number, width: number, height: number } | null = $state(null);

  const selection_anchor = (node: HTMLElement) => {
    const parent = node.parentElement?.parentElement?.getBoundingClientRect();
    if(parent == null) return; 
    tick().then(() => {
      const { left, top, width, height } = node.getBoundingClientRect();
      selection_pos = {
        x: left - parent.left,
        y: top - parent.top,
        width,
        height,
      }
    })
  }

  const prev_value = $derived(item?.prev_value ?? null)

  const brecha = $derived.by(() => {
    if(item == null) return null;
    if(item.id === "oficial") return null;
    const oficial = NOW.$?.data.items.find(item => item.id === "oficial");
    if(oficial == null) return null;
    const oficial_value = oficial.ref ?? oficial.sell ?? oficial.buy;    
    const self_value = item.ref ?? item.sell ?? item.buy;
    return self_value - oficial_value;
  })

  const variation = $derived.by(() => {
    if(prev_value == null || item == null) return null;
    const value = item.ref ?? item.sell ?? item.buy;
    return  value - prev_value;    
  })

  const f0 = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const f2 = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const format_value = (v: number) => v % 1 === 0 ? f0.format(v) : f2.format(v);

  const sign = (v: number) => v === 0 ? "" : v > 0 ? "+" : "-";
</script>

<style>
  .screen {
    padding: 1rem 0.75rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
    gap: 1rem;
  }

  .box {
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
    background-color: var(--color-box-bg);
    width: min(100%, var(--screen-max-width));
    align-self: center;

    transition: background-color var(--theme-color-transition-duration)
      var(--theme-color-transition-timing-function);
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
    display: flex;
    flex-direction: column;
  }

  .ranges {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    align-self: center;
  }

  .range-btn {
    position: relative;
    padding: 0.25rem 0.35rem;
    color: var(--color-chart-range-btn-text);
  }

  .selection {
    z-index: 1;
    position: absolute;
    pointer-events: none;
    border-radius: 0.25rem;
    background: var(--color-chart-range-selected-bg);
    --tf: ease;
    --d: 200ms;
    transition:
      left var(--d) var(--tf),
      top var(--d) var(--tf),
      width var(--d) var(--tf),
      height var(--d) var(--tf);
  }

  .selection-anchor {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: -1;
  }

  .chart {
    margin-top: 1rem;
    position: relative;
    height: 300px;
  }

  .day-summary-out {
    width: min(100%, var(--screen-max-width));
    margin: 0 auto;
  }

  .day-summary-title {
    margin: 1rem 0.75rem 0.5rem 0.75rem;
    font-weight: 400;
    font-size: 1.05rem;
    color: var(--color-title-over-background);
    transition: color var(--theme-color-transition-duration)  var(--theme-color-transition-timing-function);
  }

  .day-summary-items {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1px;
    padding: 0.5rem 0;
  }

  .day-summary-item {
    display: flex;
    flex-direction: row;
    padding: 0.9rem 1rem;
    background-color: var(--color-box-bg);
    color: var(--color-text-over-box);
    font-weight: 400;
    --border-radius: 0.5rem;
    transition:
      background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);

    &:first-child {
      border-top-left-radius: var(--border-radius);
      border-top-right-radius: var(--border-radius);
    }

    &:last-child {
      border-bottom-left-radius: var(--border-radius);
      border-bottom-right-radius: var(--border-radius);
    }
  }

  .day-summary-item-name {
    flex: 1;
  }
</style>

<div class="screen">
  <div class="box box-1" style:view-transition-name="item-box--{item?.id}">
    <div class="summary">
      {#if item != null}
        <ItemSummary {item} kind="item" />
      {/if}
    </div>

    <div class="chart-and-ranges">
      <div class="ranges">
        {#each selectable_ranges as r (r)}
          {@const selected = range === r}
          <button class="range-btn" class:selected onclick={() => set_range(r)}>
            {r}
            {#if selected}
              <span class="selection-anchor" use:selection_anchor></span>
            {/if}
          </button>
        {/each}

        {#if selection_pos != null}
          {@const { x, y, width, height } = selection_pos}
          <span
            class="selection"
            style:left="{x}px"
            style:top="{y}px"
            style:width="{width}px"
            style:height="{height}px"
          >
          </span>
        {/if}
      </div>

      <div class="chart">
        {#if item != null && days != null}
          {#key range}
            <DaysChart {item} {days} {range} {ranges} />
          {/key}
        {/if}
      </div>
    </div>
  </div>

  <div class="day-summary-out">

    {#if variation != null || prev_value != null || (item && item?.id !== "oficial")}
      <div class="day-summary-title">
        Resumen de la jornada
      </div>
      
       <div class="day-summary-items">
  
        {#if prev_value != null}
          <div class="day-summary-item">
            <div class="day-summary-item-name">Cierre anterior</div>
            <div class="day-summary-item-value">
              $ {format_value(prev_value)}
            </div>
          </div>
        {/if}

        <div class="day-summary-item">
          <div class="day-summary-item-name">Variación</div>
          <div class="day-summary-item-value">
            {sign(variation || 0)}
            $
            {format_value(Math.abs(variation!))}
          </div>
        </div>
        
        
        {#if brecha != null}
          <div class="day-summary-item">
            <div class="day-summary-item-name">Brecha</div>
            <div class="day-summary-item-value">{sign(brecha)} $ {format_value(Math.abs(brecha))}</div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
