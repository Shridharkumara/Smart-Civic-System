# 🏘️ Smart Civic System

A modern, user-friendly civic issue reporting platform that empowers communities to identify, discuss, and resolve local problems through transparent civic engagement.

---

## ✨ Features

* 📝 Easy Issue Reporting (with photos/videos)
* 🗳️ Community Voting system
* 📊 Real-time issue tracking
* 🏷️ Smart categories (Roads, Garbage, Water, etc.)
* 📍 Google Maps location integration
* 📱 Fully responsive design
* 🔐 Secure JWT authentication

---

## 🚀 Quick Start

### Backend Setup (Java + Tomcat)

1. Install Java (JDK 11+) and MySQL
2. Run database:

```bash
mysql -u root -p < database/schema.sql
```

3. Deploy backend to Tomcat

---

### Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

---

## 📋 Project Structure

SmartCivicSystem/
├── backend/
├── frontend/
├── database/
└── README.md

---

## 🔧 Tech Stack

Backend: Java, Servlet, MySQL
Frontend: React, Vite

---

## 🐛 Troubleshooting

* Port issue → change port in Tomcat
* DB error → check MySQL running
* CORS → ensure backend + frontend ports correct

---

## ❤️ Project Goal

To help citizens report and solve civic issues efficiently.

---

Made with ❤️ by Shridhar
