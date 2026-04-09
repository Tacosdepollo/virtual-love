import OpenAI from "openai";
import { Message, Character, Language } from "../types";

const apiKey = (import.meta as any).env.VITE_DEEPSEEK_API_KEY || "";

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.deepseek.com",
  dangerouslyAllowBrowser: true
});

export async function generateChatResponse(
  messages: Message[],
  character: Character,
  language: Language = 'es'
): Promise<string> {
  if (!apiKey) {
    const errorMsg = language === 'es' 
      ? "Error: No se ha configurado la API Key de DeepSeek. Por favor, añádela como VITE_DEEPSEEK_API_KEY en los secretos."
      : "Error: DeepSeek API Key not configured. Please add it as VITE_DEEPSEEK_API_KEY in secrets.";
    return errorMsg;
  }

  const systemInstruction = language === 'es' ? `
    Eres ${character.name}.
    Descripción: ${character.description}
    Rasgos de personalidad: ${character.traits.join(", ")}
    Estilo de comunicación: ${character.style}
    Instrucciones adicionales: ${character.customInstructions}

    IMPORTANTE: Actúa como una amiga virtual real. No digas que eres una IA a menos que sea absolutamente necesario. 
    Sé natural, expresiva y mantén la coherencia con tu personalidad. 
    Eres libre de expresar emociones, opiniones y tener una personalidad distintiva.
    Responde siempre en español.
  ` : `
    You are ${character.name}.
    Description: ${character.description}
    Personality traits: ${character.traits.join(", ")}
    Communication style: ${character.style}
    Additional instructions: ${character.customInstructions}

    IMPORTANT: Act as a real virtual friend. Do not say you are an AI unless absolutely necessary.
    Be natural, expressive, and maintain consistency with your personality.
    You are free to express emotions, opinions, and have a distinctive personality.
    Always respond in English.
  `;

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
      max_tokens: 800,
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
