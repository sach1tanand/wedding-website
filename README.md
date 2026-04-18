# 💍 Wedding Website — Complete Deployment Guide
## Aryan & Priya | Production v2 | 15–20 GB Storage | 100% Free

---

## 📁 Project Structure

```
wedding-prod/
├── 🟢 start.bat              ← Windows: double-click to run locally
├── 🟢 start.sh               ← Mac/Linux launcher
├── 🔴 stop.bat               ← Stop all servers (Windows)
│
├── backend/                  ← Node.js + Express API
│   ├── server.js             ← Entry point (helmet, CORS, rate limiting)
│   ├── .env.example          ← Copy this to .env and fill credentials
│   ├── render.yaml           ← Render.com deploy config
│   ├── config/
│   │   ├── cloudinary.js     ← Cloudinary SDK setup
│   │   └── db.js             ← MongoDB Atlas connection
│   ├── models/
│   │   ├── RSVP.js
│   │   ├── Wish.js
│   │   ├── Photo.js          ← Cloudinary fields (publicId, url, thumbUrl)
│   │   └── Video.js          ← Google Drive embed links
│   └── routes/
│       ├── rsvp.js           ← POST/GET with validation + rate limiting
│       ├── wishes.js
│       ├── gallery.js        ← Cloudinary upload (25MB/photo, 20 at once)
│       ├── videos.js         ← Google Drive link submission + embed convert
│       ├── events.js
│       └── admin.js          ← JWT auth, stats, delete, approve/hide
│
└── frontend/                 ← React 18
    ├── vercel.json           ← Vercel deploy config
    ├── .env                  ← Local: REACT_APP_API_URL=http://localhost:5000
    ├── .env.example          ← Production template
    └── src/
        ├── App.js            ← All sections (Hero, Story, Events, Media, RSVP...)
        ├── api.js            ← Axios calls with JWT interceptor
        └── styles/global.css ← Full CSS (dark mode, responsive, animations)
```

---

## 🚀 STEP 1 — Run Locally (Test First)

### Prerequisites
- Node.js v18+ → https://nodejs.org (download LTS)

### Windows
```
Double-click start.bat
```

### Mac / Linux
```bash
chmod +x start.sh && ./start.sh
```

The app runs at **http://localhost:3000** in demo mode (no real DB needed for testing).

---

## ☁️ STEP 2 — Free Account Setup (15 minutes)

### A) MongoDB Atlas — Free Database
1. Go to https://cloud.mongodb.com → Sign up free
2. Create a **free M0 cluster** (512MB — plenty for RSVPs/wishes)
3. Click **Connect** → **Drivers** → copy the connection string
4. Replace `<password>` with your DB user password
5. Save it — looks like: `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/weddingdb`

### B) Cloudinary — Free 25GB Photo Storage
1. Go to https://cloudinary.com → Sign up free
2. Dashboard shows your **Cloud Name**, **API Key**, **API Secret**
3. Save all three values

### C) Render.com — Free Backend Hosting
1. Go to https://render.com → Sign up with GitHub
2. You'll deploy here in Step 4

### D) Vercel — Free Frontend Hosting
1. Go to https://vercel.com → Sign up with GitHub
2. You'll deploy here in Step 5

---

## 📝 STEP 3 — Configure Environment Variables

### Backend `.env` (copy from `.env.example`)
```env
PORT=5000
NODE_ENV=production

MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxx.mongodb.net/weddingdb

JWT_SECRET=make_this_very_long_and_random_abc123xyz789
ADMIN_PASSWORD=YourStrongPassword2025!

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

FRONTEND_URL=https://your-wedding.vercel.app
```

### Frontend `.env` (for production build)
```env
REACT_APP_API_URL=https://your-wedding-backend.onrender.com
```

---

## 🌐 STEP 4 — Deploy Backend to Render (Free)

