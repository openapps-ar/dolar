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
  import { canShare, shareableElement, shareCurrentElement } from '../share';
  import { mdiArrowLeft, mdiMoonWaningCrescent, mdiShare, mdiThemeLightDark, mdiWeatherSunny } from "@mdi/js";
  import Icon from "../Icon.svelte";
  import { ripple } from "../ripple";
  import { click_out } from "../actions";
  import { fly, scale } from "svelte/transition";
  import { COLOR_SCHEME } from '../storage.svelte';
  import type { Snippet } from "svelte";
  import Anchor from '../portal/Anchor.svelte';
  import { Capacitor } from '@capacitor/core';

  let can_share = $state(true);
  let show_share = $derived(Capacitor.isNativePlatform() && can_share && $shareableElement != null)
  onMount(() => {
    (async () => {
      try {
        can_share = await canShare();
      } catch(e) {
        can_share = false;
      }
    })()
  })

  const share = async () => {
    await shareCurrentElement();
  }

  let theme_menu_open: boolean = $state(false);

  const set_color_scheme = async (v: typeof COLOR_SCHEME.$) => {
    COLOR_SCHEME.set(v)
  }
</script>

<style>
  .top {
    height: 3.5rem;
    background: var(--color-top-bg);
    color: var(--color-top-text);
    box-shadow: var(--shadow-top);
    display: flex;
    flex-direction: column;
    text-align: center;
    flex: none;
    z-index: var(--z-top);
    overflow-x: clip;
    view-transition-name: top;
    
    transition: 
      background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function),
      box-shadow var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
  }

  ::view-transition-group(top) {
    z-index: var(--z-top);
  }

  .in {
    padding: 0 0.5rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    align-self: center;
    justify-self: stretch;
    flex: none;
    width: min(100%, var(--screen-max-width));
    height: 100%;
  }

  .center {
    flex: 1; 
  }

  .title {
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.4rem;
    font-weight: 600;
  }

  .btn {
    position: relative;
    overflow: hidden;
    width: 2.75rem;
    height: 2.75rem;
    flex: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: var(--color-top-btn-text);
    font-size: 1.5rem;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    
    transition: color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function), background-color 200ms ease;
    
    &.open, &:hover {
      background: var(--color-top-btn-hover-bg);
    }
  }

  .menu-btn-out {
    position: relative;
  }

  .menu {
    position: absolute;
    top: 0;
    z-index: var(--z-top-menu);
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

    &:not(.reverse) {
      left: 0;
    }

    &.reverse {
      right: 0;
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

  /* .menu-item-radio {
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
  } */

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

    /* .menu-item-radio {
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
    } */
  }
</style>

<div class="top">

  <div class="in">

    {#if show_back}
      <button
        class="btn ripple-c"
        aria-label="Volver"
        onclick={() => onback()}
        use:ripple
        transition:scale={{ duration: 400 }}
      >
        <Icon d={mdiArrowLeft} />
      </button>
    {/if}

    <div class="center">
      <div class="title">
        {title}
      </div>
    </div>

    {#if show_share}
      <button
        class="btn ripple-c"  
        aria-label="Compartir"
        onclick={() => share()} 
        use:ripple
      >
        <Icon d={mdiShare} />
      </button>
    {/if}

    <div class="menu-btn-out">
      <button
        class="btn ripple-c"
        class:open={theme_menu_open}
        aria-label="Cambiar a tema claro/oscuro"
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
        <Anchor inline="end" block="end" z="var(--z-top-menu)">
          <div class="menu reverse menu-theme" transition:fly={{ duration: 300, y: -16, x: 8 }}>
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
        </Anchor>
      {/if}
    </div>
  </div>
</div>