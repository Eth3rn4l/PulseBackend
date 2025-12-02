import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.json({message:"PlayPulse Backend v2"}));

const PORT=process.env.PORT || 4000;
app.listen(PORT,()=>console.log("Server running on port "+PORT));
