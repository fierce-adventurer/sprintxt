let lastActiveElement: HTMLElement | null = null;

chrome.runtime.onMessage.addListener((req) => {
  if (req.action === 'SHOW_PROMPT_MODAL') {
    lastActiveElement = document.activeElement as HTMLElement;
    createPromptModal(req.selectedText);
  } else if (req.action === 'INJECT_RESULT') {
    replaceSelectedText(req.generatedText);
  } else if (req.action === 'SHOW_LOADING') {
    document.body.style.cursor = 'wait';
  } else if (req.action === 'HIDE_LOADING') {
    document.body.style.cursor = 'default';
    if (req.error) alert(`Sprintxt Error: ${req.error}`);
  }
});

function createPromptModal(selectedText: string) {
  document.getElementById('sprintxt-modal-root')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'sprintxt-modal-root';
  overlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl p-6 w-[400px] flex flex-col gap-4 font-sans border border-gray-200">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-800 m-0">Sprintxt AI</h3>
        <button id="st-close" class="text-gray-400 hover:text-gray-600 font-bold cursor-pointer text-xl leading-none">&times;</button>
      </div>
      <p class="text-xs text-gray-500 m-0 truncate italic">"${selectedText}"</p>
      <textarea id="st-prompt-input" rows="3" 
        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-800 resize-none" 
        placeholder="E.g., Rewrite this to be more authoritative..."></textarea>
      <button id="st-submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg cursor-pointer transition">
        Generate Text
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = document.getElementById('st-prompt-input') as HTMLTextAreaElement;
  input.focus();

  const close = () => overlay.remove();
  document.getElementById('st-close')?.addEventListener('click', close);
  
  document.getElementById('st-submit')?.addEventListener('click', () => {
    if (!input.value.trim()) return;
    chrome.runtime.sendMessage({ action: 'EXECUTE_API', type: 'prompt', selectedText, customPrompt: input.value.trim() });
    close();
  });
}

function replaceSelectedText(newText: string) {
  document.body.style.cursor = 'default';
  
  if (lastActiveElement) lastActiveElement.focus();
  const activeElement = document.activeElement as HTMLElement;

  if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
    const start = activeElement.selectionStart || 0;
    const end = activeElement.selectionEnd || 0;
    const text = activeElement.value;
    activeElement.value = text.substring(0, start) + newText + text.substring(end);
    activeElement.selectionStart = activeElement.selectionEnd = start + newText.length;
    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
  } else if (activeElement.isContentEditable) {
    document.execCommand('insertText', false, newText);
  }
}

// Force TypeScript to treat this file as an isolated module
export {};