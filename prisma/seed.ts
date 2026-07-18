import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { hashPassword } from "../src/lib/password.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_CLINICIAN_EMAIL;
  const password = process.env.SEED_CLINICIAN_PASSWORD;
  const name = process.env.SEED_CLINICIAN_NAME ?? "Clinician";

  if (!email || !password) {
    throw new Error(
      "Set SEED_CLINICIAN_EMAIL and SEED_CLINICIAN_PASSWORD in .env before seeding.",
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, name, mustChangePassword: true },
    create: { email: email.toLowerCase(), passwordHash, name, mustChangePassword: true },
  });

  console.log(`Seeded clinician user: ${user.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
