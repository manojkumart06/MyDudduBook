# Architecture

## Folder layout

```
src/
├─ app/              # Composition root — App, Providers, Router, Theme
├─ features/         # Vertical slices, one folder per feature
│  ├─ auth/          # AuthContext, ProtectedRoute, Login/SignUp/Forgot pages
│  ├─ dashboard/     # DashboardPage
│  ├─ customers/     # List, Detail, Form modal
│  ├─ loans/         # List, Form modal
│  ├─ payments/      # List, MarkPaid modal
│  └─ settings/      # SettingsPage
├─ components/       # Reusable, presentational building blocks
├─ hooks/            # React Query wrappers (one file per collection) + queryKeys
├─ lib/              # firebase init, formatters, overdue — pure logic, no React
├─ schemas/          # Zod schemas shared by forms and writes
├─ types/            # Shared document interfaces
├─ main.tsx          # ReactDOM entry
└─ vite-env.d.ts
```

## Data flow

```
UI component
   └─ useCustomers / useLoans / usePayments  (React Query hook)
         └─ Firestore query / mutation (firebase/firestore)
               └─ Firestore

Mutations -> invalidate query keys -> UI re-reads the cache
```

### Rules

1. **No direct Firestore calls in components.** Every read goes through a hook in `src/hooks`, every mutation returns a `useMutation`.
2. **Business logic lives in `src/lib`.** The `isOverdue(payment, now)` check is pure, so the dashboard, the payments page, and the badge all agree.
3. **Schemas are the contract.** A form uses the Zod schema for validation; the mutation uses the same schema's type for its argument. Add a field in one place and both ends update.
4. **Query keys are centralized** in `src/hooks/queryKeys.ts`. Invalidations use the same key that the query reads with.
5. **The dashboard is the only real-time surface.** It uses `onSnapshot` via `useDashboardPayments`. Every other screen uses `getDocs` + React Query's cache (5-minute `staleTime`).
6. **Lazy routes.** Each feature page is `React.lazy`-loaded so the login bundle stays small.
7. **No file over ~250 lines.** When it grows, split into sub-components (see `DashboardPanel`) or extract a hook.

## Auth

- `<AuthProvider>` owns the Firebase `User` and the loading flag. It's mounted inside `<Providers>` above the router.
- `<ProtectedRoute>` gates the authenticated app shell.
- `<PublicOnlyRoute>` redirects signed-in users away from the login pages.
- `useCurrentUserId()` is a convenience for data hooks — it throws if called outside `<ProtectedRoute>`, which surfaces bugs early.

## Data integrity

- Every create/update writes `userId = request.auth.uid`; security rules reject anything else.
- Loan creates are a batched write: the loan document and its 12 payments land in one transaction.
- Closing a loan is a batched write: status flip + cancel all pending future payments.
- Deleting a customer is a two-step batch: fetch all dependent loans/payments, delete them alongside the customer.
- `monthlyInterest` is computed client-side on create and on every update; security rules independently verify the formula.

## Performance

- Firebase SDK, Chakra, and React Query are split into separate chunks (`vite.config.ts` → `manualChunks`) so the auth bundle stays small.
- Route components are `lazy`-loaded.
- Dashboard aggregations are derived via `useMemo` over the payments cache instead of re-querying.
- The payments list uses `limit(200)` to cap reads.

## Styling

- Chakra's semantic tokens + color-mode values. No custom CSS.
- Dark mode is on the `system` default but overridable in Settings.
- Responsive rules are mobile-first via Chakra's `{ base, sm, md, lg, xl }` object syntax — see [src/components/AppLayout.tsx](src/components/AppLayout.tsx) and [src/features/dashboard/DashboardPage.tsx](src/features/dashboard/DashboardPage.tsx) for the canonical examples.

## Where to add things

| Need to add | Put it in |
|---|---|
| New screen | `src/features/<feature>/<FeatureName>Page.tsx`, register in `src/app/router.tsx` |
| New data model | interface in `src/types/index.ts`, Zod schema in `src/schemas/`, hooks in `src/hooks/useX.ts` |
| Reusable UI piece | `src/components/` |
| Utility function | `src/lib/` (pure, no React) |
| Nav item | `NAV` in `src/components/Sidebar.tsx` and `TABS` in `src/components/BottomTabBar.tsx` |
