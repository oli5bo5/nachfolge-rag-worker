/**
 * Unternehmensnachfolge-Berater - Cloudflare Worker Bundle
 * Vollständige kombinierte Version für Quick Edit Deployment
 * 
 * "Emotional, aber planbar - Ihr Weg zur erfolgreichen Übergabe"
 */

// ==================== TYPES ====================

// (TypeScript types werden zur Laufzeit entfernt, aber die Struktur ist dokumentiert)

// ==================== ANALYSE ENGINE ====================

/**
 * Bestimmt das Nachfolge-Szenario basierend auf den Fragebogen-Daten
 */
function bestimmeSzenario(daten) {
  if (daten.nachfolgerVorhanden === "ja") {
    if (daten.nachfolgerTyp === "familie") {
      return "familienintern";
    } else if (daten.nachfolgerTyp === "mitarbeiter") {
      return "mbo";
    } else if (daten.nachfolgerTyp === "extern") {
      return "externe_fuehrung";
    }
  }
  return "verkauf";
}

/**
 * Bestimmt die Handlungspriorität
 */
function bestimmePrioritaet(zeitrahmen) {
  if (zeitrahmen === "unter_2_jahre") return "HOCH";
  if (zeitrahmen === "2_5_jahre") return "MITTEL";
  return "NIEDRIG";
}

/**
 * Generiert die vollständige Analyse
 */
function generiereAnalyse(daten) {
  const szenario = bestimmeSzenario(daten);
  const prioritaet = bestimmePrioritaet(daten.zeitrahmen);
  
  return {
    szenario,
    prioritaet,
    perspektiven: {
      emotional: getEmotionalePerspektive(szenario, daten),
      rechtlich: getRechtlichePerspektive(szenario, daten),
      steuerlich: getSteuerlichePerspektive(szenario, daten),
      organisatorisch: getOrganisatorischePerspektive(szenario, daten),
    },
    naechste_schritte: getNaechsteSchritte(szenario, daten),
    risiken: getRisiken(szenario, daten),
    chancen: getChancen(szenario, daten),
    zeitplan: getZeitplan(szenario, daten),
    erfolgsfaktoren: getErfolgsfaktoren(szenario),
    statistiken: getStatistiken(szenario),
    expertenzitate: getExpertenzitate(szenario),
  };
}

// Emotionale Perspektive
function getEmotionalePerspektive(szenario, daten) {
  const perspektiven = [];
  
  if (daten.emotionaleBindung === "sehr_hoch" || daten.emotionaleBindung === "hoch") {
    perspektiven.push("Das Loslassen vom eigenen Lebenswerk ist eine der größten emotionalen Herausforderungen. Nehmen Sie sich Zeit für diesen Prozess.");
    perspektiven.push("Ihre starke Bindung zum Unternehmen ist verständlich - planen Sie bewusst eine neue Lebensphase für sich selbst.");
  }
  
  switch (szenario) {
    case "familienintern":
      perspektiven.push("Familieninterne Übergaben sind emotional komplex: Es vermischen sich Rollen als Elternteil und Unternehmer.");
      perspektiven.push("'Es ist wie Familie - und das macht es nicht unbedingt leichter' - bereiten Sie sich auf mögliche Spannungen vor.");
      perspektiven.push("Geschwister-Themen: Falls mehrere Kinder vorhanden sind, beachten Sie emotionale und finanzielle Ausgleichsmechanismen.");
      perspektiven.push("Loslassen bedeutet auch, dem Nachfolger eigene Entscheidungen zuzutrauen - auch wenn Sie es anders gemacht hätten.");
      if (daten.alterInhaber >= 60) {
        perspektiven.push(`Mit ${daten.alterInhaber} Jahren ist es Zeit, die eigene Legacy zu definieren und den Generationenwechsel aktiv zu gestalten.`);
      }
      break;
      
    case "mbo":
      perspektiven.push("MBO bedeutet Vertrauen in langjährige Mitarbeiter - eine emotionale Belohnung für beide Seiten.");
      perspektiven.push("'Aus den eigenen Reihen: Vertrauen als Basis' - Sie kennen die Stärken und Schwächen Ihrer Nachfolger.");
      perspektiven.push("Der Abschied von der täglichen Führung kann erleichtert werden durch die Gewissheit, das Unternehmen in vertrauten Händen zu wissen.");
      perspektiven.push("Planen Sie eine klare Übergangsphase: Zu schnelles Loslassen kann genauso problematisch sein wie zu langes Festhalten.");
      break;
      
    case "externe_fuehrung":
      perspektiven.push("Externe Führung bedeutet: Sie behalten Eigentum, geben aber operative Kontrolle ab - ein emotionaler Balanceakt.");
      perspektiven.push("Vertrauen aufbauen mit einer Person, die Ihre Unternehmenskultur möglicherweise anders prägen wird.");
      perspektiven.push("Die Grenzen zwischen Unternehmen und Privatbereich verschieben sich - bereiten Sie sich auf eine neue Rolle als Gesellschafter vor.");
      perspektiven.push("'Frischer Wind von außen bringt neue Perspektiven' - seien Sie offen für Veränderungen, auch wenn diese zunächst ungewohnt sind.");
      break;
      
    case "verkauf":
      perspektiven.push("Ein Verkauf bedeutet endgültigen Abschied vom eigenen Lebenswerk - planen Sie bewusst die Zeit danach.");
      perspektiven.push("Emotionale Vorbereitung auf den Verlust der täglichen Routine und der Unternehmerfamilie (Mitarbeiter, Kunden, Partner).");
      perspektiven.push("Was kommt nach dem Verkauf? Definieren Sie Ihre neue Identität jenseits der Unternehmerrolle.");
      perspektiven.push("Bedenken Sie: Nach dem Verkauf haben Sie wenig bis keinen Einfluss mehr auf die Entwicklung des Unternehmens.");
      if (daten.emotionaleBindung === "sehr_hoch") {
        perspektiven.push("Ihre sehr hohe emotionale Bindung spricht für intensive Vorbereitung: Ggf. psychologische Begleitung in Betracht ziehen.");
      }
      break;
  }
  
  return perspektiven;
}

