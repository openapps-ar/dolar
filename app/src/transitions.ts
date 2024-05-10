import { tick } from "svelte";
import { fly } from "svelte/transition"

export const enter_screen = (node: HTMLElement, params = {}) => {
  return fly(node, {
    x: -25,
    duration: 200,
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