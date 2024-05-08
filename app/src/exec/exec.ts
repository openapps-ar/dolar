const run_uid = () => Math.floor(Math.random() * 1e12).toString(32);

export type Code = {
  fn: Function
  uid: string
}

export const parse_code = (js: string): Code => {
  const uid = run_uid();
  const fn = new Function(`const RUN_UID=${uid}; ${js}`);
  return { fn, uid };
}

export const exec_code = async (code: Code) => {
  const ready = new Promise<void>(resolve => {
    const listener = (event: CustomEvent<{ RUN_UID: string }>) => {
      if(event.detail.RUN_UID === code.uid) {
        resolve();
        // @ts-expect-error
        window.removeEventListener("x-app-ready", listener);
      }
    }
        
    // @ts-expect-error
    window.addEventListener("x-app-ready", listener);
  })

  await code.fn();
  await ready;
}