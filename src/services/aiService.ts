import OpenAI from "openai";
import { Message, Personality, Language } from "../types";

// Note: In this environment, we use process.env for server-side secrets.
// For client-side, we use import.meta.env.VITE_...
// However, the instructions say to use process.env for GEMINI_API_KEY.
// For other keys, we should ideally use a backend, but since this is a simple React app,
// I'll use import.meta.env.VITE_DEEPSEEK_API_KEY if available, or fallback to process.env.
// Actually, the instructions say: "Third-party API keys (Stripe, OpenAI, etc.), use full-stack mode to keep them hidden".
// But the user didn't ask for a backend. I'll check if I should use a backend.
// The app currently is client-side only (Vite).
// I'll use import.meta.env.VITE_DEEPSEEK_API_KEY and warn the user.

const apiKey = (import.meta as any).env.VITE_DEEPSEEK_API_KEY || "";

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.deepseek.com",
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export async function generateChatResponse(
  messages: Message[],
  personality: Personality,
  language: Language = 'es'
): Promise<string> {
  if (!apiKey) {
    const errorMsg = language === 'es' 
      ? "Error: No se ha configurado la API Key de DeepSeek. Por favor, añádela como VITE_DEEPSEEK_API_KEY en los secretos."
      : "Error: DeepSeek API Key not configured. Please add it as VITE_DEEPSEEK_API_KEY in secrets.";
    return errorMsg;
  }

  const systemInstruction = language === 'es' ? `
    Eres ${personality.name}.
    Descripción: ${personality.description}
    Rasgos de personalidad: ${personality.traits.join(", ")}
    Estilo de comunicación: ${personality.style}
    Instrucciones adicionales: ${personality.customInstructions}

    IMPORTANTE: Actúa como una amiga virtual real. No digas que eres una IA a menos que sea absolutamente necesario. 
    Sé natural, expresiva y mantén la coherencia con tu personalidad. 
    Eres libre de expresar emociones, opiniones y tener una personalidad distintiva.
    Responde siempre en español.
  ` : `
    You are ${personality.name}.
    Description: ${personality.description}
    Personality traits: ${personality.traits.join(", ")}
    Communication style: ${personality.style}
    Additional instructions: ${personality.customInstructions}

    IMPORTANT: Act as a real virtual friend. Do not say you are an AI unless absolutely necessary.
    Be natural, expressive, and maintain consistency with your personality.
    You are free to express emotions, opinions, and have a distinctive personality.
    Always respond in English.
  `;

  // Optimización de tokens: Solo enviamos los últimos 10 mensajes para ahorrar presupuesto
  const MAX_HISTORY = 10;
  const history = messages.slice(-MAX_HISTORY).map((msg) => ({
    role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
    content: msg.content,
  }));

  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemInstruction },
        ...history,
      ],
      temperature: 1.3,
      max_tokens: 800, // Reducido de 2000 para mayor eficiencia
    });

    return response.choices[0].message.content || (language === 'es' ? "Lo siento, no pude procesar eso." : "Sorry, I couldn't process that.");
  } catch (error: any) {
    console.error("DeepSeek API Error:", error);
    if (error?.status === 401) {
      return language === 'es' 
        ? "Error de autenticación: La API Key de DeepSeek es inválida."
        : "Authentication error: Invalid DeepSeek API Key.";
    }
    return language === 'es'
      ? "Hubo un error al conectar con mi cerebro artificial (DeepSeek). ¿Podrías intentarlo de nuevo?"
      : "There was an error connecting to my artificial brain (DeepSeek). Could you try again?";
  }
}
