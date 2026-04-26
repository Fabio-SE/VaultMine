import { useState, useEffect, useCallback } from 'react'
import { api, getApiUrl, setApiUrl } from './api'
import SetupPage   from './pages/SetupPage'
import ServersPage from './pages/ServersPage'
import RunnerPage  from './pages/RunnerPage'
import OptionsPage from './pages/OptionsPage'
import ModsPage    from './pages/ModsPage'
import BackupPage  from './pages/BackupPage'
import LogsPage    from './pages/LogsPage'
import { VaultLogo, ThemeToggle } from './components/UI'
import {
  Settings, Server, Play, Sliders, Package,
  HardDrive, ScrollText, WifiOff, X, Check,
  ArrowRight, Zap, Shield, RefreshCw,
} from 'lucide-react'

const NAV = [
  { id:'setup',   label:'Setup',      icon:Settings,    desc:'Configurar sessão'   },
  { id:'servers', label:'Servidores', icon:Server,      desc:'Criar e escolher'    },
  { id:'runner',  label:'Iniciar',    icon:Play,        desc:'Ligar o servidor'    },
  { id:'options', label:'Opções',     icon:Sliders,     desc:'server.properties'   },
  { id:'mods',    label:'Mods',       icon:Package,     desc:'Modrinth'            },
  { id:'backup',  label:'Backup',     icon:HardDrive,   desc:'Salvar mundo'        },
  { id:'logs',    label:'Logs & TPS', icon:ScrollText,  desc:'Output & tunning'    },
]

const PAGES = {
  setup:SetupPage, servers:ServersPage, runner:RunnerPage,
  options:OptionsPage, mods:ModsPage, backup:BackupPage, logs:LogsPage,
}

