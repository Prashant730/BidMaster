# 🎯 BidMaster - Online Auction Platform

A modern, real-time auction platform built with React and Vite. Features a professional dark/light theme, live bidding, and comprehensive auction management.

![React](https://img.shields.io/badge/React-19.1-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan?logo=tailwindcss)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?logo=socket.io)

## ✨ Features

### For Bidders

- Browse live auctions across multiple categories (Watches, Art, Collectibles, Furniture, Electronics, Jewelry)
- Real-time bidding with live price updates
- Bid history tracking
- User profile management
- Auction countdown timers

### For Auctioneers/Sellers

- Create and manage auctions
- Auctioneer dashboard with analytics
- Three-minute rule auto-extension
- Extend, cancel, or finalize auctions
- Track bids across all listings

### For Admins

- User management and approval
- Seller verification system
- Commission rate configuration
- Platform-wide auction oversight

### UI/UX

- Professional dark theme with 60-30-10 color rule (Black/White/Gold)
- Fully responsive design (mobile-first)
- Smooth animations and transitions
- WCAG AAA accessibility compliance

## 🚀 Quick Start

### 🖱️ One-Click Start (Fastest)

- Double-click `START_BIDMASTER.bat` from the repo root. It launches backend + frontend and opens the browser automatically.

### ⚡ New User? Start Here!

**For complete setup instructions, see:**

- 📖 **[START_HERE.md](START_HERE.md)** - Simple explanation of what to do
- ✅ **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Step-by-step checklist
- 🚀 **[QUICKSTART.md](QUICKSTART.md)** - Quick commands
- 📚 **[BACKEND_SETUP_GUIDE.md](BACKEND_SETUP_GUIDE.md)** - Detailed backend guide

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or Local)
- npm or yarn

### Basic Setup

**1. Setup MongoDB** (choose one):

- **Cloud**: Create free MongoDB Atlas account at https://mongodb.com/cloud/atlas
- **Local**: Install MongoDB Community Server

**2. Backend Setup:**

```bash
cd backend
npm install
# Create .env file with MongoDB connection string
npm run dev
```

**3. Frontend Setup:**

```bash
cd project1
npm install
npm run dev
```

**4. Seed Database (optional):**

```bash
cd backend
node seed.js
```

**5. Open:** http://localhost:5174

### Test Accounts (after seeding)

- Admin: `admin@auction.com` / `admin123`
- Seller: `seller1@auction.com` / `seller123`
- Bidder: `bidder1@auction.com` / `bidder123`

### Useful Commands

- Backend: `cd backend && npm run dev`
- Frontend: `cd project1 && npm run dev`
- Seed data: `cd backend && node seed.js`

### Old Installation Method (Frontend Only)

