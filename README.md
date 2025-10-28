# Birzeit Lab Scheduler

A comprehensive TA lab scheduling system for Birzeit University that generates optimal schedules from course data with reproducible, deterministic results.

## 🎯 Features

- **Automated Lab Extraction**: Parses uploaded Ritaj course data (ENCS_1[0-5] courses)
- **Smart Scheduling Algorithm**: Uses seeded PRNG for reproducible, deterministic scheduling
- **TA Management**: Add/edit TAs with preferences, availability, and capacity constraints
- **Interactive UI**: Modern, responsive interface with drag-and-drop capabilities
- **Offline Support**: Service Worker caching for offline functionality
- **Data Persistence**: IndexedDB storage with versioned schema
- **Export/Import**: JSON export/import for backup and sharing
- **Multiple Views**: Calendar grid, TA-centric view, and unassigned labs panel
- **Conflict Detection**: Validates schedules for double-bookings and capacity violations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/birzeit-lab-scheduler.git
cd birzeit-lab-scheduler

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build for Production

```bash
npm run build
npm run preview
```

### Deploy

```bash
# Deploy to GitHub Pages
npm run deploy

# Or use Netlify/Vercel (auto-deploys from main branch)
```

## 📖 Usage Guide

### 1. Upload Lab Data

1. Open the Ritaj course list in your browser.
2. Save the page locally as an HTML file.
3. Click "Upload HTML File" and select the saved file to extract ENCS_1[0-5] labs.

### 2. Add Teaching Assistants

1. Click "Add TA" button
2. Fill in TA details:
   - **Name**: TA's full name (required)
   - **Max Labs**: Maximum number of labs they can handle
   - **Preferred Days**: Days they prefer to work
   - **Preferred Times**: Time slots they prefer (8:00, 11:00, 14:00)
   - **Seed** (optional): Per-TA seed for deterministic tie-breaking

3. Click "Add" to save

### 3. Configure Labs (Optional)

Edit lab constraints in the Labs table:
- **Feasible Days**: Days when the lab can be scheduled
- **Feasible Times**: Available time slots
- **Locked Slot**: Force a specific day/time for this lab

### 4. Run Scheduler

1. Click "Run Scheduler" in the header
2. View results in three tabs:
   - **Setup**: Manage data and constraints
   - **Schedule**: Calendar grid view
   - **TA View**: Assignments grouped by TA

### 5. Manual Adjustments

- **Lock assignments**: Click lock icon to prevent changes on re-run
- **Edit labs**: Adjust feasible slots and constraints
- **Rerun**: Click "Run Scheduler" again to regenerate with new constraints

### 6. Export/Import

- **Export**: Download schedule as JSON (includes seed for reproducibility)
- **Import**: Load previously saved schedule
- **Clear All Data**: Reset everything (requires typing "CLEAR")

## 🧮 Scheduling Algorithm

The scheduler uses a deterministic algorithm with the following steps:

### 1. Scoring Function

For each (TA, Lab, Slot) combination:

```
score = baseScore - loadPenalty + tieBreak

where:
  baseScore = +2 if day matches TA preference
            + +2 if time matches TA preference
  
  loadPenalty = 0.5 × (assignedLabs / maxLabs)
  
  tieBreak = small random value from seeded PRNG
```

### 2. Assignment Process

1. **Sort labs by difficulty**: Labs with fewer feasible slots are assigned first
2. **For each lab**:
   - Calculate scores for all valid (TA, slot) combinations
   - Select the highest-scoring option
   - Check constraints (no double-booking, capacity limits)
   - Assign or mark as unassigned

### 3. Constraints

- **Hard Constraints**:
  - No TA can have multiple labs at the same (day, time)
  - TAs cannot exceed their `maxLabs` capacity
  - Locked assignments are never changed
  - Labs must use feasible days/times

- **Soft Constraints** (preferences):
  - TAs prefer certain days and times (scored higher)
  - Load balancing across TAs (via penalty)

### 4. Reproducibility

- Same seed → same schedule (deterministic)
- Global seed affects all TAs
- Per-TA seed (optional) for fine-tuned control

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Zustand with IndexedDB persistence
- **UI**: Tailwind CSS + Lucide icons
- **Offline**: Service Worker (Workbox) via vite-plugin-pwa
- **Proxy**: Cloudflare Workers / Netlify / Vercel Functions

