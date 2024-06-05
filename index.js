document.getElementById('messageForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const messageInput = document.getElementById('messageInput');
    if (messageInput.value.trim()) {
        socket.send(messageInput.value);
        messageInput.value = '';
    }
});

const socket = new WebSocket(`wss://${window.location.host}`);
const messagesDiv = document.getElementById('messages');

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.type === 'message') {
        const messageElement = document.createElement('div');
        messageElement.textContent = data.text;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
};

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
