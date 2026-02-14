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

  useEffect(() => {
    setPlatform(detectPlatform())
  }, [])

  if (platform === 'unknown') {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div 
        className="bg-[#0f172a] border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto animate-slide-up"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header with close button */}
        <div className="sticky top-0 bg-[#0f172a] px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Add to Home Screen</h2>
              <p className="text-gray-400 text-sm mt-1">
                One-tap access — no login needed
              </p>
            </div>
            <button 
              onClick={onDismiss}
              className="p-2 -m-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {platform === 'ios' && (
            <div className="space-y-6">
              {/* Benefit callout */}
              <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2">📲</div>
                <p className="text-white font-medium">Open Apex instantly from your home screen</p>
                <p className="text-gray-400 text-sm mt-1">Just like a real app — 3 quick taps</p>
              </div>

              {/* All steps visible at once */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-4 bg-white/[0.03] rounded-xl p-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white mb-1">Tap the Share button</p>
                    <p className="text-gray-400 text-sm">At the bottom of your screen in Safari</p>
                    <div className="mt-3 inline-flex items-center gap-2 bg-[#1c2536] rounded-lg px-4 py-2">
                      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v8a2 2 0 002 2h8a2 2 0 002-2v-8" />
                      </svg>
                      <span className="text-blue-400 font-medium text-sm">Share</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 bg-white/[0.03] rounded-xl p-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white mb-1">Tap "Add to Home Screen"</p>
                    <p className="text-gray-400 text-sm">Scroll down in the menu to find it</p>
                    <div className="mt-3 inline-flex items-center gap-3 bg-[#1c2536] rounded-lg px-4 py-2">
                      <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-white text-sm">Add to Home Screen</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 bg-white/[0.03] rounded-xl p-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white mb-1">Tap "Add" — you're done!</p>
                    <p className="text-gray-400 text-sm">It's in the top-right corner</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <span className="text-white font-bold text-lg">A</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Apex</p>
                        <p className="text-gray-500 text-xs">On your home screen</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Done button */}
              <button 
                onClick={onDismiss}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
              >
                Got it ✓
              </button>
            </div>
          )}

          {platform === 'android' && (
            <div className="space-y-6">
              {/* Benefit callout */}
              <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2">📲</div>
                <p className="text-white font-medium">Open Apex instantly from your home screen</p>
                <p className="text-gray-400 text-sm mt-1">Just like a real app — 2 quick taps</p>
              </div>

              {/* All steps visible at once */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-4 bg-white/[0.03] rounded-xl p-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white mb-1">Tap the menu ⋮</p>
                    <p className="text-gray-400 text-sm">Three dots in Chrome's top-right corner</p>
                    <div className="mt-3 inline-flex items-center justify-center bg-[#1c2536] rounded-lg px-4 py-2">
                      <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 bg-white/[0.03] rounded-xl p-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white mb-1">Tap "Add to Home screen"</p>
                    <p className="text-gray-400 text-sm">Then tap "Add" to confirm</p>
                    <div className="mt-3 inline-flex items-center gap-3 bg-[#1c2536] rounded-lg px-4 py-2">
                      <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-white text-sm">Add to Home screen</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result preview */}
              <div className="bg-white/[0.03] rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-3">You'll see this on your home screen:</p>
                <div className="inline-flex flex-col items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <span className="text-white font-bold text-xl">A</span>
                  </div>
                  <p className="text-white text-xs mt-2 font-medium">Apex</p>
                </div>
              </div>

              {/* Done button */}
              <button 
                onClick={onDismiss}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
              >
                Got it ✓
              </button>
            </div>
          )}

          {platform === 'desktop' && (
            <div className="space-y-6">
              {/* Desktop message */}
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2">💻</div>
                <p className="text-white font-medium">You're on desktop</p>
                <p className="text-gray-400 text-sm mt-1">Bookmark this page for quick access</p>
              </div>

              <div className="bg-white/[0.03] rounded-xl p-4">
                <p className="text-white font-medium mb-2">Quick bookmark:</p>
                <p className="text-gray-400 text-sm">
                  Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-white font-mono">⌘D</kbd> on Mac or <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-white font-mono">Ctrl+D</kbd> on Windows
                </p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                <p className="text-orange-300 text-sm">
                  💡 For the best experience, open this on your phone and add it to your home screen
                </p>
              </div>

              {/* Done button */}
              <button 
                onClick={onDismiss}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
              >
                Got it
              </button>
            </div>
          )}
        </div>

        {/* Skip option - subtle at bottom */}
        <div className="px-6 pb-6 pt-2 text-center">
          <button 
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            I'll do this later
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
