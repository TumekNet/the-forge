# 🔥 The Forge

A personal life RPG tracker. Built as a single self-contained HTML file, hosted on Netlify, with cloud sync via Supabase.

> *You're not tracking habits. You're forging a version of yourself.*

---

## What It Is

The Forge is a daily logging system inspired by Dungeon Crawler Carl and The Forge design philosophy. Every day you log your real-life actions — eating well, training, working, learning, maintaining your environment — and they translate into character attributes, weekly tiers, a lifetime rank, gear drops, and secret achievements.

It is not a habit tracker. It is a framework for becoming the person you described at the start.

---

## Features

### Daily Log
Six attributes logged each day:
- ❤️ **Vitality** — ate well
- 🏃 **Stamina** — daily steps (10,000 target)
- 🗣️ **Influence** — moved the pipeline / meaningful work
- 💪 **Strength** — physical training
- 🛡️ **Constitution** — maintained your environment
- 🧠 **Intelligence** — learned or grew

### Weekly Tiers
Each attribute earns a weekly rank based on consistency:
`Unforged → Bronze → Iron → Steel → Mythic`

Resets every Monday. Because this layer is about execution, not identity.

### Forge Rank (Lifetime)
Your permanent rank that never resets, earned through accumulated Forge Points:
`Initiate → Tempered → Ironbound → Hardened → Steelheart → Forgeborn → Living Steel`

### Weight Tracking
Log your weight daily. Displays a live SVG graph, delta from previous entry, and feeds into the epic quest.

### Quests
Three quest types running simultaneously:
- **Epic Quest** — The Long Descent: reach 100kg (tracks automatically from weight log)
- **Weekly Quest** — Iron Discipline: train 3x this week (resets every Monday)
- **Wildcard Quests** — rotating short-window challenges, every few days. Expire if missed, fire a failure notification, and immediately replace themselves

Completing quests awards Forge Points and gear drops.

### Gear & Armoury
Every completed quest drops a named piece of gear with flavour text. Collected in the Armoury screen, automatically slotted into equipment positions by name (Helm, Chest, Hands, Waist, Feet, Neck, Ring, Back, Shoulder, Seal).

### Secret Achievements
24 hidden achievements that fire as dramatic full-screen interruptions — DCC-style deadpan system voice. You don't know what triggers them. The 🏆 Feats button glows gold when new ones unlock.

### Chronicle (History)
Full history screen with three tabs — Last 7 Days, Last 30 Days, By Week. Weekly rows expand to show each day's detail. Every day within the last 30 days is tappable for retroactive entry.

### Retroactive Entry
Tap any day in the Chronicle to log or edit that day's data. Recalculates points correctly. Useful for missed days or fixing timezone-related data issues.

### 30-Day Chronicle
Dot grid on the dashboard showing every day at a glance. Gold dots for Perfect Days, orange for logged days, outlined for today. Shows current streak.

### Perfect Days
A Perfect Day is when you check at least 4 attributes AND hit 10,000 steps. Rare. Valuable. Worth 3 bonus Forge Points. Tracked separately in the chronicle.

---

## Technical Details

### Stack
- Single HTML file — no build process, no dependencies, no frameworks
- Vanilla JavaScript
- CSS with four responsive breakpoints
- Supabase (PostgreSQL) for cloud sync
- Netlify for hosting

### Responsive Breakpoints
| Breakpoint | Target |
|---|---|
| < 400px | Samsung Fold outer screen, small phones |
| 400–599px | Standard phones |
| 600–899px | Fold inner screen, large phones, tablets |
| 900px+ | Desktop |

### Data Storage
- **localStorage** — fast local cache, writes immediately on every save
- **Supabase** — cloud sync, debounced 1.5s after each save
- On load: fetches from Supabase, uses whichever source (remote or local) has more days logged
- Sync indicator in header shows live status

### Supabase Schema
```sql
create table forge_data (
  id text primary key,
  data jsonb,
  updated_at timestamptz default now()
);
```

### Data Format
All progress stored under a single row with `id = 'tumek'`. The `data` column contains the full state object:
```json
{
  "days": {
    "2026-03-30": {
      "checks": { "vitality": true, "strength": false, ... },
      "steps": 12500,
      "weight": 104.8,
      "perfect": false
    }
  },
  "points": 142,
  "gear": [...],
  "quests": { "epic": {...}, "weekly": {...}, "wildcard": {...} },
  "achievements": { "first_blood": { "date": "2026-03-28", ... } }
}
```

---

## Export & Import

Found in the **Armoury** screen, below the gear stash.

**Export** — downloads a timestamped JSON backup file. Keep a copy in Google Drive or email it to yourself periodically.

**Import** — select a backup JSON file. Shows a preview of how many days it contains, then requires a second tap to confirm. On import, restores all data and syncs to Supabase immediately.

---

## Deployment

### Netlify
The app is deployed by dragging and dropping `the-forge.html` into the Netlify dashboard. No build step required.

Live URL: `https://tumeks-forge.netlify.app/`

### Updating
1. Make changes to `the-forge.html`
2. Drag the updated file into Netlify → Deploys
3. Netlify redeploys in seconds
4. All devices pick up the new version on next load — data is unaffected (stored in Supabase)

---

## Roadmap

- [ ] Daily push notifications (requires service worker, now unblocked by HTTPS hosting)
- [ ] Netlify password protection
- [ ] Weekly review screen with narrative recap
- [ ] Character name customisation
- [ ] More achievements
- [ ] Gear screen visual polish — character silhouette with equipped items

---

## Philosophy

The Forge is:
- Calm, not chaotic
- Disciplined, not intense
- Forward-only — no punishment, no resets

You don't fail. You either enter the Forge, or you don't.

---

*Built in a single conversation with Claude. March 2026.*
