import { Code } from "./apk"

export const get_code_from_network = async (): Promise<Code> => {
  const res = await fetch("/_app/app-entry.json");
  if(!res.ok) throw new Error(`network code fetch status not ok: ${res.status} ${res.statusText}`)
  const entry = await res.json();
  return entry;
}