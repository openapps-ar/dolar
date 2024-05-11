import { tick } from "svelte";
import { fly } from "svelte/transition"

export const screen_enter = (node: HTMLElement, params = {}) => {
  // return { duration: 0 };
  return fly(node, {
    x: -16,
    duration: 200,
    opacity: 0.25,
  })
}

export const document_transition = async (set: () => any | Promise<any>): Promise<void> => {
  // @ts-expect-error
  if(document.startViewTransition) {
    // @ts-expect-error
    document.startViewTransition(async () => {
      await set();
      await tick(); 
    })
  } else {
    await set();
    await tick();
  }
}