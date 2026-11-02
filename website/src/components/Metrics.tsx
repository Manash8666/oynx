import React, { useEffect, useState, useRef } from 'react'

export const Metrics: React.FC = () => {
  const [hasAnimated, setHasAnimated] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [counter1, setCounter1] = useState(0)
  const [counter2, setCounter2] = useState(0)
  const [counter3, setCounter3] = useState(0)
  const [counter4, setCounter4] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          animateValue(setCounter1, 153, 1600)
          animateValue(setCounter2, 0, 1000)
          animateValue(setCounter3, 35, 1800)
          animateValue(setCounter4, 0, 1000)
        }
      },
      { threshold: 0.2 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  const animateValue = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    end: number,
    duration: number
  ) => {
    if (end === 0) {
      setter(0)
      return
    }
    const startTime = performance.now()
    const step = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      setter(Math.floor(easeProgress * end))
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setter(end)
      }
    }
    requestAnimationFrame(step)
  }

  return (
    <section ref={containerRef} className="py-14 border-y border-white/[0.08] bg-anthracite-charcoal">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        
        {/* Metric 1 */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-4xl md:text-5xl font-bold stat-number text-white mb-1.5 flex items-center">
            {counter1}
            <span className="text-[#d8ff38] text-2xl font-mono ml-1">tok/s</span>
          </span>
          <span className="text-xs text-zinc-400 font-sans font-medium uppercase tracking-micro">
            Local Inference Speed
          </span>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-4xl md:text-5xl font-bold stat-number text-white mb-1.5 flex items-center">
            {counter2}
            <span className="text-[#22c55e] text-2xl font-mono ml-1">%</span>
          </span>
          <span className="text-xs text-zinc-400 font-sans font-medium uppercase tracking-micro">
            Data Egress / Telemetry
          </span>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-4xl md:text-5xl font-bold stat-number text-white mb-1.5 flex items-center">
            {counter3}
            <span className="text-zinc-500 text-2xl font-mono">/35</span>
          </span>
          <span className="text-xs text-zinc-400 font-sans font-medium uppercase tracking-micro">
            Engine Test Suites Passed
          </span>
        </div>

        {/* Metric 4 */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-4xl md:text-5xl font-bold stat-number text-white mb-1.5 flex items-center">
            ${counter4}
            <span className="text-[#d8ff38] text-2xl font-mono ml-1">.00</span>
          </span>
          <span className="text-xs text-zinc-400 font-sans font-medium uppercase tracking-micro">
            Marginal Token Cost
          </span>
        </div>

      </div>

      {/* Retina Ready & High-DPI Display Calibration Strip */}
      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse shrink-0" />
          <span className="text-zinc-300 font-semibold shrink-0">RETINA READY:</span>
          <span className="text-[11px] sm:text-xs text-zinc-400">Apple Retina 2x • 4K UHD • 5K/6K Pro Display XDR Subpixel Antialiased</span>
        </div>
        <a
          href="https://github.com/Manash8666/oynx/blob/main/RETINA-READY.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4ade80] hover:underline flex items-center gap-1 font-sans font-medium text-[11px]"
        >
          <span>View Compliance Specification</span>
          <span>→</span>
        </a>
      </div>
    </section>
  )
}
