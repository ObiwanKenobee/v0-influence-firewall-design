'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Loader2, Zap } from 'lucide-react'

interface ContentInputProps {
  onAnalyze: (content: string, contentType: string, sourceUrl?: string) => void
  isAnalyzing: boolean
}

export default function ContentInput({
  onAnalyze,
  isAnalyzing,
}: ContentInputProps) {
  const [inputType, setInputType] = useState<'text' | 'url' | 'document'>(
    'text'
  )
  const [content, setContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')

  const handleAnalyze = () => {
    if (!content.trim()) {
      alert('Please enter content to analyze')
      return
    }

    onAnalyze(content, inputType, sourceUrl || undefined)
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Analyze Content
        </h2>

        {/* Input Type Selection */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={() => {
              setInputType('text')
              setSourceUrl('')
            }}
            className={`p-3 rounded-lg text-sm font-medium transition-colors ${
              inputType === 'text'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setInputType('url')}
            className={`p-3 rounded-lg text-sm font-medium transition-colors ${
              inputType === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            URL
          </button>
          <button
            onClick={() => setInputType('document')}
            className={`p-3 rounded-lg text-sm font-medium transition-colors ${
              inputType === 'document'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Document
          </button>
        </div>

        {/* Input Field */}
        {inputType === 'text' && (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste text content here to analyze for toxicity, misinformation, manipulation, and values alignment..."
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 min-h-64 resize-none"
          />
        )}

        {inputType === 'url' && (
          <div className="space-y-3">
            <Input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="Enter URL (e.g., https://twitter.com/...)"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the content from the URL here, or describe what you want us to analyze..."
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 min-h-48 resize-none"
            />
            <p className="text-xs text-slate-400">
              Note: In the MVP, paste the content you want analyzed. Full web scraping will be added in future versions.
            </p>
          </div>
        )}

        {inputType === 'document' && (
          <div className="space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste document content (PDF text, article text, etc.) here..."
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 min-h-64 resize-none"
            />
            <p className="text-xs text-slate-400">
              Copy and paste text from your documents. Future versions will support direct file uploads.
            </p>
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !content.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Analyze Now
          </>
        )}
      </Button>
    </Card>
  )
}
