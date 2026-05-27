import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingClient } from '@/components/onboarding-client'

export const metadata = {
  title: 'Onboarding - Influence Firewall',
  description: 'Set up your personal values and preferences',
}

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth/login')
  }

  return <OnboardingClient user={user} />
}
