import { mount, unmount } from "svelte";
import App from "../App.svelte";
import { run } from "../runtime";

const app = mount(App, {
  target: document.querySelector("#app")!,
  props: {}
})

run.current_app = app;

run.destroyers.push(() => {
  unmount(app)
  if(run.current_app === app) run.current_app = null;
});