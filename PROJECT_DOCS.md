# Cafe Lectura Project Documentation

## 1. Project Overview

Cafe Lectura is a monolithic web application for a private local reading club in Venezuela. The MVP supports a public presence, a private membership area, and a simple internal administration area.

The platform is designed primarily for adults between 50 and 70+ years old. The product must prioritize clarity, readability, accessibility, and a calm user experience over visual novelty or complex interactions.

### MVP Scope

- Public landing page for the reading club.
- Public visual library of available books.
- Private colloquium area for active members.
- Private colloquium presentation module with ordered text and audio blocks.
- Admin dashboard for manual internal management, including the colloquium builder workflow.
- Login-only authentication flow with no public signup.
- WhatsApp-based membership and book inquiries.

### Product Goals

- Make the club easy to understand for visitors.
- Allow members with active memberships to access colloquium content.
- Keep administration manual, simple, and reliable.
- Avoid unnecessary automation and payment complexity while keeping colloquium multimedia tightly scoped and maintainable.
- Provide a trustworthy, readable interface for older adults.

### Business Model

Cafe Lectura uses a manual annual membership model. Users do not purchase subscriptions inside the app. Any membership request, renewal request, or book inquiry must redirect to WhatsApp using configured environment values.

No payment gateway integration is allowed in the MVP.

## 2. Technical Stack

The technical stack is fixed and must not be changed without explicit approval.

- Framework: Next.js App Router.
- Language: strict TypeScript.
- Styling: Tailwind CSS v4.
- UI components: shadcn/ui.
- UI primitives: Radix UI.
- Icons: lucide-react.
- Backend and database: Supabase with PostgreSQL.
- Authentication: Supabase Auth using SSR via `@supabase/ssr`.
- Hosting: Vercel.

### Tailwind CSS v4 Rules

- Use the modern Tailwind CSS v4 approach based on CSS variables and global CSS.
- Avoid obsolete Tailwind CSS v3-style configuration files such as `tailwind.config.ts` unless a specific dependency or justified project need requires it.
- Keep styling simple, accessible, and consistent with the product audience.

## 2.1 Current Implementation Status

This section reflects the repository state directly observed in version-controlled files on July 1, 2026 after the admin workspace migration pass.

Implemented:

- Next.js 16 App Router project using the root `app/` directory and route groups.
- Tailwind CSS v4 global CSS setup.
- Supabase SSR client utilities using `@supabase/ssr`.
- Root `proxy.ts` for Supabase session cookie refresh.
- Public home page and public library page backed by Supabase book data.
- Login-only authentication flow for existing Supabase users.
- Private colloquium list and detail pages protected by server-side membership checks.
- Private colloquium detail rendering based on colloquium metadata, participants, and ordered presentation blocks.
- Expired-membership page with environment-driven WhatsApp renewal link.
- Admin admin-only route group protected by server-side `role = admin` validation.
- Admin-created user flow using the service-role Supabase client only on the server.
- Shared admin workspace layout with persistent sidebar navigation, mobile sheet navigation, breadcrumb/header context, unified feedback handling, and a sticky admin shell.
- Dedicated admin overview, members, books, and colloquiums routes using existing Server Actions and Supabase flows.
- Server-side paginated admin listings for members, books, and colloquiums using `page` and `size` search parameters.
- Dedicated admin create routes for members and books so creation is separated from management lists.
- Admin member hard-delete flow for regular members only, with server-side protection against deleting administrator accounts.
- Admin book visibility management with `published` and `hidden` states, plus hard delete only when no colloquiums are linked to the book.
- Dedicated admin colloquium create/edit/preview pages for the presentation-focused colloquium workflow, including a fullscreen preview variant without the admin sidebar.
- Supabase Storage private-bucket integration with signed upload, confirm, and delete Route Handlers for colloquium media.
- Simplified admin colloquium editor flow with shadcn/ui controls, participant management grouped by role, ordered text/audio presentation blocks, advanced slug editing, destructive delete confirmation, a Spanish calendar-based publication date picker, URL-persisted editor tabs, and a presentation tab with explicit batch save behavior.
- Vercel-based daily Supabase keep-alive cron with persisted admin-visible heartbeat status.
- Supabase migrations for `profiles`, `books`, `colloquiums`, `colloquium_sections`, `colloquium_entries`, `colloquium_participants`, `media_assets`, and operational heartbeat records, including constraints, indexes, Row Level Security, and policies.
- GitHub Actions CI for formatting, linting, typechecking, and production build.
- Weekly dependency audit workflow.

Observed gaps or repository-only limitations:

- The colloquium workflow now includes a committed `components/ui` shadcn/ui primitive directory.
- Route-level loading states exist for library and colloquium routes, but error boundaries are not yet present.
- The colloquium presentation runtime now depends on presentation blocks as its only visible content source, but it still depends on runtime Supabase Storage configuration and on applying the latest migration in real environments before production use.
- Supabase project settings are not represented in version-controlled files, so public self-registration still needs manual verification in the Supabase dashboard.
- Real RLS runtime behavior against anonymous visitors, active members, expired members, and admins cannot be confirmed from repository files alone.
- Production deployment readiness on Vercel cannot be confirmed from repository files alone.
- The public and member-facing design uses the Cafe Lectura visual foundation with warm editorial surfaces, a custom landing-page reading tableau, restrained texture, and reduced-motion-aware entry animation.

## 3. Product Structure

The application uses Next.js App Router with route groups.

### Public Area

Routes:

- `(public)/page.tsx`
  - URL: `/`
  - Public landing page for the reading club.
  - Explains the club, membership idea, and primary WhatsApp call to action.
- `(public)/library/page.tsx`
  - URL: `/library`
  - Public visual catalog of books.
  - Allows visitors to ask about a book through WhatsApp.
  - Does not provide downloadable files.

### Private Area

Routes:

- `(private)/colloquiums/page.tsx`
  - URL: `/colloquiums`
  - Lists available colloquiums for authenticated members with active memberships.
- `(private)/colloquiums/[id]/page.tsx`
  - URL: `/colloquiums/[id]`
  - Shows the detail page for a single colloquium.
  - Remains private and must never be exposed publicly.
  - The current repository version renders a private colloquium presentation view with registered participants and ordered text/audio blocks.
- `(private)/membership-expired/page.tsx`
  - URL: `/membership-expired`
  - Dedicated expired-membership screen with a WhatsApp renewal call to action.

Access to the private colloquium area requires both authentication and an active membership. Administrators may access all system views regardless of membership expiration.

### Admin Area

Routes:

- `(admin)/layout.tsx`
  - Shared admin workspace shell for all admin routes.
  - Provides persistent desktop navigation, mobile sheet navigation, breadcrumb context, and top-level admin actions.
