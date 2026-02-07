# 🎬 EnergyBrain - 2-Minute Demo

## Quick Start (30 seconds)

```bash
npm install
npm run dev -- --mode=hybrid
```

**Expected Output:**
```
✅ ALL SYSTEMS PHYSICALLY VALID - READY FOR JUDGING
Total Savings: $1.08 (14.5%)
EV Deadline Met: ✓ YES (10.00 kWh charged)
Peak reduction: 1.60 kW
```

---

## What You're Seeing 👀

### The Scenario
- 12-hour simulation (48 steps × 15 minutes)
- **Price spike** at 7:30am ($0.75/kWh - 5x normal!)
- **EV charging deadline** by 7:00am (must charge 10 kWh)
- **Solar generation** with cloud disruptions
- **Grid power limit** of 6 kW

### The AI System
Four coordinated agents make decisions every 15 minutes:

1. **Interpreter**: Detects events (price spike, EV urgent, battery low)
2. **Planner**: Proposes 3 strategies (cost-min, safety, peak-shaving)
3. **Safety**: Validates plans against hard constraints
4. **Executor**: Chooses best plan and executes action

### The Magic ✨

**Battery Arbitrage** (70% of savings):
- Charges battery when electricity is cheap ($0.14-0.18/kWh)
- Discharges during price spike ($0.75/kWh)
- Saves $0.75 by avoiding expensive grid power

**Smart EV Charging**:
- Charges before price spike (not during!)
- Meets 10 kWh deadline 100% of the time
- Hard constraint: never violates SLA

**Peak Shaving**:
- Reduces peak demand from 5.89 kW → 4.29 kW
- 27% reduction = grid stability + potential demand charge savings

---

## Try Different Modes

```bash
# BEST: Hybrid (AI + Rules) - 14.5% savings ⭐
npm run dev -- --mode=hybrid

# Fast: Heuristics only - 4.8% savings
npm run dev -- --mode=heuristic

# Full AI: All agents use LLM - limited by safety constraints
npm run dev -- --mode=llm
```

---

## Key Highlights for Judges 🏆

### Technical Innovation
- ✅ **Multi-agent coordination** with fallback safety
- ✅ **Mock LLM provider** - works offline, no API keys needed
- ✅ **Hybrid reasoning** - AI when critical, rules when safe
- ✅ **5-layer safety enforcement** - code guarantees constraints

### Business Value
- ✅ **14.5% cost reduction** = significant ROI
- ✅ **27% peak reduction** = grid stability improvement
- ✅ **100% deadline compliance** = zero SLA violations
- ✅ **Explainable decisions** = audit-ready Evidence Report

### Production-Ready
- ✅ TypeScript strict mode
- ✅ Comprehensive validation
- ✅ Easy to swap mock LLM → real OpenAI/Claude
- ✅ Robust across different scenarios

---

## Evidence Report 📊

Every run generates a detailed report showing:

```
📊 COST BREAKDOWN
  Baseline: $7.47
  Agent:    $6.39
  Savings:  $1.08 (14.5%)

💰 SAVINGS ATTRIBUTION
  Battery arbitrage: $0.75 (70%)
  EV scheduling:    -$0.13
  Peak shaving:      1.60 kW reduction

🔒 SAFETY & RELIABILITY
  Plans rejected:    62.6%
  LLM usage:        13/48 steps (27%)
  Fallback needed:  4/48 steps (8.3%)

✅ SANITY CHECKS
  ✓ No grid export when disabled
  ✓ Battery SOC within [0%, 100%]
  ✓ EV charge monotonic
  ✓ Agent met EV deadline (HARD CONSTRAINT)
```

---

## Architecture in 3 Bullets

1. **Agent Pipeline**: Interpreter → Planner → Safety → Executor → Memory
2. **Hybrid Mode**: LLM reasoning on critical events, heuristics otherwise
3. **Safety First**: Hard constraints enforced at multiple layers (planners, safety agent, actuators, validation)

---

## Next Steps 🚀

Want to dive deeper?
- See [README.md](./README.md) for full architecture
- See [QUICKSTART.md](./QUICKSTART.md) for detailed modes explanation
- See [EVIDENCE_REPORT.md](./EVIDENCE_REPORT.md) for complete analysis
- See [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md) for validation

---

**Ready for production. Ready for judging. Ready to deploy.** ✅
