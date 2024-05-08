<script lang="ts">
  
  const {
    onready
  }: {
    onready: () => void
  } = $props();

  const page_title = "Dolarg";
  const title = "Dolarg";

  import { mdiArrowDown, mdiArrowUp, mdiEqual, mdiMoonWaningCrescent, mdiShare, mdiThemeLightDark, mdiWeatherSunny } from "@mdi/js";
  import Icon from "./Icon.svelte";
  import { ripple } from "./ripple";
  import { COLOR_SCHEME } from "./storage.svelte";
  import { NOW, HISTORIC }  from "./client/client.svelte";
  import { click_out } from "./actions";
  import { fly } from "svelte/transition";
  import copy from "copy-to-clipboard";
  import { media } from "./media.svelte";
  import { type Snippet, onMount } from "svelte";
  import { share, canShare } from "./share";
  import { get_code_from_network } from "./entry/network";
  import { run } from "./runtime";
  import { env } from "./env/env";
  import { sleep } from "./sleep";
  import { mods } from "./capacitor/mods";
  import { replace_app } from "./code/replace";
  const { app: { App }, splash_screen: { SplashScreen } } = mods;
  
  let mounted = true;

  onMount(() => {

    if(!run.splash_screen_hide_called) {
      run.splash_screen_hide_called = true;
      SplashScreen.hide()
    }

    NOW.refresh_if_stale().finally(() => {
      
      NOW.start_interval();

      if(env.DEV || run.current_code_origin === "network") {
        sleep(2_500).then(() => {
          HISTORIC().start_interval();
        })

      } else {
        console.log("getting code from network");
      
        get_code_from_network()
          .then(async entry => {
            console.log("network code obtained");
            await replace_app(entry)
          })
          .finally(async () => {
            await sleep(2_500);
            HISTORIC().start_interval();
          });
      }
    })
    
    canShare().then(v => can_share = v).catch(() => can_share = false);

    let listener: Awaited<ReturnType<typeof App["addListener"]>>;
    App.addListener("backButton", () => {
      console.log("backButton", mounted);
      if(mounted) App.minimizeApp();
      else listener?.remove()
    }).then(list => listener = list)

    onready();

    return () => {
      mounted = false;
      NOW.stop_interval();
      HISTORIC().stop_interval();
      listener?.remove();
    }
  })

  const share_params = {
    title: title,
    text: `${title} - cotizaciones de todos los dólares de Argentina en tiempo real a un solo click`,
    url: `https://play.google.com/store/apps/details?id=ar.openapps.dolar`,
  }

  let can_share = $state(true);

  const share_app = async () => {
    await share(share_params);
  }

  // let source = $derived(SOURCE_ID.$ && Object.hasOwn(sources, SOURCE_ID.$) ? sources[SOURCE_ID.$] : source_ambito);
  let items = $derived(NOW.$?.data.items ?? []);

  // const show_items = $derived(items.filter(item => {
  //   return item.buy != null || item.sell != null;
  // }));

  // TODO: filter hidden ones
  const show_items = $derived(items);

  const get_decimals = (...args: number[]) => {
    if(args.length === 0) return 0;

    const decs = args.map(n => {
      if(n == null) return 0;
      if(n % 1 === 0) return 0;
      else return 2;
    })

    return Math.max(...decs);
  }

  const PREFERS_LIGHT = media("(prefers-color-scheme: light)");
  const media_color_scheme: "dark" | "light" = $derived(PREFERS_LIGHT.$ ? "light" : "dark");
  const color_scheme = $derived(COLOR_SCHEME.$ ?? media_color_scheme);

  // let source_menu_open: boolean = $state(false);
  let theme_menu_open: boolean = $state(false);
  
  let show_copied: string | null = $state(null);
  let show_copied_timer: NodeJS.Timeout | undefined = undefined;

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
    }).format(vari * 100);
    
    return `${percent}%`
  }
</script>

