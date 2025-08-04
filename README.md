
# 💬 ChatUp – Real-Time Chat Application

ChatUp is a modern real-time chat application built for seamless communication. With secure messaging, responsive UI, and instant updates, ChatUp is designed for users who want fast and reliable chats — anytime, anywhere.

---

## 🚀 Features

- 🔐 User Authentication (Clerk)
- 💬 One-on-One  Chats
- 📱 Responsive Design – Mobile to Desktop

---

## 🛠️ Tech Stack

**Frontend:**
- React.js 
- Tailwind CSS / shadcn
- Clerk (for authentication)

**Backend:**
- Node.js + Express
- MongoDB (Mongoose)

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Satyendra0007/chatup.git
cd chatup
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the backend directory and add:

```env
MONGO_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
FRONTEND_URL=frontend url

```

Create a `.env` file in the frontend directory and add:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_SERVER_URL=backend_url

```

### 4. Run the App
For Frontend:
```bash
cd client
npm run dev
```
For Backend:
```bash
cd server
npm run dev
```
---


