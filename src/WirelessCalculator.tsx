import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, Wifi } from 'lucide-react'

const translations = {
  en: {
    title: 'Wireless Link Calculator',
    subtitle: 'Free-space path loss, Fresnel zone radius and full link budget. Everything client-side.',
    frequency: 'Frequency',
    freqCustom: 'Custom (GHz)',
    distance: 'Distance',
    distUnit: 'Unit',
    txPower: 'TX Power (dBm)',
    txGain: 'TX Antenna Gain (dBi)',
    rxGain: 'RX Antenna Gain (dBi)',
    rxSensitivity: 'RX Sensitivity (dBm)',
    results: 'Results',
    fspl: 'Free-Space Path Loss',
    fresnelRadius: 'Fresnel Zone 1 Radius',
    linkBudget: 'Link Budget',
    rxLevel: 'Expected RX Level',
    margin: 'Link Margin',
    marginOk: 'Link margin is good',
    marginWarn: 'Link margin is thin (< 10 dB)',
    marginFail: 'Link will not close',
    builtBy: 'Built by',
    notes: 'FSPL = 20log10(d) + 20log10(f) + 92.4 (d in km, f in GHz). Fresnel zone: r = 17.3 * sqrt(d/(4*f)) in meters.',
  },
  pt: {
    title: 'Calculadora de Link Wireless',
    subtitle: 'Perda no espaco livre (FSPL), raio da zona de Fresnel e balanco de enlace. Tudo no navegador.',
    frequency: 'Frequencia',
    freqCustom: 'Customizada (GHz)',
    distance: 'Distancia',
    distUnit: 'Unidade',
    txPower: 'Potencia TX (dBm)',
    txGain: 'Ganho Antena TX (dBi)',
    rxGain: 'Ganho Antena RX (dBi)',
    rxSensitivity: 'Sensibilidade RX (dBm)',
    results: 'Resultados',
    fspl: 'Perda no Espaco Livre (FSPL)',
    fresnelRadius: 'Raio Zona de Fresnel 1',
    linkBudget: 'Balanco de Enlace',
    rxLevel: 'Nivel RX Esperado',
    margin: 'Margem do Enlace',
    marginOk: 'Margem do enlace esta boa',
    marginWarn: 'Margem do enlace e pequena (< 10 dB)',
    marginFail: 'Enlace nao fechara',
    builtBy: 'Criado por',
    notes: 'FSPL = 20log10(d) + 20log10(f) + 92.4 (d em km, f em GHz). Zona de Fresnel: r = 17.3 * sqrt(d/(4*f)) em metros.',
  },
} as const

type Lang = keyof typeof translations

const FREQ_PRESETS = [
  { label: '2.4 GHz (WiFi)', value: 2.4 },
  { label: '5 GHz (WiFi)', value: 5 },
  { label: '5.8 GHz (ISM)', value: 5.8 },
  { label: '6 GHz (WiFi 6E)', value: 6 },
  { label: '24 GHz (PtP)', value: 24 },
  { label: '60 GHz (WiGig)', value: 60 },
]

const DIST_UNITS = [
  { label: 'm', toKm: 0.001 },
  { label: 'km', toKm: 1 },
  { label: 'mi', toKm: 1.60934 },
]

function fspl(freqGhz: number, distKm: number) {
  if (distKm <= 0 || freqGhz <= 0) return 0
  return 20 * Math.log10(distKm) + 20 * Math.log10(freqGhz) + 92.4
}

function fresnelRadius(freqGhz: number, distKm: number) {
  if (distKm <= 0 || freqGhz <= 0) return 0
  return 17.3 * Math.sqrt(distKm / (4 * freqGhz))
}

