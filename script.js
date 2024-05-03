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

appendMessage("one");
appendMessage("two");

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

// Create WebSocket connection.
const socket = new WebSocket(
  `wss://free.blr2.piesocket.com/v3/1?api_key=${API_KEY}&notify_self=1`
);

// Connection opened
socket.addEventListener("open", (event) => {
  // socket.send("Hello Server!");
});

// Listen for messages
socket.addEventListener("message", (event) => {
  // console.log("Message from server ", event.data);
  appendMessage(event.data);
});
