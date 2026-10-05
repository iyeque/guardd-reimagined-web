import { db } from '../server/db.js';
import { communityEvents, trendingDiscussions } from '../shared/schema.js';

async function main() {
  try {
    const [events, discussions] = await Promise.all([
      db.select().from(communityEvents),
      db.select().from(trendingDiscussions)
    ]);
    console.log('Events:', events.length);
    console.log('Discussions:', discussions.length);
    console.log('First event:', events[0]?.title);
    console.log('First discussion:', discussions[0]?.title);
  } catch (err) {
    console.error('Query failed:', err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
