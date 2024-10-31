<script module lang="ts">
  export type Item = Exclude<typeof NOW.$, null>["data"]["items"][number];
  export type Days = Exclude<ReturnType<typeof HISTORIC>["$"], null>["data"]["items"][number]["days"]
  export type Range = "7D" | "1M" | "3M" | "6M" | "1A" | "5A" | "10A" | "MAX";
  export const ranges: Range[] = ["7D", "1M", "3M", "6M", "1A", "5A", "10A", "MAX"];
</script>

<script lang="ts">
  const {
    item,
    days,
    ranges,
    range,
  }: {
    item: Item
    days: Days
    ranges: Record<Range, number>,
    range: Range
  } = $props();

  import type { HISTORIC, NOW } from "../client/client.svelte";
  // @ts-ignore
  import * as Pancake from '@sveltejs/pancake';
  import { SvelteMap } from "svelte/reactivity";
  import { fade } from "svelte/transition";

  const DAY = 1000 * 60 * 60 * 24;
  const MONTH = DAY * 30;
  const YEAR = DAY * 365;

  const p = (s: string | number, n = 2, c = "0") => String(s).padStart(n, c);

  const filter_days = (days: Days, range: Range): Days => {
    if(range === "7D") {
      return {
        kind: days.kind,
        items: days.items.slice(-7),
      } as Days
    } else if(range === "MAX") {
      return { ...days }
    }

    const limit = new Date(Date.now() - ranges[range]);
    const limit_date_string = `${limit.getFullYear()}/${p(limit.getMonth() + 1)}/${p(limit.getDate())}`
    const filter = <T extends { 0: string }>(items: T[]): T[] => {
      // items are always sorted in date ascending order
      // findLastIndex is better than findIndex because the items are sorted in ascending order
      // >= can campare strings too
      const index_helper = items.findLastIndex(item => item[0] < limit_date_string);
      return items.slice(index_helper == null ? undefined : index_helper + 1);
    }

    return {
      kind: days.kind,
      // @ts-expect-error
      items: filter(days.items),
    } as Days
  }

  const re = /([0-9]{4})\/([0-9]{2})\/([0-9]{2})/
  const parse_date = (src: string): Date => {
    const [_, yyyy, mm, dd] = src.match(re) ?? [];
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }

  const visible_days = $derived(filter_days(days, range));

  const points = $derived.by(() => {
    const points: { x: number, y: number }[] = [];
    let i = 0;
    if(visible_days.kind === "buy-sell") {
      for(const [d, buy, sell] of visible_days.items) {
        points.push({ x: i++, y: sell })
      }
    } else {
      for(const [d, value] of visible_days.items) {
        points.push({ x: i++, y: value })
      }
    }

    return points
  });

  const max = $derived(Math.max(...points.map(p => p.y)));
  const min = $derived(Math.min(...points.map(p => p.y)));

  const x1 = 0;
  const x2 = $derived(points.length - 1);
  // const y1 = $derived(min);
  // const y2 = $derived(max);
  const y1 = $derived(Math.max(0, Math.floor(min - (max - min) * 0.1)));
  const y2 = $derived(Math.ceil(max + (max - min) * 0.1));

  const variation_kind = $derived.by(() => {
    const first = points[0]?.y;
    const last = points.at(-1)?.y;
    if(first == null || last == null || first === last) return "equal";
    else if(first > last) return "down";
    else return "up";
  });

  const fmt2 = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const fmt0 = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  const format_y_label = (v: number) => {
    return v % 1 === 0 ? fmt0.format(v) : fmt2.format(v);
  }

  const format_x_label = (i: number) => {
    const item = visible_days.items[i];
    if(item == null) return "";
    const date = parse_date(item[0]);
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const yy = String(date.getFullYear()).slice(-2);
    return (ranges[range] <= ranges["1A"]) ? `${d}/${m}` : `${m}/${yy}`;
  }

  let rect: { width: number } = $state({ width: 0 });

  const y_label_widths = $state(new SvelteMap<number, number>());
  const y_label_max_width = $derived(Math.max(10, ...y_label_widths.values()));
  
  let _id = 0;
  const y_label = (node: HTMLElement, params = {}) => {
    const id = _id++;
    const obs = new ResizeObserver(() => y_label_widths.set(id, node.clientWidth));
    obs.observe(node);
    return {
      destroy: () =>{
        obs.disconnect();
        y_label_widths.delete(id)
      } 
    }
  }

  let touched_day: typeof visible_days.items[number] | null = $state(null);
  $inspect({ touched_day });

  const onpointerdown = (event: PointerEvent & { currentTarget: HTMLElement }) => {
    let node = event.currentTarget;

    const pointerup = () => { 
      remove();
    }

    const pointercancel = () => {
      remove();
    }

    const pointermove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = Math.min(0, Math.max(rect.width, event.x - rect.left));
      const x_percent = x / rect.width;
      const x_index = Math.floor(x_percent * visible_days.items.length);
      touched_day = visible_days.items[x_index];
    }

    let capture = { capture: true };

    document.addEventListener("pointermove", pointermove, capture);
    document.addEventListener("pointerup", pointerup, capture);
    document.addEventListener("pointercancel", pointercancel, capture);
  
    const remove = () => {
      document.removeEventListener("pointermove", pointermove, capture);
      document.removeEventListener("pointerup", pointerup, capture);
      document.removeEventListener("pointercancel", pointercancel, capture);
    }
  }
