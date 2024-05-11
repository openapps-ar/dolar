<script lang="ts">
  
  const {
    onready
  }: {
    onready: () => void
  } = $props();

  const title = "Dolarg";

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

  // let source = $derived(SOURCE_ID.$ && Object.hasOwn(sources, SOURCE_ID.$) ? sources[SOURCE_ID.$] : source_ambito);
  let items = $derived(NOW.$?.data.items ?? []);

  // const show_items = $derived(items.filter(item => {
  //   return item.buy != null || item.sell != null;
  // }));

  // TODO: filter hidden ones
  const show_items = $derived(items);

  const PREFERS_LIGHT = media("(prefers-color-scheme: light)");
  const media_color_scheme: "dark" | "light" = $derived(PREFERS_LIGHT.$ ? "light" : "dark");
  const color_scheme = $derived(COLOR_SCHEME.$ ?? media_color_scheme);

  import ItemScreen from "./screens/Item.svelte";
  import { document_transition } from "./transitions";

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
  
  let state: State = $state(saved_state);
  
  const replace = (state: State) => history.replaceState(state, "", null);
  const push = (state: State) => history.pushState(state, "", null);
  const get = (): State => history.state
  const update_current_scroll = () => replace({ ...get(), scroll: document.scrollingElement?.scrollTop || 0 });
  const go = async (screen: StateScreen) => {
    update_current_scroll();
    const new_state = { ...screen, scroll: 0, version: STATE_VERSION };
    push(new_state);
    state = new_state;
    // await document_transition(() => state = new_state);  
  }
  const back = () => history.back();


  onMount(() => {
    const onpop = () => {
      const fn = async () => {
        state = get();
        if(state.scroll !== 0) {
          await tick();
          document.scrollingElement && (document.scrollingElement.scrollTop = state.scroll);
        }
      }

      fn();
      // document_transition(fn)
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

      --screen-max-width: 1100px;

      font-size: 16px;
      font-family: var(--font-family);

      -webkit-tap-highlight-color: transparent;
    }

    html, body, #app {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: stretch;
      margin: 0;
      padding: 0;
    }

    html {
      height: 100%;
    }

    body, #app {
      flex-grow: 1;  
    }

    .ripple-c {
      position: relative;
      overflow: hidden;
    }

    button {
      appearance: none;
      font: inherit;
      border: none;
      background: transparent;
      cursor: pointer;
    }

    * {
      box-sizing: border-box;
    }
  }

  /* ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none;
    mix-blend-mode: normal;
  }

  ::view-transition-new(*) {
    z-index: 11000000;
  } */

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
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: var(--color-item-list-bg);
    user-select: none;

    transition: background-color var(--theme-color-transition-duration) var(--theme-color-transition-timing-function);
  }

  .top {
    position: sticky;
    top: 0;
    z-index: var(--z-top);
  }

  .screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
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
      <Index items={show_items} onitemclick={id => go({ screen: "item", id })} />
    {:else if state.screen === "item"}
      <ItemScreen id={state.id} />
    {/if}
   </div>
</div>