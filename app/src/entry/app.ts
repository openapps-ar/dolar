import { mount, unmount } from "svelte";
import App from "../App.svelte";
import { run } from "../runtime";

declare const RUN_UID: number;

export const start = () => {
  const app = mount(App, {
    target: document.querySelector("#app")!,
    props: {
      onready: () => {
        window.dispatchEvent(new CustomEvent("x-app-ready", { detail: { RUN_UID } }));
      }
    }
  })

  run.current_app = app;

  run.destroyers.push(() => {
    unmount(app)
    if(run.current_app === app) run.current_app = null;
  })
}