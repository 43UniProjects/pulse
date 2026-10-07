<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Pulse Project AI Assistant Rules

## 1. Infrastructure Restrictions
- **CRITICAL:** Do NOT modify `Dockerfile`, `docker-compose.yml`, or `example.env` without explicit human approval.

## 2. Styling & Theming
- Always use the predefined styles and variables from `globals.css` for web page content.
- This is absolutely necessary to ensure both Light and Dark themes work seamlessly.
- Only add new or custom styles if the required styling cannot be achieved using what is already in `globals.css`.

## 3. React / Next.js Architecture
- **Client vs. Server:** Carefully evaluate whether code should be Server-side or Client-side (`'use client'`). Keep them strictly separated and optimize for performance.
- **Component Strategy:** Create components whenever necessary for readability, but **do not over-engineer**. Do not create a new component file if it is only going to be used once and isn't overly complex.

## 4. Backend Logic & Database Context
- **Account Base:** The `users` collection is the source of truth for authentication. It holds the `email`, `password`, and base `role`.
- **Role Profiles:** A user becomes a Donor, Hospital, or Admin by having a corresponding document created in the `donors`, `hospitals`, or `admins` collection. These profile documents reference the base User's `_id`.
- **Authentication:** Login logic strictly queries the base `User` model to validate credentials (email/password) before issuing a session. Passwords are NOT stored in the profile collections.

## 5. Coding Standards
- Adhere to the highest coding best practices.
- Maintain a clean codebase.
- Add meaningful comments whenever logic is complex or non-obvious.
