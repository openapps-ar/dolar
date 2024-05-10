<script context="module">
  let show_copied: string | null = $state(null);
  let show_copied_timer: NodeJS.Timeout | undefined = undefined;
</script>

<script lang="ts">
  type Props = 
    | {
      item: NowItem,
      placeholder?: false,
      onclick?: () => void
    }
    | {
      item?: undefined
      placeholder: true
      onclick?: undefined
    };

  const {
    item,
    placeholder = undefined,
    onclick,
  }: Props = $props();

  import type { NowItem } from '../client/client.svelte';
  import { mdiArrowDown, mdiArrowUp, mdiEqual } from '@mdi/js';
  import Icon from '../Icon.svelte';
  import copy from "copy-to-clipboard";
  import { ripple } from '../ripple';
  import { fly } from 'svelte/transition';

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
</script>

<style>
  * {
    line-height: 1.25em;
  }

  .item {
    padding: 0 0.5rem 0 0.5rem;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    background: var(--background);
    border-radius: inherit;
    
    transition: background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
    
    &.placeholder {
      pointer-events: none;  
    }

    .start {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: 1;
      padding: 0.75rem 0.5rem;
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
      padding: .25rem .5rem 0.75rem 0.5rem;
      margin-inline-end: -0.5rem;
    }
  }

  .variation {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 0.8rem;
    margin-top: -0.4rem;
    padding: 0 0.5rem;

    &[data-kind=up] {
      color: var(--color-vari-up);
    }

    &[data-kind=down] {
      color: var(--color-vari-down);
    }

    &[data-kind=equal] {
      color: var(--color-vari-equal);
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

  .buy-sell-space {
    color: var(--color-item-title)
  }

  .price-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
  }

  .price-out {
    position: relative;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }

  .price {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    font-size: 1.25rem;
    font-weight: 600;
    border-radius: 0.25rem;
    padding: 0.25rem 0.6rem;
    margin: -0.25rem -0.6rem;
    color: var(--color-item-price);
    cursor: pointer;

    transition: color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
  }

  .price-copied-anchor {
    position: absolute;
    z-index: var(--z-copied);
    top: -0.35rem;
    left: 50%;
    width: 0;
    height: 0;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: center;
  }

  .price-copied {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .price-copied-text {
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

  .price-copied-arrow {
    width: 0;
    height: 0;
    border-left: 0.5rem solid transparent;
    border-right: 0.5rem solid transparent;
    border-top: 0.5rem solid var(--color-copied-bg);
    margin-block-start: -1px;

    transition: border-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
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
</style>

{#if item}
  {@const { id, name, date, ref, buy, sell, variation, variation_kind } = item}
  <button
    class="item"
    style:view-transition-name="summary--{id}"
    onclick={() => onclick?.()}
  >
    <div class="start">
      <div class="name" style:view-transition-name="summary-name--{id}">{name}</div>
      <div class="date" style:view-transition-name="summary-date--{id}">{format_date(date)}</div>
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
            <div class="buy-sell-space" style:view-transition-name="summary-price-sep--{id}">/</div>
          {/if}
          {#if buy !== sell}
            {@render price({ id: `${id}-sell`, price: sell, decimals: get_decimals(buy, sell) })}
          {/if}
        {/if}
      </div>
      <div class="variation" data-kind={variation_kind}>
        <div class="variation-kind" style:view-transition-name="summary-variation-kind--{id}">
          <Icon d={
              variation_kind === "up" ? mdiArrowUp :
              variation_kind === "down" ? mdiArrowDown :
              mdiEqual
            }
          />
        </div>
        <div class="variation-num" style:view-transition-name="summary-variation-num--{id}">
          {format_variation(variation)}
        </div>
      </div>
    </div>
  </button>
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
  <div class="price-cell">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="price-out">
      <button
        class="price ripple-c"
        tabindex="-1"
        use:ripple
        onclick={event => {
          event.stopPropagation();
          copy(price.toFixed(2));
          show_copied = id;
          clearTimeout(show_copied_timer);
          show_copied_timer = setTimeout(() => show_copied = null, 1500)
        }}
        style:view-transition-name="summary-price--{id}"
      >
        <span class="sign" style:view-transition-name="summary-price-sign--{id}">$</span>{format_price(price, decimals)}
      </button>
      {#if show_copied === id}
        <div class="price-copied-anchor" in:fly={{ duration: 200, y: 8 }} out:fly={{ duration: 200, y: -32 }}>
          <div class="price-copied" style:view-transition-name="summary-price-copied--{id}">
            <div class="price-copied-text">Copiado</div>
            <div class="price-copied-arrow"></div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/snippet}