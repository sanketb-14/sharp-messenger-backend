import {Router} from "express"
import { fetchAllChatUsers,accessSingleChat , sendMessage,getMessages } from "../controllers/chatController.js"
import { protect } from "../controllers/authController.js"

const router = Router()

router.use(protect)
router.route("/send/:chatId").get(getMessages).post(sendMessage)
router.route('/allUsers').get(fetchAllChatUsers)


export default router