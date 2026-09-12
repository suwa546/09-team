import prismaPackage from "@prisma/client";
import bcrypt from "bcryptjs";

const { PrismaClient } = prismaPackage;
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("staff1234", 12);
  await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: { passwordHash },
    create: {
      name: "デモスタッフ",
      email: "staff@example.com",
      passwordHash,
      role: "STAFF",
    },
  });
}

main()
  .then(() => console.log("Demo user: staff@example.com / staff1234"))
  .finally(() => prisma.$disconnect());
