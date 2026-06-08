const API_URL = import.meta.env.VITE_API_URL;

chrome.runtime.onInstalled.addListener(() => {
  console.log("⚙️ Background: Sprintxt Installed/Updated.");
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: "st-open-ui", title: "✨ Open Sprintxt", contexts: ["selection"] });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "st-open-ui" && tab?.id && info.selectionText) {
    console.log("🖱️ Background: Context Menu clicked. Opening UI.");
    chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_UI', selectedText: info.selectionText });
  }
});

chrome.runtime.onMessage.addListener((req, sender) => {
  console.log("📥 Background: Received message action ->", req.action);
  
  if (req.action === 'EXECUTE_API' && sender.tab?.id) {
    console.log("🚀 Background: Initiating API request. Payload:", { type: req.type, text: req.selectedText });
    processAIRequest(sender.tab.id, req.type, req.selectedText, req.customPrompt);
  }
});

async function processAIRequest(tabId: number, action: string, selectedText: string, customPrompt?: string) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, selectedText, customPrompt })
    };
    
    const response = await fetch(API_URL, requestOptions);
    const result = await response.json();

    if (result.success) {
      chrome.tabs.sendMessage(tabId, { action: 'INJECT_RESULT', generatedText: result.data.generatedText });
    } else {
      chrome.tabs.sendMessage(tabId, { action: 'UI_ERROR', error: result.error });
    }
  } catch (err: any) {
    chrome.tabs.sendMessage(tabId, { action: 'UI_ERROR', error: `Fetch failed: ${err.message}` });
  }
}

export {};