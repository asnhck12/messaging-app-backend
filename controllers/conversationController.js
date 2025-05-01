require("dotenv").config();
const asyncHandler = require("express-async-handler");
const prisma = require('../db/prisma');

exports.findOrCreate = asyncHandler(async (req, res) => {
  const { selectedUser } = req.body;
  const senderId = req.userId;

  if (!senderId || !selectedUser || senderId === selectedUser) {
    return res.status(400).json({ error: "Two distinct user IDs are required." });
  }

  try {
    const sharedConversations = await prisma.Conversation.findMany({
      where: {
        participants: {
          some: { userId: senderId },
        },
        AND: {
          participants: {
            some: { userId: selectedUser },
          },
        },
      },
      include: {
        participants: true,
      },
    });
    const existing = sharedConversations.find(
      convo => convo.participants.length === 2
    );

    if (existing) {
      return res.status(200).json({ conversation: existing });
    }

    const newConversation = await prisma.Conversation.create({
      data: {
        participants: {
          create: [
            { user: { connect: { id: senderId } } },
            { user: { connect: { id: selectedUser } } },
          ],
        },
      },
      include: {
        participants: true,
      },
    });

    res.status(201).json({ conversation: newConversation });
  } catch (error) {
    console.error("Error finding/creating conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
