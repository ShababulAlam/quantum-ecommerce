// scripts/create-admin.js
const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Creating admin user...");

  try {
    // Delete existing admin user if exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    });

    if (existingAdmin) {
      console.log("Deleting existing admin user...");
      await prisma.user.delete({
        where: { id: existingAdmin.id },
      });
    }

    // Generate password hash
    const password = "admin123";
    const hashedPassword = await hash(password, 10);
    console.log("Password hash generated");

    // Create new admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log(`Admin user created with ID: ${admin.id}`);
    console.log("Login details:");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
