require("dotenv").config();
const asyncHandler = require("express-async-handler");
const prisma = require('../db/prisma');

exports.findOrCreate = asyncHandler(async (req, res) => {
  const { userId1, userId2 } = req.body;

  if (!userId1 || !userId2 || userId1 === userId2) {
    return res.status(400).json({ error: "Two distinct user IDs are required." });
  }

  try {
    // Step 1: Find all shared conversations between the two users
    const sharedConversations = await prisma.Conversation.findMany({
      where: {
        participants: {
          some: { userId: userId1 },
        },
        AND: {
          participants: {
            some: { userId: userId2 },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    // Step 2: Filter to conversations with EXACTLY 2 participants
    const existing = sharedConversations.find(
      convo => convo.participants.length === 2
    );

    if (existing) {
      return res.status(200).json({ conversation: existing });
    }

    // Step 3: Create new 1-on-1 conversation
    const newConversation = await prisma.Conversation.create({
      data: {
        participants: {
          create: [
            { user: { connect: { id: userId1 } } },
            { user: { connect: { id: userId2 } } },
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
