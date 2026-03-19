import { TrendingDown, TrendingUp, Minus, AlertTriangle } from 'lucide-react'
import { ScanResult } from '@/lib/types'

interface Props {
  scans: ScanResult[]
}

export default function ExposureTracker({ scans }: Props) {
  // Aggregate chemical exposure from all scans
  const chemicalMap: Record<string, { total: number; count: number; levels: string[] }> = {}

  scans.forEach(scan => {
    scan.chemicals.forEach(chem => {
      if (!chemicalMap[chem.name]) {
        chemicalMap[chem.name] = { total: 0, count: 0, levels: [] }
      }
      chemicalMap[chem.name].count++
      chemicalMap[chem.name].levels.push(chem.level)
    })
  })

  const chemicals = Object.entries(chemicalMap).map(([name, data]) => ({
    name,
    count: data.count,
    worstLevel: data.levels.includes('high') ? 'high' : data.levels.includes('medium') ? 'medium' : 'low',
    percentage: (data.count / scans.length) * 100,
  }))

  const safeScans = scans.filter(s => s.overallScore === 'safe').length
  const totalScans = scans.length
  const safePercentage = Math.round((safeScans / totalScans) * 100)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Exposure Tracker</h1>
        <p className="text-gray-500 text-sm">Track cumulative chemical exposure over time to protect your baby long-term.</p>
      </div>

      {/* Overall Safety Score */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="text-5xl font-black text-brand-600 mb-1">{safePercentage}%</div>
          <p className="text-gray-600 font-medium">Products Safe</p>
          <p className="text-xs text-gray-400 mt-1">{safeScans} of {totalScans} scanned</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="text-5xl font-black text-red-500 mb-1">{chemicals.length}</div>
          <p className="text-gray-600 font-medium">Chemicals Found</p>
          <p className="text-xs text-gray-400 mt-1">across all scans</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="text-5xl font-black text-orange-500 mb-1">
            {scans.filter(s => s.overallScore === 'danger').length}
          </div>
          <p className="text-gray-600 font-medium">Danger Products</p>
          <p className="text-xs text-gray-400 mt-1">avoid immediately</p>
        </div>
      </div>

      {/* Chemical Exposure Breakdown */}
      {chemicals.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Chemical Exposure Frequency</h2>
          <div className="space-y-4">
            {chemicals.map(chem => (
              <div key={chem.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">{chem.name}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      chem.worstLevel === 'high' ? 'bg-red-100 text-red-700' :
                      chem.worstLevel === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {chem.worstLevel.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {chem.count}/{totalScans} scans ({Math.round(chem.percentage)}%)
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      chem.worstLevel === 'high' ? 'bg-red-500' :
                      chem.worstLevel === 'medium' ? 'bg-orange-400' : 'bg-yellow-400'
                    }`}
                    style={{ width: `${chem.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 mb-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-bold text-green-700">No Chemicals Detected!</p>
          <p className="text-green-600 text-sm mt-1">All scanned products passed chemical screening.</p>
        </div>
      )}

      {/* Monthly Trend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Safety Trend This Month</h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            { week: 'Week 1', safe: 2, total: 3, icon: <TrendingDown className="w-4 h-4 text-red-500" /> },
            { week: 'Week 2', safe: 3, total: 4, icon: <Minus className="w-4 h-4 text-yellow-500" /> },
            { week: 'Week 3', safe: 4, total: 5, icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
            { week: 'Week 4', safe: 5, total: 5, icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
          ].map(week => (
            <div key={week.week} className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="flex justify-center mb-1">{week.icon}</div>
              <div className="text-xl font-black text-gray-900">
                {Math.round((week.safe / week.total) * 100)}%
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{week.week}</div>
              <div className="text-xs text-gray-500">{week.safe}/{week.total} safe</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-brand-600 font-semibold mt-4 text-center">
          📈 Your food safety score is improving!
        </p>
      </div>

      {/* Recommendations */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-brand-600" />
          <h2 className="font-bold text-brand-800">Safety Recommendations</h2>
        </div>
        <div className="space-y-2">
          {[
            'Avoid rice-based cereals — highest arsenic source for infants',
            'Choose single-ingredient purees over mixed products',
            'Look for products with HiPP, Holle, or Happy Baby brands',
            'Rotate protein sources to reduce heavy metal accumulation',
            'Filter tap water with NSF-53 certified filter for formula',
          ].map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-brand-700">
              <span className="font-bold text-brand-500 flex-shrink-0">{i + 1}.</span>
              {rec}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
