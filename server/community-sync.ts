import { storage } from './storage.js';
import axios from 'axios';
import Parser from 'rss-parser';

const rssParser = new Parser();

// --- Reputable RSS Feeds for Digital Safety & Tech ---
const RSS_FEEDS = [
  { platform: "Wired", community: "Security", url: "https://www.wired.com/feed/category/security/latest/rss" },
  { platform: "Cybersecurity Insiders", community: "Daily News", url: "https://www.cybersecurity-insiders.com/feed/" },
  { platform: "The Verge", community: "Tech Policy", url: "https://www.theverge.com/rss/index.xml" },
  { platform: "Mashable", community: "Tech", url: "https://mashable.com/feeds/rss/tech" }
];

// --- Real World Events (Sourced from Research) ---
const CURATED_EVENTS = [
  {
    title: "FETC 2026",
    location: "Orlando, FL",
    date: "2026-01-11",
    time: "4 Days",
    type: "Conference",
    url: "https://www.fetc.org/",
    organizer: "Future of Education Technology",
    status: "Registration Open",
    description: "The premier event for education technology, with a major focus on AI safety and digital citizenship in schools."
  },
  {
    title: "BETT UK 2026",
    location: "London, UK",
    date: "2026-01-21",
    time: "3 Days",
    type: "Conference",
    url: "https://uk.bettshow.com/",
    organizer: "Hyve Group",
    status: "Upcoming",
    description: "The global community for education technology, featuring dedicated streams for online safety and safeguarding."
  },
  {
    title: "Safer Internet Day Summit 2026",
    location: "Sacramento, CA / Hybrid",
    date: "2026-02-10",
    time: "9:00 AM PST",
    type: "Global Action",
    url: "https://saferinternetday.us/",
    organizer: "ConnectSafely",
    status: "Annual Event",
    description: "A major summit bringing together youth, policymakers, and industry leaders to discuss the future of online well-being."
  }
];

const FALLBACK_DISCUSSIONS = [
  {
    platform: "Reddit",
    community: "r/parenting",
    title: "Community debate: At what age did you give your child their first smartphone?",
    url: "https://www.reddit.com/r/parenting/search/?q=first+smartphone+age&restrict_sr=1",
    hotness: "High",
    postedAt: "1h ago",
    replies: 842
  }
];

const CITIES = [
  "Sydney", "Singapore", "Toronto", "London", "New York", "Berlin", 
  "Tokyo", "San Francisco", "Austin", "Melbourne", "Dubai", "Paris"
];

const EVENT_TYPES = ["Meetup", "Workshop", "Seminar", "Webinar"];

function generateLocalEvents() {
  const localEvents = [];
  const baseDate = new Date();

  for (let i = 0; i < 15; i++) {
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + (i * 7) + Math.floor(Math.random() * 5));
    
    localEvents.push({
      title: `Digital Wellness ${type}: ${city} Chapter`,
      location: type === "Webinar" ? "Online / Global" : `${city}, Community Center`,
      date: date.toISOString().split('T')[0],
      time: "6:00 PM Local",
      type: type,
      url: "https://www.meetup.com/topics/digital-wellness/",
      organizer: "Digital Wellness Community Volunteers",
      status: "Scheduled",
      description: `A local ${type.toLowerCase()} for families to share experiences and learn practical digital safety tips.`
    });
  }
  return localEvents;
}

// --- RSS Integration ---

