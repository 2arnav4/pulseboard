import { CATEGORIES, type Category, type ContentItem } from "@/types/content";
import { createRandom, hoursAgo, pick } from "./random";

/**
 * The social feed is a mock API by design (the brief allows it): real Twitter/Instagram
 * APIs need paid or app-reviewed access. Posts are generated deterministically.
 */
const HANDLES = ["@devdiaries", "@marketpulse", "@pitchside", "@labnotes", "@wellnesswire", "@screenbuzz", "@citydesk", "@codecraft", "@fieldtrip", "@dataviz"] as const;

const POSTS: Record<Category, { hashtags: string[]; lines: readonly string[] }> = {
  technology: {
    hashtags: ["#tech", "#ai", "#webdev"],
    lines: ["Shipped dark mode today and it only took three refactors", "Hot take: most apps do not need microservices", "TypeScript strict mode caught a bug before prod again", "Trying out the new browser devtools, the performance panel is great"],
  },
  business: {
    hashtags: ["#business", "#startups", "#finance"],
    lines: ["Quarterly numbers are in and the margins finally look healthy", "Bootstrapped to profitability, ask me anything", "Every pricing page should show the annual discount clearly", "Hiring our first sales lead next month"],
  },
  sports: {
    hashtags: ["#sports", "#cricket", "#football"],
    lines: ["What a finish last night, still cannot believe that catch", "Training camp starts Monday, the squad looks sharp", "Stats say the left-hander should open the innings", "Stadium atmosphere was electric for the derby"],
  },
  science: {
    hashtags: ["#science", "#space", "#research"],
    lines: ["The new telescope images are unreal, look at those galaxies", "Peer review finished, paper accepted after two rounds", "Lab result replicated for the third time, we are confident now", "Tonight is a good night for the meteor shower"],
  },
  health: {
    hashtags: ["#health", "#fitness", "#wellbeing"],
    lines: ["Ten-minute walk after lunch is now a team habit", "Sleep tracking changed how I plan my week", "Hydration reminder for everyone working late", "Started strength training twice a week, already feel better"],
  },
  entertainment: {
    hashtags: ["#movies", "#music", "#tv"],
    lines: ["That season finale cliffhanger was cruel", "The soundtrack for this film is on repeat", "Unpopular opinion: the sequel was better", "Festival lineup just dropped and it is stacked"],
  },
  general: {
    hashtags: ["#news", "#community", "#travel"],
    lines: ["Our neighbourhood clean-up drive collected 200 kg of litter", "The new metro line cut my commute in half", "Local library now lends out tools as well as books", "Sunset from the city viewpoint never gets old"],
  },
};

export const SOCIAL_POST_COUNT_PER_CATEGORY = 12;

export function buildSocialPost(category: Category, index: number, publishedAt: string): ContentItem {
  const random = createRandom(index * 31 + category.length * 7);
  const { hashtags, lines } = POSTS[category];
  const author = pick(HANDLES, random);
  const tag = pick(hashtags, random);
  const text = lines[index % lines.length];
  return {
    id: `social-${category}-${index}`,
    source: "social",
    title: `${author}: ${text}`,
    // The title carries the post text and the hashtags render as links, so there is nothing left to describe.
    description: "",
    imageUrl: null,
    url: `https://example.com/social/${category}/${index}`,
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
