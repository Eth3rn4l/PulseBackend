import {Router} from 'express';
import {auth} from '../middleware/auth.js';
import {getFriends,sendRequest,acceptRequest,removeFriend} from '../controllers/friendsController.js';

const r=Router();

r.get('/',auth,getFriends);
r.post('/request',auth,sendRequest);
r.post('/accept',auth,acceptRequest);
r.delete('/:id',auth,removeFriend);

export default r;