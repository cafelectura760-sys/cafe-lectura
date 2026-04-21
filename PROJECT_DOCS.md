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
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Server-only environment values:

- `SUPABASE_SERVICE_ROLE_KEY`, only if required for admin-side user creation or privileged operations.

Server-only values must never be imported into Client Components or exposed through public environment variables.

## 10. Execution Plan

The MVP should be built incrementally. Each step should leave the repository in a coherent state and avoid introducing features outside the current scope.

### Step 1: Project Baseline and Conventions

Objective:

- Establish the technical foundation and verify the current Next.js, TypeScript, Tailwind CSS v4, and project conventions.

Scope:

- Inspect installed dependencies and project structure.
- Read the relevant Next.js documentation in `node_modules/next/dist/docs/` before implementation.
- Confirm Tailwind CSS v4 setup.
- Confirm strict TypeScript settings.
- Define shared project conventions only where needed.

Out of scope:

- Product pages.
- Database schema.
- Authentication implementation.
- Admin workflows.

Deliverables:

- Verified project baseline.
- Any required minimal configuration corrections.
- Clear notes on framework conventions that affect implementation.
- Updates to `PROJECT_DOCS.md` when Step 1 discovers project-specific conventions that should govern future work.

Completion criteria:

- The app can run locally.
- TypeScript and linting are understood and pass or have known documented issues.
- Tailwind CSS v4 is confirmed to work using the modern CSS-based approach.

### Step 2: Design System Foundation

Objective:

- Establish accessible UI primitives and base styling for the application.

Scope:

- Configure or verify shadcn/ui usage.
- Define global visual tokens in CSS as needed.
- Add base layout patterns for readable pages.
- Establish button, card, form, table, and skeleton usage patterns.

Out of scope:

- Full page implementation.
- Data integration.
- Admin CRUD.

Deliverables:

- Reusable UI component setup.
- Accessible global styling foundation.
- Initial layout conventions suitable for older adults.

Completion criteria:

- Core UI components are available and consistent.
- Typography, contrast, spacing, and interaction targets match the product guidelines.

### Step 3: Supabase Schema and RLS

Objective:

- Define the database foundation with explicit security rules.

Scope:

- Create SQL for `profiles`, `books`, and `colloquiums`.
- Include indexes and foreign keys where appropriate.
- Enforce supported profile roles at the database level.
- Enforce a one-year default membership expiration at the database level.
- Enable Row Level Security on all application tables.
- Define explicit RLS policies for public, member, and admin access.

Out of scope:

- Application pages consuming the data.
- Admin UI.
- Seed content unless requested.

Deliverables:

- Supabase SQL migration or setup script.
- Complete RLS policy definitions.
- Documentation notes for required environment variables.

Completion criteria:

- Tables can be created cleanly in Supabase.
- RLS behavior matches public, member, and admin access rules.
- Membership expiration defaults are enforced in the database.
- No table relies on assumed or implicit policies.

### Step 4: Supabase SSR Auth Foundation

Objective:

- Implement authentication plumbing using Supabase Auth with SSR.

Scope:

- Create server-side Supabase client utilities.
- Configure middleware or route protection as required by the current Next.js version.
- Implement login flow for existing users.
- Implement logout if needed for a complete session flow.
- Ensure public self-registration is not exposed by the app.

Out of scope:

- Public signup.
- Password reset unless explicitly requested.
- Admin user creation UI.

Deliverables:

- SSR-compatible Supabase Auth setup.
- Login page.
- Protected route foundation.

Completion criteria:

- Existing users can log in.
- Authenticated session state is available server-side.
- Unauthenticated users are redirected away from protected routes.

### Step 5: Public Area

Objective:

- Build the public-facing experience for visitors.

Scope:

- Landing page.
- Public library page.
- WhatsApp call to action for membership and book requests.
- Public book reads from Supabase.

Out of scope:

- Private colloquium content.
- Admin editing workflows.
- Payments or downloads.

Deliverables:

- Public home page.
- Public library page.
- Environment-driven WhatsApp URL handling.

Completion criteria:

- Visitors can understand the club and request contact through WhatsApp.
- Books are visible publicly.
- No downloadable book files are exposed.
- WhatsApp values are not hardcoded.

### Step 6: Membership Gate and Expired Membership Flow

Objective:

- Enforce private access rules for colloquium routes.

Scope:

- Check authentication.
- Check active membership using `membership_expires_at`.
- Redirect expired members to `/membership-expired`.
- Allow admin users to bypass membership expiration checks.
- Provide WhatsApp renewal call to action.

Out of scope:

- Admin renewal workflow.
- Payment processing.
- Complex subscription states.

Deliverables:

- Membership validation helper or route-level guard.
- `/membership-expired` page.
- Protected private route behavior.

Completion criteria:

- Unauthenticated users cannot access private colloquiums.
- Expired members see the renewal screen.
- Active members can continue to private content.
- Admin users can access private content and admin views regardless of membership expiration.

### Step 7: Private Colloquium Area

Objective:

- Provide active members with access to text-based colloquiums.

Scope:

- Colloquium list page.
- Colloquium detail page.
- Visual distinction between moderator and participant content.
- Safe rendering approach for Markdown content.

Out of scope:

- Audio, video, or large file storage.
- Comments or live discussion.
- Member-generated content unless explicitly requested.

Deliverables:

- Private colloquium list.
- Private colloquium detail view.
- Loading and skeleton states where appropriate.

Completion criteria:

- Active members can browse and read colloquiums.
- Content remains text-based and Markdown-based.
- Moderator and participant sections are visually clear.

### Step 8: Admin Foundation

Objective:

- Create the internal admin area for manual management.

Scope:

- Admin dashboard route protection.
- Basic admin navigation.
- Read views for members, books, and colloquiums.
- Prepare Server Action patterns for future mutations.

Out of scope:

- Full CRUD unless requested for this step.
- Payment handling.
- Bulk import workflows.

Deliverables:

- Admin dashboard shell.
- Admin-only access enforcement.
- Initial data tables or summaries.

Completion criteria:

- Non-admin users cannot access admin routes.
- Admin users can access the dashboard.
- Admin views follow accessibility and readability guidelines.

### Step 9: Admin Manual Management

Objective:

- Implement manual management workflows required for the MVP.

Scope:

- Create users manually.
- Assign roles.
- Set or extend membership expiration dates.
- Apply the one-year default membership expiration in the application flow when creating member users.
- Manage books.
- Manage colloquiums.
- Use Server Actions for mutations.
- Revalidate affected routes after mutations.
- Use server-only privileged Supabase access only where required, such as creating Auth users.

Out of scope:

- Public signup.
- Payment automation.
- Complex role systems beyond `admin` and `member`.

Deliverables:

- Admin forms and tables.
- Server Actions for mutations.
- Validation and user feedback.

Completion criteria:

- Admins can perform required manual operations.
- Users are created only through the admin flow.
- Mutations are server-side.
- Updated data appears after revalidation.

### Step 10: MVP Hardening and Release Readiness

Objective:

- Prepare the MVP for deployment and real use.

Scope:

- Validate environment configuration.
- Review accessibility basics.
- Test route protection and RLS expectations.
- Verify loading states and error states.
- Prepare Vercel deployment notes.

Out of scope:

- Feature expansion.
- Analytics, marketing automation, or payment integration.

Deliverables:

- Final MVP verification checklist.
- Deployment readiness notes.
- Any critical bug fixes discovered during validation.

Completion criteria:

- Core public, private, auth, and admin flows work.
- Security rules are verified at the application and database levels.
- The app is ready for initial deployment to Vercel.
