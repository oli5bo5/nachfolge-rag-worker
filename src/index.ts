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
const MODEL_ID = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

// Strukturierter Fragenkatalog für die Nachfolge-Beratung
const QUESTIONS = [
  "Willkommen! Ich bin Ihr Berater für Unternehmensnachfolge. Wie heißen Sie?",
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
const SYSTEM_PROMPT = `Du bist ein professioneller Berater für Unternehmensnachfolge in Deutschland. 
Deine Aufgabe ist es, Nutzer durch ein strukturiertes Beratungsgespräch zu führen.

Wichtige Regeln:
1. Antworte IMMER auf Deutsch
2. Sei freundlich, professionell und einfühlsam
3. Gehe auf die Antworten des Nutzers ein und zeige Verständnis
4. Halte deine Antworten prägnant (2-3 Sätze)
5. Bestätige die Antwort des Nutzers kurz, bevor du die nächste Frage stellst
6. Bei der letzten Frage: Fasse die wichtigsten Punkte zusammen und biete weitere Unterstützung an

Format deiner Antworten:
- Kurze Bestätigung/Kommentar zur Nutzerantwort
- Die nächste Frage aus dem Fragenkatalog

Beispiel: "Vielen Dank für diese Information. Das klingt nach einem etablierten Unternehmen. [Nächste Frage]"`;

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Statische Assets (Frontend)
    if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    // API Routes
    if (url.pathname === "/api/chat") {
      if (request.method === "POST") {
        return handleChatRequest(request, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/questions") {
      return new Response(JSON.stringify({ questions: QUESTIONS }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        },
      });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

/**
 * Verarbeitet Chat-Anfragen mit strukturiertem Frage-Antwort-Format
 */
async function handleChatRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  try {
    const { messages = [], currentQuestionIndex = 0 } = (await request.json()) as {
      messages: ChatMessage[];
      currentQuestionIndex: number;
    };

    // Bestimme die aktuelle Frage
    const currentQuestion = QUESTIONS[currentQuestionIndex] || QUESTIONS[QUESTIONS.length - 1];
    
    // Baue den Kontext für den AI-Assistenten auf
    const aiMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: `Aktuelle Frage (${currentQuestionIndex + 1}/${QUESTIONS.length}): ${currentQuestion}` },
      ...messages,
    ];

    // Wenn es die erste Nachricht ist, sende nur die erste Frage
    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ 
          response: QUESTIONS[0],
          questionIndex: 0,
          totalQuestions: QUESTIONS.length 
        }),
        {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          },
        }
      );
    }

    // Rufe Workers AI auf
    const aiResponse = await env.AI.run(
      MODEL_ID,
      {
        messages: aiMessages,
        max_tokens: 512,
        temperature: 0.7,
      }
    );

    let responseText = "";
    
    // Extrahiere die Antwort
    if (typeof aiResponse === "object" && aiResponse !== null) {
      if ("response" in aiResponse) {
        responseText = String(aiResponse.response);
      } else if ("result" in aiResponse && typeof aiResponse.result === "object") {
        const result = aiResponse.result as any;
        if ("response" in result) {
          responseText = String(result.response);
        }
      }
    } else if (typeof aiResponse === "string") {
      responseText = aiResponse;
    }

    // Füge die nächste Frage hinzu, falls noch nicht am Ende
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < QUESTIONS.length && !responseText.includes(QUESTIONS[nextQuestionIndex])) {
      responseText += "\n\n" + QUESTIONS[nextQuestionIndex];
    }

    return new Response(
      JSON.stringify({ 
        response: responseText,
        questionIndex: nextQuestionIndex,
        totalQuestions: QUESTIONS.length,
        isComplete: nextQuestionIndex >= QUESTIONS.length
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        },
      }
    );

  } catch (error) {
    console.error("Fehler bei der Verarbeitung der Chat-Anfrage:", error);
    return new Response(
      JSON.stringify({ 
        error: "Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es erneut." 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        },
      }
    );
  }
}
