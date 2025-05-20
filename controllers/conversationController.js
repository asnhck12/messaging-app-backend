require("dotenv").config();
const asyncHandler = require("express-async-handler");
const prisma = require('../db/prisma');

exports.find = asyncHandler(async (req, res) => {
  const senderId = req.userId;

  if (!senderId) {
  return res.status(400).json({ error: "No User ID" });
}

try {
  const allConversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: senderId },
      },
    },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  const filteredConversations = allConversations.map((conversation) => ({
    ...conversation,
    participants: conversation.participants.filter(
      (participant) => participant.userId !== senderId
    ),
  }));

  return res.status(200).json({ conversations: filteredConversations });
} catch (error) {
  console.error("Error finding conversations:", error);
  res.status(500).json({ error: "Internal server error" });
}
});


exports.findOrCreate = asyncHandler(async (req, res) => {
  const { selectedUser, groupName } = req.body;
  const senderId = req.userId;

  if (!senderId || typeof senderId !== 'number' || !Array.isArray(selectedUser)) {
    return res.status(400).json({ error: "Users must be an array." });
  }

  const allParticipantIds = Array.from(new Set([...selectedUser, senderId]));

  if (allParticipantIds.length < 2) {
    return res.status(400).json({ error: "At least two unique users required." });
  }

  try {
    const sortedParticipantIds = [...allParticipantIds].sort();
    const sharedConversations = await prisma.Conversation.findMany({
      where: {
        participants: {
          some: { userId: {in: allParticipantIds} },
        },
      },
      include: {
        participants: true,
      },
    });

const existing = sharedConversations.find((convo) => {
  const ids = convo.participants.map(u => u.userId).sort();
  return (
    ids.length === sortedParticipantIds.length &&
    ids.every((id, idx) => id === sortedParticipantIds[idx])
  );
});

    if (existing) {
      return res.status(200).json({ conversation: existing });
    }

    const isGroup = allParticipantIds.length > 2;
    const newConversation = await prisma.Conversation.create({
      data: {
        isGroup,
        name: isGroup ? (groupName || `Group Chat (${Date.now()})`) : null,
        participants: {
          create: allParticipantIds.map((id) => ({
            user: { connect: { id } },
          })),
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