### Project Structure

```
src/
├── components/          # React components
│   ├── AppShell.tsx    # Main layout with header/toolbar
│   ├── FetchPanel.tsx  # Data fetching UI
│   ├── TAFormList.tsx  # TA management
│   ├── LabTable.tsx    # Lab editing table
│   ├── ScheduleGrid.tsx # Calendar view
│   ├── TAView.tsx      # TA-centric view
│   ├── UnassignedPanel.tsx # Unassigned labs
│   └── Tabs.tsx        # Tab navigation
├── lib/                # Core logic
│   ├── prng.ts         # Seeded random number generator
│   ├── parser.ts       # HTML parsing
│   ├── scheduler.ts    # Scheduling algorithm
│   ├── storage.ts      # IndexedDB persistence
│   └── dates.ts        # Date utilities
├── store/
│   └── useStore.ts     # Zustand store
├── types/
│   └── index.ts        # TypeScript types
└── App.tsx             # Main app component

api/
└── proxy.js            # CORS proxy (serverless)
```

### Data Models

```typescript
type Day = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
type SlotTime = 8 | 11 | 14;

interface Lab {
  id: string;
  code: string;           // e.g., ENCS_10
  title: string;
  section: string;        // e.g., L1
  instructorName?: string;
  feasibleDays: Day[];
  feasibleTimes: SlotTime[];
  lockedDay?: Day;
  lockedTime?: SlotTime;
}

interface TA {
  id: string;
  name: string;
  preferredDays: Day[];
  preferredTimes: SlotTime[];
  maxLabs: number;
  seed?: number;
}

interface Assignment {
  labId: string;
  taId: string;
  day: Day;
  time: SlotTime;
  locked?: boolean;
  scoreMeta: {
    base: number;
    loadPenalty: number;
    tieBreak: number;
  };
}
```

## 🔧 Configuration

### Vite Config

The app is configured for GitHub Pages deployment. Update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/', // Change for GitHub Pages
  // ... rest of config
});
```

### Proxy Endpoint

The proxy bypasses CORS when fetching from Ritaj. Deploy options:

**Cloudflare Workers**:
```bash
npm install -g wrangler
wrangler deploy api/proxy.js
```

**Netlify**: Auto-deploys from `netlify.toml`

**Vercel**: Auto-deploys from `vercel.json`

### Static Proxy Cache (GitHub Pages)

GitHub Pages does not execute serverless functions, so `/api/proxy` will return `404`.  
To keep the “Fetch & Parse Labs” button working in that environment:

1. Save the Ritaj course page as HTML (e.g. `term=1251&bu=10759`).  
2. Copy the file to `public/proxy-cache/` (for example `public/proxy-cache/ritaj-1251-10759.html`).  
3. Register the snapshot in `STATIC_PROXY_CACHE` inside `src/store/useStore.ts`, matching on the query parameters.

When the live proxy and direct fetch both fail, the app automatically falls back to the static snapshot.  
Update or add new cached files whenever the Ritaj data changes.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Tests cover:
- PRNG determinism and correctness
- Scheduling algorithm logic
- Constraint validation
- Parser functionality

## 📦 Deployment

### GitHub Pages

1. Update `vite.config.ts` with your repo name
2. Push to `main` branch
3. GitHub Actions will auto-deploy to `gh-pages`
4. Enable GitHub Pages in repo settings

### Netlify

1. Connect your repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploys automatically on push

### Vercel

1. Import your repo in Vercel
2. Framework: Vite
3. Deploys automatically on push

## 🐛 Troubleshooting

### CORS Errors

If fetching fails in production:
1. Confirm the requested URL has a snapshot registered in `STATIC_PROXY_CACHE`.
2. Use the HTML upload option as a quick workaround.
3. Deploy the proxy endpoint (Cloudflare Worker/Vercel/Netlify) for live data refreshes.

### Data Not Persisting

- Check browser IndexedDB support
- Clear browser cache and reload
- Check console for storage errors

### Schedule Not Generating

- Ensure TAs have sufficient capacity
- Check lab feasible slots aren't too restrictive
- Review unassigned panel for reasons

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section

## 🙏 Acknowledgments

- Birzeit University for course data structure
- React and Vite communities
- Contributors and testers

---

**Built with ❤️ for Birzeit University**
