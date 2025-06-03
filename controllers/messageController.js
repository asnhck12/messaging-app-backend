require("dotenv").config();
const asyncHandler = require("express-async-handler");
const prisma = require('../db/prisma');
const socket = require('../socket');
const {connectedUsers} = socket;

exports.getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user;
 
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
    const senderId = req.userId;
  
    try {
      let imageUrl = null;
      
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }


      const message = await prisma.Message.create({
        data: {
          content,
          senderId,
          conversationId: parseInt(conversationId),
          imageUrl,
        },
        include: {
          sender: {
            select: { id: true, username: true, isDeleted: true},
          },
        },
      });

      const io = socket.getIO();

      const participants = await prisma.conversationParticipant.findMany({
  where: {
    conversationId: parseInt(conversationId),
    userId: { not: senderId },
      },
      select: { userId: true },
    });

for (const participant of participants) {
  const sockets = connectedUsers.get(participant.userId);
  if (sockets) {
    sockets.forEach(socketId => {
      io.to(socketId).emit('conversations_updated');
    });
  }
}

      io.to(conversationId.toString()).emit('receive_message', message
      //   {
      //   id: message.id,
      //   conversationId,
      //   content: message.content,
      //   imageUrl: message.imageUrl,
      //   sender: message.sender,
      //   timestamp: message.createdAt,
      // }
    );
  
      res.status(201).json({ message });
    } catch (error) {
      console.error(error);
      next(error);
    }
  });
  
  exports.markAsRead = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { conversationId } = req.body;

  const unreadMessages = await prisma.message.findMany({
    where: {
      conversationId: parseInt(conversationId),
      reads: {
        none: { userId }
      }
    },
    select: { id: true }
  });

  const data = unreadMessages.map(msg => ({
    messageId: msg.id,
    userId
  }));

  if (data.length > 0) {
    await prisma.messageRead.createMany({
      data,
      skipDuplicates: true
    });
  }

  res.json({ success: true });
});