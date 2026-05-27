'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const SUGGESTED_VALUES = [
  'Truth and Honesty',
  'Personal Autonomy',
  'Human Dignity',
  'Privacy and Security',
  'Compassion and Empathy',
  'Fairness and Justice',
  'Freedom of Expression',
  'Community and Belonging',
  'Health and Wellbeing',
  'Learning and Growth',
  'Environmental Stewardship',
  'Diversity and Inclusion',
]

export function OnboardingClient({ user }: { user: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [customValue, setCustomValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAddValue = () => {
    if (customValue.trim() && !selectedValues.includes(customValue.trim())) {
      setSelectedValues([...selectedValues, customValue.trim()])
      setCustomValue('')
    }
  }

  const handleRemoveValue = (value: string) => {
    setSelectedValues(selectedValues.filter((v) => v !== value))
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName || user.email,
          personal_values: selectedValues,
        })
        .eq('id', user.id)

      if (error) {
        alert('Error saving profile')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      alert('Error saving profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              1
            </div>
            <div className="flex-1 h-1 bg-slate-700" />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              2
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            {step === 1 ? 'Profile Information' : 'Set Your Personal Values'}
          </p>
        </div>

        {/* Step 1: Profile */}
        {step === 1 && (
          <Card className="bg-slate-800 border-slate-700 p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to Influence Firewall</h1>
            <p className="text-slate-400 mb-8">
              Let&apos;s set up your account and configure your cognitive defense system.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-slate-900 rounded p-4 border border-slate-700">
                <p className="text-sm text-slate-300">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Your email is verified and cannot be changed
                </p>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue to Values Setup
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Values */}
        {step === 2 && (
          <Card className="bg-slate-800 border-slate-700 p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Your Personal Values</h1>
            <p className="text-slate-400 mb-8">
              Select or add the values that matter most to you. These will help personalize your
              influence analysis.
            </p>

            <div className="space-y-6">
              {/* Suggested Values */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  SUGGESTED VALUES
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => {
                        if (selectedValues.includes(value)) {
                          handleRemoveValue(value)
                        } else {
                          setSelectedValues([...selectedValues, value])
                        }
                      }}
                      className={`p-3 rounded border transition-colors ${
                        selectedValues.includes(value)
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Value */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">ADD CUSTOM VALUE</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddValue()
                      }
                    }}
                    placeholder="Enter a custom value"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <Button
                    onClick={handleAddValue}
                    className="bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Selected Values Summary */}
              {selectedValues.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">
                    YOUR VALUES ({selectedValues.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedValues.map((value) => (
                      <div
                        key={value}
                        className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2"
                      >
                        {value}
                        <button
                          onClick={() => handleRemoveValue(value)}
                          className="hover:opacity-75 ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading || selectedValues.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