```bash
# Clone the repository
git clone https://github.com/Prashant730/BidMaster.git

# Navigate to project directory
cd BidMaster/project1

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router DOM
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 3.4, Custom CSS
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios
- **Linting**: ESLint 9

## 📁 Project Structure

```
project1/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx       # Navigation header
│   │   ├── Hero.jsx         # Landing hero section
│   │   ├── AuctionGrid.jsx  # Auction listings grid
│   │   ├── AuctionDetail.jsx # Single auction view
│   │   ├── CreateAuction.jsx # Auction creation form
│   │   ├── LoginModal.jsx   # Authentication modal
│   │   ├── UserProfile.jsx  # User profile page
│   │   ├── Admin.jsx        # Admin dashboard
│   │   ├── AuctioneerDashboard.jsx # Seller dashboard
│   │   └── ...
│   ├── context/             # React Context providers
│   ├── services/            # API services
│   ├── index.css            # Global styles
│   └── dark-theme-professional.css # Dark theme
├── public/                  # Static assets
└── package.json
```

## 🧭 Documentation Map

- **[INDEX.md](docs/INDEX.md)** – master index for every guide
- **[SYSTEM_VERIFICATION.md](docs/SYSTEM_VERIFICATION.md)** – end-to-end test checklist
- **[PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md)** – delivery/feature summary
- **[IMPLEMENTATION_COMPLETE.md](docs/IMPLEMENTATION_COMPLETE.md)** – integration details
- **[DEPLOY_BACKEND.md](docs/DEPLOY_BACKEND.md)** / **[VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md)** – deployment playbooks

## 🎨 Theme

The app features a professional dark theme following the 60-30-10 design rule:

- **60% Black**: Backgrounds (#000000, #111111)
- **30% White/Gray**: Text (#ffffff, #e5e7eb)
- **10% Gold**: Accents (#fbbf24) - prices, badges, CTAs

## 👤 User Roles

| Role           | Access                                           |
| -------------- | ------------------------------------------------ |
| **Bidder**     | Browse auctions, place bids, view profile        |
| **Auctioneer** | Create auctions, manage listings, track bids     |
| **Admin**      | Full platform access, user management, approvals |

### Demo Login

- Regular user: `user@example.com`
- Admin: `admin@admin.com`
- Seller: `seller@seller.com`

## 📜 Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## 🌐 Deployment

The project includes Vercel configuration for easy deployment:

```bash
# Deploy to Vercel
vercel --prod
```

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ by [Prashant](https://github.com/Prashant730)- Bid history tracking
- User profile management
- Auction countdown timers

### For Auctioneers/Sellers

- Create and manage auctions
- Auctioneer dashboard with analytics
- Three-minute rule auto-extension
- Extend, cancel, or finalize auctions
- Track bids across all listings

### For Admins

- User management and approval
- Seller verification system
- Commission rate configuration
- Platform-wide auction oversight

### UI/UX

- Professional dark theme with 60-30-10 color rule (Black/White/Gold)
- Fully responsive design (mobile-first)
- Smooth animations and transitions
- WCAG AAA accessibility compliance

## 🚀 Quick Start

### ⚡ New User? Start Here!

**For complete setup instructions, see:**

- 📖 **[START_HERE.md](START_HERE.md)** - Simple explanation of what to do
- ✅ **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Step-by-step checklist
- 🚀 **[QUICKSTART.md](QUICKSTART.md)** - Quick commands
- 📚 **[BACKEND_SETUP_GUIDE.md](BACKEND_SETUP_GUIDE.md)** - Detailed backend guide

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or Local)
- npm or yarn

### Basic Setup

**1. Setup MongoDB** (choose one):

- **Cloud**: Create free MongoDB Atlas account at https://mongodb.com/cloud/atlas
- **Local**: Install MongoDB Community Server

**2. Backend Setup:**

```bash
cd backend
npm install
# Create .env file with MongoDB connection string
npm run dev
```

**3. Frontend Setup:**

```bash
cd project1
npm install
npm run dev
```

**4. Seed Database (optional):**

```bash
cd backend
node seed.js
```

**5. Open:** http://localhost:5174

### Old Installation Method (Frontend Only)

```bash
# Clone the repository
git clone https://github.com/Prashant730/BidMaster.git

# Navigate to project directory
cd BidMaster/project1

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router DOM
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 3.4, Custom CSS
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios
- **Linting**: ESLint 9

## 📁 Project Structure

```
project1/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx       # Navigation header
│   │   ├── Hero.jsx         # Landing hero section
│   │   ├── AuctionGrid.jsx  # Auction listings grid
│   │   ├── AuctionDetail.jsx # Single auction view
│   │   ├── CreateAuction.jsx # Auction creation form
│   │   ├── LoginModal.jsx   # Authentication modal
│   │   ├── UserProfile.jsx  # User profile page
│   │   ├── Admin.jsx        # Admin dashboard
│   │   ├── AuctioneerDashboard.jsx # Seller dashboard
│   │   └── ...
│   ├── context/             # React Context providers
│   ├── services/            # API services
│   ├── index.css            # Global styles
│   └── dark-theme-professional.css # Dark theme
├── public/                  # Static assets
└── package.json
```

## 🎨 Theme

The app features a professional dark theme following the 60-30-10 design rule:

- **60% Black**: Backgrounds (#000000, #111111)
- **30% White/Gray**: Text (#ffffff, #e5e7eb)
- **10% Gold**: Accents (#fbbf24) - prices, badges, CTAs

## 👤 User Roles

| Role           | Access                                           |
| -------------- | ------------------------------------------------ |
| **Bidder**     | Browse auctions, place bids, view profile        |
| **Auctioneer** | Create auctions, manage listings, track bids     |
| **Admin**      | Full platform access, user management, approvals |

### Demo Login

- Regular user: `user@example.com`
- Admin: `admin@admin.com`
- Seller: `seller@seller.com`

## 📜 Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## 🌐 Deployment

The project includes Vercel configuration for easy deployment:

```bash
# Deploy to Vercel
vercel --prod
```

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ by [Prashant](https://github.com/Prashant730)
