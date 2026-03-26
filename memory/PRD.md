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

### Core Features
1. User Authentication (Password + Anonymous)
2. Exercise Library (Bilingual AR/EN)
3. Nutrition Tracking & Meal Planning
4. AI Chatbot (FitBot)
5. Smart Coach with Daily Check-ins
6. Health Tracking (Glucose, BP, Weight)
7. Gamification (XP, Badges, Streaks)
8. Coach-Client Management
9. Gulf-specific Features (Prayer times, Fasting mode)
10. Admin Panel (Full CRUD)

---

## What's Been Implemented

### December 2025 - Session 1: Setup & Review
- [x] Cloned GitHub repository successfully
- [x] Adapted codebase to Emergent platform structure
- [x] Created comprehensive 6-part technical audit report
- [x] Identified security vulnerabilities and architecture issues

### December 2025 - Session 2: P0 Security Fixes ✅
- [x] **Removed `devMakeMeAdmin`** - Critical vulnerability allowing any user to become admin
- [x] **Moved `OWNER_EMAIL` to environment variable** - No more hardcoded secrets
- [x] **Removed `VITE_GOOGLE_API_KEY`** - Unused key removed from client code
- [x] **Deleted duplicate `admin.ts`** - Removed duplicate auth configuration

---

## Security Fixes Applied (P0 Complete)

| Issue | Status | Action Taken |
|-------|--------|--------------|
| `devMakeMeAdmin` mutation | ✅ FIXED | Removed from `profiles.ts` |
| Hardcoded `OWNER_EMAIL` | ✅ FIXED | Now uses `process.env.OWNER_EMAIL` |
| Google API key exposed | ✅ FIXED | Removed from `frontend/.env` |
| Duplicate `admin.ts` | ✅ FIXED | File deleted |

### Required Action in Convex Dashboard
⚠️ **IMPORTANT**: You must add the following environment variable in Convex Dashboard:
- **Settings** → **Environment Variables** → **Add Variable**
- Name: `OWNER_EMAIL`
- Value: `eng.mohamed87@live.com`

---

## Prioritized Backlog

### ✅ P0 - Security Critical (COMPLETED)
- [x] Remove devMakeMeAdmin mutation
- [x] Secure OWNER_EMAIL
- [x] Remove unused Google API key
- [x] Delete duplicate admin.ts

### P1 - High Priority (Next)
- [ ] Delete all `.backup.*` files
- [ ] Delete unused `CalorieCalculatorWrapper.tsx`
- [ ] Delete unused `CalorieCalculatorDark.tsx`
- [ ] Add input validation to FitBot
- [ ] Add rate limiting to sensitive mutations

### P2 - Medium Priority
- [ ] Split Dashboard.tsx into sub-components
- [ ] Add TypeScript strict mode
- [ ] Add pagination to admin queries
- [ ] Extract hardcoded Arabic strings to i18n

### P3 - Low Priority (Backlog)
- [ ] Add unit tests for auth flows
- [ ] Add error boundaries
- [ ] Implement offline support
- [ ] Add light mode theme

---

## Files Identified for Cleanup (P1)

### Backup Files (Safe to Delete)
```
/app/frontend/src/components/Dashboard.backup.tsx
/app/frontend/src/components/NutritionSection.backup.tsx
/app/frontend/src/components/CalorieCalculator.backup.tsx
/app/frontend/src/components/CalorieCalculator.backup2.tsx
/app/frontend/src/components/AdminPanel.backup.tsx
```

### Unused Files (Safe to Delete)
```
/app/frontend/src/components/CalorieCalculatorWrapper.tsx
/app/frontend/src/components/CalorieCalculatorDark.tsx
```

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

## Reports Created
- `/app/memory/DARKFIT_TECHNICAL_REVIEW.md` - Full 6-part technical audit

---

## User Credentials (Testing)
- Email: `eng.mohamed87@live.com`
- Password: `Realmadridclub@2011`

---

*Last Updated: December 2025*
