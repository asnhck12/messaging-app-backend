require("dotenv").config();
const asyncHandler = require("express-async-handler");
const prisma = require('../db/prisma');

exports.getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
  
    const messages = await prisma.Message.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  
    res.status(200).json(messages);
  });
    
  exports.newMessage = asyncHandler(async (req, res, next) => {
    const { content, conversationId } = req.body;
    const senderId = req.user.id;
  
    try {
      await prisma.Message.create({
        data: {
          content,
          senderId,
          conversationId: parseInt(conversationId),
        },
      });
  
      res.status(201).json({ message: "Message created successfully" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  });
  