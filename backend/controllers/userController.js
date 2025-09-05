
// GET /api/user

import User from "../models/User.js";

export const getUserData = async(req,res) => {
    try {
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        res.json({success:true,role,recentSearchedCities});
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

// Store user recent searched cities

export const recentSearchedCities = async(req,res)=>{
    try {
        const {recentSearchedCity }= req.body;
        const user = req.user;
        // we only store last 3 searched cities
        if(user.recentSearchedCities.length<3){
            user.recentSearchedCities.push(recentSearchedCity);
        }else{
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity);

        }
        await user.save();
        res.json({success:true,message:"City added"});
        
    } catch (error) {
        res.json({success:false,message:error.message});
        
    }
}