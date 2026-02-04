# Who's Going? 🏃

A production-ready micro-logistics web application for coordinating group orders. Built with Next.js 16, MongoDB, TypeScript, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## 🎯 Features

- ✅ **Simple Authentication** - Name-only login (no passwords)
- ✅ **Create Runs** - Post where you're going and when
- ✅ **Join Runs** - Add your items to existing runs
- ✅ **Live Countdown** - Real-time timer with auto-close
- ✅ **Shopping Checklist** - Runner gets consolidated list
- ✅ **Payment Tracking** - Per-user totals and payment status
- ✅ **Mobile-First** - Responsive design for all devices
- ✅ **Clean UI** - Boutique aesthetic with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)

### Installation

```bash
# Clone the repository
git clone https://github.com/BenjaminMensah-2255/whos-going.git
cd whos-going

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local and add your MongoDB connection string
```

### MongoDB Setup

**Option 1: MongoDB Atlas (Recommended)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Add to `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whos-going
```

**Option 2: Local MongoDB**

```bash
# Install MongoDB locally
# Start MongoDB service
mongod --dbpath /path/to/data

# Add to .env.local
MONGODB_URI=mongodb://localhost:27017/whos-going
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 How It Works

### 1. Login

Enter your name (no password needed) to get started.

### 2. Create a Run

- Click "+ New Run"
- Enter vendor name (e.g., "Chipotle")
- Select departure time (5-120 minutes)
- Add optional note

### 3. Add Items

- Click on any run
- Click "+ Add Item"
- Enter item details (name, quantity, price)

### 4. Runner View

If you created the run, you'll see:

- **Shopping List** - Items grouped by name
- **Payment Tracking** - Checkbox for each item
- **Payment Summary** - Per-user totals
- **Run Management** - Close or complete the run

### 5. Status Flow

- **Open** → Accepting items, timer counting down
- **Closed** → No more items, runner shopping
- **Completed** → Archived

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS v4
- **State**: Server Actions + React hooks
- **Auth**: Cookie-based (HTTP-only)

## 📁 Project Structure

```
whos-going/
├── app/
│   ├── actions/           # Server Actions
│   ├── login/             # Login page
│   ├── runs/              # Run pages
│   └── globals.css        # Tailwind theme
├── components/            # React components
├── lib/
│   ├── db/models/         # MongoDB models
│   └── utils/             # Helper functions
└── .env.local             # Environment variables
```

## 🎨 Design System

### Color Palette

- **Cream** (#FAF8F5) - Background
- **Beige** (#E8E3DA) - Secondary background
- **Sand** (#D4CFC4) - Borders
- **Charcoal** (#2C2C2C) - Primary text
- **Warm Gray** (#8B8680) - Muted text

### Components

- `.card` - White card with shadow
- `.btn-primary` - Dark button
- `.btn-secondary` - Outlined button
- `.input-field` - Form input
- `.badge` - Status badge

## 🔐 Security

- HTTP-only cookies for authentication
- Server-side validation on all actions
- Authorization checks (users can only edit their own items)
- Input sanitization and validation
- CSRF protection via Next.js

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BenjaminMensah-2255/whos-going)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Set in Vercel dashboard:

- `MONGODB_URI` - Your MongoDB connection string

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 API Reference

### Server Actions

**User Actions**

- `loginUser(name)` - Login or create user
- `getCurrentUser()` - Get authenticated user

**Run Actions**

- `createRun(data)` - Create new run
- `getActiveRuns()` - Get all active runs
- `getRunById(id)` - Get run with items
- `closeRun(id)` - Close run (runner only)
- `completeRun(id)` - Complete run (runner only)

**Item Actions**

- `addItem(runId, data)` - Add item to run
- `updateItem(id, data)` - Update item (owner only)
- `deleteItem(id)` - Delete item (owner only)
- `toggleItemPaid(id)` - Toggle paid status (runner only)

## 🐛 Troubleshooting

### MongoDB Connection Error

- Check `MONGODB_URI` in `.env.local`
- Ensure MongoDB is running (if local)
- Check network access in Atlas (if cloud)

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning or production.

## 👨‍💻 Author

**Benjamin Mensah**

- GitHub: [@BenjaminMensah-2255](https://github.com/BenjaminMensah-2255)

## 🙏 Acknowledgments

Built as a production MVP for group order coordination using modern web technologies.

---

**Ready to coordinate your next group order?** 🚀

[Live Demo](https://whos-going.vercel.app) • [Report Bug](https://github.com/BenjaminMensah-2255/whos-going/issues) • [Request Feature](https://github.com/BenjaminMensah-2255/whos-going/issues)