- `(admin)/admin/page.tsx`
  - URL: `/admin`
  - Internal administration overview.
  - Accessible only to authenticated users with `role = admin`.
  - Shows operational summary cards, quick actions, recent colloquium activity, and the latest recorded Supabase keep-alive status.

- `(admin)/admin/members/page.tsx`
  - URL: `/admin/members`
  - Dedicated member administration route.
  - Focuses on member listing, role/date updates, and membership extension using the existing Server Actions.
  - Supports server-side pagination through `page` and `size` search parameters.

- `(admin)/admin/members/new/page.tsx`
  - URL: `/admin/members/new`
  - Dedicated member creation route.
  - Uses the existing admin-created user flow and redirects back to the member list after a successful creation.

- `(admin)/admin/books/page.tsx`
  - URL: `/admin/books`
  - Dedicated book administration route.
  - Focuses on catalog listing, updates, visibility changes, and guarded delete actions using the existing Server Actions.
  - Supports server-side pagination through `page` and `size` search parameters.

- `(admin)/admin/books/new/page.tsx`
  - URL: `/admin/books/new`
  - Dedicated book creation route.
  - Uses the existing book creation Server Action and redirects back to the catalog list after a successful creation.

- `(admin)/admin/colloquiums/page.tsx`
  - URL: `/admin/colloquiums`
  - Dedicated colloquium operations route.
  - Lists colloquiums with operational metadata and links into edit, preview, guarded private-view, and delete actions.
  - Supports server-side pagination through `page` and `size` search parameters, while preserving the optional status filter.

- `(admin)/admin/colloquiums/new/page.tsx`
  - URL: `/admin/colloquiums/new`
  - Creates a new presentation-focused colloquium draft or published record.
- `(admin)/admin/colloquiums/[id]/page.tsx`
  - URL: `/admin/colloquiums/[id]`
  - Dedicated editor for metadata, participants, presentation blocks, and media.
  - The current repository version organizes editing into `Datos básicos`, `Participantes`, `Presentación`, and `Publicación` tabs while preserving existing business rules and mutations.
  - The active tab is preserved through the URL, participant management is grouped by role, and the presentation tab uses local draft editing with an explicit save action instead of reloading on each reorder.
- `(admin)/admin/colloquiums/[id]/preview/page.tsx`
  - URL: `/admin/colloquiums/[id]/preview`
  - Admin-only preview route for draft and published colloquiums.
- `(admin-preview)/admin/colloquiums/[id]/preview/fullscreen/page.tsx`
  - URL: `/admin/colloquiums/[id]/preview/fullscreen`
  - Admin-only fullscreen preview route for draft and published colloquiums.
  - Reuses the same member-facing colloquium page shell without the persistent admin sidebar.

Administrators must also have a clear navigation action that takes them to the admin dashboard after login and from appropriate authenticated views.

### Auth Area

Routes:

- `(auth)/login/page.tsx`
  - URL: `/login`
  - Login page for existing users.
  - Authenticated sessions are redirected to `/` instead of remaining on the login form.
  - There is no public signup route.

## 4. Business Rules

- Public signup is not allowed.
- Only administrators may create users.
- Users must be created from the admin area, not by self-registration.
- Each user must have a full name, email, password, role, and membership expiration date.
- New member accounts must default to a membership expiration date one year after creation.
- The one-year membership default must be enforced both at the database level and in the application flow.
- The membership model is manual and annual.
- Payment gateways are forbidden. Do not integrate Stripe, PayPal, MercadoPago, or similar providers.
- Membership purchase, renewal, and subscription intent must redirect to WhatsApp.
- WhatsApp number and default message must come from environment variables.
- Books are not downloadable.
- The public library must provide a "More Information" action that opens WhatsApp.
- Public library visibility for books is controlled by the admin-facing `books.status` field.
- Hidden books must not appear in the public library, while published books remain publicly readable.
- Books linked to one or more colloquiums cannot be hard-deleted from the admin panel.
- Regular member accounts may be hard-deleted by admins, but administrator accounts must not be deletable through the admin panel.
- Colloquiums remain private. They must be accessible only to authenticated users with active memberships, while admins retain full access regardless of membership expiration.
- The approved colloquium MVP only includes the `Presentation` portion of the colloquium experience.
- The approved colloquium MVP includes structured support for text and audio blocks only.
- Colloquium media files must not be committed to the repository or stored on the Vercel filesystem.
- Supabase Storage private buckets are the approved object storage provider for colloquium media in the MVP.
- Colloquium content must no longer use one flat Markdown field as its primary source of truth.
- Colloquium text fields now use plain text with preserved paragraphs and line breaks, not Markdown.
- Raw enriched HTML should not be accepted for MVP colloquium content.
- Existing legacy colloquiums must be migrated once into presentation-compatible blocks and must not remain on any fallback runtime path.
- The member-facing and admin-facing colloquium MVP must ignore question-and-answer, discussion, closing, and image flows even if legacy rows remain stored for compatibility.
- Private colloquium access requires:
  - an authenticated user, and
  - `membership_expires_at` greater than the current date.
- Users with expired memberships must be redirected to `/membership-expired`, which must include a WhatsApp call to action.
- Admin routes require `role = admin`.
- Admin users can access every view in the system, including public, private, and admin views, even if their membership expiration is expired or absent.

## 5. Database Model

The database is Supabase PostgreSQL. Queries should use the Supabase Client directly. No additional ORM is allowed.

### `profiles`

Stores application-specific user data linked to Supabase Auth users.

Key fields:

- `id`: UUID primary key referencing `auth.users.id`.
- `full_name`: user's full name.
- `role`: user role, expected values are `admin` and `member`.
- `membership_expires_at`: timestamp that controls private membership access for members.
- `created_at`: profile creation timestamp.

Purpose:

- Determine whether a user is an administrator or member.
- Determine whether a user's membership is currently active.
- Store human-readable member information for internal management.
- Provide the application-level source for private route access checks.

Implementation expectation:

- `role` must be constrained to the supported values `admin` and `member` at the database level.
- `membership_expires_at` must have a database-level default equivalent to one year after profile creation for new member profiles.
- The application must also set or validate the default membership expiration during admin-created user flows.

### `books`

Stores public library entries.

Key fields:

- `id`: UUID primary key.
- `title`: book title.
- `author`: book author.
- `synopsis`: short public description.
- `cover_image_url`: cover image URL.
- `status`: visibility state with expected values `published` and `hidden`.
- `created_at`: book creation timestamp.

Purpose:

- Power the public visual library.
- Provide book details for WhatsApp-based inquiry flows.
- Link books to colloquiums when applicable.
- Allow admin operators to hide books from the public library without breaking colloquium relationships.

### `colloquiums`

