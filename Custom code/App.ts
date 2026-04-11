// Dentro de App.tsx, añadir imports:
import { getFullContext, updateConversationContext, updateCentralMemories } from './services/memoryService';

// Reemplazar handleSendMessage por:
const handleSendMessage = async (content: string) => {
  if (!currentSession || !activeCharacter || !user) return;

  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: "user",
    content,
    timestamp: Date.now(),
  };

  // Actualizar mensajes en Firestore (opcional: mantener historial completo)
  const chatDoc = doc(db, "chats", currentSession.id);
  await updateDoc(chatDoc, {
    messages: arrayUnion(userMessage),
    lastUpdated: Date.now()
  });

  setIsLoading(true);
  audioManager.play('typing', 0.2);

  try {
    // Generar respuesta usando contexto optimizado
    const aiResponseContent = await generateChatResponse(
      currentSession.messages,
      activeCharacter,
      language,
      currentSession.coreThoughts || [],
      intensity,
      user.uid  // Pasamos userId
    );

    const aiMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: aiResponseContent,
      timestamp: Date.now(),
    };

    // Guardar mensaje en Firestore
    await updateDoc(chatDoc, {
      messages: arrayUnion(aiMessage),
      lastUpdated: Date.now()
    });

    // Actualizar contexto optimizado (conversationContext)
    await updateConversationContext(
      activeCharacter.id,
      user.uid,
      content,
      aiResponseContent,
      currentSession.summary
    );

    // Opcional: cada N mensajes actualizar recuerdos centrales
    const messageCount = (currentSession.messages?.length || 0) + 2;
    if (messageCount % 10 === 0) {
      const fullDialogue = `${content}\n${aiResponseContent}`;
      const currentCentral = await getFullContext(activeCharacter.id, user.uid);
      await updateCentralMemories(
        activeCharacter.id,
        user.uid,
        fullDialogue,
        currentCentral as any
      );
    }

  } catch (error) {
    console.error("Error generating response:", error);
  } finally {
    setIsLoading(false);
  }
};