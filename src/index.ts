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
  "Guten Tag! Ich begleite seit über 25 Jahren Unternehmer durch den Prozess der Nachfolge. Die Unternehmensnachfolge ist weit mehr als nur ein Eigentümerwechsel – sie berührt das Lebenswerk, die Verantwortung für Mitarbeiter und Familie und Ihre persönliche Zukunft. Lassen Sie uns gemeinsam herausfinden, welcher Weg für Sie passt. Zunächst: Wie heißen Sie?",
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

// ... restlicher Code unverändert ...