</script>

<div
  class="chart"
  style:--color="var(--color-chart-{variation_kind})"
  style:--y-label-width="{y_label_max_width}px"
  bind:contentRect={rect}
>
  <div class="touch-out">
    <div class="touch" onpointerdown={onpointerdown}></div>
  </div>

  <Pancake.Chart
    {x1}
    {x2}
    {y1}
    {y2}
  >
    <Pancake.Box x={x1} y2={y2}>
      <div class="axes"></div>
    </Pancake.Box>

    <Pancake.Grid vertical count={rect.width ? Math.max(3, Math.ceil(rect.width / 50)) : 3} let:value>
      <div class="grid-line vertical"></div>
      <span class="x label">{format_x_label(value)}</span>
    </Pancake.Grid>

    <Pancake.Grid horizontal count={5} let:value>
      <div class="grid-line horizontal"></div>
      <span class="y label" use:y_label>{format_y_label(value)}</span>
    </Pancake.Grid>

    <Pancake.Svg clip>
      <Pancake.SvgArea data={points} let:d>
        <path class="area" {d} />
      </Pancake.SvgArea>
      <Pancake.SvgLine data={points} let:d>
        <path class="line" in:fade={{ duration: 400 }} {d} />
      </Pancake.SvgLine>
    </Pancake.Svg>

  </Pancake.Chart>
</div>


<style>
  .chart {
    position: relative;
    height: 100%;
    padding-block-start: 1.5rem;
    padding-inline-end: 1.5em;
    padding-block-end: 2.65rem;
    padding-inline-start: calc(var(--y-label-width) + 1.5rem);
    box-sizing: border-box;
    overflow: hidden;
  }

  .touch-out {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    padding: inherit;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }

  .touch {
    flex: 1;
  }

  /* .chart :global(svg) {
    border-inline-start: rgba(0,0,0,0.1) 2px solid;  
    border-block-end: rgba(0,0,0,0.1) 2px solid;  
  } */

  .axes {
    width: 100%;
    height: 100%;
  }

  .grid-line {
    background-color: var(--color-chart-grid-line);
    
    &.horizontal {
      width: calc(100% + 1.5rem);
      margin-inline-start: -0.75rem;
      height: 1px;
    }

    &.vertical {
      height: calc(100% + 1.5rem);
      margin-block-start: -0.75rem;
      width: 1px;
    }
  }

  .y.label {
    position: absolute;
    text-align: right;
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1em;
    color: var(--color-chart-label);
    transform: translateX(-100%) translateY(-58%);
    left: -1rem;
  }

  .x.label {
    position: absolute;
    width: 4em;
    left: -2em;
    bottom: -2rem;
    text-align: center;
    font-weight: 400;
    color: var(--color-chart-label);
    font-size: 0.75rem;
  }

  .line {
    fill: none;
    stroke: var(--color);
    stroke-width: 2px;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .area {
    fill: var(--color);
    fill-opacity: 0.2;
  }
</style>
