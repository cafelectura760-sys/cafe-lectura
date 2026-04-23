<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Repository Agent Rules

## Operating Principles

- Treat this repository as public-facing and security-sensitive.
- Follow `PROJECT_DOCS.md` as the primary source of truth for product scope, architecture, business rules, and development constraints.
- Before changing code or documentation, inspect the real repository state and compare it with `PROJECT_DOCS.md`.
- Distinguish planned MVP scope from implemented functionality. Do not describe planned behavior as implemented unless the code supports it.
- Do not invent features outside the documented MVP scope.
- Do not change the technical stack unless the user explicitly approves it.
- Keep every task tightly scoped to the current request.
- Prefer minimal, coherent changes over broad rewrites.
- Treat unresolved product decisions in `PROJECT_DOCS.md` as blockers only when they materially affect the requested task.

## Required Work Sequence

For implementation, auditing, hardening, or repository-quality tasks:

1. Read `AGENTS.md`.
2. Read `PROJECT_DOCS.md`.
3. Inspect the current repository structure, scripts, dependencies, and relevant source files.
4. Read the relevant Next.js guide in `node_modules/next/dist/docs/` before implementing Next.js behavior.
5. Identify differences between documentation and code before editing.
6. Make the smallest reasonable change that aligns documentation, security, and implementation.
7. Run relevant checks before finishing, or clearly document why a check could not be run.

## Documentation Ownership

- Update `PROJECT_DOCS.md` when project scope, architecture, business rules, implementation status, or framework conventions change.
- Update `AGENTS.md` when repository working rules, agent workflow, safety rules, or operational expectations change.
- Prefer editing existing source-of-truth documents over creating scattered documentation files.
- Do not hide useful source-of-truth documentation unless it contains sensitive information. Prefer sanitizing public docs over removing them.
- Keep implementation status explicit: use language such as "implemented", "partially implemented", "planned", or "not yet implemented" when accuracy matters.

## Language Rules

- Repository documentation must be written in English.
- Code, comments, file names, commit text, technical copy, and implementation artifacts must be written in English.
- Conversation with the user may happen in Spanish, but repository artifacts must remain in English.
- End-user UI copy may be Spanish when it appears in the product experience.

## Next.js and Implementation Rules

- This project uses Next.js App Router with Next.js 16 conventions.
- In this repository, use `proxy.ts` rather than `middleware.ts` for request proxy behavior.
- Use Server Components by default.
- Use `use client` only when real client-side interactivity, browser APIs, or client hooks are required.
- Keep `use client` boundaries as small and low in the component tree as practical.
- Use Server Actions for in-app data mutations.
- Validate authentication and authorization inside every Server Action and privileged Route Handler; Server Actions are reachable by direct POST requests.
- Use `revalidatePath()` when mutations affect cached routes.
- Avoid unnecessary `useEffect` and avoid moving business logic to the client without a clear reason.
- Prefer clarity over cleverness.
- Avoid overengineering and speculative abstractions.
- Apply design patterns only when they solve a real problem in the current codebase.

## Data and Security Rules

- Use the Supabase Client directly for database access.
- Do not use Prisma, Drizzle ORM, or any additional ORM.
- Do not assume the database schema already exists.
- Do not assume Supabase Row Level Security policies already exist.
- Any generated database SQL must explicitly define tables, constraints, `ENABLE ROW LEVEL SECURITY`, and required policies.
- Protect private routes with both authentication and active membership validation.
- Admin users must be allowed to access every system view, regardless of membership expiration.
- Protect admin routes with authenticated `role = admin` validation.
- Do not implement public signup. Users must be created through the admin-controlled flow.
- If privileged Supabase credentials are needed for admin user creation, keep them server-only.
- Use `server-only` for modules that read server-only environment variables or create privileged clients.

## Public Repository Security Rules

- Never commit secrets, credentials, access tokens, API keys, service-role keys, session data, private exports, or real customer data.
- Keep all sensitive values in environment variables or in the relevant platform secret manager.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY`, Vercel tokens, GitHub tokens, or any equivalent privileged secret to Client Components, public environment variables, logs, examples, or documentation.
- Do not commit `.env`, `.env.local`, `.env.production`, SQL dumps with real data, screenshots containing secrets, or copied dashboard values.
- Assume attackers can read the repository. Enforce security through authentication, authorization, RLS, input validation, safe rendering, and server-side checks.
- Do not trust client-side gating alone.
- Keep admin behavior server-enforced. Hidden buttons or hidden routes are not access control.
- Sanitize or safely render any user-controlled or admin-authored rich content. Do not allow unsafe HTML execution.
- When adding documentation, examples, migrations, or seed data, use placeholders or fictional sample data only.

## Configuration Rules

- Do not hardcode public configuration values.
- WhatsApp number and default WhatsApp message must come from environment variables.
- Use `NEXT_PUBLIC_WHATSAPP_NUMBER` and `NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE` for public WhatsApp flows.
- Use public Supabase environment variables only for browser-safe values.
- Never expose service-role credentials or other privileged secrets to Client Components.
- Validate required environment variables in shared configuration modules when the code path depends on them.

## UI/UX Rules

- Optimize the interface for older adults.
- Prefer large readable typography, high contrast, simple navigation, and low visual density.
- Use realistic Spanish copy for end-user product text.
- Avoid Lorem Ipsum, generic filler, clutter, and unnecessary interactions.

## Quality Rules

- Do not modify unrelated files.
- Do not implement product code when the user only asks for documentation, planning, or review.
- Run the most relevant available checks for the touched surface, usually `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run build`.
- If checks fail, distinguish pre-existing failures from failures introduced by the current work when possible.
- Before finishing, review the diff for secrets, accidental environment leakage, unrelated churn, and documentation claims that exceed the code.
