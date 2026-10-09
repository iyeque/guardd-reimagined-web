/**
 * One-time seed: mint a family access token for every family that already has
 * commitments but no `family_access` row.
 *
 * Run once after deploying the family_access table:
 *   npx tsx scripts/seed-family-tokens.ts
 *
 * Prints the tokens so they can be handed to each family (or pasted into the
 * admin recovery endpoint). Safe to re-run — families that already have a
 * token are skipped.
 */
import { db } from "../server/db.js";
import { familyCommitments, familyAccess } from "../shared/schema.js";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";

const families = await db
  .selectDistinct({ familyId: familyCommitments.familyId })
  .from(familyCommitments);

console.log(`found ${families.length} distinct family id(s) with commitments`);

let created = 0;
let skipped = 0;

for (const { familyId } of families) {
  const [existing] = await db
    .select({ token: familyAccess.token })
    .from(familyAccess)
    .where(eq(familyAccess.familyId, familyId))
    .limit(1);

  if (existing) {
    skipped += 1;
    console.log(`  skip  ${familyId} (already has a token)`);
    continue;
  }

  const token = randomBytes(32).toString("base64url");
  await db.insert(familyAccess).values({ familyId, token });
  created += 1;
  console.log(`  seed  ${familyId} -> ${token}`);
}

console.log(`\ncreated ${created}, skipped ${skipped}`);
process.exit(0);
