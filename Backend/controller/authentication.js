const mongoose = require('mongoose')
const signupModel = require('../models/signup')
const bcrypt = require('bcryptjs');
const {setUser} = require('../config/token')

async function signUp(req,res){
    try{
        const {name,email,password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        const isExist = await signupModel.findOne({email:email});
    
        if(isExist){
            return res.status(409).json({message:'User with this email already exists'});
        }
    
        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await signupModel.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User created successfully', userId: newUser._id });
    } catch(err){
        res.status(500).json({message:err.message})
    }
}


async function login(req,res) {
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:'Please provide all required fields'});
        }

        const user = await signupModel.findOne({email:email});
        if(!user){
            return res.status(404).json({message:'User not found'})
        }

        const isAuthentic = await bcrypt.compare(password,user.password);
        if(!isAuthentic){
            return res.status(401).json({message:'Invalid credentials'});
        }

        const token = setUser(user);
        res.status(200).json({authToken:token});
    }catch(err){
        console.log(err);
        res.status(500).json({message:err.message});
    }
}
module.exports = {signUp,login};