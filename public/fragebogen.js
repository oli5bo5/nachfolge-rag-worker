/**
 * Fragebogen-Frontend für Unternehmensnachfolge-Berater
 */

let currentStep = 1;

// Event Listeners
document.getElementById('fragebogen-form').addEventListener('submit', handleSubmit);
document.getElementById('nachfolgerVorhanden').addEventListener('change', toggleNachfolgerTyp);

// Update progress bar
function updateProgress() {
  const progress = currentStep === 1 ? 50 : 100;
  document.getElementById('progress-bar').style.width = progress + '%';
  document.getElementById('progress-text').textContent = progress + '%';
}

// Next Step
function nextStep() {
  // Validate Step 1
  const form = document.getElementById('fragebogen-form');
  const step1Inputs = document.querySelectorAll('#step-1 input, #step-1 select');
  let valid = true;

  step1Inputs.forEach(input => {
    if (input.hasAttribute('required') && !input.value) {
      valid = false;
      input.classList.add('border-red-500');
    } else {
      input.classList.remove('border-red-500');
    }
  });

  if (!valid) {
    alert('Bitte füllen Sie alle Pflichtfelder aus.');
    return;
  }

  // Show Step 2
  document.getElementById('step-1').classList.add('hidden');
  document.getElementById('step-2').classList.remove('hidden');
  currentStep = 2;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Previous Step
function prevStep() {
  document.getElementById('step-2').classList.add('hidden');
  document.getElementById('step-1').classList.remove('hidden');
  currentStep = 1;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toggle Nachfolger-Typ visibility
function toggleNachfolgerTyp(e) {
  const container = document.getElementById('nachfolgerTyp-container');
  const select = document.querySelector('[name="nachfolgerTyp"]');
  
  if (e.target.value === 'ja') {
    container.classList.remove('hidden');
    select.setAttribute('required', 'required');
  } else {
    container.classList.add('hidden');
    select.removeAttribute('required');
    select.value = '';
  }
}

// Handle Form Submit
async function handleSubmit(e) {
  e.preventDefault();

  // Show loading
  document.getElementById('step-2').classList.add('hidden');
  document.getElementById('loading-section').classList.remove('hidden');

  // Collect form data
  const formData = new FormData(e.target);
  const data = {
    unternehmensgroesse: formData.get('unternehmensgroesse'),
    branche: formData.get('branche'),
    jahresumsatz: formData.get('jahresumsatz'),
    mitarbeiteranzahl: parseInt(formData.get('mitarbeiteranzahl')),
    familienunternehmen: formData.get('familienunternehmen'),
    nachfolgerVorhanden: formData.get('nachfolgerVorhanden'),
    nachfolgerTyp: formData.get('nachfolgerTyp') || undefined,
    zeitrahmen: formData.get('zeitrahmen'),
    alterInhaber: parseInt(formData.get('alterInhaber')),
    emotionaleBindung: formData.get('emotionaleBindung'),
    finanzielleErwartungen: formData.get('finanzielleErwartungen'),
  };

  try {
    // Send to API
    const response = await fetch('/api/analyse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Analyse-Fehler: ' + response.statusText);
    }

    const analyse = await response.json();

    // Display results
    displayResults(analyse);

    // Hide loading, show results
    document.getElementById('loading-section').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error) {
    console.error('Fehler:', error);
    alert('Es ist ein Fehler aufgetreten: ' + error.message);
    document.getElementById('loading-section').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
  }
}

// Display Results
function displayResults(analyse) {
  // Szenario mapping
  const szenarioTexte = {
    familienintern: {
      name: 'Familieninterne Nachfolge',
      beschreibung: 'Übergabe an ein Familienmitglied - mit allen emotionalen und rechtlichen Besonderheiten',
      icon: 'fa-home'
    },
    mbo: {
      name: 'Management-Buy-Out (MBO)',
      beschreibung: 'Verkauf an vertraute Mitarbeiter - Finanzierung und Übergangsbegleitung im Fokus',
      icon: 'fa-users'
    },
    externe_fuehrung: {
      name: 'Externe Geschäftsführung',
      beschreibung: 'Eigentum behalten, Führung abgeben - neue Perspektiven nutzen',
      icon: 'fa-user-tie'
    },
    verkauf: {
      name: 'Verkauf / M&A',
      beschreibung: 'Externer Verkauf an strategischen Käufer oder Investor - maximaler Wert und klarer Schnitt',
      icon: 'fa-handshake'
    }
  };

  const szenarioInfo = szenarioTexte[analyse.szenario];
  document.getElementById('szenario-beschreibung').innerHTML = `
    <i class="fas ${szenarioInfo.icon} mr-2"></i>${szenarioInfo.beschreibung}
  `;

  // Priorität badge
  const prioritaetColors = {
    HOCH: 'bg-red-500',
    MITTEL: 'bg-yellow-500',
    NIEDRIG: 'bg-green-500'
  };
  document.getElementById('prioritaet-badge').innerHTML = `
    <i class="fas fa-exclamation-circle mr-2"></i>Priorität: ${analyse.prioritaet}
  `;
  document.getElementById('prioritaet-badge').className = 
    `${prioritaetColors[analyse.prioritaet]} text-white px-4 py-2 rounded-lg font-semibold`;

  document.getElementById('szenario-badge').textContent = szenarioInfo.name;

  // Perspektiven
  fillList('perspektive-emotional', analyse.perspektiven.emotional);
  fillList('perspektive-rechtlich', analyse.perspektiven.rechtlich);
  fillList('perspektive-steuerlich', analyse.perspektiven.steuerlich);
  fillList('perspektive-organisatorisch', analyse.perspektiven.organisatorisch);

  // Nächste Schritte
  fillList('naechste-schritte', analyse.naechste_schritte, 'font-semibold text-orange-600');

  // Risiken & Chancen
  fillList('risiken-liste', analyse.risiken, 'text-red-700');
  fillList('chancen-liste', analyse.chancen, 'text-green-700');

  // Zeitplan
  fillList('zeitplan-0-2', analyse.zeitplan.phase_0_2_jahre);
  fillList('zeitplan-2-5', analyse.zeitplan.phase_2_5_jahre);
  fillList('zeitplan-5-plus', analyse.zeitplan.phase_5_plus_jahre);

  // Erfolgsfaktoren
  fillList('erfolgsfaktoren-liste', analyse.erfolgsfaktoren, 'text-gray-700');

  // Statistiken
  fillList('statistiken-liste', analyse.statistiken, 'text-xs');

  // Expertenzitate
  const zitateEl = document.getElementById('zitate-liste');
  zitateEl.innerHTML = '';
  analyse.expertenzitate.forEach(zitat => {
    const li = document.createElement('li');
    li.className = 'text-xs text-gray-600';
    li.innerHTML = `<i class="fas fa-quote-left mr-1 text-gray-400"></i>${zitat}`;
    zitateEl.appendChild(li);
  });
}

// Helper: Fill List
function fillList(elementId, items, extraClass = '') {
  const el = document.getElementById(elementId);
  el.innerHTML = '';
  
  if (!items || items.length === 0) {
    el.innerHTML = '<li class="text-gray-400">Keine Einträge</li>';
    return;
  }

  items.forEach(item => {
    const li = document.createElement('li');
    li.className = extraClass;
    li.innerHTML = `<i class="fas fa-check-circle text-green-500 mr-2"></i>${item}`;
    el.appendChild(li);
  });
}

// Neue Analyse starten
function neueAnalyse() {
  // Reset form
  document.getElementById('fragebogen-form').reset();
  document.getElementById('nachfolgerTyp-container').classList.add('hidden');
  
  // Show intro and step 1
  document.getElementById('results-section').classList.add('hidden');
  document.getElementById('intro-section').classList.remove('hidden');
  document.getElementById('step-1').classList.remove('hidden');
  currentStep = 1;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize
updateProgress();
