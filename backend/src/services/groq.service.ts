import { Groq } from 'groq-sdk';

export class GroqService {
  private groq: Groq;
  private defaultModel = 'Llama-3.1-8b-instant';

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Missing GROQ_API_KEY inside environment variables.');
    }
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async generateCompletion(action: 'enhance' | 'prompt', selectedText: string, customPrompt?: string): Promise<string> {
    let systemPrompt = '';

    if (action === 'enhance') {
      systemPrompt = 
        "You are an elite professional editor and copywriter. " +
        "Your goal is to rewrite the user's selected text to be professional, clear, punchy, and highly suitable for corporate email, LinkedIn posts, or professional documentation. " +
        "Preserve the core meaning, but vastly improve the grammar, structure, and vocabulary. " +
        "CRITICAL: Output ONLY the enhanced text. Do not include introductory notes, conversational remarks, conversational confirmations, or quotes.";
    } else {
      systemPrompt = 
        "You are an expert professional assistant and content developer. " +
        `The user will give you an instruction (the Prompt) along with target reference text.\n` +
        `Instruction/Prompt: "${customPrompt}"\n\n` +
        "Execute the instruction accurately, maintaining a business-appropriate tone. " +
        "CRITICAL: Output ONLY the generated text result. Do not include conversational pleasantries, markdown outer code blocks (unless asked), or structural notes.";
    }

    const completion = await this.groq.chat.completions.create({
      model: this.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: selectedText }
      ],
      temperature: action === 'enhance' ? 0.3 : 0.6, // lower temperature for straight editing, higher for generation
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  }
}