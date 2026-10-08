<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Commands

- Run development server: `bun run dev`
- Run type checking: `tsc --noEmit`
- Run formatting and linting: `prettier --write` and `eslint --fix`

# Testing

- Frameworks: Use Vitest for unit testing and Playwright for end-to-end (E2E) testing.
- Execution: Ensure code is formatted and tested locally before committing to bypass Husky pre-commit hook failures.

# Project Structure

- `app/`: Next.js App Router pages, layouts, and API routes.
- `types/`: Shared TypeScript interfaces and enums (`*type.ts`). Represents Application State.
- `models/`: Mongoose schemas (`*model.ts`). Represents Database State.
- `actions/`: Next.js Server Actions (`*actions.ts`).
- `data`/: Data fetching functions (`*data.ts`)
- `components/`: Reusable UI components. Create components whenever necessary for readability, but do not over-engineer or create single-use component files unnecessarily.

# Code Style & Architecture

- **Client vs. Server:** Keep Server-side and Client-side (`'use client'`) code strictly separated.
- **Database & Types Synchronization:** Maintain strict parity between `.type.ts` and `.model.ts` files. Omit populated relational fields from Mongoose document interfaces.
- **Data Architecture:** The `users` collection is the source of truth for authentication (email/password/base role). Passwords are NOT stored in the profile collections (Donors, Hospitals, Admins).
- **Primary Keys:** Use default MongoDB `_id`s exclusively. Never create custom ID fields (e.g., `donationId`, `requestId`) for database primary keys.
- **Enums:** Define strict lowercase enums in `.type.ts` (e.g., `['pending', 'completed']`) and reuse them in Mongoose schemas.
- **Server/Client Boundary:** Always append `.lean()` to Mongoose queries in Server Components before passing data to Client Components as props to ensure plain JSON serialization.
  ```typescript
  // Correct implementation
  const tickets = await Contact.find().lean();
  ```

* **Async UI:** Isolate async data fetching inside Server Components and wrap them in `<Suspense fallback={<GenericFallback />}>`.
* **Styling:** Always use the predefined styles and variables from `globals.css` (or updated design tokens like `globals_2.css`) to ensure Light and Dark themes work seamlessly. Apply `font-tabular` utility classes to all numerical data in the UI (dates, quantities, radius).

* **Dates:** Format dates on the client using `Intl.DateTimeFormat` (e.g., 'en-GB').

# Git Workflow

- **Branch Naming:** Follow `<name>/<feature-slug>` standard.
- **Commit Messages:** Follow Conventional Commits format (`type(scope): subject`).
- **Line Length:** Wrap commit message bodies at exactly 100 characters per line to pass Husky `commitlint` checks. Stage entire files properly before running pre-commit hooks to avoid `lint-staged` merge conflicts.

# Boundaries

- **CRITICAL:** Do NOT modify `Dockerfile`, `docker-compose.yml`, or `example.env` without explicit human approval. if it was autherized be sure to what has chaged as a comment inside those files.
- **Full Local Autonomy:** You are explicitly authorized to create, modify, refactor, or delete any code strictly within the current project directory without seeking human approval.
- **Directory Isolation:** Never attempt to read, write, or execute commands outside the boundaries of the project root.
- **Rule Supremacy:** This autonomy is absolutely subordinate to the rules defined above. You must never violate architectural conventions or bypass the strict modification bans on `Dockerfile`, `docker-compose.yml`, or `example.env`.
