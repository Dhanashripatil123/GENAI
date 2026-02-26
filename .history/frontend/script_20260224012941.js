const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chatcontainer');
const askBtn = document.querySelector('#ask');
console.log(input);

const threadId = Date.now().toString(36) + Math.random().toString(36).substring(2,8);


input?.addEventListener('keyup',handleEnter);
askBtn?.addEventListener('click',handleask);

const  loading = document.createElement('div');
loading.className = "flex justify-start mb-4";
loading.innerHTML = `
  <div class="flex items-start space-x-3 max-w-xs lg:max-w-md">
    <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
      <span class="text-white font-bold text-sm">A</span>
    </div>
    <div class="bg-gray-700 px-4 py-2 rounded-lg rounded-bl-sm">
      <div class="flex space-x-1">
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
    </div>
  </div>
`;

async function generate(text){
//     1. append message to ui 
          
//     2. send it to the llm 
//     3. append response to the ui

// User message
const userMsgDiv = document.createElement('div');
userMsgDiv.className = "flex justify-end mb-4";
userMsgDiv.innerHTML = `
  <div class="flex items-start space-x-3 max-w-xs lg:max-w-md">
    <div class="bg-blue-600 text-white px-4 py-2 rounded-lg rounded-br-sm">
      ${text}
    </div>
    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
      <span class="text-white font-bold text-sm">U</span>
    </div>
  </div>
`;
chatContainer?.appendChild(userMsgDiv);

input.value = '';

chatContainer?.appendChild(loading);

let assitantMessage;
try{
    assitantMessage = await callserver(text);
    console.log("assitantMessage",assitantMessage);

    // Remove loading
    loading.remove();

    // Assistant message
    const assistantMsgDiv = document.createElement('div');
    assistantMsgDiv.className = "flex justify-start mb-4";
    assistantMsgDiv.innerHTML = `
      <div class="flex items-start space-x-3 max-w-xs lg:max-w-2xl">
        <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-white font-bold text-sm">A</span>
        </div>
        <div class="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg rounded-bl-sm prose prose-invert max-w-none">
          ${marked.parse(assitantMessage)}
        </div>
      </div>
    `;
    chatContainer?.appendChild(assistantMsgDiv);

}catch(err){
    console.error('Error calling server', err);
    loading.remove();
    const errDiv = document.createElement('div');
    errDiv.className = "flex justify-start mb-4";
    errDiv.innerHTML = `
      <div class="flex items-start space-x-3 max-w-xs lg:max-w-md">
        <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-white font-bold text-sm">!</span>
        </div>
        <div class="bg-red-900 text-red-100 px-4 py-2 rounded-lg rounded-bl-sm">
          Error: ${err.message || 'Request failed'}
        </div>
      </div>
    `;
    chatContainer?.appendChild(errDiv);
}finally{
    // Scroll to bottom
    chatContainer?.scrollTo(0, chatContainer.scrollHeight);
}

}

async function callserver(inputtext){
    try{
     const serverUrl = 'http://localhost:3000/chat';
     console.log('Posting to', serverUrl);
     const response = await fetch(serverUrl,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({threadId:threadId,message:inputtext})
     });

     if(!response.ok){
        const t = await response.text().catch(()=>null);
        throw new Error(`Server error: ${response.status} ${response.statusText} ${t||''}`);
    }

     const result = await response.json();
     return result.message;
    }catch(err){
        throw new Error(err.message || 'Network error');
    }
}

async function handleask(e){
   const text = input?.value.trim(); 
    if(!text){
        return;                                           
    }

    await generate(text);
}

async function handleEnter(e){
    //console.log(e);
    if(e.key === 'Enter'){
         const text = input?.value.trim();                                         
         //console.log(e);
    
    if(!text){ 
        return;                                           
    }

    await generate(text);
}
    
}