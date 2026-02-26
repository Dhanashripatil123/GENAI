const input = document.querySelector("#input");
const chatContainer = document.querySelector("#chatcontainer");
const askBtn = document.querySelector("#ask");

const threadId = Date.now().toString(36);

let isGenerating = false;

input.addEventListener("keyup", handleEnter);
askBtn.addEventListener("click", handleAsk);

function scrollBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function createUserMessage(text) {
  const div = document.createElement("div");
  div.className = "text-right";
  div.innerHTML = `<span class="bg-blue-600 px-4 py-2 rounded-lg inline-block">${text}</span>`;
  chatContainer.appendChild(div);
}

function createBotMessage(text) {
  const div = document.createElement("div");
  div.className = "text-left";
  div.innerHTML = `<span class="bg-gray-700 px-4 py-2 rounded-lg inline-block">${marked.parse(text)}</span>`;
  chatContainer.appendChild(div);
}

function showLoader() {
  const div = document.createElement("div");
  div.id = "loader";
  div.innerHTML = "⏳ Thinking...";
  chatContainer.appendChild(div);
}

function removeLoader() {
  document.getElementById("loader")?.remove();
}

async function callServer(message) {
  const response = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ threadId, message })
  });

  if (!response.ok) {
    throw new Error("Server error");
  }

  const data = await response.json();
  return data.message;
}

async function generate(text) {
  createUserMessage(text);
  input.value = "";
  showLoader();
  scrollBottom();

  try {
    const reply = await callServer(text);
    removeLoader();
    createBotMessage(reply);
  } catch (err) {
    removeLoader();
    createBotMessage("❌ Error: " + err.message);
  }

  scrollBottom();
}

async function handleAsk() {
  if (isGenerating) return;

  const text = input.value.trim();
  if (!text) return;

  isGenerating = true;
  await generate(text);
  isGenerating = false;
}

async function handleEnter(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleAsk();
  }
}