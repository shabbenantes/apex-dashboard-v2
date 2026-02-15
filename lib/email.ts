import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL || 'shane@getapexautomation.com',
    pass: process.env.ZOHO_APP_PASSWORD,
  },
})

// Brand colors - Light theme
const APEX_ORANGE = '#f97316'
const APEX_ORANGE_DARK = '#ea580c'
const APEX_BG = '#f8fafc'
const APEX_CARD_BG = '#ffffff'
const APEX_BORDER = '#e2e8f0'
const APEX_TEXT = '#0f172a'
const APEX_TEXT_SECONDARY = '#475569'
const APEX_TEXT_MUTED = '#64748b'

export async function sendMagicLinkEmail(to: string, magicLink: string, businessName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${APEX_BG}; color: ${APEX_TEXT}; padding: 40px 20px; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: ${APEX_TEXT};">
            ⚡ Apex<span style="color: ${APEX_ORANGE};">Automation</span>
          </h1>
        </div>
        
        <div style="background-color: ${APEX_CARD_BG}; border-radius: 16px; padding: 32px; border: 1px solid ${APEX_BORDER}; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <h2 style="font-size: 20px; margin: 0 0 16px 0; color: ${APEX_TEXT};">Sign in to your dashboard</h2>
          
          <p style="color: ${APEX_TEXT_SECONDARY}; margin: 0 0 24px 0; line-height: 1.6;">
            Click the button below to sign in to your ${businessName} dashboard. This link expires in 24 hours.
          </p>
          
          <a href="${magicLink}" style="display: block; background: ${APEX_ORANGE}; color: white; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 600; text-align: center;">
            Sign In to Dashboard
          </a>
          
          <p style="color: ${APEX_TEXT_MUTED}; font-size: 14px; margin: 24px 0 0 0; line-height: 1.6;">
            If you didn't request this email, you can safely ignore it.
          </p>
        </div>
        
        <p style="text-align: center; color: ${APEX_TEXT_MUTED}; font-size: 12px; margin-top: 32px;">
          © ${new Date().getFullYear()} Apex Automation
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: '"Apex Automation" <shane@getapexautomation.com>',
    to,
    subject: 'Sign in to your Apex Dashboard',
    html,
  })
}

export async function sendWelcomeEmail(to: string, magicLink: string, businessName: string, customerName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${APEX_BG}; color: ${APEX_TEXT}; padding: 40px 20px; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: ${APEX_TEXT};">
            ⚡ Apex<span style="color: ${APEX_ORANGE};">Automation</span>
          </h1>
        </div>
        
        <div style="background-color: ${APEX_CARD_BG}; border-radius: 16px; padding: 32px; border: 1px solid ${APEX_BORDER}; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <h2 style="font-size: 20px; margin: 0 0 16px 0; color: ${APEX_TEXT};">Welcome to Apex! 🎉</h2>
          
          <p style="color: ${APEX_TEXT_SECONDARY}; margin: 0 0 20px 0; line-height: 1.6;">
            Hi ${customerName},
          </p>
          
          <p style="color: ${APEX_TEXT_SECONDARY}; margin: 0 0 20px 0; line-height: 1.6;">
            Your ${businessName} account is set up and ready to go. Click below to access your dashboard — no password needed, you'll be logged in automatically.
          </p>
          
          <a href="${magicLink}" style="display: block; background: ${APEX_ORANGE}; color: white; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 600; text-align: center; margin-bottom: 24px;">
            Access Your Dashboard →
          </a>
          
          <div style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; border: 1px solid rgba(34,197,94,0.3);">
            <p style="color: ${APEX_TEXT}; font-weight: 600; margin: 0 0 12px 0; font-size: 14px;">✨ Next steps:</p>
            <ol style="color: ${APEX_TEXT_SECONDARY}; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
              <li>Click the button above to open your dashboard</li>
              <li>Connect your Facebook or Instagram page</li>
              <li>That's it! Your AI starts responding to DMs</li>
            </ol>
          </div>
          
          <p style="color: ${APEX_TEXT_MUTED}; font-size: 14px; margin: 24px 0 0 0; line-height: 1.6;">
            <strong style="color: ${APEX_TEXT_SECONDARY};">Note:</strong> Your 30-day free trial starts when you connect your first social account.
          </p>
        </div>
        
        <p style="text-align: center; color: ${APEX_TEXT_MUTED}; font-size: 13px; margin-top: 24px; line-height: 1.6;">
          Questions? Just reply to this email — we're here to help.
        </p>
        
        <p style="text-align: center; color: ${APEX_TEXT_MUTED}; font-size: 12px; margin-top: 16px;">
          © ${new Date().getFullYear()} Apex Automation
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: '"Apex Automation" <shane@getapexautomation.com>',
    to,
    subject: `Welcome to Apex, ${customerName}! Your dashboard is ready 🎉`,
    html,
  })
}

