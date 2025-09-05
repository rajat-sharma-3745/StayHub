import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import { registerHotel } from "../controllers/hotelController.js";


const hotelRouter = Router();

hotelRouter.post('/',protect,registerHotel)



export default hotelRouter;