import crypto from "crypto";

const VMA_API_ID = process.env.NEXT_PUBLIC_VMA_API_ID;
const VMA_API_KEY = process.env.NEXT_PUBLIC_VMA_API_KEY;
const VMA_API_SECRET = process.env.NEXT_PUBLIC_VMA_API_SECRET;

export function generateHmacAuthorizationHeader(id: string) {
  const unixTimestamp = Date.now() / 1000; // in seconds

  const hmac = crypto
    .createHmac("sha256", VMA_API_SECRET)
    .update(`${VMA_API_KEY}${unixTimestamp}${id}`)
    .digest("hex");

  return `hmac ${VMA_API_ID}:${unixTimestamp}:${hmac}`;
}
