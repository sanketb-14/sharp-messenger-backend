import prisma from "../DB/db.config.js"
export async function getUsers(req, res, next) {
    const users = await prisma.user.findMany()
   
    res.status(200).json(users)


}