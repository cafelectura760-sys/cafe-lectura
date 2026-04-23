# Cafe Lectura Project Documentation

## 1. Project Overview

Cafe Lectura is a monolithic web application for a private local reading club in Venezuela. The MVP supports a public presence, a private membership area, and a simple internal administration area.

The platform is designed primarily for adults between 50 and 70+ years old. The product must prioritize clarity, readability, accessibility, and a calm user experience over visual novelty or complex interactions.

### MVP Scope

- Public landing page for the reading club.
- Public visual library of available books.
- Private colloquium area for active members.
- Admin dashboard for manual internal management.
- Login-only authentication flow with no public signup.
- WhatsApp-based membership and book requests.

### Product Goals

- Make the club easy to understand for visitors.
- Allow members with active memberships to access colloquium content.
- Keep administration manual, simple, and reliable.
- Avoid unnecessary automation, payment complexity, and heavy media handling.
- Provide a trustworthy, readable interface for older adults.

### Business Model

Cafe Lectura uses a manual annual membership model. Users do not purchase subscriptions inside the app. Any membership request, renewal request, or book request must redirect to WhatsApp using configured environment values.

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

This section reflects the repository state directly observed in version-controlled files on April 23, 2026.

Implemented:

- Next.js 16 App Router project using the root `app/` directory and route groups.
- Tailwind CSS v4 global CSS setup.
- Supabase SSR client utilities using `@supabase/ssr`.
- Root `proxy.ts` for Supabase session cookie refresh.
- Public home page and public library page backed by Supabase book data.
- Login-only authentication flow for existing Supabase users.
- Private colloquium list and detail pages protected by server-side membership checks.
- Expired-membership page with environment-driven WhatsApp renewal link.
- Admin dashboard protected by server-side `role = admin` validation.
- Admin-created user flow using the service-role Supabase client only on the server.
- Manual admin management for members, books, and colloquiums using Server Actions.
- Safe Markdown rendering for colloquium content without raw HTML execution.
- Supabase migration for `profiles`, `books`, and `colloquiums`, including constraints, indexes, Row Level Security, and policies.
- GitHub Actions CI for formatting, linting, typechecking, and production build.
- Weekly dependency audit workflow.

Observed gaps or repository-only limitations:

- The UI uses plain Tailwind classes and does not yet include a committed shadcn/ui component directory.
- Admin management supports create/update workflows, but delete workflows are not implemented.
- Route-level loading states exist for library and colloquium routes, but error boundaries are not yet present.
- Supabase project settings are not represented in version-controlled files, so public self-registration still needs manual verification in the Supabase dashboard.
- Real RLS runtime behavior against anonymous visitors, active members, expired members, and admins cannot be confirmed from repository files alone.
- Production deployment readiness on Vercel cannot be confirmed from repository files alone.

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
  - Allows visitors to request a book through WhatsApp.
  - Does not provide downloadable files.

### Private Area

Routes:

- `(private)/colloquiums/page.tsx`
  - URL: `/colloquiums`
  - Lists available colloquiums for authenticated members with active memberships.
- `(private)/colloquiums/[id]/page.tsx`
  - URL: `/colloquiums/[id]`
  - Shows the detail page for a single colloquium.
  - Displays text-based content with clear visual distinction between moderator and participant contributions.
- `(private)/membership-expired/page.tsx`
  - URL: `/membership-expired`
  - Dedicated expired-membership screen with a WhatsApp renewal call to action.

Access to the private colloquium area requires both authentication and an active membership. Administrators may access all system views regardless of membership expiration.

### Admin Area

Routes:

- `(admin)/admin/page.tsx`
  - URL: `/admin`
  - Internal administration dashboard.
  - Accessible only to authenticated users with `role = admin`.
  - Used for manual management of members, books, and colloquiums.

Administrators must also have a clear navigation action that takes them to the admin dashboard after login and from appropriate authenticated views.

### Auth Area

Routes:

- `(auth)/login/page.tsx`
  - URL: `/login`
  - Login page for existing users.
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
- The public library must provide a "Request Book" action that opens WhatsApp.
- Colloquiums must not store audio, video, or heavy media files.
- Colloquium content must use Markdown as the MVP source format.
- Raw enriched HTML should not be accepted for MVP colloquium content.
- Markdown rendering must use a safe rendering strategy and must not allow unsafe HTML execution.
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
- `created_at`: book creation timestamp.

Purpose:

- Power the public visual library.
- Provide book details for WhatsApp-based request flows.
- Link books to colloquiums when applicable.

### `colloquiums`

Stores private text-based colloquium content.

Key fields:

- `id`: UUID primary key.
- `title`: colloquium title.
- `content`: Markdown content.
- `book_id`: foreign key referencing `books.id`.
- `published_at`: publication timestamp.

Purpose:

