const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  try {
    await db.Category.createMany({
      data: [
        {
          name: "Influential Personalities",
        },
        {
          name: "Movies & TV",
        },
        {
          name: "Philosophy",
        },
        {
          name: "Games",
        },
        {
          name: "Scientists",
        },
      ],
    });
  } catch (error) {
    console.log("Error seeding default cateogires", error);
  } finally {
    await db.$disconnect();
  }
}

main();
