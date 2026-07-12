import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PayPal Helper Functions
const PAYPAL_API = process.env.PAYPAL_ENVIRONMENT === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const data = await response.json() as any;
  if (!data.access_token) {
    throw new Error(`Failed to get PayPal access token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // PayPal Endpoints
  app.post("/api/paypal/create-order", async (req, res) => {
    const { amount, description } = req.body;
    try {
      if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        throw new Error("PayPal credentials are not configured on the server.");
      }
      const accessToken = await getPayPalAccessToken();
      const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: amount || '2.50',
              },
              description: description || 'GIMS+ Subscription (30 days)',
            },
          ],
        }),
      });
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("PayPal Create Order Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/paypal/capture-order", async (req, res) => {
    const { orderID, userId } = req.body;
    try {
      if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        throw new Error("PayPal credentials are not configured on the server.");
      }
      const accessToken = await getPayPalAccessToken();
      const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json() as any;

      res.json(data);
    } catch (error: any) {
      console.error("PayPal Capture Order Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Gemini Text-to-Speech
  app.post("/api/tts/generate", async (req, res) => {
    const { text, voice_description } = req.body;
    
    try {
      const { GoogleGenAI } = await import("@google/genai");
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Voice mapping based on generic descriptions or fallbacks
      let voiceName = 'Kore'; // Default female-ish
      if (['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(voice_description)) {
        voiceName = voice_description;
      } else {
        const lowerDesc = (voice_description || "").toLowerCase();
        if (lowerDesc.includes('masculin') || lowerDesc.includes('hombre') || lowerDesc.includes('male') || lowerDesc.includes('man') || lowerDesc.includes('charon')) {
          voiceName = 'Charon'; // Male-ish
        } else if (lowerDesc.includes('puck')) {
          voiceName = 'Puck';
        } else if (lowerDesc.includes('fenrir')) {
          voiceName = 'Fenrir';
        } else if (lowerDesc.includes('zephyr')) {
          voiceName = 'Zephyr';
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text || "Hola." }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName as any },
              },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
         throw new Error("No audio returned from Gemini");
      }

      res.json({ audio: base64Audio });

    } catch (error: any) {
      console.error("TTS Generation Error:", error);
      res.status(500).json({ error: "Failed to generate audio" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
