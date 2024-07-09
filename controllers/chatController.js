import prisma from "../DB/db.config.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const fetchAllChatUsers = catchAsync(async (req, res, next) => {
  const users = await prisma.user.findMany({
    where: {
      id: {
        not: req.user.id,
      },
    },
    select: {
      id: true,
      fullName: true,
      profilePic: true,
    },
  });
  console.log("Fetched users:", users);

  return res.status(200).json(users);
});

export const sendMessage = catchAsync(async (req, res, next) => {
  
  const { message } = req.body;

  const { id: receiverId } = req.params;
  const senderId = req.user.id;

  let conversation = await prisma.conversation.findFirst({
    where: {
      participantIds: {
        hasEvery: [senderId, receiverId],
      },
    },
  });

  // the very first message is being sent, that's why we need to create a new conversation
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participantIds: {
          set: [senderId, receiverId],
        },
      },
    });
  }

  const newMessage = await prisma.message.create({
    data: {
      senderId,
      body: message,
      conversationId: conversation.id,
    },
  });

  if (newMessage) {
    conversation = await prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
    });
  }

  // Socket io will go here
  conversation.participantIds.forEach((participantId) => {
    
    const participantSocketId = getReceiverSocketId(participantId);
    console.log("Receiver socket", participantSocketId);
    if (participantSocketId) {
      io.to(participantSocketId).emit("newMessage", newMessage);
    }
  });

  res.status(201).json(newMessage);
});

export const getMessages = catchAsync(async (req, res, next) => {
  const { id: userChatId } = req.params;
  const senderId = req.user.id;

  const conversation = await prisma.conversation.findFirst({
    where: {
      participantIds: {
        hasEvery: [senderId, userChatId],
      },
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
  // console.log(conversation);
  if (!conversation) {
    return res.status(200).json([]);
  }
  return res.status(200).json(conversation.messages);
});
