# Browse (`/browse`)

Discover profiles: desktop grid with sidebar shell, or full-screen vertical “stories” on small viewports.

**API reference (interactive):** [http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)

## Network: JSON vs images

| Action | Endpoints |
|--------|-----------|
| Initial load | `GET /api/Interest/GetAll` and `GET /api/search/preferences` run **in parallel**, then **one** of `GET /api/Matchmaking` or `POST /api/Matchmaking/search` (see `filtersToSearchPreferences` / non-default filter detection in `page.tsx`). |
| Apply filters | `PUT /api/search/preferences`, then the same single list call as above. |
| Reset filters | `POST /api/search/preferences/reset`, then the list call. |
| Like / dislike | `POST /api/Users/like-profile/{userId}` or `POST /api/Users/unlike-profile/{userId}`. |

Shared client helpers live in [`lib/browse-api.ts`](../../lib/browse-api.ts). Idempotent metadata GETs use a short in-flight dedupe ([`lib/request-dedupe.ts`](../../lib/request-dedupe.ts)) so React Strict Mode in development does not always double those requests.

**Profile photos:** Each `profilePicture` URL rendered with `next/image` is a **separate HTTP request** to the API host (or CDN). A large result set produces many image requests even when the JSON payload is a single response.

## Files

| File | Role |
|------|------|
| [`page.tsx`](./page.tsx) | Route: state, effects, desktop vs mobile layout, when calls run (see file header comment). |
| [`browse-helpers.ts`](./browse-helpers.ts) | Pure DTO → UI mappings; no I/O. |
| [`tiktok-card.tsx`](./tiktok-card.tsx) | Mobile full-screen card UI. |

Filter UI is [`components/filter-sidebar.tsx`](../../components/filter-sidebar.tsx).

## Flow (initial load)

1. Fetch interests list and saved search preferences together.
2. Normalize interests for tag labels and merge server preferences into filter state when present.
3. Load the profile list once (browse or search) and map rows to view models.