export default function WirelessCalculator() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [freqPreset, setFreqPreset] = useState(0)
  const [freqCustom, setFreqCustom] = useState(2.4)
  const [useCustomFreq, setUseCustomFreq] = useState(false)
  const [dist, setDist] = useState(1)
  const [distUnitIdx, setDistUnitIdx] = useState(1)
  const [txPower, setTxPower] = useState(20)
  const [txGain, setTxGain] = useState(9)
  const [rxGain, setRxGain] = useState(9)
  const [rxSens, setRxSens] = useState(-80)

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const freqGhz = useCustomFreq ? freqCustom : FREQ_PRESETS[freqPreset].value
  const distKm = dist * DIST_UNITS[distUnitIdx].toKm
  const loss = fspl(freqGhz, distKm)
  const fresnel = fresnelRadius(freqGhz, distKm)
  const rxLevel = txPower + txGain - loss + rxGain
  const margin = rxLevel - rxSens

  const marginColor = margin >= 20 ? 'text-cyan-500' : margin >= 10 ? 'text-amber-500' : 'text-red-500'
  const marginMsg = margin >= 20 ? t.marginOk : margin >= 10 ? t.marginWarn : t.marginFail

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Wifi size={18} className="text-white" />
            </div>
            <span className="font-semibold">Wireless Calculator</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/wireless-calculator" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Inputs */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
              {/* Frequency */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.frequency}</label>
                <div className="flex gap-1.5 flex-wrap">
                  {FREQ_PRESETS.map((f, i) => (
                    <button key={i} onClick={() => { setFreqPreset(i); setUseCustomFreq(false) }}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${!useCustomFreq && freqPreset === i ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="customFreq" checked={useCustomFreq} onChange={e => setUseCustomFreq(e.target.checked)} className="accent-cyan-500" />
                  <label htmlFor="customFreq" className="text-sm">{t.freqCustom}</label>
                  {useCustomFreq && (
                    <input type="number" step="0.1" min={0.1} value={freqCustom} onChange={e => setFreqCustom(Number(e.target.value))}
                      className="ml-2 w-24 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  )}
                </div>
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.distance}</label>
                <div className="flex gap-2">
                  <input type="number" step="0.1" min={0.001} value={dist} onChange={e => setDist(Number(e.target.value))}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  <select value={distUnitIdx} onChange={e => setDistUnitIdx(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    {DIST_UNITS.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
                  </select>
                </div>
              </div>

              {/* TX Power */}
              {[
                { label: t.txPower, value: txPower, set: setTxPower, min: -30, max: 40 },
                { label: t.txGain, value: txGain, set: setTxGain, min: 0, max: 45 },
                { label: t.rxGain, value: rxGain, set: setRxGain, min: 0, max: 45 },
                { label: t.rxSensitivity, value: rxSens, set: setRxSens, min: -120, max: -20 },
              ].map(({ label, value, set, min, max }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">{label}</label>
                    <span className="text-sm font-bold text-cyan-500 tabular-nums">{value} dB{label.includes('Power') ? 'm' : label.includes('Sens') ? 'm' : 'i'}</span>
                  </div>
                  <input type="range" min={min} max={max} value={value} onChange={e => set(Number(e.target.value))} className="w-full h-1.5 cursor-pointer accent-cyan-500" />
                  <div className="flex justify-between text-[10px] text-zinc-400 px-0.5"><span>{min}</span><span>{max}</span></div>
                </div>
              ))}
            </div>

            {/* Results */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
              <h2 className="font-semibold">{t.results}</h2>

              <div className="grid gap-3">
                {[
                  { label: t.fspl, value: `${loss.toFixed(1)} dB`, color: 'text-red-500' },
                  { label: t.fresnelRadius, value: `${fresnel.toFixed(1)} m`, color: 'text-amber-500' },
                  { label: t.rxLevel, value: `${rxLevel.toFixed(1)} dBm`, color: 'text-zinc-700 dark:text-zinc-200' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
                    <span className={`font-mono font-semibold ${color}`}>{value}</span>
                  </div>
                ))}

                <div className="rounded-xl border-2 border-cyan-500/30 bg-cyan-50 dark:bg-cyan-900/10 p-5 text-center">
                  <p className="text-xs uppercase tracking-wide text-zinc-400 mb-1">{t.margin}</p>
                  <p className={`text-5xl font-bold tabular-nums ${marginColor}`}>{margin.toFixed(1)}</p>
                  <p className="text-xs text-zinc-400 mt-1">dB</p>
                </div>

                <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${margin >= 20 ? 'border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300' : margin >= 10 ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                  {marginMsg}
                </div>
              </div>

              {/* Link budget breakdown */}
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between"><span className="text-zinc-400">TX Power</span><span>+{txPower} dBm</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">TX Gain</span><span>+{txGain} dBi</span></div>
                <div className="flex justify-between text-red-500"><span>FSPL</span><span>-{loss.toFixed(1)} dB</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">RX Gain</span><span>+{rxGain} dBi</span></div>
                <div className="border-t border-zinc-200 dark:border-zinc-700 pt-1.5 flex justify-between font-semibold"><span>RX Level</span><span>{rxLevel.toFixed(1)} dBm</span></div>
                <div className="flex justify-between text-zinc-400"><span>RX Sensitivity</span><span>{rxSens} dBm</span></div>
                <div className={`flex justify-between font-bold ${marginColor}`}><span>Margin</span><span>{margin.toFixed(1)} dB</span></div>
              </div>

              <p className="text-[10px] text-zinc-400">{t.notes}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-cyan-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
