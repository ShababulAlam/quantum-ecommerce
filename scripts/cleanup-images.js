// scripts/cleanup-images.js
/**
 * Script to find and remove unused images from the uploads folder
 *
 * Usage:
 * node scripts/cleanup-images.js
 *
 * Optional flags:
 * --dry-run: Only report what would be deleted without actually deleting
 * --verbose: Show more detailed logs
 */

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

// Initialize Prisma client
const prisma = new PrismaClient();

// Configuration
const uploadsDir = path.join(process.cwd(), "public", "uploads");
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isVerbose = args.includes("--verbose");

async function main() {
  try {
    console.log(`🔍 Scanning for unused images in ${uploadsDir}`);

    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.error(`❌ Uploads directory not found: ${uploadsDir}`);
      return;
    }

    // Get all files in uploads directory
    const files = fs.readdirSync(uploadsDir);
    console.log(`📂 Found ${files.length} files in uploads directory`);

    // Get all image URLs from database
    const productImages = await prisma.productImage.findMany({
      select: { url: true },
    });

    console.log(`🖼️ Found ${productImages.length} product images in database`);

    // Get user profile images
    const userImages = await prisma.user.findMany({
      where: { image: { not: null } },
      select: { image: true },
    });

    console.log(
      `👤 Found ${userImages.length} user profile images in database`,
    );

    // Combine all used image URLs
    const usedImageUrls = [
      ...productImages.map((img) => img.url),
      ...userImages.filter((u) => u.image).map((u) => u.image),
    ];

    // Extract filenames from URLs
    const usedFilenames = usedImageUrls.map((url) => url.split("/").pop());

    if (isVerbose) {
      console.log("🔍 Used filenames:");
      usedFilenames.forEach((filename) => console.log(`   - ${filename}`));
    }

    // Find unused files
    const unusedFiles = files.filter((file) => !usedFilenames.includes(file));

    console.log(`🗑️ Found ${unusedFiles.length} unused files`);

    if (isVerbose) {
      console.log("🔍 Unused files:");
      unusedFiles.forEach((file) => console.log(`   - ${file}`));
    }

    // Delete unused files
    let deleted = 0;
    let errors = 0;

    for (const file of unusedFiles) {
      const filePath = path.join(uploadsDir, file);

      if (isDryRun) {
        console.log(`🔍 Would delete: ${filePath}`);
      } else {
        try {
          fs.unlinkSync(filePath);
          deleted++;
          if (isVerbose) {
            console.log(`✅ Deleted: ${filePath}`);
          }
        } catch (error) {
          errors++;
          console.error(`❌ Error deleting file ${file}:`, error.message);
        }
      }
    }

    if (isDryRun) {
      console.log(
        `🔍 Dry run complete. Would have deleted ${unusedFiles.length} files.`,
      );
    } else {
      console.log(
        `✅ Cleanup complete: ${deleted} files deleted, ${errors} errors`,
      );
    }
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