// Rechtliche Perspektive
function getRechtlichePerspektive(szenario, daten) {
  const perspektiven = [];
  
  perspektiven.push("'Gesellschaftsvertrag und Testament sollten immer aufeinander abgestimmt sein' - lassen Sie beides von einem Fachanwalt prüfen.");
  perspektiven.push("Notfallplan erstellen: Was passiert bei plötzlicher Arbeitsunfähigkeit oder Tod vor der geplanten Übergabe?");
  
  switch (szenario) {
    case "familienintern":
      perspektiven.push("Testament: Regelung der Unternehmensanteile vs. Pflichtteilsansprüche anderer Erben");
      perspektiven.push("Pflichtteilsverzicht durch Geschwister kann sinnvoll sein - erfordert aber notarielle Beurkundung und oft Abfindung");
      perspektiven.push("Gesellschaftsvertrag anpassen: Nachfolgeklauseln, Abfindungsregelungen, Beiratsstrukturen");
      perspektiven.push("Bei GmbH: Geschäftsführerbestellung und Vertretungsberechtigung schrittweise anpassen");
      perspektiven.push("Vorweggenommene Erbfolge: Schenkungsvertrag mit Nießbrauch- oder Wohnrechten prüfen");
      if (daten.familienunternehmen === "ja") {
        perspektiven.push("Familienunternehmen: Pool-Verträge oder Stimmrechtsbindungen können Zersplitterung verhindern");
      }
      break;
      
    case "mbo":
      perspektiven.push("Kaufvertrag: Asset Deal vs. Share Deal - rechtliche Unterschiede beachten (Haftung, Arbeitsverhältnisse, etc.)");
      perspektiven.push("Earn-Out-Klauseln: Kaufpreisanteile an zukünftige Unternehmensentwicklung koppeln - präzise Berechnungsgrundlagen definieren");
      perspektiven.push("Garantien und Gewährleistungen: Haftungsrisiken für Altlasten begrenzen (typischerweise 2-3 Jahre)");
      perspektiven.push("Verkäuferdarlehen: Rechtliche Absicherung durch Grundschuld, Bürgschaften oder Sicherungsübereignung");
      perspektiven.push("Wettbewerbsverbot: Geographischer und zeitlicher Umfang muss angemessen sein (typisch 2-3 Jahre)");
      perspektiven.push("Arbeitsverhältnisse: Betriebsübergang nach § 613a BGB - Mitarbeiter haben Widerspruchsrecht");
      break;
      
    case "externe_fuehrung":
      perspektiven.push("Geschäftsführervertrag: Aufgaben, Kompetenzen, Vergütung, Kündigungsfristen klar definieren");
      perspektiven.push("Governance-Struktur: Beirat oder Aufsichtsgremium zur Kontrolle der Geschäftsführung einrichten");
      perspektiven.push("Zielvereinbarungen: Messbare KPIs und Bonus-Regelungen vertraglich festlegen");
      perspektiven.push("Vertretungsberechtigung: Einzelvertretung oder Gesamtvertretung mit Ihnen als Gesellschafter?");
      perspektiven.push("D&O-Versicherung: Directors & Officers-Haftpflicht für Geschäftsführung abschließen");
      perspektiven.push("Wettbewerbsverbot und Abwerbeverbot während und nach der Amtszeit regeln");
      break;
      
    case "verkauf":
      perspektiven.push("Due Diligence vorbereiten: Alle rechtlichen Unterlagen systematisch aufbereiten (Verträge, Genehmigungen, Rechtsstreitigkeiten)");
      perspektiven.push("Letter of Intent (LOI): Absichtserklärung regelt Exklusivität, Vertraulichkeit und Rahmenbedingungen");
      perspektiven.push("Kaufvertrag: Asset Deal vs. Share Deal - steuerliche und haftungsrechtliche Unterschiede erheblich");
      perspektiven.push("Garantien: Typischerweise Garantien zu Jahresabschlüssen, Verträgen, Arbeitsverhältnissen, IP-Rechten");
      perspektiven.push("Haftungsfreistellung: Mac-Klausel (Material Adverse Change) schützt Käufer vor unvorhersehbaren Ereignissen");
      perspektiven.push("Kartellrecht: Bei Käufen ab bestimmten Umsatzschwellen Bundeskartellamt einschalten");
      if (daten.mitarbeiteranzahl >= 20) {
        perspektiven.push("Betriebsrat informieren: Bei Betriebsübergang Informationspflichten nach BetrVG beachten");
      }
      break;
  }
  
  return perspektiven;
}

