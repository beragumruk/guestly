const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getEncryptionKey() {
  const value = process.env.GUESTLY_INTEGRATIONS_ENCRYPTION_KEY;
  if (!value) throw new Error("GUESTLY_INTEGRATIONS_ENCRYPTION_KEY is not configured.");
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new Error("GUESTLY_INTEGRATIONS_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  return key;
}

async function importKey() {
  return crypto.subtle.importKey("raw", getEncryptionKey(), "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptSecret(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await importKey(), encoder.encode(value));
  return `${Buffer.from(iv).toString("base64url")}.${Buffer.from(encrypted).toString("base64url")}`;
}

export async function decryptSecret(value: string) {
  const [ivValue, encryptedValue] = value.split(".");
  if (!ivValue || !encryptedValue) throw new Error("Stored integration secret is invalid.");
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: Buffer.from(ivValue, "base64url") },
    await importKey(),
    Buffer.from(encryptedValue, "base64url"),
  );
  return decoder.decode(decrypted);
}

export function createSigningSecret() {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
}
