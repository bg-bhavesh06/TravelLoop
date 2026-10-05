# ✈️ Traveloop

**Traveloop** is a premium, full-stack travel planning web application that empowers users to build day-by-day itineraries, track budgets, share journeys with the community, and even generate complete AI-powered trip plans with a single prompt. It features a stunning dark-themed UI and seamless monetization via Razorpay.

---

## 🌟 Key Features

- **AI Trip Planner** — Generate full day-by-day itineraries instantly using the Groq LLaMA 3.3 AI model via high-speed Server-Sent Events (SSE).
- **Premium Traveler Chat (Monetization)** — Users can pay ₹20 (via **Razorpay**) to unlock a secure, real-time private chat room (powered by **Socket.io**) with the trip's creator to get personalized travel advice. Access is valid for 24 hours with live countdowns.
- **Day-by-Day Itinerary Builder** — A comprehensive builder that lets you plan your trip day-by-day, automatically constrained by your trip's start and end dates. Includes drag-and-drop support.
- **Community Feed & Trip Cloning** — Explore public trip plans shared by other travelers. Found the perfect trip? Copy it instantly to your own dashboard with a single click.
- **Budget & Expense Tracking** — Track your daily budget and view beautiful visual breakdowns of expenses via **Recharts** (Pie charts & Bar charts).
- **Packing Checklists & Notes** — Keep your travel essentials organized and maintain custom trip notes.
- **Secure Authentication & Cloud Storage** — Secure JWT-based register/login with automatic profile photo uploads managed by **Cloudinary**.
- **Modern & Responsive UI** — Premium dark glassmorphism design, vibrant gradients, and smooth micro-interactions powered by **Framer Motion**.

---

## 🛠️ Tech Stack

### Frontend (Client)
| Technology | Purpose |
|---|---|
| **React + Vite** | High-performance UI Framework & Build Tool |
| **React Router DOM** | Client-side Routing & Navigation |
| **Framer Motion** | Advanced Animations & Transitions |
| **Socket.io-client** | Real-time chat messaging |
| **Axios** | HTTP Client |
| **Recharts** | Interactive Data Visualizations |
| **Vanilla CSS** | Custom Premium Glassmorphism Design System |

### Backend (Server)
| Technology | Purpose |
|---|---|
| **Node.js + Express** | Robust REST API Server |
| **MongoDB Atlas + Mongoose** | Cloud Database & Schema Validation |
| **Socket.io** | WebSocket server for real-time Premium Chats |
| **Razorpay SDK** | Payment Gateway Integration |
| **Groq SDK (LLaMA 3.3)** | High-speed AI Itinerary Generation |
| **Cloudinary + Multer** | Cloud Storage & Image File Handling |
| **JWT & Bcrypt.js** | Secure Authentication & Password Hashing |

---

## 📁 Project Structure

```text
Traveloop/
├── client/                      # React + Vite frontend
│   └── src/
│       ├── assets/              # Images & SVG icons
│       ├── components/          # Reusable UI components (Modals, Charts, Forms)
│       ├── context/             # React Context (AuthContext)
│       ├── pages/               # Route-level page components (ChatPage, CommunityPage, etc.)
│       ├── services/            # Axios API service modules
│       └── index.css            # Global design tokens and glassmorphism utilities
│
├── server/                      # Node.js + Express backend
│   ├── config/                  # DB, AI, and Payment Gateway configurations
│   ├── controllers/             # Business logic (chatController, paymentController, etc.)
│   ├── middleware/              # JWT verification and error handling
│   ├── models/                  # Mongoose schemas (User, Trip, Chat, Payment, etc.)
│   ├── routes/                  # Express route endpoints
│   ├── utils/                   # Helper scripts and database seeders
│   └── server.js                # App entry point & Socket.io initialization
│
├── .env                         # Environment variables (Root level)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB Atlas** account (or local MongoDB)
- **Groq API Key** (free at [console.groq.com](https://console.groq.com))
- **Cloudinary Account** (for photo uploads)
- **Razorpay Account** (for generating Test API Keys)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/traveloop.git
cd traveloop
```

### 2. Configure Environment Variables

Create a single `.env` file in the **root** directory:

```env
# Server & Database
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/traveloop

# Security
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Frontend Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Cloudinary (Images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Groq AI (Itinerary Generation)
GROQ_API_KEY=your_groq_api_key

# Razorpay (Premium Chat Monetization)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Install Dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 4. Run the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

The app will be available at **http://localhost:5173**.

*(Note: Vite handles the API proxies automatically, seamlessly bridging the frontend to the backend's `/api` and `/socket.io` endpoints).*

---

## 💬 Premium Traveler Chat & Monetization

A core feature of Traveloop is the **Premium Chat** system:
1. Users browse the **Community Page** and find interesting trips.
2. They click **Chat With Traveler** and are presented with a beautiful **Razorpay checkout**.
3. Upon successful payment of ₹20, the backend verifies the Razorpay signature and instantly creates a private **Socket.io** chat room.
4. The user gains access to a real-time messaging interface with the trip's creator.
5. The chat access automatically expires after 24 hours, monitored via a live UI countdown timer.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Prakash Gupta**  
Built with ❤️ for the Odoo Hackathon
