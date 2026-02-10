import './App.css'

function App() {
  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-brand">
            <span className="logo">🔋 EnergyBrain</span>
          </div>
          <div className="nav-links">
            <a href="#muammo">Muammo</a>
            <a href="#yechim">Yechim</a>
            <a href="#jamoa">Jamoa</a>
            <a href="#qanday-ishlaydi">Qanday ishlaydi</a>
            <a href="#reja">Reja</a>
            <a href="#demo">Demo</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Sun'iy Intellekt bilan<br />
              <span className="gradient-text">Energiya Optimizatsiyasi</span>
            </h1>
            <p className="hero-subtitle">
              Avtonomli AI tizimi har 15 daqiqada energiya bo'yicha aqlli qarorlar qabul qiladi.
              Real bozor ma'lumotlari va xavfsiz kod bilan 25.6% tejash.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">$715</div>
                <div className="stat-label">Yillik tejash</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">25.6%</div>
                <div className="stat-label">Xarajat kamayishi</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">429 kg</div>
                <div className="stat-label">CO₂ kamayishi</div>
              </div>
            </div>
            <div className="hero-buttons">
              <a href="#demo" className="btn btn-primary">Demo ko'rish</a>
              <a href="https://github.com/sardorismatullaev707-collab/energyBrain" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="muammo" className="section section-light">
        <div className="container">
          <h2 className="section-title">📉 Muammo nima?</h2>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">💰</div>
              <h3>Elektr narxi o'zgaradi</h3>
              <p>
                Elektr energiyasi narxi kun davomida 3 martagacha o'zgaradi, lekin binolar va uylar
                buni hisobga olmaydi va doimo bir xil quvvatda iste'mol qiladi.
              </p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">⚡</div>
              <h3>Pik vaqtlarda yuklama</h3>
              <p>
                Kechqurun barcha binolar bir vaqtda ko'p elektr iste'mol qiladi. Bu tarmoqqa katta
                bosim beradi va narxlarni oshiradi.
              </p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🤖</div>
              <h3>Avtomatik qaror yo'q</h3>
              <p>
                Binolarda energiyani aqlli boshqarish tizimi yo'q. Batareya, EV, HVAC qo'lda yoki
                qo'pol qoidalar bilan boshqariladi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="yechim" className="section">
        <div className="container">
          <h2 className="section-title">✨ Yechim: EnergyBrain</h2>
          <div className="solution-content">
            <div className="solution-text">
              <h3>Avtonomli Backend Qaror Tizimi</h3>
              <p className="lead">
                EnergyBrain — bu chatbot emas. Bu <strong>backend infrastruktura</strong> bo'lib,
                har 15 daqiqada energiya bo'yicha aqlli qarorlar qabul qiladi.
              </p>
              <ul className="feature-list">
                <li>
                  <span className="check">✓</span>
                  <strong>AI Agent Arxitekturasi:</strong> State Interpreter → Planner → Safety → Executor
                </li>
                <li>
                  <span className="check">✓</span>
                  <strong>Real Bozor Ma'lumotlari:</strong> Open Power System Data (ENTSO-E, Germaniya)
                </li>
                <li>
                  <span className="check">✓</span>
                  <strong>Deterministik Xavfsizlik:</strong> EV deadline, tarmoq limiti kod bilan himoyalangan
                </li>
                <li>
                  <span className="check">✓</span>
                  <strong>3 Rejim:</strong> LLM (sun'iy intellekt), Heuristic (qoidalar), Hybrid (aralash)
                </li>
                <li>
                  <span className="check">✓</span>
                  <strong>Ishonchli Natija:</strong> 25.6% tejash, 1.1 MWh/yil energiya kamayishi
                </li>
              </ul>
            </div>
            <div className="solution-visual">
              <div className="visual-card">
                <h4>📊 Natijalar (24 soatlik simulyatsiya)</h4>
                <div className="result-item">
                  <span>Kunlik tejash:</span>
                  <strong className="green">$1.96 (25.6%)</strong>
                </div>
                <div className="result-item">
                  <span>Oylik tejash:</span>
                  <strong className="green">$58.78</strong>
                </div>
                <div className="result-item">
                  <span>Yillik tejash:</span>
                  <strong className="green">$715.12</strong>
                </div>
                <div className="result-item">
                  <span>Energiya tejash:</span>
                  <strong>1,114 kWh/yil</strong>
                </div>
                <div className="result-item">
                  <span>CO₂ kamayishi:</span>
                  <strong className="green">429 kg/yil</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="jamoa" className="section section-light">
        <div className="container">
          <h2 className="section-title">👥 Jamoa</h2>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">
                <img src="/sar_ava.jpeg" alt="Sardor Ismatullaev" />
              </div>
              <h3 className="team-name">Sardor Ismatullaev</h3>
              <p className="team-role">Tech Lead, Full-stack developer, co-founder</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">
                <img 
                  src="/ibrohim.jpeg" 
                  alt="Ibrohim Ismatullaev"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  }}
                />
              </div>
              <h3 className="team-name">Ibrohim Ismatullaev</h3>
              <p className="team-role">Product Lead, Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="qanday-ishlaydi" className="section">
        <div className="container">
          <h2 className="section-title">⚙️ Qanday ishlaydi?</h2>
          <div className="workflow">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <h3>Ma'lumot olish</h3>
              <p>Tizim real vaqtda elektr narxi, quyosh energiyasi, yuklama haqida ma'lumot oladi.</p>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-number">2</div>
              <h3>AI tahlil</h3>
              <p>State Interpreter hodisalarni aniqlaydi (narx sakrash, EV shoshilinch, batareya past).</p>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-number">3</div>
              <h3>Strategiya yaratish</h3>
              <p>Planner Agent 3 ta variant taklif qiladi: xarajat min, xavfsizlik, pik qisqartirish.</p>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-number">4</div>
              <h3>Xavfsizlik tekshiruvi</h3>
              <p>Safety Agent EV deadline, tarmoq limiti, batareya SOC ni tekshiradi. Noto'g'ri rejalar rad etiladi.</p>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-number">5</div>
              <h3>Qaror bajarish</h3>
              <p>Executor Agent eng yaxshi rejani tanlaydi va batareya/EV/HVAC ni boshqaradi.</p>
            </div>
          </div>
          <div className="tech-stack">
            <h3>Texnologiyalar</h3>
            <div className="tech-tags">
              <span className="tech-tag">TypeScript</span>
              <span className="tech-tag">Node.js</span>
              <span className="tech-tag">AI Agents</span>
              <span className="tech-tag">OPSD Data</span>
              <span className="tech-tag">Mock LLM</span>
              <span className="tech-tag">ESM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="reja" className="section section-light">
        <div className="container">
          <h2 className="section-title">🗺️ Rivojlanish Rejasi</h2>
          <div className="roadmap">
            <div className="roadmap-phase">
              <h3>0-6 oy: Pilot Loyiha</h3>
              <ul>
                <li>2-3 ta binoda pilot test</li>
                <li>Real ma'lumotlar bilan integratsiya</li>
                <li>Energiya tejashni o'lchash</li>
                <li>Sistema optimizatsiyasi</li>
              </ul>
            </div>
            <div className="roadmap-arrow">↓</div>
            <div className="roadmap-phase">
              <h3>6-12 oy: Kengaytirish</h3>
              <ul>
                <li>10-20 ta binoga kengayish</li>
                <li>Davlat yoki utility kompaniyalar bilan hamkorlik</li>
                <li>Real LLM integratsiyasi (OpenAI/Anthropic)</li>
                <li>Dashboard va monitoring tizimi</li>
              </ul>
            </div>
            <div className="roadmap-arrow">↓</div>
            <div className="roadmap-phase">
              <h3>1-2 yil: Miqyoslash</h3>
              <ul>
                <li>B2B / B2G model (biznes va davlat)</li>
                <li>Shahar va viloyatlar bo'yicha kengayish</li>
                <li>Boshqa mamlakatlar uchun moslashuv</li>
                <li>API platform va marketplace</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section - Full Width */}
      <section className="section section-light">
        <div className="container">
          <h2 className="section-title">� Video Demo</h2>
          <p style={{textAlign: 'center', fontSize: '1.2em', color: '#666', marginBottom: '40px'}}>
            2 daqiqalik video taqdimot - Terminal simulyatsiyasi va natijalar
          </p>
        </div>
        <div style={{maxWidth: '1400px', margin: '0 auto', padding: '0 20px'}}>
          <div className="video-container">
            <iframe 
              width="100%" 
              height="700" 
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
              title="EnergyBrain Demo - AI Energiya Optimizatsiyasi" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
          <div style={{textAlign: 'center', marginTop: '20px'}}>
            <a 
              href="https://youtube.com/watch?v=YOUR_VIDEO_ID" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{fontSize: '1.1em', padding: '15px 40px'}}
            >
              📺 YouTube'da to'liq ko'rish
            </a>
          </div>
        </div>
      </section>

      {/* Demo Links Section */}
      <section id="demo" className="section">
        <div className="container">
          <h2 className="section-title">🔗 Havolalar va Resurslar</h2>
          <div className="demo-grid">
            <div className="demo-card">
              <h3>📦 GitHub Repository</h3>
              <p>Backend kod, ma'lumotlar, simulyatsiya natijalari</p>
              <a 
                href="https://github.com/sardorismatullaev707-collab/energyBrain" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                GitHub'da ochish
              </a>
            </div>
            <div className="demo-card">
              <h3>📊 OPSD Ma'lumotlari</h3>
              <p>Real Yevropa energiya bozori ma'lumotlari</p>
              <a 
                href="https://open-power-system-data.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                OPSD platformasi
              </a>
            </div>
            <div className="demo-card">
              <h3>💻 Backend O'rnatish</h3>
              <p>Kompyuteringizda ishga tushirish</p>
              <div className="code-snippet">
                <code>
                  git clone [repo]<br/>
                  cd energy-brain<br/>
                  npm install<br/>
                  npm run dev -- --mode=heuristic --scenario=opsd
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>🔋 EnergyBrain</h4>
              <p>Avtonomli AI energiya optimizatsiya tizimi</p>
            </div>
            <div className="footer-section">
              <h4>Havolalar</h4>
              <a href="https://github.com/sardorismatullaev707-collab/energyBrain" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="https://open-power-system-data.org/" target="_blank" rel="noopener noreferrer">
                OPSD Data
              </a>
            </div>
            <div className="footer-section">
              <h4>Ma'lumot</h4>
              <p>Real ma'lumotlar • AI agentlar • Xavfsizlik • Ishlab chiqarishga tayyor</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 EnergyBrain. Barcha huquqlar himoyalangan.</p>
            <p>Ma'lumotlar: Open Power System Data (CC-BY 4.0)</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
