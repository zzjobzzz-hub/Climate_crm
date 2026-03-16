# Climate CRM — Wave Exponential BCG

> Internal CRM for Wave BCG climate consulting services

**Live URL:** https://zzjobzzz-hub.github.io/Climate_crm/

---

## Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React 18 + Vite | Free |
| Hosting | GitHub Pages | Free |
| Database | Google Sheets | Free |
| Backend API | Google Apps Script | Free |
| Storage / Backup | Google Drive | Free (15 GB) |

---

## Project structure

```
Climate_crm/
├── src/
│   ├── main.jsx          ← React entry point
│   └── App.jsx           ← Full CRM application (climate-crm-v8)
├── .github/
│   └── workflows/
│       └── deploy.yml    ← Auto-deploy to GitHub Pages on push to main
├── index.html            ← Vite HTML template
├── vite.config.js        ← Vite config (base = /Climate_crm/)
├── package.json
└── .gitignore
```

---

## Local development

```bash
# Install dependencies
npm install

# Start dev server at http://localhost:5173/Climate_crm/
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Deploy

Every push to `main` automatically triggers the GitHub Actions workflow:

1. `npm ci` — install exact dependencies
2. `npm run build` — Vite builds to `dist/`
3. Actions uploads `dist/` to GitHub Pages

Manual trigger: **Actions tab → Deploy Climate CRM → Run workflow**

---

## Google Sheets backend

The app connects to:
```
https://script.google.com/macros/s/AKfycbyWHr3FZ3sv05EAmgs8rEs0fTXsIMZMr0SlI_w-KYPg0efQOcmDSWOWF7p_d4IuDNxGYw/exec
```

Data collections: `customers` · `opportunities` · `deliveries` · `costsheets` · `kpi`

---

## Tabs

| Tab | Description |
|-----|-------------|
| Dashboard / KPI | Monthly forecast bar chart, pipeline summary, agent performance |
| Customers | Company master + contacts, last contact sync, status from OPP |
| Opportunities | Sales pipeline, quotation builder, PDF export |
| Delivery | Job cards, installment tracking, progress steps, work log |
| Cost Sheet | Standard + per-quotation pricing, OPEX man-day tasks, cashflow |
| Setup | Version notes |

---

## Users (13)

`korakoj.s` (MD) · `chawapol.ta` (Admin) · `songyot.kr` / `theerayut.c` (Sales) · 9 Operation users
