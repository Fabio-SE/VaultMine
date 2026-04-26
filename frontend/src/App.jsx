import { useState, useEffect, useCallback } from 'react'
import { api, getApiUrl, setApiUrl } from './api'
import SetupPage    from './pages/SetupPage'
import ServersPage  from './pages/ServersPage'
import RunnerPage   from './pages/RunnerPage'
import OptionsPage  from './pages/OptionsPage'
import ModsPage     from './pages/ModsPage'
import BackupPage   from './pages/BackupPage'
import LogsPage     from './pages/LogsPage'
import {
  Settings, Server, Play, Sliders, Package,
  HardDrive, ScrollText, Wifi, WifiOff, ChevronRight
} from 'lucide-react'

const NAV = [
  { id: 'setup',   label: 'Setup',        icon: Settings    },
  { id: 'servers', label: 'Servidor',     icon: Server      },
  { id: 'runner',  label: 'Iniciar',      icon: Play        },
  { id: 'options', label: 'Opções',       icon: Sliders     },
  { id: 'mods',    label: 'Mods',         icon: Package     },
  { id: 'backup',  label: 'Backup',       icon: HardDrive   },
  { id: 'logs',    label: 'Logs & TPS',   icon: ScrollText  },
]

const PAGES = { setup: SetupPage, servers: ServersPage, runner: RunnerPage,
                options: OptionsPage, mods: ModsPage, backup: BackupPage, logs: LogsPage }

