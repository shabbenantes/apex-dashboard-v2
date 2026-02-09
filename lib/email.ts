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

export async function sendMagicLinkEmail(to: string, magicLink: string, businessName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; color: #ffffff; padding: 40px 20px; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0;">
            Apex<span style="color: #8b5cf6;">Dashboard</span>
          </h1>
        </div>
        
        <div style="background-color: #18181b; border-radius: 12px; padding: 32px; border: 1px solid #27272a;">
          <h2 style="font-size: 20px; margin: 0 0 16px 0;">Sign in to your dashboard</h2>
          
          <p style="color: #a1a1aa; margin: 0 0 24px 0; line-height: 1.6;">
            Click the button below to sign in to your ${businessName} dashboard. This link expires in 15 minutes.
          </p>
          
          <a href="${magicLink}" style="display: block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center;">
            Sign In to Dashboard
          </a>
          
          <p style="color: #71717a; font-size: 14px; margin: 24px 0 0 0; line-height: 1.6;">
            If you didn't request this email, you can safely ignore it.
          </p>
        </div>
        
        <p style="text-align: center; color: #52525b; font-size: 12px; margin-top: 32px;">
          © ${new Date().getFullYear()} Apex Automation
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: '"Apex Dashboard" <shane@getapexautomation.com>',
    to,
    subject: 'Sign in to your Apex Dashboard',
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
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; color: #ffffff; padding: 40px 20px; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0;">
            Apex<span style="color: #8b5cf6;">Dashboard</span>
          </h1>
        </div>
        
        <div style="background-color: #18181b; border-radius: 12px; padding: 32px; border: 1px solid #27272a;">
          <h2 style="font-size: 20px; margin: 0 0 16px 0;">Your login code</h2>
          
          <p style="color: #a1a1aa; margin: 0 0 24px 0; line-height: 1.6;">
            Enter this code in your ${businessName} dashboard app to sign in. This code expires in 10 minutes.
          </p>
          
          <div style="background-color: #0a0a0f; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #27272a;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 0.3em; font-family: monospace; color: #8b5cf6;">
              ${code}
            </span>
          </div>
          
          <p style="color: #71717a; font-size: 14px; margin: 24px 0 0 0; line-height: 1.6;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
        
        <p style="text-align: center; color: #52525b; font-size: 12px; margin-top: 32px;">
          © ${new Date().getFullYear()} Apex Automation
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: '"Apex Dashboard" <shane@getapexautomation.com>',
    to,
    subject: `${code} is your Apex Dashboard login code`,
    html,
  })
}
