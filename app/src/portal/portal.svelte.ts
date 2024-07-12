export { default as Portals } from "./Portals.svelte";

import { Snippet } from "svelte";
import { SvelteSet } from "svelte/reactivity";

export type PortalOptions = {
  snippet: PortalSnippet,
}

export type PortalSnippet = Snippet<[{ x: number, y: number }]>;

export const portals: SvelteSet<{ snippet: PortalSnippet, x: number, y: number }> = $state(new SvelteSet());

// const add = (target: EventTarget, event: string, listener: EventListener, options: EventListenerOptions = {}) => {
//   target.addEventListener(event, listener, options);
//   return () => target.removeEventListener(event, listener, options);
// }

export const portal = (node: HTMLElement, _opts: PortalOptions) => {

  let opts = _opts;

  const { left, top } = node.getBoundingClientRect();
  let x = $state(left);
  let y = $state(top);

  const create_entry = () => {
    return {
      snippet: opts.snippet,
      get x() { return x },
      get y() { return y }
    }
  }

  let entry = create_entry();

  const update = () => {
    const { left, top } = node.getBoundingClientRect();
    x = left;
    y = top;
  }

  update();

  let frame = requestAnimationFrame(function fn() {
    update();
    frame = requestAnimationFrame(fn);
  })

  // const remove_resize = add(window, "resize", update, { capture: true });
  // const remove_scroll = add(window, "scroll", update, { capture: true });

  portals.add(entry);

  return {
    update(_opts: PortalOptions) {
      opts = _opts;
      update();
      const prev_entry = entry;
      entry = create_entry();
      portals.delete(prev_entry);
      portals.add(entry);
    },

    destroy() {
      // remove_scroll();
      // remove_resize();
      cancelAnimationFrame(frame);
      portals.delete(entry);
    }
  }
}