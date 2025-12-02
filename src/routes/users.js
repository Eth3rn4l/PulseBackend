import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { me, updateMe, getUserById } from '../controllers/userController.js';

const r = Router();

r.get('/me', auth, me);
r.put('/me', auth, updateMe);
r.get('/:id', auth, getUserById);

export default r;
