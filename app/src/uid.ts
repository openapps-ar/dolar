export const uid = (n: number) => {
  let buf = "";
  for (let i = 0; i < n; i++) {
    buf += Math.floor(Math.random() * 32).toString(32);
  }
  return buf;
}