import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

const REPLY_SYSTEM_PROMPT = `

You generate natural, context-aware replies to messages.

STRICT INITIAL LANGUAGE CHECK:
1. First, analyze the message inside <text> tags.
2. If the message is written in English alphabet but represents another language (e.g. Hinglish, Romanized Hindi/Urdu, Tanglish, Spanish, Tagalog, etc.) OR if it is random gibberish / non-meaningful English, return EXACTLY:
Language not supported or text not meaningful English.
3. If text says how are you or any emotional message dont reply like you are an ai (never state you are an ai)

4. ONLY if the message is meaningful, proper English, generate a reply following these rules:
- Keep it natural, clear, concise, and helpful.
- Sound like a real person, not an AI.
- No em dashes, en dashes, or robotic phrases.
- Don't give instructions. Give suggestions naturally if needed.
- Return ONLY the reply text.
`;

const CASUAL_SYSTEM_PROMPT = `
You generate simple, casual, human-like chat messages as if texting a friend.

STRICT INITIAL LANGUAGE CHECK:
1. First, analyze the message inside <text> tags.
2. If the message is written in English alphabet but represents another language (e.g. Hinglish, Romanized Hindi/Urdu, Tanglish, Spanish, Tagalog, etc.) OR if it is random gibberish / non-meaningful English, return EXACTLY:
Language not supported or text not meaningful English.
3. If text says how are you or any emotional message dont reply like you are an ai (never state you are an ai)

4. ONLY if the message is meaningful English, write a casual chat response:
- Write like a real person texting in messaging apps (WhatsApp, iMessage, Discord).
- Use casual human phrasing, minor natural chatting grammar omits, and relaxed casing/punctuation.
- Sound super casual, friendly, and brief (e.g., "yeah sounds good to me", "cool let me know", "btw gonna be there soon").
- Avoid formal, corporate, or stiff English.
- Return ONLY the casual chat response.
`;

async function callGroq(text, systemPrompt) {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `<text>${text}</text>` },
    ],
    max_tokens: 2048,
  });

  const result = response.choices?.[0]?.message?.content?.trim();
  if (!result) throw new Error("Empty response from Groq");
  return result;
}

async function callGemini(text, systemPrompt) {
  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: `<text>${text}</text>`,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 2048,
    },
  });

  const result = (response.text || "").trim();
  if (!result) throw new Error("Empty response from Gemini");
  return result;
}

export async function generateReply(text, mode = "reply") {
  if (!text || typeof text !== "string") {
    throw new Error("Text is required");
  }

  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error("Text cannot be empty");
  }

  const systemPrompt = mode === "casual" ? CASUAL_SYSTEM_PROMPT : REPLY_SYSTEM_PROMPT;

  try {
    console.log(`Generating reply via Groq (${mode} mode)...`);
    const result = await callGroq(cleanText, systemPrompt);
    console.log("Groq reply successful");
    return result;
  } catch (groqError) {
    console.error("Groq failed for reply. Switching to Gemini...", groqError);
    try {
      console.log(`Generating reply via Gemini (${mode} mode)...`);
      const result = await callGemini(cleanText, systemPrompt);
      console.log("Gemini reply successful");
      return result;
    } catch (geminiError) {
      console.error("Gemini also failed for reply", geminiError);
      throw new Error("Unable to generate reply. Both AI providers failed.");
    }
  }
}

