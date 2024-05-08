const run_uid = () => Math.floor(Math.random() * 1e12).toString(32);

export type Code = {
  fn: Function
  uid: string
}

export const parse_code = (js: string): Code => {
  const uid = run_uid();
  const fn = new Function(`const RUN_UID=${JSON.stringify(uid)};${js}`);
  return { fn, uid };
}

export const exec_code = async ({ fn, uid }: Code) => {
  const ready = new Promise<void>(resolve => {
    const listener = (event: CustomEvent<{ uid: string | number }>) => {
      if(event.detail.uid === uid) {
        resolve();
        // @ts-expect-error
        window.removeEventListener("x-app-ready", listener);
      }
    }
        
    // @ts-expect-error
    window.addEventListener("x-app-ready", listener);
  })

  await fn();
  await ready;
}