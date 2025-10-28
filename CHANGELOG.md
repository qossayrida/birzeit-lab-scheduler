# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-28

### Added
- Initial release of Birzeit Lab Scheduler
- Automated lab extraction from Ritaj course list (ENCS_1[0-5] courses)
- Deterministic scheduling algorithm with seeded PRNG
- TA management with preferences and capacity constraints
- Interactive UI with three main views:
  - Setup: Data fetching, TA management, and lab configuration
  - Schedule: Calendar grid view of assignments
  - TA View: Assignments grouped by teaching assistant
- Offline support with Service Worker caching
- IndexedDB persistence with versioned schema
- Export/Import functionality for schedules
- Manual override and lock capabilities
- Conflict detection and validation
- Unassigned labs panel with reasons
- CORS proxy endpoint (Cloudflare Workers/Netlify/Vercel)
- Responsive design with Tailwind CSS
- Comprehensive test suite with Vitest
- GitHub Actions deployment workflow
- Documentation (README, DEPLOYMENT, CONTRIBUTING)

### Features
- **Smart Scheduling**: Preference-based scoring with load balancing
- **Reproducibility**: Same seed produces identical schedules
- **Flexibility**: Manual adjustments with locked assignments
- **Offline-First**: Works without internet after initial load
- **Data Safety**: Automatic persistence to IndexedDB
- **Export/Import**: JSON format for backup and sharing

### Technical
- React 19 + TypeScript
- Zustand for state management
- LocalForage for IndexedDB
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- Workbox for service worker
- Vitest for testing

## [Unreleased]

### Planned
- Drag-and-drop assignment editing
- Print-friendly schedule view
- Email/PDF export
- Multi-language support (Arabic/English)
- Conflict resolution suggestions
- Schedule comparison tool
- Historical data tracking
- Analytics dashboard
- Mobile app (PWA)
- Dark mode

---

For more details, see the [GitHub releases page](https://github.com/yourusername/birzeit-lab-scheduler/releases).
