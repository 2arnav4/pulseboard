import { http, HttpResponse } from "msw";
import { makeItem, makePage, movieItem, newsItem, socialItem } from "../fixtures/content";

const API = "http://localhost:3000/api";

/** Default happy-path handlers; individual tests override with server.use(...). */
export const handlers = [
  http.get(`${API}/feed`, ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
    if (page === 1) return HttpResponse.json(makePage([newsItem, movieItem, socialItem], { hasMore: true }));
    return HttpResponse.json(makePage([makeItem({ id: `news-page-${page}`, title: `Page ${page} story` })], { page }));
  }),
  http.get(`${API}/search`, ({ request }) => {
    const q = new URL(request.url).searchParams.get("q") ?? "";
    const matches = [newsItem, movieItem, socialItem].filter((item) => item.title.toLowerCase().includes(q.toLowerCase()));
    return HttpResponse.json(makePage(matches));
  }),
  http.get(`${API}/trending`, () => HttpResponse.json(makePage([newsItem]))),
];
