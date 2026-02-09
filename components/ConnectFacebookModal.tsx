'use client'

import { useState } from 'react'

interface ConnectFacebookModalProps {
  platform: 'facebook' | 'instagram'
  portalUrl?: string
  onClose: () => void
  onVerify: () => void
  verifying?: boolean
}

export default function ConnectFacebookModal({ 
  platform, 
  portalUrl, 
  onClose, 
  onVerify,
  verifying = false 
}: ConnectFacebookModalProps) {
  const [step, setStep] = useState<'instructions' | 'verify'>('instructions')
  const [showPassword, setShowPassword] = useState(false)

  const isFacebook = platform === 'facebook'
  const platformName = isFacebook ? 'Facebook Messenger' : 'Instagram DMs'
  const platformIcon = isFacebook ? '📘' : '📸'
  const platformColor = isFacebook ? 'from-blue-500 to-blue-600' : 'from-pink-500 to-purple-500'

  const defaultPortalUrl = portalUrl || 'https://app.gohighlevel.com'
  const integrationUrl = `${defaultPortalUrl}/settings/integrations`

  const handleOpenPortal = () => {
    window.open(integrationUrl, '_blank')
    setStep('verify')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-apex-dark border border-apex-border rounded-2xl max-w-lg w-full p-6 animate-fade-in shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platformColor} flex items-center justify-center`}>
            <span className="text-2xl">{platformIcon}</span>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Connect {platformName}</h2>
            <p className="text-gray-400 text-sm">Takes about 2 minutes</p>
          </div>
        </div>

        {step === 'instructions' ? (
          <>
            {/* Instructions */}
            <div className="bg-white/5 rounded-xl p-5 mb-6">
              <h3 className="font-medium mb-4 text-white">Here's what to do:</h3>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-apex-purple/20 text-apex-purple text-sm font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <div>
                    <p className="text-gray-300">Click the button below to open your business portal</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-apex-purple/20 text-apex-purple text-sm font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <div>
                    <p className="text-gray-300">Log in with your email and password</p>
                    <p className="text-gray-500 text-sm mt-1">(Check your welcome email for credentials)</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-apex-purple/20 text-apex-purple text-sm font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <div>
                    <p className="text-gray-300">Find "{isFacebook ? 'Facebook' : 'Instagram'}" in the integrations list</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-apex-purple/20 text-apex-purple text-sm font-bold flex items-center justify-center flex-shrink-0">4</span>
                  <div>
                    <p className="text-gray-300">Click "Connect" and authorize with {isFacebook ? 'Facebook' : 'Instagram'}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-apex-purple/20 text-apex-purple text-sm font-bold flex items-center justify-center flex-shrink-0">5</span>
                  <div>
                    <p className="text-gray-300">Come back here and click "Verify Connection"</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Open Portal Button */}
            <button
              onClick={handleOpenPortal}
              className={`w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r ${platformColor} hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
            >
              Open Business Portal
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>

            {/* Help text */}
            <p className="text-center text-gray-500 text-sm mt-4">
              Don't have your login credentials?{' '}
              <a href="mailto:support@getapexautomation.com" className="text-apex-purple hover:text-apex-purple-light">
                Contact support
              </a>
            </p>
          </>
        ) : (
          <>
            {/* Verify Step */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-apex-purple/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-apex-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Done connecting?</h3>
              <p className="text-gray-400">
                Click below to verify your {platformName} connection
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={onVerify}
                disabled={verifying}
                className="w-full btn-primary py-4"
              >
                {verifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  '✓ Verify My Connection'
                )}
              </button>
              
              <button
                onClick={handleOpenPortal}
                className="w-full py-3 rounded-xl border border-apex-border text-gray-400 hover:text-white hover:border-apex-purple/50 transition-colors"
              >
                Open Portal Again
              </button>
            </div>

            {/* Back link */}
            <button
              onClick={() => setStep('instructions')}
              className="w-full text-center text-gray-500 text-sm mt-4 hover:text-white transition-colors"
            >
              ← Back to instructions
            </button>
          </>
        )}
      </div>
    </div>
  )
}