- Provide members with private reading club content.
- Associate discussions with books.
- Keep content lightweight and text-focused.
- Support readable discussion formatting using Markdown conventions.

Content format:

- Markdown is the MVP format for colloquium content.
- Use clear headings or labels for moderator and participant sections.
- The UI should style moderator and participant sections differently where the Markdown structure allows it.
- Raw HTML must not be trusted as user-safe content.

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
- Define explicit policies for `profiles`, `books`, and `colloquiums`.
- Allow public read access to `books` when appropriate.
- Restrict `colloquiums` to authenticated users with active memberships.
- Allow admin users to read and manage all protected data regardless of membership expiration.
- Restrict `profiles` to tightly controlled access patterns.
- Ensure admin write permissions are controlled by role.
- Test policies for anonymous visitors, regular active members, expired members, and admin users.

Any database setup SQL generated for this project must include complete RLS policies.

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
- Do not use Lorem Ipsum.
- Do not use generic placeholder text.
- Text should feel connected to books, reading, conversation, and the local club context.

Repository documentation, code, comments, file names, and technical artifacts must be written in English.

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
- Unsafe HTML execution is forbidden. Any rich content pipeline must default to safe Markdown or sanitized rendering.
- Before opening a pull request, review the diff for secrets, private notes, copied dashboard values, and accidental environment leakage.

## 9. Environment Configuration

Public WhatsApp configuration must not be hardcoded in components, actions, utilities, or route handlers.

Required public environment values:

- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE`

These values should be used to build WhatsApp URLs for membership inquiries, renewal requests, and book requests. Environment variable validation should be introduced when the project needs a shared configuration module.

Required Supabase environment values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a legacy fallback only, if the project has not switched to the publishable key naming yet.

Server-only environment values:

- `SUPABASE_SERVICE_ROLE_KEY`, only if required for admin-side user creation or privileged operations.

Server-only values must never be imported into Client Components or exposed through public environment variables.

Bootstrap note:

- The first administrator may need to be created through a server-only privileged flow or a manual SQL/bootstrap process, because the application does not support public signup and admin creation is restricted.

## 10. Execution Plan

The MVP should continue incrementally. Each step should leave the repository in a coherent state and avoid introducing features outside the current scope.

### Completed Baseline

The repository has already progressed beyond the original early-step plan. The following areas are implemented and should now be maintained rather than re-scaffolded:

- Project baseline and conventions for Next.js 16, strict TypeScript, Tailwind CSS v4, and root-level App Router structure.
- Supabase schema and Row Level Security migration for `profiles`, `books`, and `colloquiums`.
- Supabase SSR auth foundation with `proxy.ts`, login, logout, and server-side session helpers.
- Public home and library routes with WhatsApp calls to action.
- Membership gate and expired-membership flow.
- Private colloquium list and detail routes with safe Markdown rendering.
- Admin dashboard and manual management flows for members, books, and colloquiums.
- GitHub Actions CI and dependency audit workflows.

### Current Focus: MVP Hardening and Release Readiness

Objective:

- Validate and harden the already implemented MVP without expanding product scope.

Scope:

- Verify required environment variables and server-only credential boundaries.
- Confirm all privileged Server Actions validate admin authorization.
- Confirm public WhatsApp flows use shared environment-driven helpers.
- Review route protection for public, authenticated member, expired member, and admin states.
- Verify Supabase RLS behavior in a real Supabase project.
- Review loading and error states for the main public, private, auth, and admin routes.
- Keep documentation aligned with implementation status.
- Run formatting, linting, typechecking, and production build checks.

Out of scope:

- Payment gateway integration.
- Public signup.
- Member self-service account creation.
- Audio, video, downloads, or heavy media workflows.
- Complex role systems beyond `admin` and `member`.
- Analytics, marketing automation, or feature expansion.

Deliverables:

- Passing local checks or clearly documented failures.
- Updated documentation for any discovered project conventions or verified limitations.
- Minimal fixes for obvious security, consistency, accessibility, or operational issues.
- Deployment-readiness notes for Vercel and Supabase.

Completion criteria:

- Core public, private, auth, and admin flows are understood and checked.
- Security rules are enforced in Server Components, Server Actions, Route Handlers, and Supabase RLS.
- Environment configuration is documented and contains no committed secrets.
- The app is ready for initial Vercel deployment once Supabase project settings and production environment variables are verified.

### Deferred Work

These items remain valid but should be handled only when explicitly requested or when required for release readiness:

- Add delete workflows for admin-managed books, colloquiums, or members if the business process requires them.
- Add route-level `error.tsx` boundaries where operational testing shows meaningful failure modes.
- Introduce a committed shadcn/ui component directory if the project starts standardizing reusable UI primitives.
- Add formal automated tests after the MVP behavior stabilizes enough to justify the maintenance cost.
