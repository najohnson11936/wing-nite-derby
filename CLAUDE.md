# Wing Night Derby Pool 2026 — Claude Code Spec

## Project Overview

A single-page Next.js app for a neighborhood Kentucky Derby pool. 10 participants, $10 entry, W/P/S payout ($70/$20/$10). Retro Y2K aesthetic. Deploy to Vercel.

---

## Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + custom CSS (globals.css)
- **Language**: TypeScript
- **Fonts**: Google Fonts — Bungee, Special Elite, VT323
- **Deploy**: Vercel

---

## File Structure

```
/
├── app/
│   ├── layout.tsx        # Root layout, imports globals.css
│   ├── page.tsx          # Renders <DerbyPool />
│   └── globals.css       # Y2K retro styles, font imports, animations
├── components/
│   └── DerbyPool.tsx     # Main client component (all UI logic)
└── lib/
    └── horses.ts         # Horse data + participant picks (source of truth)
```

---

## Data — `lib/horses.ts`

### Horse interface
```ts
interface Horse {
  post: number;      // post position 1–20
  name: string;
  jockey: string;
  trainer: string;
  odds: string;      // display string e.g. "5-1"
  oddsNum: number;   // numeric for sorting/color
}
```

### Full 2026 Derby Field (20 horses)
| Post | Name | Jockey | Trainer | Odds |
|------|------|--------|---------|------|
| 1  | Renegade        | Irad Ortiz Jr.        | Todd Pletcher    | 5-1  |
| 2  | Albus           | Manny Franco          | Riley Mott       | 30-1 |
| 3  | Intrepido       | Hector Berrios        | Jeff Mullins     | 50-1 |
| 4  | Litmus Test     | Junior Alvarado       | Bill Mott        | 20-1 |
| 5  | Right to Party  | Tyler Gaffalione      | Kenny McPeek     | 31-1 |
| 6  | Commandment     | Florent Geroux        | Brad Cox         | 8-1  |
| 7  | Danon Bourbon   | Christophe Soumillon  | Yoshito Yahagi   | 15-1 |
| 8  | So Happy        | John Velazquez        | Steve Asmussen   | 6-1  |
| 9  | The Puma        | Flavien Prat          | Bob Baffert      | 5-1  |
| 10 | Wonder Dean     | Ryusei Sakai          | Yasutoshi Ikee   | 19-1 |
| 11 | Incredibolt     | Jose Ortiz            | Todd Pletcher    | 25-1 |
| 12 | Chief Wallabee  | Luis Saez             | Shug McGaughey   | 22-1 |
| 13 | Potente         | Brian Hernandez Jr.   | Bhupat Seemar    | 30-1 |
| 14 | Emerging Market | Javier Castellano     | Chad Brown       | 12-1 |
| 15 | Pavlovian       | Joel Rosario          | Mark Casse       | 30-1 |
| 16 | Six Speed       | Corey Lanerie         | Larry Rivelli    | 40-1 |
| 17 | Further Ado     | Declan Carroll        | Michael Maker    | 35-1 |
| 18 | Golden Tempo    | Edvin Vargas          | Brad Cox         | 28-1 |
| 19 | Great White     | Julien Leparoux       | Dallas Stewart   | 45-1 |
| 20 | Ocelli          | Drayden Van Dyke      | Peter Miller     | 50-1 |

### Participant Picks (final, confirmed)
```ts
interface Participant {
  name: string;
  horse: string; // must match a Horse.name exactly
}

const PARTICIPANTS: Participant[] = [
  { name: "Tony",    horse: "Great White"   },
  { name: "Don",     horse: "Potente"       },
  { name: "Nick",    horse: "Chief Wallabee"},
  { name: "Scott",   horse: "Further Ado"   },
  { name: "David",   horse: "Six Speed"     },
  { name: "Brad",    horse: "The Puma"      },
  { name: "Ty",      horse: "So Happy"      },
  { name: "Jay",     horse: "Litmus Test"   },
  { name: "Chris",   horse: "Renegade"      },
  { name: "Brendan", horse: "Commandment"   },
];
```

### Payout Structure
```ts
const POOL_ENTRY_FEE = 10;
const TOTAL_POT = 100; // 10 participants × $10

const PAYOUTS = {
  1: 70, // Win
  2: 20, // Place
  3: 10, // Show
};
```

---

## Component — `components/DerbyPool.tsx`

`"use client"` — all logic runs client-side.

### State
```ts
const [results, setResults] = useState<RaceResult[]>([]);   // persisted to localStorage
const [showAdmin, setShowAdmin] = useState(false);
const [adminCode, setAdminCode] = useState("");
const [view, setView] = useState<"pool" | "field">("pool");
const [time, setTime] = useState("");                        // ET clock, ticks every second
```

### RaceResult type
```ts
interface RaceResult {
  finish: number;  // 1, 2, 3, etc.
  horse: string;
  post: number;
}
```

### localStorage
- Key: `"derby2026results"`
- Load on mount, save on every result change
- Stores `RaceResult[]` as JSON

