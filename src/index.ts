/**
 * Frage-für-Frage Chatbot für Nachfolge-Beratung
 * 
 * Ein strukturierter Chatbot, der Nutzer schrittweise durch ein Beratungsgespräch führt.
 * Nutzt Cloudflare Workers AI für intelligente, kontextbezogene Antworten auf Deutsch.
 * 
 * @license MIT
 */
import { Env, ChatMessage } from "./types";

// Model ID für Workers AI
const MODEL_ID = "@cf/mistral/mistral-7b-instruct-v0.1";

// Strukturierter Fragenkatalog für die Nachfolge-Beratung
const QUESTIONS = [
  "Herzlich willkommen! Ich bin Ihr digitaler Nachfolge-Berater. Um Sie besser zu unterstützen, erzählen Sie mir bitte etwas über Ihr Unternehmen. Was bewegt Sie aktuell bezüglich Ihrer Nachfolge? Was ist Ihr größtes Ziel dabei?",
  "Schön, Sie kennenzulernen! Welche Art von Unternehmen führen Sie?",
  "Wie viele Mitarbeiter beschäftigt Ihr Unternehmen aktuell?",
  "In welcher Branche ist Ihr Unternehmen tätig?",
  "Seit wann besteht Ihr Unternehmen?",
  "Was ist Ihr Hauptgrund für die Überlegung zur Nachfolgeplanung?",
  "Haben Sie bereits potenzielle Nachfolger im Blick (Familie, Mitarbeiter, externe Käufer)?",
  "Welcher Zeitrahmen schwebt Ihnen für die Übergabe vor?",
  "Was sind Ihre wichtigsten Ziele für die Nachfolge (finanzielle Absicherung, Fortbestand des Unternehmens, etc.)?",
  "Vielen Dank für Ihre Antworten! Möchten Sie noch etwas hinzufügen oder haben Sie Fragen?"
];

// System-Prompt für den AI-Assistenten
const SYSTEM_PROMPT = `Du bist ein erfahrener Berater für Unternehmensnachfolge mit über 25 Jahren Praxiserfahrung.
Du sprichst mit der Ruhe und Klarheit eines Experten um die 50, der bereits viele Übergaben begleitet hat.
Dein Ton ist warm, vertrauenswürdig und persönlich – du stellst nicht nur Fragen, sondern ordnest kurz ein und nimmst die Sorgen und Hoffnungen deines Gegenübers wahr.

Wichtige Regeln:
1. Antworte IMMER auf Deutsch.
2. Sei freundlich, vertrauensvoll und authentisch.
3. Hebe die Komplexität und Bedeutung der Nachfolge bei Bedarf kurz hervor (Lebenswerk, Verantwortung für Mitarbeitende, Familie, Zukunftssicherung).
4. Gehe auf die Antworten des Nutzers ein, spiegle Kernpunkte und leite zur nächsten Frage über.
5. Halte Antworten prägnant (2–4 Sätze) und substanziell.
6. Nutze gelegentlich anschauliche, kurze Praxisbeispiele ohne abzuschweifen.
`;

/**
 * Haupthandler für Chat-Anfragen
 */
async function handleChatRequest(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const { messages } = (await request.json()) as {
      messages: ChatMessage[];
    };

    // Finde die aktuelle Fragenummer basierend auf dem Chat-Verlauf
    const questionIndex = Math.min(
      messages.filter((m) => m.role === "user").length,
      QUESTIONS.length - 1
    );
    const currentQuestion = QUESTIONS[questionIndex];

    // Bereite Nachrichten für das AI-Modell vor
    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
      {
        role: "system",
        content: `Die nächste Frage lautet: "${currentQuestion}". Beantworte die letzte Nachricht des Nutzers empathisch und stelle dann die nächste Frage.`,
      },
    ];

    // Rufe Workers AI auf mit Streaming aktiviert
    const response = await env.AI.run(MODEL_ID, {
      messages: aiMessages,
      stream: true,
    });

    return new Response(response, {
      headers: {
        "Content-Type": "text/event-stream",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat request error:", error);
    return new Response(
      JSON.stringify({ error: "Chat request failed", details: String(error) }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

/**
 * Worker Entry Point
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // API Endpoint: /api/chat
    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChatRequest(request, env);
    }

    // Serve static files from /public
    const assetResponse = await env.ASSETS.fetch(request);
    return assetResponse;
  },
};
