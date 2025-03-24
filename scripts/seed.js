// scripts/seed.js
/**
 * Seed script to populate database with initial data
 *
 * Usage:
 * node scripts/seed.js
 */

const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create admin user
  const adminPassword = await hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`👤 Created admin user: ${admin.email}`);

  // Create test user
  const userPassword = await hash("test123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Test User",
      password: userPassword,
      role: "CUSTOMER",
    },
  });
  console.log(`👤 Created test user: ${user.email}`);

  // Create categories
  const categories = [
    {
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and gadgets",
    },
    {
      name: "Clothing",
      slug: "clothing",
      description: "Apparel and fashion items",
    },
    {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description: "Products for your home",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`📁 Created ${categories.length} categories`);

  // Create products
  const products = [
    {
      name: "Quantum Smartwatch",
      slug: "quantum-smartwatch",
      description:
        "Stay connected with our state-of-the-art smartwatch featuring health monitoring, notifications, and more.",
      price: 199.99,
      compareAtPrice: 249.99,
      inventory: 50,
      isVisible: true,
      isFeatured: true,
      categories: [{ slug: "electronics" }],
      images: [
        {
          url: "/uploads/quantum-smartwatch-1.jpg",
          alt: "Quantum Smartwatch main view",
          isDefault: true,
        },
        {
          url: "/uploads/quantum-smartwatch-2.jpg",
          alt: "Quantum Smartwatch side view",
          isDefault: false,
        },
      ],
    },
    {
      name: "Orbit Fitness Tracker",
      slug: "orbit-fitness-tracker",
      description:
        "Track your fitness goals with precision. Features step counting, heart rate monitoring, and sleep analysis.",
      price: 89.99,
      compareAtPrice: 119.99,
      inventory: 75,
      isVisible: true,
      isFeatured: true,
      categories: [{ slug: "electronics" }],
      images: [
        {
          url: "/uploads/orbit-fitness-tracker-1.jpg",
          alt: "Orbit Fitness Tracker main view",
          isDefault: true,
        },
      ],
    },
    {
      name: "Nova Wireless Headphones",
      slug: "nova-wireless-headphones",
      description:
        "Immerse yourself in crystal-clear audio with these premium wireless headphones featuring noise cancellation.",
      price: 149.99,
      compareAtPrice: null,
      inventory: 30,
      isVisible: true,
      isFeatured: false,
      categories: [{ slug: "electronics" }],
      images: [
        {
          url: "/uploads/nova-headphones-1.jpg",
          alt: "Nova Wireless Headphones",
          isDefault: true,
        },
      ],
    },
    {
      name: "Cosmic Cotton T-Shirt",
      slug: "cosmic-cotton-t-shirt",
      description:
        "Ultra-soft cotton t-shirt with a modern fit and stylish design.",
      price: 24.99,
      compareAtPrice: 29.99,
      inventory: 100,
      isVisible: true,
      isFeatured: false,
      categories: [{ slug: "clothing" }],
      images: [
        {
          url: "/uploads/cosmic-tshirt-1.jpg",
          alt: "Cosmic Cotton T-Shirt front view",
          isDefault: true,
        },
      ],
    },
    {
      name: "Stellar Kitchen Blender",
      slug: "stellar-kitchen-blender",
      description:
        "Powerful blender for smoothies, soups, and more with multiple speed settings.",
      price: 79.99,
      compareAtPrice: 99.99,
      inventory: 45,
      isVisible: true,
      isFeatured: true,
      categories: [{ slug: "home-kitchen" }],
      images: [
        {
          url: "/uploads/stellar-blender-1.jpg",
          alt: "Stellar Kitchen Blender",
          isDefault: true,
        },
      ],
    },
  ];

  for (const product of products) {
    // Create the product
    const createdProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        inventory: product.inventory,
        isVisible: product.isVisible,
        isFeatured: product.isFeatured,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        inventory: product.inventory,
        isVisible: product.isVisible,
        isFeatured: product.isFeatured,
      },
    });

    // Link to categories
    for (const category of product.categories) {
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category.slug },
      });

      if (categoryRecord) {
        await prisma.productToCategory.upsert({
          where: {
            productId_categoryId: {
              productId: createdProduct.id,
              categoryId: categoryRecord.id,
            },
          },
          update: {},
          create: {
            productId: createdProduct.id,
            categoryId: categoryRecord.id,
          },
        });
      }
    }

    // Add images
    for (const [index, image] of product.images.entries()) {
      await prisma.productImage.upsert({
        where: {
          id: `${createdProduct.id}-${index}`,
        },
        update: {
          url: image.url,
          alt: image.alt,
          isDefault: image.isDefault,
          sortOrder: index,
        },
        create: {
          id: `${createdProduct.id}-${index}`,
          productId: createdProduct.id,
          url: image.url,
          alt: image.alt,
          isDefault: image.isDefault,
          sortOrder: index,
        },
      });
    }
  }
  console.log(`📦 Created ${products.length} products`);

  // Create promo codes
  const promoCodes = [
    {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "PERCENTAGE",
      discountAmount: 10,
      minimumAmount: 50,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      usageLimit: 1000,
      isActive: true,
    },
    {
      code: "FREESHIP",
      description: "Free shipping on all orders",
      discountType: "FIXED_AMOUNT",
      discountAmount: 10,
      minimumAmount: 75,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      usageLimit: 500,
      isActive: true,
    },
  ];

  for (const promoCode of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promoCode.code },
      update: {},
      create: promoCode,
    });
  }
  console.log(`🏷️ Created ${promoCodes.length} promo codes`);

  console.log("✅ Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