// Steuerliche Perspektive  
function getSteuerlichePerspektive(szenario, daten) {
  const perspektiven = [];
  
  perspektiven.push("'Frühzeitige Planung kann Hunderttausende Euro sparen' - ziehen Sie einen spezialisierten Steuerberater hinzu.");
  
  switch (szenario) {
    case "familienintern":
      perspektiven.push("Freibeträge nutzen: 400.000 € pro Kind alle 10 Jahre steuerfrei - frühzeitig schrittweise übertragen!");
      perspektiven.push("'Freibeträge alle 10 Jahre nutzen - nicht erst beim Erbfall' - bereits mit 50-55 Jahren beginnen");
      perspektiven.push("Verschonungsregelungen: Bis zu 85-100% Steuerbefreiung bei Betriebsvermögen möglich (Voraussetzungen: Lohnsumme, Haltefrist)");
      perspektiven.push("Optionsverschonung vs. Regelverschonung: Je nach Unternehmensgröße unterschiedliche Vorteile");
      perspektiven.push("Betriebsaufspaltung vermeiden: Kann Verschonungsregelungen gefährden");
      perspektiven.push("Nießbrauchsvorbehalt: Anteile übertragen, aber Gewinnausschüttungen weiter erhalten - steuerlich komplex");
      if (daten.jahresumsatz === "ueber_10m") {
        perspektiven.push("Bei großen Unternehmen: Verwaltungsvermögen darf maximal 20% betragen für volle Verschonung");
      }
      break;
      
    case "mbo":
      perspektiven.push("Share Deal: Gewinn unterliegt Abgeltungssteuer (26,375% inkl. Soli) wenn Beteiligung < 1%");
      perspektiven.push("Bei Beteiligung ≥ 1%: Teileinkünfteverfahren (40% steuerfrei, 60% mit persönlichem Steuersatz)");
      perspektiven.push("Asset Deal: Einzelne Wirtschaftsgüter verkaufen - unterschiedliche steuerliche Behandlung je nach Gut");
      perspektiven.push("Freibetrag für Veräußerungsgewinne: 45.000 € einmalig nutzbar (§ 16 Abs. 4 EStG) - Voraussetzungen prüfen");
      perspektiven.push("Tarifbegünstigung nach § 34 EStG: Ermäßigter Steuersatz für außerordentliche Einkünfte möglich");
      perspektiven.push("Verkäuferdarlehen: Zinserträge unterliegen Abgeltungssteuer - ggf. Ratenzahlung steuerlich optimieren");
      perspektiven.push("Gewerbesteuer: Bei Asset Deal ggf. Gewerbesteuerpflicht - bei Share Deal idR nicht");
      break;
      
    case "externe_fuehrung":
      perspektiven.push("Geschäftsführergehalt: Angemessenheit prüfen - zu hohe Gehälter können verdeckte Gewinnausschüttung sein");
      perspektiven.push("Gewinnausschüttungen an Sie als Gesellschafter unterliegen Abgeltungssteuer (26,375%)");
      perspektiven.push("Wenn externe Führung scheitert und Verkauf folgt: Steuerliche Beratung zu Veräußerungsgewinn einholen");
      perspektiven.push("Pensionszusagen für Geschäftsführer steuerlich absetzbar - muss aber angemessen sein");
      perspektiven.push("Bei späterer Übertragung auf Geschäftsführer: Schenkung- oder Erbschaftsteuer beachten");
      break;
      
    case "verkauf":
      perspektiven.push("Unternehmensbewertung: Realistische Bewertung vermeidet steuerliche Probleme (verdeckte Gewinnausschüttung, Schenkung)");
      perspektiven.push("Share Deal: Meist steuerlich vorteilhafter für Verkäufer (Abgeltungssteuer oder Teileinkünfteverfahren)");
      perspektiven.push("Asset Deal: Meist von Käufer bevorzugt (AfA-Vorteile) - für Verkäufer oft steuerlich ungünstiger");
      perspektiven.push("§ 34 EStG Tarifbegünstigung: Bei Betriebsveräußerung kann ermäßigter Steuersatz von ca. 56% des regulären Satzes gelten");
      perspektiven.push("Freibetrag 45.000 € bei Veräußerung nutzen - allerdings nur wenn über 55 Jahre alt oder dauerhaft berufsunfähig");
      perspektiven.push("Sperrfrist beachten: Verkauf innerhalb von 10 Jahren nach Erwerb kann steuerpflichtig sein");
      perspektiven.push("Gewerbesteuer: Bei Betriebsaufgabe ggf. Gewerbesteuer auf stillen Reserven");
      if (daten.jahresumsatz === "ueber_10m") {
        perspektiven.push("Große Transaktion: Steuergestaltung durch Earn-Out, Kaufpreisaufteilung, oder Holding-Strukturen prüfen");
      }
      break;
  }
  
  return perspektiven;
}

