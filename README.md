# ControlX – Full-Stack Management System

A full-stack operational management system built with **React**, **Node.js**, and **Express**, designed to provide real-time intelligence, agent monitoring, mission tracking, and system-status insights.

---

## 🚀 Features

### Frontend (React + TypeScript + TailwindCSS)
- Real-time operational dashboard
- Agent activity monitoring
- Mission progress tracking
- System load & performance metrics
- Recent reports feed
- Modular UI components (`StatCard`, `StatusItem`)
- Responsive neon-themed interface

### Backend (Node.js + Express)
- REST API for agents, missions, reports, and system metrics
- Department-based filtering
- Manager-based mission access
- Secure data flow between client and server

---

## 🛠 Tech Stack

| Layer     | Technology                          |
|-----------|--------------------------------------|
| Frontend  | React, TypeScript, TailwindCSS       |
| Backend   | Node.js, Express                     |
| Icons     | Lucide-React                         |
| State     | React Hooks                          |
| Build Tool| Vite                                 |

---

## 📁 Project Structure

```
ControlX/
│
├── ControlX-Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── AdminOverview.tsx
│   │   ├── lib/api.ts
│   │   └── styles/
│   └── public/
│
├── ControlX-Backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── server.js
│
└── README.md
```

---

## 🧩 Key Components

### AdminOverview
Displays:
- Active agents
- Active missions
- Success rate
- System load
- Performance metrics
- Recent reports
- System status panel

---

## ⚙️ Installation

### Frontend
```bash
cd ControlX-Frontend
npm install
npm run dev
```

### Backend
```bash
cd ControlX-Backend
npm install
npm start
```

---

## 🔐 Environment Variables

**Backend `.env`**
```
PORT=5000
MONGO_URI=your_mongo_connection
JWT_SECRET=your_secret
```

**Frontend `.env`**
```
VITE_API_URL=http://localhost:5000
```

---

## 📡 API Endpoints

| Endpoint                     | Description                     |
|-------------------------------|----------------------------------|
| `GET /agents/:dept`           | Get agents by department        |
| `GET /missions/:managerId`    | Get missions assigned to manager|
| `GET /reports/recent`         | Fetch last 5 reports            |
| `GET /system/status`          | System health & uptime          |

---

## 🔮 Future Improvements
- Authentication & role-based access
- WebSocket live updates
- Advanced analytics & charts
- Mobile-friendly layout
- Dark/light theme toggle

---

## 📄 License
MIT License
