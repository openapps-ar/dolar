import type { Code } from "../entry/apk";
import { exec_code, parse_code } from "./exec";
import { run } from "../runtime";
import { sleep } from "../sleep";

export const replace_app = async (entry: Code) => {
    if(entry.hash === run.current_hash) {
      console.log("network code hash matches, skipping");
      return;
    }

    console.log("exec code", "network");
    const fn = parse_code(entry.js)
    
    const replace = async () => {
      console.log("calling destoyers");
      for(const destroyer of run.destroyers) destroyer();
      run.destroyers = [];
      
      run.current_code_origin = "network";
      run.current_hash = entry.hash;
      await exec_code(fn);
      await sleep(1);
      console.log("network code execured");
    }

    // @ts-expect-error
    if(document.startViewTransition) {
      console.log("calling startViewTransition");
      // @ts-expect-error
      await document.startViewTransition(replace);
    } else {
      await replace();
    }
 
    console.log("storing code in storage");
    localStorage.setItem(run.code_storage_key, JSON.stringify(entry));
  }