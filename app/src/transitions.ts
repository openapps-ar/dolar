import { tick } from "svelte";
import { TransitionConfig, fly } from "svelte/transition"

// export const screen_enter = (node: HTMLElement, params = {}) => {
//   // return { duration: 0 };
//   return fly(node, {
//     x: -16,
//     duration: 200,
//     opacity: 0.25,
//   })
// }

const duration = 250;
const offset = 100;
import { expoInOut as easing } from "svelte/easing";

let direction: "forward" | "backward" = "forward";

export const set_direction = (dir: "forward" | "backward") => {
  direction = dir;
}

export const screen_enter = (node: HTMLElement, params = {}): TransitionConfig => {
  return {
    duration,
    easing,
    css: (t, u) => `
      transform: translateX(${(direction === "forward" ? offset : -offset) * u}%);
      /*opacity: ${t}*/`,
  }
}

export const screen_leave = (node: HTMLElement, params = {}): TransitionConfig => {
  return {
    duration,
    easing,
    css: (t, u) => 
      `transform: translateX(${(direction === "forward" ? -offset : offset) * u}%);
      /*opacity: ${t}*/`
  }
}

export const document_transition = async (set: () => any | Promise<any>): Promise<void> => {
  // @ts-expect-error
  if(document.startViewTransition) {
    // @ts-expect-error
    await document.startViewTransition(async () => {
      await set();
      await tick(); 
    })
  } else {
    await set();
    await tick();
  }
}