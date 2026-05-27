'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { LogOut, Save } from 'lucide-react'

interface SettingsClientProps {
  user: any
  profile: any
}

export function SettingsClient({ user, profile }: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [personalValues, setPersonalValues] = useState(
    profile?.personal_values?.join(', ') || ''
  )
  const [sensitivityLevel, setSensitivityLevel] = useState('medium')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const valuesArray = personalValues
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0)

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          personal_values: valuesArray,
        })
        .eq('id', user.id)

      if (error) {
        setSaveMessage('Error saving profile')
      } else {
        setSaveMessage('Profile saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      setSaveMessage('Error saving profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          Profile Information
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="bg-slate-900 border border-slate-700 rounded px-3 py-2">
              <p className="text-white">{user.email}</p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Personal Values
            </label>
            <textarea
              value={personalValues}
              onChange={(e) => setPersonalValues(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-24"
              placeholder="Enter your core values separated by commas (e.g., honesty, autonomy, wellbeing)"
            />
            <p className="text-xs text-slate-500 mt-1">
              These values help personalize your influence analysis
            </p>
          </div>

          <div>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            {saveMessage && (
              <p
                className={`mt-2 text-sm ${
                  saveMessage.includes('success')
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {saveMessage}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Defense Preferences */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          Defense Preferences
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Sensitivity Level
            </label>
            <div className="space-y-2">
              {[
                {
                  value: 'low',
                  label: 'Low',
                  description: 'Only flag severe issues',
                },
                {
                  value: 'medium',
                  label: 'Medium (Recommended)',
                  description: 'Balanced approach',
                },
                {
                  value: 'high',
                  label: 'High',
                  description: 'Flag potential issues aggressively',
                },
              ].map((level) => (
                <label
                  key={level.value}
                  className="flex items-center p-3 border border-slate-700 rounded hover:border-slate-600 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="sensitivity"
                    value={level.value}
                    checked={sensitivityLevel === level.value}
                    onChange={(e) => setSensitivityLevel(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {level.label}
                    </p>
                    <p className="text-xs text-slate-400">{level.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">
              Active Defense Layers
            </h3>
            <div className="space-y-2">
              {[
                {
                  name: 'Toxicity Detection',
                  description: 'Detect harmful and abusive content',
                  enabled: true,
                },
                {
                  name: 'Misinformation Detection',
                  description: 'Identify false or misleading claims',
                  enabled: true,
                },
                {
                  name: 'Manipulation Patterns',
                  description: 'Detect emotional manipulation tactics',
                  enabled: true,
                },
                {
                  name: 'Values Alignment',
                  description: 'Measure alignment with personal values',
                  enabled: true,
                },
              ].map((layer) => (
                <label
                  key={layer.name}
                  className="flex items-center p-3 border border-slate-700 rounded hover:border-slate-600 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={layer.enabled}
                    disabled
                    className="w-4 h-4"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-white">
                      {layer.name}
                    </p>
                    <p className="text-xs text-slate-400">{layer.description}</p>
                  </div>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                    Active
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Data & Privacy */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Data & Privacy</h2>

        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Your analysis history is stored securely in your Supabase account and is
            only accessible by you. All data is protected by Row Level Security policies.
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded p-4">
            <p className="text-sm text-slate-300 mb-3">
              Account Statistics
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Member Since</p>
                <p className="text-white font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Account Status</p>
                <p className="text-green-400 font-medium">Active</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-900 bg-opacity-20 border-red-700 p-6">
        <h2 className="text-xl font-semibold text-red-400 mb-6">Danger Zone</h2>

        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            These actions cannot be undone. Please proceed with caution.
          </p>

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  )
}
