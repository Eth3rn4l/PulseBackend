import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import friendRoutes from './routes/friends.js';

dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/friends',friendRoutes);

app.get('/',(req,res)=>res.json({message:"PlayPulse Backend v3"}));

const PORT=process.env.PORT||4000;
app.listen(PORT,()=>console.log("Server running on port "+PORT));
