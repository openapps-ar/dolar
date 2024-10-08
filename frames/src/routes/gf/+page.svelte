<script lang="ts">
  import Frame from "../frame.svelte";

  import { page } from "$app/stores";

  $: video = $page.url.searchParams.has("video");
  $: aspectRatio = video ? "1920 / 1080" : "1024 / 500";
  $: zoom = video ? "1.5" : "0.8"
</script>
<style>
  :global {
    html, body {
      margin: 0;
    }
  }

  .screen {
    width: 100%;
    aspect-ratio: var(--aspect-ratio);
    background: #eee;
    position: relative;
    overflow: hidden;
  }

  .logo {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 10%;
    border-radius: 12.5%;
    height: 70%;
    aspect-ratio: 1;
    background: rgba(0,0,0,0.1);
    background-image: url(../../../../app/assets/logo.png);
    background-size: 100%;
    background-position: center;
    background-repeat: no-repeat;
    box-shadow: rgba(0,0,0,0.25) 0 0.5vw 0.5vw 0;
  }

  .video .logo {
    height: 60%;
    left: 10%;
  }

  .frame-position {
    position: absolute;
    right: 15%;
    /* transform: rotate(5deg); */
    /* bottom: -5%; */
    bottom: 0;
    height: 90%;
    aspect-ratio: 9 / 16;
    --frame-width: 100%;
    --frame-height: 100%;
    --frame-left: none;
    --frame-bottom: none;
    --scale: 1;
    display: flex;
  }

  .video .frame-position {
    right: 13%;
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

<div class="screen" class:video style:--aspect-ratio={aspectRatio}>
  <div class="logo">
  </div>
  <div class="frame-position">
    <div class="frame-relative">
      <div class="scale-up">
        <div class="scale-down" style:zoom={zoom}>
          <Frame theme="dark" />
        </div>
      </div>
    </div>
  </div>
</div>