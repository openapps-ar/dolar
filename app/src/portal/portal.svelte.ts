export { default as Portals } from "./Portals.svelte";

import { Snippet } from "svelte";
import { Set } from "svelte/reactivity";

export type PortalOptions = {
  snippet: PortalSnippet,
}

export type PortalSnippet = Snippet<[{ x: number, y: number }]>;

export const portals: Set<{ snippet: PortalSnippet, x: number, y: number }> = $state(new Set());

const add = (target: EventTarget, event: string, listener: EventListener, options: EventListenerOptions = {}) => {
  target.addEventListener(event, listener, options);
  return () => target.removeEventListener(event, listener, options);
}

export const portal = (node: HTMLElement, _opts: PortalOptions) => {

  let opts = _opts;

  let x = $state(0);
  let y = $state(0);

  const update = () => {
    const rect = node.getBoundingClientRect();
    x = rect.left;
    y = rect.top;
  }

  let frame = requestAnimationFrame(function fn() {
    update();
    frame = requestAnimationFrame(fn);
  })

  update();
  // const remove_resize = add(window, "resize", update, { capture: true });
  // const remove_scroll = add(window, "scroll", update, { capture: true });

  let entry = {
    snippet: opts.snippet,
    get x() { return x },
    get y() { return y }
  };

  portals.add(entry);

  return {
    update(_opts: PortalOptions) {
      opts = _opts;
      update();
      const prev_entry = entry;
      entry = {
        snippet: opts.snippet,
        get x() { return x },
        get y() { return y }
      };
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