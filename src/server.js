import app from './app.js';

app.get('/teste', (req,res)=>{
    res.send(200);
})

app.listen(4000,()=>{
    console.log('Running on port 4000')
})
