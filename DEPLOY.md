# Deploy Apex Dashboard to Render

## Quick Deploy Steps

### 1. Deploy the API (Token Store)

1. Go to https://dashboard.render.com/new/web
2. Connect GitHub repo: `shabbenantes/apex-dashboard-api`
3. Settings:
   - **Name:** `apex-dashboard-api`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Starter ($7/mo) or Free
4. Add a **Disk** (for persistent sessions):
   - **Name:** `apex-data`
   - **Mount Path:** `/var/data`
   - **Size:** 1 GB
5. Environment Variables:
   - `DATA_DIR` = `/var/data`
6. Click Deploy

### 2. Deploy the Dashboard

1. Go to https://dashboard.render.com/new/web
2. Connect GitHub repo: `shabbenantes/apex-dashboard`
3. Settings:
   - **Name:** `apex-dashboard`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Starter ($7/mo) or Free
4. Environment Variables:
   ```
   DASHBOARD_API_URL = https://apex-dashboard-api.onrender.com
   N8N_AUTH_WEBHOOK_URL = https://getapexautomation.app.n8n.cloud/webhook/apex-dashboard-auth
   N8N_SETTINGS_WEBHOOK_URL = https://getapexautomation.app.n8n.cloud/webhook/apex-dashboard-settings
   NEXT_PUBLIC_DASHBOARD_URL = https://apex-dashboard.onrender.com
   ```
5. Click Deploy

### 3. Test It

1. Register a test customer in the API:
   ```bash
   curl -X POST https://apex-dashboard-api.onrender.com/customers \
     -H "Content-Type: application/json" \
     -d '{"email":"shane@getapexautomation.com","locationId":"JLAe4EMlLxFUSRAh1pB3","apiKey":"pit-4bf742ce-376b-4974-80f1-2560cfd57508","businessName":"Apex Automation"}'
   ```

2. Go to https://apex-dashboard.onrender.com
3. Enter your email and get a magic link
4. Click the link → You're logged in!

## Already Done

- ✅ GitHub repos created and pushed
- ✅ n8n workflows created and active:
  - `Apex Dashboard - Magic Link Auth` (nj9OfkPE4UCH0WL7)
  - `Apex Dashboard - Settings Handler` (Y2Gmtvr6J0nJpYhw)

## Custom Domain (Optional)

After deploy, add `dashboard.getapexautomation.com`:
1. In Render → Settings → Custom Domains
2. Add `dashboard.getapexautomation.com`
3. Update DNS in GoDaddy/Cloudflare:
   - CNAME: `dashboard` → `apex-dashboard.onrender.com`
