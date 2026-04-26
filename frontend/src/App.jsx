import { useState, useEffect, useCallback, useRef } from 'react'
import { api, getApiUrl, setApiUrl } from './api'
import SetupPage   from './pages/SetupPage'
import ServersPage from './pages/ServersPage'
import RunnerPage  from './pages/RunnerPage'
import OptionsPage from './pages/OptionsPage'
import ModsPage    from './pages/ModsPage'
import BackupPage  from './pages/BackupPage'
import LogsPage    from './pages/LogsPage'
import { VaultLogo } from './components/UI'
import {
  Settings, Server, Play, Sliders, Package,
  HardDrive, ScrollText, WifiOff, ChevronRight,
  Activity, X, Check,
} from 'lucide-react'

const NAV = [
  { id: 'setup',   label: 'Setup',      icon: Settings,   hint: 'Configurar sessão'     },
  { id: 'servers', label: 'Servidores', icon: Server,     hint: 'Criar e escolher'      },
  { id: 'runner',  label: 'Iniciar',    icon: Play,       hint: 'Ligar o servidor'      },
  { id: 'options', label: 'Opções',     icon: Sliders,    hint: 'server.properties'     },
  { id: 'mods',    label: 'Mods',       icon: Package,    hint: 'Modrinth'              },
  { id: 'backup',  label: 'Backup',     icon: HardDrive,  hint: 'Backup do mundo'       },
  { id: 'logs',    label: 'Logs & TPS', icon: ScrollText, hint: 'Output & otimizações'  },
]

const PAGES = {
  setup: SetupPage, servers: ServersPage, runner: RunnerPage,
  options: OptionsPage, mods: ModsPage, backup: BackupPage, logs: LogsPage,
}

export default function App() {
  const [page,        setPage]        = useState('setup')
  const [status,      setStatus]      = useState(null)
  const [online,      setOnline]      = useState(false)
  const [apiUrl,      setApiUrlState] = useState(getApiUrl)
  const [showConfig,  setShowConfig]  = useState(false)
  const [tmpUrl,      setTmpUrl]      = useState(getApiUrl)
  const [ping,        setPing]        = useState(null)   // ms

  const checkHealth = useCallback(async () => {
    const t0 = Date.now()
    try {
      const s = await api.health()
      setStatus(s)
      setOnline(true)
      setPing(Date.now() - t0)
    } catch {
      setStatus(null)
      setOnline(false)
      setPing(null)
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* ── Sidebar ──────────────────────────────────────── */}
      <Sidebar
        page={page}
        setPage={setPage}
        online={online}
        status={status}
        ping={ping}
        showConfig={showConfig}
        setShowConfig={setShowConfig}
        tmpUrl={tmpUrl}
        setTmpUrl={setTmpUrl}
        apiUrl={apiUrl}
        saveUrl={saveUrl}
      />

      {/* ── Main ─────────────────────────────────────────── */}
      <main style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        background: '#0b0e13',
        backgroundImage: `
          radial-gradient(ellipse 70% 40% at 10% 0%, #594A2D08 0%, transparent 70%),
          radial-gradient(ellipse 50% 30% at 90% 100%, #31364006 0%, transparent 60%)
        `,
      }}>
        {!online && page !== 'setup' ? (
          <OfflineScreen onGo={() => { setTmpUrl(apiUrl); setShowConfig(true); setPage('setup') }} />
        ) : (
          <Page key={page} status={status} onRefresh={checkHealth} />
        )}
      </main>
    </div>
  )
}

