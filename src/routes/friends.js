import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  getFriends,
  getPendingRequests,
  sendRequest,
  acceptRequest,
  removeFriend
} from '../controllers/friendsController.js';

const r = Router();

r.get('/', auth, getFriends);
r.get('/pending', auth, getPendingRequests);
r.post('/request', auth, sendRequest);
r.post('/accept', auth, acceptRequest);
r.delete('/:id', auth, removeFriend);

export default r;
