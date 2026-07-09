
/**
 * Influence Firewall - Content Script
 * Runs on every page to detect and highlight influence attacks
 */

const STORAGE_KEY = 'influenceFirewall'

// Initialize content script
console.log('[Influence Firewall] Content script loaded')

// Listen for messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeSelection') {
    analyzeSelection(request.text)
    sendResponse({ success: true })
  }

  if (request.action === 'extractPageContent') {
    const pageContent = extractPageContent()
    chrome.runtime.sendMessage({
      action: 'analyze',
      content: pageContent,
      type: 'text',
    })
  }
})

// Extract page content
function extractPageContent() {
  const body = document.body
  const text = body.innerText || body.textContent
  return text.substring(0, 5000) // Limit to first 5000 chars
}

// Analyze selected text
function analyzeSelection(text) {
  chrome.runtime.sendMessage(
    { action: 'analyze', content: text, type: 'text' },
    (response) => {
      if (response.success) {
        showAnalysisPopup(response.data)
      }
    }
  )
}

// Show analysis results
function showAnalysisPopup(data) {
  const popup = createPopupElement(data)
  document.body.appendChild(popup)

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    popup.remove()
  }, 5000)
}

// Create popup element
function createPopupElement(data) {
  const div = document.createElement('div')
  div.id = 'influence-firewall-popup'
  div.className = 'influence-firewall-popup'
  
  const riskLevel = getRiskLevel(data.scores.overallRisk)
  const riskColor = getRiskColor(riskLevel)

  div.innerHTML = `
    <div class="firewall-popup-content" style="border-color: ${riskColor}">
      <div class="firewall-popup-header">
        <strong>Influence Firewall Analysis</strong>
        <button class="firewall-close-btn">&times;</button>
      </div>
      <div class="firewall-popup-body">
        <div class="firewall-risk-level" style="color: ${riskColor}">
          Risk Level: <strong>${riskLevel}</strong>
        </div>
        <div class="firewall-scores">
          <div class="score-item">
            <span>Toxicity:</span>
            <div class="score-bar" style="width: ${data.scores.toxicity}%"></div>
            <span>${data.scores.toxicity}/100</span>
          </div>
          <div class="score-item">
            <span>Misinformation:</span>
            <div class="score-bar" style="width: ${data.scores.misinformation}%"></div>
            <span>${data.scores.misinformation}/100</span>
          </div>
          <div class="score-item">
            <span>Manipulation:</span>
            <div class="score-bar" style="width: ${data.scores.manipulation}%"></div>
            <span>${data.scores.manipulation}/100</span>
          </div>
          <div class="score-item">
            <span>Values Alignment:</span>
            <div class="score-bar" style="width: ${100 - data.scores.valuesAlignment}%"></div>
            <span>${data.scores.valuesAlignment}/100</span>
          </div>
        </div>
      </div>
    </div>
  `

  const closeBtn = div.querySelector('.firewall-close-btn')
  closeBtn.addEventListener('click', () => div.remove())

  return div
}

// Get risk level
function getRiskLevel(score) {
  if (score >= 75) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 25) return 'MEDIUM'
  return 'LOW'
}

// Get risk color
function getRiskColor(level) {
  const colors = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
  }
  return colors[level] || '#999'
}

// Highlight threats on page if enabled
function highlightThreats() {
  chrome.storage.local.get(['userPreferences'], (data) => {
    if (data.userPreferences?.highlightThreats) {
      // Find potentially harmful content and highlight it
      const elements = document.querySelectorAll(
        'p, div, span, article, [role="article"], [role="main"]'
      )

      elements.forEach((el) => {
        const text = el.innerText || el.textContent
        if (text && text.length > 50 && text.length < 5000) {
          // Batch these for analysis
          // In production, implement debouncing and batching
        }
      })
    }
  })
}

// Initialize on page load
window.addEventListener('load', () => {
  highlightThreats()
})
