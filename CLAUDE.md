# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 cleaning service booking application with instant price estimates. The app supports both residential and commercial cleaning bookings with a multi-step form, real-time pricing calculation, and Supabase backend.

## Development Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Validation**: Zod
- **Styling**: Tailwind CSS v4

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── book/page.tsx      # Multi-step booking form (client component)
│   ├── admin/page.tsx     # Admin dashboard (server component)
│   └── api/bookings/      # API route for booking submissions
└── lib/                   # Shared utilities
    ├── pricing.ts         # Pricing engine and estimation logic
    └── supabaseAdmin.ts   # Supabase admin client factory
```

### Core Components

**Pricing Engine** (`src/lib/pricing.ts`)
- All pricing logic is centralized in this file
- Exports `estimateResidential()` and `estimateCommercial()` functions
- Returns estimates with `{ok: true, shown, internalLow, internalHigh}` or `{ok: false, reason}`
- Key concepts:
  - Tier-based pricing by square footage
  - Clean level multipliers (light, standard, heavy, deepReset)
  - Travel fee bands (0-15mi: $0, 15-30mi: $15, 30-50mi: $30)
  - Hourly guardrails to prevent unrealistic estimates
  - Move-in/out minimums and multipliers for residential
  - Business type multipliers and frequency discounts for commercial

**Booking Flow** (`src/app/book/page.tsx`)
- 7-step wizard: Address → Type → Details → Clean Level → Add-ons → Schedule → Contact
- Client-side state management with React hooks
- Real-time estimate calculation using `useMemo`
- All form state is preserved during navigation between steps
- Final submission to `/api/bookings` POST endpoint

**API Layer** (`src/app/api/bookings/route.ts`)
- Validates with Zod schema
- Stores bookings in Supabase `bookings` table with status "pending"
- Maps camelCase API to snake_case database columns

**Admin Dashboard** (`src/app/admin/page.tsx`)
- Server component that fetches latest 50 bookings
- Token-based auth via `ADMIN_TOKEN` environment variable
- Access via `/admin?token=YOUR_TOKEN`

### Environment Variables

Required in `.env.local`:
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_TOKEN=
```

### Key Implementation Details

**Path Aliases**
- `@/*` maps to `src/*` (configured in tsconfig.json)

**Pricing Service Area**
- Service radius: 50 miles from home bases
- Home base ZIP codes: 54481, 54482, 54492
- Distance is currently manual input (MVP); future: Google Distance Matrix API

**Database Schema** (Supabase `bookings` table)
- Columns: id, created_at, booking_type, address_text, distance_miles, scheduled_date, scheduled_window, estimate_shown, internal_low, internal_high, input (JSONB), customer (JSONB), status

**Client vs Server**
- Booking form is client component (`"use client"`)
- Admin page is async server component
- API routes are server-only

### Common Patterns

**Adding New Features**
- Residential-specific: Update `estimateResidential()` in pricing.ts, add form fields in step 2
- Commercial-specific: Update `estimateCommercial()` in pricing.ts, add form fields in step 2
- New add-ons: Add to `PRICING.addOns.residential` or `.commercial` arrays
- Database changes: Update Supabase schema, then update API route Zod schema

**Testing Estimates**
- Use the booking form UI at `/book`
- Pricing logic is pure functions in `pricing.ts` - can be tested in isolation
- Admin dashboard at `/admin?token=TOKEN` to verify submitted bookings
