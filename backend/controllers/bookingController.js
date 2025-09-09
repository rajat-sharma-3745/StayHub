import { transporter } from "../config/nodemailer.js";
import Booking from "../models/Booking.js"
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import stripe from 'stripe'


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
        totalPrice *= nights;
        const booking = await Booking.create({ user, room, hotel: roomData.hotel._id, guests: Number(guests), checkInDate, checkOutDate, totalPrice })
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: "HOTEL BOOKING DETAILS",
            html: `
            <h2>Your Booking Details</h2>
            <p>Dear ${req.user.username},</p>
            <p>Thank you for your booking! Here are your details:</p>
            <ul>
                <li><strong>Booking ID:</strong> ${booking._id}</li>
                <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
                <li><strong>Location:</strong> ${roomData.hotel.address}</li>
                <li><strong>Date:</strong> ${booking.checkInDate.toDateString()}</li>
                <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || '$'} ${booking.totalPrice} /night</li>
            </ul>
            <p>We look forward to welcoming you!</p>
            <p>If you need to make any changes, feel free to contact us.</p>

          `
        }
        await transporter.sendMail(mailOptions)
        res.json({ success: true, message: "Booking created successfully" })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: "Failed to create booking" })

    }
}


// Api to get all bookings for a user
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({ user }).populate('room hotel').sort({ createdAt: -1 })
        res.json({ success: true, bookings });
    } catch (error) {
        res.json({ success: false, message: "Failed to fetch bookings" })
    }
}


// Api to get all bookings for hotel owner
export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId });
        if (!hotel) {
            return res.json({ success: false, message: "No hotel found" })
        }
        const bookings = await Booking.find({ hotel: hotel._id }).populate("room hotel user").sort({ createdAt: -1 });
        // total bookings
        const totalBookings = bookings.length
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0)
        res.json({
            success: true, dashboardData: {
                totalBookings, totalRevenue, bookings
            }
        });

    } catch (error) {
        res.json({ success: false, message: "Failed to fetch bookings" })
    }
}


export const stripePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);
        const roomData = await Room.findById(booking.room).populate('hotel');
        const totalPrice = booking.totalPrice

        const { origin } = req.headers;

        // create stripe instance
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const line_items = [
            {
                price_data: { //how stripe will calculate charge
                    currency: "usd",
                    product_data: {   //set the product name
                        name: roomData.hotel.name,
                    },
                    unit_amount: totalPrice * 100,  //stripe requires amount in smallest currency unit (cents for usd)
                },
                quantity: 1, //only one unit of this product is being purchased i.e one hotel booking
            }
        ]
        // creates a checkout session which represents the transaction, when created it returns a session object 
         const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode:'payment',
            success_url:`${origin}/loader/my-bookings`,
            cancel_url:`${origin}/my-bookings`,
            metadata:{
                bookingId
            }
        });
        res.json({success:true,url:session.url});  //url to checkout session means it will redirect user to this url to take them to checkout
    } catch (error) {
        res.json({success:false,message:"Payment failed"});
    }
}