// Organisatorische Perspektive
function getOrganisatorischePerspektive(szenario, daten) {
  const perspektiven = [];
  
  switch (szenario) {
    case "familienintern":
      perspektiven.push("Einarbeitungsphase: 2-5 Jahre gemeinsame Führung empfohlen - schrittweise Verantwortung übergeben");
      perspektiven.push("'Es geht uns ums Wollen' - Nachfolger muss intrinsisch motiviert sein, nicht nur aus Pflichtgefühl");
      perspektiven.push("Rollenklärung: Wann ziehen Sie sich aus operativem Geschäft zurück? Beiratsrolle definieren");
      perspektiven.push("Qualifizierung des Nachfolgers: Externe Ausbildung, Praktika in anderen Unternehmen, Mentoring");
      perspektiven.push("Mitarbeiter-Kommunikation: Transparente Kommunikation über Nachfolge verhindert Gerüchte und Verunsicherung");
      perspektiven.push("Kunden- und Lieferantenbeziehungen: Nachfolger frühzeitig in Netzwerk einbinden");
      if (daten.mitarbeiteranzahl > 50) {
        perspektiven.push("Bei größeren Unternehmen: Professionelle Managementstrukturen aufbauen, nicht alles vom Nachfolger abhängig machen");
      }
      break;
      
    case "mbo":
      perspektiven.push("Finanzierung klären: 48% der Nachfolger haben Finanzierungsschwierigkeiten - frühzeitig mit Banken sprechen");
      perspektiven.push("Finanzierungsmodelle: Eigenkapital + Bankdarlehen + Verkäuferdarlehen + ggf. Private Equity/Beteiligungsgesellschaften");
      perspektiven.push("Realistische Unternehmensbewertung: '34% scheitern an überzogenen Kaufpreisvorstellungen' - Bewertungsgutachten einholen");
      perspektiven.push("Bewertungsmethoden: Ertragswertverfahren, Multiplikatorverfahren (EBIT/EBITDA), oder DCF-Verfahren");
      perspektiven.push("Earn-Out vereinbaren: Teil des Kaufpreises abhängig von zukünftiger Performance - reduziert Finanzierungsbedarf");
      perspektiven.push("Übergangszeit: Sie bleiben 1-3 Jahre als Berater/Mentor - sichert Kontinuität und Finanzierung");
      perspektiven.push("Due Diligence: Auch bei internem Verkauf - Käufer (Bank) will vollständige Transparenz");
      if (daten.jahresumsatz === "unter_500k" || daten.jahresumsatz === "500k_2m") {
        perspektiven.push("Kleinere Unternehmen: Hausbank-Finanzierung oft ausreichend, ggf. KfW-Förderprogramme nutzen");
      }
      break;
      
    case "externe_fuehrung":
      perspektiven.push("Headhunter einschalten oder selbst suchen? Spezialisierte Personalberater kennen passende Kandidaten");
      perspektiven.push("Auswahlprozess: Mehrere Kandidaten, strukturierte Interviews, Assessment Center, Referenzen prüfen");
      perspektiven.push("Kulturelle Passung: Nicht nur fachliche Qualifikation, sondern auch Werte und Führungsstil beachten");
      perspektiven.push("Einarbeitungsphase 6-12 Monate: Sie begleiten intensiv, danach schrittweiser Rückzug");
      perspektiven.push("Führungsteam stärken: Externe Geschäftsführung braucht starkes Team - nicht alles auf eine Person setzen");
      perspektiven.push("Kontrollmechanismen: Regelmäßige Reportings, Budgetkontrolle, Zielvereinbarungen");
      perspektiven.push("Exit-Strategie: Was passiert, wenn es nicht funktioniert? Kündigungsfristen und Nachbesetzung planen");
      break;
      
    case "verkauf":
      perspektiven.push("'Ein guter Deal erfordert realistische Bewertung und gründliche Due Diligence'");
      perspektiven.push("M&A-Berater beauftragen: Professionelle Begleitung erhöht Verkaufspreis und Erfolgswahrscheinlichkeit");
      perspektiven.push("Unternehmensbewertung: Ertragswert, Multiplikatorverfahren (z.B. 4-8x EBIT je nach Branche), DCF");
      perspektiven.push("Unternehmensaufbereitung: 6-12 Monate vor Verkauf 'marktfähig' machen - Prozesse dokumentieren, Abhängigkeiten reduzieren");
      perspektiven.push("Abhängigkeit vom Inhaber reduzieren: Unternehmen muss ohne Sie funktionieren - sonst Bewertungsabschlag");
      perspektiven.push("Datenraum vorbereiten: Alle Unterlagen (Finanzen, Verträge, Personal, Rechte) digital aufbereitet");
      perspektiven.push("Käuferkreis definieren: Strategische Käufer (Wettbewerber, Kunden, Lieferanten) vs. Finanzinvestoren");
      perspektiven.push("Verkaufsprozess: 6-12 Monate einplanen - von erstem Kontakt bis Closing");
      perspektiven.push("Vertraulichkeit wahren: Zu frühe Information kann Mitarbeiter verunsichern und Kunden abschrecken");
      if (daten.jahresumsatz === "ueber_10m") {
        perspektiven.push("Größeres Unternehmen: Strukturierter Bieterverfahren kann Kaufpreis optimieren");
      }
      break;
  }
  
  return perspektiven;
}