Stores the canonical private colloquium record.

Current repository fields:

- `id`: UUID primary key.
- `title`: colloquium title.
- `book_id`: foreign key referencing `books.id`.
- `published_at`: publication timestamp.
- `slug`: stable human-readable identifier.
- `status`: expected values `draft` and `published`.
- `excerpt`: optional short summary text.
- `created_at` and `updated_at`: lifecycle timestamps.

Purpose:

- Provide members with private reading club presentation content.
- Associate presentations with books.
- Provide the parent record for the colloquium presentation module.

Content model rules:

- The colloquium module must use structured presentation blocks as its primary source of truth.
- Text content inside colloquium records is plain text.
- Raw HTML must not be trusted as user-safe content.

### `colloquium_sections`

Implemented in the repository.

Purpose:

- Represent ordered presentation blocks within a colloquium.
- Support flexible presentation composition without forcing every colloquium into one rigid length or audio count.

Expected fields:

- `id`: UUID primary key.
- `colloquium_id`: foreign key referencing `colloquiums.id`.
- `type`: application-visible block type `text` or `audio`. Legacy hidden values may still exist temporarily in stored rows during migration.
- `title`: optional audio label used by audio blocks.
- `content`: optional textual body for text blocks.
- `participant_id`: optional foreign key referencing `colloquium_participants.id` for registered speaker reuse.
- `speaker_role`: optional speaker role snapshot for audio blocks.
- `speaker_name`: optional speaker name snapshot for audio blocks.
- `display_order`: integer ordering field.
- `created_at` and `updated_at`: lifecycle timestamps.

### `colloquium_participants`

Implemented in the repository.

Purpose:

- Store the reusable participant roster for a colloquium presentation.

Expected fields:

- `id`: UUID primary key.
- `colloquium_id`: foreign key referencing `colloquiums.id`.
- `name`: participant display name.
- `role`: expected values `host`, `presenter`, `guest`, or `other`.
- `display_order`: integer ordering field.
- `created_at` and `updated_at`: lifecycle timestamps.

### `colloquium_entries`

Implemented in the repository for transitional compatibility only.

Purpose:

- Preserve legacy structured discussion data while the MVP remains limited to the `Presentation` experience.

Current MVP rule:

- `colloquium_entries` must not be used by the member-facing reader or the active admin editor flow in this phase.

### `media_assets`

Implemented in the repository.

Purpose:

- Store metadata for colloquium media files hosted outside the repository.
- Support private audio delivery for presentation blocks.

Expected fields:

- `id`: UUID primary key.
- `colloquium_id`: foreign key referencing `colloquiums.id`.
- `section_id`: optional foreign key referencing `colloquium_sections.id`.
- `entry_id`: optional foreign key referencing `colloquium_entries.id`.
- `type`: expected values `image` and `audio`, with only `audio` active in the current MVP flow.
- `provider`: fixed value `supabase-storage`.
- `bucket`: storage bucket name.
- `storage_key`: provider object key.
- `asset_path`: provider object path used for private signed delivery.
- `mime_type`: MIME type.
- `size_bytes`: optional size in bytes.
- `duration_seconds`: optional duration for audio.
- `title`: optional short title.
- `display_order`: integer ordering field.
- `created_at` and `updated_at`: lifecycle timestamps.

### Colloquium Presentation Behavior

These rules are approved for the MVP target and should guide implementation even before every administrative refinement is complete.

#### Presentation structure

- A colloquium is not a generic blog post and must not be modeled as one long unstructured body.
- The current MVP exposes only the `Presentation` portion of a colloquium.
- A presentation is composed of ordered `text` and `audio` blocks.
- The structure must remain flexible. Not every colloquium is required to use the same number of blocks or the same number of audio items.
- Ordered blocks are the top-level composition mechanism.
- Audio blocks may reference a registered participant or a manually typed speaker identity.
- Media assets belong to presentation audio blocks in the current MVP.

#### Publication model

- `draft` means the colloquium is editable in the admin experience and is not visible to ordinary members.
- `published` means the colloquium is visible in the private member-facing colloquium area.
- Admin users may review both draft and published colloquiums in the administration flow.
- Member-facing list and detail screens must only expose published colloquiums.
- `published_at` should represent the intended publication timestamp for published colloquiums.

#### Participant rules

- Each colloquium may register zero or more participants before or during presentation editing.
- Supported internal participant roles are `host`, `presenter`, `guest`, and `other`.
- Frontend and admin-visible labels for those roles must always be rendered in Spanish.
- Audio blocks must store both a speaker role and a speaker name, even when they also reference a registered participant.

#### Block rules

- Minimum active block types are `text` and `audio`.
- Every block must have a stable `display_order`.
- Text blocks require plain text `content`.
- Audio blocks require an attached audio asset, a speaker role, and a speaker name before publication.
- Blocks must be reorderable without rewriting unrelated content.
- The MVP interaction for reordering is explicit `Move up` and `Move down` controls, not drag and drop.
- Deleting a block must require an explicit admin action in the UI.

#### Media semantics

- The colloquium MVP uses private audio assets only.
- Audio assets must support ordered playback blocks within the presentation.
- The application must store metadata in the database and store binary files only in Supabase Storage.
- The original filename may be displayed to admins, but it must not be the sole source of the storage key.

### `system_heartbeats`

Stores operational heartbeat records written by internal automation such as the Supabase keep-alive cron.

Key fields:

- `job_name`: text primary key that identifies the job.
- `last_succeeded_at`: timestamp of the most recent successful execution.
- `last_status`: last persisted status value.
- `last_error`: nullable error message slot for future operational use.
- `updated_at`: last write timestamp.

Purpose:

- Confirm that production automation is still running.
- Support admin-side visibility for the Supabase keep-alive job.
- Provide a minimal operational record without introducing external monitoring services.

## 6. Security and Access Control

### Authentication

- Use Supabase Auth.
- Use SSR-compatible authentication via `@supabase/ssr`.
- Do not implement public signup.
- Login is available only for existing users created by an administrator.
- Supabase project settings must be reviewed so public self-registration is not available through an unintended path.
- User creation from the admin panel must happen through server-side privileged logic only.
- Service-role credentials, if used, must remain server-only and must never be exposed to the browser.

### Membership Validation

- Private colloquium routes require an authenticated user.
- The user's profile must have `membership_expires_at` later than the current date.
- Expired members must be redirected to `/membership-expired` with a WhatsApp renewal call to action.
- Admin users bypass membership expiration checks for all views.

### Admin Access

- Admin routes require authentication.
- The authenticated user's profile must have `role = admin`.
- Admin-only data operations must be protected both at the application layer and by Supabase Row Level Security.
- Admin users should have obvious navigation to `/admin` after authentication.

