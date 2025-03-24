# Quantum E-Commerce

A sleek, modern e-commerce platform built with Next.js 14, featuring animation transitions and a seamless checkout experience.

## 🚀 Features

- **Modern UI** - Sleek design with smooth animations and transitions
- **Fullstack Solution** - Both frontend and backend in a single project
- **Authentication** - User and admin authentication system
- **Product Management** - Complete product listing and detail pages
- **Shopping Cart** - Interactive cart with real-time updates
- **Checkout Process** - Streamlined checkout with payment integration
- **Admin Dashboard** - Comprehensive admin panel for store management
- **Media Management** - Image upload and cleanup functionality
- **SEO Optimized** - Built-in SEO features for better visibility
- **Mobile Responsive** - Fully responsive design for all devices

## 📋 Project Structure

```
quantum-ecommerce/
├── src/
│   ├── app/                          # Next.js 14 app directory
│   │   ├── (admin)/                  # Admin routes grouped
│   │   │   ├── admin/                # Admin dashboard
│   │   │   │   ├── categories/       # Category management
│   │   │   │   ├── customers/        # Customer management
│   │   │   │   ├── dashboard/        # Admin dashboard
│   │   │   │   ├── media/            # Media management
│   │   │   │   ├── orders/           # Order management
│   │   │   │   ├── products/         # Product management
│   │   │   │   ├── promotions/       # Promotions & discounts
│   │   │   │   ├── settings/         # Site settings
│   │   │   │   ├── layout.tsx        # Admin layout
│   │   │   │   ├── page.tsx          # Admin main page
│   │   │   ├── login/                # Admin authentication
│   │   ├── (shop)/                   # Shop routes grouped
│   │   │   ├── cart/                 # Shopping cart page
│   │   │   ├── category/[slug]/      # Category page
│   │   │   ├── checkout/             # Checkout process pages
│   │   │   │   ├── success/          # Checkout success page
│   │   │   ├── product/[slug]/       # Product detail page
│   │   │   ├── search/               # Search results page
│   │   │   ├── user/                 # User account pages
│   │   │   │   ├── account/          # Account settings
│   │   │   │   ├── login/            # User login
│   │   │   │   ├── orders/           # User orders
│   │   │   │   ├── register/         # User registration
│   │   │   │   ├── wishlist/         # User wishlist
│   │   │   ├── layout.tsx            # Shop layout
│   │   │   ├── page.tsx              # Homepage
│   │   ├── api/                      # API routes
│   │   │   ├── admin/                # Admin API endpoints
│   │   │   │   ├── categories/       # Category endpoints
│   │   │   │   ├── customers/        # Customer endpoints
│   │   │   │   ├── media/            # Media endpoints
│   │   │   │   │   ├── cleanup/      # Media cleanup endpoint
│   │   │   │   │   ├── upload/       # Media upload endpoint
│   │   │   │   ├── orders/           # Order endpoints
│   │   │   │   ├── products/         # Product endpoints
│   │   │   │   ├── promotions/       # Promotion endpoints
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   │   ├── [...nextauth]/    # NextAuth.js configuration
│   │   │   │   ├── register/         # User registration endpoint
│   │   │   ├── cart/                 # Cart endpoints
│   │   │   │   ├── items/            # Cart item endpoints
│   │   │   │   │   ├── [id]/         # Cart item by ID endpoint
│   │   │   ├── checkout/             # Checkout endpoints
│   │   │   ├── products/             # Product endpoints
│   │   │   │   ├── [slug]/           # Product by slug endpoint
│   │   │   ├── promocodes/           # Promo code endpoints
│   │   │   │   ├── validate/         # Promo code validation endpoint
│   │   │   ├── test-auth/            # Auth testing endpoint
│   │   ├── error.tsx                 # Global error component
│   │   ├── favicon.ico               # Site favicon
│   │   ├── globals.css               # Global CSS
│   │   ├── layout.tsx                # Root layout component
│   │   ├── not-found.tsx             # 404 page
│   │   ├── robots.txt                # SEO robots file
│   │   ├── sitemap.ts                # Dynamic sitemap generation
│   ├── components/                   # Shared components
│   │   ├── admin/                    # Admin specific components
│   │   ├── auth/                     # Authentication components
│   │   ├── cart/                     # Cart components
│   │   ├── checkout/                 # Checkout components
│   │   ├── common/                   # Common shared components
│   │   ├── layouts/                  # Layout components
│   │   ├── product/                  # Product components
│   │   ├── SessionProvider.tsx       # Next-Auth session provider
│   │   ├── ui/                       # UI components
│   ├── lib/                          # Utility functions and libraries
│   │   ├── auth.ts                   # Authentication utilities
│   │   ├── db.ts                     # Database connection
│   │   ├── media.ts                  # Media handling utilities
│   │   ├── seo.ts                    # SEO utilities
│   │   ├── utils.ts                  # General utilities
│   ├── types/                        # TypeScript type definitions
│   │   ├── next-auth.d.ts            # NextAuth type extensions
├── prisma/                           # Prisma ORM
│   ├── migrations/                   # Database migrations
│   ├── schema.prisma                 # Database schema
├── public/                           # Static files
│   ├── images/                       # Static images
│   ├── uploads/                      # User uploaded content
├── scripts/                          # Utility scripts
│   ├── create-admin.js               # Admin user creation script
│   ├── seed.js                       # Database seeding
│   ├── cleanup-images.js             # Media cleanup script
├── .env                              # Environment variables
├── .env.example                      # Example environment variables
├── .eslintrc.json                    # ESLint configuration
├── .gitignore                        # Git ignore file
├── docker-compose.yml                # Docker compose for development
├── Dockerfile                        # Docker configuration
├── next.config.js                    # Next.js configuration
├── package.json                      # Project dependencies
├── postcss.config.js                 # PostCSS configuration
├── README.md                         # Project documentation
├── tailwind.config.js                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- MySQL database

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/quantum-ecommerce.git
cd quantum-ecommerce
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
# or 
yarn install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Then edit the `.env` file with your database credentials and other settings:

```
# Database
DATABASE_URL="mysql://username:password@localhost:3306/quantum_ecommerce"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

