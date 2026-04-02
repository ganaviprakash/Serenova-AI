// State
let moodHistory = [];

// DOM Elements
const moodInput = document.getElementById('mood-input');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsContainer = document.getElementById('results-container');
const statusBox = document.getElementById('status-box');
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const moodScoreBadge = document.getElementById('mood-score-badge');
const aiResponseText = document.getElementById('ai-response-text');
const suggestionsList = document.getElementById('suggestions-list');
const historyList = document.getElementById('history-list');

// Calm mode elements
const calmModeBtn = document.getElementById('calm-mode-btn');
const calmOverlay = document.getElementById('calm-overlay');
const closeCalmBtn = document.getElementById('close-calm-btn');
const breathingText = document.getElementById('breathing-text');

// Keyword logic
const keywords = {
    stress: ['stress', 'stressed', 'pressure', 'overwhelmed', 'tired', 'exhausted', 'heavy'],
    sadness: ['sad', 'lonely', 'upset', 'depressed', 'cry', 'down', 'hopeless'],
    anxiety: ['anxious', 'nervous', 'worried', 'panic', 'fear', 'afraid'],
    happiness: ['happy', 'excited', 'great', 'good', 'joy', 'wonderful', 'amazing', 'अच्छा']
};

const templates = {
    negative: [
        "It seems you're feeling {mood}. Remember that it's okay to feel this way. Try taking a step back.",
        "I sense some {mood} in your words. Be gentle with yourself right now.",
        "Feeling {mood} can be challenging. Acknowledging it is the first step. Take a deep breath."
    ],
    neutral: [
        "You seem to be carrying some {mood}. Consider taking a short break.",
        "Your state points towards {mood}. A moment of mindfulness might help clear your head."
    ],
    positive: [
        "It sounds like you're experiencing {mood}! That's wonderful, keep carrying this positive energy.",
        "I'm detecting {mood} in your thoughts. It's a great time to share this energy or tackle something new!"
    ]
};

const suggestionsData = {
    stress: [
        { icon: '🧘', text: 'Try a 5-minute breathing exercise' },
        { icon: '🚶', text: 'Take a short walk away from screens' },
        { icon: '📝', text: 'Write down what you can control' }
    ],
    sadness: [
        { icon: '🎵', text: 'Listen to your favorite comforting music' },
        { icon: '🫂', text: 'Reach out to a close friend or family member' },
        { icon: '☕', text: 'Make a warm cup of tea or cocoa' }
    ],
    anxiety: [
        { icon: '🌬️', text: 'Practice 4-7-8 deep breathing' },
        { icon: '🌿', text: 'Name 5 things you can see around you' },
        { icon: '🚿', text: 'Splash cold water on your face' }
    ],
    happiness: [
        { icon: '🎉', text: 'Celebrate this moment, write it down!' },
        { icon: '🤝', text: 'Share your good mood with someone' },
        { icon: '⚡', text: 'Use this energy to do something creative' }
    ],
    neutral: [
        { icon: '💧', text: 'Drink a glass of water' },
        { icon: '🤸', text: 'Do some light stretching' },
        { icon: '👀', text: 'Rest your eyes from the screen' }
    ]
};

// Event Listeners
analyzeBtn.addEventListener('click', analyzeMood);

calmModeBtn.addEventListener('click', () => {
    calmOverlay.classList.remove('hidden');
    startBreathingAnimation();
});

closeCalmBtn.addEventListener('click', () => {
    calmOverlay.classList.add('hidden');
    clearInterval(breathingInterval);
});

let breathingInterval;

function startBreathingAnimation() {
    let isInhaling = true;
    breathingText.textContent = "Inhale...";
    
    breathingInterval = setInterval(() => {
        isInhaling = !isInhaling;
        breathingText.textContent = isInhaling ? "Inhale..." : "Exhale...";
    }, 4000); // toggle every 4s, total 8s cycle matching CSS
}

