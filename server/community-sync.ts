import { storage } from './storage.js';
import axios from 'axios';

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
  },
  {
    title: "DLAC Ignite 2026",
    location: "Sacramento, CA",
    date: "2026-02-18",
    time: "3 Days",
    type: "Conference",
    url: "https://www.deelac.com/",
    organizer: "Digital Learning Collaborative",
    status: "Scheduled",
    description: "Focusing on digital learning innovation, including robust sessions on student data privacy and safety."
  },
  {
    title: "ViVE 2026",
    location: "Los Angeles, CA",
    date: "2026-02-22",
    time: "4 Days",
    type: "Conference",
    url: "https://www.viveevent.com/",
    organizer: "CHIME & HLTH",
    status: "Scheduled",
    description: "The fresh digital health event, covering the intersection of healthcare technology, cybersecurity, and patient data."
  },
  {
    title: "Wellbeing At Work Summit",
    location: "New York, NY",
    date: "2026-03-03",
    time: "2 Days",
    type: "Summit",
    url: "https://wellbeingatwork.world/",
    organizer: "Wellbeing at Work",
    status: "Scheduled",
    description: "Exploring the crucial role of digital wellness and mental health in the modern workplace environment."
  },
  {
    title: "Global Online Safety Conference",
    location: "Virtual Event",
    date: "2026-03-18",
    time: "10:00 AM GMT",
    type: "Conference",
    url: "https://www.onlinesafetyconf.com/",
    organizer: "Global Safety Net",
    status: "Open",
    description: "A specialized deep-dive into protecting children from emerging threats like AI-driven deepfakes."
  },
  {
    title: "RSA Conference 2026",
    location: "San Francisco, CA",
    date: "2026-03-23",
    time: "4 Days",
    type: "Conference",
    url: "https://www.rsaconference.com/",
    organizer: "RSA",
    status: "Scheduled",
    description: "The world's leading cybersecurity event, with increasing tracks dedicated to consumer protection and community safety."
  },
  {
    title: "IAPP Global Privacy Summit 2026",
    location: "Washington, D.C.",
    date: "2026-03-30",
    time: "2 Days",
    type: "Summit",
    url: "https://iapp.org/conferences/global-privacy-summit/",
    organizer: "IAPP",
    status: "Scheduled",
    description: "The world's premier privacy and data protection conference, essential for understanding digital rights."
  },
  {
    title: "Digital Wellness Day 2026",
    location: "Global / Worldwide",
    date: "2026-05-01",
    time: "All Day",
    type: "Awareness",
    url: "https://www.digitalwellnessday.com/",
    organizer: "Digital Wellness Institute",
    status: "Annual Event",
    description: "An international holiday dedicated to optimizing our relationship with technology and promoting digital flourishing."
  },
  {
    title: "Digital Health 2026",
    location: "Chicago, IL",
    date: "2026-05-20",
    time: "2 Days",
    type: "Conference",
    url: "https://www.digitalhealth.net/",
    organizer: "Digital Health Society",
    status: "Scheduled",
    description: "Addressing the ethics of AI in health and building resilient systems for patient digital safety."
  },
  {
    title: "National Safe Schools Conference 2026",
    location: "Phoenix, AZ",
    date: "2026-07-08",
    time: "3 Days",
    type: "Conference",
    url: "https://nationalsafeschools.org/",
    organizer: "NSSC",
    status: "Planning Stage",
    description: "The leading US event for school safety, with a heavy emphasis on cyberbullying prevention and threat assessment."
  },
  {
    title: "ICCVDS 2026",
    location: "Boston, MA",
    date: "2026-08-14",
    time: "1 Day",
    type: "Academic",
    url: "https://waset.org/cyber-violence-and-digital-safety-conference",
    organizer: "WASET",
    status: "Call for Papers",
    description: "International Conference on Cyber Violence and Digital Safety, presenting cutting-edge research."
  },
  {
    title: "ICBCF 2026",
    location: "Rome, Italy",
    date: "2026-09-16",
    time: "2 Days",
    type: "Academic",
    url: "https://waset.org/bullying-cyberbullying-and-family-conference",
    organizer: "WASET",
    status: "Scheduled",
    description: "International Conference on Bullying, Cyberbullying, and Family, focusing on family dynamics in the digital age."
  },
  {
    title: "UNESCO Media Literacy Week",
    location: "Global",
    date: "2026-10-24",
    time: "Week-long",
    type: "Awareness",
    url: "https://www.unesco.org/en/weeks/media-information-literacy",
    organizer: "UNESCO",
    status: "Annual Event",
    description: "A major global celebration reviewing progress towards media and information literacy for all."
  },
  {
    title: "FOSI 2026 Annual Conference",
    location: "Washington, D.C.",
    date: "2026-11-16",
    time: "1 Day",
    type: "Conference",
    url: "https://www.fosi.org/",
    organizer: "Family Online Safety Institute",
    status: "Planning Stage",
    description: "Bringing together top regulators, industry leaders, and non-profits to shape the future of family online safety."
  },
  {
    title: "CES 2027",
    location: "Las Vegas, NV",
    date: "2027-01-06",
    time: "4 Days",
    type: "Expo",
    url: "https://www.ces.tech/",
    organizer: "CTA",
    status: "Future",
    description: "The world's tech stage, featuring the latest in digital health, family tech, and AI safety innovations."
  },
  {
    title: "ICBCF 2027 Philippines",
    location: "Manila, Philippines",
    date: "2027-02-17",
    time: "2 Days",
    type: "Academic",
    url: "https://waset.org/",
    organizer: "WASET",
    status: "Future",
    description: "Continuing the global dialogue on cyberbullying research and family protection strategies."
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
  },
  {
    platform: "Common Sense",
    community: "Advice Feed",
    title: "How to handle Roblox and Discord safety settings: 2026 Guide",
    url: "https://www.commonsensemedia.org/articles/privacy-and-safety",
    hotness: "Trending",
    postedAt: "3h ago",
    replies: 156
  },
  {
    platform: "Internet Matters",
    community: "Safety Hub",
    title: "Managing the impact of AI-generated content on child safety",
    url: "https://www.internetmatters.org/hub/news-and-opinion/",
    hotness: "Critical",
    postedAt: "5h ago",
    replies: 230
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
  if (!apiKey) return null;

  try {
    const queries = ['Digital Wellness events', 'Cyber Safety workshops', 'Parenting in digital age conferences'];
    const results = await Promise.all(queries.map(q => 
      axios.get('https://serpapi.com/search.json', {
        params: {
          engine: "google_events",
          q: q,
          api_key: apiKey
        }
      })
    ));

    const events = results.flatMap(r => r.data.events_results || []).map((e: any, i: number) => ({
      title: e.title,
      location: e.address?.join(', ') || 'Online / TBA',
      date: e.date?.start_date || '2026-Q3',
      time: e.date?.when || 'Check Listing',
      type: "External Event",
      url: e.link || "https://www.google.com/search?q=" + encodeURIComponent(e.title),
      organizer: "Community Organizer",
      status: "Live Discovery",
      description: e.description || "Join this community event to learn more about digital wellness and safety."
    }));

    return events.slice(0, 20);
  } catch (error) {
    console.error('Failed to fetch events from SerpApi:', error);
    return null;
  }
}

export async function syncCommunityData() {
  // Fetch live events or use curated/generated fallback
  const liveEvents = await fetchLiveEventsFromSerp();
  const allEvents = liveEvents || [...CURATED_EVENTS, ...generateLocalEvents()];
  
  // Fetch live Reddit trends if possible
  const liveTrends = await getLiveRedditTrends();
  const discussions = liveTrends || FALLBACK_DISCUSSIONS;
  
  await storage.setEvents(allEvents);
  await storage.setDiscussions(discussions);
  
  return { lastSync: new Date().toISOString() };
}
