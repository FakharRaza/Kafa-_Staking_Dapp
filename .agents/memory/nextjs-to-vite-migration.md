---
name: Next.js to Vite migration gotchas
description: Lessons from converting an imported Next.js/Vercel app to the react-vite artifact via fullstack_copy_frontend.sh
---

- `fullstack_copy_frontend.sh <slug> --client-dir <path>` expects `<path>` relative to `.migration-backup/` (e.g. `packages/frontend`), not including the `.migration-backup/` prefix itself — passing the full path double-prefixes and silently no-ops the copy.
  **Why:** the script prepends `.migration-backup/` internally.
  **How to apply:** always pass the monorepo-relative client dir, then re-check `find <artifact>/src -type f` after running to confirm files actually landed before proceeding.

- The copy script installs the *latest* major version of third-party libs it detects (e.g. wagmi 3.x) even when the original app used an older major (wagmi 2.x) with a different API surface.
  **Why:** it has no way to know the original's pinned major, and installs whatever satisfies the loose semver/minimum-release-age policy.
  **How to apply:** after copy, diff the installed major version against the original `package.json` for any Web3/SDK-style library with frequent breaking changes, and `pnpm add <pkg>@<original-major>.x` to pin it back if the copied component code uses APIs from the older major.

- The `react-vite` scaffold's `index.css` ships with all theme CSS custom properties (`--background`, `--primary`, etc.) set to the literal string `red` as a placeholder ("replace with H S L"). If any copied component (even indirectly, via `body { @apply bg-background text-foreground }`) relies on these, the app renders with a broken red theme until real HSL values are filled in.
  **How to apply:** always search the copied component tree for shadcn/Tailwind CSS-variable usage before deciding whether the placeholder theme needs real values, and replace them with values matching the original app's look.
