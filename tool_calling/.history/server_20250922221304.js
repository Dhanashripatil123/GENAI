import express from 'express';

const app = express()
const port = 3000
app.use

app.get('/', (req, res) => {
  res.send('welcome to chadpt')
})

app.post('/chat',(req,res)=>{
     const {message} = req.body;
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})