'use client'

import { useState, useEffect } from 'react'

type Platform = 'ios' | 'android' | 'desktop' | 'unknown'

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent.toLowerCase()
  
  // Check if already installed as PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'unknown' // Already installed
  }
  
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  if (/macintosh|windows|linux/.test(ua)) return 'desktop'
  
  return 'unknown'
}

export default function AddToHomeScreen({ onDismiss }: { onDismiss: () => void }) {
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [step, setStep] = useState(1)

  useEffect(() => {
    setPlatform(detectPlatform())
  }, [])

  if (platform === 'unknown') {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-apex-card border border-apex-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-apex-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">Add to Home Screen</h2>
            <button 
              onClick={onDismiss}
              className="text-gray-400 hover:text-white p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Get quick access to your dashboard like a native app
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {platform === 'ios' && (
            <div className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-apex-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-apex-purple">1</span>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Tap the Share button</p>
                      <p className="text-gray-400 text-sm">
                        Look for the share icon at the bottom of Safari
                      </p>
                      <div className="mt-3 flex items-center justify-center bg-gray-800 rounded-lg p-4 gap-3">
                        {/* iOS Safari share icon */}
                        <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          {/* Arrow pointing up */}
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4" />
                          {/* Open-top box/tray */}
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v8a2 2 0 002 2h8a2 2 0 002-2v-8" />
                        </svg>
                        <span className="text-white font-medium">Share</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    className="btn-primary w-full"
                  >
                    Next Step
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-apex-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-apex-purple">2</span>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Tap "Add to Home Screen"</p>
                      <p className="text-gray-400 text-sm">
                        Scroll down in the share menu and tap this option
                      </p>
                      <div className="mt-3 bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-3 text-white">
                          <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <span className="font-medium">Add to Home Screen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 py-2 px-4 rounded-xl border border-apex-border text-gray-300 hover:bg-white/5"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      className="btn-primary flex-1"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-apex-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-apex-purple">3</span>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Tap "Add"</p>
                      <p className="text-gray-400 text-sm">
                        Confirm the name and tap Add in the top right
                      </p>
                      <div className="mt-3 bg-gray-800 rounded-lg p-4 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-apex-purple to-apex-purple-light rounded-2xl mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">A</span>
                        </div>
                        <p className="text-white font-medium">Apex</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setStep(2)}
                      className="flex-1 py-2 px-4 rounded-xl border border-apex-border text-gray-300 hover:bg-white/5"
                    >
                      Back
                    </button>
                    <button 
                      onClick={onDismiss}
                      className="btn-primary flex-1"
                    >
                      Done!
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {platform === 'android' && (
            <div className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-apex-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-apex-purple">1</span>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Tap the menu (⋮)</p>
                      <p className="text-gray-400 text-sm">
                        Look for the three dots in Chrome's top right corner
                      </p>
                      <div className="mt-3 flex items-center justify-center bg-gray-800 rounded-lg p-4">
                        <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    className="btn-primary w-full"
                  >
                    Next Step
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-apex-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-apex-purple">2</span>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Tap "Add to Home screen"</p>
                      <p className="text-gray-400 text-sm">
                        Select this option from the menu
                      </p>
                      <div className="mt-3 bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-3 text-white">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>Add to Home screen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 py-2 px-4 rounded-xl border border-apex-border text-gray-300 hover:bg-white/5"
                    >
                      Back
                    </button>
                    <button 
                      onClick={onDismiss}
                      className="btn-primary flex-1"
                    >
                      Done!
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {platform === 'desktop' && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-apex-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💻</span>
                </div>
                <div>
                  <p className="font-medium mb-2">Bookmark this page</p>
                  <p className="text-gray-400 text-sm">
                    On desktop, bookmark this page for quick access. Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘/Ctrl + D</kbd>
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                For the best experience, access your dashboard on your phone and add it to your home screen.
              </p>
              <button 
                onClick={onDismiss}
                className="btn-primary w-full"
              >
                Got it
              </button>
            </div>
          )}
        </div>

        {/* Skip option */}
        <div className="p-4 border-t border-apex-border text-center">
          <button 
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
