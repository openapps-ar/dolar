import type { ShareOptions } from "@capacitor/share";
import { mods } from "./capacitor/mods";
import { get, readonly, writable } from "svelte/store";
import html2canvas from "html2canvas";

const {
  share: { Share },
  core: { Capacitor },
  filesystem: { Filesystem, Directory, Encoding }
} = mods;

const native = Capacitor.isNativePlatform();

export const share = async (data: ShareOptions): Promise<{ activityType: string | null }> => {
  // if(native) {
    const { activityType } = await Share.share(data);
    return { activityType: activityType ?? null }
  // } else {
  //   if(typeof navigator.share !== "function") return { browser: true, activityType: null };
  //   await navigator.share({
  //     title: data.title,
  //     text: data.text,
  //     url: data.url
  //   })
  //   return { browser: true, activityType: null }
  // }
}

export const canShare = async (): Promise<boolean> => {
  // if(native) {
    const { value } = await Share.canShare();
    return value;
  // } else {
  //   if(typeof navigator.canShare !== "function") return false;
  //   return navigator.canShare(data);
  // }
}

const current_share_element = writable<HTMLElement | null>(null);

export const shareableElement = readonly(current_share_element);

export const shareable = (node: HTMLElement) => {
  current_share_element.set(node);
  return {
    destroy: () => {
      if(get(current_share_element) === node) {
        current_share_element.set(null);
      }
    }
  }
}

export const shareCurrentElement = async () => {
  const element = get(current_share_element);
  if(element == null) return;
  
  const canvas = await html2canvas(element);
  // const blob = await new Promise<Blob>((resolve, reject) => {
  //   canvas.toBlob(result => {
  //       if(result == null) {
  //         reject(new Error("canvas.toBlob returned null"));
  //       } else {
  //         resolve(result)
  //       }
  //     },
  //     "image/png"
  //   )
  // });

  const base64 = canvas.toDataURL("image/png", 1);

  const filename = `dolar-screen-capture-${Date.now()}.png`;
  
  await Filesystem.mkdir({
    path: Directory.Library,
    recursive: true,
  })

  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: base64,
    recursive: true,
    directory: Directory.Library,
  })

  const del = () => {
    Filesystem.deleteFile({
      path: uri,
    })
  }

  try {
    await Share.share({
      title: "Dolar",
      text: "Cotizaciones de todos los dólares de Argentina en tiempo real a un solo click",
      files: [ uri ]
    })

    del();
  } catch(e) {
    del();
    throw e;
  }
}