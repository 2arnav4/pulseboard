import type { Category, ContentItem } from "@/types/content";
import { hoursAgo } from "./random";

interface MockMovie {
  title: string;
  year: number;
  overview: string;
  rating: number;
  category: Category;
}

/** Demo recommendations used when TMDB_API_KEY is missing or TMDB fails. */
const MOVIES: readonly MockMovie[] = [
  { title: "Interstellar", year: 2014, overview: "Explorers travel through a wormhole to find humanity a new home.", rating: 8.4, category: "science" },
  { title: "The Social Network", year: 2010, overview: "The founding of a social network and the lawsuits that followed.", rating: 7.7, category: "technology" },
  { title: "Ex Machina", year: 2014, overview: "A programmer evaluates the consciousness of a humanoid AI.", rating: 7.6, category: "technology" },
  { title: "The Imitation Game", year: 2014, overview: "Alan Turing races to crack the Enigma code.", rating: 8.0, category: "technology" },
  { title: "Moneyball", year: 2011, overview: "A general manager rebuilds a baseball team with statistics.", rating: 7.6, category: "sports" },
  { title: "Rush", year: 2013, overview: "The rivalry between two Formula 1 drivers in the 1970s.", rating: 8.1, category: "sports" },
  { title: "Ford v Ferrari", year: 2019, overview: "Engineers build a car to beat Ferrari at Le Mans.", rating: 8.0, category: "sports" },
  { title: "The Big Short", year: 2015, overview: "Outsiders bet against the housing market before 2008.", rating: 7.4, category: "business" },
  { title: "Margin Call", year: 2011, overview: "One night inside an investment bank at the start of a crisis.", rating: 7.1, category: "business" },
  { title: "The Martian", year: 2015, overview: "A stranded astronaut uses science to survive on Mars.", rating: 7.7, category: "science" },
  { title: "Arrival", year: 2016, overview: "A linguist learns to communicate with visiting aliens.", rating: 7.6, category: "science" },
  { title: "Contagion", year: 2011, overview: "Health officials race to contain a deadly new virus.", rating: 6.8, category: "health" },
  { title: "Patch Adams", year: 1998, overview: "A doctor uses humour to help his patients heal.", rating: 6.7, category: "health" },
  { title: "La La Land", year: 2016, overview: "A jazz pianist and an actress chase their dreams in LA.", rating: 7.9, category: "entertainment" },
  { title: "Whiplash", year: 2014, overview: "A young drummer and his ruthless music instructor.", rating: 8.4, category: "entertainment" },
  { title: "Spotlight", year: 2015, overview: "Journalists uncover a scandal in a major institution.", rating: 7.8, category: "general" },
  { title: "Hidden Figures", year: 2016, overview: "Mathematicians who powered NASA's early space race.", rating: 7.8, category: "science" },
  { title: "Steve Jobs", year: 2015, overview: "Backstage at three iconic product launches.", rating: 6.8, category: "technology" },
  { title: "Creed", year: 2015, overview: "A young boxer trains under a legendary champion.", rating: 7.6, category: "sports" },
  { title: "The Founder", year: 2016, overview: "How a salesman turned a burger stand into an empire.", rating: 7.2, category: "business" },
];

export const MOCK_MOVIES: readonly ContentItem[] = MOVIES.map((movie, index) => ({
  id: `movie-mock-${index}`,
  source: "movie",
  title: movie.title,
  description: movie.overview,
  imageUrl: null,
  url: `https://www.themoviedb.org/search?query=${encodeURIComponent(movie.title)}`,
  category: movie.category,
  publishedAt: hoursAgo(index * 5),
  author: String(movie.year),
  rating: movie.rating,
}));
