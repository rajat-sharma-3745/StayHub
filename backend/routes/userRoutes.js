import { Router } from 'express'
import { getUserData } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import { recentSearchedCities } from '../controllers/userController.js';

const userRouter = Router();

userRouter.get('/',protect,getUserData)
userRouter.post('/recent-search',protect,recentSearchedCities)


export default userRouter