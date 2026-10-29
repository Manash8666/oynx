import React, { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'

export const EnterpriseContact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '10 - 50 developers',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="contact" className="py-24 px-4 bg-anthracite-base border-t border-white/[0.08]">
      <div className="max-w-4xl mx-auto bg-anthracite-charcoal p-8 md:p-12 rounded-3xl border border-white/[0.08] shadow-anthracite-card">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[#d8ff38] font-mono-code text-xs uppercase tracking-widest mb-2 block">
            Direct Founder &amp; Sales Access
          </span>
          <h3 className="font-syne text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
            Deploy Onyx Across Your Engineering Org.
          </h3>
          <p className="text-zinc-400 text-xs md:text-sm">
            Request an enterprise trial, on-premise deployment architecture consultation, or custom commercial EULA licensing quote directly from{' '}
            <strong className="text-white">Manash Dash</strong>.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-anthracite-surface border border-[#22c55e]/40 text-center font-mono-code text-xs text-zinc-300 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#22c55e] mx-auto" />
            <h4 className="font-syne text-xl font-bold text-white">Thank You for Your Enterprise Inquiry!</h4>
            <p className="text-zinc-300 max-w-lg mx-auto">
              Your request has been logged. Founder <strong className="text-white">Manash Dash</strong> will review your deployment constraints and reach out within 24 hours with a custom commercial EULA proposal.
            </p>
            <p className="text-[#d8ff38] text-[11px] pt-2 border-t border-white/[0.06]">
              Guaranteed: 100% Customer Intellectual Property Ownership. Zero data telemetry.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-mono-code">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-zinc-400 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Vance"
                  className="w-full bg-anthracite-surface border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volt/50"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-2">Work Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@company.com"
                  className="w-full bg-anthracite-surface border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volt/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-zinc-400 mb-2">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Stripe, Palantir, Vercel"
                  className="w-full bg-anthracite-surface border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volt/50"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-2">Engineering Team Size</label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  className="w-full bg-anthracite-surface border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volt/50"
                >
                  <option>1 - 10 developers</option>
                  <option>10 - 50 developers</option>
                  <option>50 - 250 developers</option>
                  <option>250+ enterprise seats</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-2">Project Requirements &amp; Deployment Model</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your tech stack, privacy constraints (e.g. on-premises vs air-gapped VPC), and SLA needs..."
                className="w-full bg-anthracite-surface border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volt/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl btn-volt text-sm font-bold flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-[#07080a]" />
              <span>Request Enterprise EULA &amp; Architecture Consultation &rarr;</span>
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
