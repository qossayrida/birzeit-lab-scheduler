# Quick Start Guide

Get the Birzeit Lab Scheduler running in 5 minutes!

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:5173

## First Time Setup

### 1. Fetch Lab Data

**Option A: From Ritaj (requires proxy)**
- The URL is pre-filled
- Click "Fetch & Parse Labs"

**Option B: Upload HTML (recommended for first time)**
1. Visit: https://ritaj.birzeit.edu/hemis/bu-courses-list?term=1251&bu=10759&new_page=1
2. Save page as HTML (Ctrl+S / Cmd+S)
3. In the app, click "Upload HTML File"
4. Select your saved file

### 2. Add Teaching Assistants

Click "Add TA" and fill in:
- **Name**: e.g., "Ahmad Ali"
- **Max Labs**: e.g., 3
- **Preferred Days**: Select days (e.g., Mon, Wed, Thu)
- **Preferred Times**: Select times (e.g., 8:00, 11:00)

Add at least 2-3 TAs to see meaningful results.

### 3. Run Scheduler

Click the green "Run Scheduler" button in the header.

### 4. View Results

Switch between tabs:
- **Setup**: Manage data
- **Schedule**: See calendar grid
- **TA View**: See assignments per TA

## Example Data

Here's a quick example to test:

**TA 1:**
- Name: Ahmad
- Max Labs: 3
- Preferred Days: Mon, Wed
- Preferred Times: 8:00, 11:00

**TA 2:**
- Name: Sara
- Max Labs: 3
- Preferred Days: Tue, Thu
- Preferred Times: 11:00, 14:00

**TA 3:**
- Name: Omar
- Max Labs: 2
- Preferred Days: Sun, Mon, Tue
- Preferred Times: 8:00, 14:00

## Tips

- **Seed**: The number in the header ensures reproducible results
- **Lock**: Click lock icon to prevent changes when re-running
- **Export**: Save your schedule as JSON for backup
- **Import**: Load a previously saved schedule

## Troubleshooting

**No labs showing up?**
- Make sure you uploaded the correct HTML file
- Check that the file contains ENCS_10-15 courses

**Schedule not generating?**
- Add more TAs or increase maxLabs
- Make lab feasible slots more flexible
- Check unassigned panel for reasons

**Data not saving?**
- Check browser console for errors
- Ensure IndexedDB is enabled
- Try a different browser

## Next Steps

- Read the full [README.md](./README.md)
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy
- See [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute

## Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run tests
npm run test:ui      # Run tests with UI

# Deployment
npm run deploy       # Deploy to GitHub Pages

# Code Quality
npm run lint         # Run linter
```

## Support

- **Issues**: https://github.com/yourusername/birzeit-lab-scheduler/issues
- **Discussions**: https://github.com/yourusername/birzeit-lab-scheduler/discussions

---

**Happy Scheduling! 🎓**
