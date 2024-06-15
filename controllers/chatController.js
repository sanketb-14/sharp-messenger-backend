import prisma from "../DB/db.config.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const fetchAllChatUsers = catchAsync(async (req, res, next) => {
  const users = await prisma.user.findMany({
    where: {
      id: {
        not: req.user.id,
      },
    },
    select: {
      id: true,
      fullName:true,
      profilePic:true
    },
  });

  return res.status(200).json(users);
});

export const sendMessage = catchAsync(async(req,res,next) => {
    const {message} = req.body
    const {chatId:receiverId} = req.params
    const senderId = req.user.id

    // check if their is chat between them and their receiver

    let conversation = await prisma.conversation.findFirst({
        where:{ participantIds:{
            hasEvery:[senderId,receiverId]
        }
    }
    })
    if(!conversation){
        conversation = await prisma.conversation.create({
            data:{
                participantIds:{set:[senderId,receiverId]
            }
            }
        })
    }

    //if not found we create a new conversation

    const newMessage = await prisma.message.create({
        data:{
            body:message,
            senderId,
            conversationId:conversation.id
        }
    })


    //we connect message and conversation table 

    if(newMessage){
        conversation = await prisma.conversation.update({
            where:{
                id:conversation.id
            },

            data:{
                messages:{
                    connect:{
                        id:newMessage.id
                    }
                }
            }
        })
    }

    // socket will be added

    res.status(201).json(newMessage)


})

export const getMessages = catchAsync(async(req,res,next) => {
    const {chatId:userChatId} = req.params
    const senderId = req.user.id

    const conversation = await prisma.conversation.findFirst({
        where:{
            participantIds:{
                hasEvery:[userChatId,senderId]
            }
        },
        include:{
            messages:{
                orderBy:{
                    createdAt:"asc"
                }
            }
        }
    })
    if(!conversation){
        return res.status(200).json([])
    }
    return res.status(200).json(conversation.messages)
})

export const accessSingleChat = catchAsync(async (req, res) => {
    const { userId } = req.body;
  
    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }
  
    let chat = await prisma.chat.findFirst({
      where: {
        isGroupChat: false,
        user: {
        
            id: { in: [req.user.id, userId ] },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePic: true,
          },
        },
        message: {
          orderBy: {
            sentAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                email: true,
                profilePic: true,
              },
            },
          },
        },
      },
    });
  
    if (chat) {
      res.send(chat);
    } else {
      const chatData = {
        isGroupChat: false,
        user: {
          connect: [{ id: req.user.id }, { id: userId }],
        },
      };
  
      try {
        const createdChat = await prisma.chat.create({ data: chatData });
        const fullChat = await prisma.chat.findUnique({
          where: { id: createdChat.id },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                profilePic: true,
              },
            },
            message: {
              orderBy: {
                sentAt: "desc",
              },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                    profilePic: true,
                  },
                },
              },
            },
          },
        });
        res.status(200).json(fullChat);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
  });