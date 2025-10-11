import express from 'express';

const app = express()
const port = 3000
app.use(express.json());

app.get('/', (req, res) => {
  res.send('welcome to chadpt')
})

app.post('/chat',(req,res)=>{
     const {message} = req.body;

     console.log('message',message);

     const result = await generate(message);

     res.json({message:"OK"})
     
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})