// Weitere Hilfsfunktionen (getNaechsteSchritte, getRisiken, getChancen, etc.)
// Aus Platzgründen gekürzt - vollständiger Code wird separat bereitgestellt

function getNaechsteSchritte(szenario, daten) {
  const schritte = [];
  
  if (daten.zeitrahmen === "unter_2_jahre") {
    schritte.push("⚠️ DRINGEND: Bei Zeitrahmen unter 2 Jahren sofort handeln!");
  }
  
  switch (szenario) {
    case "familienintern":
      schritte.push("1. Familienrat einberufen: Offenes Gespräch mit allen potenziell Betroffenen");
      schritte.push("2. Fachanwalt für Gesellschaftsrecht kontaktieren: Testament und Gesellschaftsvertrag prüfen");
      schritte.push("3. Steuerberater mit Schwerpunkt Nachfolge beauftragen: Freibeträge und Verschonungsoptionen analysieren");
      schritte.push("4. Einarbeitungsplan erstellen: Wie und wann übernimmt der Nachfolger welche Verantwortung?");
      schritte.push("5. Notfallplan aufsetzen: Was passiert bei ungeplanten Ereignissen?");
      break;
      
    case "mbo":
      schritte.push("1. Gespräch mit potenziellen Nachfolgern: Interesse und Motivation klären");
      schritte.push("2. Unternehmensbewertung durchführen: Realistischen Kaufpreis ermitteln");
      schritte.push("3. Finanzierungsgespräche: Banken ansprechen, KfW-Programme prüfen");
      schritte.push("4. Rechtsanwalt und Steuerberater hinzuziehen: Kaufvertrag und Struktur (Asset/Share Deal) klären");
      schritte.push("5. Due Diligence vorbereiten: Alle Unterlagen aufbereiten");
      schritte.push("6. Earn-Out-Modell entwickeln: Kaufpreis an zukünftige Entwicklung koppeln");
      break;
      
    case "externe_fuehrung":
      schritte.push("1. Anforderungsprofil erstellen: Welche Qualifikationen und Erfahrungen sind nötig?");
      schritte.push("2. Headhunter kontaktieren oder selbst Kandidaten suchen");
      schritte.push("3. Auswahlverfahren planen: Interviews, Tests, Referenzen");
      schritte.push("4. Geschäftsführervertrag entwerfen: Rechtsanwalt hinzuziehen");
      schritte.push("5. Governance-Struktur aufbauen: Beirat oder Aufsichtsgremium");
      schritte.push("6. Einarbeitungsplan entwickeln: Wie erfolgt die Übergabe?");
      break;
      
    case "verkauf":
      schritte.push("1. M&A-Berater/Unternehmensberater beauftragen: Verkaufsprozess professionell begleiten");
      schritte.push("2. Unternehmensbewertung durchführen: Realistische Preisvorstellung entwickeln");
      schritte.push("3. Unternehmensaufbereitung: Abhängigkeiten reduzieren, Prozesse dokumentieren");
      schritte.push("4. Datenraum vorbereiten: Alle Unterlagen systematisch aufbereiten");
      schritte.push("5. Käuferkreis definieren: Strategische Käufer vs. Finanzinvestoren");
      schritte.push("6. Steuerberater hinzuziehen: Optimale Verkaufsstruktur planen");
      schritte.push("7. Vertraulichkeitsvereinbarungen vorbereiten: Schutz sensibler Informationen");
      break;
  }
  
  return schritte;
}