function useTheme() {
  const [theme, setThemeState] = useState(() =>
    localStorage.getItem('vault_theme') || 'dark'
  )
  const setTheme = t => {
    setThemeState(t)
    localStorage.setItem('vault_theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [])
  return [theme, setTheme]
}

export default function App() {
  const [page,       setPage]        = useState(null)         // null = landing
  const [status,     setStatus]      = useState(null)
  const [online,     setOnline]      = useState(false)
  const [ping,       setPing]        = useState(null)
  const [apiUrl,     setApiUrlState] = useState(getApiUrl)
  const [showCfg,    setShowCfg]     = useState(false)
  const [tmpUrl,     setTmpUrl]      = useState(getApiUrl)
  const [theme,      setTheme]       = useTheme()

  const checkHealth = useCallback(async () => {
    const t0 = Date.now()
    try {
      const s = await api.health(); setStatus(s); setOnline(true); setPing(Date.now()-t0)
    } catch { setStatus(null); setOnline(false); setPing(null) }
  }, [])

  useEffect(() => {
    checkHealth()
    const t = setInterval(checkHealth, 5000)
    return () => clearInterval(t)
  }, [checkHealth])

  const saveUrl = () => {
    setApiUrl(tmpUrl); setApiUrlState(tmpUrl)
    setShowCfg(false); setTimeout(checkHealth, 300)
  }

  // ── Landing ────────────────────────────────────────────── //
  if (page === null) return (
    <LandingPage
      online={online} ping={ping} status={status}
      theme={theme} setTheme={setTheme}
      onEnter={() => setPage('setup')}
    />
  )

  const Page = PAGES[page]

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', transition:'background 0.35s' }}>
      <Sidebar
        page={page} setPage={setPage}
        online={online} status={status} ping={ping}
        showCfg={showCfg} setShowCfg={setShowCfg}
        tmpUrl={tmpUrl} setTmpUrl={setTmpUrl}
        apiUrl={apiUrl} saveUrl={saveUrl}
        theme={theme} setTheme={setTheme}
        onLanding={() => setPage(null)}
      />
      <main style={{
        flex:1, overflowY:'auto', overflowX:'hidden',
        background: 'var(--bg)',
        backgroundImage: theme === 'dark'
          ? 'radial-gradient(ellipse 60% 35% at 15% 0%, #c4a26508 0%, transparent 70%)'
          : 'radial-gradient(ellipse 60% 35% at 15% 0%, #c4a26514 0%, transparent 70%)',
      }}>
        {!online && page !== 'setup'
          ? <OfflineScreen onGo={() => { setTmpUrl(apiUrl); setShowCfg(true); setPage('setup') }} />
          : <Page key={page} status={status} onRefresh={checkHealth} />
        }
      </main>
    </div>
  )
}

/* ── Landing Page ─────────────────────────────────────────── */
function LandingPage({ online, ping, status, theme, setTheme, onEnter }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      transition: 'background 0.35s',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background texture */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
        backgroundImage: theme === 'dark'
          ? `radial-gradient(ellipse 80% 50% at 50% -10%, #c4a26510 0%, transparent 60%),
             radial-gradient(ellipse 40% 40% at 90% 80%, #6a8ec008 0%, transparent 60%)`
          : `radial-gradient(ellipse 80% 50% at 50% -10%, #c4a26520 0%, transparent 60%),
             radial-gradient(ellipse 40% 40% at 90% 80%, #6a8ec012 0%, transparent 60%)`,
      }} />

      {/* Topbar */}
      <header style={{
        position:'relative', zIndex:10,
        padding:'20px 40px', display:'flex', alignItems:'center',
        justifyContent:'space-between',
        borderBottom:'1px solid var(--border)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <VaultLogo size={34} />
          <div>
            <span style={{
              fontFamily:'var(--font-disp)', fontSize:17, fontWeight:800,
              color:'var(--text)', letterSpacing:2,
            }}>VAULT</span>
            <span style={{ color:'var(--text3)', fontSize:10, marginLeft:8, letterSpacing:1 }}>
              Server Manager
            </span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{
            display:'flex', alignItems:'center', gap:7, fontSize:11,
            color: online ? 'var(--green)' : 'var(--text3)',
          }}>
            <span style={{
              width:7, height:7, borderRadius:'50%', flexShrink:0,
              background: online ? 'var(--green)' : 'var(--border2)',
              animation: online ? 'pulse 2.5s ease infinite' : 'none',
            }} />
            {online ? `online${ping ? ` · ${ping}ms` : ''}` : 'offline'}
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>

      {/* Hero */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'60px 40px', position:'relative', zIndex:1, textAlign:'center',
      }}>
        {/* Badge */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:8,
          padding:'5px 14px', borderRadius:20, marginBottom:32,
          background:'var(--gold-faint)', border:'1px solid var(--gold-dim)',
          color:'var(--gold)', fontSize:11, fontWeight:600, letterSpacing:0.5,
          animation:'landingReveal 0.6s var(--ease) 0.1s both',
        }}>
          <Zap size={12} /> Minecraft Server Manager for Google Colab
        </div>

        {/* Main title */}
        <h1 style={{
          fontFamily:'var(--font-disp)', fontWeight:800,
          fontSize:'clamp(52px, 8vw, 92px)', lineHeight:0.95,
          letterSpacing:-2, color:'var(--text)',
          marginBottom:8,
          animation:'landingReveal 0.6s var(--ease) 0.2s both',
        }}>
          VAULT
        </h1>
        <div style={{
          fontFamily:'var(--font-disp)', fontWeight:800,
          fontSize:'clamp(18px, 3vw, 30px)', letterSpacing:8,
          color:'var(--gold)', marginBottom:28,
          animation:'landingReveal 0.6s var(--ease) 0.25s both',
        }}>
          SERVER MANAGER
        </div>

        <p style={{
          color:'var(--text2)', fontSize:15, lineHeight:1.8,
          maxWidth:480, marginBottom:44,
          animation:'landingReveal 0.6s var(--ease) 0.35s both',
        }}>
          Gerencie servidores Minecraft no Google Colab com uma interface elegante.
          Crie, configure, instale mods e faça backups — tudo em um lugar.
        </p>

        {/* CTA */}
        <div style={{
          display:'flex', gap:14, alignItems:'center', flexWrap:'wrap', justifyContent:'center',
          animation:'landingReveal 0.6s var(--ease) 0.45s both',
        }}>
          <button
            onClick={onEnter}
            style={{
              padding:'14px 32px', borderRadius:10, cursor:'pointer',
              background:'linear-gradient(135deg, var(--gold-dim), var(--gold))',
              border:'none', color:'#fff',
              fontFamily:'var(--font-disp)', fontSize:15, fontWeight:800, letterSpacing:1,
              display:'flex', alignItems:'center', gap:10,
              boxShadow:'0 4px 24px var(--gold-dim)',
              transition:'all 0.2s var(--ease)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px var(--gold-dim)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 24px var(--gold-dim)' }}
          >
            Abrir painel <ArrowRight size={16}/>
          </button>
          {online && status?.server_in_use && (
            <button
              onClick={onEnter}
              style={{
                padding:'14px 24px', borderRadius:10, cursor:'pointer',
                background:'var(--surface)', border:'1px solid var(--border)',
                color:'var(--text2)', fontFamily:'var(--font-ui)', fontSize:12,
                display:'flex', alignItems:'center', gap:8, transition:'all 0.15s',
              }}
            >
              <Server size={13}/> {status.server_in_use}
              {status.server_running && <span style={{ color:'var(--green)', fontSize:10, animation:'pulse 2s infinite' }}>● ao vivo</span>}
            </button>
          )}
        </div>

        {/* Feature cards */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16,
          marginTop:72, maxWidth:720, width:'100%',
          animation:'landingReveal 0.6s var(--ease) 0.55s both',
        }}>
          {[
            { icon:'⛏', title:'Múltiplos Servidores', desc:'Paper, Spigot, Fabric, Forge — crie e alterne entre instâncias', color:'var(--gold)' },
            { icon:'📦', title:'Mods via Modrinth', desc:'Busque e instale mods e plugins direto do Modrinth em segundos', color:'var(--blue)' },
            { icon:'💾', title:'Backup Automático', desc:'Salve o mundo no Google Drive com um clique e restaure quando quiser', color:'var(--green)' },
          ].map(f => (
            <div key={f.title} style={{
              background:'var(--surface)', border:'1px solid var(--border)',
              borderRadius:12, padding:'20px 18px', textAlign:'left',
              transition:'all 0.2s var(--ease)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=f.color; e.currentTarget.style.transform='translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none' }}
            >
              <div style={{
                width:38, height:38, borderRadius:8, marginBottom:12,
                background:f.color+'18', border:`1px solid ${f.color}33`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
              }}>{f.icon}</div>
              <div style={{ fontFamily:'var(--font-disp)', fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:6 }}>
                {f.title}
              </div>
              <div style={{ color:'var(--text3)', fontSize:11, lineHeight:1.7 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        position:'relative', zIndex:10,
        padding:'16px 40px', borderTop:'1px solid var(--border)',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        fontSize:11, color:'var(--text4)',
      }}>
        <span>⛏ Vault Server Manager</span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Shield size={11} /> Google Colab + FastAPI
        </span>
      </footer>
    </div>
  )
}

/* ── Sidebar ──────────────────────────────────────────────── */
function Sidebar({ page, setPage, online, status, ping, showCfg, setShowCfg,
                   tmpUrl, setTmpUrl, apiUrl, saveUrl, theme, setTheme, onLanding }) {
  const [hov, setHov] = useState(null)

  return (
    <aside style={{
      width:225, minWidth:225,
      background:'var(--surface)',
      borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column',
      position:'relative', transition:'background 0.35s, border-color 0.35s',
    }}>
      {/* Gold top bar */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:2,
        background:'linear-gradient(90deg, transparent, var(--gold-dim), var(--gold), var(--gold-dim), transparent)',
      }} />

      {/* Logo */}
      <button
        onClick={onLanding}
        title="Landing page"
        style={{
          padding:'22px 18px 16px', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap:11,
          background:'transparent', border:'none', cursor:'pointer', width:'100%',
          textAlign:'left',
          transition:'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}
      >
        <VaultLogo size={32} />
        <div>
          <div style={{
            fontFamily:'var(--font-disp)', color:'var(--text)',
            fontSize:14, fontWeight:800, letterSpacing:3, lineHeight:1,
          }}>VAULT</div>
          <div style={{ color:'var(--text4)', fontSize:8, letterSpacing:2.5, marginTop:3 }}>
            SERVER MANAGER
          </div>
        </div>
      </button>

      {/* Status */}
      <div style={{ padding:'11px 13px', borderBottom:'1px solid var(--border)' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'7px 11px', borderRadius:'var(--radius)',
          background: online ? 'var(--green-bg)' : 'var(--red-bg)',
          border:`1px solid ${online ? 'var(--green-b)' : 'var(--red-b)'}`,
          fontSize:11, color: online ? 'var(--green)' : 'var(--red)',
        }}>
          <span style={{
            width:7, height:7, borderRadius:'50%', flexShrink:0,
            background: online ? 'var(--green)' : 'var(--red)',
            animation: online ? 'pulse 2.5s ease infinite' : 'none',
          }} />
          <span style={{ flex:1 }}>{online ? 'Backend online' : 'Offline'}</span>
          {ping !== null && <span style={{ color:'var(--gold-dim)', fontSize:9 }}>{ping}ms</span>}
        </div>
        {online && status?.server_in_use && (
          <div style={{ marginTop:7, paddingLeft:4, display:'flex', alignItems:'center', gap:6 }}>
            <Server size={10} color="var(--gold-dim)" />
            <span style={{ color:'var(--gold)', fontSize:11, flex:1 }}>{status.server_in_use}</span>
            {status.server_running && (
              <span style={{
                color:'var(--green)', fontSize:8, padding:'1px 6px',
                background:'var(--green-bg)', border:'1px solid var(--green-b)',
                borderRadius:10, letterSpacing:0.5, animation:'pulse 2s ease infinite',
              }}>LIVE</span>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'8px 7px', overflowY:'auto' }}>
        {NAV.map(({ id, label, icon:Icon }) => {
          const active = page === id
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              onMouseEnter={() => setHov(id)}
              onMouseLeave={() => setHov(null)}
              style={{
                display:'flex', alignItems:'center', gap:9,
                width:'100%', padding:'9px 11px', borderRadius:'var(--radius)',
                background: active ? 'var(--gold-faint)' : hov===id ? 'var(--bg3)' : 'transparent',
                border: active ? '1px solid var(--gold-dim)' : `1px solid ${hov===id ? 'var(--border)' : 'transparent'}`,
                color: active ? 'var(--gold-hi)' : hov===id ? 'var(--text)' : 'var(--text3)',
                cursor:'pointer', fontSize:12, fontFamily:'inherit',
                transition:'all 0.12s var(--ease)', marginBottom:2, textAlign:'left',
              }}
            >
              <Icon size={13} style={{ flexShrink:0 }} />
              <span style={{ flex:1 }}>{label}</span>
              {active && <ArrowRight size={11} />}
            </button>
          )
        })}
      </nav>

      {/* Theme + backend config */}
      <div style={{ padding:'10px 11px', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:9 }}>
          <span style={{ color:'var(--text4)', fontSize:10, letterSpacing:1 }}>TEMA</span>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>

        {showCfg ? (
          <div style={{ animation:'fadeSlideUp 0.15s ease both' }}>
            <div style={{ color:'var(--gold-dim)', fontSize:9, letterSpacing:2, marginBottom:5, textTransform:'uppercase' }}>
              URL do backend
            </div>
            <input
              value={tmpUrl}
              onChange={e => setTmpUrl(e.target.value)}
              onKeyDown={e => e.key==='Enter' && saveUrl()}
              placeholder="https://xxx.playit.gg"
              style={{
                width:'100%', background:'var(--bg)',
                border:'1px solid var(--border)', borderColor:'var(--gold-dim)',
                color:'var(--text)', padding:'6px 9px', borderRadius:'var(--radius-sm)',
                fontSize:10, fontFamily:'inherit', marginBottom:6,
              }}
            />
            <div style={{ display:'flex', gap:5 }}>
              <button onClick={saveUrl} style={miniBtn('var(--green)', 'var(--green-bg)', 'var(--green-b)')}>
                <Check size={10}/> Salvar
              </button>
              <button onClick={() => setShowCfg(false)} style={miniBtn('var(--text3)', 'var(--bg)', 'var(--border)')}>
                <X size={10}/> Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setTmpUrl(apiUrl); setShowCfg(true) }}
            style={{
              width:'100%', padding:'7px', fontSize:9, color:'var(--text4)',
              background:'transparent', border:'1px solid var(--border)',
              borderRadius:'var(--radius-sm)', cursor:'pointer', fontFamily:'inherit',
              letterSpacing:1.5, transition:'all 0.15s', textTransform:'uppercase',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--gold-dim)'; e.currentTarget.style.color='var(--gold-dim)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)';    e.currentTarget.style.color='var(--text4)'  }}
          >
            ⚙ configurar backend
          </button>
        )}
      </div>
    </aside>
  )
}

/* ── Offline Screen ───────────────────────────────────────── */
function OfflineScreen({ onGo }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', height:'100%', gap:20,
      animation:'fadeSlideUp 0.3s ease both',
    }}>
      <div style={{
        width:64, height:64, borderRadius:14,
        background:'var(--red-bg)', border:'1px solid var(--red-b)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <WifiOff size={26} color="var(--red)" />
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-disp)', color:'var(--text)', fontSize:18, fontWeight:800, marginBottom:8 }}>
          Backend Offline
        </div>
        <div style={{ color:'var(--text3)', fontSize:12, lineHeight:1.8, maxWidth:320 }}>
          Inicie o Colab e o servidor FastAPI,<br/>depois configure a URL do backend.
        </div>
      </div>
      <button
        onClick={onGo}
        style={{
          padding:'10px 24px', borderRadius:9, cursor:'pointer',
          background:'var(--gold-faint)', border:'1px solid var(--gold-dim)',
          color:'var(--gold)', fontFamily:'var(--font-ui)', fontSize:12,
          letterSpacing:0.5, transition:'all 0.15s',
          display:'flex', alignItems:'center', gap:8,
        }}
        onMouseEnter={e => { e.currentTarget.style.background='var(--gold-bg)'; e.currentTarget.style.borderColor='var(--gold)' }}
        onMouseLeave={e => { e.currentTarget.style.background='var(--gold-faint)'; e.currentTarget.style.borderColor='var(--gold-dim)' }}
      >
        <RefreshCw size={13}/> Configurar backend
      </button>
    </div>
  )
}

const miniBtn = (color, bg, border) => ({
  flex:1, padding:'5px 0', borderRadius:'var(--radius-sm)', cursor:'pointer',
  background: bg, border:`1px solid ${border}`, color,
  fontSize:10, fontFamily:'inherit',
  display:'flex', alignItems:'center', justifyContent:'center', gap:4,
})
