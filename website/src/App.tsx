import React, { useState } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Metrics } from './components/Metrics'
import { Marquee } from './components/Marquee'
import { Pillars } from './components/Pillars'
import { ParallaxBanner } from './components/ParallaxBanner'
import { ParallaxShowcase } from './components/ParallaxShowcase'
import { WorkflowLoop } from './components/WorkflowLoop'
import { Battlecard } from './components/Battlecard'
import { LiveStudio } from './components/LiveStudio'
import { Pricing } from './components/Pricing'
import { EnterpriseContact } from './components/EnterpriseContact'
import { Footer } from './components/Footer'

export const App: React.FC = () => {
  const [isParallaxMode, setIsParallaxMode] = useState(false)

  const scrollToContact = () => {
    const el = document.getElementById('contact')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a]">
      {/* If Parallax Mode is active, render the full-screen kinetic slider */}
      {isParallaxMode ? (
        <ParallaxShowcase onClose={() => setIsParallaxMode(false)} />
      ) : (
        <>
          <Navbar
            isParallaxMode={false}
            onToggleParallax={() => setIsParallaxMode(true)}
          />

          <main>
            <Hero onToggleParallax={() => setIsParallaxMode(true)} />
            <Metrics />
            <Marquee />
            <Pillars />
            <ParallaxBanner onLaunchParallax={() => setIsParallaxMode(true)} />
            <WorkflowLoop />
            <Battlecard />
            <LiveStudio />
            <Pricing onContactClick={scrollToContact} />
            <EnterpriseContact />
          </main>

          <Footer />
        </>
      )}
    </div>
  )
}

export default App
