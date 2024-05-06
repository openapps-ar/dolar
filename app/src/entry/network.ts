import { Code } from "./apk"

const ENTRY_NETWORK_URL = "https://dolar.openapps.ar/_app/v1/app-entry.json";

export const get_code_from_network = async (): Promise<Code> => {
  const res = await fetch(ENTRY_NETWORK_URL);
  if(!res.ok) throw new Error(`network code fetch status not ok: ${res.status} ${res.statusText}`)
  const entry = await res.json();
  return entry;
}