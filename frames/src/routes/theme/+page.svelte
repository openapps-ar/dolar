<script lang="ts">
  import Screen from "../screen.svelte";
</script>

<style>
  .item {
    position: absolute;
    inset: 0;
  }

  .clip {
    z-index: 1;
    clip-path: ellipse(540px 460px at 9% 19%)
  }
</style>

<div class="item">
  <Screen title="Tema claro y oscuro" theme="light" />
</div>

<div class="item clip">
  <Screen title="Tema claro y oscuro" theme="dark" />
</div>