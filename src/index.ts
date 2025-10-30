/**
 * Unternehmensnachfolge-Berater
 * Backend API mit Cloudflare Workers
 * 
 * Endpunkte:
 * - GET / -> Fragebogen-Seite
 * - GET /chat -> Chatbot-Seite
 * - POST /api/analyse -> Analyse der Fragebogen-Daten
 * - POST /api/chatbot/next -> Nächste Chatbot-Frage
 * - POST /api/chatbot/finalize -> Finale Chatbot-Empfehlungen
 * - GET /api/statistiken -> Statistiken zur Unternehmensnachfolge
 */

import { Env, FragebogenDaten, ChatMessage, Analyse } from "./types";
import { generiereAnalyse, bestimmeSzenario } from "./analyse-engine";

// AI Model für Chatbot
const MODEL_ID = "@cf/mistral/mistral-7b-instruct-v0.1";

// Chatbot-Fragen
const CHATBOT_FRAGEN = [
  {
    frage: "Herzlich willkommen! Ich bin Ihr digitaler Berater für Unternehmensnachfolge. 'Emotional, aber planbar - Ihr Weg zur erfolgreichen Übergabe.' Lassen Sie uns gemeinsam Ihre individuelle Situation analysieren. Wie groß ist Ihr Unternehmen?",
    optionen: ["Klein (< 10 Mitarbeiter)", "Mittel (10-250 Mitarbeiter)", "Groß (> 250 Mitarbeiter)"],
    feld: "unternehmensgroesse",
    typ: "auswahl"
  },
  {
    frage: "Danke! In welcher Branche ist Ihr Unternehmen tätig?",
    optionen: ["Handwerk", "Produktion", "Handel", "Dienstleistung", "IT", "Andere"],
    feld: "branche",
    typ: "auswahl"
  },
  {
    frage: "Verstehe. Was ist der ungefähre Jahresumsatz Ihres Unternehmens?",
    optionen: ["Unter 500.000 €", "500.000 - 2 Mio. €", "2 - 10 Mio. €", "Über 10 Mio. €"],
    feld: "jahresumsatz",
    typ: "auswahl"
  },
  {
    frage: "Wie viele Mitarbeiter beschäftigt Ihr Unternehmen aktuell? (Bitte Zahl eingeben)",
    feld: "mitarbeiteranzahl",
    typ: "zahl"
  },
  {
    frage: "Ist Ihr Unternehmen ein Familienunternehmen?",
    optionen: ["Ja", "Nein"],
    feld: "familienunternehmen",
    typ: "auswahl"
  },
  {
    frage: "Haben Sie bereits einen Nachfolger im Blick?",
    optionen: ["Ja", "Nein", "Unklar"],
    feld: "nachfolgerVorhanden",
    typ: "auswahl"
  },
  {
    frage: "Um welche Art von Nachfolger handelt es sich?",
    optionen: ["Familie", "Mitarbeiter", "Extern"],
    feld: "nachfolgerTyp",
    typ: "auswahl",
    bedingung: (daten: any) => daten.nachfolgerVorhanden === "ja"
  },
  {
    frage: "In welchem Zeitrahmen planen Sie die Übergabe?",
    optionen: ["Unter 2 Jahre", "2-5 Jahre", "Über 5 Jahre"],
    feld: "zeitrahmen",
    typ: "auswahl"
  },
  {
    frage: "Wie alt sind Sie aktuell? (Bitte Zahl eingeben)",
    feld: "alterInhaber",
    typ: "zahl"
  },
  {
    frage: "Wie stark ist Ihre emotionale Bindung an das Unternehmen?",
    optionen: ["Sehr hoch", "Hoch", "Mittel", "Niedrig"],
    feld: "emotionaleBindung",
    typ: "auswahl"
  },
  {
    frage: "Wie hoch sind Ihre finanziellen Erwartungen an die Nachfolge?",
    optionen: ["Sehr hoch", "Hoch", "Mittel", "Niedrig"],
    feld: "finanzielleErwartungen",
    typ: "auswahl"
  }
];

/**
 * Worker Entry Point
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS Handler
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // API-Endpunkte
    if (url.pathname === "/api/analyse" && request.method === "POST") {
      return handleAnalyse(request);
    }

    if (url.pathname === "/api/chatbot/next" && request.method === "POST") {
      return handleChatbotNext(request);
    }

    if (url.pathname === "/api/chatbot/finalize" && request.method === "POST") {
      return handleChatbotFinalize(request);
    }

    if (url.pathname === "/api/statistiken" && request.method === "GET") {
      return handleStatistiken();
    }

    // Alte Chat-API für Kompatibilität
    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleLegacyChat(request, env);
    }

    // Static Assets
    return env.ASSETS.fetch(request);
  },
};

/**
 * POST /api/analyse - Analysiert Fragebogen-Daten
 */
