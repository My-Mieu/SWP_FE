# SHARELOOP Frontend Prototype

SHARELOOP is a frontend-only React prototype for giving away unused items, trading used items, district-based discovery, AI-assisted matching, messaging, Credit holds, handover flow, profile reputation, and admin moderation.

## Stack

React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, React Redux, React Router DOM, Be Vietnam Pro, and Material Symbols Outlined.

## Run

```bash
npm install
npm run dev
npm run build
```

## Deploy to Vercel

The repository includes `vercel.json` with the SPA rewrite required by React Router. Vercel uses Node.js 24, runs `npm run build`, and publishes `dist`.

### From Git

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, select **Add New Project** and import the repository.
3. Keep the detected framework as **Vite** and deploy. No environment variables are currently required.

Every push to the production branch creates a production deployment. Other branches and pull requests receive preview deployments.

### From the Vercel CLI

```bash
npx vercel
npx vercel --prod
```

Do not commit the generated `.vercel` directory; it contains the local link to the Vercel project.

## Demo Accounts

- User: `use` / `12345678`
- Admin: `admin` / `12345678`

The login page also includes demo-login buttons.

## Mock Backend

All domain data lives in one Redux-backed mock database seeded from `src/mocks/database.ts` and persisted to `localStorage` under `shareloop:v1:state`. Pages must use shared entities, not duplicate Home/Browse/Admin/AI arrays.

Use the Reset Demo Data action from the profile/admin workflow by dispatching `resetDemoData` during development, or clear the localStorage key.

## Main Routes

- `/`, `/browse`, `/product/:id`, `/ai`
- `/login`, `/register`
- `/post`, `/activities`, `/messages`, `/profile`
- `/admin` and nested moderation, users, transactions, finance, settings, audit logs

## Credit Rules

1 Credit = 1,000 VND. `totalCredit = availableCredit + holdCredit`. Opening pages, modals, or conversations never charges Credit. Credit moves only through explicit transaction or wallet actions.
