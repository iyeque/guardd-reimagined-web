import { db } from '../server/db.js';
import { communityEvents, trendingDiscussions } from '../shared/schema.js';

async function main() {
  try {
    const [events, discussions] = await Promise.all([
      db.select().from(communityEvents),
      db.select().from(trendingDiscussions)
    ]);
    console.log('=== TOTAL ===');
    console.log('Events:', events.length);
    console.log('Discussions:', discussions.length);
    console.log('');
    console.log('=== FIRST 5 EVENTS ===');
    events.slice(0, 5).forEach((e, i) => console.log(`${i+1}. ${e?.title ?? 'N/A'}`));
    console.log('');
    console.log('=== ALL DISCUSSIONS ===');
    discussions.forEach((d, i) => console.log(`${i+1}. ${d?.title ?? 'N/A'}`));
  } catch (err) {
    console.error('Query failed:', err);
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
