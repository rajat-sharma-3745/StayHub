import cloudinary from "../config/cloudinary.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";


export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities } = req.body;
        const hotel = await Hotel.findOne({ owner: req.auth.userId });
        if (!hotel) return res.json({ success: false, message: "No hotel found" })

        // Upload images to cloudinary
        const uploadImages = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(file.path,{folder:"hotelBooking"});
            return response.secure_url;
        })
        const images = await Promise.all(uploadImages)
        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: JSON.parse(amenities),
            images
        })
        res.json({ success: true, message: "Room created successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
// get all rooms
export const getRooms = async (req, res) => {
    try {
       const rooms = await Room.find({isAvailable:true}).populate({path:'hotel',populate:{path:'owner',select:"image"}}).sort({createdAt:-1});
       res.json({success:true,rooms})
    } catch (error) {
       res.json({success:false,message:error.message})

    }
}
// get all rooms for a specific hotel
export const getOwnerRooms = async (req, res) => {
    try {
        const hotelData = await Hotel.findOne({owner:req.auth.userId})
        const rooms = await Room.find({hotel:hotelData._id.toString()}).populate('hotel');
       res.json({success:true,rooms})
    } catch (error) {
       res.json({success:false,message:error.message})
    }
}
// Toggle availability
export const toggleRoomAvailability = async (req, res) => {
    try {
        const {roomId} = req.body;
        const room = await Room.findById(roomId);
        room.isAvailable = !room.isAvailable;
        await room.save();
       res.json({success:true,message:"Room availbility updated"});

    } catch (error) {
       res.json({success:false,message:error.message})

    }
}