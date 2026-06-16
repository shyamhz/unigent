# PLANS

## Critical Bugs

- [x] Add `error.tsx` for app and dashboard routes — runtime errors crash the entire page with no recovery
- [x] Add `not-found.tsx` — missing 404 handling shows generic error instead of graceful fallback

## Safety Issues

- [x] No `eval()`, `dangerouslySetInnerHTML`, or `innerHTML` usage found
- [x] No exposed `process.env` variables in client components
- [x] No API calls in frontend (no fetch/axios)

## Missing Best Practices

- [ ] Add `loading.tsx` for dashboard route — shows skeleton/spinner during load
- [ ] Add dashboard-specific metadata (`generateMetadata`) — improves SEO and social sharing
- [ ] Dashboard layout is empty pass-through — could wrap with shared sidebar/navigation
- [ ] All dashboard panels are `'use client'` — consider server components where possible for better initial load

## Resolved

- Added `src/app/error.tsx` with reset functionality
- Added `src/app/not-found.tsx` with home link
