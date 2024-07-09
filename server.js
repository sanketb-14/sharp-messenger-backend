import express from "express";
import rateLimit from "express-rate-limit";
import userRoute from "./routes/userRoutes.js";
import chatRoute from "./routes/chatRoutes.js";
import cookieParser from 'cookie-parser';
import globalErrorHandler from "./controllers/errorController.js";

import helmet from "helmet";
import xss from "xss-clean";
import cors from "cors";
import "dotenv/config";
import { app,server } from "./socket/socket.js";

// const app = express();

// Global Middleware

//Set security HTTP Headers
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials:true // Allow requests from any origin
  })
);

// Prevent XSS attacks

app.use(xss());

// Limit requests from same API

const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 100,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);
app.use(cookieParser());


app.use(express.json({ limit: "10kb" }));

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/auth", userRoute);
app.use("/api/v1/chats", chatRoute);

app.use(globalErrorHandler);

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
