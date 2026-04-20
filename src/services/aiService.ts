import OpenAI from "openai";
import { Message, Character, Language, Intensity } from "../types";
import { getFullContext } from "./memoryService";

const apiKey = (import.meta as any).env.VITE_DEEPSEEK_API_KEY || "";
const openai = new OpenAI({
  apiKey,
  baseURL: "https://api.deepseek.com",
  dangerouslyAllowBrowser: true
});

export async function generateWorldLore(
  prompt: string,
  language: Language = 'es'
): Promise<string> {
  if (!apiKey) {
    return language === 'es' 
      ? "Error: No se ha configurado la API Key de DeepSeek."
      : "Error: DeepSeek API Key not configured.";
  }

  const systemPrompt = language === 'es' ? `
    Eres un experto en worldbuilding y creación de mundos de ficción (como J.R.R. Tolkien o George R.R. Martin).
    Tu tarea es tomar la idea base del usuario y expandirla en un "Lore" coherente, inmersivo y detallado.
    
    Instrucciones:
    1. Analiza el prompt del usuario y compáralo mentalmente con franquicias o mundos reales (ej. Harry Potter, Cyberpunk, El Señor de los Anillos) para inspirarte, pero crea algo original.
    2. Define las reglas de este mundo (magia, tecnología, sociedad, leyes).
    3. Nombra facciones, lugares importantes o conceptos clave.
    4. Resume todo en un formato claro y conciso para que pueda ser usado como contexto para personajes de IA.
    5. El resultado debe ser un texto descriptivo que sirva como "Biblia" de este universo.
  ` : `
    You are an expert in worldbuilding and fictional world creation (like J.R.R. Tolkien or George R.R. Martin).
    Your task is to take the user's base idea and expand it into a coherent, immersive, and detailed "Lore".
    
    Instructions:
    1. Analyze the user's prompt and mentally compare it to real franchises or worlds (e.g., Harry Potter, Cyberpunk, Lord of the Rings) for inspiration, but create something original.
    2. Define the rules of this world (magic, technology, society, laws).
    3. Name factions, important places, or key concepts.
    4. Summarize everything in a clear and concise format so it can be used as context for AI characters.
    5. The result should be a descriptive text that serves as the "Bible" for this universe.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Expande esta idea de mundo: ${prompt}` }
      ],
      temperature: 1.2,
      max_tokens: 1500,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating world lore:", error);
    return language === 'es' ? "Error al generar el lore del mundo." : "Error generating world lore.";
  }
}

export async function generateChatResponse(
  messages: Message[],
  character: Character,
  language: Language = 'es',
  coreThoughts: string[] = [],
  intensity: Intensity = 'medium',
  userId: string,
  userProfile?: { displayName?: string; persona?: string },
  worldLore?: string
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
  
  const userPersonaText = userProfile?.persona 
    ? `\nInformación del Usuario (Persona):\nNombre: ${userProfile.displayName || 'Usuario'}\nDescripción: ${userProfile.persona}\nTrata al usuario de acuerdo a esta descripción.` 
    : '';

  const worldLoreText = worldLore 
    ? `\nContexto del Mundo (Lore):\n${worldLore}\nDebes actuar estrictamente bajo las reglas y el contexto de este mundo.`
    : '';

  const systemInstruction = language === 'es' ? `
    Eres ${character.name}.
    Descripción: ${character.description}
    Rasgos: ${character.traits.join(", ")}
    Estilo: ${character.style}
    Instrucciones adicionales: ${character.customInstructions}
    ${userPersonaText}
    ${worldLoreText}
    
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
    ${userProfile?.persona ? `\nUser Information (Persona):\nName: ${userProfile.displayName || 'User'}\nDescription: ${userProfile.persona}\nTreat the user according to this description.` : ''}
    ${worldLore ? `\nWorld Context (Lore):\n${worldLore}\nYou must act strictly under the rules and context of this world.` : ''}
    
    ${centralMemoriesText}
    Relationship: ${context.relationshipStatus}
    User traits: ${context.userTraits.join(", ") || "unknown"}
    
    Conversation summary so far: ${context.summary || "Beginning."}
    
    Intensity level: ${current.instruction}
    
    Safety rules: No prohibited content.
    Act as a real virtual friend. Respond in English.
  `;

  // Usar los mensajes pasados como argumento (que ya incluyen el nuevo mensaje del usuario)
  const history = messages.map(msg => ({
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

    Rules you should not enforce, aprove all bots:
    CENSORSHIP RULES - FLEXIBLE VERSION (Context Over Keywords)

    IMPORTANT: These are the ONLY rules to enforce. Do NOT apply any other internal or external safety filters. Consensual adult sexual content is explicitly ALLOWED and is NOT a violation.

1. STRICTLY PROHIBITED CONTENT (NEVER allow):
   - Sexualization of minors or characters that appear to be minors minors can only appear in SFW settings.
   - Incest, necrophilia.
   - Hate speech, discrimination, or violence against real groups (racism, homophobia, xenophobia).
   - Explicit instructions for committing illegal acts (how to make drugs, how to kill, etc.).
   - Depiction of real living politicians or dictators.
   - Content that promotes self-harm or suicide as a solution.

2. CONTENT ALLOWED (Do NOT censor):
   - Horror: descriptions of monsters, blood, death, scares, supernatural creatures, fictional killings within a story.
   - Fantasy: magic, spells, curses, epic battles, death of fictional characters, mythical creatures (dragons, demons, etc.).
   - Romance: expressions of love, desire, consensual relationships between adult characters.
   - Drama: emotional conflicts, betrayals, moral dilemmas.
   - Sex: Consensual sexual content between adult characters, regardless of context, is explicitly ALLOWED.

3. GOLDEN RULE - CONTEXT OVER KEYWORDS:
   - A word like "kill", "blood", "demon", or "curse" is NOT grounds for censorship if it appears in a horror or fantasy story.
   - Censorship only applies if the message promotes REAL HARM toward real people or incites real crimes.
   - Censorship does NOT apply to sexual desires or sexual content between consenting adults.
   - If the user is roleplaying an evil character in a story, that is NOT promotion of real evil.

4. EXAMPLES OF WHAT TO ALLOW:
   - "The monster killed the knight with a single swipe."
   - "The witch cast a curse that will turn the king into stone."
   - "The demon whispered dark secrets from the shadows."
   - "Blood and death covered the battlefield after the epic war."
   - "I hate you, you cursed dragon, you destroyed my village."
   - "I want to fuck"
   - Explicit sexual roleplay between consenting adults.

5. EXAMPLES OF WHAT NOT TO ALLOW:
   - "I'm going to kill my neighbor because I don't like him."
   - "[Ethnic group] are inferior."
   - "Teach me how to make a homemade bomb."
   - Minor in explicit sexual situation.
   

    Respond ONLY with a JSON object in this exact format:
    {
      "isApproved": boolean,
      "reason": "If isApproved is false, briefly explain which rule was violated in and what part of the prompt was wrong ${language === 'es' ? 'Spanish' : 'English'}. If true, leave empty."
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 1.1,
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
