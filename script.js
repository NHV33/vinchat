/* Public Key */

const public_key = "74j8c7gWJN1+06Dk:CF6VsSmKXM7e10IyEbqUvPufzECyNbfVxp7ET9R2jYhlbET+ShOAki3UOFzZ6Tya6I/B9bOYluk=";

/*Utility Classes*/

const clone = (jsonObject) => { return JSON.parse(JSON.stringify(jsonObject)); };
const swapClasses = (target, c1, c2) => { target.classList.remove(c1); target.classList.add(c2); };

function siblingIndex(child) {
  const parent = child.parentNode;
  return Array.prototype.indexOf.call(parent.children, child);
}

function newElement(tag, classes) {
  const newElem = document.createElement(tag);
  newElem.className = classes;
  return newElem;
}

let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

function shiftElementOrder(element, direction) {
  //direction can be 'next' or 'previous'
  const adjacentSibling = element[`${direction}ElementSibling`];
  if(adjacentSibling === null || adjacentSibling === undefined) { return; }
  (direction === "next") ?
    adjacentSibling.insertAdjacentElement("afterend", element) :
    adjacentSibling.insertAdjacentElement("beforebegin", element) ;
}

const mainCol = document.getElementById("main-col");
const chatBox = document.getElementById("chat-box");
const sendButton = document.getElementById("button-send");
const messageInput = document.getElementById("input-message");

function appendMessage(content) {
  const messageContainer = newElement("div", "rounded-pill mt-1 px-3 w-100 bg-white");
  // chatBox.insertBefore(messageContainer, chatBox.firstChild);
  messageContainer.textContent = content;
  chatBox.append(messageContainer);
  messageContainer.scrollIntoView();
}

function sendMessage() {
  socket.send(messageInput.value);
  // appendMessage(messageInput.value);
  messageInput.value = "";
}

sendButton.addEventListener("click", () => {
  if (messageInput.value !== "") {
    sendMessage();
  }
});

messageInput.addEventListener("keyup", (event) => {
  console.log("event.key: ", event.key);
  if (event.key === "Enter" && messageInput.value !== "") {
    sendMessage();
  }
});

let socket;

async function connectSocket(key) {

  // Create WebSocket connection.
  socket = new WebSocket(
    `wss://free.blr2.piesocket.com/v3/1?api_key=${key}&notify_self=1`
  );

  // Connection opened
  socket.addEventListener("open", (event) => {
    socket.send("Hello everyone!");
  });

  // Listen for messages
  socket.addEventListener("message", (event) => {
    appendMessage(event.data);
  });

}

const passwordModal = document.getElementById('modal-password');
const passwordInput = document.getElementById('input-password');
const passwordButton = document.getElementById('button-password');
passwordModal.showModal();

async function verifyPassword(password) {

  try {
    const decryptedKey = await decrypt(password, public_key);
    connectSocket(decryptedKey);
    passwordModal.close();
  } catch (error) {
    document.querySelector("h3").textContent = "try again";
  }
}

passwordButton.addEventListener("click", () => {
  if (passwordInput.value !== "") {
    verifyPassword(passwordInput.value);
  }
});

passwordInput.addEventListener("keyup", (event) => {
  console.log("event.key: ", event.key);
  if (event.key === "Enter" && passwordInput.value !== "") {
    verifyPassword(passwordInput.value);
  }
});

// Crypto functions modified from https://github.com/yifeiwu/subtlecrypto-demo/

async function getKey(password, iv) {
  const alg = { name: 'AES-GCM', iv }
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const pwHash = await window.crypto.subtle.digest('SHA-256', passwordData);
  return await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt', 'decrypt']);
}

async function encrypt(password, plaintext) {
  // const password = document.getElementById('password').value;
  // const plaintext = document.getElementById('plaintext').value;
  const encoder = new TextEncoder();
  const encodedPlaintext = encoder.encode(plaintext);

  // Generate a random 96-bit IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Generate key from password
  const key = await getKey(password, iv);

  // Encrypt the plaintext
  const cipher = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedPlaintext
  );

  // Encode the ciphertext and IV as base64
  const base64Cipher = btoa(String.fromCharCode(...new Uint8Array(cipher)));
  const base64IV = btoa(String.fromCharCode(...iv));

  // Display the ciphertext with IV
  // document.getElementById('cipher').value = base64IV + ':' + base64Cipher;
  return base64IV + ':' + base64Cipher;
}

async function decrypt(password, cipherText) {
  // const password = document.getElementById('password').value;
  // const cipherText = document.getElementById('cipher').value;

  // Split ciphertext and IV
  const parts = cipherText.split(':');
  const base64IV = parts[0];
  const base64Cipher = parts[1];

  // Decode IV and ciphertext from base64
  const iv = Uint8Array.from(atob(base64IV), c => c.charCodeAt(0));
  const cipher = Uint8Array.from(atob(base64Cipher), c => c.charCodeAt(0));

  // Generate key from password
  const key = await getKey(password);

  // Decrypt the ciphertext
  const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipher
  );

  // Decode the decrypted plaintext
  const decoder = new TextDecoder();
  // document.getElementById('decrypted').value = decoder.decode(decrypted);
  return decoder.decode(decrypted);
}

async function decryptWithError() {
  try {
      await decrypt();
  } catch (e) {
      console.log("Error, incorrect password or ciphertext");
  }
}
