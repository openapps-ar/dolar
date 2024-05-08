import * as core from "@capacitor/core"
import * as app from "@capacitor/app"
import * as share from "@capacitor/share"
import * as dialog from "@capacitor/dialog"
import * as splash_screen from "@capacitor/splash-screen";

export const __MODS__ = {
  core,
  app,
  share,
  dialog,
  splash_screen,
}

window.__MODS__ = __MODS__;