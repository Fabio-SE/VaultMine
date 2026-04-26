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
  const [status,     setStatus]     = useState(null)   // null = carregando
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: 220, minWidth: 220, background: '#080d14',
        borderRight: '1px solid #1e2d40',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #1e2d40' }}>
          <div style={{ color: '#00d4ff', fontSize: 22, fontWeight: 800, letterSpacing: 3 }}>
            ⛏ VAULT
          </div>
          <div style={{ color: '#3a5070', fontSize: 11, marginTop: 2 }}>
            Server Manager
          </div>
        </div>

        {/* Status badge */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e2d40' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 8,
            background: online ? '#0a2a1f' : '#1a1217',
            border: `1px solid ${online ? '#00ff8844' : '#ff444433'}`,
            fontSize: 12,
          }}>
            {online
              ? <><Wifi size={13} color="#00ff88" /> <span style={{color:'#00ff88'}}>Backend online</span></>
              : <><WifiOff size={13} color="#ff4444" /> <span style={{color:'#ff4444'}}>Offline</span></>
            }
          </div>
          {online && status?.server_in_use && (
            <div style={{ color: '#4a8060', fontSize: 11, marginTop: 6, paddingLeft: 4 }}>
              🖥 {status.server_in_use}
              {status.server_running && <span style={{color:'#00ff88'}}> ● rodando</span>}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  background: active ? '#0d2a40' : 'transparent',
                  border: active ? '1px solid #00d4ff33' : '1px solid transparent',
                  color: active ? '#00d4ff' : '#5a7090',
                  cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                  transition: 'all 0.15s', marginBottom: 2,
                }}
              >
                <Icon size={15} />
                {label}
                {active && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
              </button>
            )
          })}
        </nav>

        {/* URL do backend */}
        <div style={{ padding: '12px 12px', borderTop: '1px solid #1e2d40' }}>
          {showConfig ? (
            <div>
              <div style={{ color: '#4a6580', fontSize: 11, marginBottom: 4 }}>URL do backend</div>
              <input
                value={tmpUrl}
                onChange={e => setTmpUrl(e.target.value)}
                placeholder="https://xxx.playit.gg"
                style={{
                  width: '100%', background: '#0d1117', border: '1px solid #1e2d40',
                  color: '#e0e6f0', padding: '5px 8px', borderRadius: 6,
                  fontSize: 11, fontFamily: 'inherit', marginBottom: 6,
                }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={saveUrl}      style={btnStyle('#00d4ff')}>Salvar</button>
                <button onClick={() => setShowConfig(false)} style={btnStyle('#334')}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setTmpUrl(apiUrl); setShowConfig(true) }}
              style={{
                width: '100%', padding: '6px', fontSize: 11, color: '#3a5070',
                background: 'transparent', border: '1px solid #1e2d40',
                borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ⚙ Configurar backend URL
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main style={{
        flex: 1, overflowY: 'auto',
        background: 'linear-gradient(160deg, #0d1117 0%, #101825 100%)',
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', height: '100%', gap: 16, color: '#3a5070' }}>
      <WifiOff size={48} />
      <div style={{ fontSize: 18, color: '#5a7090' }}>Backend offline</div>
      <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 360 }}>
        Inicie o Colab e o servidor FastAPI, depois configure a URL do backend.
      </div>
      <button onClick={onConfigure} style={btnStyle('#00d4ff')}>
        Configurar URL do backend
      </button>
    </div>
  )
}

const btnStyle = (color) => ({
  padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
  background: 'transparent', border: `1px solid ${color}`,
  color: color, fontSize: 12, fontFamily: 'inherit',
})
