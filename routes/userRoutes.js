import {Router} from "express"
import { signup } from "../controllers/authController.js"

const router = Router()

router.route('/signup').post(signup)
// router.route('/login').post(login)
// router.get('/logout',logout)

export default router