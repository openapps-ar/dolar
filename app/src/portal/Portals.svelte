<script lang="ts">
  import { portals } from "./portal.svelte.js";
</script>

{#each portals as item (item)}
  {@render item.snippet({ x: item.x, y: item.y })}
{/each}