export async function sendLoginCodeEmail(to: string, code: string, businessName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${APEX_BG}; color: ${APEX_TEXT}; padding: 40px 20px; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: ${APEX_TEXT};">
            ⚡ Apex<span style="color: ${APEX_ORANGE};">Automation</span>
          </h1>
        </div>
        
        <div style="background-color: ${APEX_CARD_BG}; border-radius: 16px; padding: 32px; border: 1px solid ${APEX_BORDER}; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <h2 style="font-size: 20px; margin: 0 0 16px 0; color: ${APEX_TEXT};">Your login code</h2>
          
          <p style="color: ${APEX_TEXT_SECONDARY}; margin: 0 0 24px 0; line-height: 1.6;">
            Enter this code in your ${businessName} dashboard to sign in. This code expires in 10 minutes.
          </p>
          
          <div style="background-color: #fff7ed; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid rgba(249,115,22,0.3);">
            <span style="font-size: 40px; font-weight: bold; letter-spacing: 0.3em; font-family: monospace; color: ${APEX_ORANGE};">
              ${code}
            </span>
          </div>
          
          <p style="color: ${APEX_TEXT_MUTED}; font-size: 14px; margin: 24px 0 0 0; line-height: 1.6;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
        
        <p style="text-align: center; color: ${APEX_TEXT_MUTED}; font-size: 12px; margin-top: 32px;">
          © ${new Date().getFullYear()} Apex Automation
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: '"Apex Automation" <shane@getapexautomation.com>',
    to,
    subject: `${code} is your Apex login code`,
    html,
  })
}

// Trial Reminder Emails

export async function sendTrialReminderEmail(
  to: string, 
  businessName: string, 
  daysLeft: number,
  stats?: { messagesHandled?: number; conversationsStarted?: number }
) {
  const paymentLink = 'https://buy.stripe.com/5kQ7sN1JI75Ieeyf7Gf7i0m'
  
  let subject: string
  let urgencyColor: string
  let urgencyBg: string
  let headline: string
  let subtext: string
  
  if (daysLeft <= 0) {
    subject = `Your Apex trial has ended - add payment to continue`
    urgencyColor = '#ef4444'
    urgencyBg = '#fef2f2'
    headline = 'Your trial has ended'
    subtext = 'Add a payment method to keep your AI assistant active and never miss another lead.'
  } else if (daysLeft === 1) {
    subject = `⚠️ Last day of your Apex trial`
    urgencyColor = '#ef4444'
    urgencyBg = '#fef2f2'
    headline = 'Your trial ends tomorrow'
    subtext = 'Add a payment method now to avoid any interruption to your AI responses.'
  } else if (daysLeft <= 3) {
    subject = `Only ${daysLeft} days left in your Apex trial`
    urgencyColor = '#f97316'
    urgencyBg = '#fff7ed'
    headline = `${daysLeft} days left in your trial`
    subtext = 'Your AI assistant is working hard for you. Keep it going!'
  } else {
    subject = `${daysLeft} days left in your Apex trial - how's it going?`
    urgencyColor = '#eab308'
    urgencyBg = '#fefce8'
    headline = `${daysLeft} days left in your trial`
    subtext = 'Just checking in! Here\'s how your AI assistant is performing.'
  }
  
  const statsHtml = stats && (stats.messagesHandled || stats.conversationsStarted) ? `
    <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid rgba(34,197,94,0.3);">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: ${APEX_TEXT};">📊 Your AI's performance so far:</p>
      <div style="display: flex; gap: 24px;">
        ${stats.messagesHandled ? `<div><span style="font-size: 24px; font-weight: bold; color: #22c55e;">${stats.messagesHandled}</span><br><span style="font-size: 12px; color: ${APEX_TEXT_MUTED};">Messages handled</span></div>` : ''}
        ${stats.conversationsStarted ? `<div><span style="font-size: 24px; font-weight: bold; color: #22c55e;">${stats.conversationsStarted}</span><br><span style="font-size: 12px; color: ${APEX_TEXT_MUTED};">Conversations</span></div>` : ''}
      </div>
    </div>
  ` : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${APEX_BG}; color: ${APEX_TEXT}; padding: 40px 20px; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: ${APEX_TEXT};">
            ⚡ Apex<span style="color: ${APEX_ORANGE};">Automation</span>
          </h1>
        </div>
        
        <div style="background-color: ${APEX_CARD_BG}; border-radius: 16px; padding: 32px; border: 1px solid ${APEX_BORDER}; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          
          <!-- Urgency Banner -->
          <div style="background-color: ${urgencyBg}; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; border-left: 4px solid ${urgencyColor};">
            <p style="margin: 0; font-weight: 600; color: ${urgencyColor};">${headline}</p>
          </div>
          
          <p style="color: ${APEX_TEXT_SECONDARY}; margin: 0 0 20px 0; line-height: 1.6;">
            Hi there,
          </p>
          
          <p style="color: ${APEX_TEXT_SECONDARY}; margin: 0 0 20px 0; line-height: 1.6;">
            ${subtext}
          </p>
          
          ${statsHtml}
          
          <a href="${paymentLink}" style="display: block; background: ${APEX_ORANGE}; color: white; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 600; text-align: center; margin: 24px 0;">
            ${daysLeft <= 0 ? 'Reactivate Now - $97/month' : 'Add Payment Method →'}
          </a>
          
          <div style="background-color: ${APEX_BG}; border-radius: 8px; padding: 16px; margin-top: 24px;">
            <p style="margin: 0; font-size: 14px; color: ${APEX_TEXT_SECONDARY}; line-height: 1.6;">
              <strong>What you get for $97/month:</strong><br>
              ✓ Unlimited AI responses 24/7<br>
              ✓ Facebook & Instagram DM automation<br>
              ✓ Never miss a lead again<br>
              ✓ Cancel anytime
            </p>
          </div>
          
          <p style="color: ${APEX_TEXT_MUTED}; font-size: 14px; margin: 24px 0 0 0; line-height: 1.6;">
            Questions? Just reply to this email — we're here to help.
          </p>
        </div>
        
        <p style="text-align: center; color: ${APEX_TEXT_MUTED}; font-size: 12px; margin-top: 32px;">
          © ${new Date().getFullYear()} Apex Automation
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: '"Apex Automation" <shane@getapexautomation.com>',
    to,
    subject,
    html,
  })
}
