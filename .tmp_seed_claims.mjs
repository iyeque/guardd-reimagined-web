import { readFileSync } from 'fs';
import { join } from 'path';
import { Stats } from './server/storage.js';

const envPath = join(process.cwd(), '.env');
const text = readFileSync(envPath, 'utf8');
for (const rawLine of text.split(/\r?\n/)) {
  const line = rawLine.trim().replace(/\r$/, '');
  if (!line || line.startsWith('#')) continue;
  const eq = line.indexOf('=');
  if (eq <= 0) continue;
  const key = line.slice(0, eq).trim();
  const value = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
  if (key && !(key in process.env)) process.env[key] = value;
}

const { storage } = await import('./server/storage.js');

const defaults = [
  { slug: "families_helped", value: "50+", label: "Families Helped", context: "Supported families on their digital wellness journey." },
  { slug: "parents_success", value: "95%", label: "Parents Report Success", context: "Percentage of families reporting improved digital habits." },
  { slug: "resources", value: "1,000+", label: "Educational Resources", context: "Articles, guides, and tools available through the hub." },
  { slug: "quality_time_claim", value: "Families report more quality time", label: "After reducing digital distractions", context: "Outcome observed after families apply consistent boundaries." },
  { slug: "avg_screen_teens", value: "7+ Hours", label: "Average daily screen time for teens", context: "Common baseline from public usage studies; exact value varies by study and region." },
  { slug: "parents_worry", value: "60%", label: "Parents worry about their kids' screen use", context: "Survey-based finding on parental concerns." },
  { slug: "depression_risk", value: "2x", label: "Risk of depression with high social media use", context: "Observed risk elevation in some research cohorts; not deterministic." },
  { slug: "families_leveled_up", value: "Over 1,200 families", label: "Families leveled up", context: "Participant count milestone for gamified missions." },
  { slug: "response_time", value: "We typically respond within 24 hours.", label: "Contact reply time", context: "Current support response target during business hours." }
];

const out = [];
for (const row of defaults) {
  const created = await storage.upsertClaim(row);
  out.push({ id: created.id, slug: created.slug, value: created.value });
}
console.log(JSON.stringify({ ok: true, claims: out }, null, 2));
