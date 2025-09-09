import { Router } from "express";
import { checkAvailabilityApi, createBooking, getHotelBookings, getUserBookings, stripePayment } from "../controllers/bookingController.js";
import { protect } from "../middlewares/auth.js";

const bookingRouter = Router();

bookingRouter.post('/check-availability',checkAvailabilityApi);
bookingRouter.post('/book',protect,createBooking);
bookingRouter.get('/user',protect,getUserBookings);
bookingRouter.get('/hotel',protect,getHotelBookings);
bookingRouter.post('/stripe-payment',protect,stripePayment);




export default bookingRouter