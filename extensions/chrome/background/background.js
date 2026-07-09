
/**
 * Influence Firewall - Chrome Extension Background Service Worker
 * Handles background tasks, messaging, and state management
 */

const API_BASE = 'https://api.influence-firewall.com'

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Influence Firewall] Extension installed')
  chrome.storage.local.set({
    installDate: new Date().toISOString(),
    version: '1.0.0',
    apiKey: null,
    userPreferences: {
      autoAnalyze: true,
      highlightThreats: true,
      showNotifications: true,
      detectionLayers: {
        toxicity: true,
        misinformation: true,
        manipulation: true,
        valuesAlignment: true,
      },
    },
  })
})

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze') {
    analyzeContent(request.content, request.type).then((result) => {
      sendResponse({ success: true, data: result })
    })
    return true
  }

  if (request.action === 'getStatus') {
    chrome.storage.local.get(['apiKey', 'userPreferences'], (data) => {
      sendResponse({
        isAuthenticated: !!data.apiKey,
        preferences: data.userPreferences,
      })
    })
    return true
  }

  if (request.action === 'updatePreferences') {
    chrome.storage.local.set({ userPreferences: request.preferences }, () => {
      sendResponse({ success: true })
    })
    return true
  }

  if (request.action === 'authenticate') {
    chrome.storage.local.set({ apiKey: request.apiKey }, () => {
      sendResponse({ success: true })
    })
    return true
  }
})

// Analyze content via API
async function analyzeContent(content, contentType) {
  const apiKey = await getStorageValue('apiKey')

  try {
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        content,
        contentType: contentType || 'text',
      }),
    })

    if (!response.ok) throw new Error('API error')

    const result = await response.json()
    
    // Store analysis for history
    await storeAnalysis({
      content,
      contentType,
      result,
      timestamp: new Date().toISOString(),
    })

    return result.data
  } catch (error) {
    console.error('[Influence Firewall] Analysis error:', error)
    throw error
  }
}

// Store analysis in local history
async function storeAnalysis(analysis) {
  const history = await getStorageValue('analysisHistory') || []
  history.unshift(analysis)
  // Keep last 100 analyses
  if (history.length > 100) history.pop()
  chrome.storage.local.set({ analysisHistory: history })
}

// Utility: Get storage value
function getStorageValue(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (data) => {
      resolve(data[key])
    })
  })
}

// Handle web navigation
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    // Main frame completed loading
    chrome.storage.local.get(['userPreferences'], (data) => {
      if (data.userPreferences?.autoAnalyze) {
        // Auto-analyze page content if enabled
        chrome.tabs.sendMessage(details.tabId, {
          action: 'extractPageContent',
        })
      }
    })
  }
})

// Context menu for quick analysis
chrome.contextMenus.create({
  id: 'analyzeSelection',
  title: 'Analyze with Influence Firewall',
  contexts: ['selection'],
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeSelection') {
    const selectedText = info.selectionText
    chrome.tabs.sendMessage(tab.id, {
      action: 'analyzeSelection',
      text: selectedText,
    })
  }
})

// Periodic threat intelligence update
chrome.alarms.create('updateThreatIntelligence', { periodInMinutes: 60 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateThreatIntelligence') {
    updateThreatPatterns()
  }
})

async function updateThreatPatterns() {
  const apiKey = await getStorageValue('apiKey')
  if (!apiKey) return

  try {
    const response = await fetch(`${API_BASE}/api/threats/patterns`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      const patterns = await response.json()
      chrome.storage.local.set({ threatPatterns: patterns.data })
    }
  } catch (error) {
    console.error('[Influence Firewall] Failed to update threat patterns:', error)
  }
}
