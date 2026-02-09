# Apex Customer Dashboard - Build Plan

## Overview
A PWA (Progressive Web App) dashboard for Apex Automation customers to view their AI conversation stats, manage settings, and see their FB/IG connection status.

---

## Skills & Tools Gathered

### Installed Skills
| Skill | Purpose |
|-------|---------|
| `react-expert` | React 19 patterns, hooks, state management |
| `nextjs-expert` | Next.js 15 App Router, Server Components, API routes |
| `lb-better-auth-skill` | Magic link auth, session management |
| `ui-ux-pro-max` | Design system, UI patterns, accessibility |
| `data-visualization` | Charts and stats display |
| `n8n-api` | Webhook integration for settings updates |

### External Integrations
| Service | Purpose | API |
|---------|---------|-----|
| **GHL (GoHighLevel)** | Customer data, conversations, contacts | REST API |
| **n8n** | Settings webhooks, auth magic links | Webhooks |
| **Stripe** | Billing status (optional) | REST API |

---

## Tech Stack Decision

### Recommended: Next.js 15 + Tailwind + PWA

**Why Next.js:**
- Server Components for secure API calls (GHL keys stay server-side)
- API Routes for auth/webhooks
- Easy PWA setup with `next-pwa`
- Can host on Vercel (free tier) or Render

**Why Tailwind:**
- Fast styling, consistent design
- Already familiar from website work
- Mobile-first responsive

**Auth: Magic Link (via n8n)**
- Customer enters email
- n8n sends magic link with token
- Token maps to GHL locationId
- No passwords needed

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Apex Dashboard (PWA)                     │
│                   Next.js 15 on Vercel                      │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                     │
│  ├── /login          - Email input, magic link request      │
│  ├── /auth/verify    - Magic link landing, session create   │
│  ├── /dashboard      - Overview stats                       │
│  ├── /conversations  - Recent AI chats                      │
│  ├── /settings       - Business info, AI config             │
│  └── /connect        - FB/IG connection status              │
├─────────────────────────────────────────────────────────────┤
│  API Routes:                                                │
│  ├── /api/auth/request  - Trigger n8n magic link            │
│  ├── /api/auth/verify   - Validate token, create session    │
│  ├── /api/stats         - Get conversation stats from GHL   │
│  ├── /api/conversations - Get recent conversations          │
│  └── /api/settings      - GET/POST settings via GHL API     │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │   n8n    │        │   GHL    │        │  Stripe  │
    │ Webhooks │        │   API    │        │   API    │
    └──────────┘        └──────────┘        └──────────┘
```

---

## Data Flow

### Authentication Flow
```
1. Customer goes to dashboard.getapexautomation.com
2. Enters email → POST /api/auth/request
3. API calls n8n webhook with email
4. n8n looks up email → finds GHL contact → gets locationId
5. n8n generates token (JWT or random) → stores in temp table
6. n8n sends email with magic link: /auth/verify?token=xxx
7. Customer clicks link → GET /api/auth/verify?token=xxx
8. API validates token → creates session cookie with locationId
9. Redirect to /dashboard
```

### Dashboard Data Flow
```
1. Customer loads /dashboard (authenticated)
2. Server Component fetches stats from GHL API:
   - GET /locations/{locationId}/conversations (last 7 days)
   - GET /locations/{locationId}/contacts (new leads)
