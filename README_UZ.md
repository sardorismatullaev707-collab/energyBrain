# EnergyBrain 🔋🧠

**Sun'iy Intellekt Agentlari bilan Avtonomli Energiya Boshqaruv Tizimi**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **💰 Yillik $715 tejash (25.6%)! | 🔋 24 soatlik real simulyatsiya | ✅ 100% EV deadline | 🇪🇺 OPSD real Yevropa ma'lumotlari**

**[English](README_EN.md) | O'zbekcha**

Sun'iy intellektli agentlar energiya tizimini har 15 daqiqada optimallashtiradigan backend tizimi. **UI yo'q, qattiq kodlangan qoidalar yo'q** - faqat aqlli agentlar Mock LLM orqali qaror qabul qiladi (tashqi API key kerak emas).

## 🌟 Asosiy Xususiyatlar

- 🧠 **LLM asosidagi AI agentlar** - Mock provider bilan (offline ishlaydi!)
- 📊 **25.6% kunlik tejash** = **$715/yil** real Yevropa energiya bozori ma'lumotlari bilan
- 🕐 **To'liq 24 soatlik simulyatsiya** (96 qadam × 15 daqiqa) kun/kecha tsikllar bilan
- 🇪🇺 **Open Power System Data** - Germaniya ENTSO-E real narxlar, quyosh va shamol
- 💰 **Oylik: $58.78 tejash** | **Yillik: $715 tejash** | **CO₂: 429 kg/yil kamayish**
- 🔒 **Deterministik xavfsizlik** - kod cheklovlarni ta'minlaydi
- 🔄 **3 ta rejim**: LLM, Heuristic, Hybrid
- 🎯 **Ishlab chiqarishga tayyor** - real LLM ni osongina almashtirish mumkin

## 📖 Umumiy Ma'lumot

EnergyBrain bu **AI-as-infrastructure** konsepsiyasini namoyish etadi: murakkab qoidalar tizimini koordinatsiyalangan AI agentlar bilan almashtiruvchi backend qaror qabul qilish qatlami.

### 🎯 Muammo

Bugungi kunda elektr energiyasi narxi kun davomida **3 martagacha o'zgaradi**, lekin binolar va uylar buni hisobga olmaydi va doimo bir xil quvvatda iste'mol qiladi. **Kechqurun pik vaqtlarda** barcha bir vaqtda elektr iste'mol qiladi va bu tarmoqqa katta bosim beradi hamda narxlarni oshiradi. Binolarda **energiyani aqlli boshqarish tizimi yo'q** - batareya, EV, HVAC qo'lda yoki qo'pol qoidalar bilan boshqariladi.

### 💡 Yechim

EnergyBrain har 15 daqiqada quyidagi jihatlarni boshqaradi:

- 🔋 **Batareya** zaryadlash/zaryadsizlantirish
- 🚗 **Elektromobil** zaryadlash (deadline bilan)
- 🌡️ **HVAC** qulaylik nazorati
- ⚡ **Tarmoq** quvvat limitleri
- 💰 **Dinamik** elektr tariflari
- ☀️ **Quyosh** energiyasi ishlab chiqarish

Tizim **real vaqtda** elektr narxi, quyosh energiyasi va yuklama haqida ma'lumot oladi. **AI agent arxitekturasi** yordamida aqlli qarorlar qabul qiladi. Xavfsizlik **kod bilan ta'minlangan** - EV deadline, tarmoq limiti hech qachon buzilmaydi.

## 🏗️ Arxitektura

### AI Agentlar (Qaror Qabul Qilish)

1. **StateInterpreterAgent**: Joriy holatni tahlil qiladi, hodisalarni aniqlaydi (narx sakrashi, EV shoshilinchlik, tarmoq xavfi)
2. **PlannerAgent**: 3 ta kandidat strategiya taklif qiladi (xarajat-min, xavfsizlik-birinchi, pik-qisqartirish)
3. **SafetyConstraintsAgent**: Rejalarni qattiq cheklovlarga qarshi tekshiradi (deterministik)
4. **ExecutionAgent**: Eng yaxshi rejani tanlaydi va darhol harakatni ajratib oladi

### Ma'lumotlar Oqimi

```
Real Ma'lumotlar → State Interpreter → Planner → Safety → Executor → Xotira
```

## 📊 Natijalar (24 soatlik simulyatsiya)

### 🏆 OPSD Real Yevropa Ma'lumotlari (Tavsiya)

| Rejim | Kunlik | Kunlik Tejash | Oylik Tejash | Yillik Tejash |
|-------|---------|---------------|--------------|---------------|
| **Heuristic** 🥇 | $5.69 | **$1.96 (25.6%)** | **$58.78** | **$715.12** |
| Hybrid | $7.21 | $0.43 (5.7%) | $13.03 | $158.50 |
| LLM | $8.70 | -$1.05 (-13.8%) | -$31.62 | -$384.68 |