### Row Level Security

Supabase RLS must be explicitly defined. It cannot be assumed to exist.

Required expectations:

- Enable Row Level Security on all application tables.
- Define explicit policies for `profiles`, `books`, `colloquiums`, and `system_heartbeats`.
- Explicit policies must exist for `colloquium_sections`, `colloquium_entries`, and `media_assets`.
- Allow public read access to `books` when appropriate.
- Restrict `colloquiums` and all colloquium-related child records to authenticated users with active memberships.
- Allow admin users to read and manage all protected data regardless of membership expiration.
- Restrict `profiles` to tightly controlled access patterns.
- Restrict `system_heartbeats` reads to admins only.
- Ensure admin write permissions are controlled by role.
- Test policies for anonymous visitors, regular active members, expired members, and admin users.

Any database setup SQL generated for this project must include complete RLS policies.

### Colloquium Media Security

- All colloquium media upload flows must validate authenticated admin access on the server before issuing any upload capability.
- Supabase Storage administrative credentials must remain server-only.
- The client must never receive raw privileged Storage credentials.
- Signed uploads must be scoped to a system-generated storage key, limited content type, and a bounded confirmation window.
- The server must verify the colloquium context before persisting confirmed media metadata.
- The storage key namespace must be owned by the system and must not be accepted as arbitrary free text from the client.
- If file deletion is supported later, the server must authorize the action and delete both provider object and local metadata consistently.

## 7. UI/UX Guidelines

Cafe Lectura is optimized for older adults. The interface must be calm, readable, and easy to navigate.

### Accessibility and Readability

- Use large, readable typography.
- Maintain high contrast between text and background.
- Prefer clear labels over icons alone.
- Keep navigation simple and predictable.
- Avoid dense layouts.
- Avoid small click targets.
- Make primary actions obvious.

### Visual Direction

- Use a sober, warm, professional presentation.
- Avoid startup-style visual noise.
- Avoid unnecessary animations and decorative complexity.
- Do not overload screens with many competing actions.
- Use shadcn/ui components consistently for cards, tables, forms, buttons, dialogs, and layout elements.

### Copywriting

- End-user copy must be realistic Spanish.
- End-user copy must use correct grammar, spelling, accents, punctuation, and the letter `ñ` whenever appropriate.
- All user-facing surfaces, including public pages, private pages, admin screens, validation messages, status banners, metadata shown to users, and accessibility labels, must keep that Spanish standard consistently.
- Do not use Lorem Ipsum.
- Do not use generic placeholder text.
- Text should feel connected to books, reading, conversation, and the local club context.

Repository documentation, code, comments, file names, and technical artifacts must be written in English.

### Design Foundation

#### Purpose

This design foundation defines the canonical visual source of truth for Cafe Lectura before page-level redesign work begins.

It exists to ensure that all future UI work across the public and private experience follows one consistent visual system aligned with the product context:

- private local reading club in Venezuela
- primary audience: adults 50 to 70+
- warm, calm, readable, trustworthy, literary, mature
- simple navigation and low cognitive load
- strong readability over visual novelty

This foundation applies to:

- landing
- library
- login
- membership-expired
- colloquium list
- colloquium detail

It does not yet define admin design in detail, but it must remain compatible with a later admin phase using shadcn-admin as the primary structural and visual reference.

#### Visual Direction Summary

Cafe Lectura should feel like a quiet, well-kept literary club rather than a startup app, ecommerce site, or editorial magazine with heavy styling.

The interface must communicate:

- calmness
- warmth
- trust
- clarity
- mature restraint
- ease of use

The UI should avoid:

- glossy SaaS aesthetics
- overly dark themes
- decorative gradients
- crowded dashboards
- low-contrast beige-on-beige layouts
- tiny type
- dense controls
- ambiguous actions

#### Design Tokens

##### Core Color Tokens

```text
--color-ink: #1F1A17;
--color-ink-soft: #5E5147;
--color-ink-muted: #7A6C62;

--color-paper: #F7F3EC;
--color-paper-soft: #EFE7D8;
--color-surface: #FFFDF9;

--color-verde: #737B4C;
--color-verde-hover: #626A40;
--color-verde-active: #545B36;

--color-dune: #A05035;
--color-dune-hover: #8D452D;
--color-dune-active: #783A26;

--color-clay: #B88D6A;
--color-casa: #7C563D;
--color-fig: #5A2F2D;
--color-teal: #3F6F70;
--color-gold: #C49A4A;

--color-line: #D7CCBB;
--color-line-strong: #BFAE98;

--color-success: #4F6B45;
--color-success-bg: #E8F0E3;

--color-warning: #8A6032;
--color-warning-bg: #F5E9D8;

--color-error: #8E3B2F;
--color-error-bg: #F7E4DF;

--color-disabled-bg: #E6DFD3;
--color-disabled-text: #9A8F83;
```

##### Semantic Tokens

Background tokens:

```text
--background-app: var(--color-paper);
--background-page: var(--color-paper);
--background-surface: var(--color-surface);
--background-subtle: var(--color-paper-soft);
--background-muted: #F1EBE1;
--background-strong: var(--color-casa);
```

Text tokens:

```text
--text-primary: var(--color-ink);
--text-secondary: var(--color-ink-soft);
--text-muted: var(--color-ink-muted);
--text-on-dark: #FFFDF9;
--text-link: var(--color-verde);
--text-link-hover: var(--color-verde-hover);
--text-disabled: var(--color-disabled-text);
```

Border tokens:

```text
--border-default: var(--color-line);
--border-strong: var(--color-line-strong);
--border-accent: var(--color-clay);
--border-success: #B8CCAF;
--border-warning: #DEC6A6;
--border-error: #D8B0A8;
--border-focus: var(--color-verde);
```

Surface tokens:

```text
--surface-default: var(--color-surface);
--surface-subtle: var(--color-paper-soft);
--surface-emphasis: #F2ECE2;
--surface-dark: var(--color-casa);
--surface-book: #FBF8F2;
```

Action tokens:

```text
--action-primary-bg: var(--color-verde);
--action-primary-text: #FFFDF9;
--action-primary-hover: var(--color-verde-hover);
--action-primary-active: var(--color-verde-active);

--action-secondary-bg: transparent;
--action-secondary-text: var(--color-ink);
--action-secondary-border: var(--color-line-strong);
--action-secondary-hover: #F2ECE2;
--action-secondary-active: #E8E0D2;

--action-warm-bg: var(--color-dune);
--action-warm-text: #FFFDF9;
--action-warm-hover: var(--color-dune-hover);
--action-warm-active: var(--color-dune-active);
```

##### State Tokens

