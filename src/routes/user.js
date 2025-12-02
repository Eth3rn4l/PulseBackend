import {Router} from 'express';
import {auth} from '../middleware/auth.js';
import {me,updateMe} from '../controllers/userController.js';

const r=Router();

r.get('/me',auth,me);
r.put('/me',auth,updateMe);

export default r;