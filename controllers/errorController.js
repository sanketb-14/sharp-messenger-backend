import AppError from "../utils/appError.js";

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);
const sendErrorDev = (err, res) => {
  // A) API

  const statusCode =
    err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;

  return res.status(statusCode).json({
    status: err.status,
    
    message: err.message,
    statusCode:err.statusCode,
    stack: err.stack,
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  console.log(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);

  if (error.name === "JsonWebTokenError") {
    error = handleJWTError();
    sendErrorDev(error,res)
  }else{
    sendErrorDev(err, res);

  }
  
};

export default globalErrorHandler;
