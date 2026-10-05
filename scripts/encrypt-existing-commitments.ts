/**
 * One-time migration: encrypt existing plaintext family commitment records.
 * Run with: npx tsx scripts/encrypt-existing-commitments.ts
 * Requires: DATABASE_URL and ENCRYPTION_KEY env vars
 */
import { db } from "../server/db.js";
import { familyCommitments } from "../shared/schema.js";
import { encryptField } from "../server/crypto.js";
import { eq } from "drizzle-orm";

function isEncrypted(val: string): boolean {
  try {
    const buf = Buffer.from(val, "base64");
    return buf.length >= 13; // 12 IV + at least 1 byte ciphertext
  } catch {
    return false;
  }
}

async function main() {
  const rows = await db.select().from(familyCommitments);
  console.log(`Found ${rows.length} commitment records`);

  let encrypted = 0;
  let skipped = 0;

  for (const row of rows) {
    const updates: Partial<typeof familyCommitments.$inferInsert> = {};

    if (!isEncrypted(row.terms)) {
      updates.terms = await encryptField(row.terms);
    }
    if (!isEncrypted(row.members)) {
      updates.members = await encryptField(row.members);
    }

    if (Object.keys(updates).length > 0) {
      await db.update(familyCommitments).set(updates).where(eq(familyCommitments.id, row.id));
      encrypted++;
    } else {
      skipped++;
    }
  }

  console.log(`Encrypted: ${encrypted}, Already encrypted: ${skipped}`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
