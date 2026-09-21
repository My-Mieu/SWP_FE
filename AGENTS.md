# SHARELOOP Agent Guide

SHARELOOP is a React + TypeScript + Vite frontend prototype using Tailwind, Redux Toolkit, React Redux, and React Router DOM.

## Architecture

- `src/types` contains domain contracts.
- `src/mocks/database.ts` is the seed database.
- `src/app/store.ts` contains Redux actions around the shared mock state.
- `src/utils/credit.ts` and `src/utils/transaction.ts` hold business rules.
- `src/components/ui.tsx` contains reusable SHARELOOP UI primitives.
- `src/pages` contains route screens.
- `src/routes/Guards.tsx` enforces route access.

## Design System Rules

Use SHARELOOP tokens from `tailwind.config.js` and `src/styles/globals.css`: primary `#00685F`, secondary `#9D4300`, background `#F8F9FF`, surface tokens, Be Vietnam Pro, radius and shadows from the design system.

Never redesign existing SHARELOOP UI without instruction.

## Domain Boundaries

Never duplicate domain entities. Home, Browse, AI, Activities, Messages, and Admin must resolve data from the same Item, User, Transaction, Conversation, Wallet/Credit history sources.

Never hardcode one transaction into every chat. Each `Conversation.transactionId` must resolve its own transaction.

## Routing And Roles

Roles are `guest`, `user`, and `admin`. Guest-only pages redirect logged-in users to `/`. Protected pages redirect guests to `/login`. Admin pages redirect guests to `/login` and non-admin users to `/`.

Never expose Admin features to normal users.

## Credit Invariants

Never charge Credit during render, page open, modal open, or conversation open.

Keep Credit, Reward Points, Member Rank, and Reputation Stars separate. Never mix Credit with Reward Points.

Always preserve: `totalCredit = availableCredit + holdCredit`.

## Transaction State Machine

Never change transaction status outside approved domain actions. Use transaction/Credit utilities and Redux actions. Valid flow:

`NEGOTIATING -> SCHEDULE_PROPOSED -> SCHEDULE_CONFIRMED -> CREDIT_HELD -> SENDER_CONFIRMED/RECEIVER_CONFIRMED -> COMPLETED`

Alternative terminal states: `CANCELLED`, `DISPUTED`.

## Search Rules

District search only. Never introduce GPS, kilometers, radius, or near-me logic.

## Adding Pages

Add a route in `src/app/router.tsx`, reuse `AppShell` or `AdminLayout`, and read data through selectors/hooks. Do not create page-local mock databases.

## Adding Components

Use existing tokens, Material Symbols, and component variants. Add reusable controls to `src/components/ui.tsx` or split them into a focused component folder if they grow.
