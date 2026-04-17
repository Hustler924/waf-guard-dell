# 🛡️ WAF Guard  
### Real-Time Web Application Firewall Monitoring System

WAF Guard is a full-stack web application designed to simulate, detect, and monitor common web attacks in real-time. It provides an interactive dashboard for analyzing attack patterns and understanding web security mechanisms.

---

## 🚀 Features

- 🔐 Admin Login with brute-force protection  
- ⚡ Real-time attack simulation  
- 📊 Interactive dashboard with analytics  
- 🧾 Detailed attack logs  
- 🚨 Toast notifications for detected attacks  
- 🧠 Middleware-based attack detection  

---

## 🧨 Supported Attack Simulations

- SQL Injection  
- Cross-Site Scripting (XSS)  
- Command Injection  
- Path Traversal  
- Failed Login Attempts  

---

## 📊 Dashboard Highlights

- Total attack count  
- Attack type breakdown  
- Pie chart visualization  
- Last detected attack timestamp  
- Filterable logs  

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- Chart.js (react-chartjs-2)  
- CSS  

### Backend
- Node.js  
- Express.js  

### Database
- MongoDB  

---

## 🏗️ Project Structure

WAF-GUARD/
│
├── Backend/
│ ├── Middleware/
│ │ ├── sqlFilter.js
│ │ ├── xssFilter.js
│ │ ├── commandInjectionFilter.js
│ │ ├── pathGuard.js
│ │ └── interceptor.js
│ ├── Utils/
│ │ └── logger.js
│ └── server.js
│
├── Frontend/
│ ├── src/
│ │ ├── App.js
│ │ ├── login.js
│ │ └── styles
│
└── README.md




---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/waf-guard.git
cd waf-guard


2️⃣ Install dependencies
Backend
cd Backend
npm install
Frontend
cd Frontend
npm install


3️⃣ Run the project
Start backend
node server.js
Start frontend
npm start


4️⃣ Open in browser
http://localhost:3001


🔐 Admin Login
Field	Value
Username	admin
Password	(your configured password)



🧪 How to Use
Login as admin
Use attack simulator buttons
Observe:
Alerts
Logs
Dashboard updates


🧠 How It Works
Requests are intercepted by backend middleware
Payload is analyzed for malicious patterns
Attack type is detected
Logs are stored
Dashboard updates in real-time
📈 Future Enhancements
AI-based attack detection
Real-world API protection
Email/SMS alerts
Role-based authentication
Cloud deployment


👨‍💻 Author
Hustler924


📄 License
This project is for educational purposes only