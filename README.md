# Cafe Lectura

Cafe Lectura is a monolithic web application for a private reading club in Venezuela. The product includes a public area, a membership area for active readers, and an internal admin area for manual management.

This repository is intentionally maintained with a public-repo security posture:

- no secrets in source control
- no real customer data in the repository
- server-side authorization for privileged actions
- explicit Supabase Row Level Security for protected data

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Radix UI
- lucide-react
- Supabase
- Vercel

## Quality Gates

The repository uses:

- Husky
- lint-staged
- ESLint
- Prettier
- GitHub Actions CI

Every change to `main` is expected to pass:

- formatting checks
- linting
- typechecking
- production build validation

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run format
npm run format:check
```

## Documentation

Project decisions and implementation rules live in:

- [PROJECT_DOCS.md](C:/Projects/cafe-lectura/PROJECT_DOCS.md)
- [AGENTS.md](C:/Projects/cafe-lectura/AGENTS.md)

## Security Note

This codebase should be treated as publicly readable. Security must come from correct architecture and enforcement, not from source-code secrecy.
