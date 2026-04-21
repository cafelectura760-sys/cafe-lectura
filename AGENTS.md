<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Repository Agent Rules

## Source of Truth

- Follow `PROJECT_DOCS.md` as the primary source of truth for product scope, architecture, business rules, and development constraints.
- Do not invent features outside the documented MVP scope.
- Do not change the technical stack unless the user explicitly approves it.
- Keep implementation scope tight and aligned with the current requested task.
- Treat unresolved product decisions in `PROJECT_DOCS.md` as implementation blockers only when they materially affect the requested task.

## Language Rules

- Repository documentation must be written in English.
- Code, comments, file names, commit text, technical copy, and implementation artifacts must be written in English.
- Conversation with the user may happen in Spanish, but repository artifacts must remain in English.
- End-user UI copy may be Spanish when it appears in the product experience.

## Implementation Rules

- Use Server Components by default.
- Use `use client` only when real client-side interactivity is required.
- Use Server Actions for data mutations.
- Use `revalidatePath()` when mutations affect cached routes.
- Avoid unnecessary `useEffect` and avoid moving business logic to the client without a clear reason.
- Prefer clarity over cleverness.
- Avoid overengineering and speculative abstractions.
- Apply design patterns only when they solve a real problem in the current codebase.

## Data and Security Rules

- Use Supabase Client directly for database access.
- Do not use Prisma, Drizzle ORM, or any additional ORM.
- Do not assume the database schema already exists.
- Do not assume Supabase Row Level Security policies already exist.
- Any generated database SQL must explicitly define tables, constraints, `ENABLE ROW LEVEL SECURITY`, and required policies.
- Protect private routes with both authentication and active membership validation.
- Admin users must be allowed to access every system view, regardless of membership expiration.
- Protect admin routes with authenticated `role = admin` validation.
- Do not implement public signup. Users must be created through the admin-controlled flow.
- If privileged Supabase credentials are needed for admin user creation, keep them server-only.

## Configuration Rules

- Do not hardcode public configuration values.
- WhatsApp number and default WhatsApp message must come from environment variables.
- Use `NEXT_PUBLIC_WHATSAPP_NUMBER` and `NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE` for public WhatsApp flows.
- Use public Supabase environment variables only for browser-safe values.
- Never expose service-role credentials or other privileged secrets to Client Components.

## UI/UX Rules

- Optimize the interface for older adults.
- Prefer large readable typography, high contrast, simple navigation, and low visual density.
- Use realistic Spanish copy for end-user product text.
- Avoid Lorem Ipsum, generic filler, clutter, and unnecessary interactions.

## Working Rules

- Before implementing Next.js behavior, read the relevant documentation in `node_modules/next/dist/docs/`.
- Ask critical questions only when they remain unresolved after reviewing context, documentation, and the codebase.
- Do not modify unrelated files.
- Do not implement product code when the user only asks for documentation, planning, or review.
- If Step 1 discovers framework or repository conventions that should govern future work, update `PROJECT_DOCS.md` instead of creating scattered documentation files.
