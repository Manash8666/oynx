import React, { useEffect, useState, useRef } from 'react'

interface CounterItem {
  value: number
  prefix?: string
  suffix?: string
  label: string
  sublabel?: string
}

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
    <section ref={containerRef} className="py-14 border-y border-white/5 bg-onyx-900/50">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        
        {/* Metric 1 */}
        <div className="flex flex-col items-center">
          <span className="font-syne text-4xl md:text-5xl font-extrabold text-white mb-1.5 flex items-center">
            {counter1}
            <span className="text-purple-400 text-3xl font-mono-code ml-1">tok/s</span>
          </span>
          <span className="text-xs text-zinc-400 font-mono-code uppercase tracking-wider">
            Local Inference Speed
          </span>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col items-center">
          <span className="font-syne text-4xl md:text-5xl font-extrabold text-white mb-1.5 flex items-center">
            {counter2}
            <span className="text-emerald-400 text-3xl font-mono-code ml-1">%</span>
          </span>
          <span className="text-xs text-zinc-400 font-mono-code uppercase tracking-wider">
            Data Egress / Telemetry
          </span>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col items-center">
          <span className="font-syne text-4xl md:text-5xl font-extrabold text-white mb-1.5 flex items-center">
            {counter3}
            <span className="text-zinc-400 text-3xl font-mono-code">/35</span>
          </span>
          <span className="text-xs text-zinc-400 font-mono-code uppercase tracking-wider">
            Engine Test Suites Passed
          </span>
        </div>

        {/* Metric 4 */}
        <div className="flex flex-col items-center">
          <span className="font-syne text-4xl md:text-5xl font-extrabold text-white mb-1.5 flex items-center">
            ${counter4}
            <span className="text-purple-400 text-3xl font-mono-code ml-1">.00</span>
          </span>
          <span className="text-xs text-zinc-400 font-mono-code uppercase tracking-wider">
            Marginal Token Cost
          </span>
        </div>

      </div>
    </section>
  )
}
