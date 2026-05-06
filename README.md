# MyDudduBook

**Lend smart. Track easy.**

Personal finance tracker for managing small personal loans and monthly interest collection.

Mobile-first. Single-user. Fast on slow networks.

## Stack

- Vite · React 18 · TypeScript (strict)
- Chakra UI v2 for components + theming
- React Router v6 · React Query · React Hook Form · Zod
- Firebase Authentication + Firestore
- date-fns · lucide-react

## Local setup

Prerequisites: Node 20+, npm (or pnpm).

```bash
npm install
cp .env.example .env   # fill in Firebase values
npm run dev
```

The app runs on `http://localhost:5173`.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run `tsc --noEmit` |

## Firebase project setup

1. **Create a project** at https://console.firebase.google.com.
2. **Add a web app** and copy the SDK config values into `.env`.
3. **Enable Authentication** → sign-in method → Email/Password.
4. **Create a Firestore database** (production mode).
5. **Deploy security rules and indexes:**
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase init    # select "Firestore" for an existing project
   firebase deploy --only firestore:rules,firestore:indexes
   ```
   `firestore.rules` and `firestore.indexes.json` live at the repo root — point the CLI at them during `init`.

### Security rules

Every document carries a `userId`. Reads and writes are scoped to the authenticated user. The `loans` collection additionally enforces `monthlyInterest = principalAmount * interestRate / 100`. See [firestore.rules](firestore.rules).

### Indexes

Composite indexes for dashboard and filtered payment queries are in [firestore.indexes.json](firestore.indexes.json). Firestore will log a direct "create index" link if a query needs one that doesn't exist.

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import the repo into Vercel (auto-detects Vite).
3. Add the six `VITE_FIREBASE_*` env vars in **Project Settings → Environment Variables**.
4. Deploy. The `dist/` output is served as a static site; all routes are client-side, so no redirects are required for React Router.

### First-time authorization

Add your Vercel domain (and `localhost`) to **Firebase Console → Authentication → Settings → Authorized domains**.

## Features

- **Dashboard** — five summary cards (invested / expected / received / pending / overdue), upcoming-in-7-days list with quick mark-paid, and recent activity.
- **Customers** — searchable list, add / edit / delete with cascade confirmation.
- **Loans** — 12 monthly payments auto-generated on create; live monthly-interest preview; close loan cancels future pending payments.
- **Payments** — month picker + status chips; inline Mark Paid modal; overdue rows highlighted red.
- **Settings** — theme (light / dark / system), currency (INR / USD / EUR / GBP), sign-out.

## Responsive design

Mobile-first. Verified at 360×640, 414×896, 768×1024, 1280×800, 1920×1080.

- Drawer sidebar + bottom tab bar on phones, persistent sidebar ≥ md.
- Tables collapse to label-value cards below md via `ResponsiveTable`.
- Modals switch to full-screen on phones (`size={{ base: 'full', md: 'md' }}`).
- All interactive elements hit a 44×44 minimum touch target.
- iOS safe-area insets respected on the bottom tab bar.

## Project layout

See [ARCHITECTURE.md](ARCHITECTURE.md).

## Acceptance checklist

- [x] Sign up / sign in / sign out / password reset
- [x] Signed-out users cannot read or write any document (enforced in rules)
- [x] User A cannot read User B's data
- [x] Creating a loan generates 12 payments with correct due dates
- [x] `monthlyInterest = principalAmount × interestRate / 100`
- [x] Overdue payments visually distinct and filterable
- [x] All destructive actions confirm before executing
- [x] No horizontal scroll at 360px; no cut-off text
- [x] Dark-mode contrast verified
- [x] All forms validate client-side with Zod
- [x] `npm run build` succeeds under TypeScript strict mode
