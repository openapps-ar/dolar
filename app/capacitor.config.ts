/// <reference types="@capacitor/splash-screen" />

import { CapacitorConfig } from "@capacitor/cli"

const server = process.env.VITE_DEV === "1" || process.env.VITE_DEV === "true" ?
  {
    url: "http://192.168.1.4:3000"
  } :
  {
    hostname: "https://app.dolar.openapps.ar",
    androidScheme: "https",
  };

const config: CapacitorConfig = {
  appId: "ar.openapps.dolar.a3",
  appName: "Dolarg",
  bundledWebRuntime: false,
  webDir: "dist",
  
  server,

  android: {
    buildOptions: {
      signingType: "apksigner"
    }
  },

  plugins: {
    SplashScreen: {
      // launchShowDuration: 0,
      // launchFadeOutDuration: 1000,
      // launchAutoHide: true,
      // splashImmersive: false,
      // splashFullScreen: false,
      // useDialog: false,
      // backgroundColor: "#ffffff",
      // androidScaleType: "CENTER_CROP",
      // splashFullScreen: false,
      // splashImmersive: false,
    }
  }
}

export default config;