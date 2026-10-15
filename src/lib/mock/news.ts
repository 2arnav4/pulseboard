import { CATEGORIES, type Category, type ContentItem } from "@/types/content";
import { createRandom, hoursAgo, pick } from "./random";

/**
 * Demo headlines used when NEWS_API_KEY is missing, the daily quota is used up,
 * or MOCK_APIS=1. Cards built from this data are flagged as "Demo data" in the UI.
 */
const HEADLINES: Record<Category, readonly string[]> = {
  technology: [
    "Open-source AI model tops coding benchmark",
    "Chipmakers race to ship 2nm processors",
    "Browser vendors agree on new privacy standard",
    "Startup unveils battery that charges in five minutes",
    "Major cloud outage exposes single-region risk",
    "Quantum computing firm reports error-correction milestone",
  ],
  business: [
    "Markets rally as inflation cools for third month",
    "Retail giant expands same-day delivery to 40 cities",
    "Fintech startups shift focus to profitability",
    "Central bank holds rates steady, signals patience",
    "Electric vehicle sales hit quarterly record",
    "Remote work reshapes commercial real estate",
  ],
  sports: [
    "Underdog side clinches title in final-minute thriller",
    "Star batter announces retirement from Test cricket",
    "Marathon record falls in perfect conditions",
    "League confirms expansion team for next season",
    "Young sprinter breaks national 100m record",
    "Tennis veteran reaches semifinal at 38",
  ],
  science: [
    "Telescope captures most distant galaxy yet",
    "Researchers map the full fruit-fly brain",
    "New antibiotic class shows promise against superbugs",
    "Arctic ice survey reveals faster summer melt",
    "Fusion experiment sustains plasma for record time",
    "Ancient DNA rewrites early migration timeline",
  ],
  health: [
    "Study links short walks after meals to better sleep",
    "WHO updates guidance on daily screen time",
    "Wearables detect early signs of infection",
    "Hospitals adopt AI triage to cut wait times",
    "Mediterranean diet tied to slower cognitive decline",
    "New vaccine trial reports strong early results",
  ],
  entertainment: [
    "Indie film wins top prize at autumn festival",
    "Streaming platforms bundle to win back subscribers",
    "Concert tour breaks single-night attendance record",
    "Classic novel gets prestige TV adaptation",
    "Animated sequel dominates weekend box office",
    "Video game adaptation earns rave reviews",
  ],
  general: [
    "City opens its largest public park in a century",
    "Rail network trials hydrogen-powered trains",
    "Volunteers restore coral reef after storm damage",
    "Libraries extend hours as study spaces fill up",
    "Global literacy rates reach all-time high",
    "Heatwave prompts new urban tree-planting drive",
  ],
};

const OUTLETS = ["Pulse Wire", "Daily Ledger", "Metro Times", "Global Brief", "The Signal"] as const;

function buildMockNews(): ContentItem[] {
  const random = createRandom(42);
  const items: ContentItem[] = [];
  for (const category of CATEGORIES) {
    HEADLINES[category].forEach((title, index) => {
      const id = `news-mock-${category}-${index}`;
      items.push({
        id,
        source: "news",
        title,
        description: `${title}. Demo article generated locally because a live NewsAPI response was not available.`,
        imageUrl: null,
        // Demo articles have no real page; the card hides its "Read more" link.
        url: "",
        category,
        publishedAt: hoursAgo(index * 3 + Math.floor(random() * 3)),
        author: pick(OUTLETS, random),
      });
    });
  }
  return items;
}

export const MOCK_NEWS: readonly ContentItem[] = buildMockNews();