async function handleAnalyse(request: Request): Promise<Response> {
  try {
    const daten = await request.json() as FragebogenDaten;
    
    // Validierung
    if (!daten.unternehmensgroesse || !daten.zeitrahmen) {
      return jsonResponse(
        { error: "Unvollständige Daten" },
        400
      );
    }

    // Analyse generieren
    const analyse = generiereAnalyse(daten);

    return jsonResponse(analyse);
  } catch (error) {
    console.error("Analyse-Fehler:", error);
    return jsonResponse(
      { error: "Analysefehler", details: String(error) },
      500
    );
  }
}

/**
 * POST /api/chatbot/next - Gibt nächste Chatbot-Frage zurück
 */
async function handleChatbotNext(request: Request): Promise<Response> {
  try {
    const { conversation } = await request.json() as { conversation: any[] };
    
    // Extrahiere bereits gesammelte Daten
    const collectedData: any = {};
    let stepIndex = 0;

    // Durchlaufe Konversation und sammle Antworten
    for (let i = 0; i < conversation.length; i++) {
      const msg = conversation[i];
      if (msg.role === "user" && stepIndex < CHATBOT_FRAGEN.length) {
        const frage = CHATBOT_FRAGEN[stepIndex];
        
        // Prüfe ob Frage eine Bedingung hat
        if (frage.bedingung && !frage.bedingung(collectedData)) {
          stepIndex++;
          continue;
        }

        // Parse Antwort
        const antwort = msg.content.trim();
        collectedData[frage.feld] = parseAntwort(antwort, frage);
        stepIndex++;
      }
    }

    // Finde nächste Frage
    while (stepIndex < CHATBOT_FRAGEN.length) {
      const naechsteFrage = CHATBOT_FRAGEN[stepIndex];
      
      // Prüfe Bedingung
      if (naechsteFrage.bedingung && !naechsteFrage.bedingung(collectedData)) {
        stepIndex++;
        continue;
      }

      return jsonResponse({
        frage: naechsteFrage.frage,
        optionen: naechsteFrage.optionen || null,
        typ: naechsteFrage.typ,
        fertig: false
      });
    }

    // Alle Fragen beantwortet
    return jsonResponse({
      fertig: true,
      message: "Vielen Dank! Ich erstelle jetzt Ihre individuelle Analyse..."
    });

  } catch (error) {
    console.error("Chatbot-Next-Fehler:", error);
    return jsonResponse(
      { error: "Fehler bei Chatbot-Verarbeitung", details: String(error) },
      500
    );
  }
}

/**
 * POST /api/chatbot/finalize - Erstellt finale Analyse aus Chatbot-Daten
 */
async function handleChatbotFinalize(request: Request): Promise<Response> {
  try {
    const { conversation } = await request.json() as { conversation: any[] };
    
    // Sammle alle Daten
    const collectedData: any = {};
    let stepIndex = 0;

    for (let i = 0; i < conversation.length; i++) {
      const msg = conversation[i];
      if (msg.role === "user" && stepIndex < CHATBOT_FRAGEN.length) {
        const frage = CHATBOT_FRAGEN[stepIndex];
        
        if (frage.bedingung && !frage.bedingung(collectedData)) {
          stepIndex++;
          continue;
        }

        const antwort = msg.content.trim();
        collectedData[frage.feld] = parseAntwort(antwort, frage);
        stepIndex++;
      }
    }

    // Validiere gesammelte Daten
    const fragebogenDaten = collectedData as FragebogenDaten;
    const analyse = generiereAnalyse(fragebogenDaten);

    return jsonResponse({
      success: true,
      analyse
    });

  } catch (error) {
    console.error("Chatbot-Finalize-Fehler:", error);
    return jsonResponse(
      { error: "Fehler bei Analyse-Erstellung", details: String(error) },
      500
    );
  }
}

/**
 * GET /api/statistiken - Gibt Statistiken zurück
 */
