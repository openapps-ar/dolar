<script context="module" lang="ts">
  export type Item = Exclude<typeof NOW.$, null>["data"]["items"][number];
  export type Days = Exclude<ReturnType<typeof HISTORIC>["$"], null>["data"]["items"][number]["days"]
  export type Range = "7D" | "1M" | "3M" | "6M" | "1A" | "5A" | "10A";
</script>

<script lang="ts">
  import { ApexOptions } from "apexcharts";

  const {
    item,
    days,
    range,
    height = 300,
  }: {
    item: Item
    days: Days
    range: Range
    height?: number,
  } = $props();

  import type { HISTORIC, NOW } from "../client/client.svelte";
  import { chart } from "../apexcharts/apexcharts";
  
  const DAY = 1000 * 60 * 60 * 24;
  const MONTH = DAY * 30;
  const YEAR = DAY * 365;

  const limits: Record<Range, number> = {
    "7D": DAY * 7,
    "1M": MONTH,
    "3M": MONTH * 3,
    "6M": MONTH * 6,
    "1A": YEAR,
    "5A": YEAR * 5,
    "10A": YEAR * 10,
  }

  const p = (s: string | number, n = 2, c = "0") => String(s).padStart(n, c);

  const filter_days = (days: Days, range: Range): Days => {
    const limit = new Date(Date.now() - limits[range]);
    const limit_date_string = `${limit.getFullYear()}/${p(limit.getMonth() + 1)}/${p(limit.getDate())}`
    const filter = <T extends { 0: string }>(items: T[]): T[] => {
      // items are always sorted in date ascending order
      // findLastIndex is better than findIndex because the items are sorted in ascending order
      // >= can campare strings too
      const index_helper = items.findLastIndex(item => item[0] < limit_date_string);
      return items.slice(index_helper == null ? undefined : index_helper + 1);
    }
    if(days.kind === "buy-sell") {
      return {
        kind: days.kind,
        items: filter(days.items),
      }
    } else {
      return {
        kind: days.kind,
        items: filter(days.items),
      }
    }
  }

  const re = /([0-9]{4})\/([0-9]{2})\/([0-9]{2})/
  const parse_date = (src: string): Date => {
    const [_, yyyy, mm, dd] = src.match(re) ?? [];
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }

  const format_date = (d: Date): string => {
    return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`
  }

  const fmt = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const format_value = (v: number) => `$ ${fmt.format(v)}`;

  let visible_days = $derived(filter_days(days, range));

  let data = $derived.by(() => {
    const dates: Date[] = [];
    const values: number[] = [];
    if(visible_days.kind === "buy-sell") {
      for(const [d, buy, sell] of visible_days.items) {
        dates.push(parse_date(d));
        // TODO: use sell or buy? probably sell
        values.push(sell);
      }
    } else {
      for(const [d, value] of visible_days.items) {
        dates.push(parse_date(d));
        values.push(value);
      }
    }

    return { dates, values }
  });

  const max = $derived(Math.max(...data.values));
  const min = $derived(Math.min(...data.values));

  const variation_kind = $derived.by(() => {
    const first = data.values[0];
    const last = data.values.at(-1);
    if(first == null || last == null || first == last) return "equal";
    else if(first > last) return "down";
    else return "up";
  });

  // --color-vari-up: #0fa54f;
  // --color-vari-down: #e54747;
  // --color-vari-equal: #194781;

  const variation_colors = {
    up: "#0fa54f",
    down: "#e54747",
    equal: "#0074D9",
  }

  const color = $derived(variation_colors[variation_kind])

  // const colors = [
  //   // PURPLE
  //   "rgba(119, 93, 208, 0.85)",
  //   // BLUE
  //   "rgba(0, 143, 251, 0.85)",
  //   // GREEN
  //   "rgba(0, 227, 150, 0.85)",
  // ]

  const get_options: () => (ApexOptions & { hide_series?: string[] }) = () => ({
    
    colors: [color],
          
    series: [ { name: "Valor", data: data.values } ],
    
    // markers: {
    //   showNullDataPoints: false,
    //   size: 2,
    //   hover: {
    //     size: 4,
    //   }
    // },

    chart: {
      toolbar: { show: false },
      animations: { enabled: false },
      fontFamily: "inherit",
      height,
      type: "area",
      zoom: { enabled: false },
      sparkline: { enabled: true },
    },
    

    dataLabels: { enabled: false },
    
    legend: { show: false  },

    stroke: { curve: "smooth" },
    
    // xaxis: { 
    //   type: "category",
    //   categories: data.dates.map(date => format_date(date)),
    //   labels: {
    //     formatter: (v: string) => {
    //       console.log(v);
    //       return new Date(v).toLocaleDateString(undefined, {
    //         year: "numeric",
    //         day: "2-digit",
    //         month: "2-digit",
    //       })
    //     }
    //   }
    // },

    yaxis: {
      min: Math.floor(min - (max - min) * 0.1),
      max: Math.ceil(max + (max - min) * 0.1),
      title: {
        text: "Valor",
        style: {
        fontSize: "1rem",
        fontWeight: "400",
        }
      },
      labels: {
        formatter: format_value,
      } 
    },
    
    tooltip: {
      enabled: false,
      x: {
        formatter: format_value,
      },
    }
  });

  const options = $derived.by(get_options);

  $inspect({ data, options });
</script>

<div class="chart" style:height="{height}px" use:chart={options}></div>