function analyzeMood() {
    const text = moodInput.value.trim().toLowerCase();
    
    if (!text) return;

    // Default state
    let detectedMood = 'neutral';
    let moodCategory = 'neutral';
    let score = 50;

    // Determine category based on matched keywords
    let matchCounts = { stress: 0, sadness: 0, anxiety: 0, happiness: 0 };
    
    for (const [category, words] of Object.entries(keywords)) {
        words.forEach(word => {
            if (text.includes(word)) {
                matchCounts[category]++;
            }
        });
    }

    const maxMatches = Math.max(...Object.values(matchCounts));
    
    if (maxMatches > 0) {
        if (matchCounts.happiness === maxMatches) {
            detectedMood = 'happiness';
            moodCategory = 'positive';
            score = 85 + Math.floor(Math.random() * 15); // 85-100
        } else if (matchCounts.stress === maxMatches) {
            detectedMood = 'stress';
            moodCategory = 'neutral'; // Neutral/warning mood
            score = 40 + Math.floor(Math.random() * 20); // 40-60
        } else if (matchCounts.anxiety === maxMatches) {
            detectedMood = 'anxiety';
            moodCategory = 'negative';
            score = 20 + Math.floor(Math.random() * 20); // 20-40
        } else if (matchCounts.sadness === maxMatches) {
            detectedMood = 'sadness';
            moodCategory = 'negative';
            score = 10 + Math.floor(Math.random() * 20); // 10-30
        }
    }

    updateUI(detectedMood, moodCategory, score, text);
    saveToHistory(detectedMood, moodCategory, text);
    
    // Clear input after analysis
    moodInput.value = '';
}

function updateUI(mood, category, score, originalText) {
    resultsContainer.classList.remove('hidden');
    
    // Reset classes
    statusBox.className = 'status-box';
    
    // Define visuals
    let visuals = { icon: '😐', label: 'Neutral' };
    
    if (category === 'positive') {
        visuals = { icon: '✨', label: 'Positive & Joyful' };
        statusBox.classList.add('mood-positive');
    } else if (category === 'neutral') {
        visuals = { icon: '💭', label: 'Stressed / Overwhelmed' };
        statusBox.classList.add('mood-neutral');
    } else if (category === 'negative') {
        visuals = { icon: '🌧️', label: 'Down / Anxious' };
        statusBox.classList.add('mood-negative');
    }

    if (mood === 'neutral' && category === 'neutral') {
        visuals.label = 'Calm / Neutral';
    }

    statusIcon.textContent = visuals.icon;
    statusText.textContent = visuals.label;
    moodScoreBadge.textContent = `Mood Score: ${score}/100`;

    // Generate AI Response
    const responseArray = templates[category];
    const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
    aiResponseText.textContent = randomResponse.replace('{mood}', mood);

    // Populate Suggestions
    const suggestions = suggestionsData[mood] || suggestionsData['neutral'];
    suggestionsList.innerHTML = '';
    suggestions.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.icon}</span> ${item.text}`;
        suggestionsList.appendChild(li);
    });
}

function saveToHistory(mood, category, text) {
    const entry = {
        mood,
        category,
        text,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    moodHistory.unshift(entry);
    if(moodHistory.length > 5) moodHistory.pop(); // Keep last 5
    
    renderHistory();
}

function renderHistory() {
    if (moodHistory.length === 0) return;
    
    historyList.innerHTML = '';
    moodHistory.forEach(item => {
        const div = document.createElement('div');
        div.className = `history-item ${item.category}`;
        div.innerHTML = `
            <div class="history-date">${item.date} • ${item.mood.charAt(0).toUpperCase() + item.mood.slice(1)}</div>
            <div class="history-text">"${item.text.length > 50 ? item.text.substring(0, 50) + '...' : item.text}"</div>
        `;
        historyList.appendChild(div);
    });
}
