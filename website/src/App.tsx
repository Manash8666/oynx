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

// Dedicated In-App Pages
import { WhatIsOnyx } from './pages/WhatIsOnyx'
import { Compliance } from './pages/Compliance'
import { Eula } from './pages/Eula'
import { License } from './pages/License'
import { RetinaReady } from './pages/RetinaReady'
import { Docs } from './pages/Docs'
import { CodeReviewer } from './pages/CodeReviewer'
import { SecurityAgent } from './pages/SecurityAgent'
import { Leaderboard } from './pages/Leaderboard'
import { VpcDeployment } from './pages/VpcDeployment'
import { PricingPage } from './pages/PricingPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { SettingsPage } from './pages/SettingsPage'

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/'
  )

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase()
      setCurrentPath(path)
      
      // If returning to home with a hash, scroll to target element
      if (window.location.hash) {
        const id = window.location.hash.replace('#', '')
        setTimeout(() => {
          const el = document.getElementById(id)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
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

  // Render the corresponding inner page or fallback to home
  const renderContent = () => {
    if (currentPath.startsWith('/what-is-onyx')) return <WhatIsOnyx />
    if (currentPath.startsWith('/compliance')) return <Compliance />
    if (currentPath.startsWith('/eula')) return <Eula />
    if (currentPath.startsWith('/license')) return <License />
    if (currentPath.startsWith('/retina-ready')) return <RetinaReady />
    if (currentPath.startsWith('/docs')) return <Docs />
    if (currentPath.startsWith('/code-reviewer')) return <CodeReviewer />
    if (currentPath.startsWith('/security-agent')) return <SecurityAgent />
    if (currentPath.startsWith('/leaderboard')) return <Leaderboard />
    if (currentPath.startsWith('/vpc')) return <VpcDeployment />
    if (currentPath.startsWith('/pricing')) return <PricingPage />
    if (currentPath.startsWith('/login')) return <LoginPage />
    if (currentPath.startsWith('/dashboard')) return <DashboardPage />
    if (currentPath.startsWith('/settings')) return <SettingsPage />

    // Default: Main High-Converting Landing Flow
    return (
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
    )
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a]">
      {/* Sticky Header Navigation */}
      <Navbar />

      {/* Main Page Content */}
      {renderContent()}

      {/* Global Compliance & Navigation Footer */}
      <Footer />
    </div>
  )
}

export default App
