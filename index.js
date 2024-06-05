document.getElementById('jokeButton').addEventListener('click', function() {
    fetch('https://official-joke-api.appspot.com/random_joke')
        .then(response => response.json())
        .then(data => {
            const joke = `${data.setup} - ${data.punchline}`;
            document.getElementById('joke').innerText = joke;
        })
        .catch(error => {
            document.getElementById('joke').innerText = 'Oops! Something went wrong.';
            console.error('Error fetching joke:', error);
        });
});

