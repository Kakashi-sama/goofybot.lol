let socket;
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
socket = new WebSocket(`${protocol}://${window.location.host}`);
let username;

const messagesDiv = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const chatSection = document.querySelector('.chat-section');
const loginSection = document.querySelector('.login-section');

socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data);
    if (data.type === 'welcome' || data.type === 'info') {
        alert(data.text);
    } else if (data.type === 'message') {
        const message = document.createElement('div');
        message.textContent = data.text;
        messagesDiv.appendChild(message);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
    }
});

function registerUser() {
    username = document.getElementById('usernameInput').value;
    if (username.trim()) {
        socket.send(JSON.stringify({type: 'register', username: username}));
        loginSection.style.display = 'none';
        chatSection.style.display = 'block';
    }
}

messageForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (messageInput.value.trim()) {
        socket.send(JSON.stringify({type: 'message', username: username, text: messageInput.value}));
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