export default function App() {
  const [page,       setPage]       = useState('setup')
  const [status,     setStatus]     = useState(null)
  const [online,     setOnline]     = useState(false)
  const [apiUrl,     setApiUrlState] = useState(getApiUrl)
  const [showConfig, setShowConfig]  = useState(false)
  const [tmpUrl,     setTmpUrl]      = useState(getApiUrl)

  const checkHealth = useCallback(async () => {
    try {
      const s = await api.health()
      setStatus(s)
      setOnline(true)
    } catch {
      setStatus(null)
      setOnline(false)
    }
  }, [])

  useEffect(() => {
    checkHealth()
    const t = setInterval(checkHealth, 5000)
    return () => clearInterval(t)
  }, [checkHealth])

  const saveUrl = () => {
    setApiUrl(tmpUrl)
    setApiUrlState(tmpUrl)
    setShowConfig(false)
    setTimeout(checkHealth, 300)
  }

  const Page = PAGES[page]

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'JetBrains Mono', monospace" }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: 230, minWidth: 230,
        background: 'linear-gradient(180deg, #13171e 0%, #0f1318 100%)',
        borderRight: '1px solid #2a3040',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative top border */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #594A2D, #8C7549, #594A2D)',
        }} />

        {/* Logo */}
        <div style={{
          padding: '28px 20px 18px',
          borderBottom: '1px solid #252c38',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #594A2D, #8C7549)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 2px 12px #8C754933',
            }}>⛏</div>
            <div>
              <div style={{
                color: '#D9D9D9', fontSize: 16, fontWeight: 800,
                letterSpacing: 3, lineHeight: 1.1,
              }}>VAULT</div>
              <div style={{ color: '#594A2D', fontSize: 9, letterSpacing: 2, marginTop: 1 }}>
                SERVER MANAGER
              </div>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #252c38' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 11px', borderRadius: 6,
            background: online ? '#1a2518' : '#1e1618',
            border: `1px solid ${online ? '#3a6030' : '#4a2828'}`,
            fontSize: 11,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: online ? '#6db86d' : '#b84444',
              boxShadow: online ? '0 0 6px #6db86d' : '0 0 6px #b84444',
              flexShrink: 0,
            }} />
            {online
              ? <span style={{ color: '#8abf8a' }}>Backend online</span>
              : <span style={{ color: '#c07070' }}>Offline</span>
            }
          </div>
          {online && status?.server_in_use && (
            <div style={{
              color: '#8C7549', fontSize: 11, marginTop: 7,
              paddingLeft: 4, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: '#594A2D' }}>▸</span>
              {status.server_in_use}
              {status.server_running && (
                <span style={{
                  color: '#6db86d', fontSize: 9, padding: '1px 5px',
                  background: '#1a2518', borderRadius: 10, border: '1px solid #3a6030',
                }}>LIVE</span>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 12px', borderRadius: 7,
                  background: active
                    ? 'linear-gradient(90deg, #2a2218, #1e1b14)'
                    : 'transparent',
                  border: active
                    ? '1px solid #594A2D88'
                    : '1px solid transparent',
                  color: active ? '#8C7549' : '#4a5060',
                  cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                  transition: 'all 0.15s', marginBottom: 2,
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = '#D9D9D9'
                    e.currentTarget.style.background = '#1a1e26'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = '#4a5060'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <Icon size={14} />
                <span style={{ flex: 1 }}>{label}</span>
                {active && (
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#8C7549',
                  }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* URL do backend */}
        <div style={{ padding: '10px 10px', borderTop: '1px solid #252c38' }}>
          {showConfig ? (
            <div>
              <div style={{ color: '#594A2D', fontSize: 10, letterSpacing: 1, marginBottom: 5 }}>
                URL DO BACKEND
              </div>
              <input
                value={tmpUrl}
                onChange={e => setTmpUrl(e.target.value)}
                placeholder="https://xxx.playit.gg"
                style={{
                  width: '100%', background: '#0d1015', border: '1px solid #2a3040',
                  color: '#c0c8d0', padding: '6px 9px', borderRadius: 5,
                  fontSize: 11, fontFamily: 'inherit', marginBottom: 7,
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={saveUrl} style={sidebarBtn('#8C7549')}>Salvar</button>
                <button onClick={() => setShowConfig(false)} style={sidebarBtn('#313640')}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setTmpUrl(apiUrl); setShowConfig(true) }}
              style={{
                width: '100%', padding: '7px', fontSize: 10, color: '#3a4050',
                background: 'transparent', border: '1px solid #252c38',
                borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit',
                letterSpacing: 1, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#594A2D'; e.currentTarget.style.color = '#8C7549' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#252c38'; e.currentTarget.style.color = '#3a4050' }}
            >
              ⚙ CONFIGURAR BACKEND
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main style={{
        flex: 1, overflowY: 'auto',
        background: '#0f1318',
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 20% -20%, #594A2D0a 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 110%, #31364008 0%, transparent 60%)
        `,
      }}>
        {!online && page !== 'setup' ? (
          <Offline onConfigure={() => { setTmpUrl(apiUrl); setShowConfig(true); setPage('setup') }} />
        ) : (
          <Page status={status} onRefresh={checkHealth} />
        )}
      </main>
    </div>
  )
}

function Offline({ onConfigure }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', gap: 16,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'linear-gradient(135deg, #1e1618, #2a1e1e)',
        border: '1px solid #4a2828',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <WifiOff size={28} color="#8a4444" />
      </div>
      <div style={{ fontSize: 16, color: '#5a6070', letterSpacing: 2, fontWeight: 600 }}>
        BACKEND OFFLINE
      </div>
      <div style={{ fontSize: 12, textAlign: 'center', maxWidth: 340, color: '#3a4050', lineHeight: 1.8 }}>
        Inicie o Colab e o servidor FastAPI, depois configure a URL do backend.
      </div>
      <button onClick={onConfigure} style={{
        padding: '9px 20px', borderRadius: 7, cursor: 'pointer',
        background: 'linear-gradient(90deg, #2a2218, #1e1b14)',
        border: '1px solid #8C754966', color: '#8C7549',
        fontSize: 12, fontFamily: 'inherit', letterSpacing: 1,
        transition: 'all 0.2s',
      }}>
        ⚙ CONFIGURAR URL
      </button>
    </div>
  )
}

const sidebarBtn = (color) => ({
  flex: 1, padding: '5px 10px', borderRadius: 5, cursor: 'pointer',
  background: 'transparent', border: `1px solid ${color}66`,
  color: color, fontSize: 10, fontFamily: 'inherit', letterSpacing: 1,
})
