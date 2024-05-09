/// <reference types="@capacitor/splash-screen" />

import { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "ar.openapps.dolar.a3",
  appName: "Dolarg",
  bundledWebRuntime: false,
  webDir: "dist",
  
  server: {
    androidScheme: "https",
    hostname: "app.dolar.openapps.ar"
  },

  android: {
    buildOptions: {
      signingType: "apksigner"
    }
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchFadeOutDuration: 1000,
      launchAutoHide: true,
      splashImmersive: false,
      splashFullScreen: false,
      useDialog: false,
      // backgroundColor: "#ffffff",
      // androidScaleType: "CENTER_CROP",
      // splashFullScreen: false,
      // splashImmersive: false,
    }
  }
}

export default config;