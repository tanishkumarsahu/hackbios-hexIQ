<div align="center">

# 🎓 AlumNode

### *Connecting Alumni, Building Futures*

**Made with ❤️ by Team hexIQ**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![HackOMania](https://img.shields.io/badge/HackOMania-2K25-orange?style=for-the-badge)](https://hackathon.sspubhilai.com/)
[![Team](https://img.shields.io/badge/Team-hexIQ-FF1493?style=for-the-badge&logo=github)](https://github.com/tanishkumarsahu)

**A comprehensive alumni networking platform that bridges the gap between students and alumni through real-time connections, career opportunities, and community engagement.**

🚀 **Live Demo:** [alumnode.vercel.app](https://alumnode.vercel.app)

</div>

---

## 👥 Meet Team hexIQ

<table align="center">
<tr>
<td align="center" width="25%">
<img src="https://github.com/tanishkumarsahu.png" width="120px" height="120px"/><br/>
<b>Tanish Kumar Sahu</b><br/>
<sub>🎯 Team Lead</sub><br/>
<br/>
<a href="https://github.com/tanishkumarsahu">
<img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white"/>
</a>
</td>
<td align="center" width="25%">
<img src="https://github.com/khushi1119.png" width="120px" height="120px"/><br/>
<b>Khushi Tiwari</b><br/>
<sub>💻 Developer</sub><br/>
<br/>
<a href="https://github.com/khushi1119">
<img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white"/>
</a>
</td>
<td align="center" width="25%">
<img src="https://github.com/Ananyasingh-git.png" width="120px" height="120px"/><br/>
<b>Ananya Singh Baghel</b><br/>
<sub>💻 Developer</sub><br/>
<br/>
<a href="https://github.com/Ananyasingh-git">
<img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white"/>
</a>
</td>
<td align="center" width="25%">
<img src="https://github.com/Thamada-Sai-Kumar.png" width="120px" height="120px"/><br/>
<b>T. Sai Kumar</b><br/>
<sub>💻 Developer</sub><br/>
<br/>
<a href="https://github.com/Thamada-Sai-Kumar">
<img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white"/>
</a>
</td>
</tr>
</table>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 👥 **Smart Networking**
- 🔍 Advanced alumni search & filters
- ✅ Verified alumni profiles
- 🤝 Connection requests system
- 📊 Network insights dashboard

</td>
<td width="50%">

### 💬 **Real-Time Messaging**
- ⚡ Instant messaging
- ⌨️ Keyboard shortcuts
- 🔔 Unread indicators
- 📱 Mobile optimized

</td>
</tr>
<tr>
<td width="50%">

### 📅 **Events Hub**
- 🎉 Discover alumni events
- 📝 RSVP management
- 🏷️ Category filtering
- 🔄 Real-time updates

</td>
<td width="50%">

### 💼 **Job Board**
- 🎯 Alumni job postings
- 💾 Save opportunities
- 🔎 Smart filtering
- 🔗 Direct applications

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

```text
Frontend  →  Next.js 15 • React • Tailwind CSS • Lucide Icons
Backend   →  Supabase • PostgreSQL • Real-time Subscriptions
Auth      →  Supabase Auth • Google OAuth • JWT
Hosting   →  Vercel (Frontend) • Render (Backend)
```

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+ • npm/yarn • Supabase account
```

### Installation

1️⃣ **Clone the repository**
```bash
git clone https://github.com/tanishkumarsahu/alumnode-hexIQ-sspu-hackomania.git
cd alumnode-hexIQ-sspu-hackomania
```

2️⃣ **Setup Frontend**
```bash
cd frontend_js
npm install
cp .env.example .env.local
# Add your Supabase credentials to .env.local
npm run dev
```

3️⃣ **Setup Backend** *(Optional)*
```bash
cd backend
npm install
cp .env.example .env
# Add your credentials to .env
npm start
```

4️⃣ **Open your browser**
```
Frontend: http://localhost:3001
Backend:  http://localhost:3000
```

---

## 🎯 Key Highlights

| Feature | Description |
|---------|-------------|
| ⚡ **Blazing Fast** | Next.js 15 with App Router for optimal performance |
| 🔒 **Secure** | Row Level Security (RLS) + JWT authentication |
| 📱 **Responsive** | Mobile-first design, works on all devices |
| ⌨️ **Power User** | Keyboard shortcuts for efficient navigation |
| 🎨 **Modern UI** | Clean, intuitive interface with smooth animations |
| 🔄 **Real-time** | Live updates for messages and notifications |

---

## 🏗️ Architecture & Design

### System Architecture
AlumNode follows a modern **JAMstack architecture** with clear separation of concerns:

- **Frontend Layer**: Next.js 15 with React Server Components for optimal performance
- **API Layer**: Supabase REST API with automatic OpenAPI documentation
- **Database Layer**: PostgreSQL with Row Level Security (RLS) policies
- **Real-time Layer**: Supabase Realtime for instant updates
- **Auth Layer**: Supabase Auth with social providers (Google OAuth)
- **Storage Layer**: Supabase Storage for user avatars and media

**Key Tables:**
- `users` - Authentication and user accounts
- `profiles` - Extended user information (education, skills, bio)
- `connections` - Alumni-to-alumni relationships
- `messages` - Real-time chat messages
- `conversations` - Message threads
- `events` - Alumni events and gatherings
- `jobs` - Job postings and opportunities

### Security Features
- 🔐 **Row Level Security (RLS)** - Database-level access control
- 🛡️ **JWT Authentication** - Secure token-based auth
- ✅ **Email Verification** - Mandatory email confirmation
- 🔑 **Environment Variables** - Sensitive data protection
- 🚫 **SQL Injection Prevention** - Parameterized queries
- 🔒 **HTTPS Only** - Encrypted data transmission

---

## 🎨 Design Philosophy

### User Experience Principles
1. **Simplicity First** - Clean, intuitive interfaces
2. **Speed Matters** - Sub-second page loads
3. **Mobile-First** - Responsive on all devices
4. **Accessibility** - WCAG 2.1 AA compliant
5. **Consistency** - Unified design language

### Color Palette
```
Primary:   #4F46E5 (Indigo)
Success:   #10B981 (Green)
Warning:   #F59E0B (Amber)
Error:     #EF4444 (Red)
Neutral:   #6B7280 (Gray)
```

---

## 🚀 Performance Metrics

| Metric | Score | Status |
|--------|-------|--------|
| **Lighthouse Performance** | 95+ | ✅ Excellent |
| **First Contentful Paint** | < 1.5s | ✅ Fast |
| **Time to Interactive** | < 2.5s | ✅ Fast |
| **Cumulative Layout Shift** | < 0.1 | ✅ Stable |
| **SEO Score** | 100 | ✅ Perfect |

---

## 📊 Features in Detail

### 🔍 Alumni Search & Discovery
- **Advanced Filters**: Search by name, graduation year, department, location, company, skills
- **Smart Suggestions**: AI-powered connection recommendations
- **Verified Badges**: Visual indicators for verified alumni
- **Profile Preview**: Quick view without leaving the page

### 💬 Real-Time Messaging
- **Instant Delivery**: Messages appear in real-time
- **Typing Indicators**: See when someone is typing
- **Read Receipts**: Know when messages are read
- **Message History**: Full conversation history
- **Keyboard Shortcuts**: 
  - `Enter` - Send message
  - `Shift + Enter` - New line
  - `Ctrl/⌘ + K` - Focus input
  - `↑/↓` - Navigate conversations
  - `Esc` - Close menus

### 📅 Event Management
- **Event Creation**: Alumni can create and host events
- **RSVP System**: Track attendance and capacity
- **Calendar Integration**: Export to Google Calendar
- **Event Categories**: Networking, Career, Social, Academic
- **Notifications**: Reminders for upcoming events

### 💼 Job Board
- **Job Posting**: Alumni can post opportunities
- **Application Tracking**: Save and track applications
- **Job Alerts**: Get notified of relevant positions
- **Company Profiles**: View company information
- **Salary Insights**: Transparent compensation data

---

## 📁 Project Structure

```
alumnode/
├── 📂 frontend_js/        # Next.js application
│   ├── src/
│   │   ├── app/          # Pages & routes
│   │   ├── components/   # UI components
│   │   ├── contexts/     # State management
│   │   └── lib/          # Utilities
│   └── public/           # Static files
│
├── 📂 backend/           # Node.js API
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   └── config/          # Configuration
│
└── 📂 sql/              # Database schemas
```

---

## 🎓 HackBios 2K25 6.0

This project was built for **HackBios 2K25** - a hackathon focused on creating innovative solutions for real-world problems.

**Theme:** Building connections that matter  
**Duration:** 24 hours  
**Category:** Education Reimagined

---

## 🙏 Acknowledgments

- 🏆 **HackBios 2K25** for the opportunity
- 💚 **Supabase** for the amazing backend platform
- ⚡ **Vercel** for seamless deployment
- 🎨 **Lucide** for beautiful icons

---

<div align="center">

### ⭐ Star this repo if you like it!

**Made with ❤️ by Team hexIQ**

*Tanish Kumar Sahu • Khushi Tiwari • Ananya Singh Baghel • T. Sai Kumar*

---

**AlumNode** - Connecting Alumni, Building Futures 🎓

</div>
