import express from 'express'
import 'dotenv/config'
import cors from 'cors'  
import { connectDb } from './config/db.js';
import { clerkMiddleware } from '@clerk/express'
import clerkWebHooks from './controllers/clerkWebHooks.js';
import userRouter from './routes/userRoutes.js';
import hotelRouter from './routes/hotelRoutes.js';
import roomRouter from './routes/roomRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import { stripeWebhooks } from './controllers/stripeWebHook.js';


const app = express();
app.use(cors());
app.post('/api/stripe',express.raw({type:'application/json'}),stripeWebhooks);

app.use(express.json())
app.use(clerkMiddleware())

//Api to listen to clerk webhooks
app.use('/api/clerk',clerkWebHooks);


app.get('/',(req,res)=>{
   res.send('Working');
})
app.use('/api/user',userRouter);
app.use('/api/hotels',hotelRouter);
app.use('/api/rooms',roomRouter);
app.use('/api/bookings',bookingRouter);


const PORT = process.env.PORT || 8000;


connectDb().then(()=>{
   app.listen(PORT,()=>{
      console.log('Server running')
   })
})