```text
--focus-ring-color: var(--color-verde);
--focus-ring-width: 3px;
--focus-ring-offset: 2px;

--state-success-bg: var(--color-success-bg);
--state-success-text: var(--color-success);
--state-success-border: var(--border-success);

--state-warning-bg: var(--color-warning-bg);
--state-warning-text: var(--color-warning);
--state-warning-border: var(--border-warning);

--state-error-bg: var(--color-error-bg);
--state-error-text: var(--color-error);
--state-error-border: var(--border-error);
```

Rules:

- hover deepens contrast slightly and must not introduce aggressive hue shifts
- active states must feel firmer than hover states
- disabled states must remain legible and clearly inactive
- status surfaces must be tinted and restrained, never saturated

#### Typography System

Preferred pairing:

- Heading and editorial font: `Literata`
- Body and UI font: `Source Sans 3`

Typography decision status:

- locked for the first implementation pass
- may be revisited only if real browser rendering, readability testing, or tone mismatch reveals a concrete issue after implementation
- do not reopen font exploration before the first integrated visual pass exists

Serif usage:

- use `Literata` for H1, H2, major H3, hero headlines, colloquium titles, selected editorial pull lines, and important reading headers
- do not use serif for form fields, buttons, navigation, metadata, long body copy, or dense UI labels

Sans usage:

- use `Source Sans 3` for body text, interface labels, navigation, cards, buttons, forms, helper text, metadata, banners, and long reading paragraphs

Type scale:

```text
Desktop
Display: 60px / 1.1 / 600
H1: 52px / 1.12 / 600
H2: 40px / 1.18 / 600
H3: 30px / 1.24 / 600
H4: 24px / 1.3 / 600

Body XL: 22px / 1.65 / 400
Body L: 19px / 1.7 / 400
Body M: 18px / 1.7 / 400
Body S: 16px / 1.65 / 400

Label L: 18px / 1.4 / 600
Label M: 16px / 1.35 / 600
Label S: 14px / 1.3 / 600

Meta: 15px / 1.5 / 500
Eyebrow: 14px / 1.2 / 600

Mobile
Display: 42px / 1.12 / 600
H1: 38px / 1.15 / 600
H2: 32px / 1.2 / 600
H3: 26px / 1.25 / 600
H4: 22px / 1.3 / 600

Body XL: 20px / 1.65 / 400
Body L: 18px / 1.7 / 400
Body M: 17px / 1.7 / 400
Body S: 16px / 1.65 / 400

Label L: 17px / 1.4 / 600
Label M: 16px / 1.35 / 600
Label S: 14px / 1.3 / 600

Meta: 15px / 1.5 / 500
Eyebrow: 13px / 1.2 / 600
```

Type spacing rules:

- heading to paragraph: `12px` to `16px`
- eyebrow to heading: `8px` to `12px`
- paragraph to paragraph: `16px` to `20px`
- section header stack: `10px` to `16px`
- card title to meta: `6px` to `10px`
- card meta to description: `12px` to `16px`

Constraints:

- minimum running text size: `17px` on mobile and `18px` on desktop
- avoid all-caps for long labels or buttons
- eyebrow may be uppercase only when short
- do not use negative letter spacing
- do not use muted text for essential reading content

#### Responsive Behavior

Responsive behavior must use Tailwind CSS standard breakpoints and conventions.

Use Tailwind's default responsive model:

- base mobile-first styles
- `sm`
- `md`
- `lg`
- `xl`
- `2xl`

Do not introduce a parallel custom breakpoint vocabulary unless a concrete implementation need makes it unavoidable.

Layout rules by breakpoint intent:

- base to `sm`: single-column by default, hero content stacks vertically, section actions move below copy, headers collapse into vertical stacks, image and text compositions become vertical blocks
- `md`: two-column layouts may begin only when content remains readable, section header actions may align beside content if spacing stays generous, image and text compositions may move side by side only if text width remains comfortable
- `lg` and above: landing hero may use two columns, library may use three columns, colloquium list metadata and actions may sit horizontally, and section header actions may move to the right

Column collapse rules:

- default assumption: `1` column
- move to `2` columns only when content remains calm and legible
- move to `3` columns only for scan-friendly card content such as books
- do not use `4+` primary content columns

Recommended behavior:

- landing feature groups: `1 -> 2 -> 3` only when cards are short
- library grid: `1` on mobile, `2` on tablet, `3` on large desktop
- colloquium list: remain mostly `1` column; internal card layout may split at `lg`
- login and membership-expired: always single-column

Stacking behavior:

- hero layouts: mobile stacks text first, actions second, media third if present; tablet remains stacked unless the split stays spacious; desktop may use two columns if text remains dominant and readable
- headers: mobile places title block first and actions below; tablet may place actions beside the title only if no compression occurs; desktop may align horizontally for compact action sets
- section actions: mobile stacks vertically or moves them below text; desktop may place them inline or on the right when the action count stays low

Image and text composition rules:

- images must never shrink text into narrow unreadable columns
- cover images should preserve ratio and crop gracefully
- on mobile, image and text pairs should stack with clear separation
- text should not wrap around images in editorial style
- for book and colloquium compositions, the image is supporting context rather than the layout driver

#### Spacing and Layout System

Container widths:

```text
--container-wide: 1200px;
--container-default: 1120px;
--container-narrow: 960px;
--container-reading: 760px;
--container-auth: 520px;
```

Usage rules:

- landing: `wide` or `default`
- library: `wide`
- colloquium list: `default`
- colloquium detail body: `reading`
- login and membership-expired: `auth`

Horizontal padding:

- desktop page padding: `32px`
- desktop section internal padding: `32px`
- tablet page padding: `24px`
- mobile page padding: `20px`
- mobile section internal padding: `20px` to `24px`

Section spacing:

```text
hero section top/bottom: 72px to 96px
standard section vertical spacing: 56px to 72px
compact section spacing: 40px to 48px
section-to-section gap inside page: 32px to 40px
```

Card spacing:

```text
card padding large: 32px
card padding default: 24px
card padding compact: 20px
card gap internal: 16px
card corner radius: 8px
```

Grid rules:

- prefer `1`, `2`, or `3` columns only
- book grids may reach `3` columns on large screens
- text-heavy content should collapse early
- stable heights are acceptable only where comparison improves scanability

Reading width:

- the colloquium reading body must not exceed `760px`
- target line length: `60` to `75` characters per line

Density rules:

- use low to medium density
- allow one primary action per major section
- avoid crowded utility bars
- avoid multi-column dense metadata clusters
- prefer vertical rhythm over compression

#### Base Form and Interaction Patterns

These rules should map cleanly to a likely shadcn/ui implementation using components such as `Button`, `Input`, `Textarea`, `Select`, and `Alert`.

Input rules:

