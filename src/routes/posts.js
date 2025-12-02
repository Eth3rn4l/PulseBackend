import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  getFeed,
  getUserPosts,
  createPost,
  deletePost
} from '../controllers/postsController.js';

const r = Router();

r.get('/', auth, getFeed);
r.get('/user/:id', auth, getUserPosts);
r.post('/', auth, createPost);
r.delete('/:id', auth, deletePost);

export default r;
