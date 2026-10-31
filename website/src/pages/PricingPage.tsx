import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Pricing } from '../components/Pricing'

export const PricingPage: React.FC = () => {
  const scrollToContact = () => {
    window.location.href = '/#contact'
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <div className="mb-6">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </a>
        </div>

        <Pricing onContactClick={scrollToContact} />
      </div>
    </div>
  )
}
