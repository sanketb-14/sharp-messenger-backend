import prisma from "../DB/db.config.js"
import AppError from "../utils/appError.js"
export async function getMe(req, res, next) {
    const user = await prisma.user.findUnique({
        where:{
            id:req.user.id
        },
        select:{
            id:true,
            username:true,
            fullName:true,
            profilePic:true
           
         
        }
    })
    if(!user){
        return next(new AppError("User not found"))
    }
    res.status(200).json({
     user
    })

    
   
    


}