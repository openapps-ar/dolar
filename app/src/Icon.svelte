<script lang="ts">

  let {
    d,
    stroke = false,
    stroke_width = undefined,
    view_box = "0 0 24 24",
    color = undefined,
    size = undefined,
  }: {
    d: string
    color?: string
    size?: number | string
    view_box?: string
    stroke?: boolean
    stroke_width?: number | string
  } = $props();
</script>

<style>
  svg {
    width: var(--icon-size, 1em);
    height: var(--icon-size, 1em);
  }

  path {
    fill: var(--icon-color, currentColor);
  }

  path.stroke {
    fill: transparent;
    stroke: var(--icon-color, currentColor);
    stroke-width: var(--stroke-width);
  }
</style>

<svg
  viewBox={view_box}
  style:--icon-color={color}
  style:--icon-size={size}  
>
  {#if stroke}
    <path {d} class="stroke" style:--stroke-width={stroke_width} />
  {:else}
    <path {d} />
  {/if}
</svg>