import prisma from "../DB/db.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import vine, { errors } from "@vinejs/vine";
import { promisify } from "util";
import { registerSchema } from "../validator/authSchema.js";
import { CustomErrorReporter } from "../validator/customErrorReporter.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
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
};

async function hashPassword(password) {
  const hashPassword = await bcrypt.hash(password, 12);
  password = hashPassword;
  return password;
}

export const signup = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const { username, email, password, password_confirmation, gender } = req.body;
  if (!username || !email || !password || !password_confirmation) {
    return next(new AppError("All fields are required", 400));
  }
  if (password !== password_confirmation) {
    return next(new AppError("Passwords do not match", 400));
  }
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (user) {
    return next(new AppError("User already exists", 403));
  }

  vine.errorReporter = () => new CustomErrorReporter();

  const validator = vine.compile(registerSchema);
  const output = await validator.validate(req.body);

  const boyProfilePic = `https://xsgames.co/randomusers/assets/avatars/male/${Math.floor(Math.random() * 100)}.jpg`;
  const girlProfilePic = `https://xsgames.co/randomusers/assets/avatars/female/${Math.floor(Math.random() * 100)}.jpg`;

  const newUser = {
    username: output.username,
    fullName: output.username,
    email: output.email,
    password: await hashPassword(output.password),
    gender,

    profilePic: !req.body.profilePic
      ? gender === "male"
        ? boyProfilePic
        : girlProfilePic
      : req.body.profilePic,
  };

  const createdUser = await prisma.user.create({
    data: newUser,
  });
  createSendToken(createdUser, 201, req, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password,profilePic } = req.body;
  

  if (req.body?.provider === "google") {
    // Handle Google sign-in
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        username: true,
        email: true,
        profilePic: true,
      },
    });

    if (user) {
      user.password = undefined;
      createSendToken(user, 200, req, res);
    } else {
      // User doesn't exist, create a new user
      const newUser = await prisma.user.create({
        data: {
          email: email,
          username: email.split('@')[0], // Using email as username
          fullName:email,
          password: await hashPassword(email), // You might want to set a random 
          profilePic,
          gender:"male"
        },
        select: {
          id: true,
          username: true,
          email: true,
          profilePic: true,
        },
      });

      createSendToken(newUser, 201, req, res);
    }
    return; // End the function here for Google sign-in
  }

  // Rest of the code for regular email/password login
  if (!email || !password) {
    return next(new AppError("email and password are required", 401));
  }

  const user = await prisma.user.findUnique({
    where: { email: email },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      profilePic: true,
    },
  });

  

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  user.password = undefined;
  createSendToken(user, 200, req, res);
});

export const logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
});

export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  console.log(req.cookies);

  let token = req.cookies.jwt;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]
  }
  else{
    token = req.cookies.jwt
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };
};


