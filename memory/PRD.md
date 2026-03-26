# DarkFit - Product Requirements Document

## Original Problem Statement
Clone the GitHub repository `https://github.com/meee2022/darkfit` (main branch), run the application, and perform a comprehensive Code, Architecture, Security, and UI/UX review from the perspective of a Senior Mobile App Engineer.

## Application Overview
**DarkFit** is a comprehensive Arabic-first fitness application targeting the Gulf/MENA market.

### Tech Stack
- **Frontend**: React 19 + Vite
- **Mobile Wrapper**: Capacitor (hybrid approach)
- **Backend**: Convex Cloud (Serverless BaaS)
- **Database**: Convex (Document-based, real-time)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **AI**: Groq API (LLaMA 3.1 8B) for FitBot

---

## Completed Work

### Session 1: Setup & Review ✅
- [x] Cloned GitHub repository successfully
- [x] Adapted codebase to Emergent platform structure
- [x] Created comprehensive 6-part technical audit report

### Session 2: P0 Security Fixes ✅
- [x] **Removed `devMakeMeAdmin`** - Critical vulnerability eliminated
- [x] **Moved `OWNER_EMAIL` to environment variable**
- [x] **Removed `VITE_GOOGLE_API_KEY`** - Unused key removed
- [x] **Deleted duplicate `admin.ts`**

### Session 2: P1 Cleanup & Security Hardening ✅
- [x] **Deleted 7 backup/unused files**
- [x] **Added input sanitization** to FitBot (XSS protection)
- [x] **Added rate limiting infrastructure**
- [x] **Added rateLimits table** to schema.ts

### Session 2: P2 Architecture Refactor ✅
- [x] **Split Dashboard.tsx** from 970 lines → 566 lines (42% reduction)
- [x] **Created modular components** in `/src/components/dashboard/`:
  - `ModernStatCard.tsx` - Reusable stat card with ring progress
  - `ModernSectionCard.tsx` - Image-based section cards
  - `DashboardStats.tsx` - Stats grid component
  - `DashboardQuickActions.tsx` - Quick action buttons
  - `DashboardBMICard.tsx` - BMI progress card
  - `DashboardFooter.tsx` - Footer component
  - `InfoCard.tsx` - Generic info card
  - `utils.ts` - Shared helpers and types
  - `index.ts` - Barrel exports
- [x] **Improved mobile responsiveness** for stat cards:
  - Smaller padding on mobile (p-2.5 vs p-4)
  - Smaller ring size (64px vs 84px)
  - Smaller fonts on mobile
  - Better grid layout (2 cols on mobile, 3 on tablet, 5 on desktop)

---

## Security Improvements Applied

| Issue | Status | Action |
|-------|--------|--------|
| `devMakeMeAdmin` mutation | ✅ FIXED | Removed |
| Hardcoded `OWNER_EMAIL` | ✅ FIXED | Uses `process.env.OWNER_EMAIL` |
| Google API key exposed | ✅ FIXED | Removed from `.env` |
| Duplicate `admin.ts` | ✅ FIXED | Deleted |
| Backup files in prod | ✅ FIXED | 5 files deleted |
| Unused components | ✅ FIXED | 2 files deleted |
| XSS in FitBot | ✅ FIXED | Input sanitization added |
| Rate limiting | ✅ ADDED | Infrastructure in place |

---

## Architecture Improvements

### Dashboard Modularization
**Before**: Single 970-line `Dashboard.tsx`
**After**: Modular structure:
```
/src/components/
├── Dashboard.tsx (566 lines - main container)
└── dashboard/
    ├── index.ts
    ├── utils.ts
    ├── ModernStatCard.tsx
    ├── ModernSectionCard.tsx
    ├── DashboardStats.tsx
    ├── DashboardQuickActions.tsx
    ├── DashboardBMICard.tsx
    ├── DashboardFooter.tsx
    └── InfoCard.tsx
```

---

## Required Actions (User)

### ⚠️ Convex Dashboard Environment Variable
You MUST add this in Convex Dashboard → Settings → Environment Variables:
- **Name**: `OWNER_EMAIL`
- **Value**: `eng.mohamed87@live.com`

---

## Prioritized Backlog

### ✅ P0 - Security Critical (COMPLETED)
### ✅ P1 - High Priority (COMPLETED)
### ✅ P2 - Medium Priority (COMPLETED)

### 🔲 P3 - Low Priority (Backlog)
- [ ] Add unit tests for auth flows
- [ ] Add error boundaries
- [ ] Implement offline support
- [ ] Add light mode theme
- [ ] TypeScript strict mode
- [ ] Add pagination to admin queries
- [ ] Extract hardcoded Arabic strings to i18n

---

## Files Structure

### New Dashboard Components
```
/app/frontend/src/components/dashboard/
├── index.ts
├── utils.ts
├── ModernStatCard.tsx
├── ModernSectionCard.tsx
├── DashboardStats.tsx
├── DashboardQuickActions.tsx
├── DashboardBMICard.tsx
├── DashboardFooter.tsx
└── InfoCard.tsx
```

### Active Files (DO NOT DELETE)
```
/app/frontend/src/components/Dashboard.tsx
/app/frontend/src/components/NutritionSection.tsx
/app/frontend/src/components/NutritionSectionDark.tsx
/app/frontend/src/components/NutritionSectionLight.tsx
/app/frontend/src/components/CalorieCalculator.tsx
/app/frontend/src/components/AdminPanel.tsx
/app/frontend/src/components/CoachDashboard.tsx
/app/frontend/src/components/AiCoachDashboard.tsx
/app/frontend/src/components/health/HealthDashboard.tsx
/app/frontend/src/components/MyNutritionPlan.tsx
/app/frontend/src/components/NutritionPlanCreate.tsx
```

---

## Reports
- `/app/memory/DARKFIT_TECHNICAL_REVIEW.md` - Full 6-part audit

## Credentials (Testing)
- Email: `eng.mohamed87@live.com`
- Password: `Realmadridclub@2011`

---

*Last Updated: December 2025*
