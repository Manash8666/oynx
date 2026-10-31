import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { FreeModels } from './components/FreeModels'
import { BYOAISection } from './components/BYOAISection'
import { Metrics } from './components/Metrics'
import { Marquee } from './components/Marquee'
import { Pillars } from './components/Pillars'
import { ParallaxBanner } from './components/ParallaxBanner'
import { WorkflowLoop } from './components/WorkflowLoop'
import { Battlecard } from './components/Battlecard'
import { LiveStudio } from './components/LiveStudio'
import { Pricing } from './components/Pricing'
import { FAQ } from './components/FAQ'
import { EnterpriseContact } from './components/EnterpriseContact'
import { Footer } from './components/Footer'
import { WhatIsOnyx } from './pages/WhatIsOnyx'

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  )

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  const scrollToContact = () => {
    const el = document.getElementById('contact')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const isWhatIsOnyx = currentPath.toLowerCase().startsWith('/what-is-onyx')

  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a]">
      {/* Sticky Frosted Header with Navigation */}
      <Navbar />

      {/* Conditional View: Dedicated What is Onyx Pitch Page vs Main Landing */}
      {isWhatIsOnyx ? (
        <main>
          <WhatIsOnyx />
        </main>
      ) : (
        <main>
          <Hero />
          <FreeModels />
          <BYOAISection />
          <Metrics />
          <Marquee />
          <Pillars />
          <ParallaxBanner />
          <WorkflowLoop />
          <Battlecard />
          <LiveStudio />
          <Pricing onContactClick={scrollToContact} />
          <FAQ />
          <EnterpriseContact />
        </main>
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
