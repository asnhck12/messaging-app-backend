// db/createGlobalChat.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createGlobalChat() {
  try {
    // Upsert Global Chat
    const globalChat = await prisma.conversation.upsert({
      where: { name: 'Global Chat' },
      update: {},
      create: {
        name: 'Global Chat',
        isGroup: true,
      },
    });

    console.log(`✅ Global Chat ID: ${globalChat.id}`);

    // Get all users
    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
      },
    });

    // Create participant entries
    for (const user of users) {
      const existing = await prisma.conversationParticipant.findUnique({
        where: {
          userId_conversationId: {
            userId: user.id,
            conversationId: globalChat.id,
          },
        },
      });

      if (!existing) {
        await prisma.conversationParticipant.create({
          data: {
            userId: user.id,
            conversationId: globalChat.id,
          },
        });

        console.log(`Added user ${user.username} to Global Chat`);
      } else {
        console.log(`User ${user.username} is already in Global Chat`);
      }
    }

    console.log('All users added to Global Chat!');
  } catch (err) {
    console.error('Error creating Global Chat:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createGlobalChat();
