# 🌐 Web Demo Guide

## Quick Start

```bash
npm install
npm run web
```

Open browser: **http://localhost:3000**

## What You'll See

### 📊 Real-Time Dashboard

1. **Key Metrics (Top Cards)**
   - 💰 Daily Savings: $1.96 (25.6%)
   - 📅 Monthly Savings: $58.78
   - 📈 Annual Savings: $715.12
   - 🌍 CO₂ Avoided: 429 kg/year
   - ⚡ Energy Saved: 3.05 kWh/day
   - 🚗 EV Status: ✓ Deadline MET

2. **Chart 1: Real Market Data**
   - Red line: Electricity prices (duck curve visible!)
   - Orange line: Solar generation (0 at night, peak at noon)

3. **Chart 2: Cost Comparison**
   - Red line: Baseline (naive controller) - cumulative cost
   - Green line: AI Agent (heuristic) - cumulative cost
   - Gap between lines = savings!

4. **Chart 3: Battery & EV Management**
   - Blue line: Battery State of Charge (%)
   - Purple line: EV remaining charge needed (kWh)
   - Shows how agent charges battery during cheap hours

### 🎯 Key Demo Points for Judges

1. **Real Data Source**
   - Uses Open Power System Data (OPSD)
   - Germany DE_LU bidding zone, July 15, 2019
   - 24-hour full day/night cycle

2. **Duck Curve Effect**
   - Prices DROP at noon (solar flood)
   - Prices SPIKE at evening (solar gone, demand high)
   - Agent exploits this arbitrage opportunity

3. **AI Strategy Visible**
   - Battery charges during low prices (noon)
   - Battery discharges during high prices (evening)
   - EV charges at night (cheapest hours)
   - All while meeting 07:00 deadline!

4. **Measurable Impact**
   - $715/year savings per household
   - 1.1 MWh energy saved annually
   - 429 kg CO₂ avoided
   - Scales to city/region level

## Technical Details

### Architecture

```
Browser (HTML/Chart.js)
    ↓
HTTP GET /api/simulate
    ↓
src/server.ts (Node.js HTTP server)
    ↓
src/api.ts (runs full 24h simulation)
    ↓
Returns JSON with:
  - Time series data (96 points × 15min)
  - Costs (baseline vs agent)
  - Battery SOC, EV status
  - Price & solar curves
```

### Why This Approach?

**Backend-focused demo** because:
1. ✅ Real simulation runs server-side
2. ✅ Same code as CLI (no fake UI data)
3. ✅ Easy to inspect via browser DevTools
4. ✅ Judges can see actual computation
5. ✅ No complex frontend framework needed

### API Response Format

```json
{
  "baselineCost": 7.65,
  "agentCost": 5.69,
  "baselineKWh": 59.51,
  "agentKWh": 56.42,
  "evDeadlineMet": true,
  "hours": ["00:00", "00:15", ..., "23:45"],
  "prices": [0.062, 0.061, ..., 0.063],
  "solar": [0, 0, ..., 4.0, ..., 0],
  "batterySOC": [55, 56, ..., 45],
  "evRemaining": [10, 9.8, ..., 0],
  "baselineCostCumulative": [0.01, 0.03, ...],
  "agentCostCumulative": [0.01, 0.02, ...]
}
```

## Presentation Tips

### For Judges (30 second pitch):

> "This is a **live simulation** running with **real European energy market data**.
> 
> You see 3 charts:
> 1. **Prices spike in evening** (duck curve effect)
> 2. **AI saves $1.96 per day** by smart battery/EV scheduling
> 3. **Battery charges when cheap, discharges when expensive**
> 
> Over a year: **$715 saved**, **1.1 MWh energy reduced**, **429 kg CO₂ avoided**.
> 
> This scales to buildings, campuses, and cities."

### Common Questions

**Q: Why no fancy UI controls?**
A: This is a **backend AI system**. The value is in the decision engine, not the interface. Real deployment would integrate with building management systems via API.

**Q: Can you change parameters?**
A: Yes! Edit `src/config.ts` and restart. Or use CLI: `npm run dev -- --mode=heuristic --scenario=opsd --seed=123`

**Q: Where's the data from?**
A: [Open Power System Data](https://open-power-system-data.org/) - official EU grid data from ENTSO-E Transparency Platform. CC-BY 4.0 license.

**Q: Does it work with real LLM?**
A: Yes! Swap `MockLLMProvider` with OpenAI/Anthropic client. Architecture is provider-agnostic. Mock LLM used for deterministic testing and offline demos.

## Troubleshooting

**Port 3000 already in use?**
```bash
PORT=8080 npm run web
```

**Simulation taking too long?**
- Normal: 10-15 seconds for 24h × 96 steps
- Check terminal for progress logs

**Charts not showing?**
- Check browser console (F12)
- Ensure `/api/simulate` returns 200 OK
- Look for CORS errors (shouldn't happen on localhost)

## Next Steps

After demo:
1. Show **Evidence Report** in CLI: `npm run dev -- --mode=heuristic --scenario=opsd`
2. Explain **5-layer EV deadline enforcement** (see DEMO.md)
3. Walk through **OPSD data integration** (see src/scenario/opsd.ts)
4. Discuss **production deployment** (K8s, API gateway, telemetry streams)

---

**Remember:** This is a **decision engine demo**, not a consumer app. Strength is in AI reasoning + real data + measurable impact. 🎯
