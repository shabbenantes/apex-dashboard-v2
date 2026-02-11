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

// Brand colors
const APEX_ORANGE = '#f97316'
const APEX_ORANGE_DARK = '#ea580c'
const APEX_BG = '#0f172a'
const APEX_CARD_BG = '#1e293b'
const APEX_BORDER = '#334155'

export async function sendMagicLinkEmail(to: string, magicLink: string, businessName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${APEX_BG}; color: #ffffff; padding: 40px 20px; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0;">
            Apex<span style="color: ${APEX_ORANGE};">Automation</span>
          </h1>
        </div>
        
        <div style="background-color: ${APEX_CARD_BG}; border-radius: 12px; padding: 32px; border: 1px solid ${APEX_BORDER};">
          <h2 style="font-size: 20px; margin: 0 0 16px 0;">Sign in to your dashboard</h2>
          
          <p style="color: #94a3b8; margin: 0 0 24px 0; line-height: 1.6;">
            Click the button below to sign in to your ${businessName} dashboard. This link expires in 24 hours.
          </p>
          
          <a href="${magicLink}" style="display: block; background: linear-gradient(135deg, ${APEX_ORANGE} 0%, ${APEX_ORANGE_DARK} 100%); color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center;">
            Sign In to Dashboard
          </a>
          
          <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0; line-height: 1.6;">
            If you didn't request this email, you can safely ignore it.
          </p>
        </div>
        
        <p style="text-align: center; color: #475569; font-size: 12px; margin-top: 32px;">
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
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${APEX_BG}; color: #ffffff; padding: 40px 20px; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0;">
            Apex<span style="color: ${APEX_ORANGE};">Automation</span>
          </h1>
        </div>
        
        <div style="background-color: ${APEX_CARD_BG}; border-radius: 12px; padding: 32px; border: 1px solid ${APEX_BORDER};">
          <h2 style="font-size: 20px; margin: 0 0 16px 0;">Welcome to Apex! 🎉</h2>
          
          <p style="color: #94a3b8; margin: 0 0 20px 0; line-height: 1.6;">
            Hi ${customerName},
          </p>
          
          <p style="color: #94a3b8; margin: 0 0 20px 0; line-height: 1.6;">
            Your ${businessName} account is set up and ready to go. Click below to access your dashboard — no password needed, you'll be logged in automatically.
          </p>
          
          <a href="${magicLink}" style="display: block; background: linear-gradient(135deg, ${APEX_ORANGE} 0%, ${APEX_ORANGE_DARK} 100%); color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 24px;">
            Access Your Dashboard →
          </a>
          
          <div style="background-color: ${APEX_BG}; border-radius: 8px; padding: 16px; border: 1px solid ${APEX_BORDER};">
            <p style="color: #f8fafc; font-weight: 600; margin: 0 0 12px 0; font-size: 14px;">Next steps:</p>
            <ol style="color: #94a3b8; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
              <li>Click the button above to open your dashboard</li>
              <li>Connect your Facebook or Instagram page</li>
              <li>That's it! Your AI starts responding to DMs</li>
            </ol>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0; line-height: 1.6;">
            <strong style="color: #94a3b8;">Note:</strong> Your 30-day free trial starts when you connect your first social account.
          </p>
        </div>
        
        <p style="text-align: center; color: #64748b; font-size: 13px; margin-top: 24px; line-height: 1.6;">
          Questions? Just reply to this email — we're here to help.
        </p>
        
        <p style="text-align: center; color: #475569; font-size: 12px; margin-top: 16px;">
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
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${APEX_BG}; color: #ffffff; padding: 40px 20px; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0;">
            Apex<span style="color: ${APEX_ORANGE};">Automation</span>
          </h1>
        </div>
        
        <div style="background-color: ${APEX_CARD_BG}; border-radius: 12px; padding: 32px; border: 1px solid ${APEX_BORDER};">
          <h2 style="font-size: 20px; margin: 0 0 16px 0;">Your login code</h2>
          
          <p style="color: #94a3b8; margin: 0 0 24px 0; line-height: 1.6;">
            Enter this code in your ${businessName} dashboard app to sign in. This code expires in 10 minutes.
          </p>
          
          <div style="background-color: ${APEX_BG}; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid ${APEX_BORDER};">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 0.3em; font-family: monospace; color: ${APEX_ORANGE};">
              ${code}
            </span>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0; line-height: 1.6;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
        
        <p style="text-align: center; color: #475569; font-size: 12px; margin-top: 32px;">
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
