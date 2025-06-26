import { cc2ip } from "./cc2ip.js";

for (const [k, v] of Object.entries(cc2ip)) {
  const { country_code } = await (await fetch(`http://ipwho.is/${v}`)).json();
  if (k !== country_code || (k === "UK" && country_code === "GB")) {
    console.log(`${k} -> ${v} : (${k === country_code}) (${country_code})`);
  }
}
