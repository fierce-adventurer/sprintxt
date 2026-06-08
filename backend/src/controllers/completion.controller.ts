import { Request, Response } from 'express';
import { GroqService } from '../services/groq.service';

export const handleCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, selectedText, customPrompt } = req.body;

    // 1. Basic validation
    if (!action || !selectedText) {
      res.status(400).json({ 
        success: false, 
        error: "Missing required fields: 'action' and 'selectedText' are mandatory." 
      });
      return;
    }

    if (action === 'prompt' && !customPrompt) {
      res.status(400).json({ 
        success: false, 
        error: "When action is 'prompt', 'customPrompt' must be provided." 
      });
      return;
    }

    if (action !== 'enhance' && action !== 'prompt') {
      res.status(400).json({ 
        success: false, 
        error: "Invalid action type. Must be either 'enhance' or 'prompt'." 
      });
      return;
    }

    const groqService = new GroqService();
    // 2. Call the AI service
    const generatedText = await groqService.generateCompletion(action, selectedText, customPrompt);

    // 3. Return structured response
    res.status(200).json({
      success: true,
      data: {
        originalText: selectedText,
        generatedText: generatedText,
        modelUsed: 'llama3-8b-8192'
      }
    });

  } catch (error: any) {
    console.error('Error during LLM compilation request:', error?.message || error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process AI inference request. Check server logs.' 
    });
  }
};