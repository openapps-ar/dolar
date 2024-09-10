<script lang="ts">
  import Frame from "./frame.svelte";

  const {
    title,
    theme = new URLSearchParams(location.search).get("color-scheme") === "dark" ? "dark" : "light",
    detail,
  } = $props<{
    title: string,
    theme?: "light" | "dark",
    detail?: string,
  }>(); 
</script>

<style>

  @import url('https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
  
  :global {
    :root {
      font-family: "Fira Sans", sans-serif;
    }

    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }
  }  

  .screen  {
    --bg: #eee;
    --color-title: #333;
    width: 100%;
    height: 100%;
    display: flex;
    flex: 1;
    background: var(--bg); 
  }

  .title {
    position: absolute;
    top: 8%;
    transform: translateY(-50%);
    width: 66%;
    left: 17%;
    flex-direction: column;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-size: 1.7rem;
    text-align: center;
    margin: 0 auto;
    color: var(--color-title);
    text-wrap: balance;  
  }
</style>

<div class="screen" data-scheme={theme}>
  <div class="title">
    {title}
  </div>

  <Frame {theme} {detail} />
</div>