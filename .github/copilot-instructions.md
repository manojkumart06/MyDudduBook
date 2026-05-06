# LendBook — Personal Finance Tracker

A production-ready, single-user, mobile-first web application for managing small personal loans and tracking monthly interest collection. Built with React 18, TypeScript, Chakra UI, Firebase Firestore, and Vite.

## Project Setup Status

- [x] Verify copilot-instructions.md file
- [ ] Scaffold Vite React TypeScript project
- [ ] Install and configure dependencies
- [ ] Create project folder structure
- [ ] Implement authentication system
- [ ] Build shared components
- [ ] Implement features (Customers, Loans, Payments, Dashboard)
- [ ] Set up Firebase security rules and indexes
- [ ] Create configuration files
- [ ] Verify TypeScript and build
- [ ] Create README and ARCHITECTURE docs

## Tech Stack

- **Frontend**: React 18+, TypeScript (strict mode), Vite
- **UI**: Chakra UI v2 with responsive design
- **Routing**: React Router v6
- **State & Data**: React Query (TanStack Query) + Firebase SDK
- **Forms**: React Hook Form + Zod validation
- **Backend**: Firebase Firestore
- **Auth**: Firebase Authentication (email/password)
- **Utilities**: date-fns, react-icons
- **Deployment**: Vercel (frontend) + Firebase (data)

## Key Requirements

- Mobile-first responsive design (360px minimum)
- TypeScript strict mode with no `any` outside Firebase boundaries
- All Firestore reads through React Query
- Every destructive action requires confirmation
- Dashboard with 5 summary cards
- Customers, Loans, Payments management
- Smart overdue payment logic with visual distinction
- Dark mode support
- Accessibility: AA minimum contrast, visible focus rings

## Firebase Configuration

Create a Firebase project and add credentials to `.env.local`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Development

```bash
pnpm install
pnpm dev
```

## Build & Deploy

```bash
pnpm build
pnpm preview
```

See README.md for complete setup instructions.
