<script lang="ts">
  let {
    title,
    show_back,
    onback
  }: {
    title: string
    show_back: boolean
    onback: () => void
  } = $props();

  import { onMount } from 'svelte';
  import { canShare, share } from '../share';
  import { mdiArrowLeft, mdiMoonWaningCrescent, mdiShare, mdiThemeLightDark, mdiWeatherSunny } from "@mdi/js";
  import Icon from "../Icon.svelte";
  import { ripple } from "../ripple";
  import { click_out } from "../actions";
  import { fly, scale } from "svelte/transition";
  import { COLOR_SCHEME } from '../storage.svelte';
  import type { Snippet } from "svelte";
  import { document_transition } from '../transitions';

  const share_params = {
    title: title,
    text: `${title} - cotizaciones de todos los dólares de Argentina en tiempo real a un solo click`,
    url: `https://play.google.com/store/apps/details?id=ar.openapps.dolar`,
  }

  let can_share = $state(true);
  onMount(() => {
    canShare().then(v => can_share = v).catch(() => can_share = false);
  })

  const share_app = async () => {
    await share(share_params);
  }

  // let source_menu_open: boolean = $state(false);
  let theme_menu_open: boolean = $state(false);

  const set_color_scheme = async (v: typeof COLOR_SCHEME.$) => {
    await document_transition(() => {
      COLOR_SCHEME.set(v)
    })
  }
</script>

<style>
  .top {
    height: 4rem;
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
    z-index: var(--z-top);
    view-transition-name: top;
  }

  ::view-transition-group(top) {
    z-index: var(--z-top);
  }

  .center {
    flex: 1;
  }

  .title {
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%)
  }

  .btn {
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

  .menu-anchor {
    position: relative;
    isolation: isolate;
    z-index: var(--z-top-menu);
    display: flex;
  }

  .menu {
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

  .menu-item {
    display: flex;
    flex-direction: row;
    align-items: center;
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

  .menu-item-radio {
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

  .menu-item-icon {
    color: currentColor;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-inline-end: 0.6rem;
    transition: color 200ms ease;
  }


  .selected {
    &.menu-item {
      background: var(--color-top-menu-item-selected-bg); 
    }

    .menu-item-icon {
      color: var(--color-top-menu-item-icon-selected);
    }

    .menu-item-radio {
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
</style>

<div class="top">

  {#if show_back}
    <button
        class="btn ripple-c"
        aria-label="Volver"
        onclick={() => onback()}
        use:ripple
        transition:scale={{ duration: 200 }}
      >
      <Icon d={mdiArrowLeft} />
    </button>
  {/if}

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

  <div class="center">
    <div class="title">
      {title}
    </div>
  </div>

  {#if can_share}
    <div class="menu-anchor">
      <button
        class="btn ripple-c"  
        aria-label={"Compartir esta app"}
        onclick={() => share_app()}
        use:ripple
      >
        <Icon d={mdiShare} />
      </button>
    </div>
  {/if}

  <div class="menu-anchor">
    <button
      class="btn ripple-c"
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
      <div class="menu reverse" transition:fly={{ duration: 300, y: -16, x: 8 }}>
        {#snippet item(v: "light" | "dark" | null, icon: string, label: Snippet)}
          <button
            class="menu-item ripple-c"
            class:selected={COLOR_SCHEME.$ === v}
            onclick={() => set_color_scheme(v)}
            use:ripple
          >
            <span class="menu-item-icon">
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