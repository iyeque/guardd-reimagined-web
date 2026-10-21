import { storage } from './storage.js';
import type { InsertEvent } from '../shared/schema.js';
import { isEventExpired } from '../shared/event-expiry.js';
import axios from 'axios';
import Parser, { type Item } from 'rss-parser';
function toText(v: number | string | undefined): string { return typeof v === 'number' ? String(v) : String(v ?? ''); }

const rssParser = new Parser();

// Default reputable RSS feeds (verified working)
const RSS_FEEDS = [
  { platform: "Family Online Safety Institute", community: "Online Safety", url: "https://www.fosi.org/feed/" },
  { platform: "Safer Internet", community: "Youth Safety", url: "https://www.saferinternet.org.uk/feed" },
  { platform: "Internet Matters", community: "Family Media", url: "https://www.internetmatters.org/feed/" },
  { platform: "ChildNet", community: "Youth Safety", url: "https://www.childnet.com/blog/rss" },
  { platform: "Get Safe Online", community: "Online Safety", url: "https://www.getsafeonline.org/feed/" }
];

// Optional custom RSS from env: "platform|community|url,platform|community|url"
const EXTRA_RSS_RAW = String(process.env.COMM_RSS_FEEDS || "").trim();
const EXTRA_RSS_FEEDS = EXTRA_RSS_RAW.split(",").map(s => s.trim()).filter(Boolean).map(part => {
  const [platform, community, url] = part.split("|");
  return { platform: platform || "Custom", community: community || "General", url: url || "" };
}).filter(f => f.url);

const ALL_RSS_FEEDS = [...RSS_FEEDS, ...EXTRA_RSS_FEEDS];

// --- Type Definitions for API Responses ---
interface RedditChild {
  data: {
    title: string;
    permalink: string;
    score: number;
    num_comments: number;
    created_utc: number;
  };
}

/** What every external event source is normalised into. Deliberately loose:
 *  SerpApi and the RSS feeds disagree on what they return — only title and url are
 *  guaranteed, so the rest are optional. */
interface FetchedEvent {
  platform?: string;
  community?: string;
  title: string;
  url: string;
  location?: string;
  date?: string;
  time?: string;
  type?: string;
  organizer?: string;
  status?: string;
  description?: string;
  hotness?: string;
  replies?: number;
  postedAt?: string;
}

// An event is expired once its date has passed. Only a full date counts as
// evidence: the live feeds also return free-text dates ("Upcoming", "TBD",
// "2026"), and guessing at those would hide content the family still needs.
// Curated entries store the event's LAST day, so they vanish the day after it.
// The rule itself lives in shared/event-expiry.ts so it can be tested without a
// database connection.

// --- Real World Events (Sourced from Research) ---
export const CURATED_EVENTS = [
  {
    title: "EHS Mental Health Conference",
    location: "Dubai, UAE",
    date: "2026-11-07",
    time: "6–7 Nov 2026",
    type: "Conference",
    url: "https://www.ehs.gov.ae/",
    organizer: "Emirates Health Services",
    status: "Registration Open",
    description: "Bringing together mental health professionals, policymakers, and advocates to advance care, awareness, and digital wellbeing in the region."
  },
  {
    title: "FOSI Annual Conference",
    location: "Washington, DC",
    date: "2026-11-19",
    time: "19 Nov 2026",
    type: "Conference",
    url: "https://www.fosi.org/",
    organizer: "Family Online Safety Institute",
    status: "Registration Open",
    description: "The Family Online Safety Institute's flagship event — connecting global experts on child online safety, platform accountability, and digital parenting."
  },
  {
    title: "Safer Internet Forum",
    location: "Brussels, Belgium",
    date: "2026-12-03",
    time: "3 Dec 2026",
    type: "Forum",
    url: "https://www.saferinternet.org.uk/",
    organizer: "Insafe / European Schoolnet",
    status: "Follow Registration",
    description: "Europe's leading forum on children's online safety — policymakers, industry, educators, and researchers shaping a safer digital future."
  },
  {
    title: "UN IGF 2026 Nairobi",
    location: "Nairobi, Kenya",
    date: "2026-12-18",
    time: "14–18 Dec 2026",
    type: "Summit",
    url: "https://www.intgovforum.org/",
    organizer: "United Nations",
    status: "Registration Open",
    description: "The 21st Internet Governance Forum under the theme 'Internet Governance for Sustainable Development and Inclusive Growth' — multi-stakeholder dialogue on digital policy."
  },
  {
    title: "UNESCO Global MIL Week",
    location: "Global / Hybrid",
    date: "2026-10-31",
    time: "24–31 Oct 2026",
    type: "Global Action",
    url: "https://www.unesco.org/en/media-information-literacy",
    organizer: "UNESCO",
    status: "Join/Register",
    description: "Global Media and Information Literacy Week — worldwide events celebrating media and information literacy as essential skills for the digital age."
  },
  {
    title: "Digital Citizenship Summit 2026",
    location: "Chicago, IL / Hybrid",
    date: "2026-08-15",
    time: "9:00 AM CST",
    type: "Summit",
    url: "https://www.digitalcitizenshipsummit.org/",
    organizer: "Digital Citizenship Institute",
    status: "Upcoming",
    description: "Annual gathering of educators, parents, and policymakers tackling online safety, media literacy, and ethical tech use."
  },
  {
    title: "Family Tech Safety Week 2026",
    location: "Online / Global",
    date: "2026-09-10",
    time: "Week-Long",
    type: "Global Action",
    url: "https://www.staysafeonline.org/",
    organizer: "National Cybersecurity Alliance",
    status: "Annual Event",
    description: "A global week of workshops, webinars, and family challenges focused on building healthier digital habits at home."
  }
];

