import express from 'express'
import 'dotenv/config'
import cors from 'cors'  
import { connectDb } from './config/db.js';
import { clerkMiddleware } from '@clerk/express'
import clerkWebHooks from './controllers/clerkWebHooks.js';


const app = express();
app.use(cors());

app.use(express.json())
app.use(clerkMiddleware())

//Api to listen to clerk webhooks
app.use('/api/clerk',clerkWebHooks);


app.get('/',(req,res)=>{
    res.send('Working');
})


const PORT = process.env.PORT || 8000;


connectDb().then(()=>{
   app.listen(PORT,()=>{
      console.log('Server running')
   })
})