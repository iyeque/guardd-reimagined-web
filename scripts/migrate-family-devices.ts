/**
 * Reshape family_access from one-token-per-family to one-token-per-device.
 *
 * The PK moves from family_id alone to (family_id, token) so a family can have
 * several independently revocable devices. Only two rows exist, so drop and
 * recreate is safer than an in-place PK migration.
 *
 * Run once, after `npm run db:push`:
 *   npx tsx scripts/migrate-family-devices.ts
 *
 * Prints the reissued tokens so they can be handed to each family. Existing
 * tokens are intentionally NOT preserved — they were minted under the old
 * one-per-family model and re-issuing is cleaner than carrying them over.
 */
import { db } from "../server/db.js";
import { familyAccess, familyCommitments } from "../shared/schema.js";
import { randomBytes } from "node:crypto";

const families = await db
  .selectDistinct({ familyId: familyCommitments.familyId })
  .from(familyCommitments);

console.log(`found ${families.length} distinct family id(s)`);

for (const { familyId } of families) {
  const token = randomBytes(32).toString("base64url");
  await db.insert(familyAccess).values({ familyId, token, label: "First device" });
  console.log(`  ${familyId} -> ${token}`);
}

console.log("\nDone. Paste the matching token into /family-commitments on each device.");
process.exit(0);
