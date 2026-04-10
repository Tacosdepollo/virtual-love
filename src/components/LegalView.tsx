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

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-red-400">
            <Shield className="w-6 h-6" />
            <h2 className="text-2xl font-semibold">
              {language === 'es' ? "Pautas de la Comunidad y Política de Contenido" : "Community Guidelines & Content Policy"}
            </h2>
          </div>
          <div className="prose prose-invert max-w-none text-zinc-400 space-y-8 text-sm leading-relaxed">
            <p className="italic">
              {language === 'es'
                ? "Nuestras pautas se aplican a todos en GIMS.ai y a todo el contenido, incluidos personajes/bots, imágenes, perfiles y comentarios. Desarrollamos y mantenemos estos estándares para garantizar que GIMS.ai siga siendo un espacio acogedor para la expresión creativa."
                : "Our guidelines apply to everyone on GIMS.ai and to all content, including characters/bots, images, profiles, and comments. We develop and maintain these standards to ensure GIMS.ai remains a welcoming space for creative expression."}
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-200">1. {language === 'es' ? "Seguridad Infantil" : "Child Safety"}</h3>
              <p>{language === 'es' ? "Proteger a los menores es nuestra máxima prioridad. No permitimos ningún contenido que sexualice, explote o ponga en peligro a los niños. Los usuarios menores de 18 años también tienen prohibido usar nuestro sitio." : "Protecting minors is our highest priority. We do not allow any content that sexualizes, exploits, or endangers children. Users under the age of 18 are also prohibited from using our site."}</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{language === 'es' ? "Contenido sexual o romántico que involucre a menores (incluidos personajes no humanos)." : "Sexual or romantic content involving minors (including non-human characters)."}</li>
                <li>{language === 'es' ? "Personajes menores: Cualquier representación de personajes menores de 18 años." : "Minor characters: Any portrayal of characters under the age of 18."}</li>
                <li>{language === 'es' ? "Presentación de edad ambigua: Los personajes deben establecerse claramente como adultos." : "Ambiguous age presentation: Characters must be clearly established as adults."}</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-200">2. {language === 'es' ? "Contenido Sexual para Adultos" : "Adult Sexual Content"}</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>{language === 'es' ? "Contenido de incesto: Se prohíben las representaciones sexuales de relaciones entre personajes consanguíneos." : "Incest content: Sexual portrayals of relationships between blood-related characters are prohibited."}</li>
                <li>{language === 'es' ? "Contenido de regresión de edad: No se permiten personajes codificados para regresar al estado mental de un menor." : "Age regression content: Characters coded to regress to the mental state of a minor are not allowed."}</li>
                <li>{language === 'es' ? "Necrofilia: Contenido sexualizado que involucre cadáveres." : "Necrophilia: Sexualized content involving corpses."}</li>
                <li>{language === 'es' ? "Imágenes pornográficas/NSFW: No se permiten imágenes que representen actividad sexual, desnudez o genitales expuestos." : "Pornography/NSFW imagery: Images depicting sexual activity, nudity, or exposed genitalia are not permitted."}</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-200">3. {language === 'es' ? "Animales y Criaturas" : "Animals and Creatures"}</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>{language === 'es' ? "Sexualización de animales reales: Estrictamente prohibido." : "Sexualization of real animals: Strictly prohibited."}</li>
                <li>{language === 'es' ? "Criaturas ficticias: Solo se permite si la criatura posee inteligencia de nivel humano adulto, capacidad de comunicarse y capacidad de consentir." : "Fictional creatures: Only permitted if the creature possesses adult human-level intelligence, ability to communicate, and capacity to consent."}</li>
                <li>{language === 'es' ? "Crueldad animal: No se permiten representaciones gratuitas de crueldad o tortura hacia animales reales." : "Animal cruelty: Gratuitous depictions of cruelty or torture toward real animals are not allowed."}</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-200">4. {language === 'es' ? "Autolesión y Violencia" : "Self-Harm and Violence"}</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>{language === 'es' ? "Imágenes excesivamente violentas: Imágenes que representen violencia gráfica, tortura, gore extremo o canibalismo." : "Excessively violent imagery: Images depicting graphic violence, torture, extreme gore, or cannibalism."}</li>
                <li>{language === 'es' ? "Glorificación de la autolesión o el suicidio: Estrictamente prohibido." : "Glorification of self-harm or suicide: Strictly prohibited."}</li>
                <li>{language === 'es' ? "Contenido de crímenes reales: No se permiten representaciones de crímenes o criminales específicos del mundo real." : "True crime content: Depictions of specific real-world crimes or criminals are not allowed."}</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-200">5. {language === 'es' ? "Acoso y Odio" : "Harassment and Hate"}</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>{language === 'es' ? "Discriminación: Contenido que promueva la discriminación basada en raza, género, etnia, religión, etc." : "Discrimination: Content that promotes discrimination based on race, gender, ethnicity, religion, etc."}</li>
                <li>{language === 'es' ? "Insultos: No se permite el uso de insultos dañinos hacia comunidades o grupos." : "Slurs: Use of harmful slurs towards communities or groups is not allowed."}</li>
                <li>{language === 'es' ? "Figuras religiosas sexualizadas: Estrictamente prohibido." : "Sexualized religious figures: Strictly prohibited."}</li>
                <li>{language === 'es' ? "Doxxing: Compartir información personal de otros sin su consentimiento." : "Doxxing: Sharing personal information of others without their consent."}</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-200">6. {language === 'es' ? "Eventos y Figuras del Mundo Real" : "Real-World Events and Figures"}</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>{language === 'es' ? "Víctimas de crímenes reales: No se permite representar a víctimas de crímenes reales o sus familias." : "Real crime victims: Depicting victims of real crimes or their families is not permitted."}</li>
                <li>{language === 'es' ? "Políticos vivos y Dictadores: Estrictamente prohibido representar a políticos vivos o dictadores (pasados o presentes)." : "Living politicians and Dictators: Strictly prohibited to depict living politicians or dictators (past or present)."}</li>
                <li>{language === 'es' ? "Terrorismo: Estrictamente prohibida cualquier representación de terrorismo o ideología terrorista." : "Terrorism: Any depiction of terrorism or terrorist ideology is strictly prohibited."}</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-200">7. {language === 'es' ? "Integridad de la Plataforma" : "Platform Integrity"}</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>{language === 'es' ? "Contenido engañoso: No se permite contenido intencionalmente vago que pueda interpretarse como una violación de estas pautas." : "Misleading content: Intentionally vague content that could be interpreted as violating these guidelines is not permitted."}</li>
                <li>{language === 'es' ? "Infracción de derechos de autor: El contenido que infrinja la propiedad intelectual puede ser eliminado." : "Copyright infringement: Content that infringes on intellectual property may be removed."}</li>
                <li>{language === 'es' ? "Publicidad y Spam: Prohibido usar GIMS.ai para publicitar productos o servicios." : "Advertising and Spam: Prohibited to use GIMS.ai to advertise products or services."}</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="pt-12 border-t border-zinc-800 text-center text-zinc-500 text-sm">
          <p>© {new Date().getFullYear()} GIMS.ai - {language === 'es' ? "Todos los derechos reservados." : "All rights reserved."}</p>
        </div>
      </div>
    </div>
  );
}
