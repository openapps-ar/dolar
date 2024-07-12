<script lang="ts">
  
  const {
    onready
  }: {
    onready: () => void
  } = $props();

  import { COLOR_SCHEME } from "./storage.svelte";
  import { NOW, HISTORIC }  from "./client/client.svelte";
  import { media } from "./media.svelte";
  import { onMount, tick } from "svelte";
  import { get_code_from_network } from "./entry/network";
  import { run } from "./runtime";
  import { env } from "./env/env";
  import { sleep } from "./sleep";
  import { mods } from "./capacitor/mods";
  import { replace_app } from "./code/replace";
  import Index from "./screens/Index.svelte";
  import Top from "./layout/Top.svelte";
  const { app: { App }, splash_screen: { SplashScreen } } = mods;
  
  let mounted = true;

  onMount(() => {

    if(!run.splash_screen_hide_called) {
      run.splash_screen_hide_called = true;
      SplashScreen.hide()
    }

    NOW.refresh_if_stale().finally(async () => {
      
      NOW.start_interval();

      if(env.DEV || run.current_code_origin === "network") {
        await sleep(300);
        HISTORIC().start_interval();
        
      } else {
        console.log("getting code from network");
      
        try {
          const entry = await get_code_from_network()
          console.log("network code obtained");
          await replace_app(entry)
        } finally{
          await sleep(300);
          HISTORIC().start_interval();
        }
      }
    })
    
    let listener: Awaited<ReturnType<typeof App["addListener"]>>;
    App.addListener("backButton", () => {
      console.log("backButton", mounted);
      if(!mounted) {
        listener?.remove();
        return;
      }

      if(state.screen === "index") {
        App.minimizeApp();
      } else {
        back();
      }
    }).then(list => listener = list)

    onready();

    return () => {
      mounted = false;
      NOW.stop_interval();
      HISTORIC().stop_interval();
      listener?.remove();
    }
  })

  let items = $derived(NOW.$?.data.items ?? []);
  const show_items = $derived(items);

  const PREFERS_LIGHT = media("(prefers-color-scheme: light)");
  const media_color_scheme: "dark" | "light" = $derived(PREFERS_LIGHT.$ ? "light" : "dark");
  const color_scheme = $derived(COLOR_SCHEME.$ ?? media_color_scheme);

  import ItemScreen from "./screens/Item.svelte";
  import { screen_enter, screen_leave, set_direction } from "./transitions";
  import { Portals } from "./portal/portal.svelte";
  import { assert_never } from "../../api/src/assert_never";
  import { title } from "./text";

  const STATE_VERSION = 0;

  type StateScreen = 
    | { screen: "index" }
    | { screen: "item", id: string }

  type State = {
    version: number | string
    scroll: number
  } & StateScreen;

  let saved_state: State | null = history.state;
  if(saved_state == null || saved_state.version !== STATE_VERSION) {
    saved_state = { screen: "index", scroll: 0, version: STATE_VERSION };
    history.replaceState(saved_state, "", null);
  }

  $effect(() => { history.scrollRestoration = "manual" });
  
  let state: State = $state(saved_state);
  let scroll: HTMLElement | null = null;
  let set_scroll = (node: HTMLElement) => {scroll = node};

  const replace = (state: State) => history.replaceState(state, "", null);
  const push = (state: State) => history.pushState(state, "", null);
  const get = (): State => history.state
  const update_current_scroll = () => replace({ ...get(), scroll: scroll?.scrollTop  ?? 0 });
  const go = async (screen: StateScreen) => {
    update_current_scroll();
    const new_state = { ...screen, scroll: 0, version: STATE_VERSION };
    push(new_state);

    if(state.screen === "index") {
      set_direction("forward")
    } else if(state.screen === "item") {
      set_direction("backward")
    } else {
      return assert_never(state, "state.screen");
    }

    state = new_state;
  }

  const back = () => history.back();


  onMount(() => {
    
    const onpop = () => {
      
      const fn = async () => {
        
        if(state.screen === "index") {
          set_direction("forward")
        } else if(state.screen === "item") {
          set_direction("backward")
        } else {
          return assert_never(state, "state.screen");
        }
      
        state = get();
        await tick();
        if(state.scroll !== 0 && scroll != null) scroll.scrollTop = state.scroll
      }

      fn();
    }

    window.addEventListener("popstate", onpop);
  
    return () => {
      window.removeEventListener("popstate", onpop);
    }
  })

</script>

