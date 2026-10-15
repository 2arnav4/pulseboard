import { CATEGORIES, type Category, type ContentItem } from "@/types/content";
import { createRandom, hoursAgo, pick } from "./random";

/**
 * The social feed is a mock API by design (the brief allows it): real Twitter/Instagram
 * APIs need paid or app-reviewed access. Posts are generated deterministically.
 */
/** Each category has its own accounts, so a sports handle never posts about lab results. */
const POSTS: Record<Category, { handles: readonly string[]; hashtags: string[]; lines: readonly string[] }> = {
  technology: {
    handles: ["@devdiaries", "@codecraft"],
    hashtags: ["#tech", "#ai", "#webdev"],
    lines: [
      "Shipped dark mode today and it only took three refactors",
      "Hot take: most apps do not need microservices",
      "TypeScript strict mode caught a bug before prod again",
      "Trying out the new browser devtools, the performance panel is great",
      "Paired with an AI assistant all afternoon and still wrote the tests myself",
      "Our CI went from twelve minutes to four after caching dependencies",
      "Accessibility audit done, every button finally has a label",
      "Reminder: read the docs before adding another npm package",
    ],
  },
  business: {
    handles: ["@marketpulse", "@foundernotes"],
    hashtags: ["#business", "#startups", "#finance"],
    lines: [
      "Quarterly numbers are in and the margins finally look healthy",
      "Bootstrapped to profitability, ask me anything",
      "Every pricing page should show the annual discount clearly",
      "Hiring our first sales lead next month",
      "Closed our seed round after forty investor calls",
      "Customer interviews beat dashboards for finding what to build next",
      "Moved invoicing to a single tool and saved a day every month",
      "Small shops near the station are reporting their best week this year",
    ],
  },
  sports: {
    handles: ["@pitchside", "@matchday"],
    hashtags: ["#sports", "#cricket", "#football"],
    lines: [
      "What a finish last night, still cannot believe that catch",
      "Training camp starts Monday, the squad looks sharp",
      "Stats say the left-hander should open the innings",
      "Stadium atmosphere was electric for the derby",
      "Penalty shootout again, my nerves cannot take this every week",
      "Youth academy graduate scored on debut, remember the name",
      "Rain delay means a reserve day for the final",
      "Ran my first half marathon this morning, legs are gone",
    ],
  },
  science: {
    handles: ["@labnotes", "@dataviz"],
    hashtags: ["#science", "#space", "#research"],
    lines: [
      "The new telescope images are unreal, look at those galaxies",
      "Peer review finished, paper accepted after two rounds",
      "Lab result replicated for the third time, we are confident now",
      "Tonight is a good night for the meteor shower",
      "Plotted ten years of rainfall data and the trend is clear",
      "Our rover team just got the first soil readings back",
      "Open data makes replication so much easier, publish your datasets",
      "Spent the day calibrating sensors, glamorous science life",
    ],
  },
  health: {
    handles: ["@wellnesswire", "@stepcount"],
    hashtags: ["#health", "#fitness", "#wellbeing"],
    lines: [
      "Ten-minute walk after lunch is now a team habit",
      "Sleep tracking changed how I plan my week",
      "Hydration reminder for everyone working late",
      "Started strength training twice a week, already feel better",
      "Swapped the evening scroll for a book, sleeping an hour earlier",
      "Meal prep Sunday done, five lunches ready",
      "Stretch breaks every hour fixed my back pain",
      "Free health check camp at the community centre this weekend",
    ],
  },
  entertainment: {
    handles: ["@screenbuzz", "@popcornclub"],
    hashtags: ["#movies", "#music", "#tv"],
    lines: [
      "That season finale cliffhanger was cruel",
      "The soundtrack for this film is on repeat",
      "Unpopular opinion: the sequel was better",
      "Festival lineup just dropped and it is stacked",
      "Rewatched the original trilogy before the new one comes out",
      "This indie film deserves a much bigger audience",
      "Live concert tonight, front row tickets secured",
      "The book was better, but the adaptation is close",
    ],
  },
  general: {
    handles: ["@citydesk", "@fieldtrip"],
    hashtags: ["#news", "#community", "#travel"],
    lines: [
      "Our neighbourhood clean-up drive collected 200 kg of litter",
      "The new metro line cut my commute in half",
      "Local library now lends out tools as well as books",
      "Sunset from the city viewpoint never gets old",
      "Weekend trek to the hill fort, highly recommend the early start",
      "Farmers market is back on Saturdays from this week",
      "Volunteers needed for the park restoration on Sunday",
      "Found a tiny cafe that still serves filter coffee in steel tumblers",
    ],
  },
};