function getRisiken(szenario, daten) {
  const risiken = [];
  
  switch (szenario) {
    case "familienintern":
      risiken.push("Familienkonflikte: Geschwisterstreit über Bewertung und Ausgleichszahlungen");
      risiken.push("Unzureichende Qualifikation des Nachfolgers: 36% klagen über unzureichend vorbereitete Nachfolger");
      risiken.push("Fehlende intrinsische Motivation: Nachfolger fühlt sich verpflichtet statt begeistert");
      risiken.push("Zu langes Festhalten: Sie mischen sich weiter ein und blockieren Entwicklung");
      risiken.push("Steuerliche Fehler: Freibeträge nicht optimal genutzt, Verschonungsvoraussetzungen nicht erfüllt");
      break;
      
    case "mbo":
      risiken.push("Finanzierung scheitert: 48% der Nachfolger haben Finanzierungsschwierigkeiten");
      risiken.push("Überhöhte Kaufpreisvorstellungen: 34% scheitern an unrealistischen Preisvorstellungen");
      risiken.push("Nachfolger überfordert: Fachliche Kompetenz vorhanden, aber unternehmerische Fähigkeiten fehlen");
      risiken.push("Earn-Out-Konflikte: Unklare Berechnungsgrundlagen führen zu Streit");
      risiken.push("Bankenkrise: Externe Schocks können Finanzierung gefährden");
      break;
      
    case "externe_fuehrung":
      risiken.push("Kulturelle Passung fehlt: Externe Führung verändert Unternehmenskultur negativ");
      risiken.push("Fehlende Identifikation: Externe Führung hat kein 'Eigentümer-Mindset'");
      risiken.push("Abwanderung: Externe Führung nutzt Position als Sprungbrett");
      risiken.push("Kontrollverlust: Sie bekommen kritische Entwicklungen zu spät mit");
      risiken.push("Strategie-Konflikte: Unterschiedliche Vorstellungen über Unternehmensentwicklung");
      break;
      
    case "verkauf":
      risiken.push("Käufer nicht gefunden: 59% der Senior-Unternehmer finden keinen passenden Nachfolger");
      risiken.push("Kaufpreis zu niedrig: Uninformierte Verkäufer akzeptieren schlechte Angebote");
      risiken.push("Due Diligence deckt Probleme auf: Unerwartete Altlasten mindern Kaufpreis oder lassen Deal platzen");
      risiken.push("Garantieansprüche: Nach Verkauf Haftung für nicht offenbarte Mängel");
      risiken.push("Zerschlagung: Käufer zerlegt Unternehmen und verkauft Teile - Mitarbeiter verlieren Jobs");
      risiken.push("Emotionale Krise nach Verkauf: 'Post-Sale-Depression' - Leere nach Lebenswerk-Verkauf");
      break;
  }
  
  return risiken;
}

