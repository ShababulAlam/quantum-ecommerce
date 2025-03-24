// lib/media.ts
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";
import { NextRequest } from "next/server";
import prisma from "./db";

// Define the uploads directory
const uploadsDir = path.join(process.cwd(), "public", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

interface UploadedImage {
  filename: string;
  path: string;
  url: string;
}

// Handle image upload
export async function uploadImage(req: NextRequest): Promise<UploadedImage> {
  // Ensure request is multipart form data
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    throw new Error("Content type must be multipart/form-data");
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("File is required");
  }

  // Validate file type
  const fileType = file.type;
  if (!fileType.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  // Get file extension
  const fileExtension = fileType.split("/")[1];
  const validExtensions = ["jpeg", "jpg", "png", "gif", "webp"];

  if (!validExtensions.includes(fileExtension)) {
    throw new Error("Invalid image format");
  }

  // Create a safe filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const safeFilename = `${timestamp}-${randomString}.${fileExtension}`;

  // Create full path
  const filepath = path.join(uploadsDir, safeFilename);

  // Convert file to Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Write file to uploads directory
  await writeFile(filepath, buffer);

  // Return file info
  return {
    filename: safeFilename,
    path: filepath,
    url: `/uploads/${safeFilename}`,
  };
}

// Delete an image
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract filename from URL
    const filename = url.split("/").pop();

    if (!filename) {
      throw new Error("Invalid file URL");
    }

    const filepath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return false;
    }

    // Delete file
    fs.unlinkSync(filepath);
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

// Find unused images and clean them up
export async function cleanupUnusedImages(): Promise<{
  removed: number;
  errors: number;
}> {
  let removed = 0;
  let errors = 0;

  try {
    // Get all files in uploads directory
    const files = fs.readdirSync(uploadsDir);

    // Get all image URLs from database
    const productImages = await prisma.productImage.findMany({
      select: { url: true },
    });

    // Get user profile images
    const userImages = await prisma.user.findMany({
      where: { image: { not: null } },
      select: { image: true },
    });

    // Combine all used image URLs
    const usedImageUrls = [
      ...productImages.map((img) => img.url),
      ...userImages.filter((u) => u.image).map((u) => u.image as string),
    ];

    // Extract filenames from URLs
    const usedFilenames = usedImageUrls.map((url) => url.split("/").pop());

    // Find unused files
    const unusedFiles = files.filter((file) => !usedFilenames.includes(file));

    // Delete unused files
    for (const file of unusedFiles) {
      try {
        fs.unlinkSync(path.join(uploadsDir, file));
        removed++;
      } catch (error) {
        console.error(`Error deleting file ${file}:`, error);
        errors++;
      }
    }

    return { removed, errors };
  } catch (error) {
    console.error("Error cleaning up unused images:", error);
    return { removed, errors: 1 };
  }
}