function handleStatistiken(): Response {
  const statistiken = {
    titel: "Unternehmensnachfolge in Deutschland - Fakten & Zahlen",
    beschreibung: "Aktuelle Statistiken und Daten zur Unternehmensnachfolge basierend auf IHK-Studien und Marktanalysen",
    fakten: [
      {
        label: "Senior-Unternehmer ohne Nachfolger",
        wert: "59%",
        beschreibung: "der Senior-Unternehmer finden keinen passenden Nachfolger"
      },
      {
        label: "Geplanter externer Verkauf",
        wert: "48%",
        beschreibung: "planen 2024 einen externen Verkauf (M&A)"
      },
      {
        label: "Familieninterne Übergabe",
        wert: "34%",
        beschreibung: "übergeben innerhalb der Familie"
      },
      {
        label: "Management-Buy-Out",
        wert: "19%",
        beschreibung: "übergeben an Mitarbeiter (MBO)"
      },
      {
        label: "Finanzierungsschwierigkeiten",
        wert: "48%",
        beschreibung: "der Nachfolger haben Finanzierungsschwierigkeiten"
      },
      {
        label: "Überzogene Kaufpreisvorstellungen",
        wert: "34%",
        beschreibung: "scheitern an unrealistischen Preisvorstellungen"
      },
      {
        label: "Unzureichend vorbereitet",
        wert: "36%",
        beschreibung: "klagen über unzureichend vorbereitete Nachfolger"
      },
      {
        label: "Anforderungen nicht erfüllt",
        wert: "23%",
        beschreibung: "scheitern, weil Anforderungen nicht erfüllt werden"
      }
    ],
    quellen: [
      "IHK-Studie Unternehmensnachfolge 2024",
      "DIHK Report zur Unternehmensnachfolge",
      "Marktanalyse deutscher Mittelstand"
    ]
  };

  return jsonResponse(statistiken);
}

/**
 * Legacy Chat-Handler (für alte chat.html)
 */
async function handleLegacyChat(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { messages?: any[] };
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return jsonResponse({ error: "Invalid request" }, 400);
    }

    const systemPrompt = `Du bist ein erfahrener Berater für Unternehmensnachfolge. 
Antworte IMMER auf Deutsch. Sei freundlich, professionell und hilfreich.`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await env.AI.run(MODEL_ID, { messages: aiMessages }) as any;
    
    let botResponse = "";
    if (typeof response === "string") {
      botResponse = response;
    } else if (response && typeof response === "object") {
      if ("response" in response) botResponse = String(response.response || "");
      else if ("text" in response) botResponse = String(response.text || "");
      else if ("result" in response) {
        const result = response.result as any;
        botResponse = String(result?.response || result || "");
      }
    }

    return jsonResponse({ response: botResponse || "Entschuldigung, keine Antwort generiert." });
  } catch (error) {
    console.error("Chat error:", error);
    return jsonResponse({ error: "Chat failed", details: String(error) }, 500);
  }
}

/**
 * Hilfsfunktion: Parse Antwort basierend auf Fragetyp
 */
function parseAntwort(antwort: string, frage: any): any {
  if (frage.typ === "zahl") {
    return parseInt(antwort);
  }

  if (frage.typ === "auswahl" && frage.optionen) {
    const lower = antwort.toLowerCase();
    
    // Mapping für unternehmensgroesse
    if (frage.feld === "unternehmensgroesse") {
      if (lower.includes("klein") || lower.includes("< 10")) return "klein";
      if (lower.includes("groß") || lower.includes("> 250")) return "gross";
      return "mittel";
    }

    // Mapping für branche
    if (frage.feld === "branche") {
      if (lower.includes("handwerk")) return "handwerk";
      if (lower.includes("produktion")) return "produktion";
      if (lower.includes("handel")) return "handel";
      if (lower.includes("dienstleistung")) return "dienstleistung";
      if (lower.includes("it")) return "it";
      return "andere";
    }

    // Mapping für jahresumsatz
    if (frage.feld === "jahresumsatz") {
      if (lower.includes("unter 500")) return "unter_500k";
      if (lower.includes("500") && lower.includes("2")) return "500k_2m";
      if (lower.includes("2") && lower.includes("10")) return "2m_10m";
      return "ueber_10m";
    }

    // Mapping für ja/nein
    if (frage.feld === "familienunternehmen") {
      return lower.includes("ja") ? "ja" : "nein";
    }

    // Mapping für nachfolgerVorhanden
    if (frage.feld === "nachfolgerVorhanden") {
      if (lower.includes("ja")) return "ja";
      if (lower.includes("nein")) return "nein";
      return "unklar";
    }

    // Mapping für nachfolgerTyp
    if (frage.feld === "nachfolgerTyp") {
      if (lower.includes("familie")) return "familie";
      if (lower.includes("mitarbeiter")) return "mitarbeiter";
      return "extern";
    }

    // Mapping für zeitrahmen
    if (frage.feld === "zeitrahmen") {
      if (lower.includes("unter 2") || lower.includes("< 2")) return "unter_2_jahre";
      if (lower.includes("2") && lower.includes("5")) return "2_5_jahre";
      return "ueber_5_jahre";
    }

    // Mapping für emotionaleBindung und finanzielleErwartungen
    if (frage.feld === "emotionaleBindung" || frage.feld === "finanzielleErwartungen") {
      if (lower.includes("sehr hoch") || lower.includes("sehr")) return "sehr_hoch";
      if (lower.includes("hoch")) return "hoch";
      if (lower.includes("niedrig")) return "niedrig";
      return "mittel";
    }
  }

  return antwort;
}

/**
 * Hilfsfunktion: JSON Response mit CORS
 */
function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
