import express from 'express';

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('welcome to chadpt')
})

app.post('/chat',(req,res)=>{
     const {message} = req.ody
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})