/**
 * Text for posts pushed over the real-time stream. Kept apart from the feed's lines so a
 * "new" post never repeats one already on screen.
 */
const LIVE_LINES: Record<Category, readonly string[]> = {
  technology: ["Just pushed a fix for the login bug, deploy is rolling out", "Release notes are up, the new search is finally live", "Server costs dropped 30% after switching to edge caching"],
  business: ["Breaking: our app just crossed 10,000 paying users", "Board meeting wrapped, we are expanding to two new cities", "Earnings call starting now, follow along here"],
  sports: ["Goal! Late equaliser sends the stadium wild", "Toss won, we are batting first today", "Team sheet is out, two changes from last week"],
  science: ["Launch window confirmed for tomorrow morning", "Live: watching the eclipse from the observatory", "Preprint just went up, feedback very welcome"],
  health: ["Just finished a 5 km run before the rain started", "Clinic hours extended this week for flu shots", "Day 30 of no sugar in my tea, feeling great"],
  entertainment: ["Trailer just dropped and the internet is losing it", "Box office numbers are in for the weekend", "Surprise album release at midnight, listening now"],
  general: ["Traffic update: the main bridge is open again", "Power is back in our area after the storm", "Street food festival opens in an hour, see you there"],
};

/** A post "published" just now for the real-time stream; `sequence` picks the line and author. */
export function buildLivePost(category: Category, sequence: number, publishedAt: string): ContentItem {
  const { handles, hashtags } = POSTS[category];
  const lines = LIVE_LINES[category];
  const author = handles[sequence % handles.length];
  return {
    id: `social-live-${Date.parse(publishedAt)}-${sequence}`,
    source: "social",
    title: `${author}: ${lines[sequence % lines.length]}`,
    description: "",
    imageUrl: null,
    url: "",
    category,
    publishedAt,
    author,
    likes: 0,
    hashtags: [hashtags[sequence % hashtags.length]],
  };
}

/** One post per line, so no text repeats within a category. */
export const SOCIAL_POST_COUNT_PER_CATEGORY = 8;

export function buildSocialPost(category: Category, index: number, publishedAt: string): ContentItem {
  const random = createRandom(index * 31 + category.length * 7);
  const { handles, hashtags, lines } = POSTS[category];
  const author = handles[index % handles.length];
  const tag = pick(hashtags, random);
  const text = lines[index % lines.length];
  return {
    id: `social-${category}-${index}`,
    source: "social",
    title: `${author}: ${text}`,
    // The title carries the post text and the hashtags render as links, so there is nothing left to describe.
    description: "",
    imageUrl: null,
    // A mock post has no page anywhere else, so the card shows no external link.
    url: "",
    category,
    publishedAt,
    author,
    likes: Math.floor(random() * 5000),
    hashtags: [tag],
  };
}

function buildMockSocial(): ContentItem[] {
  const items: ContentItem[] = [];
  for (const category of CATEGORIES) {
    for (let index = 0; index < SOCIAL_POST_COUNT_PER_CATEGORY; index++) {
      items.push(buildSocialPost(category, index, hoursAgo(index * 2 + 1)));
    }
  }
  return items;
}

export const MOCK_SOCIAL: readonly ContentItem[] = buildMockSocial();
