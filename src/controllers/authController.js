import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {db} from '../db.js';

export const register=async(req,res)=>{
 const {email,password,username}=req.body;
 try{
   const [u]=await db.query("SELECT id FROM users WHERE email=?", [email]);
   if(u.length>0) return res.status(400).json({error:"Email exists"});
   const hash=await bcrypt.hash(password,10);
   await db.query("INSERT INTO users (email,password_hash,username) VALUES (?,?,?)",[email,hash,username]);
   res.json({message:"User registered"});
 }catch(err){res.status(500).json({error:err.message})}
};

export const login=async(req,res)=>{
 const {email,password}=req.body;
 try{
   const [rows]=await db.query("SELECT * FROM users WHERE email=?", [email]);
   if(rows.length===0) return res.status(400).json({error:"Invalid"});
   const user=rows[0];
   const ok=await bcrypt.compare(password,user.password_hash);
   if(!ok) return res.status(400).json({error:"Invalid"});
   const token=jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:"7d"});
   res.json({token});
 }catch(err){res.status(500).json({error:err.message})}
};