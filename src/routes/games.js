import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  getCatalog,
  getMyGames,
  addMyGame,
  updateMyGame,
  deleteMyGame
} from '../controllers/gamesController.js';

const r = Router();

r.get('/', auth, getCatalog);
r.get('/my', auth, getMyGames);
r.post('/my', auth, addMyGame);
r.put('/my/:id', auth, updateMyGame);
r.delete('/my/:id', auth, deleteMyGame);

export default r;
