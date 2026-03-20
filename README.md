# ⚔️ FitQuest — Level Up Your Life

App fitness gamificata con progressione RPG, achievements e programmi di allenamento.

---

## 🚀 Deploy su Render (gratis) — Guida passo-passo

### STEP 1 — Carica su GitHub

1. Vai su [github.com](https://github.com) e fai login
2. Clicca **"New repository"** (pulsante verde in alto a destra)
3. Chiamalo `fitquest`, mettilo **Public**, clicca **Create repository**
4. Sul tuo PC, apri il terminale nella cartella del progetto ed esegui:

```bash
git init
git add .
git commit -m "Initial commit - FitQuest"
git branch -M main
git remote add origin https://github.com/TUO_USERNAME/fitquest.git
git push -u origin main
```

> Sostituisci `TUO_USERNAME` con il tuo username GitHub

---

### STEP 2 — Crea account su Render

1. Vai su [render.com](https://render.com)
2. Clicca **"Get Started for Free"**
3. Registrati con il tuo account **GitHub** (più semplice)

---

### STEP 3 — Crea il Database PostgreSQL su Render

1. Nella dashboard Render, clicca **"New +"** → **"PostgreSQL"**
2. Impostazioni:
   - **Name:** `fitquest-db`
   - **Database:** `fitquest`
   - **User:** `fitquest`
   - **Region:** Frankfurt (EU) o la più vicina
   - **Plan:** Free
3. Clicca **"Create Database"**
4. Aspetta che diventi verde
5. Copia la **"Internal Database URL"** (ti servirà dopo)

---

### STEP 4 — Deploy del Web Service

1. Clicca **"New +"** → **"Web Service"**
2. Connetti il repository GitHub `fitquest`
3. Impostazioni:
   - **Name:** `fitquest`
   - **Region:** stessa del database
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run db:push && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Clicca **"Advanced"** → **"Add Environment Variable"** e aggiungi:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | *(incolla l'Internal Database URL dal STEP 3)* |
   | `SESSION_SECRET` | *(una stringa casuale, es: `fitquest-abc123xyz789`)* |
   | `PORT` | `10000` |

5. Clicca **"Create Web Service"**

---

### STEP 5 — Aspetta il deploy

Render ci metterà 5-10 minuti la prima volta. Puoi seguire i log in tempo reale.

Quando vedi `FitQuest running on http://0.0.0.0:10000` nei log, il sito è online!

Il tuo sito sarà disponibile su: **https://fitquest.onrender.com**

---

## Nota sul piano gratuito di Render

Il piano gratuito "dorme" dopo 15 minuti di inattività. Al primo accesso dopo una pausa
ci vorranno circa 30 secondi per svegliarsi. E normale.

---

## Sviluppo locale

```bash
cp .env.example .env
# Modifica .env con i tuoi dati database

npm install
npm run db:push
npm run dev
```

Frontend su http://localhost:5173, backend su http://localhost:5000.
