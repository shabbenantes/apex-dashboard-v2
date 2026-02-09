# Apex Automation - Self-Service Onboarding Flow

## Overview
Fully automated customer onboarding with zero phone calls required. Human support only for error recovery.

## The Flow

### 1. Sign Up (Website)
- Customer visits getapexautomation.com
- Fills out sign-up form:
  - Business Name
  - Owner Name  
  - Email
  - Phone
  - Business Type (dropdown)
- Stripe checkout for $297/mo
- On success → webhook triggers automation

### 2. Account Creation (Automated)
- n8n workflow receives Stripe webhook
- Creates GHL sub-account using snapshot
- Generates Location API key
- Creates customer record in our API
- Sends welcome email with:
  - Dashboard login link (magic link)
  - Temporary GHL portal password
  - "Complete your setup" CTA

### 3. Dashboard Onboarding (Self-Service)
Customer logs into Dashboard and sees **Setup Checklist**:

```
Welcome to Apex! Let's get you set up.

□ Connect Facebook Messenger
□ Connect Instagram DMs  
□ Set Business Hours
□ Verify Business Phone
□ Review Auto-Reply Settings

[Continue Setup →]
```

### 4. Facebook/Instagram Connection

**The Challenge:** FB/IG OAuth MUST happen in GHL because GHL is the registered Facebook app. We can't proxy this.

**The Solution:** Guided portal visit with clear instructions.

When customer clicks "Connect Facebook":

```
┌─────────────────────────────────────────────────────────┐
│  Connect Your Facebook Page                              │
│                                                          │
│  To receive Facebook messages, we need to connect        │
│  your business page. This takes about 2 minutes.         │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Step 1: Click below to open your business portal  │  │
│  │ Step 2: Log in with your credentials:             │  │
│  │         Email: john@business.com                  │  │
│  │         Password: [Show/Hide]                     │  │
│  │ Step 3: Click "Facebook" under Integrations       │  │
│  │ Step 4: Click "Connect" and authorize             │  │
│  │ Step 5: Return here and click "Verify"            │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  [Open Business Portal]  (opens in new tab)              │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  Done connecting?                                        │
│  [✓ Verify My Connection]                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Portal URL:** Direct link to integrations page
`https://app.gohighlevel.com/v2/location/{locationId}/settings/integrations/list`

**Verification:** API call to check if FB conversations exist or location has FB page linked.

### 5. Business Hours Setup
In-dashboard form:
- Monday-Friday hours
- Saturday/Sunday hours  
- Holiday handling
- After-hours auto-reply customization

Saves to customer settings in our API, synced to GHL workflow variables.

### 6. Phone Verification
Customer's business phone is already captured at signup.
- Show current phone number
- "Is this correct?" 
- Option to update
- Send test SMS to verify

### 7. Review Auto-Replies
Show default auto-reply templates:
- Speed-to-lead response
- After-hours message
- Appointment confirmation
- Reminder messages

Customer can customize or keep defaults.

### 8. Setup Complete!
```
┌─────────────────────────────────────────────────────────┐
│  🎉 You're All Set!                                      │
│                                                          │
│  Your AI assistant is now live and ready to:             │
│  ✓ Respond to Facebook messages instantly                │
│  ✓ Handle Instagram DMs                                  │
│  ✓ Book appointments automatically                       │
│  ✓ Follow up with leads                                  │
│                                                          │
│  [Go to Dashboard]                                       │
│                                                          │
│  Need help? support@getapexautomation.com                │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Dashboard Components Needed
1. `SetupChecklist` - Main onboarding component
2. `ConnectFacebookModal` - Guided FB connection flow
3. `ConnectInstagramModal` - Same pattern for IG
4. `BusinessHoursForm` - Hours configuration
5. `AutoReplySettings` - Template customization
6. `SetupComplete` - Success state

### API Endpoints Needed
- `GET /api/onboarding/status` - Get checklist completion state
- `POST /api/onboarding/verify-facebook` - Check if FB connected
- `POST /api/onboarding/verify-instagram` - Check if IG connected
- `POST /api/settings/business-hours` - Save hours
- `POST /api/settings/auto-replies` - Save templates

### Data Model Updates
Add to customer record:
```json
{
  "onboarding": {
    "completedAt": null,
    "steps": {
      "facebookConnected": false,
      "instagramConnected": false,
      "businessHoursSet": false,
      "phoneVerified": false,
      "autoRepliesReviewed": false
    }
  },
  "ghlCredentials": {
    "email": "customer@email.com",
    "tempPassword": "generated-password"
  }
}
```

---

## White-Label Consideration

To make the GHL portal visit less jarring, we could:
1. Use GHL's white-label feature (requires higher GHL plan)
2. Custom domain: portal.getapexautomation.com
3. Custom branding: Apex logo, colors

This makes it feel like "their Apex portal" not "some other platform."

---

## Error Handling

If customer gets stuck:
1. "Having trouble?" link shows help content
2. Option to "Request a callback" (creates support ticket)
3. support@getapexautomation.com prominently displayed

Human support is FALLBACK only, not the default path.
