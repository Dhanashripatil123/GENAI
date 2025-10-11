const input = document.querySelector('#input');
console.log(input);


input?.addEventListener('keyup',handleEnter);

function generate(text){
    1 
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