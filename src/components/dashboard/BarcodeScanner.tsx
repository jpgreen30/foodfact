'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Camera, Loader2 } from 'lucide-react'

interface Props {
  onDetected: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<'loading' | 'scanning' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const detectedRef = useRef(false)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    let mounted = true

    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')

        if (!mounted || !videoRef.current) return

        const reader = new BrowserMultiFormatReader()

        const controls = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoRef.current,
          (result, err) => {
            if (!mounted || detectedRef.current) return
            if (result) {
              detectedRef.current = true
              const text = result.getText()
              onDetected(text)
            } else if (err) {
              // NotFoundException fires on every frame with no barcode — ignore it
              const isNotFound = err?.message?.toLowerCase().includes('no multiformat')
                || err?.message?.toLowerCase().includes('no code')
                || err?.name === 'NotFoundException'
              if (!isNotFound) console.error('[scanner]', err)
            }
          }
        )

        controlsRef.current = controls
        if (mounted) setStatus('scanning')
      } catch (err: any) {
        if (!mounted) return
        const msg =
          err?.message?.toLowerCase().includes('permission')
            ? 'Camera access denied. Allow camera in your browser settings and try again.'
            : err?.message || 'Could not start camera.'
        setErrorMsg(msg)
        setStatus('error')
      }
    }

    start()

    return () => {
      mounted = false
      controlsRef.current?.stop()
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 safe-area-top">
        <h2 className="text-white font-bold text-base">Scan Barcode</h2>
        <button
          onClick={onClose}
          className="text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close scanner"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera feed */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />

        {/* Dark overlay with transparent center cutout */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/50" />
          {/* Viewfinder */}
          <div className="relative z-10 w-72 h-40">
            {/* Transparent center */}
            <div className="absolute inset-0 bg-transparent" />
            {/* Corner marks */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br" />
            {/* Scan line animation */}
            {status === 'scanning' && (
              <div
                className="absolute left-2 right-2 h-0.5 bg-green-400 shadow-lg shadow-green-400/60"
                style={{
                  animation: 'scanLine 2s ease-in-out infinite',
                  top: '50%',
                }}
              />
            )}
          </div>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-3" />
              <p className="text-white text-sm">Starting camera…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 px-6">
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-2">Camera unavailable</p>
              <p className="text-gray-400 text-sm leading-relaxed">{errorMsg}</p>
              <button
                onClick={onClose}
                className="mt-5 bg-white text-gray-900 font-bold px-5 py-2 rounded-xl text-sm hover:bg-gray-100"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 bg-black/80 text-center safe-area-bottom">
        <p className="text-gray-300 text-sm">
          {status === 'scanning'
            ? 'Point camera at the barcode on the packaging'
            : status === 'loading'
            ? 'Requesting camera access…'
            : ''}
        </p>
      </div>

      <style jsx>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(-24px); opacity: 0.6; }
          50% { transform: translateY(24px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
