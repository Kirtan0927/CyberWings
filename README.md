# 🔐 The Cyber Wings — Backend

Complete Node.js + Express + MySQL backend for The Cyber Wings cybersecurity club website, with a fully connected admin panel.

---

## 📁 Project Structure

```
cyberwings-backend/
├── server.js                        ← Entry point
├── package.json                     ← Dependencies
├── .env                             ← Config (edit before running!)
├── config/
│   ├── db.js                        ← MySQL pool
│   └── schema.sql                   ← Run once to set up DB + seed data
├── routes/
│   ├── admin.js                     ← /admin/* and /api/admin/*
│   ├── members.js                   ← /api/members
│   ├── events.js                    ← /api/events
│   ├── contact.js                   ← /api/contact
│   └── speakers.js                  ← /api/speakers
├── controllers/
│   ├── adminController.js
│   ├── memberController.js
│   ├── eventController.js
│   ├── contactController.js
│   └── speakerController.js
├── middleware/
│   ├── auth.js                      ← Session guard
│   ├── validation.js                ← Input validation
│   └── upload.js                    ← Multer image handler
└── public/                          ← All frontend files served here
    ├── index.html                   ← Home (membership form → DB)
    ├── member.html                  ← Members page (live from DB)
    ├── contact.html                 ← Contact (form → DB)
    ├── form.html                    ← Membership form (→ DB)
    ├── as a speaker form.html       ← Speaker form (→ DB)
    ├── Event.html                   ← Events page
    ├── about.html
    ├── style.css / form.css
    ├── images/
    │   ├── logo.png                 ← Club logo
    │   ├── ribbon.png
    │   ├── gojo.png
    │   └── uploads/                 ← Uploaded photos saved here
    └── admin/
        ├── login.html               ← Admin login
        └── dashboard.html           ← Admin dashboard (full CRUD)
```

---

## ✅ STEP-BY-STEP SETUP

### Step 1 — Prerequisites

Make sure these are installed on your machine:

| Tool    | Version | Check with         |
|---------|---------|--------------------|
| Node.js | v16+    | `node -v`          |
| npm     | v8+     | `npm -v`           |
| MySQL   | v8.0+   | `mysql --version`  |

Download Node.js: https://nodejs.org
Download MySQL: https://dev.mysql.com/downloads/mysql/

---

### Step 2 — Extract & Enter Folder

```bash
# Unzip the downloaded file
unzip cyberwings-backend-v3.zip

# Enter the project folder
cd cyberwings-backend
```

---

### Step 3 — Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json`:
- express, mysql2, cors, dotenv
- express-session, bcrypt
- express-validator, multer
- helmet, express-rate-limit

---

### Step 4 — Configure Environment

Open `.env` and update with your MySQL credentials:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=db_name 

ADMIN_USERNAME=*****
ADMIN_PASSWORD=**********

