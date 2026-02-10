# 🎥 EnergyBrain - 2-Minute Demo Video Script

**Total Time: ~2 minutes**

---

## 🎬 Opening (0:00-0:15) - 15 seconds

**[Screen: Terminal showing project folder]**

**Narrator:**
> "Hi! This is EnergyBrain - an AI-powered energy management system that saves 14.5% on electricity costs using multi-agent coordination."

**[Show: README.md open with badges]**

---

## 🏗️ The Problem (0:15-0:30) - 15 seconds

**[Screen: Show DEMO.md - "The Scenario" section]**

**Narrator:**
> "Imagine a home with solar panels, battery storage, EV charging, and dynamic electricity prices. During price spikes, electricity costs 5x more. We need to charge our EV by 7am. How do we optimize?"

**[Highlight: Price spike $0.75, EV deadline]**

---

## 🧠 The Solution (0:30-0:50) - 20 seconds

**[Screen: Show architecture diagram or src/agents/ folder]**

**Narrator:**
> "EnergyBrain uses four AI agents working together:
> - Interpreter detects events like price spikes
> - Planner proposes three strategies
> - Safety validates against constraints
> - Executor chooses the best action"

**[Quick flash through: interpreter.ts, planner.ts, safety.ts, executor.ts]**

---

## 🚀 Live Demo (0:50-1:30) - 40 seconds

**[Screen: Terminal]**

**Narrator:**
> "Let's run it in Hybrid mode - our best performer."

```bash
npm run dev -- --mode=hybrid
```

**[Screen: Show output scrolling]**

**Narrator (while output runs):**
> "Watch the agents work: 
> - Charging battery when electricity is cheap
> - Discharging during the price spike to save money
> - Completing EV charging before the deadline
> - All while respecting grid power limits"

**[Screen: Pause at key moment showing battery discharge during spike]**

**[Highlight on screen with arrows/boxes:]**
- "Step 30: $0.75/kWh spike!"
- "Battery discharging -3.5kW"
- "Avoiding expensive grid power"

---

## 📊 Results (1:30-1:50) - 20 seconds

**[Screen: Evidence Report final output]**

**Narrator:**
> "The results speak for themselves:"

**[Zoom in on each metric as you mention it:]**

```
Total Savings: $1.08 (14.5%)
Peak reduction: 1.60 kW (27% lower)
EV Deadline: ✓ YES (10.00 kWh charged)
✅ ALL SYSTEMS PHYSICALLY VALID
```

**Narrator:**
> "14.5% cost savings, 27% peak reduction, and 100% deadline compliance."

---

## 🎯 Closing (1:50-2:00) - 10 seconds

**[Screen: GitHub repo page or README.md]**

**Narrator:**
> "EnergyBrain combines AI reasoning with hard constraint enforcement. Production-ready, explainable, and it works offline with no API keys. Check it out on GitHub!"

**[Show: GitHub URL on screen]**
```
github.com/sardorismatullaev707-collab/energyBrain
```

**[Fade to: "EnergyBrain - AI-Powered Energy Optimization"]**

---

# 🎬 Recording Tips

## Setup Before Recording

1. **Clean terminal:**
   ```bash
   clear
   cd "/Users/apple/VS projects/7 feb TS hackathon/energy-brain"
   ```

2. **Increase terminal font size** for better visibility:
   - Terminal → Settings → Profiles → Text → Font size: 18-20pt

3. **Test run first:**
   ```bash
   npm run dev -- --mode=hybrid
   ```

4. **Prepare file views:**
   - Open VS Code with project
   - Have README.md, DEMO.md ready in tabs
   - Open src/agents/ folder to show files

## Recording Flow

### Scene 1: Introduction (Terminal + README)
- Start in terminal showing project folder
- Split screen: Terminal (left) + VS Code with README (right)

### Scene 2: Problem (DEMO.md)
- Show DEMO.md "The Scenario" section
- Use cursor to highlight key points

### Scene 3: Solution (Architecture)
- Show src/agents/ folder structure
- Quickly hover over: interpreter.ts, planner.ts, safety.ts, executor.ts

### Scene 4: Live Demo (Terminal fullscreen)
- **IMPORTANT:** Start recording BEFORE running the command
- Run: `npm run dev -- --mode=hybrid`
- Let it run for ~10 seconds showing scrolling output
- Can **speed up video 2x** during output scrolling in editing
- Pause/highlight at Step 30 (price spike)

### Scene 5: Results (Terminal)
- Scroll to bottom showing final Evidence Report
- Highlight key numbers

### Scene 6: Closing (GitHub)
- Show GitHub repo page or README
- Display GitHub URL clearly

## Video Editing Checklist

- [ ] Background music (soft, non-intrusive)
- [ ] Add text overlays for key numbers (14.5%, 1.60kW, etc.)
- [ ] Add arrows/boxes to highlight important parts
- [ ] Speed up terminal output section (2x speed)
- [ ] Add transitions between sections
- [ ] Ensure audio is clear and loud enough
- [ ] Export as MP4, 1080p

## Screen Recording Tools

**Mac:**
- QuickTime Player (built-in): File → New Screen Recording
- OBS Studio (free, more features): https://obsproject.com/
- ScreenFlow (paid, professional): https://www.telestream.net/screenflow/

**Pro tip:** Record in 1080p or higher for best quality!

---

# 📝 Backup Script (If Something Goes Wrong)

## Quick Demo Alternative (1 minute version)

If you run short on time, cut to essentials:

1. **Show problem** (10s): "Managing energy with price spikes and EV deadlines"
2. **Run demo** (30s): `npm run dev -- --mode=hybrid`
3. **Show results** (15s): "14.5% savings, 27% peak reduction"
4. **Close** (5s): "Production-ready AI system. Check GitHub!"

---

# 🎯 Key Messages to Emphasize

1. **14.5% savings** - Real economic value
2. **Multi-agent AI** - Technical innovation
3. **100% deadline compliance** - Reliability
4. **Production-ready** - Not just a prototype
5. **Offline capable** - No API keys needed

---

# 📹 After Recording

Upload to:
- [ ] YouTube (unlisted or public)
- [ ] Google Drive (public link)
- [ ] Loom
- [ ] Vimeo

Get shareable link and add to submission form!

---

**Good luck with recording! 🎬🚀**
