import Booking from "../models/Booking.js"
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";


//utility function to check if a room is available for a given date range by finding overlapping bookings
const checkAvailability = async ({ room, checkOutDate, checkInDate }) => {
    try {
        // if for a room checkInDate(Jan10)<=checkOutDate(Jan14) and checkOutDate(Jan15)>=checkInDate(Jan12) then its overlapping
        // existing booking for person A and requested booking for person B , if A's checkin is before B's checkout and A's checkout is after the B's checkin
        const bookings = await Booking.find({ room, checkInDate: { $lte: checkOutDate }, checkOutDate: { $gte: checkInDate } });

        return bookings.length === 0  //true means room available, false means it has overlapping bookings 

    } catch (error) {
        console.log(error.message);
    }

}

// Api to check availability
export const checkAvailabilityApi = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability({ room, checkInDate, checkOutDate });
        res.json({ success: true, isAvailable });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Api to create a new booking
export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user._id;
        // check availability before booking
        const isAvailable = await checkAvailability({ room, checkInDate, checkOutDate });
        if (!isAvailable) return res.json({ success: false, message: "Room is not available" });
        // Get total price for room
        const roomData = await Room.findById(room).populate('hotel');
        let totalPrice = roomData.pricePerNight;

        // Calculate total price based on night
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        totalPrice*=nights;
        const booking = await Booking.create({user,room,hotel:roomData.hotel._id,guests:Number(guests),checkInDate,checkOutDate,totalPrice})
        res.json({success:true,message:"Booking created successfully"})

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: "Failed to create booking" })
     
    }
}


// Api to get all bookings for a user
export const getUserBookings = async(req,res) =>{
    try {
        const user = req.user._id;
        const bookings = await Booking.find({user}).populate('room hotel').sort({createdAt:-1})
        res.json({success:true,bookings});
    } catch (error) {
        res.json({success:false,message:"Failed to fetch bookings"})
    }
}


// Api to get all bookings for hotel owner
export const getHotelBookings = async(req,res)=>{
    try {
        const hotel = await Hotel.findOne({owner:req.auth.userId});
        if(!hotel){
            return res.json({success:false,message:"No hotel found"})
        }
        const bookings = await Booking.find({hotel:hotel._id}).populate("room hotel user").sort({createdAt:-1});
        // total bookings
        const totalBookings = bookings.length
        const totalRevenue = bookings.reduce((acc,booking)=>acc+booking.totalPrice,0 )
        res.json({success:true,dashboardData:{
            totalBookings,totalRevenue,bookings
        }});

    } catch (error) {
        res.json({success:false,message:"Failed to fetch bookings"})
    }
}