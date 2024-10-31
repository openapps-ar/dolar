<script module lang="ts">
  let show_copied: string | null = $state(null);
  let show_copied_timer: NodeJS.Timeout | undefined = undefined;
</script>

<script lang="ts">
  type Props = 
    | {
      item: NowItem,
      kind: "index" | "item",
      copy?: boolean,
      onclick?: () => void
      placeholder?: false,
    }
    | {
      item?: undefined
      kind?: undefined
      copy?: undefined
      onclick?: undefined
      placeholder: true
    };

  const { item, kind, copy = false, onclick }: Props = $props();

  import type { NowItem } from "../client/client.svelte";
  import { mdiArrowDown, mdiArrowUp, mdiEqual } from "@mdi/js";
  import Icon from "../Icon.svelte";
  import { ripple } from "../ripple";
  import { fly } from "svelte/transition";
  import Anchor from "../portal/Anchor.svelte";
  import copy_to_clipboard from "copy-to-clipboard";
  import { mods } from "../capacitor/mods";
  const { haptics: { Haptics = null } = {} } = mods; 

  const format_price = (n: number, decimals = 2) => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n);
  }

  const p = (s: string | number, n = 2, c = "0") => String(s).padStart(2, c) 
  const format_date = (date: string | Date) => {
    const d = new Date(date);
    return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  const format_variation = (vari: number) => {
    const percent = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(vari * 100));
    
    return `${percent}%`
  }

  const get_decimals = (...args: number[]) => {
    if(args.length === 0) return 0;

    const decs = args.map(n => {
      if(n == null) return 0;
      if(n % 1 === 0) return 0;
      else return 2;
    })

    return Math.max(...decs);
  }

  const price_btn_out = (node: HTMLElement, id: string) => {
    if(show_copied === id) show_copied =  null;    
    return { duration: 0 }
  }
</script>

<style>
  * {
    line-height: 1.25em;
  }

  .item {
    --vertical-gap: 0.1rem;
    padding: 0.75rem 0.9rem 0.8rem 0.9rem;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    background: var(--background);
    border-radius: inherit;
    
    transition: 
      background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      filter 200ms linear;      
    
    /*
    &.clickable {

      &:hover {
        filter: var(--color-item-hover-filter)
      }

      &:active {
        filter: var(--color-item-active-filter);
      }
    }
    */

    &.placeholder {
      pointer-events: none;  
    }

    .start {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: 1;
      gap: var(--vertical-gap);
    }

    .name {
      text-align: center;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-item-title);
      
      transition: color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
    }

    .date {
      font-size: 0.8rem;
      white-space: nowrap;
      font-weight: 400;
      color: var(--color-item-date);
      transition: color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
    }

    .end {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--vertical-gap);
    }
  }

  .variation {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 0.8rem;
    
    &[data-kind=up] {
      color: var(--color-up);
    }

    &[data-kind=down] {
      color: var(--color-down);
    }

    &[data-kind=equal] {
      color: var(--color-equal);
    }
  }

  .variation-kind {
    display: flex;
    align-items: center;
    justify-content: center;
  }


  .buy-sell-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-inline-start: auto;
  }

  .price-sep {
    color: var(--color-item-title);
    transition: color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
    margin: 0 0.3rem 0 0.45rem;
    font-size: 0.7rem;
    line-height: 1.1rem;
    opacity: 0.7;
  }

  .price-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .price-out {
    position: relative;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }

  .price {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    font-size: 1.25rem;
    font-weight: 600;
    border-radius: 0.25rem;
    color: var(--color-item-price);
    transition: color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
  }

  button.price {
    cursor: pointer;
  }

  .sign {
    font-size: 0.9rem;
    font-weight: 500;
    margin-inline-end: 0.15rem;
    color: var(--color-item-price-sign);
    opacity: var(--color-item-price-sign-opacity);
    
    transition:
      color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      opacity var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
  }

  .copied {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translateX(-50%);
  }

  .copied-text {
    background: var(--color-copied-bg);
    color: var(--color-copied-text);
    font-weight: 600;
    font-size: 0.8rem;
    border-radius: 0.25rem;
    padding: 0.5rem;

    transition:
      background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
  }

  .copied-arrow {
    width: 0;
    height: 0;
    border-left: 0.5rem solid transparent;
    border-right: 0.5rem solid transparent;
    border-top: 0.5rem solid var(--color-copied-bg);
    margin-block-start: -1px;

    transition: border-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
  }
