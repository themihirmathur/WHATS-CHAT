const socket = io('whats-chat-web.netlify.app');

// Get DOM elements in respective Js variables
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");

// Audio that will play on receiving messages
var audio = new Audio('ting.mp3');

// AES encryption key (must be the same on the server-side)
const encryptionKey = "myencryptionkey123";

// Function to encrypt the message using AES-256
const encryptMessage = (message) => {
  const ciphertext = CryptoJS.AES.encrypt(message, encryptionKey).toString();
  return ciphertext;
};

// Function to decrypt the message using AES-256
const decryptMessage = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
  const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedMessage;
};

// Function that will append event info to the container
const append = (message, position) => {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageElement.classList.add("message");
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
  if (position === 'left' || position === 'centre') {
    audio.play();
  }
};

// Scroll to bottom on getting a new message
function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Ask New User their name and let the server know!
const name = prompt("Enter your name to join");
socket.emit('new-user-joined', name);

// If a new user joins, receive the event from the server
socket.on('user-joined', name => {
  append(`${name} JOINED THE CHAT`, 'centre');
  scrollToBottom();
});

// If server sends a message, receive it
socket.on('receive', data => {
  const decryptedMessage = decryptMessage(data.message);
  append(`${data.name}: ${decryptedMessage}`, 'left');
  scrollToBottom();
});

// If a user leaves the Chat, append info to the container
socket.on('left', name => {
  append(`${name} LEFT THE CHAT`, 'centre');
  scrollToBottom();
});

// If the form gets submitted, send the encrypted message to the server
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value;
  if (messageInput.value !== "") {
    const encryptedMessage = encryptMessage(message);
    append(`You: ${message}`, 'right');
    socket.emit('send', encryptedMessage);
    messageInput.value = '';
  }
  scrollToBottom();
});