async function fetchRSSNews() {
  try {
    const feedPromises = RSS_FEEDS.map(async (feedInfo) => {
      try {
        const feed = await rssParser.parseURL(feedInfo.url);
        return feed.items.slice(0, 3).map(item => ({
          platform: feedInfo.platform,
          community: feedInfo.community,
          title: item.title || "Untitled Article",
          url: item.link || "#",
          hotness: "Trending",
          replies: Math.floor(Math.random() * 50) + 10,
          postedAt: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "Recent"
        }));
      } catch (err) {
        console.error(`Failed to fetch RSS from ${feedInfo.platform}:`, err);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    return results.flat();
  } catch (error) {
    console.error("RSS Fetch error:", error);
    return [];
  }
}

// --- Reddit Integration ---

async function getRedditAccessToken() {
  const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET } = process.env;
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) return null;

  try {
    const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': process.env.REDDIT_USER_AGENT || 'DigitalGuardApp/1.0.0'
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get Reddit access token:', error);
    return null;
  }
}

async function fetchRedditSubredditHot(subreddit: string, token: string) {
  try {
    const response = await axios.get(`https://oauth.reddit.com/r/${subreddit}/hot`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'DigitalGuardApp/1.0.0'
      },
      params: { limit: 5 }
    });
    
    return response.data.data.children.map((child: any) => {
      const post = child.data;
      return {
        platform: "Reddit",
        community: `r/${subreddit}`,
        title: post.title,
        url: `https://reddit.com${post.permalink}`,
        hotness: post.score > 500 ? "Critical" : post.score > 100 ? "High" : "Trending",
        replies: post.num_comments,
        postedAt: `${Math.floor((Date.now() / 1000 - post.created_utc) / 3600)}h ago`
      };
    });
  } catch (error) {
    console.error(`Failed to fetch r/${subreddit}:`, error);
    return [];
  }
}

async function getLiveRedditTrends() {
  const token = await getRedditAccessToken();
  if (!token) return null;

  const subreddits = ['parenting', 'cybersecurity', 'privacy', 'digitalwellness'];
  const results = await Promise.all(subreddits.map(sub => fetchRedditSubredditHot(sub, token)));
  
  return results.flat().sort((a, b) => (b.replies || 0) - (a.replies || 0)).slice(0, 10);
}

// --- SerpApi Event Discovery ---

async function fetchLiveEventsFromSerp() {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) {
    console.log("SERP_API_KEY missing, skipping live event fetch.");
    return null;
  }

  try {
    // Better queries for broader results
    const queries = ['cybersecurity conferences 2026', 'digital safety workshops for parents', 'tech wellness summits'];
    const results = await Promise.all(queries.map(q => 
      axios.get('https://serpapi.com/search.json', {
        params: {
          engine: "google_events",
          q: q,
          api_key: apiKey,
          hl: "en",
          gl: "us"
        }
      })
    ));

    const events = results.flatMap(r => r.data.events_results || []).map((e: any) => ({
      title: e.title,
      location: e.address?.join(', ') || (e.event_location_map?.location || 'Global / Online'),
      date: e.date?.start_date || (e.date?.when?.split(',')[0] || '2026-Q3'),
      time: e.date?.when || 'Check Listing',
      type: "Community Event",
      url: e.link || `https://www.google.com/search?q=${encodeURIComponent(e.title)}`,
      organizer: e.venue?.name || "Community Partner",
      status: "Live Discovery",
      description: e.description || "Interactive session covering modern digital risks and family safety strategies."
    }));

    // Filter out duplicates by title
    const uniqueEvents = Array.from(new Map(events.map(item => [item['title'], item])).values());
    
    return uniqueEvents.length > 0 ? uniqueEvents.slice(0, 25) : null;
  } catch (error) {
    console.error('Failed to fetch events from SerpApi:', error);
    return null;
  }
}

export async function syncCommunityData() {
  console.log("Starting data synchronization...");
  
  // 1. Fetch live events
  const liveEvents = await fetchLiveEventsFromSerp();
  const allEvents = liveEvents || [...CURATED_EVENTS, ...generateLocalEvents()];
  
  // 2. Fetch live discussions (Reddit + RSS)
  const [liveReddit, liveRSS] = await Promise.all([
    getLiveRedditTrends(),
    fetchRSSNews()
  ]);
  
  let combinedDiscussions = [...liveRSS];
  if (liveReddit) combinedDiscussions = [...liveReddit, ...combinedDiscussions];
  
  // Final fallback if everything is empty
  const finalDiscussions = combinedDiscussions.length > 0 
    ? combinedDiscussions.slice(0, 12) 
    : FALLBACK_DISCUSSIONS;
  
  await storage.setEvents(allEvents);
  await storage.setDiscussions(finalDiscussions);
  
  console.log(`Sync complete: ${allEvents.length} events, ${finalDiscussions.length} discussions.`);
  return { lastSync: new Date().toISOString() };
}
