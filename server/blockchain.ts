import type { FamilyCommitment } from "../shared/schema.js";

/**
 * Minimal ORCA-style ledger bridge for Family Commitments.
 *
 * Design:
 * - Primary state lives in Neon Postgres via `storage` (same pattern as ORCA DAO).
 * - `ledgerHash` stores an optional on-chain transaction hash or deterministic ledger reference.
 * - `metadataCid` stores an optional IPFS/Pinata CID for richer agreement metadata.
 *
 * Why not full blockchain here:
 * - Adds RPC/key management before Hub71+ pilot.
 * - Postgres-backed ledger is sufficient for accountability + audit UIs.
 */

type PinResult = { cid: string; metadata?: Record<string, unknown> };
type LedgerResult = { txHash?: string; network?: string };

const PINATA_API_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const PINATA_JWT = process.env.PINATA_JWT;

function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  return crypto.subtle.digest("SHA-256", data).then((buf) => {
    const bytes = new Uint8Array(buf);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  });
}

export async function pinCommitmentMetadata(commitment: FamilyCommitment): Promise<PinResult | null> {
  if (!PINATA_JWT) return pinLocalOnly(commitment);
  try {
    const payload = {
      id: commitment.id,
      familyId: commitment.familyId,
      title: commitment.title,
      terms: commitment.terms,
      members: commitment.members,
      status: commitment.status,
      startedAt: commitment.startedAt instanceof Date ? commitment.startedAt.toISOString() : commitment.startedAt,
    };
    const res = await fetch(PINATA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pinataContent: payload, pinataMetadata: { name: `commitment-${commitment.id}.json` } }),
    });
    if (!res.ok) throw new Error(`Pinata failed: ${res.status}`);
    const json = (await res.json()) as { IpfsHash?: string };
    return { cid: json.IpfsHash as string, metadata: payload };
  } catch {
    return pinLocalOnly(commitment);
  }
}

async function pinLocalOnly(commitment: FamilyCommitment): Promise<PinResult> {
  const payload = JSON.stringify({
    id: commitment.id,
    familyId: commitment.familyId,
    title: commitment.title,
    status: commitment.status,
  });
  const hash = await sha256(`${commitment.familyId}-${commitment.title}-${commitment.terms}-${commitment.startedAt}`);
  return { cid: `local:sha256:${hash}`, metadata: { sha256: hash } };
}

export async function writeLedger(commitment: FamilyCommitment): Promise<LedgerResult> {
  // Ledger writes are additive and read-reconstructable from Neon audit events.
  // In a future phase, replace this with real testnet/mainnet txs.
  if (process.env.LEDGER_NETWORK === "simulated") {
    const hash = await sha256(`${commitment.familyId}-${commitment.id}-${Date.now()}`);
    return { txHash: hash, network: "simulated" };
  }
  return {};
}
