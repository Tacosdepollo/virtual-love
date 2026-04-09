import React from "react";
import { motion } from "motion/react";
import { Shield, FileText, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Language } from "../types";
import { t } from "../translations";

interface LegalViewProps {
  language: Language;
  onBack: () => void;
}

export default function LegalView({ language, onBack }: LegalViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-zinc-950/50">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold font-heading tracking-tight">
            {t('legal', language)}
          </h1>
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-[var(--brand)]">
            <FileText className="w-6 h-6" />
            <h2 className="text-2xl font-semibold">{t('terms', language)}</h2>
          </div>
          <div className="prose prose-invert max-w-none text-zinc-400 space-y-4">
            <p>
              {language === 'es' 
                ? "Bienvenido a GIMS.ai. Al utilizar nuestra aplicación, aceptas los siguientes términos y condiciones:"
                : "Welcome to GIMS.ai. By using our application, you agree to the following terms and conditions:"}
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                {language === 'es'
                  ? "Uso Responsable: Te comprometes a utilizar la IA de manera ética y no para generar contenido dañino o ilegal."
                  : "Responsible Use: You agree to use the AI ethically and not to generate harmful or illegal content."}
              </li>
              <li>
                {language === 'es'
                  ? "Propiedad de Contenido: Los personajes que creas son tu responsabilidad. GIMS.ai no se hace responsable de las interacciones generadas por la IA."
                  : "Content Ownership: The characters you create are your responsibility. GIMS.ai is not responsible for AI-generated interactions."}
              </li>
              <li>
                {language === 'es'
                  ? "Modificaciones: Nos reservamos el derecho de modificar o suspender el servicio en cualquier momento."
                  : "Modifications: We reserve the right to modify or suspend the service at any time."}
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-[var(--brand)]">
            <Shield className="w-6 h-6" />
            <h2 className="text-2xl font-semibold">{t('privacy', language)}</h2>
          </div>
          <div className="prose prose-invert max-w-none text-zinc-400 space-y-4">
            <p>
              {language === 'es'
                ? "Tu privacidad es importante para nosotros. Así manejamos tus datos:"
                : "Your privacy is important to us. Here is how we handle your data:"}
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                {language === 'es'
                  ? "Datos de Autenticación: Utilizamos Google Auth para gestionar tu cuenta de forma segura. No compartimos tu correo con terceros."
                  : "Authentication Data: We use Google Auth to manage your account securely. We do not share your email with third parties."}
              </li>
              <li>
                {language === 'es'
                  ? "Historial de Chat: Tus conversaciones se almacenan de forma privada en Firebase y solo tú puedes acceder a ellas."
                  : "Chat History: Your conversations are stored privately in Firebase and only you can access them."}
              </li>
              <li>
                {language === 'es'
                  ? "Uso de IA: Los mensajes se envían a los servidores de DeepSeek para generar respuestas, pero no se asocian con tu identidad personal en esos servidores."
                  : "AI Usage: Messages are sent to DeepSeek servers to generate responses, but they are not associated with your personal identity on those servers."}
              </li>
            </ul>
          </div>
        </section>

        <div className="pt-12 border-t border-zinc-800 text-center text-zinc-500 text-sm">
          <p>© {new Date().getFullYear()} GIMS.ai - {language === 'es' ? "Todos los derechos reservados." : "All rights reserved."}</p>
        </div>
      </div>
    </div>
  );
}
