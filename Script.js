// app.js
const startBtn = document.getElementById('start-btn');
const transcriptDiv = document.getElementById('transcript');
const responseDiv = document.getElementById('response');

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

startBtn.addEventListener('click', () => {
  transcriptDiv.textContent = 'Listening...';
  responseDiv.textContent = '';
  recognition.start();
});

recognition.onresult = async (event) => {
  const text = event.results[0][0].transcript;
  transcriptDiv.textContent = `You said: ${text}`;
  const gptResponse = await fetchGPTResponse(text);
  responseDiv.textContent = `GPT-3 says: ${gptResponse}`;
  playWatsonTTS(gptResponse);
};

recognition.onerror = (event) => {
  transcriptDiv.textContent = `Error occurred in recognition: ${event.error}`;
};

async function fetchGPTResponse(text) {
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer YOUR_OPENAI_API_KEY`
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: text,
      max_tokens: 100
    })
  });
  const data = await response.json();
  return data.choices[0].text.trim();
}

function playWatsonTTS(text) {
  const audio = new Audio();
  const url = 'https://api.us-south.text-to-speech.watson.cloud.ibm.com/instances/YOUR_INSTANCE_ID/v1/synthesize';

  fetch(url + `?text=${encodeURIComponent(text)}&voice=en-US_AllisonV3Voice&accept=audio%2Fmp3`, {
    headers: {
      'Authorization': 'Basic ' + btoa('apikey:YOUR_WATSON_API_KEY')
    }
  })
  .then(response => response.blob())
  .then(blob => {
    audio.src = URL.createObjectURL(blob);
    audio.play();
  })
  .catch(err => console.error('TTS error:', err));
}

