import * as core from "@capacitor/core"
import * as app from "@capacitor/app"
import * as share from "@capacitor/share"
import * as dialog from "@capacitor/dialog"
import * as splash_screen from "@capacitor/splash-screen";
import * as app_update from "@capawesome/capacitor-app-update";
import * as screen_orientation from "@capawesome/capacitor-screen-orientation";
import * as in_app_review from "@capacitor-community/in-app-review";
import *  as haptics from "@capacitor/haptics"

export const __MODS__ = {
  core,
  app,
  share,
  dialog,
  splash_screen,
  app_update,
  screen_orientation,
  in_app_review,
  haptics,
}

window.__MODS__ = __MODS__;