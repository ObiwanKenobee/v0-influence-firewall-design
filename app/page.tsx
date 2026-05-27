import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Shield, Zap, Brain } from 'lucide-react'

export const metadata = {
  title: 'Influence Firewall - Protect Your Digital Sovereignty',
  description: 'Analyze digital content for manipulation, toxicity, and influence attacks',
}

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold text-white">Influence Firewall</span>
          </div>
          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <a href="/auth/login">Login</a>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/auth/sign-up">Sign Up</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Reclaim Your Digital Sovereignty
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-8 max-w-3xl mx-auto">
            Influence Firewall analyzes digital content to detect manipulation, misinformation, toxicity, and attacks on your values. Empower yourself with cognitive defense.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-base h-12">
              <a href="/auth/sign-up">Get Started Free</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base h-12"
            >
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>

        {/* Features */}
        <section id="features" className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
            <Zap className="w-8 h-8 text-orange-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Toxicity Detection
            </h3>
            <p className="text-slate-400 text-sm">
              Identifies harmful, hateful, and abusive content that attacks your dignity and psychological safety.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
            <Brain className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Manipulation Detection
            </h3>
            <p className="text-slate-400 text-sm">
              Detects dark patterns, emotional manipulation, and persuasion tactics designed to exploit your psychology.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
            <Shield className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Values Alignment
            </h3>
            <p className="text-slate-400 text-sm">
              Measures how content aligns with your personal values and constitutional principles of human dignity.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-12 text-center border border-blue-700">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to Defend Your Mind?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Start analyzing content today. Influence Firewall runs locally and respects your privacy.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
            <a href="/auth/sign-up">Create Your Account</a>
          </Button>
        </div>
      </section>
    </div>
  )
}
