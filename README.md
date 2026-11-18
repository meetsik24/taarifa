This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Submissions are stored in Neon Postgres. The app reads the pooled `DATABASE_URL` through `lib/db.ts`. Vercel cannot keep the old local SQLite file.

1. Import this repository in Vercel. The framework preset is Next.js, and the project expects Node.js 22.
2. Add `DATABASE_URL` for Production and Preview. Copy the pooled value from `.env`. The host contains `-pooler`. Do not commit `.env`.
3. Deploy.

The `submissions` table is defined in `db/schema.sql` and already exists on the linked Neon branch.
