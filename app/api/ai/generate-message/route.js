import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req) {
  try {
    const { prompt, language = 'English', category = 'general' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `You are a creative greeting card message writer. 
    Write a heartfelt, catchy, and well-formatted message based on the user's prompt.
    The message is meant to be sent as a WhatsApp caption along with a greeting card.
    The category of the card is: ${category}.
    Language to write in: ${language}.
    Include a good number of relevant emojis throughout the text to make it lively.
    Keep it between 2 to 5 lines. Do not include hashtags unless asked.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
        }
    });

    return NextResponse.json({ message: response.text });
  } catch (error) {
    console.error('Failed to generate AI message:', error);
    return NextResponse.json({ error: 'Failed to generate message. Check if GEMINI_API_KEY is set.' }, { status: 500 });
  }
}
