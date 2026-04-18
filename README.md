# someday-pm

someday-pm is a hackathon MVP for a private side-project management app.

The app is intended to help a user organize top-level side projects and one level of nested sub-cards, with private per-user access, Google auth, file uploads, and drag-to-reorder interactions.

## Planned stack

- React
- Vite
- React Router
- Supabase
  - Auth
  - Postgres
  - Storage
  - Row Level Security
- Framer Motion / Motion
- Vercel

## Core MVP goals

- Public landing page when logged out
- Dashboard when logged in
- Google auth
- User-specific private cards only
- Top-level project cards
- Nested child cards, limited to one additional level
- Drag-and-drop reorder
- File uploads
- Smooth motion and transitions

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create a local environment file

```bash
cp .env.example .env
```

3. Add your Supabase values to `.env`

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

4. Run the development server

```bash
npm run dev
```

## Blog (MVP)

Posts live in `content/blog/*.mdx`. The build globs those files and renders the body with **Markdown only** (`react-markdown`). The `.mdx` filename is for convention and future use; **embedded MDX / JSX in posts is not supported** until you add an MDX compiler — see the comment at the top of `src/lib/blog.js`.

## Notes

- `.env` should not be committed.
- `.env.example` is the committed template.
- This project uses Vite, so client-exposed environment variables must begin with `VITE_`.
- Google auth, database schema, and storage configuration will be added during implementation.

## Status

Initial scaffold in progress.