<style>
  :global {
    :root {
      --font-family: var(--apk-font-family, system-ui);

      --white-almost: #fdfefa;
      --green-lite: #d0eac0;
      --green-dark: #719b58;
      --green-darker: #476337;

      --z-top: 1000;
      --z-copied: 9000;
      --z-top-menu: 9500;

      --theme-color-transition-duration: 300ms;
      --theme-color-transition-timing-function: linear;
      
      /* --theme-color-transition-duration: 0ms;
      --theme-color-transition-timing-function: linear; */

      --screen-max-width: 900px;

      font-size: 18px;
      font-family: var(--font-family);

      -webkit-tap-highlight-color: transparent;
    }

    @media (width <= 360px) {
      :root {
        font-size: 16px;
      }
    }

    html, body, #app {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: stretch;
      margin: 0;
      padding: 0;
      flex: 1;
      height: 100%;
      min-height: 0;
    }

    html {
      overflow: hidden;
    }

    .ripple-c {
      position: relative;
      overflow: hidden;
    }

    button {
      appearance: none;
      font: inherit;
      border: none;
      padding: 0;
      background: transparent;
      cursor: pointer;
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

    /* --color-top-bg: var(--green-darker);
    --color-top-text: var(--green-lite);
    --color-top-btn-text: var(--green-lite);
    --color-top-btn-hover-bg: rgba(255,255,255,0.1); */


    --color-top-menu-text: #111;
    --color-top-menu-bg: #fff;
    --color-top-menu-item-hover-bg: rgba(0,0,0,0.05);
    --color-top-menu-item-selected-bg: rgba(0,0,0,0.1);
    --color-top-menu-item-icon-selected: var(--green-dark);
    
    --color-box-bg: var(--white-almost);
    
    --color-title-over-background: rgba(0,0,0,0.7);
    --color-title-over-box: rgba(0,0,0,1);

    --color-item-list-bg: var(--green-lite);
    --color-item-title: rgba(0,0,0,0.6);    
    --color-item-price-title: rgba(0,0,0,0.6);
    --color-item-price: var(--green-darker);
    --color-item-price-sign-opacity: 0.8;
    --color-item-price-sign: var(--green-darker);
    --color-item-date: rgba(0,0,0,0.4);

    --color-copied-bg: #414141;
    --color-copied-text: #fff;

    --color-vari-up: #0fa54f;
    --color-vari-down: #e54747;
    --color-vari-equal: #194781;

    --color-chart-grid-line: rgba(0,0,0,0.075);
    --color-chart-label: rgba(0,0,0,0.5);
    --color-chart-range-selected-bg: rgba(0,0,0,0.05);
    --color-chart-range-btn-text: #222;
    --color-item-sep: rgba(0,0,0,0.1);
  
    --color-up: #0fa54f;
    --color-down: #e54747;
    --color-equal: #0074D9;

    --color-chart-up: var(--color-up);
    --color-chart-down: var(--color-down);
    --color-chart-equal: var(--color-equal);


    --shadow-top: rgba(0,0,0,0.25) 0 2px 8px 4px;
    --shadow-item: rgba(0,0,0,0.05) 0 2px 10px 2px;
    --shadow-top-menu: rgba(0,0,0,0.25) 0 0 4px 2px;

    --color-item-hover-filter: brightness(0.975);
    --color-item-active-filter: brightness(0.925);
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

    --color-title-over-background: rgba(255,255,255,1);
    --color-text-over-box: rgba(255,255,255,1);

    --color-item-list-bg: var(--green-dark);
    --color-box-bg: var(--green-darker);
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

    --color-chart-grid-line: rgba(255,255,255,0.1);
    --color-chart-label: rgba(255,255,255,0.8);
    --color-chart-range-selected-bg: rgba(255,255,255,0.151);
    --color-chart-range-btn-text: rgba(255,255,255,0.8);
    
    --color-up: #aaffa9;
    --color-down: #ffa0a0;
    --color-equal: #b1d3ff;

    --color-chart-up: #0fa54f;
    --color-chart-down: #e54747;
    --color-chart-equal: #0074D9;
    
    --color-item-sep: rgba(255,255,255,0.25);

    --shadow-top: rgba(0,0,0,0.25) 0 0 0.5rem 0.25rem;
    --shadow-top-menu: rgba(255,255,255,0.05) 0 0 0.25rem 0.1rem;
    --shadow-item: rgba(0,0,0,0.05) 0 2px 1px 1px;

    --color-item-hover-filter: brightness(1.04);
    --color-item-active-filter: brightness(1.1);
  }

  .app {
    flex: 1;
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: var(--color-item-list-bg);
    user-select: none;
    overflow-x: clip;

    transition: background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
  }

  .top {
    position: sticky;
    top: 0;
    z-index: var(--z-top);
  }

  .screen {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  .scroll {
    grid-column: 1;
    grid-row: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow-x: clip;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-gutter: stable;
    scrollbar-color: rgba(0,0,0,0.1) rgba(0,0,0,0.05);
  }

  .portals {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="app" data-color-scheme={color_scheme}>
  <div class="top">
    <Top {title} show_back={state.screen !== "index"} onback={() => back()} />
  </div>

  <div class="screen">
    {#if state.screen === "index"}
      <div class="scroll" in:screen_enter out:screen_leave use:set_scroll>
        <Index items={show_items} onitemclick={id => go({ screen: "item", id })} />
      </div>
    {:else if state.screen === "item"}
      <div class="scroll" in:screen_enter out:screen_leave use:set_scroll>  
        <ItemScreen id={state.id} />
      </div>
    {/if}
   </div>


  <div class="portals">
    <Portals />
  </div>
</div>
