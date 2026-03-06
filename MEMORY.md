# OpenClaw Workspace Memory Index

**Last Updated:** 2026-03-06

This file serves as an index and quick reference to the daily memory logs stored in `memory/*.md`. For detailed context, follow the links to the relevant daily files.

---

## Daily Memory Logs

### 2026 February
- [2026-02-10](memory/2026-02-10.md) - Initial interactions, DeepSeek model pricing discussions
- [2026-02-11](memory/2026-02-11.md) - Regular session
- [2026-02-11-0027](memory/2026-02-11-0027.md) - Extended session (multiple messages about DeepSeek models, gateway restart)
- [2026-02-12](memory/2026-02-12.md) - Kanban project setup, GitHub push issues
- [2026-02-13](memory/2026-02-13.md)
- [2026-02-14](memory/2026-02-14.md)
- [2026-02-15](memory/2026-02-15.md)
- [2026-02-15-events-feed](memory/2026-02-15-events-feed.md) - Events feed configuration
- [2026-02-15-flush](memory/2026-02-15-flush.md) - Pre-compaction memory flush
- [2026-02-16](memory/2026-02-16.md) - Cron job fixes, digest delivery optimization, user preferences
- [2026-02-16-news-api-usage](memory/2026-02-16-news-api-usage.md)
- [2026-02-17](memory/2026-02-17.md) - Deal hunter thread, part list optimization request, memory system discussion
- [2026-02-18](memory/2026-02-18.md) - Deal hunter analysis completion
- [2026-02-25](memory/2026-02-25.md) - BMO price tracker link enhancement

### 2026 March
- [2026-03-06](memory/2026-03-06.md) - SMG Kanban board setup with SMG-prefixed columns and auto-initialization

---

## People & Contacts

### Austin Parker (Telegram ID: 8526179963)
- **First Contact:** 2026-02-10
- **Key Interactions:**
  - DeepSeek model pricing inquiry (Feb 10-11)
  - Gateway connectivity issues reported (Feb 10-11)
  - Kanban project GitHub repository (https://github.com/AustinParker/kanban-project-board.git)
  - Deal hunter thread - part list optimization request (Feb 17)
  - Video reference: https://youtu.be/l5ggH-YhuAw (deal hunter inspiration)

### Clawd
- The creator; referenced in soul and origin memories

---

## Projects & Topics

### Deal Hunter Thread
- **Started:** 2026-02-17
- **Goal:** Assemble optimal component list (likely audio/streaming equipment) based on video inspiration
- **Current Status:** Part list not yet provided; awaiting user details
- **Video:** https://youtu.be/l5ggH-YhuAw
- **Key Point:** Microphone selection - video shows application different from desk microphone
- **See:** [2026-02-17](memory/2026-02-17.md)

### Kanban Project Board
- **Repository:** https://github.com/AustinParker/kanban-project-board.git
- **Status:** Configured with SMG workflow; push access working
- **Work Done:**
  - Drag-and-drop functionality
  - Firebase persistence
  - Auto-initialization with SMG columns: SMG-Backlog, SMG-To Do, SMG-In Progress, SMG-Review, SMG-Done
  - Sample cards seeded for quick start
  - Completion logic routes cards to SMG-Done
- **See:** [2026-02-12](memory/2026-02-12.md), [2026-03-06](memory/2026-03-06.md)

### Daily Digests Automation
- **Components:**
  - AI & Tech Digest
  - Lake Worth Local Events
  - BMO Parts Price Tracker
- **Optimization (Feb 16):** Changed delivery from PDF attachments to direct Telegram text messages
- **Output Files:**
  - `/root/.openclaw/workspace-dev/digest-output.md`
  - `/root/.openclaw/workspace-dev/events-output.md`
  - `/root/.openclaw/workspace-dev/price-tracker-output.md`
- **Tools:** `digest-to-pdf.py` (created but not used after optimization)
- **See:** [2026-02-16](memory/2026-02-16.md)

---

## User Preferences

- **Digest Format:** Prefers readable text messages in Telegram over PDF attachments
- **Organization:** Each digest should go to its dedicated Telegram thread/group
- **Cron Delivery:** Direct message sending from agent (delivery mode: "none" in cron job, agent reads output file and sends content)

---

## Technical Notes

### Memory System
- Structure: Daily files in `memory/YYYY-MM-DD.md` + optional root index (this file)
- Search: `memory_search` tool scans all files automatically
- Best Practice: Create daily file at start of each day to capture context

### Gateway & Updates
- Version: 2026.2.9 (as of 2026-02-11)
- Update mechanism: Git fetch + rebuild + restart via SIGUSR1
- Profile: dev

---

## Quick Reference

### Important Files
- Agent workspace: `/root/.openclaw/workspace-dev/`
- Memory directory: `/root/.openclaw/workspace-dev/memory/`
- Daily digest output: `/root/.openclaw/workspace-dev/digest-output.md`
- PDF converter: `/root/.openclaw/workspace-dev/digest-to-pdf.py`

### OpenClaw Commands
- `openclaw --profile dev doctor` - System health check
- `openclaw --profile dev gateway restart` - Restart gateway
- `openclaw --profile dev security audit --deep` - Security audit

---

## Maintenance

**To add a new day's memory:** Create `memory/YYYY-MM-DD.md` with the day's date.

**To update this index:** Add new entries under the appropriate section when significant events occur.

**Last index update:** 2026-02-25
