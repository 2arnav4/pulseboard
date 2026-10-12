import type { Metadata } from "next";
import { SearchResults } from "@/components/search/SearchResults";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return <SearchResults />;
}
