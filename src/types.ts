/**
 * Type definitions for Unternehmensnachfolge-Berater
 */

export interface Env {
  /**
   * Binding for the Workers AI API.
   */
  AI: Ai;

  /**
   * Binding for static assets.
   */
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

/**
 * Represents a chat message.
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Fragebogen-Daten für die Unternehmensanalyse
 */
export interface FragebogenDaten {
  // Schritt 1: Unternehmensdaten
  unternehmensgroesse: "klein" | "mittel" | "gross";
  branche: "handwerk" | "produktion" | "handel" | "dienstleistung" | "it" | "andere";
  jahresumsatz: "unter_500k" | "500k_2m" | "2m_10m" | "ueber_10m";
  mitarbeiteranzahl: number;
  familienunternehmen: "ja" | "nein";
  
  // Schritt 2: Nachfolgeplanung
  nachfolgerVorhanden: "ja" | "nein" | "unklar";
  nachfolgerTyp?: "familie" | "mitarbeiter" | "extern";
  zeitrahmen: "unter_2_jahre" | "2_5_jahre" | "ueber_5_jahre";
  alterInhaber: number;
  emotionaleBindung: "sehr_hoch" | "hoch" | "mittel" | "niedrig";
  finanzielleErwartungen: "sehr_hoch" | "hoch" | "mittel" | "niedrig";
}

/**
 * Nachfolge-Szenario
 */
export type NachfolgeSzenario = 
  | "familienintern" 
  | "mbo" 
  | "externe_fuehrung" 
  | "verkauf";

/**
 * Analyse-Ergebnis mit Empfehlungen
 */
export interface Analyse {
  szenario: NachfolgeSzenario;
  prioritaet: "HOCH" | "MITTEL" | "NIEDRIG";
  perspektiven: {
    emotional: string[];
    rechtlich: string[];
    steuerlich: string[];
    organisatorisch: string[];
  };
  naechste_schritte: string[];
  risiken: string[];
  chancen: string[];
  zeitplan: {
    phase_0_2_jahre: string[];
    phase_2_5_jahre: string[];
    phase_5_plus_jahre: string[];
  };
  erfolgsfaktoren: string[];
  statistiken: string[];
  expertenzitate: string[];
}

/**
 * Chatbot-Konversation
 */
export interface ChatbotKonversation {
  messages: ChatMessage[];
  collectedData: Partial<FragebogenDaten>;
  currentStep: number;
}

/**
 * Statistiken zur Unternehmensnachfolge
 */
export interface Statistiken {
  titel: string;
  beschreibung: string;
  fakten: {
    label: string;
    wert: string;
    beschreibung: string;
  }[];
  quellen: string[];
}
