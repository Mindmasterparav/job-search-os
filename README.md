# Job Search OS — Deployment Guide

## Option 1: Deploy to Vercel (Easiest — 5 minutes)

### Step 1: Create a GitHub account (skip if you have one)
Go to https://github.com and sign up.

### Step 2: Create a new repository
1. Go to https://github.com/new
2. Name it `job-search-os`
3. Keep it **Public** or **Private** (either works)
4. Click **Create repository**

### Step 3: Upload the code
1. On your new repo page, click **"uploading an existing file"**
2. Drag and drop ALL the files from this folder (keep the folder structure — `src/` folder, `package.json`, etc.)
3. Click **Commit changes**

### Step 4: Deploy on Vercel
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **"Add New Project"**
3. Select your `job-search-os` repository
4. Framework: **Vite** (should auto-detect)
5. Click **Deploy**
6. Wait 1-2 minutes — done! You'll get a URL like `job-search-os.vercel.app`

---

## Option 2: Run Locally (for testing)

### Prerequisites
- Install Node.js from https://nodejs.org (download LTS version)

### Steps
```bash
cd job-search-os
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Features

- **Today**: Daily checklist with calendar navigation, custom task addition, date history
- **Schedule**: Customizable daily timeline with color-coded blocks
- **Learning**: Skill roadmap with date ranges, progress tracking, add/remove skills
- **Apply**: Job platforms with direct links, editable outreach templates, search keywords
- **Network**: Customizable daily networking targets, priority outreach guide
- **90-Day Plan**: Customizable monthly goals and milestones
- **Stats**: Date-range weekly tracker with progress bars
- **Sheets**: Multi-tab spreadsheet with customizable columns — track applications, companies, outreach

## Data Storage

All data is stored in your browser's localStorage — it persists between sessions on the same browser/device. If you clear browser data, your progress will be lost.

**Tip**: Periodically export your Sheets data (copy-paste to Google Sheets) as a backup.
