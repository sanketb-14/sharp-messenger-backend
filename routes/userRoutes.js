import {Router} from "express"
import { signup,login,logout,protect } from "../controllers/authController.js"
import  {getMe}  from "../controllers/usersController.js"

const router = Router()

router.route('/signup').post(signup)
router.route('/login').post(login)
router.get('/logout',logout)


router.use(protect)

router.get("/me",getMe)

export default router

