import { run } from "./runtime";

type MaybeFn<T> = T | (() => T);

const get = <T>(v: MaybeFn<T>): T => {
  if(typeof v === "function") {
    // @ts-expect-error
    return v();
  } else {
    return v;
  }
}

export const storage_var = <T>(k: string, {
  initial,
  parse,
  stringify,
  auto_initialize = false,
}: {
  initial: MaybeFn<T>,
  parse: (v: string) => T,
  stringify: (v: T) => string,  
  auto_initialize?: boolean,
}) => {

  let value: T;
  const stored = localStorage.getItem(k);
  if(stored != null) {
    value = parse(stored);
  } else {
    value = get(initial);
    if(auto_initialize) localStorage.setItem(k, stringify(value));
  }

  let v$ = $state(value);
  const listener = (event: StorageEvent) => {
    if(event.storageArea !== localStorage) return;
    if(event.key !== k) return;
    v$ = event.newValue == null ? get(initial) : parse(event.newValue);
  }

  window.addEventListener("storage", listener);
  
  run.destroyers.push(() => window.removeEventListener("storage", listener));

  return {
    get $() { return v$ },

    set: (new_v: T) => {
      v$ = new_v;
      localStorage.setItem(k, stringify(new_v));
    },

    remove: () => {
      v$ = get(initial);
      localStorage.removeItem(k);
    }
  }
}

export const bool = (key: string, initial: MaybeFn<boolean> = false, auto_initialize?: boolean) => {
  return storage_var<boolean>(key, {
    initial,
    parse: v => v === "true",
    stringify: v => String(v),
    auto_initialize,
  });
}

export const nullable_date = (key: string, initial: MaybeFn<Date | null> = null, auto_initialize?: boolean) => storage_var<Date | null>(
  key,
  {
    initial,
    parse: v => {
      const d = new Date(v);
      if(isNaN(+d)) {
        return null;
      } else {
        return d;
      }
    },
    stringify: v => {
      if(v == null) {
        return "";
      } else {
        return v.toJSON();
      }
    },
    auto_initialize,
  }
)

export const num = (key: string, initial = 0, auto_initialize?: boolean) => {
  const {
    $: v$,
    set,
    ...rest
  } = storage_var<number>(key, {
    initial,
    parse: Number,
    stringify: String,
    auto_initialize,
  });

  const increment = (d = 1) => set(v$ + d);
  const decrement = (d = 1) => set(v$ - d);

  return {
    get $() { return v$ },
    set,
    ...rest,
    increment,
    decrement
  }
}

export const COLOR_SCHEME = storage_var<"light" | "dark" | null>("color-scheme", {
  initial: null,
  parse: JSON.parse,
  stringify: JSON.stringify,
  auto_initialize: false,
})

// export const SOURCE_ID = storage_var<string | null>("source-id", {
//   initial: null,
//   parse: JSON.parse,
//   stringify: JSON.stringify,
//   auto_initialize: false,
// })

export const ORDERS = storage_var<Record<string, string | undefined>>("item-orders", {
  initial: {},
  parse: JSON.parse,
  stringify: JSON.stringify,
  auto_initialize: false,
})
