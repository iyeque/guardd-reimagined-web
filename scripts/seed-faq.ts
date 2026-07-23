import { db } from "../server/db.js";
import { faqChunks } from "../shared/schema.js";
import { faqSeed } from "../server/faq-seed.js";

async function main() {
  await db.insert(faqChunks).values(faqSeed);
  console.log(`Seeded ${faqSeed.length} FAQ chunks.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