### Views

**Pool Picks tab** (`view === "pool"`):
- Show only the 10 horses that have participants
- Sort: finished horses first (by finish position), then unfinished by oddsNum
- Each card shows: post badge, horse name, odds, jockey, trainer, participant name (green badge), finish result if available

**Full Field tab** (`view === "field"`):
- All 20 horses sorted by post position
- Same card layout, participant badge shown if applicable

### Admin Panel
- Hidden behind password input — password is `"roses2026"` (hardcoded, change before deploy)
- Shows current 1st–5th place results
- Dropdowns to select finish place (1–5) + horse name
- "SET RESULT" button updates state + localStorage
- "CLEAR ALL" resets everything
- Selecting a finish position overwrites any existing result for that position
- A horse can only appear once across all finish positions

### Payout Display
- When `results.find(r => r.finish === 1)` exists → show Win payout ($70) + winner name
- When `results.find(r => r.finish === 2)` exists → show Place payout ($20) + winner name  
- When `results.find(r => r.finish === 3)` exists → show Show payout ($10) + winner name
- Only show payouts for participants who have a horse in that finish position
- A participant with no finishing horse in top 3 wins nothing

### Finish Order section (below pool cards, when results.length > 0)
- List all entered results sorted by finish position
- Each row: finish label | post# + horse name | odds | participant name + payout (if top 3)
- Highlight 1st place row in gold, 2nd in silver-ish, 3rd in bronze-ish

---

## Visual Design — Y2K Retro Racing Theme

### Fonts (via Google Fonts)
- `Bungee` — headings, post badges, tabs, buttons
- `Special Elite` — body text, labels, jockey/trainer info
- `VT323` — monospace readouts, odds, clock, result labels

### Color Palette (CSS variables in globals.css)
```css
--green: #1a5c2a        /* page background */
--green-light: #2d8a3e  /* accents */
--gold: #c9a84c         /* borders, labels */
--gold-bright: #f0c040  /* horse names, highlights */
--red: #8b1a1a          /* marquee bar, admin buttons */
--cream: #f5edd6        /* body text */
--brown: #3d2b1f        /* card backgrounds */
--dirt: #8b6914         /* secondary accents */
--white: #fff9f0        /* near-white text */
```

### Key Effects
- **Scanlines**: fixed `::after` pseudo-element with repeating-linear-gradient overlay on `<body>`
- **Marquee**: CSS `translateX` animation, 22s linear infinite. Text scrolls right→left
  - Pre-race: race info + good luck message
  - Post-race: winner announcement with payout
- **Blinking cursor**: `opacity` keyframe animation, 1s step-end infinite
- **Winner pulse**: `box-shadow` keyframe animation on winning card
- **Card hover**: `translateY(-2px)` + brighter border + stronger shadow
- **Grid layout**: `repeat(auto-fill, minmax(220px, 1fr))` for cards

### Header
- 🌹 corner decorations
- "WING NIGHT PRESENTS" in VT323 with letter-spacing
- "KENTUCKY DERBY" in Bungee with red text-shadow
- "POOL 2026" in Bungee
- Pot total (gold bordered box) + ET clock (blue bordered box) side by side
- Winner banner appears below when race is over

### Horse Card layout (top to bottom)
1. ★ WINNER ★ label (top-right, only on 1st place)
2. Post number badge (red square) + horse name (gold, Bungee)
3. Odds (color-coded by value) + "ODDS" label
4. Jockey and trainer lines (small, muted gold)
5. Participant badge (green background, VT323) — if applicable
6. Result badge (gold/dark background) — if race result entered

### Odds color coding
```ts
oddsNum <= 6  → #f0c040  (gold — favorites)
oddsNum <= 12 → #a0d080  (green — contenders)
oddsNum <= 25 → #80b8e0  (blue — longshots)
else          → #c08080  (muted red — big longshots)
```

---

## Deployment

### Vercel setup
1. Push to GitHub repo
2. Import to Vercel — auto-detects Next.js
3. No environment variables needed (all data is static + localStorage)
4. Deploy — done

### Before deploying
- [ ] Change admin password from `"roses2026"` to something else in `DerbyPool.tsx`
- [ ] Verify all 10 participant/horse mappings in `lib/horses.ts`
- [ ] Test admin panel result entry locally

---

## Notes & Edge Cases

- **Todd** has no pick — he is not in PARTICIPANTS, not in the pool
- **Scratched horses** (Don's original pick, Jay's original pick) were already resolved — final picks are in PARTICIPANTS above
- If a pool participant's horse DNF or is unplaced, they win nothing — no special handling needed
- The app has no backend — results are entered manually by admin post-race and stored in localStorage. Since it's a single shared URL and localStorage is per-browser, the admin should enter results on a shared screen / TV, or results can be re-entered by anyone with the password on their own device
- If you want results to persist across devices, a simple solution would be to add a Vercel KV store or a single-row JSON file on a free service like JSONBin — but for one afternoon this is fine as-is
