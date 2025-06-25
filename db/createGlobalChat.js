  import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createGlobalChat() {
  const globalChat = await prisma.conversation.upsert({
    where: { name: "Global Chat" },
    update: {},
    create: {
      name: "Global Chat",
      isGroup: true,
    },
  });

  console.log("Global chat created or retrieved:", globalChat);
  await prisma.$disconnect();
}

// Run the function
createGlobalChat().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
