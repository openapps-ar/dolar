import { mount, unmount } from "svelte";
import App from "../App.svelte";
import { run } from "../runtime";

declare const RUN_UID: string | number | undefined;

const uid = typeof RUN_UID === "undefined" ? Math.floor(Math.random() * 1e12) : RUN_UID; 

const app = mount(App, {
  target: document.querySelector("#app")!,
  props: {
    onready: () => {
      window.dispatchEvent(new CustomEvent("x-app-ready", { detail: { uid } }));
    }
  }
})

run.current_app = app;

run.destroyers.push(() => {
  unmount(app)
  if(run.current_app === app) run.current_app = null;
});