**Baseline (oddiy nazorat): $7.65/kun** ($229.39/oy, $2,790.88/yil)

### 🌍 Ekologik Ta'sir (Heuristic rejim)

- 💰 **Yillik tejash**: $715.12 (25.6%)
- ⚡ **Tejangan energiya**: 1,114 kWh/yil (1.1 MWh)
- 🌍 **CO₂ kamayishi**: 429 kg/yil (0.43 tonna)
- 🌳 **Ekvivalent**: ~19 ta daraxt ekish/yil

### Xavfsizlik Ko'rsatkichlari

- ✅ **EV Deadline**: 100% bajarildi (07:00 ga tayyorlangan)
- ✅ **Tarmoq Limiti**: Hech qachon 12 kW oshirmagan
- ✅ **Batareya SOC**: 20-90% oralig'ida qoldi
- ✅ **Jarimalar**: $0.00 (hech qanday cheklov buzilmagan)

## 🚀 O'rnatish va Ishga Tushirish

### 1. O'rnatish

```bash
git clone https://github.com/sardorismatullaev707-collab/energyBrain.git
cd energyBrain
npm install
```

### 2. Simulyatsiya Ishga Tushirish

```bash
# 🏆 Heuristic rejim (tavsiya etiladi - 25.6% tejash!)
npm run dev -- --mode=heuristic --scenario=opsd

# LLM rejim (Mock LLM)
npm run dev -- --mode=llm --scenario=opsd

# Hybrid rejim
npm run dev -- --mode=hybrid --scenario=opsd
```

### 3. Natijalarni Ko'rish

Terminal'da batafsil hisobot ko'rinadi:
- 📊 Umumiy xarajatlar taqqoslash
- 💰 Oylik va yillik tejash proyeksiyasi  
- 🔋 Batareya va EV foydalanish statistikasi
- 🌍 CO₂ kamayishi hisoblash
- 🔒 Xavfsizlik va ishonchlilik ko'rsatkichlari

## 📁 Loyiha Tuzilmasi

```
energy-brain/
├── src/
│   ├── agents/           # AI agentlar
│   │   ├── stateInterpreter.ts
│   │   ├── planner.ts
│   │   ├── safety.ts
│   │   └── executor.ts
│   ├── scenario/         # Ma'lumotlar
│   │   ├── opsd.ts       # ⭐ Real OPSD ma'lumotlari
│   │   ├── tariffs.ts    # Elektr tariflari
│   │   └── solar.ts      # Quyosh ishlab chiqarish
│   ├── sim/              # Simulyatsiya
│   ├── llm/              # LLM provider
│   └── util/             # Yordamchi vositalar
├── frontend/             # 🌐 React landing page
│   ├── src/
│   │   ├── App.jsx       # Asosiy komponent
│   │   └── App.css       # Stillar
│   └── public/           # Statik fayllar (rasmlar)
└── README.md
```

## 🌐 Landing Page

