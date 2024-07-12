<script lang="ts">
  const {
    children
  }: {
    children: Snippet<[]>,
  } = $props();

  import { shareable } from "./share";
  import { title } from "./text";
  import { Snippet } from "svelte";
</script>

<style>
  .out {
    opacity: 0;
    pointer-events: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
  }

  .shareable {
    width: 400px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: var(--color-item-list-bg);
    overflow-x: clip;
  }

  .top {
    height: 4.5rem;
    background: var(--color-top-bg);
    color: var(--color-top-text);
    box-shadow: var(--shadow-top);
    display: flex;
    z-index: var(--z-top);
    overflow-x: clip;
    flex: none;
    text-align: center;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
  }

  .page {
    display: flex;
    flex-direction: column;
  }
</style>

<div class="out" inert>
  <div class="shareable" use:shareable>
    <div class="top">
      {title}
    </div>
    
    <div class="page">
      {@render children()}
    </div>
  </div>
</div>