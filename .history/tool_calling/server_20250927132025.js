import express from 'express';
import cors from 'cors';  
import {generate} from './chatbot.js';


const app = express()
const port = 3000
app
app.use(express.json());

app.get('/', (req, res) => {
  res.send('welcome to chadpt')
})

app.post('/chat',async(req,res)=>{
     const {message} = req.body;

     console.log('message',message);

     const result = await generate(message);

     res.json({message:result})
     
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})