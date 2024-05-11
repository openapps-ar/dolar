<script lang="ts">
  const {
    inline = "start",
    block = "start",
    z = undefined,
    children
  }: {
    inline?: "start" | "center" | "end",
    block?: "start" | "center" | "end",
    z?: number | string,
    children: Snippet,  
  } = $props();

  import type { Snippet } from "svelte";
  import { portal } from "./portal.svelte";
</script>

<style>
  .anchor {
    position: absolute;
    
    &[data-inline=start] {
      inset-inline-start: 0;
    }

    &[data-inline=center] {
      inset-inline-start: 50%;
    }

    &[data-inline=end] { 
      inset-inline-end: 0;
    }

    &[data-block=start] {
      inset-block-start: 0;
    }

    &[data-block=center] {
      inset-block-start: 50%;
    }

    &[data-block=end] {
      inset-block-end: 0;
    }
  }

  .position {
    position: fixed;
    width: 0;
    height: 0;
    z-index: var(--anchor-z-index);
  }

  .relative {
    position: relative;
    width: 0;
    height: 0;
  }

</style>

{#snippet content(position: { x: number, y: number })}
  <div class="position" style:left="{position.x}px" style:top="{position.y}px" style:--anchor-z-index={z}>
    <div class="relative">
      {@render children()}
    </div>
  </div>
{/snippet}


<div class="anchor" data-inline={inline} data-block={block} use:portal={{ snippet: content }}></div>