</style>

{#snippet content({ item }: { item: NowItem })}
  <!-- this (item ?? {}) prevents a bug in svelte where the variable item is null, even if it's statically checked to be not null -->
  {@const { id, name, date, ref, buy, sell, variation, variation_kind } = item}
  <!-- {@const { id, name, date, ref, buy, sell, variation, variation_kind } = item ?? {}} -->
  {#if id != null}
    <div class="start">
      <div class="name">{name}</div>
      <div class="date">{format_date(date)}</div>
    </div>
    <div class="end">
      <div class="buy-sell-row">
        {#if ref !=  null}
          {@render price({ id: `${id}-ref`, price: ref, decimals: get_decimals(ref)})}
        {:else}
          {#if buy != null}
            {@render price({ id: `${id}-buy`, price: buy, decimals: get_decimals(buy, sell) })} 
          {/if}
          {#if buy != null && sell != null && buy !== sell}
            <div class="price-sep">/</div>
          {/if}
          {#if buy !== sell}
            {@render price({ id: `${id}-sell`, price: sell, decimals: get_decimals(buy, sell) })}
          {/if}
        {/if}
      </div>
      <div class="variation" data-kind={variation_kind}>
        <div class="variation-kind">
          <Icon d={
              variation_kind === "up" ? mdiArrowUp :
              variation_kind === "down" ? mdiArrowDown :
              mdiEqual
            }
          />
        </div>
        <div class="variation-num">
          {format_variation(variation)}
        </div>
      </div>
    </div>
  {/if}
{/snippet}

{#if item != null}
  {#if onclick}
    <button
      class="item clickable ripple-c"
      use:ripple
      onclick={() => onclick()}
    >
      {@render content({ item })}
    </button>
  {:else}
    <div class="item">
      {@render content({ item })}
    </div>
  {/if}
{:else}
  <div class="item placeholder">
    <div class="start">
      <div class="name">&nbsp;</div>
      <div class="date">&nbsp;</div>
    </div>
    <div class="end">
      <div class="buy-sell-row">
        <div class="price-cell">
          <div class="price-out">
            <div class="price ripple-c">
              <span class="sign">&nbsp;</span>
              &nbsp;
            </div>
          </div>
        </div>
      </div>
      <div class="variation">
        <div class="variation-kind">
          <Icon d="" />
        </div>
        <div class="variation-num">
          &nbsp;
        </div>
      </div>
    </div>
  </div>
{/if}


{#snippet price({
  id,
  price,
  decimals
}: {
  id: string
  price: number
  decimals: number
})}
  {@const target = `${id}--${kind}`}
  <div class="price-cell">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="price-out">
      {#if copy}
        <button
          class="price ripple-c"
          tabindex="-1"
          use:ripple
          out:price_btn_out|global={target}
          onclick={event => {
            event.stopPropagation();
            copy_to_clipboard(price.toFixed(2));
            Haptics?.selectionStart();
            show_copied = target;
            clearTimeout(show_copied_timer);
            show_copied_timer = setTimeout(() => show_copied = null, 1500)
          }}
        >

          <span class="sign">$</span>{format_price(price, decimals)}
        </button>
      {:else}
        <div class="price">
          <span class="sign">$</span>{format_price(price, decimals)}
        </div>
      {/if}
      
      {#if copy && show_copied === target}
        <Anchor inline="center" block="start" z="var(--z-copied)">
          <div class="copied" in:fly={{ duration: 200, y: 8 }} out:fly={{ duration: 200, y: -32 }}>
            <div class="copied-text">Copiado</div>
            <div class="copied-arrow"></div>
          </div>
        </Anchor>
      {/if}
    </div>
  </div>
{/snippet}