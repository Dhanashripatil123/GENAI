const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chatcontainer')
const askBtn = document.querySelector('#ask')
console.log(input);


input?.addEventListener('keyup',handleEnter);
askBtn?.addEventListener('click',handleask);

const  loading = document.createElement('div'); 
loading.className = "my-6  loader"; 
loading.textContent = "Thinking....";                                               

async function generate(text){
//     1. append message to ui 
          
//     2. send it to the llm 
//     3. append response to the ui

const msg = document.createElement('div')
msg.className = "my-6 bg-neutral-700 p-3 rounded-xl ml-auto max-w-fit"
msg.textContent = text
chatContainer?.appendChild(msg);
input.value = '';

chatContainer?.appendChild(loading);

//call server
const assitantMessage = await callserver(text);
console.log("assitantMessage",assitantMessage);

const assitantmsgElem = document.createElement('div')
assitantmsgElem.className = "max-w-fit"
assitantmsgElem.textContent = assitantMessage;
chatContainer?.appendChild(assitantmsgElem);




}

async function callserver(inputtext){
     const response = await fetch('http://localhost:3000/chat',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({message:inputtext})
     });

     if(!response.ok){
        throw new Error('error getting the response from server');
        
     }

     const result = await response.json();
     return result.message;
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