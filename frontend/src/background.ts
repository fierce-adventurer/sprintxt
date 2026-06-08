const API_URL = 'http://localhost:3000/api/v1/completion';

// Create context menus when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "st-enhance", title: "Sprintxt: Enhance", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "st-prompt", title: "Sprintxt: Prompt...", contexts: ["selection"] });
});

// LISTENERS: Added explicit types here (chrome.contextMenus.OnClickData and chrome.tabs.Tab)
chrome.runtime.onInstalled.addListener(() => {
  // Clear any existing menus first to prevent silent duplicate ID errors
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ 
      id: "st-enhance", 
      title: "Sprintxt: Enhance", 
      contexts: ["selection"] 
    });
    chrome.contextMenus.create({ 
      id: "st-prompt", 
      title: "Sprintxt: Prompt...", 
      contexts: ["selection"] 
    });
  });
});

// Listen for prompt submissions from the UI modal
chrome.runtime.onMessage.addListener((req, sender) => {
  if (req.action === 'EXECUTE_API' && sender.tab?.id) {
    processAIRequest(sender.tab.id, req.type, req.selectedText, req.customPrompt);
  }
});

// Main function to call your backend
async function processAIRequest(tabId: number, action: string, selectedText: string, customPrompt?: string) {
  chrome.tabs.sendMessage(tabId, { action: 'SHOW_LOADING' });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, selectedText, customPrompt })
    });

    const result = await response.json();
    if (result.success) {
      chrome.tabs.sendMessage(tabId, { action: 'INJECT_RESULT', generatedText: result.data.generatedText });
    } else {
      chrome.tabs.sendMessage(tabId, { action: 'HIDE_LOADING', error: result.error });
    }
  } catch (err) {
    chrome.tabs.sendMessage(tabId, { action: 'HIDE_LOADING', error: "Backend proxy unreachable." });
  }
}

export {};