import { useState, useEffect, useRef } from 'react'
import { api, streamLogs } from '../api'
import { SectionHeader, Card, Btn, Input, Select, LogBox, Badge, Grid } from '../components/UI'
import { Trash2, RefreshCw, Play, Square, Terminal } from 'lucide-react'

// ──────────────────────────────────────────────────────────────
//  SERVERS PAGE
// ──────────────────────────────────────────────────────────────
export function ServersPage({ status, onRefresh }) {
  const [tab,      setTab]      = useState('list')
  const [servers,  setServers]  = useState([])
  const [types,    setTypes]    = useState([])
  const [versions, setVersions] = useState([])
  const [form,     setForm]     = useState({ name:'', server_type:'Paper', version:'', xmx:'3G' })
  const [loading,  setLoading]  = useState(false)
  const [msg,      setMsg]      = useState('')

  useEffect(() => { loadServers(); loadTypes() }, [])

  async function loadServers() {
    const r = await api.listServers().catch(() => ({ servers:[], active:'' }))
    setServers(r.servers || [])
  }
  async function loadTypes() {
    const r = await api.getTypes().catch(() => ({ types:[] }))
    setTypes(r.types || [])
  }
  async function loadVersions(type) {
    setVersions([])
    const r = await api.getVersions(type).catch(() => ({ versions:[] }))
    const vs = r.versions || []
    setVersions(vs)
    setForm(f => ({ ...f, version: vs[0] || '' }))
  }
  async function createServer() {
    setLoading(true); setMsg('')
    try {
      await api.createServer(form)
      setMsg('✅ Servidor criado!'); loadServers(); onRefresh?.()
    } catch(e) { setMsg(`❌ ${e.message}`) }
    setLoading(false)
  }
  async function selectServer(name) {
    await api.selectServer(name); loadServers(); onRefresh?.()
  }
  async function deleteServer(name) {
    if (!confirm(`Deletar ${name}?`)) return
    await api.deleteServer(name); loadServers(); onRefresh?.()
  }

  const tabs = ['list','create']
  return (
    <div style={{ padding: 32 }}>
      <SectionHeader icon="🖥" title="Servidor" description="Criar, escolher e remover servidores" />
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['📋 Servidores','➕ Criar'].map((t,i) => (
          <Btn key={i} onClick={() => setTab(tabs[i])} variant={tab===tabs[i]?'primary':'ghost'}>{t}</Btn>
        ))}
      </div>

      {tab === 'list' && (
        <Card>
          {servers.length === 0
            ? <div style={{color:'#3a5070'}}>Nenhum servidor. Crie um!</div>
            : servers.map(s => (
                <div key={s} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'12px 0', borderBottom:'1px solid #1e2d40',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {status?.server_in_use === s
                      ? <Badge color="#00ff88">ativo</Badge>
                      : <Badge color="#3a5070">inativo</Badge>
                    }
                    <span style={{ fontSize:14 }}>{s}</span>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    {status?.server_in_use !== s &&
                      <Btn onClick={() => selectServer(s)} variant="ghost">Selecionar</Btn>}
                    <Btn onClick={() => deleteServer(s)} variant="danger">
                      <Trash2 size={13} />
                    </Btn>
                  </div>
                </div>
              ))
          }
        </Card>
      )}

      {tab === 'create' && (
        <Card style={{ maxWidth:600 }}>
          <Input label="Nome do servidor" value={form.name} onChange={v => setForm(f=>({...f,name:v}))} placeholder="meu-servidor" />
          <Select label="Tipo" value={form.server_type}
            onChange={v => { setForm(f=>({...f,server_type:v})); loadVersions(v) }}
            options={types} />
          <Select label="Versão" value={form.version}
            onChange={v => setForm(f=>({...f,version:v}))}
            options={versions.length ? versions : ['(carregando...)']} />
          <Select label="RAM" value={form.xmx}
            onChange={v => setForm(f=>({...f,xmx:v}))}
            options={['512M','1G','2G','3G','4G','6G','8G']} />
          {msg && <div style={{color: msg.startsWith('✅')?'#00ff88':'#ff4444', fontSize:13, marginBottom:12}}>{msg}</div>}
          <Btn onClick={createServer} disabled={loading || !form.name || !form.version}>
            {loading ? '⏳ Criando...' : '🚀 Criar servidor'}
          </Btn>
        </Card>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
//  RUNNER PAGE
// ──────────────────────────────────────────────────────────────
export function RunnerPage({ status, onRefresh }) {
  const [logs,    setLogs]    = useState([])
  const [cmd,     setCmd]     = useState('')
  const [loading, setLoading] = useState(false)
  const stopStream = useRef(null)

  const running = status?.server_running

  async function start() {
    setLoading(true)
    try {
      await api.startServer()
      onRefresh?.()
      // SSE stream
      stopStream.current = streamLogs(line => setLogs(l => [...l.slice(-500), line]))
    } catch(e) { setLogs(l => [...l, `ERROR: ${e.message}`]) }
    setLoading(false)
  }

  async function stop() {
    stopStream.current?.()
    await api.stopServer(); onRefresh?.()
  }

  async function sendCmd() {
    if (!cmd.trim()) return
    await api.sendCommand(cmd); setCmd('')
  }

  return (
    <div style={{ padding: 32 }}>
      <SectionHeader icon="▶" title="Iniciar Servidor" description="Liga e para o servidor Minecraft" />

      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16 }}>
          <div style={{
            width:12, height:12, borderRadius:'50%',
            background: running ? '#00ff88' : '#ff444488',
            boxShadow: running ? '0 0 8px #00ff88' : 'none',
          }} />
          <span style={{ color: running ? '#00ff88' : '#5a7090' }}>
            {running ? 'Servidor rodando' : 'Servidor parado'}
          </span>
          {status?.server_in_use && <Badge>{status.server_in_use}</Badge>}
          {status?.address && <Badge color="#ffd700">📡 {status.address}</Badge>}
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <Btn onClick={start} disabled={running || loading} variant="success">
            <Play size={14} style={{marginRight:6}} /> Iniciar
          </Btn>
          <Btn onClick={stop} disabled={!running} variant="danger">
            <Square size={14} style={{marginRight:6}} /> Parar
          </Btn>
        </div>
      </Card>

      <Card style={{ marginBottom:16 }}>
        <div style={{ color:'#4a6580', fontSize:12, marginBottom:8 }}>Output do servidor</div>
        <LogBox lines={logs} maxHeight={400} />
      </Card>

      {running && (
        <Card>
          <div style={{ color:'#4a6580', fontSize:12, marginBottom:8 }}>Enviar comando</div>
          <div style={{ display:'flex', gap:8 }}>
            <input value={cmd} onChange={e=>setCmd(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&sendCmd()}
              placeholder="/say hello, /op player, /stop..."
              style={{
                flex:1, background:'#0d1117', border:'1px solid #1e2d40',
                color:'#e0e6f0', padding:'8px 12px', borderRadius:8,
                fontSize:13, fontFamily:'inherit',
              }}
            />
            <Btn onClick={sendCmd}><Terminal size={14}/></Btn>
          </div>
        </Card>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
//  OPTIONS PAGE
// ──────────────────────────────────────────────────────────────
export function OptionsPage() {
  const [props,   setProps]   = useState({})
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState('')

  useEffect(() => { api.getProperties().then(setProps).catch(()=>{}) }, [])

  const f = (key, fallback='') => props[key] ?? fallback

  async function save() {
    setLoading(true)
    try { await api.saveProperties(props); setMsg('✅ Salvo!') }
    catch(e) { setMsg(`❌ ${e.message}`) }
    setLoading(false)
  }
  const set = (k,v) => setProps(p=>({...p,[k]:v}))

  return (
    <div style={{ padding: 32 }}>
      <SectionHeader icon="⚙" title="Opções" description="Edite o server.properties" />
      <Card style={{ maxWidth:700 }}>
        <Grid>
          <Select label="gamemode" value={f('gamemode','survival')} onChange={v=>set('gamemode',v)}
            options={['survival','creative','adventure','spectator']} />
          <Select label="difficulty" value={f('difficulty','easy')} onChange={v=>set('difficulty',v)}
            options={['peaceful','easy','normal','hard']} />
          <Input label="max-players" value={f('max-players','20')} onChange={v=>set('max-players',v)} />
          <Input label="server-port" value={f('server-port','25565')} onChange={v=>set('server-port',v)} />
          <Input label="view-distance" value={f('view-distance','10')} onChange={v=>set('view-distance',v)} />
          <Input label="simulation-distance" value={f('simulation-distance','10')} onChange={v=>set('simulation-distance',v)} />
          <Input label="motd" value={f('motd','A Minecraft Server')} onChange={v=>set('motd',v)} style={{gridColumn:'1/-1'}} />
        </Grid>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <Btn onClick={save} disabled={loading}>{loading ? '...' : '💾 Salvar'}</Btn>
          {msg && <span style={{color: msg.startsWith('✅')?'#00ff88':'#ff4444', fontSize:13}}>{msg}</span>}
        </div>
      </Card>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
//  MODS PAGE
// ──────────────────────────────────────────────────────────────
export function ModsPage() {
  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState([])
  const [installed, setInstalled] = useState({})
  const [loading,   setLoading]   = useState(false)
  const [msg,       setMsg]       = useState('')

  useEffect(() => { api.listInstalled().then(setInstalled).catch(()=>{}) }, [])

  async function search() {
    setLoading(true)
    const r = await api.searchMods(query,'','mod').catch(()=>({results:[]}))
    setResults(r.results || []); setLoading(false)
  }

  async function install(hit) {
    setMsg(`⏳ Instalando ${hit.title}...`)
    try {
      const r = await api.installMod({ project_id: hit.project_id })
      setMsg(`✅ ${r.file} instalado em ${r.folder}/`)
      api.listInstalled().then(setInstalled)
    } catch(e) { setMsg(`❌ ${e.message}`) }
  }

  return (
    <div style={{ padding: 32 }}>
      <SectionHeader icon="🎈" title="Mods & Plugins" description="Busca e instala do Modrinth" />
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:8 }}>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}
            placeholder="Buscar mod ou plugin..."
            style={{ flex:1, background:'#0d1117', border:'1px solid #1e2d40', color:'#e0e6f0',
                     padding:'8px 12px', borderRadius:8, fontSize:13, fontFamily:'inherit' }} />
          <Btn onClick={search} disabled={loading}>{loading?'...':'🔍 Buscar'}</Btn>
        </div>
        {msg && <div style={{color:'#00d4ff', fontSize:12, marginTop:8}}>{msg}</div>}
      </Card>

      {results.map(h => (
        <div key={h.project_id} style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'12px 16px', background:'#111827', border:'1px solid #1e2d40',
          borderRadius:8, marginBottom:8,
        }}>
          <div>
            <div style={{fontWeight:600, fontSize:14}}>{h.title}</div>
            <div style={{color:'#4a6580', fontSize:11, marginTop:2}}>{h.description?.slice(0,80)}</div>
            <div style={{color:'#3a5070', fontSize:11}}>⬇️ {h.downloads?.toLocaleString()}</div>
          </div>
          <Btn onClick={() => install(h)} variant="success">Instalar</Btn>
        </div>
      ))}

      <Card style={{ marginTop:24 }}>
        <div style={{color:'#4a6580', fontSize:12, marginBottom:12}}>Instalados</div>
        {Object.entries(installed).flatMap(([folder, files]) =>
          files.map(f => (
            <div key={f} style={{ display:'flex', justifyContent:'space-between',
                                  padding:'6px 0', borderBottom:'1px solid #1e2d40' }}>
              <span style={{fontSize:13}}><Badge color="#3a5070">{folder}</Badge> {f}</span>
              <Btn onClick={() => api.removeMod(folder,f).then(()=>api.listInstalled().then(setInstalled))}
                   variant="danger"><Trash2 size={12}/></Btn>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
//  BACKUP PAGE
// ──────────────────────────────────────────────────────────────
export function BackupPage() {
  const [backups,  setBackups]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [msg,      setMsg]      = useState('')

  useEffect(() => { api.listBackups().then(r=>setBackups(r.backups||[])).catch(()=>{}) }, [])

  async function createBackup() {
    setLoading(true); setMsg('')
    try {
      const r = await api.createBackup({ world:'world' })
      setMsg(`✅ ${r.file} (${r.size_mb} MB)`)
      api.listBackups().then(r=>setBackups(r.backups||[]))
    } catch(e) { setMsg(`❌ ${e.message}`) }
    setLoading(false)
  }

  async function del(name) {
    await api.deleteBackup(name)
    api.listBackups().then(r=>setBackups(r.backups||[]))
  }

  return (
    <div style={{ padding: 32 }}>
      <SectionHeader icon="💾" title="Backup" description="Backup e restauração do mundo" />
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <Btn onClick={createBackup} disabled={loading} variant="success">
            {loading ? '⏳ Criando...' : '📦 Fazer backup do mundo'}
          </Btn>
          {msg && <span style={{color: msg.startsWith('✅')?'#00ff88':'#ff4444', fontSize:13}}>{msg}</span>}
        </div>
      </Card>
      <Card>
        <div style={{ color:'#4a6580', fontSize:12, marginBottom:12 }}>Backups existentes</div>
        {backups.length === 0
          ? <div style={{color:'#3a5070'}}>Nenhum backup ainda.</div>
          : backups.map(b => (
              <div key={b.name} style={{ display:'flex', justifyContent:'space-between',
                                         padding:'8px 0', borderBottom:'1px solid #1e2d40' }}>
                <span style={{fontSize:13}}>{b.name}</span>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{color:'#3a5070', fontSize:11}}>{b.size_mb} MB</span>
                  <Btn onClick={()=>del(b.name)} variant="danger"><Trash2 size={12}/></Btn>
                </div>
              </div>
            ))
        }
      </Card>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
//  LOGS PAGE
// ──────────────────────────────────────────────────────────────
export function LogsPage() {
  const [lines,   setLines]   = useState([])
  const [filter,  setFilter]  = useState('')
  const [tail,    setTail]    = useState(200)
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState('')

  async function load() {
    const r = await api.getLogs(tail, filter).catch(()=>({lines:[]}))
    setLines(r.lines || [])
  }
  useEffect(() => { load() }, [])

  async function optimize() {
    if (!confirm('Aplicar otimizações de TPS?')) return
    setLoading(true)
    try {
      const r = await api.optimizeTps()
      setMsg(`✅ Otimizado: ${r.applied.join(', ')}`)
    } catch(e) { setMsg(`❌ ${e.message}`) }
    setLoading(false)
  }

  return (
    <div style={{ padding: 32 }}>
      <SectionHeader icon="📎" title="Logs & TPS" description="Visualização de logs e otimizações" />
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filtrar (ex: ERROR)"
            style={{ flex:1, background:'#0d1117', border:'1px solid #1e2d40', color:'#e0e6f0',
                     padding:'7px 12px', borderRadius:8, fontSize:13, fontFamily:'inherit' }} />
          <select value={tail} onChange={e=>setTail(+e.target.value)}
            style={{ background:'#0d1117', border:'1px solid #1e2d40', color:'#e0e6f0',
                     padding:'7px', borderRadius:8, fontSize:12 }}>
            {[50,100,200,500].map(n=><option key={n}>{n}</option>)}
          </select>
          <Btn onClick={load}><RefreshCw size={14}/></Btn>
        </div>
        <LogBox lines={lines} maxHeight={500} />
      </Card>
      <Card>
        <div style={{ color:'#4a6580', fontSize:12, marginBottom:12 }}>Otimizador de TPS</div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <Btn onClick={optimize} disabled={loading} variant="ghost">
            {loading ? '...' : '⚡ Otimizar server.properties & YAMLs'}
          </Btn>
          {msg && <span style={{color: msg.startsWith('✅')?'#00ff88':'#ff4444', fontSize:13}}>{msg}</span>}
        </div>
      </Card>
    </div>
  )
}
