<script lang="ts">
  const {
    theme = new URLSearchParams(location.search).get("color-scheme") === "dark" ? "dark" : "light",
    detail = new URLSearchParams(location.search).get("detail"),
  } = $props<{
    theme?: "light" | "dark",
    detail?: string
  }>();

  const query = $derived.by(() => {
    const params = new URLSearchParams();
    if(theme != null) params.set("color-scheme", theme);
    if(detail != null) params.set("detail", detail);
    const aux = params.toString();
    return aux === "" ? "" : `?${aux}`;
  })
</script>

<style>
  .frame[data-scheme=dark] {
    --color-frame:  #476337;
  }

  .frame[data-scheme=light] {
    --color-frame: #fff;
  }

  .frame {
    box-sizing: content-box;
    width: 74%;
    height: 84%;
    display: flex;
    flex-direction: column;
    
    border: var(--color-frame) solid;
    background: var(--color-frame);

    border-width: 5px 3px 3px 3px;
    border-radius: 30px 30px 0 0;
    overflow: hidden;
    position: absolute;
    bottom: -10px;
    left: calc(13%);
  }


  .app {
    display: flex;
    flex-direction: column;
    flex: 1;
    border-radius: 20px 20px 0 0; 
    overflow: hidden;
  }

  iframe {
    flex: 1;
    border: 0;
    padding: 0;
    margin: 0;
  }
</style>

  <div class="frame" data-scheme={theme}>
    <div class="app">
      <iframe src="http://localhost:3000/{query}" title="app"></iframe> 
    </div>
  </div>

