# 🏘️ Smart Civic System

A modern, user-friendly civic issue reporting platform that empowers communities to identify, discuss, and resolve local problems through transparent civic engagement.

## ✨ Features

- **📝 Easy Issue Reporting**: Report local civic issues with photos/videos
- **🗳️ Community Voting**: Vote on issues to help prioritize community needs
- **📊 Real-time Tracking**: Track issue status from Pending → In Progress → Resolved
- **🏷️ Smart Categories**: Organize issues by Roads, Garbage, Water, Electric, Safety
- **📍 Location Mapping**: Integrated Google Maps for precise issue locations
- **👥 Democratic Engagement**: All residents can view and vote on issues
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🔐 Secure Authentication**: JWT-based user sessions

## 🚀 Quick Start

### Backend Setup (Java/Maven)

1. **Prerequisites**:
   - Java 11+
   - Maven 3.6+
   - MySQL 8.0+

2. **Database Setup**:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. **Build & Run**:
   ```bash
   cd backend
   mvn clean package
   mvn tomcat7:run
   ```
   Backend runs on: `http://localhost:8080` (No authentication prompt!)

### Frontend Setup (React + Vite)

1. **Prerequisites**: Node.js 16+

2. **Install & Run**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

## 📋 Project Structure

```
SmartCivicSystem/
├── backend/              # Java/Maven backend
├── frontend/             # React + Vite frontend
├── database/schema.sql   # MySQL schema
└── README.md
```

## 🔧 Technology Stack

**Backend**: Java 11, Jakarta Servlet, MySQL, JWT, Maven  
**Frontend**: React 18+, Vite, Axios, Modern CSS

## 🔐 Public Access - No Authentication Required

✅ **No Tomcat login prompts** - The application is fully public and user-friendly  
✅ **Browse freely** - View all issues and statistics without signing in  
✅ **Optional registration** - Create account only to report or vote  
✅ **Secure JWT tokens** - Protected user sessions for authenticated features

## 📱 Screenshots & UI

- **Modern Design**: Clean, gradient-based interface with emojis
- **Responsive**: Works seamlessly on mobile, tablet, desktop
- **User-Friendly**: Intuitive navigation and clear call-to-actions
- **Fast Loading**: Optimized performance with Vite

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Tomcat asks for login | This is now fixed! Application uses public access |
| CORS errors | Ensure backend runs on 8080, frontend on 5173 |
| Database connection failed | Run `mysql -u root -p < database/schema.sql` |
| Port 8080 in use | Change in `backend/pom.xml` tomcat7 configuration |

## 📞 Support

For issues or questions, check the troubleshooting section or review the API documentation in backend servlets.

---

**Made with ❤️ for communities worldwide**
- If using a different backend port, update `frontend/src/api.js`