function getChancen(szenario, daten) {
  const chancen = [];
  
  switch (szenario) {
    case "familienintern":
      chancen.push("Kontinuität: Werte, Kultur und Beziehungen bleiben erhalten");
      chancen.push("Vertrauen: Sie kennen Stärken und Schwächen des Nachfolgers");
      chancen.push("Steuervorteile: Freibeträge und Verschonungsregelungen optimal nutzbar");
      chancen.push("Legacy: Ihr Lebenswerk bleibt in der Familie und wird weitergeführt");
      chancen.push("Flexibilität: Übergabe kann individuell und schrittweise gestaltet werden");
      break;
      
    case "mbo":
      chancen.push("Vertraute Gesichter: Mitarbeiter kennen Unternehmen und Kultur");
      chancen.push("Mitarbeitermotivation: Team bleibt motiviert unter bekannter Führung");
      chancen.push("Kontinuität für Kunden: Keine Verunsicherung durch externe Übernahme");
      chancen.push("Finanzielle Absicherung: Sie erhalten Kaufpreis und ggf. Earn-Out");
      chancen.push("Begleitende Rolle: Sie können als Berater/Mentor noch mitwirken");
      break;
      
    case "externe_fuehrung":
      chancen.push("Frische Perspektiven: Externe bringen neue Ideen und Netzwerke");
      chancen.push("Professionalisierung: Moderne Managementmethoden werden eingeführt");
      chancen.push("Eigentum behalten: Sie bleiben Gesellschafter und profitieren von Wertsteigerung");
      chancen.push("Entlastung: Operative Last wird abgegeben, Sie konzentrieren sich auf Strategie");
      chancen.push("Flexibilität: Bei Misserfolg können Sie Führung wechseln");
      break;
      
    case "verkauf":
      chancen.push("Finanzielle Unabhängigkeit: Einmaliger Geldzufluss sichert Ruhestand");
      chancen.push("Neue Lebensphase: Zeit für Familie, Hobbys, neue Projekte");
      chancen.push("Unternehmen kann wachsen: Käufer bringt Ressourcen und Netzwerk");
      chancen.push("Klarer Schnitt: Keine emotionalen Verstrickungen mehr");
      chancen.push("Mitarbeiter-Perspektiven: Größerer Konzern kann bessere Entwicklungsmöglichkeiten bieten");
      if (daten.jahresumsatz === "ueber_10m") {
        chancen.push("Hohe Bewertung: Große Unternehmen erzielen attraktive Multiplikatoren");
      }
      break;
  }
  
  return chancen;
}

function getZeitplan(szenario, daten) {
  // Vereinfachte Zeitplan-Funktion - vollständig in TypeScript-Version
  return {
    phase_0_2_jahre: ["Erste Schritte einleiten", "Berater kontaktieren", "Planung konkretisieren"],
    phase_2_5_jahre: ["Umsetzung vorantreiben", "Strukturen anpassen", "Übergabe vorbereiten"],
    phase_5_plus_jahre: ["Nachfolge vollziehen", "Neue Rolle etablieren", "Legacy sichern"]
  };
}

function getErfolgsfaktoren(szenario) {
  return [
    "Frühzeitig beginnen: 5-10 Jahre Vorlauf sind ideal",
    "Professionelle Beratung: Fachanwalt, Steuerberater, ggf. M&A-Berater",
    "Offene Kommunikation: Mit Familie, Mitarbeitern, Kunden",
    "Emotionale Vorbereitung: Eigene neue Lebensphase planen",
    "Notfallplan: Was passiert bei ungeplanten Ereignissen?"
  ];
}

function getStatistiken(szenario) {
  return [
    "59% der Senior-Unternehmer finden keinen passenden Nachfolger (IHK-Studie 2024)",
    "48% planen 2024 einen externen Verkauf (M&A)",
    "34% übergeben innerhalb der Familie",
    "19% übergeben an Mitarbeiter (Management-Buy-Out)"
  ];
}

function getExpertenzitate(szenario) {
  return [
    "'Die Grenzen zwischen Unternehmen und Privatbereich verschieben sich' - M&A-Berater",
    "'Gesellschaftsvertrag und Testament sollten immer aufeinander abgestimmt sein' - Fachanwalt",
    "'Frühzeitige Planung kann Hunderttausende Euro sparen' - Steuerberater"
  ];
}

// ==================== MAIN WORKER ====================

const MODEL_ID = "@cf/mistral/mistral-7b-instruct-v0.1";

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
    bedingung: (daten) => daten.nachfolgerVorhanden === "ja"
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // API Endpunkte
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

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleLegacyChat(request, env);
    }

    // Static Assets
    return env.ASSETS.fetch(request);
  },
};

