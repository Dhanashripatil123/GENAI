const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chatcontainer')
const askBtn = document.
console.log(input);


input?.addEventListener('keyup',handleEnter);

function generate(text){
//     1. append message to ui 
          
//     2. send it to the llm 
//     3. append response to the ui

const msg = document.createElement('div')
msg.className = "my-6 bg-neutral-700 p-3 rounded-xl ml-auto max-w-fit"
msg.textContent = text
chatContainer?.appendChild(msg);
input.value = '';
 
}



function handleEnter(e){
    console.log(e);
    if(e.key === 'Enter'){
         const text = input?.value.trim();                                         
         console.log(e);
    
    if(!text){
        return;                                           
    }

    generate(text);
}
    
}