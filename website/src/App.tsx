import React from 'react'
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

export const App: React.FC = () => {
  const scrollToContact = () => {
    const el = document.getElementById('contact')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a]">
      {/* Sticky Frosted Header with Segregated Mega-Menus (Product & Models) */}
      <Navbar />

      {/* Main Continuous Single-Page Flow */}
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

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
