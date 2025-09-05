import mongoose, { Schema } from "mongoose";


const hotelSchema = new Schema({
    name:{type:String,required:true},
    address:{type:String,required:true},
    contact:{type:String,required:true},
    city:{type:String,required:true},
    owner:{type:String,required:true,ref:"User"},
},{timestamps:true});


const Hotel = mongoose.model('Hotel',hotelSchema);

export default Hotel