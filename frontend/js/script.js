// frontend/js/script.js

// DOM Elements
const chatbotBtn = document.getElementById('chatbot-btn');
const chatbotWindow = document.getElementById('chatbot-window');
const closeChat = document.getElementById('close-chat');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');

// Chat functionality
chatbotBtn.addEventListener('click', () => {
    chatbotWindow.style.display = 'flex';
});

closeChat.addEventListener('click', () => {
    chatbotWindow.style.display = 'none';
});

// Send message function - Updated for Flask backend
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message';
    typingIndicator.innerHTML = '<div class="typing-indicator"></div>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        console.log('Sending request to Flask backend...'); // Debug log

        // Send message to Flask backend (running on port 5000)
        // The URL must match the route defined in your Flask app
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST', // Crucial: Must be POST to match Flask route
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }) // Send the message as JSON
        });

        console.log('Response received:', response); // Debug log

        // Check if the server returned an error status (e.g., 404, 500)
        if (!response.ok) {
            // If the response is not okay (e.g., 404 Not Found, 500 Internal Server Error)
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // If the response is okay (status 200), parse the JSON
        const data = await response.json();
        console.log('Data received:', data); // Debug log

        // Remove the typing indicator before adding the bot's response
        chatMessages.removeChild(typingIndicator);

        // Check if the backend returned a response message
        if (data.response) {
            addMessage(data.response, 'bot');
        } else {
            // If the backend returned a response object but without a 'response' field
            addMessage("Sorry, I couldn't process your request. Please try again.", 'bot');
        }
    } catch (error) {
        console.error('Error details:', error); // Debug log
        // Remove the typing indicator even if an error occurs
        chatMessages.removeChild(typingIndicator);

        // Handle different types of errors
        if (error.message.includes('fetch')) {
            // This usually happens if the server is down or the URL is incorrect
            addMessage("Error: Cannot connect to the server. Please make sure the Flask backend is running on http://localhost:5000 and the /api/chat endpoint is available.", 'bot');
        } else if (error.message.includes('HTTP error')) {
            // This happens if the server responded with an error status (e.g., 404)
            addMessage(`Error: The server returned an error (${error.message}). Please check if the backend is configured correctly.`, 'bot');
        } else {
            // For other unexpected errors
            addMessage(`Error: ${error.message}. Please check the console for more details.`, 'bot');
        }
    }
}

// Add a message (user or bot) to the chat display area
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    // Apply the appropriate CSS class based on the sender
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    // Scroll to the bottom of the chat window to show the latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event listeners for sending messages
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Smooth scrolling for navigation links (e.g., Home, About, Skills)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent the default anchor behavior
        const target = document.querySelector(this.getAttribute('href')); // Get the target element
        if (target) {
            // Scroll to the target element smoothly
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start' // Align the top of the target with the top of the viewport
            });
        }
    });
});

// Hamburger menu functionality for mobile navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    // Toggle an 'active' class on the hamburger and the menu
    // This class can be used in CSS to change the appearance
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close the mobile menu when clicking on a navigation link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        // Remove the 'active' class from the hamburger and menu
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});
