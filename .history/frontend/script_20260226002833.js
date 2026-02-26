const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chatcontainer');
const askBtn = document.querySelector('#ask');

const threadId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

// EVENTS
input.addEventListener('keydown', handleEnter);
askBtn.addEventListener('click', handleAsk);

// LOADING UI
const loading = document.createElement('div');
loading.className = "flex justify-start mb-4";
loading.innerHTML = `Typing...`;

async function generate(text) {

  askBtn.disabled = true;

  // USER MESSAGE
  chatContainer.innerHTML += `
    <div class="flex justify-end mb-4">
      <div class="bg-blue-600 px-4 py-2 rounded-lg">${text}</div>
    </div>
  `;

  input.value = "";
  chatContainer.appendChild(loading);
  scrollBottom();

  try {

    const assistantMessage = await callserver(text);

    loading.remove();

    // ASSISTANT MESSAGE
    chatContainer.innerHTML += `
      <div class="flex justify-start mb-4">
        <div class="bg-gray-700 px-4 py-2 rounded-lg prose prose-invert">
          ${marked.parse(assistantMessage)}
        </div>
      </div>
    `;

  } catch (err) {

    loading.remove();

    chatContainer.innerHTML += `
      <div class="text-red-400 mb-4">Error: ${err.message}</div>
    `;
  }

  askBtn.disabled = false;
  scrollBottom();
}

async function callserver(message) {

  const response = await fetch('http://localhost:3000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ threadId, message })
  });

  if (!response.ok) {
    throw new Error("Server error");
  }

  const data = await response.json();
  return data.message;
}

// CLICK SEND
async function handleAsk() {
  const text = input.value.trim();
  if (!text) return;
  await generate(text);
}

// ENTER SEND
async function handleEnter(e) {

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();

    const text = input.value.trim();
    if (!text) return;

    await generate(text);
  }
}

// AUTO SCROLL
function scrollBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}