- minimum height: `48px`, preferred `52px`
- use generous horizontal padding
- labels must remain visible above the field
- placeholder text must never carry essential information
- helper text belongs below the field only when needed
- default state uses a surface background and default border
- hover slightly strengthens the border
- focus uses a visible green focus ring and stronger border
- error uses an error border plus short inline explanation
- disabled uses muted surface, muted text, and no hover change

Textarea rules:

- match input styling
- provide comfortable vertical padding
- allow vertical growth
- do not make the field visually tiny
- resize behavior should remain predictable

Select rules:

- use shadcn/ui select patterns when the interaction remains accessible
- keep the same height and visual style as inputs
- the trigger must look clearly interactive
- the selected value must remain legible
- avoid long complex dropdowns in public or member views unless necessary

Inline link rules:

- use the link semantic token
- keep underline visible by default or on hover and focus consistently
- maintain strong contrast
- do not hide important actions as low-emphasis links when a button is more appropriate

Feedback banner usage:

- align with shadcn/ui alert-style composition patterns
- use for login status, auth guidance, form success, recoverable error explanation, and page-level informational notices
- keep one clear message, short text, and an optional inline link or action only when useful
- status color must support the message rather than overpower it

Disabled form behavior:

- disabled fields and controls must remain readable
- disabled elements must clearly appear inactive
- disabled states must not rely on opacity alone
- disabled submit buttons must not become visually invisible

#### Navigation and Header Rules

Public header rules:

- keep the public header simple and calm
- make the brand or title clearly visible
- keep only essential navigation items
- avoid crowded top bars and icon-only primary navigation
- recommended public navigation scope: home, library, and login

Private header rules:

- orient the member without creating dashboard-like chrome
- keep the page or section title clear
- keep the action set very small
- library access and logout are acceptable secondary actions
- if member identity appears, keep it secondary and unobtrusive

Back links and secondary navigation:

- use for returning from colloquium detail to list and for simple contextual return paths
- prefer plain text links or icon-plus-text only when the icon adds clarity
- keep secondary navigation to one or two links per block
- avoid breadcrumb-heavy interfaces
- secondary navigation must not compete with the primary task

Reading view navigation chrome:

- reduce visible navigation chrome in colloquium detail
- preserve one clear back path
- optional home or library links may remain, but they must be visually quiet
- reading views must prioritize concentration over persistent navigation

#### Reusable UI Pattern Rules

Page shell:

- use a warm page background, a centered content container, clear vertical rhythm, and stacked top-level sections
- use banded sections or clean stacked blocks
- avoid cards inside cards
- the page shell should feel breathable rather than boxed in

Section header:

- include eyebrow, heading, short supporting paragraph, and an optional action
- keep the eyebrow restrained
- let the heading carry tone
- use supporting copy to explain function simply
- action belongs at section level only when useful
- on mobile, stack vertically and move the action below the copy; horizontal alignment is allowed only from `md` or `lg` when spacing supports it

CTA types:

- primary CTA: solid verde background, light text, generous height, sans semibold label
- secondary CTA: transparent or soft surface, visible border, ink text
- warm CTA: dune background, light text, used selectively, especially for WhatsApp and contact
- a screen should usually contain only one visually dominant CTA treatment

Surface card:

- use for content grouping, summaries, library cards, private area blocks, and empty states
- use a surface background, warm border, subtle radius, and very restrained shadow or none

Book card:

- include a stable-ratio cover image, title, author, short synopsis or excerpt, and one CTA
- keep the title as the strongest text
- keep synopsis length controlled
- avoid decorative badge overload
- place the CTA consistently

Auth and gate panel:

- use for login, membership-expired, and access guidance
- keep centered narrow width, simple hierarchy, one clear action, calm tone, and no visual alarmism

Reading section:

- use for colloquium detail
- reduce nonessential UI
- keep the body within reading width
- use serif for section titles and sans for reading body
- keep role-based emphasis subtle and semantic

Empty state:

- include a short heading, one sentence explanation, and an optional single CTA
- keep the tone calm
- avoid blameful language and decorative dependence

Feedback banner:

- use for auth state, form success or error, and important informational messages
- tint by state
- use a readable border
- keep to one short paragraph and an optional inline action only when useful

#### Component Strategy

shadcn/ui role:

- shadcn/ui is the primary component foundation for the product
- use it as the structural base for buttons, inputs, textareas, selects, alerts, dialogs if later needed, sheets if later needed, form composition patterns, and future table patterns where relevant
- Cafe Lectura should feel like a custom product built on top of shadcn/ui primitives rather than a default shadcn demo

Custom component rules:

- create custom components when a pattern is product-specific, combines primitives into a repeatable branded pattern, improves readability for older adults, or expresses the editorial tone of Cafe Lectura
- likely custom patterns include page shell, section header, book card, auth and gate panel, reading section, and colloquium list item

External library rules:

- additional component libraries are acceptable only when they solve a specific UI problem clearly better than a shadcn/ui-based solution
- they must match the project's tone, density, accessibility, and visual language
- they must not introduce a conflicting aesthetic or fragment interaction patterns
- prefer shadcn/ui first and introduce external libraries only for concrete needs, not variety

Future admin compatibility:

- admin is out of scope for this phase
- public and private design choices must not block later admin work
- future admin should use shadcn-admin as a direct structural and visual reference
- admin may later become denser and more operational while public and private remain warmer and more editorial

#### Icon System

Primary icon library:

- use `lucide-react` as the primary and default icon library
- do not mix multiple icon libraries without a very strong reason

Icon usage rules:

- icons are supportive, not primary meaning carriers
- use icons for small directional cues, supportive CTA affordances, status reinforcement, and simple utility actions where text remains present
- do not use icons for primary meaning without text, dense navigation chrome, decorative clutter, or critical actions presented as icon-only controls

Icon sizing:

- inline with text: `16px`
- standard UI button or supporting icon: `18px`
- prominent supporting icon: `20px`
- avoid oversized decorative icons in core UI

Alignment rules:

- align icons optically with text baselines
- keep icon and label spacing consistent
- use an icon before text only when it adds recognition
- do not add icons to every button by default

Older adult constraints for icons:

- prefer text-first actions
- do not rely on icon recognition alone
- avoid tiny icons and ambiguous metaphors
- avoid mixed icon visual languages

#### Accessibility Constraints

- all body text must meet strong readable contrast against its background
- primary text should target at least WCAG AA normal-text contrast
- large headings must remain clearly readable on warm backgrounds
- muted text may only be used for secondary information
- minimum interactive height: `48px`
- preferred interactive height: `52px`
- minimum touch target: `44x44px`, preferably `48x48px`
- every interactive element must show a visible focus ring
- focus ring must be distinct from the border color
- never remove focus outline without replacement
- keyboard focus should remain obvious on all surfaces
- errors must be explicit, calm, and readable
- never rely on color alone for error communication
- pair status styling with direct explanatory text
- keep field-level errors close to the relevant control
- for older adults, favor large readable text, strong contrast, low visual clutter, obvious button styles, predictable navigation, short UI paragraphs, visible actions, and interaction patterns that do not require speed or precision

