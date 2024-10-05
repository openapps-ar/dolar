<script lang="ts">
  import { onMount } from "svelte";
  import Frame from "../frame.svelte";
  import { fly } from "svelte/transition";

  const texts = [
    "Todos los dolares de argentina en vivo",
    "Actualizados minuto a minuto",
    "Datos históricos y gráficos interactivos",
    "Tema claro y oscuro",
  ]

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const delay = 700;
  const each = 3500;
  const end = 3500;

  let current_text: string | null = null;

  const run_video_animation = async () => {
    await sleep(delay)
    let i = 0;
    for(let text of texts) {
      i++;
      current_text = text;
      if(i === texts.length) {
        await sleep(end)
        break;
      } else {
        await sleep(each)
      }
    }
  }

  onMount(() => {
    // @ts-ignore
    window.run_video_animation = run_video_animation;
  })
</script>

<style>
  /* google fonts fira sans */
  @import url('https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

  :global {
    html, body {
      margin: 0;
    }
  }

  .screen {
    font-family: Fira Sans, sans-serif;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #eee;
    position: relative;
    overflow: hidden;
  }

  .logo {
    position: absolute;
    top: 10%;
    left: 10%;
    border-radius: 12.5%;
    height: 50%;
    aspect-ratio: 1;
    background: rgba(0,0,0,0.1);
    background-image: url(../../../../app/assets/logo.png);
    background-size: 100%;
    background-position: center;
    background-repeat: no-repeat;
    box-shadow: rgba(0,0,0,0.25) 0 0.5vw 0.5vw 0;
  }

  .text {
    color: #121212;
    font-weight: 500;
    position: absolute;
    left: 7%;
    bottom: 10%;
    height: 20%;
    width: 35%;
    text-align: center;
    font-size: 3vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .text-in {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .text-in > span {
    position: absolute;
    inset: 0;
    text-wrap: balance;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .frame-position {
    position: absolute;
    right: 18%;
    transform: rotate(5deg);
    bottom: -5%;
    height: 95%;
    aspect-ratio: 9 / 16;
    --frame-width: 100%;
    --frame-height: 100%;
    --frame-left: none;
    --frame-bottom: none;
    --scale: 1;
    display: flex;
  }

  .frame-relative {
    position: relative;
    flex: 1;
  }

  .scale-up {
    /* position: absolute;
    width: calc(var(--scale) * 100%);
    height: calc(var(--scale) * 100%);
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%); */
    display: flex;
  }

  .scale-down {
    /* transform: scale(calc(1 / var(--scale))); */
    flex: 1;
  }
</style>

<div class="screen">
  <div class="logo">
  </div>
  <div class="text">
    <div class="text-in">
      {#if current_text != null}
        {#key current_text}
          <span in:fly|global={{ y: "50%", duration: 800, delay: 400 }} out:fly|global={{ y: "-50%", duration: 800 }}>
            {current_text}
          </span>
        {/key}
      {/if}
    </div>
  </div>
  <div class="frame-position">
    <div class="frame-relative">
      <div class="scale-up">
        <div class="scale-down">
          <Frame theme="dark" />
        </div>
      </div>
    </div>
  </div>
</div>