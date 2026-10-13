# Pulseboard

A personalized content dashboard: news, movie recommendations and social posts in one feed that you can filter, search, favorite and reorder.

Built for the PGAGI SDE Intern frontend assignment ("Personalized Content Dashboard").

- **Live demo:** https://pulseboard-ten-amber.vercel.app
- **Demo login:** `demo@pulseboard.app` / `pulseboard-demo` (or use "Continue with the demo account" on the login page, or create your own account)

---

## Features

| Requirement (from the brief) | How it is implemented |
| --- | --- |
| User preferences | Settings panel: favorite categories, dark mode, language, real-time toggle. Stored in Redux, persisted to `localStorage` per user. |
| News API | [NewsAPI](https://newsapi.org) top headlines per preferred category; full-text search via `/v2/everything`. |
| Recommendations API | [TMDB](https://www.themoviedb.org): discover by genres mapped from your categories, or "because you liked" recommendations seeded from the last movie you opened or favorited. |
| Social media API | Mock API (`/api/social`, allowed by the brief) with posts filtered by hashtag/category. |
| Interactive cards | Image, headline, description, source/category/time, rating or likes, CTA ("Read more", "Play now", "View post"), Save button. |
| Infinite scroll / pagination | Feed: infinite scroll (IntersectionObserver + RTK Query infinite query) with a "Load more" fallback. Search: "Load more" pagination. |
| Dashboard layout | Responsive sidebar (drawer on mobile) + header with search, language, theme toggle and account menu. |
| Personalized feed | News, recommendations and posts interleaved in one feed. |
| Trending section | Tabs for trending news, movies (TMDB weekly trending) and posts (most liked). |
| Favorites section | Press Save on any card; the Favorites page lists them, persisted. |
| Debounced search | Header search commits after a 400 ms pause (Enter commits immediately), across news, movies and posts, filterable by type. |
| Drag-and-drop | Framer Motion `Reorder` with a drag handle; keyboard move buttons with screen-reader announcements; order persisted. |
| Dark mode | CSS custom properties + Tailwind `dark` variant; no flash on load (inline script). |
| Animations | Page transitions, staggered cards, hover lift, animated nav indicator, skeletons and spinners. Respects `prefers-reduced-motion`. |
| Redux Toolkit + async | Slices for preferences, favorites, feed order, search, history; RTK Query for all data fetching. |
| Persistence | `localStorage`, validated with Zod on load (corrupt/old data is ignored, never crashes). |
| Testing | Unit + integration (Vitest, React Testing Library, MSW) and E2E (Playwright). |
| **Bonus:** Authentication | NextAuth (Auth.js v5) email/password with bcrypt, Postgres users, signup, protected routes, editable profile. |
| **Bonus:** Real-time | Server-Sent Events stream new posts; a "N new posts" pill reveals them without moving what you are reading. |
| **Bonus:** i18n | react-i18next with English, Hindi and Spanish; type-checked translation keys. |

## Design

Editorial look: warm paper and ink palette with a single red accent, Instrument Serif headlines over Geist text, pill-shaped buttons, hairline borders instead of drop shadows, and text-first navigation with no decorative icons. The few functional glyphs (search, menu, close, reorder) are hand-drawn inline SVGs, so there is no icon library dependency. All colors are CSS custom properties, so dark mode is one class swap.

## Tech stack

Next.js 16 (App Router) · TypeScript (strict) · Redux Toolkit + RTK Query · Tailwind CSS v4 · Framer Motion · NextAuth v5 · Neon Postgres · Zod · react-i18next · Vitest + React Testing Library + MSW · Playwright

## Getting started

Requires Node.js 22.12 or newer.

```bash
git clone https://github.com/2arnav4/pulseboard.git
cd pulseboard
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

The app runs without any API keys: missing or failing sources fall back to bundled demo data, and the UI labels it as "Demo data".

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `AUTH_SECRET` | Yes | Signs session cookies. Generate with `npx auth secret` or `openssl rand -base64 32`. |
| `DATABASE_URL` | In production | Postgres connection string (Neon). Without it, users are kept in memory and lost on restart. The `users` table is created automatically (see `db/schema.sql`). |
| `NEWS_API_KEY` | No | NewsAPI key. Without it, news uses demo data. |
| `TMDB_API_KEY` | No | TMDB v4 read access token or v3 API key (both work). Without it, movies use demo data. |
| `MOCK_APIS` | No | `1` forces demo data for every source (used by E2E tests). |

All keys are read only on the server. The browser never calls NewsAPI or TMDB directly. That keeps keys out of the bundle, and NewsAPI's free plan rejects browser requests from non-localhost origins anyway.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit + integration tests (Vitest) |
| `npm run test:e2e` | Playwright E2E (builds and starts the app on port 3100 with mocked APIs) |
| `npm run test:all` | All of the above |

Before the first E2E run: `npx playwright install chromium`.

## Folder structure

```
src/
  app/
    (auth)/login, signup          # public pages
    (dashboard)/                  # protected pages: feed, trending, favorites, search, settings, profile
    api/                          # route handlers (server only)
      feed, search, trending, social, realtime (SSE), register, profile, auth/[...nextauth]
  auth.ts, auth.config.ts, proxy.ts   # NextAuth setup and route protection
  components/                     # UI by feature: content, feed, layout, search, settings, profile, auth, ui
  features/                       # Redux slices + RTK Query API (contentApi)
  hooks/                          # debounce, infinite scroll, SSE, persistence sync
  i18n/                           # i18next setup + en/hi/es translations
  lib/
    server/                       # API adapters (news, tmdb, social), validation, users repository
    mock/                         # deterministic demo datasets
    content.ts, persistence.ts    # pure helpers (interleave, ordering, storage)
  store/                          # store factory, typed hooks
  types/                          # shared types
tests/
  unit/ integration/ e2e/         # Vitest, RTL + MSW, Playwright
  msw/ fixtures/ utils/
db/schema.sql
```

## Architecture and request flow

```
Browser                               Next.js server                       Upstream
───────                               ──────────────                       ────────
Component ──dispatch──▶ Redux slice
Component ──hook──▶ RTK Query ──GET /api/feed──▶ proxy.ts (session check, 401 if signed out)
                                        └─▶ route handler (Zod validates query)
                                             └─▶ content-service
                                                  ├─ news.ts   ──fetch, cached 15 min──▶ NewsAPI
                                                  ├─ tmdb.ts   ──fetch, cached 1 h───▶ TMDB
                                                  └─ social.ts (mock data)
                                             ◀── { items, page, hasMore, sources }
RTK Query cache ◀───────────────────────
EventSource ──/api/realtime──▶ SSE stream (new post every 12 s, closes at 55 s, client reconnects)
```

Key decisions:

- **Thin route handlers, logic in services.** Handlers only validate and delegate. Adapters normalize every API into one `ContentItem` shape, so the UI never knows which API a card came from.
- **Graceful degradation.** Each adapter falls back to demo data on a missing key, a quota error (NewsAPI's free plan allows 100 requests a day) or a network error. The response reports each source's status (`live`, `mock`), and the UI shows a notice.
- **Quota-aware fetching.** Each feed page makes one NewsAPI call (pages rotate through your categories). Upstream responses are cached on the server, search is debounced with a 2-character minimum, data APIs require a session, and the feed waits for saved preferences before its first request.
- **Hydration-safe persistence.** Saved state loads after mount, and pages render once the client has it, so server and client markup always match.

## User flow

1. Sign up (or use the demo account). New users land on **Settings** to pick their categories.
2. **My Feed** shows news, movie picks and posts for those categories. Scroll to load more, drag cards (or use the arrow buttons) to reorder, and press Save on anything you want to keep.
3. New posts stream in live. Click "N new posts" to show them.
4. **Search** from the header (press `/` to focus). Results update as you type, and you can filter by type.
5. **Trending** shows top news, movies and posts.
6. **Favorites** lists everything you saved.
7. **Profile** lets you change your name, bio and avatar color. Switch theme and language from the header or Settings.

## Testing

- **Unit:** reducers, persistence (corrupt or old data, storage quota errors), feed helpers, API adapters (normalization, live and fallback paths, TMDB auth modes), request validation.
- **Integration (RTL + MSW):** feed loaded, empty, error and retry states, demo notice, pagination, keyboard reorder, the feed waiting for hydration, search debounce, search empty and error states, favorites.
- **E2E (Playwright):** sign up, sign in and out, protected redirects, wrong password, duplicate email, 401 on anonymous API calls, profile update, debounced search (asserts exactly one request), type filter, drag-and-drop with persistence across reload, keyboard reorder, dark mode and language persistence, categories, favorites, real-time SSE, trending tabs, mobile drawer.

GitHub Actions runs lint, type check, unit and integration tests, and E2E on every push.

## Deployment

Deployed on Vercel.

1. Import the repository into Vercel.
2. Add a Neon Postgres database (Vercel Marketplace). This sets `DATABASE_URL`.
3. Set `AUTH_SECRET`, `NEWS_API_KEY` and `TMDB_API_KEY` in the project's environment variables.
4. Deploy.

## Known limitations

- **NewsAPI free plan:** 100 requests a day, and searched articles are delayed by 24 hours. Its terms limit the free plan to development. When the quota runs out, news falls back to demo data until the next day.
- **Social feed** is a mock API, as the brief allows. Real Twitter/X and Instagram APIs need paid or reviewed access.
- **Category → movie genre** mapping is approximate (TMDB has genres, not news categories).
- **Real-time stream** reconnects about every 55 seconds because of serverless function time limits. EventSource reconnects automatically.
- **The demo account is shared**, so anyone can edit its profile.
- Preferences and favorites are stored in the browser, per user, not in the database, so they don't sync across devices.
- Sign-up has no rate limiting or email verification.