1. Push your code to GitHub (or upload as zip)
2. Go to **render.com** → **New** → **Web Service**
3. Connect your GitHub repo → select the `backend` folder
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Region:** Singapore (closest to India)
5. Add all environment variables from your `.env` file
6. Click **Deploy** — takes ~3 minutes
7. Your backend URL: `https://wedding-backend-xxxx.onrender.com`
8. Test it: visit `https://wedding-backend-xxxx.onrender.com/api/health`

---

## 🌐 STEP 5 — Deploy Frontend to Vercel (Free)

1. In `frontend/.env`, set:
   ```
   REACT_APP_API_URL=https://wedding-backend-xxxx.onrender.com
   ```
2. Go to **vercel.com** → **New Project** → Import GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL` = your Render backend URL
5. Click **Deploy** — takes ~2 minutes
6. Your website: `https://your-wedding.vercel.app`

---

## 🔄 STEP 6 — Update CORS

After getting your Vercel URL, go to Render dashboard:
- Update `FRONTEND_URL` to your actual Vercel URL
- Render auto-redeploys in ~1 minute

---

## 📊 Storage Capacity Summary

| Type     | Service    | Free Limit | Notes                          |
|----------|------------|------------|--------------------------------|
| Photos   | Cloudinary | **25 GB**  | Auto-compressed, thumbnails    |
| Videos   | Google Drive | **15 GB/person** | Each guest uses their own |
| Database | MongoDB Atlas | 512 MB | ~500,000 RSVPs/wishes         |
| Bandwidth| Cloudinary | 25 GB/mo   | Resets monthly                 |

**Total effective storage: 25GB photos + unlimited video via guest Drive accounts**

---

## 🔐 Admin Panel Access

1. On the live website, click the 🔐 icon in the navbar
2. Enter your `ADMIN_PASSWORD` from `.env`
3. JWT token is stored in session (expires in 8 hours)
4. View: RSVPs table, Wishes moderation, Cloudinary storage gauge

---

## 📡 API Endpoints Reference

| Method | Endpoint               | Auth | Description              |
|--------|------------------------|------|--------------------------|
| GET    | /api/health            | —    | Health check             |
| GET    | /api/events            | —    | All 5 events + today flag|
| POST   | /api/rsvp              | —    | Submit RSVP (rate limited)|
| GET    | /api/wishes            | —    | Approved wishes          |
| POST   | /api/wishes            | —    | Submit wish              |
| POST   | /api/gallery/upload    | —    | Upload photos (Cloudinary)|
| GET    | /api/gallery           | —    | Photos (paginated)       |
| POST   | /api/gallery/:id/like  | —    | Like a photo             |
| POST   | /api/videos            | —    | Submit Drive video link  |
| GET    | /api/videos            | —    | Videos (paginated)       |
| POST   | /api/admin/login       | —    | Get JWT token            |
| GET    | /api/admin/stats       | JWT  | Dashboard stats          |
| GET    | /api/admin/rsvps       | JWT  | All RSVPs                |
| GET    | /api/admin/wishes      | JWT  | All wishes               |
| DELETE | /api/admin/photos/:id  | JWT  | Delete + remove Cloudinary|
| PUT    | /api/admin/wishes/:id/toggle | JWT | Hide/show wish     |

---

## 🛡 Security Features

- **helmet.js** — HTTP security headers
- **express-rate-limit** — 100 req/15min globally, 5 RSVPs/hr per IP, 30 uploads/hr per IP
- **express-validator** — all inputs sanitized and validated
- **JWT authentication** — admin routes protected, 8hr expiry
- **CORS whitelist** — only your Vercel domain can call the API
- **File type validation** — only image formats accepted for uploads

---

## 💡 Tips for Wedding Day

1. **Before the wedding:** test uploads with a few photos
2. **Share the link** via WhatsApp — guests open on mobile and upload directly
3. **For videos:** ask guests to upload to their own Google Drive first, then share the link on your website
4. **Admin panel:** check it daily to see RSVPs coming in
5. **Render free tier** spins down after 15 mins of inactivity — first visit may take 30 seconds to wake up. This is normal.

---

*Made with ❤️ for Aryan & Priya's once-in-a-lifetime celebration*
