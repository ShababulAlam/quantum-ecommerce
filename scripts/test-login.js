// scripts/test-login.js
const { PrismaClient } = require("@prisma/client");
const { compare, hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Testing admin login...");

  // Check if the admin user exists
  const admin = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  console.log("Admin user found in database:", admin ? "Yes" : "No");

  if (admin) {
    console.log("Admin ID:", admin.id);
    console.log("Admin role:", admin.role);

    // Test the password
    console.log("\nTesting password...");
    const testPassword = "admin123";
    const isPasswordValid = await compare(testPassword, admin.password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.log(
        "\nPassword comparison failed. Creating a new password hash for comparison:",
      );
      const newHash = await hash(testPassword, 10);
      console.log("New hash:", newHash);
      console.log("Stored hash:", admin.password);

      // Update the password in the database to fix the issue
      console.log("\nUpdating admin password in database...");
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: newHash },
      });
      console.log("Password updated successfully!");
    }
  } else {
    console.log("\nAdmin user not found. Creating admin user...");
    const adminPassword = await hash("admin123", 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin User",
        password: adminPassword,
        role: "ADMIN",
      },
    });
    console.log("Admin user created with ID:", newAdmin.id);
  }

  // Final check
  const finalAdmin = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  console.log("\nFinal admin check:");
  console.log("Admin exists:", finalAdmin ? "Yes" : "No");

  if (finalAdmin) {
    const testPassword = "admin123";
    const isPasswordValid = await compare(testPassword, finalAdmin.password);
    console.log("Password valid:", isPasswordValid);
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
