const BASE_URL = "https://z.com/v1";
const KIND_ORDER = {
    blue: 1,
    oficial: 2,
    tarjeta: 3,
    bolsa: 4,
    contadoconliqui: 5,
    mayorista: 6,
    cripto: 7
};
const KIND_NAMES = {
    blue: "Blue",
    oficial: "Oficial",
    tarjeta: "Tarjeta",
    bolsa: "Bolsa",
    contadoconliqui: "CCL",
    mayorista: "Mayorista",
    cripto: "Cripto"
};
const SOURCE_ORDER = {
    ambito: 1,
    dolarhoy: 2,
};
const sort_items = (a, b) => {
    const kind_a = KIND_ORDER[a.kind] ?? 1e6;
    const kind_b = KIND_ORDER[b.kind] ?? 1e6;
    const source_a = SOURCE_ORDER[a.source_id] ?? 1e6;
    const source_b = SOURCE_ORDER[b.source_id] ?? 1e6;
    return (source_a - source_b) || (kind_a - kind_b);
};
export const source_ambito = {
    _id: "ambito",
    name: "Ámbito",
    site_url: "https://www.ambito.com/",
    dolar_url: "https://www.ambito.com/contenidos/dolar.html",
    api_list_url: "/ambito/dolares",
};
export const source_dolarhoy = {
    _id: "dolarhoy",
    name: "DolarHoy",
    site_url: "https://dolarhoy.com/",
    dolar_url: "https://dolarhoy.com/cotizaciones",
    api_list_url: "/dolares",
};
export const sources = [source_ambito, source_dolarhoy];
export const map_item = (src, source_id) => {
    return {
        source_id,
        kind: src.casa,
        name: KIND_NAMES[src.casa] ?? src.nombre,
        buy: src.compra,
        sell: src.venta,
        updated_at: new Date(src.fechaActualizacion),
    };
};
export const list = async (source) => {
    const url = `${BASE_URL}${source.api_list_url}`;
    const res = await fetch(url, { mode: "cors" }).catch(e => {
        throw new Error(`error fetching ${url}: ${e.message}`);
    });
    if (!res.ok)
        throw new Error(`error fetching ${url}: status code not OK: ${res.status} ${res.statusText}`);
    const items = await res.json().catch(e => {
        throw new Error(`error parsing JSON from ${url}: ${e.message}`);
    });
    // if(!is<ApiItem[]>(items)) throw new Error(`error parsing JSON from ${url}: expected ApiItem[], got ${JSON.stringify(items, null, 2)}`);
    if (!Array.isArray(items) || items.some(item => item == null || typeof item !== "object"))
        throw new Error(`error parsing JSON from ${url}: expected ApiItem[], got ${JSON.stringify(items, null, 2)}`);
    return items.map(src => map_item(src, source._id)).sort(sort_items);
};
export const list_all = async () => {
    return (await Promise.all(sources.map(list))).flat().sort(sort_items);
};
