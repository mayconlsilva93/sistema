// decifra painel/pd.json (DROM_BKK) -> tools/site/data.js (não versionado)
import fs from "fs";import crypto from "crypto";
const b64=s=>Buffer.from(s,"base64");const pd=JSON.parse(fs.readFileSync("painel/pd.json","utf8"));
const dk=crypto.createDecipheriv("aes-256-gcm",b64(process.env.DROM_BKK),b64(pd.iv));const ct=b64(pd.ct);dk.setAuthTag(ct.subarray(ct.length-16));
const D=JSON.parse(Buffer.concat([dk.update(ct.subarray(0,ct.length-16)),dk.final()]).toString());
fs.writeFileSync("tools/site/data.js",D["data.js"]);console.log("ok",pd.up||"");
