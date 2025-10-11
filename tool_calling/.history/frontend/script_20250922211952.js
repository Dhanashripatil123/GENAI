const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chat-')
console.log(input);


input?.addEventListener('keyup',handleEnter);

function generate(text){
//     1. append message to ui 
          
//     2. send it to the llm 
//     3. append response to the ui
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