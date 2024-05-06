import { run } from "./runtime";

export const media = (query: string) => {
  const media = matchMedia(query);
  let v$ = $state(media.matches);
  media.onchange = () => v$ = media.matches;
  
  run.destroyers.push(() => media.onchange = null);

  return {
    get $() { return v$ }
  }
}