# 📜 साहिर लुधियानवी — सदा-ए-साहिर (Sahir Ludhianvi Digital Tribute)

> **"लोग चले जाते हैं, उनकी आवाज़ रह जाती है।"**  
> *A contemporary digital tribute to the legendary Urdu poet & Hindi cinema lyricist Sahir Ludhianvi (1921 — 1980).*

Designed & Developed with ❤️ by **[Jatin Gera](https://github.com/STDYGIT)**  
🔗 **GitHub:** [github.com/STDYGIT](https://github.com/STDYGIT)  
🔗 **LinkedIn:** [linkedin.com/in/jatingera](https://www.linkedin.com/in/jatingera/)  
🔗 **Repository:** [github.com/STDYGIT/ludhyanvi-sahab](https://github.com/STDYGIT/ludhyanvi-sahab)

---

## ✨ Features & Interactive Highlights

* 🎙️ **सदा-ए-SAHIR (Blended Hero Console):**  
  An interactive audio-visual console that seamlessly pairs Sahir Ludhianvi's classic written *nazms* and *ghazals* with their exact high-fidelity film song clips (e.g. *Talkhiyan* ↔ *Pyaasa*, *Gumrah*, *Kabhi Kabhie*). Features continuous auto-play sequencing.

* 📖 **कलाम (Poetry Archive & Engine):**  
  102 curated poems and couplets with interactive Hindi/Urdu theme filters (*मोहब्बत, तन्हाई, जुदाई, दर्द, ज़िंदगी, बग़ावत, सुकून*). Features instant randomized sampling and auto-rotation.

* 🎵 **नग़्मे (Filmography & Discography):**  
  60 iconic film songs written by Sahir (*Hum Dono*, *Pyaasa*, *Naya Daur*, *Waqt*, *Kabhi Kabhie*). Dual playback engine supports both local high-quality MP3 clips and direct YouTube streaming.

* ⌛ **सफ़र (Timeline Journey):**  
  A chronological biographic journey exploring Sahir's life from Ludhiana (1921) to Lahore (*Adab-e-Lateef*), Bombay film era, and his lasting legacy (1980).

* 🎛️ **Floating Music Dock:**  
  A sleek glassmorphic persistent player pill dock at bottom center with interactive seek controls, volume management, and dynamic song queue drawer.

---

## 🛠️ Architecture & Tech Stack

```
                                  ┌───────────────────────────────┐
                                  │      Netlify CDN (Frontend)   │
                                  │  Vite · ES Modules · GSAP     │
                                  └──────────────┬────────────────┘
                                                 │
                                                 │ REST API (HTTPS Tunnel)
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Redmi Note 10 / Docker Container                        │
│                                                                                 │
│   ┌──────────────────────────────┐              ┌───────────────────────────┐   │
│   │   FastAPI (Python 3.11)      │ ◄──────────► │  PostgreSQL 16 Database   │   │
│   │   SQLAlchemy REST Endpoints  │              │  Poems · Songs · Stanzas  │   │
│   └──────────────────────────────┘              └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

* **Frontend:** Vanilla JavaScript (ES Modules), Vite 8, Vanilla CSS3 (Custom Design Tokens, Glassmorphism, Micro-animations), GSAP 3 (ScrollTrigger).
* **Backend:** Python 3.11, FastAPI, SQLAlchemy ORM, Uvicorn ASGI Server.
* **Database:** PostgreSQL 16 (Production) / SQLite 3 (Local Development).
* **Containerization & Deployment:** Docker, Docker Compose (ARM64 & x86_64), Netlify CDN.

---

## 📁 Repository Structure

```
ludhyanvi-sahab/
├── frontend/                 # Vite Frontend Application
│   ├── modules/              # Modular JS (blendedHero, kalaam, naghme, player, nav)
│   ├── style.css             # Vanilla CSS Design System Tokens
│   ├── index.html            # Main SPA Layout & Semantic Markup
│   └── main.js               # Application Bootstrapper & GSAP Intro
├── backend/                  # FastAPI REST API Backend
│   ├── main.py               # REST Endpoints (/api/poems, /api/songs, /api/stanzas, etc.)
│   ├── init_db.sql           # PostgreSQL DDL Schema
│   ├── migrate_sqlite_to_pg.py # SQLite to PostgreSQL Exporter
│   ├── sahir.db              # Local SQLite Database Snapshot
│   └── Dockerfile            # Container image for ARM64/Redmi & Server
├── poetry_importer/          # Audio Downloads & Metadata Slices
│   └── audio_downloads/      # Pre-cut MP3 Stanzas & Full Song Clips
├── docker-compose.yml        # Docker Multi-container Orchestration
├── netlify.toml              # Netlify Deployment & SPA Rewrites Config
├── .env.example              # Environment Variable Template
└── README.md                 # Documentation
```

---

## 🚀 Quickstart & Local Setup

### 1. Clone & Install Frontend
```bash
git clone https://github.com/STDYGIT/ludhyanvi-sahab.git
cd ludhyanvi-sahab/frontend
npm install
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 2. Run Backend (Local SQLite)
```bash
cd ../backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Backend API will run at **`http://localhost:8000`**.

---

## 🐳 Docker & Production Deployment

### Run Full Stack locally via Docker Compose:
```bash
docker compose up -d --build
docker compose exec api python migrate_sqlite_to_pg.py
```

### Deploying Frontend to Netlify:
1. Connect repo to Netlify (`build command`: `cd frontend && npm run build`, `publish directory`: `frontend/dist`).
2. Add Environment Variable in Netlify Dashboard:
   `VITE_API_URL` = `https://<YOUR_BACKEND_TUNNEL_URL>`

---

## 👤 Author & Acknowledgments

* **Creator:** Jatin Gera ([@STDYGIT](https://github.com/STDYGIT))
* **LinkedIn:** [Jatin Gera](https://www.linkedin.com/in/jatingera/)
* **Dedicated to:** The enduring memory and poetic brilliance of **Sahir Ludhianvi (1921 — 1980)**.

> *"तू हिन्दू बनेगा न मुसलमान बनेगा, इंसान की औलाद है इंसान बनेगा।"*
