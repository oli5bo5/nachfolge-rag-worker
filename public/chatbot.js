/**
 * Chatbot-Frontend für Unternehmensnachfolge-Berater
 */

let conversation = [];
let isProcessing = false;

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const optionsContainer = document.getElementById('options-container');
const optionsList = document.getElementById('options-list');
const inputContainer = document.getElementById('input-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Event Listeners
sendButton.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
});

// Initialize Chat
async function initChat() {
  // Add welcome message
  const welcomeMessage = {
    role: 'assistant',
    content: `Herzlich willkommen! Ich bin Ihr digitaler Berater für Unternehmensnachfolge. 
    
"Emotional, aber planbar - Ihr Weg zur erfolgreichen Übergabe"

Ich werde Sie Schritt für Schritt durch eine Analyse Ihrer individuellen Situation führen. Am Ende erhalten Sie konkrete Empfehlungen aus vier Perspektiven: emotional, rechtlich, steuerlich und organisatorisch.

Lassen Sie uns beginnen! 🚀`
  };
  
  addMessage(welcomeMessage);
  conversation.push(welcomeMessage);

  // Request first question
  await getNextQuestion();
}

// Add Message to Chat
function addMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`;
  
  const bubble = document.createElement('div');
  bubble.className = `max-w-[80%] px-4 py-3 rounded-lg ${
    message.role === 'user'
      ? 'bg-orange-500 text-white'
      : 'bg-gray-200 text-gray-800'
  }`;
  
  // Format message with line breaks
  const formattedContent = message.content.replace(/\n/g, '<br>');
  bubble.innerHTML = formattedContent;
  
  messageDiv.appendChild(bubble);
  chatMessages.appendChild(messageDiv);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show Typing Indicator
function showTyping() {
  typingIndicator.classList.remove('hidden');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide Typing Indicator
function hideTyping() {
  typingIndicator.classList.add('hidden');
}

// Get Next Question from API
async function getNextQuestion() {
  showTyping();
  
  try {
    const response = await fetch('/api/chatbot/next', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation })
    });

    if (!response.ok) {
      throw new Error('API-Fehler: ' + response.statusText);
    }

    const data = await response.json();
    hideTyping();

    if (data.fertig) {
      // All questions answered, finalize
      await finalizeAnalyse();
    } else {
      // Show question
      const questionMessage = {
        role: 'assistant',
        content: data.frage
      };
      addMessage(questionMessage);
      conversation.push(questionMessage);

      // Show input method
      if (data.optionen && data.optionen.length > 0) {
        showOptions(data.optionen);
      } else {
        showInput(data.typ === 'zahl' ? 'number' : 'text');
      }
    }
  } catch (error) {
    hideTyping();
    console.error('Fehler:', error);
    addMessage({
      role: 'assistant',
      content: '❌ Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
    });
  }
}

// Show Options (Buttons)
function showOptions(options) {
  hideInput();
  optionsList.innerHTML = '';
  
  options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'option-button w-full text-left px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition font-medium text-gray-700';
    button.textContent = option;
    button.onclick = () => handleOptionClick(option);
    optionsList.appendChild(button);
  });
  
  optionsContainer.classList.remove('hidden');
}

// Hide Options
function hideOptions() {
  optionsContainer.classList.add('hidden');
  optionsList.innerHTML = '';
}

// Show Input
function showInput(type = 'text') {
  hideOptions();
  userInput.type = type;
  userInput.value = '';
  userInput.placeholder = type === 'number' ? 'Bitte Zahl eingeben...' : 'Ihre Antwort...';
  inputContainer.classList.remove('hidden');
  userInput.focus();
}

// Hide Input
function hideInput() {
  inputContainer.classList.add('hidden');
}

// Handle Option Click
async function handleOptionClick(option) {
  if (isProcessing) return;
  isProcessing = true;

  // Add user message
  const userMessage = {
    role: 'user',
    content: option
  };
  addMessage(userMessage);
  conversation.push(userMessage);

  hideOptions();
  
  // Get next question
  await getNextQuestion();
  isProcessing = false;
}

// Handle Send Message
async function handleSendMessage() {
  if (isProcessing) return;
  
  const message = userInput.value.trim();
  if (!message) return;

  isProcessing = true;

  // Add user message
  const userMessage = {
    role: 'user',
    content: message
  };
  addMessage(userMessage);
  conversation.push(userMessage);

  hideInput();

  // Get next question
  await getNextQuestion();
  isProcessing = false;
}

// Finalize Analyse
async function finalizeAnalyse() {
  showTyping();
  
  // Add processing message
  const processingMessage = {
    role: 'assistant',
    content: '✨ Vielen Dank für Ihre Antworten! Ich erstelle jetzt Ihre individuelle Analyse. Dies dauert nur einen Moment...'
  };
  addMessage(processingMessage);

  try {
    const response = await fetch('/api/chatbot/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation })
    });

    if (!response.ok) {
      throw new Error('Finalisierung fehlgeschlagen: ' + response.statusText);
    }

    const data = await response.json();
    hideTyping();

    if (data.success && data.analyse) {
      // Show completion message
      const completionMessage = {
        role: 'assistant',
        content: '🎉 Ihre Analyse ist fertig! Ich zeige Ihnen jetzt Ihre personalisierten Empfehlungen.'
      };
      addMessage(completionMessage);

      // Wait a moment, then show results
      setTimeout(() => {
        showResults(data.analyse);
      }, 1500);
    } else {
      throw new Error('Keine Analyse-Daten erhalten');
    }
  } catch (error) {
    hideTyping();
    console.error('Finalisierungs-Fehler:', error);
    addMessage({
      role: 'assistant',
      content: '❌ Es ist ein Fehler bei der Erstellung der Analyse aufgetreten. Bitte versuchen Sie es erneut.'
    });
  }
}

// Show Results
function showResults(analyse) {
  // Hide chat mode
  document.getElementById('chat-mode').classList.add('hidden');
  
  // Show results mode
  document.getElementById('results-mode').classList.remove('hidden');
  
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
      beschreibung: 'Externer Verkauf an strategischen Käufer oder Investor',
      icon: 'fa-handshake'
    }
  };

  const szenarioInfo = szenarioTexte[analyse.szenario];
  
  // Fill header
  document.getElementById('result-szenario-beschreibung').innerHTML = `
    <i class="fas ${szenarioInfo.icon} mr-2"></i>${szenarioInfo.beschreibung}
  `;
  
  const prioritaetColors = {
    HOCH: 'bg-red-500',
    MITTEL: 'bg-yellow-500',
    NIEDRIG: 'bg-green-500'
  };
  
  const prioritaetBadge = document.getElementById('result-prioritaet-badge');
  prioritaetBadge.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>Priorität: ${analyse.prioritaet}`;
  prioritaetBadge.className = `${prioritaetColors[analyse.prioritaet]} text-white px-4 py-2 rounded-lg font-semibold`;
  
  document.getElementById('result-szenario-badge').textContent = szenarioInfo.name;

  // Fill lists
  fillResultList('result-schritte', analyse.naechste_schritte, 'font-semibold');
  fillResultList('result-emotional', analyse.perspektiven.emotional);
  fillResultList('result-rechtlich', analyse.perspektiven.rechtlich);
  fillResultList('result-steuerlich', analyse.perspektiven.steuerlich);
  fillResultList('result-organisatorisch', analyse.perspektiven.organisatorisch);
  fillResultList('result-risiken', analyse.risiken, 'text-red-700');
  fillResultList('result-chancen', analyse.chancen, 'text-green-700');
  fillResultList('result-erfolgsfaktoren', analyse.erfolgsfaktoren);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Helper: Fill Result List
function fillResultList(elementId, items, extraClass = '') {
  const el = document.getElementById(elementId);
  el.innerHTML = '';
  
  if (!items || items.length === 0) {
    el.innerHTML = '<li class="text-gray-400">Keine Einträge</li>';
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = `${extraClass} flex items-start gap-2`;
    li.innerHTML = `
      <span class="text-orange-500 font-bold flex-shrink-0">${index + 1}.</span>
      <span>${item}</span>
    `;
    el.appendChild(li);
  });
}

// Neue Analyse
function neueAnalyse() {
  // Reset state
  conversation = [];
  isProcessing = false;
  chatMessages.innerHTML = '';
  
  // Show chat mode
  document.getElementById('results-mode').classList.add('hidden');
  document.getElementById('chat-mode').classList.remove('hidden');
  
  // Restart
  initChat();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', initChat);
