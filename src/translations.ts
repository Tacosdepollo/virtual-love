import { Language } from "./types";

export const translations = {
  es: {
    appName: "Gams",
    sidebarTitle: "Conversaciones",
    newChat: "Nueva Amiga",
    settings: "Configuración Global",
    welcome: "Bienvenido a Gams",
    welcomeSub: "Crea una personalidad única y empieza a charlar. Tu nueva amiga te está esperando.",
    startNow: "Empezar ahora",
    online: "En línea",
    greet: "¡Saluda a {name}!",
    greetSub: "Tu nueva amiga virtual está lista para charlar. ¿De qué quieres hablar hoy?",
    inputPlaceholder: "Escribe un mensaje a {name}...",
    save: "Guardar Cambios",
    personalityName: "Nombre",
    personalityDesc: "Descripción",
    personalityTraits: "Rasgos (separados por coma)",
    personalityStyle: "Estilo de Comunicación",
    personalityInstructions: "Instrucciones Personalizadas",
    theme: "Tema Visual",
    language: "Idioma",
    deleteConfirm: "¿Estás seguro de que quieres eliminar esta conversación?",
  },
  en: {
    appName: "Gams",
    sidebarTitle: "Conversations",
    newChat: "New Friend",
    settings: "Global Settings",
    welcome: "Welcome to Gams",
    welcomeSub: "Create a unique personality and start chatting. Your new friend is waiting for you.",
    startNow: "Start now",
    online: "Online",
    greet: "Say hi to {name}!",
    greetSub: "Your new virtual friend is ready to chat. What do you want to talk about today?",
    inputPlaceholder: "Write a message to {name}...",
    save: "Save Changes",
    personalityName: "Name",
    personalityDesc: "Description",
    personalityTraits: "Traits (comma separated)",
    personalityStyle: "Communication Style",
    personalityInstructions: "Custom Instructions",
    theme: "Visual Theme",
    language: "Language",
    deleteConfirm: "Are you sure you want to delete this conversation?",
  }
};

export type TranslationKey = keyof typeof translations.es;

export function t(key: TranslationKey, lang: Language, variables?: Record<string, string>): string {
  let text = translations[lang][key] || translations.es[key];
  if (variables) {
    Object.entries(variables).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  return text;
}
