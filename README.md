# Apex Customer Dashboard

A PWA dashboard for Apex Automation customers to manage their AI messaging assistant.

## Features

- 📊 **Dashboard** - View stats (messages, response time, leads)
- 💬 **Conversations** - See AI-handled chats
- ⚙️ **Settings** - Update business info, AI config, FAQ
- 🔗 **Connections** - FB/IG connection status
- 📱 **PWA** - Install as app on phone

## Tech Stack

- Next.js 15 (App Router)
- Tailwind CSS
- PWA-enabled

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your n8n webhook URLs

4. Run development server:
```bash
npm run dev
```

5. Open http://localhost:3000

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Manual

```bash
npm run build
npm start
```

## n8n Workflows Required

1. **apex-dashboard-auth** - Sends magic link emails
2. **apex-dashboard-verify** - Validates tokens, returns session data
3. **apex-dashboard-settings** - Updates GHL custom values

## Environment Variables

| Variable | Description |
|----------|-------------|
| `N8N_AUTH_WEBHOOK_URL` | Webhook for magic link requests |
| `N8N_VERIFY_WEBHOOK_URL` | Webhook for token verification |
| `N8N_SETTINGS_WEBHOOK_URL` | Webhook for settings updates |
| `DASHBOARD_URL` | Public dashboard URL |

## File Structure

```
dashboard/
├── app/
│   ├── (dashboard)/      # Authenticated pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── conversations/# Chat history
│   │   ├── settings/     # Config page
│   │   └── connect/      # FB/IG status
│   ├── api/              # API routes
│   ├── login/            # Login page
│   └── auth/verify/      # Magic link landing
├── components/           # Reusable components
├── public/               # Static files + PWA manifest
└── lib/                  # Utilities
```
