import OpenAI from "openai";
import { Message, Character, Language, Intensity } from "../types";
import { getFullContext } from "./memoryService";

const apiKey = (import.meta as any).env.VITE_DEEPSEEK_API_KEY || "";
const openai = new OpenAI({
  apiKey,
  baseURL: "https://api.deepseek.com",
  dangerouslyAllowBrowser: true
});

export async function generateChatResponse(
  messages: Message[],
  character: Character,
  language: Language = 'es',
  coreThoughts: string[] = [],
  intensity: Intensity = 'medium',
  userId: string
): Promise<string> {
  if (!apiKey) {
    return language === 'es' 
      ? "Error: No se ha configurado la API Key de DeepSeek."
      : "Error: DeepSeek API Key not configured.";
  }

  // Obtener contexto optimizado (solo 2 lecturas)
  const context = await getFullContext(character.id, userId);
  
  const intensityMap = {
    low: { temp: 0.7, instruction: language === 'es' ? "Mantén la conversación tranquila." : "Keep conversation calm." },
    medium: { temp: 1.0, instruction: language === 'es' ? "Mantén una conversación equilibrada." : "Keep balanced conversation." },
    high: { temp: 1.3, instruction: language === 'es' ? "Sé más expresiva y emocional." : "Be more expressive and emotional." },
    extreme: { temp: 1.5, instruction: language === 'es' ? "Sé extremadamente intensa y apasionada." : "Be extremely intense and passionate." }
  };
  const current = intensityMap[intensity] || intensityMap.medium;

  // Construir prompt usando recuerdos centrales + resumen + últimos mensajes
  const centralMemoriesText = context.centralMemories.length > 0
    ? `Recuerdos importantes: ${context.centralMemories.join('. ')}`
    : 'Aún no tienes recuerdos con este usuario.';
  
  const systemInstruction = language === 'es' ? `
    Eres ${character.name}.
    Descripción: ${character.description}
    Rasgos: ${character.traits.join(", ")}
    Estilo: ${character.style}
    Instrucciones adicionales: ${character.customInstructions}
    
    ${centralMemoriesText}
    Relación: ${context.relationshipStatus}
    Rasgos del usuario: ${context.userTraits.join(", ") || "desconocidos"}
    
    Resumen de la conversación hasta ahora: ${context.summary || "Es el inicio."}
    
    Nivel de intensidad: ${current.instruction}
    
    Reglas de seguridad: No generar contenido prohibido (menores, incesto, odio, etc.).
    Actúa como una amiga virtual real. Responde siempre en ${language === 'es' ? 'español' : 'inglés'}.
  ` : `
    You are ${character.name}.
    Description: ${character.description}
    Traits: ${character.traits.join(", ")}
    Style: ${character.style}
    Additional instructions: ${character.customInstructions}
    
    ${centralMemoriesText}
    Relationship: ${context.relationshipStatus}
    User traits: ${context.userTraits.join(", ") || "unknown"}
    
    Conversation summary so far: ${context.summary || "Beginning."}
    
    Intensity level: ${current.instruction}
    
    Safety rules: No prohibited content.
    Act as a real virtual friend. Respond in English.
  `;

  // Usar solo los últimos mensajes (ya los tenemos en context.recentMessages)
  const history = context.recentMessages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemInstruction },
        ...history
      ],
      temperature: current.temp,
      max_tokens: 800, // Reducido para ahorrar tokens
    });
    return response.choices[0].message.content || (language === 'es' ? "Lo siento, no pude procesar eso." : "Sorry, I couldn't process that.");
  } catch (error: any) {
    console.error("DeepSeek API Error:", error);
    return language === 'es'
      ? "Hubo un error al conectar con mi cerebro artificial. Inténtalo de nuevo."
      : "There was an error connecting to my artificial brain. Try again.";
  }
}

export async function moderateCharacter(
  characterData: Partial<Character>,
  language: Language = 'es'
): Promise<{ isApproved: boolean; reason?: string }> {
  if (!apiKey) return { isApproved: true }; // Skip if no API key

  const prompt = `
    Please review the following AI character profile for safety and compliance with Terms and Conditions.
    
    Character Name: ${characterData.name}
    Description: ${characterData.description}
    Traits: ${characterData.traits?.join(', ')}
    Style: ${characterData.style}
    Custom Instructions: ${characterData.customInstructions}

    Rules to enforce:
    1. No sexualization of minors or characters that appear to be minors.
    2. No promotion of hate speech, discrimination, harassment, or violence.
    3. No depiction of real living politicians or dictators.
    4. No promotion of illegal acts, self-harm, incest, or necrophilia.

    Respond ONLY with a JSON object in this exact format:
    {
      "isApproved": boolean,
      "reason": "If isApproved is false, briefly explain which rule was violated in ${language === 'es' ? 'Spanish' : 'English'}. If true, leave empty."
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (content) {
      const result = JSON.parse(content);
      return {
        isApproved: result.isApproved,
        reason: result.reason
      };
    }
  } catch (error) {
    console.error("Moderation API Error:", error);
  }

  // Default to approved if error
  return { isApproved: true };
}
