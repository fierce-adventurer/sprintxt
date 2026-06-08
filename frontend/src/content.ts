let lastActiveElement: HTMLElement | null = null;
let currentSelection = '';

function getHighlightedText(): string {
  const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
  if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT')) {
    const start = activeEl.selectionStart || 0;
    const end = activeEl.selectionEnd || 0;
    return activeEl.value.substring(start, end);
  }
  return window.getSelection()?.toString() || '';
}

chrome.runtime.onMessage.addListener((req) => {
  if (req.action === 'TOGGLE_UI') {
    const selection = req.selectedText || getHighlightedText().trim();
    if (!selection) {
      alert("Sprintxt: Please highlight some text first!");
      return;
    }
    currentSelection = selection;
    lastActiveElement = document.activeElement as HTMLElement;
    createFloatingMenu();
  } else if (req.action === 'INJECT_RESULT') {
    replaceSelectedText(req.generatedText);
    closeUI();
  } else if (req.action === 'UI_ERROR') {
    showErrorState(req.error);
  }
});

function createFloatingMenu() {
  closeUI(); 

  const overlay = document.createElement('div');
  overlay.id = 'sprintxt-root';
  overlay.className = "fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm font-sans";
  
  overlay.innerHTML = `
    <div id="st-box" class="bg-white rounded-2xl shadow-2xl p-6 w-[380px] border border-[#D4AF37]/30 transform transition-all">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-extrabold text-black tracking-tight flex items-center gap-2">
          <span class="text-[#D4AF37]">✦</span> Sprintxt
        </h3>
        <button id="st-close" class="text-gray-400 hover:text-black font-bold text-xl cursor-pointer transition-colors">&times;</button>
      </div>

      <p class="text-xs text-gray-500 mb-6 truncate italic border-l-2 border-[#D4AF37] pl-2">"${currentSelection}"</p>

      <div id="st-button-group" class="flex flex-col gap-3">
        <button id="st-btn-enhance" class="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer">
          Enhance Writing
        </button>
        <button id="st-btn-prompt" class="w-full bg-white hover:bg-gray-50 text-black border border-black font-bold py-3 rounded-xl transition-all shadow-sm cursor-pointer">
          Custom Prompt
        </button>
      </div>

      <div id="st-prompt-group" class="hidden flex-col gap-3">
        <button id="st-btn-back" class="self-start text-xs font-bold text-gray-400 hover:text-black cursor-pointer flex items-center gap-1 transition-colors">
          &larr; Back to options
        </button>
        <textarea id="st-input" rows="3" 
          class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none text-sm text-black resize-none bg-gray-50" 
          placeholder="E.g., Make this sound highly polite..."></textarea>
        <button id="st-btn-generate" class="w-full bg-[#D4AF37] hover:bg-[#c29e2f] text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer">
          Generate Text
        </button>
      </div>

      <div id="st-loading" class="hidden text-center py-4 text-sm font-bold text-[#D4AF37] animate-pulse">
        Crafting text...
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close Event
  document.getElementById('st-close')?.addEventListener('click', closeUI);
  
  // NEW Prominent Back Button Event
  document.getElementById('st-btn-back')?.addEventListener('click', () => {
    document.getElementById('st-prompt-group')?.classList.add('hidden');
    document.getElementById('st-prompt-group')?.classList.remove('flex');
    document.getElementById('st-button-group')?.classList.remove('hidden');
    document.getElementById('st-button-group')?.classList.add('flex');
  });
  
  document.getElementById('st-btn-enhance')?.addEventListener('click', () => {
    setLoadingState();
    chrome.runtime.sendMessage({ action: 'EXECUTE_API', type: 'enhance', selectedText: currentSelection });
  });

  document.getElementById('st-btn-prompt')?.addEventListener('click', () => {
    document.getElementById('st-button-group')?.classList.add('hidden');
    document.getElementById('st-button-group')?.classList.remove('flex');
    document.getElementById('st-prompt-group')?.classList.remove('hidden');
    document.getElementById('st-prompt-group')?.classList.add('flex');
    document.getElementById('st-input')?.focus();
  });

  document.getElementById('st-btn-generate')?.addEventListener('click', () => {
    const customPrompt = (document.getElementById('st-input') as HTMLTextAreaElement).value.trim();
    if (!customPrompt) return;
    setLoadingState();
    chrome.runtime.sendMessage({ action: 'EXECUTE_API', type: 'prompt', selectedText: currentSelection, customPrompt });
  });
}

function setLoadingState() {
  document.getElementById('st-button-group')?.classList.add('hidden');
  document.getElementById('st-prompt-group')?.classList.add('hidden');
  const loading = document.getElementById('st-loading');
  if (loading) {
    loading.classList.remove('hidden');
    loading.classList.add('block');
  }
}

function showErrorState(errorMsg: string) {
  const loading = document.getElementById('st-loading');
  if (loading) {
    loading.classList.remove('hidden', 'animate-pulse', 'text-[#D4AF37]');
    loading.classList.add('block', 'text-red-500');
    loading.innerText = `Error: ${errorMsg}`;
  }
}

function closeUI() {
  document.getElementById('sprintxt-root')?.remove();
}

function replaceSelectedText(newText: string) {
  if (lastActiveElement) lastActiveElement.focus();

  const activeElement = document.activeElement as HTMLElement;

  if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
    const start = activeElement.selectionStart || 0;
    const end = activeElement.selectionEnd || 0;
    const text = activeElement.value;
    
    activeElement.value = text.substring(0, start) + newText + text.substring(end);
    activeElement.selectionStart = activeElement.selectionEnd = start + newText.length;
    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
  } 
  else if (activeElement.isContentEditable) {
    const success = document.execCommand('insertText', false, newText);
    if (!success) fallbackToClipboard(newText);
  } 
  else {
    fallbackToClipboard(newText);
  }
}

function fallbackToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    alert("✨ Sprintxt: Text enhanced! It has been copied to your clipboard. Just hit Paste (Ctrl+V).");
  }).catch(err => {
    console.error("Clipboard write failed:", err);
  });
}

export {};