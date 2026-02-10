# EnergyBrain Landing Page

Bu loyihaning rasmiy landing page sahifasi. Backend kodidan mustaqil React + Vite ilovasidir.

## 🎯 Maqsad

Bu landing page:
- Loyiha haqida umumiy ma'lumot beradi
- Muammo va yechimni tushuntiradi
- Jamoa a'zolarini tanishtiradi
- Rivojlanish rejasini ko'rsatadi
- Demo va GitHub havolalarini taqdim etadi

**Muhim:** Bu faqat prezentatsiya uchun sahifa. Backend kodi (`src/` papkasida) alohida ishga tushiriladi.

## 🚀 Ishga Tushirish

```bash
cd frontend
npm install
npm run dev
```

Brauzerda: http://localhost:5173

## 📁 Struktura

```
frontend/
├── index.html          # HTML entry point
├── vite.config.js      # Vite konfiguratsiyasi
├── package.json        # Dependencies
└── src/
    ├── main.jsx        # React root
    ├── App.jsx         # Landing page komponenti
    ├── App.css         # Stillar
    └── index.css       # Global CSS reset
```

## ✏️ Jamoa Ma'lumotlarini Yangilash

`App.jsx` faylida 2 ta team member placeholder mavjud:

```jsx
<div className="team-card">
  <div className="team-avatar">
    <img src="" alt="Team Member" /> {/* Bu yerga rasm URL qo'shing */}
  </div>
  <div className="team-name">[Ism Familiya]</div>
  <div className="team-role">[Rol / Lavozim]</div>
</div>
```

Quyidagilarni almashtiring:
- `src=""` → Rasm URL yoki lokal path
- `[Ism Familiya]` → To'liq ism
- `[Rol / Lavozim]` → Masalan: "AI Engineer", "Backend Developer"

## 🌐 Deploy Qilish

### Vercel (Tavsiya)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# dist/ papkasini Netlify drag & drop
```

### GitHub Pages
```bash
npm run build
# dist/ papkasini gh-pages branchiga push qiling
```

## 🔗 Havolalar

Landing page ichida quyidagi havolalar mavjud:
- **GitHub**: Asosiy repository havolasi (yangilang)
- **Video**: Placeholder (YouTube URL qo'shing)
- **OPSD**: https://open-power-system-data.org/
- **Install**: Backend o'rnatish komandasi

## 🎨 Dizayn

- **Ranglar**: Gradient purple (#667eea → #764ba2)
- **Font**: System fonts (sans-serif)
- **Responsive**: Mobile-friendly
- **Animatsiyalar**: Hover effects, smooth transitions

## 📊 Asosiy Statistikalar

Landing page'da ko'rsatilgan natijalar:
- **Yillik Tejash**: $715.12
- **Foiz**: 25.6% kamayish
- **CO₂**: 429 kg/yil kamaytirish

Bu raqamlar heuristic mode simulatsiyasidan olingan (96 qadam, 24 soat).

## 🌍 Til

Butun sahifa o'zbek tilida (lotin alifbosi). Ingliz tilini qo'shish uchun:
1. Alohida `App_en.jsx` yarating
2. Yoki i18n kutubxonasidan foydalaning

## ⚠️ Backend bilan Aloqa

Bu landing page backend bilan **bog'lanmaydi**. U faqat:
- Loyiha haqida ma'lumot beradi
- GitHub ga yo'naltiradi
- O'rnatish yo'riqnomasini ko'rsatadi

Foydalanuvchilar backend kodini alohida yuklab olishlari va ishga tushirishlari kerak.

## 📝 Lisenziya

Backend bilan bir xil (MIT).
