import {Router} from "express"
import { fetchAllChatUsers , sendMessage,getMessages } from "../controllers/chatController.js"
import { protect } from "../controllers/authController.js"

const router = Router()

router.use(protect)
router.route('/allUsers').get(fetchAllChatUsers)
router.route("/send/:id").get(getMessages).post(sendMessage)



export default router