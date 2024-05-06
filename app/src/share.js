import { mods } from "./capacitor/mods";
const { share: { Share }, core: { Capacitor } } = mods;
const native = Capacitor.isNativePlatform();
export const share = async (data) => {
    // if(native) {
    const { activityType } = await Share.share(data);
    return { activityType: activityType ?? null };
    // } else {
    //   if(typeof navigator.share !== "function") return { browser: true, activityType: null };
    //   await navigator.share({
    //     title: data.title,
    //     text: data.text,
    //     url: data.url
    //   })
    //   return { browser: true, activityType: null }
    // }
};
export const canShare = async () => {
    // if(native) {
    const { value } = await Share.canShare();
    return value;
    // } else {
    //   if(typeof navigator.canShare !== "function") return false;
    //   return navigator.canShare(data);
    // }
};