async function handleAnalyse(request) {
  try {
    const daten = await request.json();
    
    if (!daten.unternehmensgroesse || !daten.zeitrahmen) {
      return jsonResponse({ error: "Unvollständige Daten" }, 400);
    }

    const analyse = generiereAnalyse(daten);
    return jsonResponse(analyse);
  } catch (error) {
    console.error("Analyse-Fehler:", error);
    return jsonResponse({ error: "Analysefehler", details: String(error) }, 500);
  }
}

async function handleChatbotNext(request) {
  try {
    const { conversation } = await request.json();
    const collectedData = {};
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

    while (stepIndex < CHATBOT_FRAGEN.length) {
      const naechsteFrage = CHATBOT_FRAGEN[stepIndex];
      
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

    return jsonResponse({
      fertig: true,
      message: "Vielen Dank! Ich erstelle jetzt Ihre individuelle Analyse..."
    });

  } catch (error) {
    console.error("Chatbot-Next-Fehler:", error);
    return jsonResponse({ error: "Fehler bei Chatbot-Verarbeitung", details: String(error) }, 500);
  }
}

async function handleChatbotFinalize(request) {
  try {
    const { conversation } = await request.json();
    const collectedData = {};
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

    const analyse = generiereAnalyse(collectedData);

    return jsonResponse({
      success: true,
      analyse
    });

  } catch (error) {
    console.error("Chatbot-Finalize-Fehler:", error);
    return jsonResponse({ error: "Fehler bei Analyse-Erstellung", details: String(error) }, 500);
  }
}

function handleStatistiken() {
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

async function handleLegacyChat(request, env) {
  try {
    const body = await request.json();
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

    const response = await env.AI.run(MODEL_ID, { messages: aiMessages });
    
    let botResponse = "";
    if (typeof response === "string") {
      botResponse = response;
    } else if (response && typeof response === "object") {
      if ("response" in response) botResponse = String(response.response || "");
      else if ("text" in response) botResponse = String(response.text || "");
      else if ("result" in response) {
        const result = response.result;
        botResponse = String(result?.response || result || "");
      }
    }

    return jsonResponse({ response: botResponse || "Entschuldigung, keine Antwort generiert." });
  } catch (error) {
    console.error("Chat error:", error);
    return jsonResponse({ error: "Chat failed", details: String(error) }, 500);
  }
}

function parseAntwort(antwort, frage) {
  if (frage.typ === "zahl") {
    return parseInt(antwort);
  }

  if (frage.typ === "auswahl" && frage.optionen) {
    const lower = antwort.toLowerCase();
    
    if (frage.feld === "unternehmensgroesse") {
      if (lower.includes("klein") || lower.includes("< 10")) return "klein";
      if (lower.includes("groß") || lower.includes("> 250")) return "gross";
      return "mittel";
    }

    if (frage.feld === "branche") {
      if (lower.includes("handwerk")) return "handwerk";
      if (lower.includes("produktion")) return "produktion";
      if (lower.includes("handel")) return "handel";
      if (lower.includes("dienstleistung")) return "dienstleistung";
      if (lower.includes("it")) return "it";
      return "andere";
    }

    if (frage.feld === "jahresumsatz") {
      if (lower.includes("unter 500")) return "unter_500k";
      if (lower.includes("500") && lower.includes("2")) return "500k_2m";
      if (lower.includes("2") && lower.includes("10")) return "2m_10m";
      return "ueber_10m";
    }

    if (frage.feld === "familienunternehmen") {
      return lower.includes("ja") ? "ja" : "nein";
    }

    if (frage.feld === "nachfolgerVorhanden") {
      if (lower.includes("ja")) return "ja";
      if (lower.includes("nein")) return "nein";
      return "unklar";
    }

    if (frage.feld === "nachfolgerTyp") {
      if (lower.includes("familie")) return "familie";
      if (lower.includes("mitarbeiter")) return "mitarbeiter";
      return "extern";
    }

    if (frage.feld === "zeitrahmen") {
      if (lower.includes("unter 2") || lower.includes("< 2")) return "unter_2_jahre";
      if (lower.includes("2") && lower.includes("5")) return "2_5_jahre";
      return "ueber_5_jahre";
    }

    if (frage.feld === "emotionaleBindung" || frage.feld === "finanzielleErwartungen") {
      if (lower.includes("sehr hoch") || lower.includes("sehr")) return "sehr_hoch";
      if (lower.includes("hoch")) return "hoch";
      if (lower.includes("niedrig")) return "niedrig";
      return "mittel";
    }
  }

  return antwort;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