3. Display: messages handled, avg response time, leads captured
```

### Settings Flow
```
1. Customer loads /settings
2. Server fetches current custom values from GHL
3. Display form with current values
4. Customer updates → POST /api/settings
5. API calls n8n webhook with new values
6. n8n updates GHL custom values
7. Confirm success
```

---

## Database Needs

**Minimal - Use GHL as the database:**
- Customer data → GHL Contacts
- Settings → GHL Custom Values
- Conversations → GHL Conversations
- Auth tokens → n8n (temporary, can use memory or simple store)

**No separate database needed for v1.**

---

## UI/UX Design

### Design System (using ui-ux-pro-max)
- **Style**: Clean, minimal, professional (matches website)
- **Colors**: Same as website (Indigo/Purple gradient, dark theme)
- **Typography**: Inter for UI, Fraunces for headings
- **Components**: Cards, stats, tables, forms

### Pages

#### 1. Login (`/login`)
- Apex logo
- Email input
- "Send Magic Link" button
- "Check your email" confirmation state

#### 2. Dashboard (`/dashboard`)
- Welcome message with business name
- Stats cards:
  - Messages This Week
  - Avg Response Time
  - Leads Captured
  - Appointments (if available)
- Recent conversations preview (last 5)
- Quick actions (Settings, View All Conversations)

#### 3. Conversations (`/conversations`)
- List of recent conversations
- Each shows: customer name, last message, timestamp
- Click to expand full conversation
- Filter by date range

#### 4. Settings (`/settings`)
- Form sections:
  - Business Info (name, type, services, area, hours)
  - Contact (phone, booking link)
  - AI Personality (tone, special instructions, FAQ/knowledge)
  - Notifications (escalation name/email)
- Save button → calls n8n webhook

#### 5. Connect (`/connect`)
- FB connection status (connected/not)
- IG connection status
- "Reconnect" button if needed
- Link to GHL FB integration page

---

## PWA Setup

### manifest.json
```json
{
  "name": "Apex Dashboard",
  "short_name": "Apex",
  "description": "Manage your AI messaging assistant",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0F0F1A",
  "theme_color": "#6366F1",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker
- Cache static assets
- Offline fallback page
- Background sync for settings updates

---

## Implementation Order

### Phase 1: Foundation (Today)
1. Create Next.js project with Tailwind
2. Set up PWA config
3. Create basic layout and navigation
4. Implement login page UI

### Phase 2: Auth (Today)
5. Create n8n workflow for magic link
6. Implement /api/auth/request endpoint
7. Implement /api/auth/verify endpoint
8. Session management with cookies

### Phase 3: Dashboard (Today/Tomorrow)
9. Create dashboard page with stats
10. Implement GHL API integration
11. Display conversation stats
12. Create conversations list page

### Phase 4: Settings (Tomorrow)
13. Create settings form
14. Implement settings save via n8n
15. Add FB/IG connection status page

### Phase 5: Polish (Tomorrow)
16. Add loading states
17. Error handling
18. Mobile responsive tweaks
19. PWA icons and splash screens
20. Deploy to Vercel

---

## API Keys Needed

| Service | Key Type | Where to Get |
|---------|----------|--------------|
| GHL | Location API Key | Per-customer, stored in auth token/session |
| n8n | Webhook URLs | Create workflows, get webhook URLs |

**Security Note:** GHL API keys are per-location. The auth system maps email → locationId → apiKey. API keys never exposed to browser.

---

## File Structure

```
apex-dashboard/
├── app/
│   ├── layout.tsx          # Root layout with nav
│   ├── page.tsx            # Redirect to /login or /dashboard
│   ├── login/
│   │   └── page.tsx        # Login form
│   ├── auth/
│   │   └── verify/
│   │       └── page.tsx    # Magic link landing
│   ├── dashboard/
│   │   └── page.tsx        # Main dashboard
│   ├── conversations/
│   │   └── page.tsx        # Conversation list
│   ├── settings/
│   │   └── page.tsx        # Settings form
│   ├── connect/
│   │   └── page.tsx        # FB/IG status
│   └── api/
│       ├── auth/
│       │   ├── request/route.ts
│       │   └── verify/route.ts
│       ├── stats/route.ts
│       ├── conversations/route.ts
│       └── settings/route.ts
├── components/
│   ├── ui/                 # Reusable components
│   ├── StatsCard.tsx
│   ├── ConversationItem.tsx
│   └── SettingsForm.tsx
├── lib/
│   ├── ghl.ts              # GHL API client
│   ├── auth.ts             # Session helpers
│   └── n8n.ts              # n8n webhook helpers
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   └── icon-512.png
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## n8n Workflows Needed

### 1. Dashboard Auth - Magic Link
- **Trigger:** Webhook (POST /apex-dashboard-auth)
- **Input:** { email }
- **Steps:**
  1. Find contact in GHL by email
  2. Get locationId from contact
  3. Generate token (UUID + timestamp)
  4. Store token → locationId mapping (use n8n variables or simple node)
  5. Send email with magic link
- **Output:** { success: true }

### 2. Dashboard Auth - Verify Token
- **Trigger:** Webhook (POST /apex-dashboard-verify)
- **Input:** { token }
- **Steps:**
  1. Look up token → get locationId
  2. Get API key from lookup table (same as chatbot)
  3. Validate token not expired
  4. Return locationId + apiKey
- **Output:** { locationId, apiKey, businessName }

### 3. Dashboard Settings - Update
- **Trigger:** Webhook (POST /apex-dashboard-settings)
- **Input:** { locationId, apiKey, settings }
- **Steps:**
  1. Validate apiKey
  2. Update GHL custom values
- **Output:** { success: true }

---

## Ready to Build?

This plan covers:
- ✅ Authentication (magic link, no passwords)
- ✅ Stats & conversations from GHL
- ✅ Settings management
- ✅ PWA for app-like experience
- ✅ Uses existing stack (GHL, n8n)
- ✅ No new database needed
- ✅ Security (API keys server-side only)

**Estimated build time:** 4-6 hours for full v1

---

*Generated: 2026-02-08*
