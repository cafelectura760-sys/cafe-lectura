---
name: cafe-lectura-ui-polish
description: Use this skill when improving Café Lectura UX/UI, visual polish, accessibility, responsive behavior, editorial rhythm, reader experience, public pages, member pages, or shadcn-based admin screens without changing product logic.
---

# Cafe Lectura UI Polish

Treat this skill as a repository-local guardrail for visual and experience work only. Improve clarity, rhythm, polish, accessibility, and responsiveness without inventing new product behavior.

## Product Frame

Café Lectura is a private/local literary reading club website with:

- Public home.
- Public library.
- Login for existing members/admins.
- Private member area with published colloquiums.
- Colloquium reader with ordered text/audio blocks.
- Membership-gated access.
- WhatsApp CTAs.
- Admin panel for members, books, colloquiums, sections, audio media, and draft/publish workflows.

Treat `PROJECT_DOCS.md`, `AGENTS.md`, and the current repository state as the source of truth. Match implemented behavior, not hoped-for behavior.

## Never Add Or Assume

Do not add or assume:

- Public signup.
- Payment flow.
- Checkout.
- Book loans.
- Ratings.
- Reviews.
- Downloadable PDF catalog unless already implemented.
- Itineraries.
- Monthly reading plan.
- Persistent reading progress.
- Comments.
- Community/forum.
- Gamification.
- AI summaries.
- Course dashboard behavior.

Do not redesign the product into SaaS, e-commerce, LMS, social, or marketplace patterns.

## Visual Identity

Use the existing visual identity:

- Literata-style serif headings.
- Source Sans 3-style body/UI text.
- Warm paper backgrounds.
- Olive, terracotta, clay, coffee, fig, teal, and gold accents.
- Soft editorial shadows.
- Large readable text.
- Reduced-motion-aware interactions.

Prefer calm layering, readable spacing, and strong text contrast over decorative novelty.

## Audience

Design for adults around 50–70+ and older readers. Prioritize readability, obvious navigation, strong contrast, large tap targets, low cognitive load, clear focus states, and mobile usability.

Keep interfaces patient and legible. Favor direct labels, visible affordances, generous spacing, and predictable layouts.

## Design Direction

Follow a warm editorial reading-club + minimal digital library direction. Make the UI more fluid, polished, editorial, intuitive, and visually intentional without making it flashy, SaaS-like, e-commerce-like, course-like, or generic.

For public and member-facing surfaces:

- Preserve a calm, trustworthy tone.
- Keep reading width comfortable.
- Support long-form text and audio consumption gracefully.
- Make WhatsApp CTAs visible but not transactional-looking.
- Reduce clutter before adding ornament.

## Admin Rules

Use shadcn/ui patterns for admin. Keep admin operational, table/form/sidebar-based, and not decorative.

Do not invent:

- Fake analytics.
- Finance metrics.
- Forum moderation.
- CRM flows.
- Invalid member statuses.

Optimize admin for clarity, speed, and reliability, not brand theatrics.

## Required Workflow Before Changing Code

1. Inspect existing route/component/files.
2. Identify real product behavior and constraints.
3. Propose a concise plan.
4. Confirm no product logic will be invented.
5. Make targeted changes only.
6. Preserve auth, membership gating, Supabase behavior, server actions, and routing.
7. Reuse existing tokens, components, and shadcn/ui where appropriate.
8. Validate responsive behavior.
9. Run available lint/type/test checks.
10. Report exactly what changed and what remains out of scope.

## Implementation Guardrails

When applying this skill:

- Prefer Server Components defaults and existing App Router structure.
- Keep `use client` boundaries as small as possible when UI work requires them.
- Preserve all auth, membership, and admin access rules.
- Preserve Supabase data flows, Route Handlers, Server Actions, and routing contracts.
- Reuse existing tokens, primitives, and repository patterns before introducing new ones.
- Improve accessibility with visible focus states, larger hit areas, and reduced-motion awareness.
- Validate desktop and mobile behavior after UI changes.
- Keep copy in Spanish for user-facing screens and in English for repository artifacts.

## Scope Discipline

Stay tightly scoped to UX/UI polish. Do not change product logic unless the user explicitly asks for it and the repository rules allow it. If a design idea depends on missing product behavior, call it out as out of scope instead of inventing it.
