// Simple in-memory login code store
// In production with multiple instances, use Redis or similar

interface CodeData {
  email: string
  token: string
  expiresAt: number
}

// Store login codes - code -> { email, token, expiresAt }
const codes = new Map<string, CodeData>()

// Generate a 6-digit code
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store a code with its associated token
export function storeCode(code: string, email: string, token: string): void {
  // Code expires in 10 minutes
  const expiresAt = Date.now() + 10 * 60 * 1000
  
  codes.set(code, { email, token, expiresAt })
  
  // Clean up expired codes
  for (const [c, data] of codes.entries()) {
    if (data.expiresAt < Date.now()) {
      codes.delete(c)
    }
  }
}

// Verify a code and return the token if valid
export function verifyCode(email: string, code: string): string | null {
  const data = codes.get(code)
  
  if (!data) {
    return null
  }
  
  if (data.expiresAt < Date.now()) {
    codes.delete(code)
    return null
  }
  
  if (data.email.toLowerCase() !== email.toLowerCase()) {
    return null
  }
  
  // Delete code after use (one-time use)
  codes.delete(code)
  
  return data.token
}