#### Screen Application Rules

Landing:

- introduce the club, communicate trust, and guide users toward membership inquiry or library exploration
- use the strongest editorial tone in the product
- keep the hero stacked on smaller screens and allow a two-column treatment only at larger breakpoints
- use membership or contact as the primary CTA and library as the secondary CTA
- avoid dashboard-like composition

Library:

- present available books clearly and calmly
- use the responsive book grid pattern: `1` column on mobile, `2` on tablet, and `3` on large desktop
- keep title, author, cover, then synopsis in the reading order
- make the WhatsApp CTA visible without making the page feel transactional
- do not introduce filter-heavy behavior in this phase

Login:

- use the auth and gate panel pattern
- keep the layout single-column
- use a full-width primary action
- keep labels above controls
- use feedback banners for errors and auth status
- do not use a split-screen auth layout

Membership-expired:

- use the auth and gate panel pattern
- keep the layout single-column
- a warm CTA is acceptable for WhatsApp
- include one quiet fallback action
- keep the tone respectful and reassuring

Colloquium list:

- use a light private header
- allow each item layout to stack on mobile and split at larger breakpoints
- emphasize colloquium title, related book, date, and excerpt
- keep actions obvious without crowding the layout

Colloquium detail:

- minimize persistent header chrome
- preserve one clear back path
- constrain the reading body to reading width
- keep book context visible but subordinate to the content
- differentiate moderator and participant sections subtly
- do not allow navigation chrome to dominate the reading flow

#### Implementation Guidance

When implementing this foundation:

- convert tokens into `globals.css` CSS variables
- expose semantic tokens to the app layer
- implement layout and pattern consistency with Tailwind utility conventions
- use Tailwind's standard responsive model
- build the primary UI on shadcn/ui component patterns
- use `lucide-react` as the single default icon system
- avoid one-off visual rules unless clearly justified

#### Non-Negotiable Constraints

The visual redesign must preserve:

- existing backend behavior
- Supabase-based product logic
- membership gating behavior
- WhatsApp-based membership and book inquiry flows
- simple navigation
- accessibility for older adults
- calm and trustworthy tone

The redesign must not introduce:

- dense control surfaces
- unnecessary animations
- decorative complexity
- visually noisy gradients
- startup-style UX patterns
- public signup or payment flows
- feature expansion outside MVP

## 8. Development Constraints

- Use Server Components by default.
- Use `use client` only when real client-side interactivity is required.
- Use Server Actions for all data mutations.
- Use `revalidatePath()` after mutations when cached routes need to update.
- Add `loading.tsx` and skeleton states where route loading states are meaningful.
- Keep TypeScript strict and strongly typed.
- Avoid unnecessary `useEffect`.
- Avoid moving business logic to the client unless there is a clear need.
- Do not use Pages Router patterns.
- Do not use Prisma, Drizzle ORM, or any additional ORM.
- Use the Supabase Client directly for database access.
- Avoid overengineering.
- Avoid speculative abstractions.
- Add abstractions only when they solve a real, repeated problem.
- Prefer simple, explicit, maintainable code.
- Keep each implementation task tightly scoped.

### Colloquium Refactor Implementation Rules

- Keep the colloquium refactor domain-oriented and organized around the existing project structure.
- Prefer a dedicated colloquium feature surface for types, schemas, read models, and admin/editor logic rather than scattering new concerns across unrelated files.
- Use Route Handlers for presigned-upload and upload-confirmation flows when a browser client needs to exchange JSON payloads with the server.
- Use Server Actions for authenticated admin form mutations that fit the existing project pattern.
- Validate authentication and admin authorization inside every upload-related Route Handler and every colloquium mutation.
- Use `server-only` for any module that constructs privileged storage clients or reads private Supabase Storage credentials.
- Do not proxy large file bodies through Server Actions or ordinary app server endpoints when direct signed upload is available.
- Keep the first implementation compatible with the current private routes instead of introducing a second colloquium delivery surface.
- Remove legacy runtime reads once the structured presentation data migration has been applied.

### CI/CD Baseline

- Continuous Integration must run through GitHub Actions.
- Pull requests and pushes to `main` must run formatting checks, linting, typechecking, and a production build.
- CI must use `npm ci` for reproducible installs against `package-lock.json`.
- GitHub Actions workflows should use explicit permissions, workflow concurrency, and dependency caching where appropriate.
- Continuous Deployment should rely on the native Vercel Git integration already connected to the repository, rather than duplicating production deployment logic in GitHub Actions.
- Branch protection on `main` should require the GitHub Actions CI workflow to pass before merge.

### Public Repository Security Posture

- The repository may be public. Security must not depend on hiding the implementation.
- No secret, token, credential, environment value, dashboard export, or real customer data may be committed to version control.
- All privileged values must remain in environment variables or platform-managed secrets.
- Public repository examples, screenshots, SQL samples, and seed data must use fictional data only.
- Admin protection, membership checks, and private-content access must be enforced on the server and at the database policy layer.
- Every privileged mutation must validate authentication and authorization explicitly.
- Supabase RLS must be written as if an attacker can read the entire codebase and understand the schema.
- Unsafe HTML execution is forbidden. Colloquium text handling must default to plain text, or to an explicitly sanitized renderer if a future product decision reintroduces rich formatting.
- Before opening a pull request, review the diff for secrets, private notes, copied dashboard values, and accidental environment leakage.

## 9. Environment Configuration

Public WhatsApp configuration must not be hardcoded in components, actions, utilities, or route handlers.

Required public environment values:

- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE`

These values should be used to build WhatsApp URLs for membership inquiries, renewal requests, and book inquiries. Environment variable validation should be introduced when the project needs a shared configuration module.

Required Supabase environment values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a legacy fallback only, if the project has not switched to the publishable key naming yet.

Additional server-only environment values for the colloquium media refactor:

- `SUPABASE_COLLOQUIUM_MEDIA_BUCKET`

This value is used to resolve the private Supabase Storage bucket that stores colloquium media objects.

Server-only environment values:

- `SUPABASE_SERVICE_ROLE_KEY`, only if required for admin-side user creation or privileged operations.
- `CRON_SECRET`, required to authenticate Vercel Cron invocations for the Supabase keep-alive endpoint.

Server-only values must never be imported into Client Components or exposed through public environment variables.

### Colloquium Media Validation Baseline

The first implementation should enforce at least the following validation rules on the server:

- Supported audio types: `audio/mpeg`, `audio/mp4`, `audio/aac`, `audio/ogg`, and any additional type only if explicitly approved during implementation.
- The project should define an explicit maximum size limit for audio before production launch, rather than leaving it implicit.
- The server should reject uploads whose MIME type, extension, or intended usage context do not match the request.
- The server should persist `mime_type` and `size_bytes` for every confirmed media asset.
- The server should persist `duration_seconds` for audio whenever that value can be obtained reliably.

### Storage Key Convention

The colloquium media namespace should remain predictable and system-controlled.

Recommended patterns:

- `colloquiums/{colloquium-slug}/images/{uuid}.{ext}`
- `colloquiums/{colloquium-slug}/audio/{uuid}.{ext}`

Rules:

- The slug segment should be derived from the canonical colloquium record, not typed freely by the client.
- The filename suffix should use a generated identifier such as a UUID.
- Original filenames may be stored as display metadata for admins, but not as the sole object key.
- The server should sanitize or derive the extension from validated file metadata.

### Upload Flow

The approved media upload flow is:

1. The authenticated admin selects a file in the editor.
2. The client requests a signed upload capability from the backend for a specific colloquium context.
3. The backend validates admin access, file intent, type, size, and destination context.
4. The backend generates a signed upload token for Supabase Storage using a system-owned storage key.
5. The client uploads the file directly to the private Supabase Storage bucket.
6. The client calls a server endpoint or action to confirm the successful upload.
7. The server persists the `media_assets` metadata record only after successful confirmation.
8. The asset becomes selectable or attached within the colloquium editor.

The backend should expose functions or equivalent service responsibilities matching:

- `createSignedUploadToken`
- `confirmMediaUpload`
- `deleteMediaAsset`
- `createSignedReadUrl`
- `validateMediaFile`

Bootstrap note:

- The first administrator may need to be created through a server-only privileged flow or a manual SQL/bootstrap process, because the application does not support public signup and admin creation is restricted.

### Vercel Cron Keep-Alive

- Production uses a Vercel Cron job at `/api/cron/supabase-keepalive`.
- The schedule is `0 14 * * *` and must be interpreted in UTC.
- On Vercel Hobby, the job still runs only once per day and may execute up to 59 minutes late within the scheduled hour.
- Vercel does not retry failed cron invocations automatically, so production verification should use both Vercel runtime logs and the admin heartbeat surface.
- The cron route must remain protected with `CRON_SECRET` and must not redirect.

## 10. Execution Plan

The MVP should continue incrementally. Each step should leave the repository in a coherent state and avoid introducing features outside the current scope.

### Completed Baseline

The repository has already progressed beyond the original early-step plan. The following areas are implemented and should now be maintained rather than re-scaffolded:

- Project baseline and conventions for Next.js 16, strict TypeScript, Tailwind CSS v4, and root-level App Router structure.
- Supabase schema and Row Level Security migration for `profiles`, `books`, and `colloquiums`.
- Supabase SSR auth foundation with `proxy.ts`, login, logout, and server-side session helpers.
- Public home and library routes with WhatsApp calls to action.
- Membership gate and expired-membership flow.
- Private colloquium list and detail routes with structured section rendering.
- Admin dashboard and manual management flows for members, books, and colloquiums.
- GitHub Actions CI and dependency audit workflows.

### Current Focus: Colloquium Presentation MVP Completion

Objective:

- Deliver the approved private colloquium presentation module as part of the MVP while preserving existing security and membership-gating rules.

Scope:

- Complete the presentation-focused colloquium domain and remove legacy runtime dependencies from the visible flow.
- Keep legacy-content handling limited to one-time data migration, not ongoing runtime support.
- Add Supabase Storage-backed colloquium media support for audio using server-validated uploads.
- Build the administrative colloquium editor workflow required to create, edit, save drafts, and publish presentation-focused colloquiums.
- Verify required environment variables and server-only credential boundaries.
- Confirm all privileged Server Actions validate admin authorization.
- Confirm public WhatsApp flows use shared environment-driven helpers.
- Review route protection for public, authenticated member, expired member, and admin states.
- Verify Supabase RLS behavior in a real Supabase project.
- Review loading and error states for the main public, private, auth, and admin routes.
- Keep documentation aligned with implementation status.
- Run formatting, linting, typechecking, and production build checks.

Operational implementation phases:

- Phase 1: align the colloquium data model to presentation blocks and participant rosters, including the one-time migration path required to hide legacy non-MVP content.
- Phase 2: keep Supabase Storage integration focused on signed audio upload, upload confirmation, and persisted media metadata.
- Phase 3: build the admin colloquium editor for metadata, participants, presentation blocks, draft/published transitions, and reorder flows.
- Phase 4: refine preview, accessibility, migration tooling, and higher-quality presentation reading details.

Out of scope:

- Payment gateway integration.
- Public signup.
- Member self-service account creation.
- Public colloquium access.
- General-purpose media management unrelated to colloquiums.
- Any video workflow that has not been explicitly specified and designed for the colloquium module.
- Complex role systems beyond `admin` and `member`.
- Analytics, marketing automation, or feature expansion.

Deliverables:

- Passing local checks or clearly documented failures.
- Updated documentation for any discovered project conventions or verified limitations.
- Minimal secure infrastructure for the colloquium presentation module, including database, authorization, and media-upload foundations.
- A documented migration path from legacy colloquium rows to presentation-oriented colloquium records.
- Deployment-readiness notes for Vercel and Supabase.

Completion criteria:

- Core public, private, auth, and admin flows remain coherent during the refactor.
- Security rules are enforced in Server Components, Server Actions, Route Handlers, and Supabase RLS.
- Private colloquiums remain visible only to authenticated users with active memberships, while admins retain override access.
- The colloquium module uses ordered presentation blocks and managed audio as its only visible runtime reading model.
- The upload flow stores binary objects in Supabase Storage and stores only metadata in the database.
- The member-facing reader can render participants plus ordered text/audio presentation blocks without exposing drafts publicly.
- Environment configuration is documented and contains no committed secrets.
- The app is ready for initial Vercel deployment once Supabase project settings and production environment variables are verified.

### Legacy Migration Rules

- Existing colloquium rows must not be discarded during the refactor.
- Legacy colloquium bodies must be migrated once into presentation-compatible blocks before the deprecated source field is removed.

### Deferred Work

These items remain valid but should be handled only when explicitly requested or when required after the colloquium refactor foundation is in place:

- Add route-level `error.tsx` boundaries where operational testing shows meaningful failure modes.
- Continue extending the committed shadcn/ui primitive directory only where it improves clarity and accessibility.
- Add formal automated tests after the MVP behavior stabilizes enough to justify the maintenance cost.
