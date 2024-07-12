import type { ShareOptions } from "@capacitor/share";
import { mods } from "./capacitor/mods";
import { get, readonly, writable } from "svelte/store";

const {
  share: { Share },
  core: { Capacitor },
  filesystem: { Filesystem, Directory, Encoding }
} = mods;

const native = Capacitor.isNativePlatform();

export const share = async (data: ShareOptions): Promise<{ activityType: string | null }> => {
  const { activityType } = await Share.share(data);
  return { activityType: activityType ?? null }
}

export const canShare = async (): Promise<boolean> => {
  const { value } = await Share.canShare();
  return value;
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

  const { default: capture } = await mods.html2canvas();
  const canvas = await capture(element);

  const title = "Dolar";
  const text = "Cotizaciones en Argentina";

  const base64 = canvas.toDataURL("image/png", 1);
  const path = `screenshots/dolar-screen-capture-${Date.now()}.png`;
  const { uri } = await Filesystem.writeFile({
    path,
    data: base64,
    recursive: true,
    directory: Directory.Cache,
  })

  const del = () => Filesystem.deleteFile({ path: uri });

  try {
    await Share.share({ title, text, files: [ uri ] })
    del();
  } catch(e) {
    del();
    throw e;
  }
}