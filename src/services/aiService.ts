import { GoogleGenAI } from "@google/genai";
import { Message, Personality } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function generateChatResponse(
  messages: Message[],
  personality: Personality
): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing. Please add it to the Secrets panel.");
    return "Error: No se ha configurado la clave de API de Gemini. Por favor, añádela en el panel de Secrets.";
  }

  const systemInstruction = `
    Eres ${personality.name}.
    Descripción: ${personality.description}
    Rasgos de personalidad: ${personality.traits.join(", ")}
    Estilo de comunicación: ${personality.style}
    Instrucciones adicionales: ${personality.customInstructions}

    IMPORTANTE: Actúa como una amiga virtual real. No digas que eres una IA a menos que sea absolutamente necesario. 
    Sé natural, expresiva y mantén la coherencia con tu personalidad. 
    Eres libre de expresar emociones, opiniones y tener una personalidad distintiva.
    Responde siempre en español.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
      },
    });

    return response.text || "Lo siento, no pude procesar eso.";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Hubo un error al conectar con mi cerebro artificial. ¿Podrías intentarlo de nuevo?";
  }
}
