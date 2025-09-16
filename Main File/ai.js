const API_KEY = 'AIzaSyDMlZLePCZQyvEH9uLvpvsfL40Z3ZtwBcs';
const MODEL_NAME = 'gemini-1.5-pro';

async function chatWithGemini(prompt) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return 'Sorry, there was an error processing your request.';
    }
}

function addMessageToChat(message, type) {
    const chatHistory = document.getElementById('chat-history');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', type + '-message');
    messageElement.textContent = message;
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();

    if (message) {
        addMessageToChat(message, 'user');
        userInput.value = '';
        userInput.disabled = true;
        document.getElementById('send-btn').disabled = true;
        const botResponse = await chatWithGemini(message);
        addMessageToChat(botResponse, 'bot');
        userInput.disabled = false;
        document.getElementById('send-btn').disabled = false;
        userInput.focus();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', event => {
        if (event.key === 'Enter') sendMessage();
    });
});