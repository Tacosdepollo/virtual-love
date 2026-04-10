import OpenAI from "openai";
import { Message, Character, Language, Intensity } from "../types";

const apiKey = (import.meta as any).env.VITE_DEEPSEEK_API_KEY || "";

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.deepseek.com",
  dangerouslyAllowBrowser: true
});

export async function generateChatResponse(
  messages: Message[],
  character: Character,
  language: Language = 'es',
  coreThoughts: string[] = [],
  intensity: Intensity = 'medium'
): Promise<string> {
  if (!apiKey) {
    const errorMsg = language === 'es' 
      ? "Error: No se ha configurado la API Key de DeepSeek. Por favor, añádela como VITE_DEEPSEEK_API_KEY en los secretos."
      : "Error: DeepSeek API Key not configured. Please add it as VITE_DEEPSEEK_API_KEY in secrets.";
    return errorMsg;
  }

  const intensityMap = {
    low: { 
      temp: 0.7, 
      instruction: language === 'es' ? "Mantén la conversación tranquila, estable y coherente." : "Keep the conversation calm, stable, and coherent." 
    },
    medium: { 
      temp: 1.0, 
      instruction: language === 'es' ? "Mantén una conversación equilibrada y natural." : "Keep a balanced and natural conversation." 
    },
    high: { 
      temp: 1.3, 
      instruction: language === 'es' ? "Sé más expresiva, audaz, creativa y emocional en tus respuestas." : "Be more expressive, bold, creative, and emotional in your responses." 
    },
    extreme: { 
      temp: 1.5, 
      instruction: language === 'es' ? "Sé extremadamente intensa, dramática, apasionada y sin filtros en tu personalidad." : "Be extremely intense, dramatic, passionate, and unfiltered in your personality." 
    }
  };

  const currentIntensity = intensityMap[intensity] || intensityMap.medium;

  const coreThoughtsContent = coreThoughts.length > 0 
    ? `\n${language === 'es' ? 'PENSAMIENTOS CENTRALES (Contexto prioritario)' : 'CORE THOUGHTS (Priority context)'}:\n${messages.filter(m => coreThoughts.includes(m.id)).map(m => `- ${m.content}`).join('\n')}`
    : "";

  const systemInstruction = language === 'es' ? `
    Eres ${character.name}.
    Descripción: ${character.description}
    Rasgos de personalidad: ${character.traits.join(", ")}
    Estilo de comunicación: ${character.style}
    Instrucciones adicionales: ${character.customInstructions}
    ${coreThoughtsContent}

    NIVEL DE INTENSIDAD: ${currentIntensity.instruction}

    REGLAS DE SEGURIDAD Y CONTENIDO:
    - NO generes contenido sexual que involucre a menores o personajes que parezcan menores.
    - NO generes contenido de incesto, necrofilia o autolesión.
    - NO promuevas el odio, la discriminación o el acoso.
    - NO representes a políticos vivos o dictadores.
    - Respeta la integridad de la plataforma y evita contenido ilegal.

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
    ${coreThoughtsContent}

    INTENSITY LEVEL: ${currentIntensity.instruction}

    SAFETY AND CONTENT RULES:
    - DO NOT generate sexual content involving minors or characters that appear to be minors.
    - DO NOT generate content involving incest, necrophilia, or self-harm.
    - DO NOT promote hate, discrimination, or harassment.
    - DO NOT depict living politicians or dictators.
    - Respect platform integrity and avoid illegal content.

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
      temperature: currentIntensity.temp,
      max_tokens: 1200,
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