5. **Create admin user**

```bash
node scripts/create-admin.js
```

This will create an admin user with:
- Email: admin@example.com
- Password: admin123

6. **Start the development server**

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🚪 Login Credentials

### Admin User
- Email: admin@example.com
- Password: admin123
- Access: Full admin dashboard at `/admin/dashboard`

### Test User (created by seed script)
- Email: user@example.com
- Password: test123
- Access: Customer account area at `/user/account`

## 🔄 Authentication System

This project uses NextAuth.js for authentication. The authentication flow works as follows:

1. Users can register through the `/user/register` page
2. Login is handled through the `/user/login` page
3. Session management via JWT tokens
4. Role-based access control (Admin vs Customer)

If you encounter authentication issues, you can:
1. Run the test endpoint: `/api/test-auth`
2. Recreate the admin user: `node scripts/create-admin.js`

## 📦 Key Features Details

### Product Management
- Product listings with category filtering
- Detailed product pages with images and specifications
- Admin interface for product CRUD operations

### Shopping Cart
- Add/remove products
- Update quantities
- Apply promotion codes
- Calculate totals with tax and shipping

### Checkout Process
- Shipping address form
- Payment method selection
- Order summary review
- Confirmation page

### Admin Dashboard
- Sales analytics and reporting
- Order management
- Customer management
- Product and category management
- Promotions and discounts
- Media library management

### Media Management
- Image uploads for products
- Automatic cleanup of unused images
- Media library for admin users

## 🧹 Image Cleanup

Unused images can be cleaned up using the cleanup script:

```bash
npm run cleanup-images
```

This will scan for images in the `public/uploads` directory that are not referenced in the database and remove them.

## 🐳 Docker Support

For development with Docker:

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down
```

## 🚀 Deployment

To build for production:

```bash
npm run build
# or
pnpm build
# or
yarn build
```

To start the production server:

```bash
npm start
# or
pnpm start
# or
yarn start
```

## 📚 Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: React Hooks and Context
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Custom components with Lucide React icons
- **Form Validation**: Custom validation with Zod
- **Testing**: (To be implemented)
- **Deployment**: Docker support, ready for deployment

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.