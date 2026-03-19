'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { ScanResult } from '@/lib/types'

interface Props {
  scans: ScanResult[]
}

export default function ScanHistory({ scans }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'safe' | 'caution' | 'danger'>('all')

  const filtered = scans.filter(s => filter === 'all' || s.overallScore === filter)

  const scoreColors = {
    safe: { badge: 'badge-safe', bg: 'bg-green-50 border-green-200', icon: '✅', label: 'SAFE' },
    caution: { badge: 'badge-caution', bg: 'bg-yellow-50 border-yellow-200', icon: '⚠️', label: 'CAUTION' },
    danger: { badge: 'badge-danger', bg: 'bg-red-50 border-red-200', icon: '🚫', label: 'DANGER' },
  }

  const levelColors = { low: 'text-yellow-600 bg-yellow-50', medium: 'text-orange-600 bg-orange-50', high: 'text-red-600 bg-red-50' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">Scan History</h1>
        <span className="text-sm text-gray-500">{scans.length} total scans</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', 'safe', 'caution', 'danger'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all border-2 ${
              filter === f
                ? f === 'safe' ? 'bg-green-600 text-white border-green-600' :
                  f === 'caution' ? 'bg-yellow-500 text-white border-yellow-500' :
                  f === 'danger' ? 'bg-red-600 text-white border-red-600' :
                  'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {f === 'all' ? `All (${scans.length})` :
             f === 'safe' ? `✅ Safe (${scans.filter(s => s.overallScore === 'safe').length})` :
             f === 'caution' ? `⚠️ Caution (${scans.filter(s => s.overallScore === 'caution').length})` :
             `🚫 Danger (${scans.filter(s => s.overallScore === 'danger').length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(scan => {
          const colors = scoreColors[scan.overallScore]
          const isOpen = expanded === scan.id

          return (
            <div key={scan.id} className={`bg-white border-2 rounded-2xl overflow-hidden transition-all ${
              isOpen ? colors.bg : 'border-gray-100'
            }`}>
              <button
                onClick={() => setExpanded(isOpen ? null : scan.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">{colors.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{scan.productName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-gray-500">{scan.brand}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(scan.scannedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {scan.chemicals.length > 0 && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {scan.chemicals.length} chemical{scan.chemicals.length !== 1 ? 's' : ''} detected
                    </p>
                  )}
                </div>
                <span className={`${colors.badge} flex-shrink-0`}>{colors.label}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  {/* Ingredients */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ingredients</p>
                    <p className="text-sm text-gray-600">{scan.ingredients.join(', ')}</p>
                  </div>

                  {/* Chemicals Found */}
                  {scan.chemicals.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chemicals Detected</p>
                      <div className="space-y-3">
                        {scan.chemicals.map(chem => (
                          <div key={chem.name} className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-gray-800">{chem.name}</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelColors[chem.level]}`}>
                                {chem.level.toUpperCase()} LEVEL
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{chem.description}</p>
                            <p className="text-sm text-red-600 mb-2"><strong>Health Risk:</strong> {chem.healthRisk}</p>
                            {chem.safeLimit && (
                              <div className="flex gap-4 text-xs">
                                <span className="text-gray-500">Safe limit: <strong className="text-green-600">{chem.safeLimit}</strong></span>
                                {chem.detectedAmount && (
                                  <span className="text-gray-500">Detected: <strong className="text-red-600">{chem.detectedAmount}</strong></span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-green-700 font-semibold">No harmful chemicals detected</p>
                      </div>
                      <p className="text-green-600 text-sm mt-1">This product passed all 2,400+ chemical checks.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
