import path from "path"
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const API_DIR = path.resolve(__dirname, "../..", "generated/pages/api")

export type Id = 
  | "informal"
  | "oficial"
  | "bna"
  | "mep"
  | "ccl"
  | "turista"
  | "mayorista"
  | "cripto"
  // | "euro-oficial"
  // | "euro-blue"
  // | "futuro"

  export const IDS: Id[] = [
    "informal",
    "oficial",
    "bna",
    "mep",
    "ccl",
    "turista",
    "mayorista",
    "cripto",
    // "euro-oficial",
    // "euro-blue"
    // "futuro",
  ]

export const NAMES: Record<Id, string> = {
  "informal": "Blue",
  "oficial": "Oficial",
  "bna": "BNA",
  "mep": "MEP",
  "ccl": "CCL",
  "turista": "Turista",
  "mayorista": "Mayorista",
  "cripto": "Cripto",
  // "euro-oficial": "Euro Oficial",
  // "euro-blue": "Euro Blue",
  // "futuro": "Dolar Futuro",
}

export const VARIATION_URLS: Record<Id, string> = {
  "informal": "https://mercados.ambito.com/dolar/informal/variacion",
  "oficial": "https://mercados.ambito.com/dolar/oficial/variacion",
  "bna": "https://mercados.ambito.com/dolarnacion/variacion",
  "mep": "https://mercados.ambito.com/dolarrava/mep/variacion",
  "ccl": "https://mercados.ambito.com/dolarrava/cl/variacion",
  "turista": "https://mercados.ambito.com/dolarturista/variacion",
  "mayorista": "https://mercados.ambito.com/dolar/mayorista/variacion",
  "cripto": "https://mercados.ambito.com/dolarcripto/variacion",
  // "euro-oficial": "https://mercados.ambito.com/euro/variacion",
  // "euro-blue": "https://mercados.ambito.com/euro/informal/variacion",
  // "futuro": "https://mercados.ambito.com/dolarfuturo/variacion",
}

export const HISTORIC_URLS: Record<Id, string> = {
  "informal": "https://mercados.ambito.com/dolar/informal/historico-general",
  "oficial": "https://mercados.ambito.com/dolar/oficial/historico-general",
  "bna": "https://mercados.ambito.com/dolarnacion/historico-general",
  "mep": "https://mercados.ambito.com/dolarrava/mep/historico-general",
  "ccl": "https://mercados.ambito.com/dolarrava/cl/historico-general",
  "turista": "https://mercados.ambito.com/dolarturista/historico-general",
  "mayorista": "https://mercados.ambito.com/dolar/mayorista/historico-general",
  "cripto": "https://mercados.ambito.com/dolarcripto/historico-general",
  // "euro-oficial": "https://mercados.ambito.com/euro/historico-general",
  // "euro-blue": "https://mercados.ambito.com/euro/informal/historico-general",
  // "futuro": "https://mercados.ambito.com/dolarfuturo/historico-general",
}