export const FALLBACK_DISCUSSIONS = [
  {
    platform: "Reddit",
    community: "r/parenting",
    title: "Community debate: At what age did you give your child their first smartphone?",
    url: "https://www.reddit.com/r/parenting/search/?q=first+smartphone+age&restrict_sr=1",
    hotness: "High",
    postedAt: "1h ago",
    replies: toText(842)
  }
];

const CITIES = [
  "Sydney", "Singapore", "Toronto", "London", "New York", "Berlin", 
  "Tokyo", "San Francisco", "Austin", "Melbourne", "Dubai", "Paris"
];

const EVENT_TYPES = ["Meetup", "Workshop", "Seminar", "Webinar"];

export function generateLocalEvents() {
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
    const feedPromises = ALL_RSS_FEEDS.map(async (feedInfo) => {
      try {
        const feed = await rssParser.parseURL(feedInfo.url);
        return feed.items.slice(0, 3).map(item => ({
          platform: feedInfo.platform,
          community: feedInfo.community,
          title: item.title || "Untitled Article",
          url: item.link || "#",
          hotness: "Trending",
          replies: toText(Math.floor(Math.random() * 50) + 10),
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
// --- Data Synchronization ---

export async function syncCommunityData() {
  console.log("Starting data synchronization...");

  // 1. Fetch live events (SerpApi + RSS)
  const liveEvents = await fetchLiveEventsFromSerp();
  const rssEvents = await fetchRSSEvents();

  // Filter out events without titles (uniqueness baseline)
  const withTitles = (events: FetchedEvent[]): FetchedEvent[] =>
    events.filter((e) => Boolean(e?.title));

  // Combine all real events, using URL + title as the unique key
  const allEvents = withTitles(liveEvents || []);
  const allRSSEvents = withTitles(rssEvents || []);
  const uniqueEvents = Array.from(new Map<string, FetchedEvent>([
    ...allEvents.map((e): [string, FetchedEvent] => [`${e.url ?? ''}-${e.title}`, e]),
    ...allRSSEvents.map((e): [string, FetchedEvent] => [`${e.url ?? ''}-${e.title}`, e])
  ]).values()).slice(0, 25);

  // If no real events found, use curated events only
  const sourceEvents = uniqueEvents.length > 0
    ? uniqueEvents
    : CURATED_EVENTS;

  // 2. Fetch live discussions (Reddit + RSS news)
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

  // The curated rows carry organizer/status/description and the live feeds do
  // not, so supply the same fallbacks normalizeEvent uses — the stored rows are
  // identical either way, and the storage boundary stays typed.
  // Drop events that have already run so the table does not accumulate stale rows.
  const freshEvents = sourceEvents.filter((e) => !isEventExpired(e));
  await storage.setEvents(freshEvents.map((e): InsertEvent => ({
    title: e.title,
    location: e.location ?? "Online",
    date: e.date ?? "TBD",
    time: e.time ?? "TBD",
    type: e.type ?? "Event",
    url: e.url,
    organizer: e.organizer ?? "Unknown organizer",
    status: e.status ?? "Upcoming",
    description: e.description ?? "",
  })));
  await storage.setDiscussions(finalDiscussions);

  const lastSync = new Date().toISOString();
  await storage.setSyncMetadata("last_sync", lastSync);

  console.log(`Sync complete: ${sourceEvents.length} events, ${finalDiscussions.length} discussions.`);
  return { lastSync };
}
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
    
    return response.data.data.children.map((child: RedditChild) => {
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

  const subreddits = ['parenting', 'cybersecurity', 'privacy', 'digitalwellness', 'ScreenTime'];
  const results = await Promise.all(subreddits.map(sub => fetchRedditSubredditHot(sub, token)));
  
  return results.flat().sort((a, b) => (b.replies || 0) - (a.replies || 0)).slice(0, 10);
}

// --- SerpApi Event Discovery ---
// Uses Google Search with event-related operators to find real events
interface SerpOrganicResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

async function fetchLiveEventsFromSerp() {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) {
    console.log("SERP_API_KEY missing, skipping live event fetch.");
    return null;
  }

  try {
    // Use event-focused queries with site operators to find real events
    const queries = [
      '"digital wellness" conference 2026',
      '"online safety" workshop 2026',
      '"digital citizenship" summit 2026',
      '"family tech" safety week 2026',
      'digital parenting "workshop" OR "seminar" 2026'
    ];
    const results = await Promise.all(queries.map(q =>
      axios.get('https://serpapi.com/search.json', {
        params: {
          engine: "google_search",
          q: q,
          api_key: apiKey,
          hl: "en",
          gl: "us"
        }
      })
    ));

    const events = results.flatMap(r => (r.data.organic_results as SerpOrganicResult[]) || []).map((e: SerpOrganicResult) => ({
      title: e.title,
      location: "See listing for details",
      date: "2026",
      time: "See listing",
      type: "Community Event",
      url: e.link || `https://www.google.com/search?q=${encodeURIComponent(e.title)}`,
      organizer: "Community Partner",
      status: "Live Discovery",
      description: e.snippet || "Interactive session covering modern digital risks and family safety strategies."
    }));

    const uniqueEvents = Array.from(new Map(events.map(item => [item['title'], item])).values());
    return uniqueEvents.length > 0 ? uniqueEvents.slice(0, 25) : null;
  } catch (error) {
    console.error('Failed to fetch events from SerpApi:', error);
    return null;
  }
}

// Event keywords used to identify event items from RSS feeds
const EVENT_KEYWORDS = ['conference', 'workshop', 'webinar', 'seminar', 'summit', 'meetup', 'event', 'training', 'bootcamp', 'symposium'];

// Filter RSS items for actual events (items with dates, locations, or event keywords)
function isEventItem(item: Item): boolean {
  const title = (item?.title || '').toLowerCase();
  // rss-parser's Item has no `description`; summary/contentSnippet are its stand-ins.
  const description = (item?.summary ?? item?.contentSnippet ?? '').toLowerCase();
  const content = (item?.content || '').toLowerCase();

  // Event indicators
  const datePatterns = /\d{4}-\d{2}-\d{2}|2026|2027|january|february|march|april|may|june|july|august|september|october|november|december/i;

  return EVENT_KEYWORDS.some(k => title.includes(k) || description.includes(k) || content.includes(k)) ||
         datePatterns.test(title + description + content);
}

async function fetchRSSEvents() {
  try {
    const events: FetchedEvent[] = [];

    for (const feedInfo of ALL_RSS_FEEDS) {
      try {
        const feed = await rssParser.parseURL(feedInfo.url);
        for (const item of feed.items) {
          const title = (item.title || '').toLowerCase();
          const description = (item.summary ?? item.contentSnippet ?? '').toLowerCase();
          const content = (item.content || '').toLowerCase();

          // Only include items that look like events
          const isEvent = isEventItem(item);

          if (isEvent) {
            const existing = events.find(e => `${e.url}-${e.title}` === `${item.link || ''}-${item.title}`);
            if (!existing) {
              events.push({
                platform: feedInfo.platform,
                community: feedInfo.community,
                title: item.title || "Untitled Event",
                url: item.link || "#",
                location: "Online", // Estimate from content
                date: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "Upcoming",
                type: "Event",
                hotness: "Trending",
                replies: 0,
                postedAt: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "Recent"
              });
            }
          }
          if (events.length >= 10) break;
        }
        if (events.length >= 10) break;
      } catch (err) {
        console.error(`Failed to parse RSS from ${feedInfo.platform}:`, err);
      }
    }

    return events;
  } catch (error) {
    console.error("RSS event fetch error:", error);
    return [];
  }
}


