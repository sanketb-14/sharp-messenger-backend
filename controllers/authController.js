import prisma from "../DB/db.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import vine,{errors} from '@vinejs/vine'
import { registerSchema } from "../validator/authSchema.js";
import { CustomErrorReporter } from "../validator/customErrorReporter.js"
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };

const createSendToken = (user,statusCode , req , res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });

}

async function hashPassword(password){
  const hashPassword = await bcrypt.hash(password,12)
  password = hashPassword
  return password
}

export const signup = catchAsync(async(req,res,next) => {
  const {username , email,password , password_confirmation} = req.body
  if(!username || !email || !password || !password_confirmation){
    return next(new AppError("All fields are required",400))
  }
  if(password!== password_confirmation){
    return next(new AppError("Passwords do not match",400))
  }
  const user = await prisma.user.findUnique({
    where:{
      email:email
    }

  })
  if(user){
    return next(new AppError("User already exists",403))
  }

  vine.errorReporter =() => new CustomErrorReporter
  
   

  const validator = vine.compile(registerSchema)
  const output = await validator.validate(req.body)  

  const newUser = {
    username:output.username,
    email:output.email,
    password:await hashPassword(output.password)

  }

  const createdUser = await prisma.user.create({
    data:newUser,
    
})
  createSendToken(createdUser,201,req,res)
})