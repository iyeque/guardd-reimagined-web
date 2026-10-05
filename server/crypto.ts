/**
 * AES-256-GCM field-level encryption for sensitive commitment data.
 * Encryption key is read from ENCRYPTION_KEY env var (32-byte hex string).
 * Falls back to plaintext if key is not configured (dev mode).
 */
import { webcrypto as crypto } from "node:crypto";

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

async function getKey(): Promise<CryptoKey | null> {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== KEY_LENGTH * 2) return null;
  const bytes = new Uint8Array(KEY_LENGTH);
  for (let i = 0; i < KEY_LENGTH; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return crypto.subtle.importKey("raw", bytes, ALGORITHM, false, ["encrypt", "decrypt"]);
}

export async function encryptField(plaintext: string): Promise<string> {
  const key = await getKey();
  if (!key) return plaintext;
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const data = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, data);
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  let binary = "";
  for (let i = 0; i < combined.length; i++) binary += String.fromCharCode(combined[i]);
  return btoa(binary);
}

export async function decryptField(encrypted: string): Promise<string> {
  const key = await getKey();
  if (!key) return encrypted;
  try {
    const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
    if (combined.length < IV_LENGTH + 1) return encrypted;
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);
    const data = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext);
    return new TextDecoder().decode(data);
  } catch {
    return encrypted;
  }
}
