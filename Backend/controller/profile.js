const ProfileSchema = require('../models/profile')
const mongoose = require('mongoose')
const codeSubmitSchema = require('../models/codeSubmitSchema')


const CreateProfileData = async (req,res) =>{
    try{
        const {name,email,username,dob,gender,college,country,bio,image,problemSolved,linkedIn,github}
        = req.body;

        if(!email){
            return res.status(400).json({message:"Email is required"})
        }

        const isExist = await ProfileSchema.findOne({email:email});
        if(isExist){
            return res.status(400).json({message:"Profile already exists"})
        }

        const ProfileData = await ProfileSchema.create({
            name,
            email,
            username,
            dob,
            gender,
            college,
            country,
            bio,
            image,
            problemSolved,
            linkedIn,
            github
        
        })

        ProfileData.save();
        return res.status(200).json({message:"Profile created successfully"})
    }catch(e){
        return res.status(500).json({message:e.message})
    }
}


const GetProfileData = async (req,res) =>{
    try{
        const {email} = req.body;
        const UserProfile = await ProfileSchema.findOne({email:email});
        UserProfile.problemSolved = codeSubmitSchema.count({userId:email})
        UserProfile.save();
        if(!UserProfile){
            return res.status(500).json({message:"Profile not found"})
        }

        return res.status(200).json({userProfile:UserProfile})
    }catch(e){
        return res.status(500).json({message:e.message})
    }
}


const UpdateProfileData = async (req,res) =>{
    try{
        const {email} = req.body;
        if(!email){
            return res.status(400).json({message:"Email is required"})
        }

        const {name  , dob , gender , college , country , bio , image , problemSolved , linkedIn , github} = req.body;
        const UserProfile = await ProfileSchema.findOne({email:email});
        UserProfile.name = name;
        UserProfile.dob = dob;
        UserProfile.gender = gender;
        UserProfile.college = college;
        UserProfile.country = country;
        UserProfile.bio = bio;
        UserProfile.image = image;
        UserProfile.problemSolved = problemSolved;
        UserProfile.linkedIn = linkedIn;
        UserProfile.github = github;
        
        UserProfile.save();

        return res.status(200).json({message:"Profile updated successfully"})

    }catch(e){
        return res.status(500).json({message:e.message})
    }
}

module.exports = {CreateProfileData,GetProfileData,UpdateProfileData}