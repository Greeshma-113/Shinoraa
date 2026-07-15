# Shinoraa 🌸

> **Our Little Sakura World 🌸** - A private relationship web application for two people, designed with cozy pastel themes, floating blossoms, and collaborative activities.

---

## 🚀 Local Run Instructions

### 1. Installation
Install all dependencies in root, client, and server directories:
```bash
npm run install-all
```

### 2. Run in Development
Start both client (Vite on port 5173) and server (Express on port 5000) concurrently:
```bash
npm run dev
```

*Note: The application runs in **Local Database Mock Mode** automatically if no MongoDB environment variable is supplied. All uploaded files and database items are saved in `server/uploads/` and `server/data/`.*

---

## 🌐 Production Deployment Guide

This app is structure-ready to be deployed to **Vercel** (Frontend) and **Render** (Backend).

### 1. Database (MongoDB Atlas)
1. Register for a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2. Create a database user and copy the connection string.

### 2. Backend (Render)
1. Host your repository on GitHub.
2. Sign in to [Render](https://render.com) and create a new **Web Service**.
3. Link your GitHub repository.
4. Set the **Root Directory** as `server`.
5. Configure the build and start commands:
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. Set the Environment Variables:
   - `MONGO_URI`: *Your MongoDB connection string*
   - `JWT_SECRET`: *A secure random key*
   - `PORT`: `5000` (or default)

### 3. Frontend (Vercel)
1. Sign in to [Vercel](https://vercel.com).
2. Create a new project and import your repository.
3. Configure the settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set environment variables to point endpoints to Render (Vite proxy config is preloaded to proxy `/api` locally, but for production, you can configure your API base URL or let it hit relative paths if mapped under a unified gateway/proxy, or write production configs).

---

## 🌸 Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Redux Toolkit
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB (Mongoose) / Local JSON fallback