<style>
  :global {
    :root {
      --font-family: var(--apk-font-family, Roboto);

      --white-almost: #fdfefa;
      --green-lite: #d0eac0;
      --green-dark: #719b58;
      --green-darker: #476337;

      --z-top: 1000;
      --z-copied: 9000;
      --z-top-menu: 9500;

      --theme-color-transition-duration: 300ms;
      --theme-color-transition-timing-function: ease;

      font-size: 16px;
      font-family: var(--font-family);
      -webkit-tap-highlight-color: transparent;
    }

    html, body, #app {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: stretch;
      justify-content: stretch; 
      overflow: hidden;
    }

    .ripple-c {
      position: relative;
      overflow: hidden;
    }

    * {
      box-sizing: border-box;
    }
  }

  .app[data-color-scheme=light] {
    
    --color-top-bg: var(--green-dark);
    --color-top-text: #fff;
    --color-top-btn-text: #fff;
    --color-top-btn-hover-bg: rgba(255,255,255,0.1);

    --color-top-menu-text: #111;
    --color-top-menu-bg: #fff;
    --color-top-menu-item-hover-bg: rgba(0,0,0,0.05);
    --color-top-menu-item-selected-bg: rgba(0,0,0,0.1);
    --color-top-menu-item-icon-selected: var(--green-dark);
    
    --color-item-list-bg: var(--green-lite);
    --color-item-bg: var(--white-almost);
    --color-item-border: var(--green-dark);
    --color-item-title: rgba(0,0,0,0.6);    
    --color-item-price-title: rgba(0,0,0,0.6);
    --color-item-price: var(--green-dark);
    --color-item-price-sign-opacity: 0.8;
    --color-item-price-sign: var(--green-dark);
    --color-item-date: rgba(0,0,0,0.5);

    --color-copied-bg: #414141;
    --color-copied-text: #fff;

    --color-vari-up: #0fa54f;
    --color-vari-down: #e54747;
    --color-vari-equal: #194781;

    --shadow-top: rgba(0,0,0,0.25) 0 2px 8px 4px;
    --shadow-item: rgba(0,0,0,0.05) 0 2px 10px 2px;
    --shadow-top-menu: rgba(0,0,0,0.25) 0 0 4px 2px;
  }

  .app[data-color-scheme=dark] {

    --color-top-bg: var(--green-darker);
    --color-top-text: rgba(255,255,255,0.9);
    --color-top-btn-text: rgba(255,255,255,0.8);
    --color-top-btn-hover-bg: rgba(255,255,255,0.1);

    --color-top-menu-text: rgba(255,255,255,0.8);
    --color-top-menu-bg: #414141;
    --color-top-menu-item-hover-bg: rgba(255,255,255,0.05);
    --color-top-menu-item-selected-bg: rgba(255,255,255,0.1);
    --color-top-menu-item-icon-selected: var(--green-dark);

    --color-item-list-bg: var(--green-dark);
    --color-item-bg: var(--green-darker);
    --color-item-border: rgba(255,255,255,0.6);
    --color-item-title: rgba(255,255,255,0.9);    
    --color-item-price-title: rgba(255,255,255,0.8);
    --color-item-price: rgba(255,255,255,0.9);
    --color-item-price-sign: #fff;
    --color-item-price-sign-opacity: 0.7;
    --color-item-date: rgba(255,255,255,0.7);

    --color-copied-bg: #414141;
    --color-copied-text: rgba(255,255,255,0.8);

    --color-vari-up: #aaffa9;
    --color-vari-down: #ffa0a0;
    --color-vari-equal: #b1d3ff;

    --shadow-top: rgba(0,0,0,0.25) 0 0 0.5rem 0.25rem;
    --shadow-top-menu: rgba(255,255,255,0.05) 0 0 0.25rem 0.1rem;
    --shadow-item: rgba(0,0,0,0.05) 0 2px 1px 1px;
  }

  * {
    line-height: 1.25em; 
  }

  .app {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: var(--color-item-list-bg);
    transition: background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
    user-select: none;
  }

  .top {
    height: 4rem;
    position: sticky;
    top: 0;
    z-index: var(--z-top);
    background: var(--color-top-bg);
    color: var(--color-top-text);
    box-shadow: var(--shadow-top);
    transition: 
      background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      box-shadow var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 1.75rem;
    font-weight: 900;
    flex: none;
  }

  .top-title {
    flex: 1;
    text-align: center;
  }

  .top-btn {
    position: relative;
    overflow: hidden;
    width: 3.5rem;
    height: 3.5rem;
    flex: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: var(--color-top-btn-text);
    transition: color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function), background-color 200ms ease;;
    font-size: 1.5rem;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    
    &.open, &:hover {
      background: var(--color-top-btn-hover-bg);
    }
  }

  .top-menu-anchor {
    position: relative;
    isolation: isolate;
    z-index: var(--z-top-menu);
    display: flex;
  }

  .top-menu {
    position: absolute;
    top: 100%;
    left: 0.25rem;
    color: var(--color-top-menu-text);
    background: var(--color-top-menu-bg);
    box-shadow: var(--shadow-top-menu);
    border-radius: 0.25rem;
    padding: 0.25rem 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: 
      color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      box-shadow var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);

    &.reverse {
      left: unset;
      right: 0.25rem; 
    }
  }

  .top-menu-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    appearance: none;
    font: inherit;
    border: 0;
    font-size: 1rem;
    font-weight: 400;
    padding: 0.75rem 3rem 0.75rem 0.75rem;
    white-space: nowrap;
    cursor: pointer;
    color: currentColor;
    background: transparent;
    transition: background-color 200ms ease;
    
    &:hover {
      background: rgba(0,0,0,0.1) !important;
    }
  }

  .top-menu-item-radio {
    --color: currentColor;
    position: relative;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    border: 2px solid var(--color);
    transition: border-color 200ms ease;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-inline-end: 0.75rem;
  }

  .top-menu-item-icon {
    color: currentColor;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-inline-end: 0.6rem;
    transition: color 200ms ease;
  }


  .selected {
    &.top-menu-item {
      background: var(--color-top-menu-item-selected-bg); 
    }

    .top-menu-item-icon {
      color: var(--color-top-menu-item-icon-selected);
    }

    .top-menu-item-radio {
      --color: var(--color-top-menu-item-icon-selected);
      
      &:after {
        content: " ";
        background: var(--color);
        border-radius: 50%;
        display: flex;
        flex: none;
        position: absolute;
        inset: 3px;
      }
    }
  }
  .items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(306px, 100% - 3rem), 1fr));
    gap: 1rem;
    padding: 1.25rem 1rem;
    align-self: center;
    width: min(100%, 1100px);
    min-width: 0;
  }

  .item {
    padding: 0 0.5rem 0 0.5rem;
    background: var(--color-item-bg);
    box-shadow: var(--shadow-item);
    transition:
      background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      border-top-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      box-shadow var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    border-radius: 0.5rem;
  
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
      font-weight: 400;
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
      padding: 0.75rem 0.5rem;
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
    font-weight: 500;
    border-radius: 0.25rem;
    padding: 0.25rem 0.6rem;
    margin: -0.25rem -0.6rem;
    color: var(--color-item-price);
    transition: color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
    cursor: pointer;
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
    transition:ç
      background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
    font-weight: 600;
    font-size: 0.8rem;
    border-radius: 0.25rem;
    padding: 0.5rem;
  }

  .price-copied-arrow {
    width: 0;
    height: 0;
    border-left: 0.5rem solid transparent;
    border-right: 0.5rem solid transparent;
    border-top: 0.5rem solid var(--color-copied-bg);
    transition: border-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
    margin-block-start: -1px;
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

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="app" data-color-scheme={color_scheme}>
  <div class="top">

    <!-- <div class="top-menu-anchor">
      <button
        class="top-btn ripple-c"
        class:open={source_menu_open}
        aria-label="Cambiar fuente"
        onclick={() => source_menu_open = !source_menu_open}
        use:ripple
        use:click_out={() => setTimeout(() => source_menu_open = false)}
      >
        <Icon d={mdiSwapHorizontal} />
      </button>
      {#if source_menu_open}
        <div class="top-menu" transition:fly={{ duration: 300, y: -16, x: -8 }}>
          {#each [source_ambito, source_dolarhoy] as item (item._id)}
            {@const selected = source._id === item._id}
            <button
              class="top-menu-item ripple-c"
              class:selected
              aria-label="Cambiar fuente de datos a {item.name}"
              onclick={() => SOURCE_ID.set(item._id)}
              use:ripple
            >
              <span class="top-menu-item-radio"></span>
              <b>{item.name}</b>
            </button>
          {/each}
        </div>
      {/if}
    </div> -->

    <div class="top-title">
      {page_title}
    </div>

    {#if can_share}
      <div class="top-menu-anchor">
        <button
          class="top-btn ripple-c"  
          aria-label={"Compartir esta app"}
          onclick={() => share_app()}
          use:ripple
        >
          <Icon d={mdiShare} />
        </button>
      </div>
    {/if}

    <div class="top-menu-anchor">
      <button
        class="top-btn ripple-c"
        class:open={theme_menu_open}
        aria-label={"Cambiar a tema claro/oscuro"}
        onclick={() => theme_menu_open = !theme_menu_open}
        use:ripple
        use:click_out={() => setTimeout(() => theme_menu_open = false)}
      >
        <Icon d={
            COLOR_SCHEME.$ === "light" ? mdiWeatherSunny :
            COLOR_SCHEME.$ === "dark" ? mdiMoonWaningCrescent :
            mdiThemeLightDark
          }
        />
      </button>

      {#if theme_menu_open}
        <div class="top-menu reverse" transition:fly={{ duration: 300, y: -16, x: 8 }}>
          {#snippet item(v: "light" | "dark" | null, icon: string, label: Snippet)}
            <button
              class="top-menu-item ripple-c"
              class:selected={COLOR_SCHEME.$ === v}
              onclick={() => COLOR_SCHEME.set(v)}
              use:ripple
            >
              <span class="top-menu-item-icon">
                <Icon d={icon} />
              </span>
              <span>
                {@render label()}
              </span>
            </button>
          {/snippet}

          {#snippet light()}Tema <b>claro</b>{/snippet}
          {#snippet dark()}Tema <b>oscuro</b>{/snippet}
          {#snippet system()}Tema del <b>sistema</b>{/snippet}

          {@render item("light", mdiWeatherSunny, light)}
          {@render item("dark", mdiMoonWaningCrescent, dark)}
          {@render item(null, mdiThemeLightDark, system)}
        </div>
      {/if}
    </div>
  </div>

  <div class="items">
    
    {#each show_items as { id, date, name, ref, buy, sell, variation, variation_kind} (id)}
      <div class="item">
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
                <div class="buy-sell-space">/</div>
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
      </div>
    {:else}
      {#each Array(8).fill(0) as _}
        <!-- placeholder -->
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
      {/each}
    {/each}
  </div>
</div>

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
      <div
        class="price ripple-c"
        role="button"
        tabindex="-1"
        use:ripple
        onclick={() => {
          copy(price.toFixed(2));
          show_copied = id;
          clearTimeout(show_copied_timer);
          show_copied_timer = setTimeout(() => show_copied = null, 1500)
        }}
      >
        <span class="sign">$</span>{format_price(price, decimals)}
      </div>
      {#if show_copied === id}
        <div class="price-copied-anchor" in:fly={{ duration: 200, y: 8 }} out:fly={{ duration: 200, y: -32 }}>
          <div class="price-copied">
            <div class="price-copied-text">Copiado</div>
            <div class="price-copied-arrow"></div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/snippet}