#!/bin/bash
# Demo script for video recording
# Makes terminal output cleaner and more readable

echo "═══════════════════════════════════════════════════════════"
echo "   🔋 EnergyBrain - AI Energy Optimization Demo"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Scenario: 12-hour day with:"
echo "   • Price spike at 7:30am ($0.75/kWh - 5x normal)"
echo "   • EV needs 10 kWh charge by 7:00am"
echo "   • Solar panels + battery storage"
echo "   • 6 kW grid power limit"
echo ""
echo "🧠 Running Multi-Agent AI System (Hybrid Mode)..."
echo ""
sleep 2

npm run dev -- --mode=hybrid