SESSION_SECRET=change_this_to_a_long_random_string
```


---

### Step 5 — Set Up the Database

Open a terminal and run:

```bash
mysql -u root -p < config/schema.sql
```

Enter your MySQL password when prompted.

This will:
- Create the `cyberwings_db` database
- Create 4 tables: `members`, `events`, `contact_messages`, `speaker_applications`
- Insert 5 sample leadership members and 5 sample events

**Alternative — run inside MySQL shell:**
```sql
mysql -u root -p
SOURCE /full/path/to/cyberwings-backend/config/schema.sql;
```

---

### Step 6 — Start the Server

**Development mode** (auto-restarts on file changes):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You will see:
```
🚀 Server running at http://localhost:3000
🔐 Admin panel  → http://localhost:3000/admin/login
🔌 API base     → http://localhost:3000/api
```

---

### Step 7 — Open the Website

| Page              | URL                                      |
|-------------------|------------------------------------------|
| Home              | http://localhost:3000                    |
| Members           | http://localhost:3000/member.html        |
| Events            | http://localhost:3000/Event.html         |
| Contact           | http://localhost:3000/contact.html       |
| Membership Form   | http://localhost:3000/form.html          |
| Speaker Form      | http://localhost:3000/as%20a%20speaker%20form.html |
| **Admin Login**   | **http://localhost:3000/admin/login**    |
| **Admin Panel**   | **http://localhost:3000/admin**          |

---

## 🔐 Admin Panel

### Login Credentials (from `.env`)
- **Username:** `Username`
- **Password:** `Password`

### Admin Features
| Panel     | What you can do                                                      |
|-----------|----------------------------------------------------------------------|
| Dashboard | View total stats (members, events, messages, speakers)              |
| Members   | **Add** new members, edit role/status/leadership, delete             |
| Events    | **Add** new events, edit title/date/status/featured flag, delete     |
| Messages  | View full messages, mark as read, delete                             |
| Speakers  | View applications, approve/reject, delete                            |

> Members added or removed in the Admin Panel appear live on the **Members page**.

---

## 🔌 API Reference

### Members
```
GET    /api/members                 → All active members (?leadership=true)
GET    /api/members/stats           → Count stats
GET    /api/members/:id             → Single member
POST   /api/members/register        → Register new member (JSON body)
```

### Events
```
GET    /api/events                  → All events (?category=workshops&status=upcoming)
GET    /api/events/stats            → Event stats
GET    /api/events/:id              → Single event
POST   /api/events                  → Create event
PUT    /api/events/:id              → Update event
DELETE /api/events/:id              → Delete event
```

### Contact
```
POST   /api/contact                 → Submit message
GET    /api/contact                 → All messages (admin)
PATCH  /api/contact/:id/read        → Mark as read
```

### Speakers
```
POST   /api/speakers                → Submit application
GET    /api/speakers                → All applications
PATCH  /api/speakers/:id/status     → Approve / reject
```

### Admin (session required)
```
POST   /api/admin/login             → Login
POST   /api/admin/logout            → Logout
GET    /api/admin/session           → Check session
GET    /api/admin/stats             → Dashboard stats
GET    /api/admin/members           → Members (with search/filter)
PUT    /api/admin/members/:id       → Update member
DELETE /api/admin/members/:id       → Delete member
GET    /api/admin/events            → All events
POST   /api/admin/events            → Create event
PUT    /api/admin/events/:id        → Update event
DELETE /api/admin/events/:id        → Delete event
GET    /api/admin/messages          → Contact messages
PATCH  /api/admin/messages/:id/read → Mark read
DELETE /api/admin/messages/:id      → Delete message
GET    /api/admin/speakers          → Speaker applications
PATCH  /api/admin/speakers/:id/status → Update status
DELETE /api/admin/speakers/:id      → Delete application
GET    /api/health                  → Server health check
```

---

## 🗄️ Database Tables

| Table                  | Stores                                    |
|------------------------|-------------------------------------------|
| `members`              | All registered members + leadership       |
| `events`               | Club events, workshops, competitions      |
| `contact_messages`     | Contact form submissions                  |
| `speaker_applications` | Speaker application form submissions      |

---

## 🛡️ Security

- **Sessions** — 8-hour admin sessions via `express-session`
- **Rate limiting** — API: 100 req/15min; Forms: 10 submissions/hr; Login: 10 attempts/15min
- **Helmet** — Secure HTTP headers
- **Input validation** — All forms validated server-side
- **File uploads** — Images only (jpg/png/gif/webp), max 5MB

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| `Error: connect ECONNREFUSED` | MySQL is not running. Start it: `sudo service mysql start` |
| `ER_ACCESS_DENIED_ERROR` | Wrong DB password in `.env` |
| `Cannot find module 'express-session'` | Run `npm install` again |
| Logo not showing | Make sure `public/images/logo.png` exists |
| Admin redirect loop | Clear browser cookies, then re-login |
| Port 3000 in use | Change `PORT=3001` in `.env` |
