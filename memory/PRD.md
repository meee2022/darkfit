# DarkFit - Product Requirements Document

## Original Problem Statement
Clone the GitHub repository `https://github.com/meee2022/darkfit` (main branch), run the application, and perform a comprehensive Code, Architecture, Security, and UI/UX review from the perspective of a Senior Mobile App Engineer.

## Application Overview
**DarkFit** is a comprehensive Arabic-first fitness application targeting the Gulf/MENA market.

### Tech Stack (Corrected)
- **Frontend**: React 19 + Vite (NOT Expo React Native)
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

## What's Been Implemented (December 2025)

### Session Work Completed
- [x] Cloned GitHub repository successfully
- [x] Adapted codebase to Emergent platform structure
- [x] Set up frontend on port 3000
- [x] Created dummy backend for supervisor
- [x] Verified application runs correctly
- [x] Completed comprehensive technical audit

### Deliverables Created
- `/app/memory/DARKFIT_TECHNICAL_REVIEW.md` - Full 6-part technical review report

---

## Security Issues Identified (P0 - Critical)

| Issue | File | Action Required |
|-------|------|-----------------|
| `devMakeMeAdmin` mutation | `profiles.ts:530` | REMOVE from production |
| Hardcoded owner email | `profiles.ts:6` | Move to env variable |
| Google API key exposed | `.env:2` | Restrict in Google Console |
| Debug logs with auth data | `SignInForm.tsx` | Remove console.logs |

---

## Architecture Issues (P1)

1. Duplicate auth config in `auth.ts` and `admin.ts`
2. Large components (Dashboard.tsx ~970 lines)
3. No pagination on admin queries
4. Backup files in production (`*.backup.tsx`)
5. No rate limiting on mutations

---

## Prioritized Backlog

### P0 - Security Critical
- [ ] Remove devMakeMeAdmin mutation
- [ ] Secure API keys
- [ ] Input validation

### P1 - High Priority
- [ ] Error boundaries
- [ ] Rate limiting
- [ ] Code cleanup

### P2 - Medium Priority
- [ ] Component splitting
- [ ] Unit tests
- [ ] i18n extraction

### P3 - Low Priority
- [ ] Offline support
- [ ] Light mode
- [ ] Wearable integration

---

## User Credentials (Testing)
- Email: `eng.mohamed87@live.com`
- Password: `Realmadridclub@2011`

---

## Files of Reference
- `/app/frontend/src/App.tsx` - Main application entry
- `/app/frontend/convex/schema.ts` - Database schema
- `/app/frontend/convex/profiles.ts` - User management
- `/app/frontend/convex/fitbot.ts` - AI chatbot logic
- `/app/frontend/src/components/Dashboard.tsx` - Main dashboard
- `/app/frontend/src/SignInForm.tsx` - Authentication UI

---

*Last Updated: December 2025*
