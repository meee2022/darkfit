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
- [x] **Moved `OWNER_EMAIL` to environment variable** - No more hardcoded secrets
- [x] **Removed `VITE_GOOGLE_API_KEY`** - Unused key removed from client
- [x] **Deleted duplicate `admin.ts`** - Removed duplicate auth configuration

### Session 2: P1 Cleanup & Security Hardening ✅
- [x] **Deleted 7 backup/unused files**:
  - `Dashboard.backup.tsx`
  - `NutritionSection.backup.tsx`
  - `CalorieCalculator.backup.tsx`
  - `CalorieCalculator.backup2.tsx`
  - `AdminPanel.backup.tsx`
  - `CalorieCalculatorWrapper.tsx` (unused)
  - `CalorieCalculatorDark.tsx` (unused)
- [x] **Added input sanitization** to FitBot (XSS protection)
- [x] **Added rate limiting infrastructure** to profiles.ts
- [x] **Added rateLimits table** to schema.ts

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

## Required Actions (User)

### ⚠️ Convex Dashboard Environment Variable
You MUST add this in Convex Dashboard → Settings → Environment Variables:
- **Name**: `OWNER_EMAIL`
- **Value**: `eng.mohamed87@live.com`

### ⚠️ Google Cloud Console
Consider deleting/rotating the exposed key `AIzaSyBO-olxBk-8BofzmBLgX9pL_EO5M_TTMN4`

---

## Prioritized Backlog

### ✅ P0 - Security Critical (COMPLETED)
- [x] Remove devMakeMeAdmin mutation
- [x] Secure OWNER_EMAIL
- [x] Remove unused Google API key
- [x] Delete duplicate admin.ts

### ✅ P1 - High Priority (COMPLETED)
- [x] Delete all backup files
- [x] Delete unused CalorieCalculator files
- [x] Add input validation/sanitization
- [x] Add rate limiting infrastructure

### 🔲 P2 - Medium Priority (Next)
- [ ] Split Dashboard.tsx into sub-components (970 lines)
- [ ] Add TypeScript strict mode
- [ ] Add pagination to admin queries
- [ ] Extract hardcoded Arabic strings to i18n

### 🔲 P3 - Low Priority (Backlog)
- [ ] Add unit tests for auth flows
- [ ] Add error boundaries
- [ ] Implement offline support
- [ ] Add light mode theme

---

## Active Files (DO NOT DELETE)
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
