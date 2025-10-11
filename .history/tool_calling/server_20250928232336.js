import express from 'express';
import cors from 'cors';  
import {generate} from './chatbot.js';


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('welcome to chadpt')
})

app.post('/chat',async (req,res) => {
     const {message,threadId} = req.body;
     //todo: validate the field
     if(!message || threadId){
      res.status(400).json({message:'all fild are required'}); 
      return;
     }
     
     console.log('message',message);

     const result = await generate(message,threadId);

     res.json({message:result})  
     
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})