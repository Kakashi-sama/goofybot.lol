let socket;
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
socket = new WebSocket(`${protocol}://${window.location.host}`);

const messagesDiv = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

// Listen for messages from the server
socket.addEventListener('message', function (event) {
    const message = document.createElement('div');
    message.textContent = event.data;
    messagesDiv.appendChild(message);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
});

// Send a message to the server when the form is submitted
messageForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (messageInput.value.trim()) {
        socket.send(messageInput.value);
        messageInput.value = '';
    }
});

document.getElementById('jokeButton').addEventListener('click', async () => {
    const joke = await fetchJoke();
    document.getElementById('joke').textContent = joke;
});

async function fetchJoke() {
    try {
        const response = await fetch('https://official-joke-api.appspot.com/random_joke');
        const joke = await response.json();
        return `${joke.setup} - ${joke.punchline}`;
    } catch (error) {
        console.error('Failed to fetch joke:', error);
        return "Failed to fetch a joke.";
    }
}