/* ── Sidebar Component ──────────────────────────────────── */
function Sidebar({ page, setPage, online, status, ping, showConfig, setShowConfig, tmpUrl, setTmpUrl, apiUrl, saveUrl }) {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <aside style={{
      width: 220, minWidth: 220,
      background: '#0e1218',
      borderRight: '1px solid #1a2230',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      {/* top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, #594A2D, #8C7549, #594A2D, transparent)',
      }} />

      {/* Logo */}
      <div style={{
        padding: '22px 18px 16px',
        borderBottom: '1px solid #1a2230',
        display: 'flex', alignItems: 'center', gap: 11,
      }}>
        <VaultLogo size={34} />
        <div>
          <div style={{
            color: '#c8b890', fontSize: 15, fontWeight: 800,
            letterSpacing: 3, lineHeight: 1,
          }}>
            VAULT
          </div>
          <div style={{ color: '#3a3020', fontSize: 8, letterSpacing: 2.5, marginTop: 3 }}>
            SERVER MANAGER
          </div>
        </div>
      </div>

      {/* Status area */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a2230' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 10px', borderRadius: 6,
          background: online ? '#0d1a1018' : '#1a0d0d18',
          border: `1px solid ${online ? '#5a9e6f28' : '#9e5a5a28'}`,
          fontSize: 10, color: online ? '#5a8a6a' : '#8a5a5a',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: online ? '#5a9e6f' : '#9e5a5a',
            animation: online ? 'pulse 2.5s ease infinite' : 'none',
          }} />
          <span style={{ flex: 1 }}>{online ? 'Backend online' : 'Offline'}</span>
          {ping !== null && (
            <span style={{ color: '#594A2D', fontSize: 9 }}>{ping}ms</span>
          )}
        </div>

        {online && status?.server_in_use && (
          <div style={{
            marginTop: 7, paddingLeft: 4,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Server size={10} color="#594A2D" />
            <span style={{ color: '#8C7549', fontSize: 10, flex: 1 }}>
              {status.server_in_use}
            </span>
            {status.server_running && (
              <span style={{
                color: '#5a9e6f', fontSize: 8, padding: '1px 5px',
                background: '#0d1a1033', border: '1px solid #5a9e6f33',
                borderRadius: 10, letterSpacing: 0.5,
                animation: 'pulse 2s ease infinite',
              }}>
                LIVE
              </span>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 7px', overflowY: 'auto' }}>
        {NAV.map(({ id, label, icon: Icon, hint }) => {
          const active  = page === id
          const hovered = hoveredId === id
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                width: '100%', padding: '8px 10px', borderRadius: 7,
                background: active
                  ? 'linear-gradient(90deg, #1e1a1000, #1e1a10)'
                  : hovered ? '#13171e' : 'transparent',
                border: active
                  ? '1px solid #594A2D55'
                  : `1px solid ${hovered ? '#1f2a38' : 'transparent'}`,
                color: active ? '#8C7549' : hovered ? '#8a9aaa' : '#3a4555',
                cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
                transition: 'all 0.12s', marginBottom: 1,
                textAlign: 'left', letterSpacing: 0.3,
              }}
            >
              <Icon size={13} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {active && (
                <div style={{
                  width: 3, height: 3, borderRadius: '50%',
                  background: '#8C7549', flexShrink: 0,
                }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Backend URL config */}
      <div style={{ padding: '10px 10px', borderTop: '1px solid #1a2230' }}>
        {showConfig ? (
          <div style={{ animation: 'fadeIn 0.15s ease both' }}>
            <div style={{
              color: '#594A2D', fontSize: 8, letterSpacing: 2,
              marginBottom: 6, textTransform: 'uppercase',
            }}>
              URL do backend
            </div>
            <input
              value={tmpUrl}
              onChange={e => setTmpUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveUrl()}
              placeholder="https://xxx.playit.gg"
              style={{
                width: '100%', background: '#0b0e13',
                border: '1px solid #1f2a38', borderColor: '#594A2D55',
                color: '#b0bac8', padding: '6px 9px', borderRadius: 6,
                fontSize: 10, fontFamily: 'inherit', marginBottom: 7,
              }}
            />
            <div style={{ display: 'flex', gap: 5 }}>
              <button onClick={saveUrl} style={miniBtn('#5a9e6f')}>
                <Check size={10} /> Salvar
              </button>
              <button onClick={() => setShowConfig(false)} style={miniBtn('#3a4555')}>
                <X size={10} /> Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setTmpUrl(apiUrl); setShowConfig(true) }}
            style={{
              width: '100%', padding: '7px', fontSize: 9, color: '#2a3545',
              background: 'transparent', border: '1px solid #1a2230',
              borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: 1.5, transition: 'all 0.15s', textTransform: 'uppercase',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#594A2D55'; e.currentTarget.style.color = '#594A2D' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a2230'; e.currentTarget.style.color = '#2a3545' }}
          >
            ⚙ configurar backend
          </button>
        )}
      </div>
    </aside>
  )
}

/* ── Offline Screen ──────────────────────────────────────── */
function OfflineScreen({ onGo }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', gap: 20,
      animation: 'fadeIn 0.3s ease both',
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: 14,
        background: '#180d0d', border: '1px solid #9e5a5a22',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <WifiOff size={26} color="#6a3a3a" />
      </div>
      <div>
        <div style={{ color: '#4a3535', fontSize: 14, fontWeight: 700, letterSpacing: 3, textAlign: 'center', marginBottom: 6 }}>
          BACKEND OFFLINE
        </div>
        <div style={{ color: '#2a3040', fontSize: 11, textAlign: 'center', maxWidth: 320, lineHeight: 1.8 }}>
          Inicie o Colab e o servidor FastAPI,<br />depois configure a URL do backend.
        </div>
      </div>
      <button
        onClick={onGo}
        style={{
          padding: '9px 22px', borderRadius: 7, cursor: 'pointer',
          background: '#1e1810', border: '1px solid #8C754944',
          color: '#8C7549', fontSize: 11, fontFamily: 'inherit',
          letterSpacing: 1, transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#252015'; e.currentTarget.style.borderColor = '#8C7549' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#1e1810'; e.currentTarget.style.borderColor = '#8C754944' }}
      >
        ⚙ CONFIGURAR URL
      </button>
    </div>
  )
}

const miniBtn = (color) => ({
  flex: 1, padding: '5px 0', borderRadius: 5, cursor: 'pointer',
  background: 'transparent', border: `1px solid ${color}44`,
  color, fontSize: 10, fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  transition: 'all 0.12s',
})