React asosidagi taqdimot veb-sayti `frontend/` papkasida:

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173 da ochiladi
```

**Xususiyatlar:**
- 🇺🇿 To'liq o'zbek tilida (lotin alifbosi)
- 📊 Real statistika ($715/yil tejash)
- 👥 Jamoa a'zolari profillari (katta rasmlar!)
- 🎥 YouTube video demo (katta player!)
- 🗺️ Rivojlanish rejasi va fazalar
- 🔗 GitHub, demo va OPSD havolalari

**Eslatma:** Landing page faqat **taqdimot sayti** - backend bilan bog'lanmaydi. Foydalanuvchilar backend kodini alohida yuklab olishlari kerak.

Batafsil: [frontend/README.md](frontend/README.md)

## 🎥 Demo Video

1 daqiqalik demo video skripti: [DEMO_SCRIPT_UZ.md](DEMO_SCRIPT_UZ.md)

**Script tuzilmasi:**
- ⏱️ **0:00-0:10**: Kirish - EnergyBrain tanishtiruv
- ⏱️ **0:10-0:25**: Muammo - elektr narxi o'zgaradi, avtomatlashtirish yo'q
- ⏱️ **0:25-0:45**: Yechim - AI agentlar, real ma'lumotlar, aqlli qarorlar
- ⏱️ **0:45-0:55**: Natijalar - $715/yil tejash, 429 kg CO₂ kamayish
- ⏱️ **0:55-1:00**: Xulosa - kelajak energiya tizimi

## 🔬 Texnik Ma'lumotlar

### Ma'lumotlar Manbasi: OPSD

**Open Power System Data (OPSD)** - Yevropa elektr energiya tizimlariga oid ochiq, bepul va ommaviy ma'lumotlar platformasi.

- 🇩🇪 **Mintaqa**: Germaniya DE_LU
- 📅 **Sana**: 2019-07-15 (yozgi kun)
- 🕐 **Interval**: 24 soatlik to'liq sikl (00:00 - 23:59)
- 📊 **Narxlar**: €20-€69/MWh (ENTSO-E day-ahead)
- ☀️ **Quyosh**: 0-33,420 MW (duck curve effekti)
- 💨 **Shamol**: 2,430-5,230 MW
- ⚡ **Yuklama**: 41,920-72,450 MW

**Havolalar:**
- 🌐 OPSD platformasi: https://open-power-system-data.org/
- 📥 Ma'lumotlar yuklab olish: https://data.open-power-system-data.org/time_series/
- ⚖️ Litsenziya: CC-BY 4.0 (mualliflikni ko'rsatish kerak)
- 🇪🇺 Manba: ENTSO-E Transparency Platform (rasmiy EU tarmoq ma'lumotlari)

### Simulyatsiya Parametrlari

- **Umumiy qadamlar**: 96 qadam (24 soat × 4 qadam/soat)
- **Qadam intervali**: 15 daqiqa
- **Batareya**: 20 kWh sig'im (SOC: 20-90%)
- **EV**: 60 kWh sig'im (deadline: qadam 28, 07:00)
- **Tarmoq limiti**: 12 kW maksimal quvvat
- **Quyosh quvvati**: 0-6 kW (kun davomida)
- **HVAC**: 23-26°C qulaylik oralig'i

### Texnologiyalar

- **Til**: TypeScript 5.0
- **Runtime**: Node.js 18+
- **Modullar**: ESM (Native ES modules)
- **Frontend**: React 18 + Vite 5
- **Stil**: CSS3 (Responsive design)
- **LLM**: Mock provider (API key kerak emas)

## 📈 Kelajak Rivojlanish

### 0-6 oy: Pilot Loyiha
- 2-3 ta binoda pilot test
- Real ma'lumotlar bilan integratsiya  
- Energiya tejashni o'lchash
- Sistema optimizatsiyasi

### 6-12 oy: Kengaytirish
- 10-20 ta binoga kengayish
- Davlat yoki utility kompaniyalar bilan hamkorlik
- Real LLM integratsiyasi (OpenAI/Anthropic)
- Dashboard va monitoring tizimi

### 1-2 yil: Miqyoslash
- **B2B / B2G model** (biznes va davlat)
- Shahar va viloyatlar bo'yicha kengayish
- Boshqa mamlakatlar uchun moslashuv
- **API platform** va marketplace

## 🤝 Jamoa

| | |
|---|---|
| **Sardor Ismatullaev** | Tech Lead, Full-stack developer, co-founder |
| **Ibrohim Ismatullaev** | Product Lead, Founder |

## 📄 Litsenziya

MIT

## 🏆 Yaratilgan

**TypeScript Hackathon - Fevral 2026**

AI agentlarni infrastruktura sifatida ko'rsatish - chatbot emas!

---

## 📚 Qo'shimcha Hujjatlar

- **[DEMO_SCRIPT_UZ.md](DEMO_SCRIPT_UZ.md)** - Video demo skripti (1 daqiqa)
- **[frontend/README.md](frontend/README.md)** - Landing page hujjatlari
- **[EVIDENCE_REPORT.md](EVIDENCE_REPORT.md)** - Fizik validlik isboti
- **[QUICKSTART.md](QUICKSTART.md)** - Tez boshlanish qo'llanmasi
- **[README_EN.md](README_EN.md)** - English version

## 🌍 Ma'lumotlar Manbasi va Litsenziya

Ushbu loyihada ishlatiladigan ma'lumotlar **[Open Power System Data](https://open-power-system-data.org/)** platformasidan olingan (**CC-BY 4.0** litsenziyasi).

**OPSD Haqida:**
Open Power System Data - bu Yevropa elektr energiya tizimlariga oid ochiq, bepul va ommaviy ma'lumotlar platformasi. ENTSO-E (Yevropa Elektr Uzatish Tizimi Operatorlari Tarmog'i) va boshqa ishonchli manbalardan real bozor ma'lumotlarini taqdim etadi.

## 💬 Aloqa

GitHub Issues orqali savol va takliflaringizni yozishingiz mumkin:
👉 https://github.com/sardorismatullaev707-collab/energyBrain/issues

---

**⭐ Agar loyiha foydali bo'lsa, GitHub'da star bering!**

**🔗 Demo ko'rish:** [Landing Page](http://localhost:5173) | [Video Demo](DEMO_SCRIPT_UZ.md)
