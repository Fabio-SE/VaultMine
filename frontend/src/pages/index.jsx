import { useState, useEffect, useRef } from 'react'
import { api, streamLogs } from '../api'
import {
  PageWrap, SectionHeader, Card, Btn, Input, Select,
  LogBox, Badge, Grid, Spinner, Divider, Msg, StatCard,
} from '../components/UI'
import { Trash2, RefreshCw, Play, Square, Terminal,
         Plus, Server, Check } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
   SETUP
   ───────────────────────────────────────────────────────────── */
export function SetupPage({ onRefresh }) {
  const [drivePath, setDrivePath] = useState('/content/drive/MyDrive/minecraft')
  const [logs,      setLogs]      = useState([])
  const [loading,   setLoading]   = useState(false)

  async function runSetup() {
    setLoading(true); setLogs(['[ LOG ] Iniciando setup...'])
    try {
      const res = await api.setup(drivePath)
      setLogs(res.logs || []); onRefresh?.()
    } catch(e) { setLogs(p => [...p, `[ ERROR ] ${e.message}`]) }
    setLoading(false)
  }

  return (
    <PageWrap>
      <SectionHeader icon="⚡" title="Setup"
        description="Execute uma vez por sessão do Colab para montar o ambiente" />

      <Card style={{ maxWidth:580 }}>
        <div style={{
          display:'flex', gap:10, padding:'11px 14px', borderRadius:8,
          background:'var(--gold-faint)', border:'1px solid var(--gold-dim)',
          borderLeft:'3px solid var(--gold)', marginBottom:20,
          fontSize:11, color:'var(--gold-dim)', lineHeight:1.8,
        }}>
          <span style={{ color:'var(--gold)', flexShrink:0 }}>▸</span>
          Configure o caminho do Google Drive onde os dados do servidor serão armazenados.
          Este comando precisa ser executado a cada nova sessão do Colab.
        </div>

        <Input label="Caminho no Google Drive" value={drivePath} onChange={setDrivePath}
          placeholder="/content/drive/MyDrive/minecraft" />

        <Btn onClick={runSetup} disabled={loading} variant="primary" size="lg" style={{ marginTop:4 }}>
          {loading ? <><Spinner/> Executando...</> : <><Play size={13}/> Executar Setup</>}
        </Btn>

        {logs.length > 0 && (
          <>
            <Divider label="output" style={{ marginTop:20 }} />
            <LogBox lines={logs} />
          </>
        )}
      </Card>
    </PageWrap>
  )
}

/* ─────────────────────────────────────────────────────────────
   SERVERS
   ───────────────────────────────────────────────────────────── */
export function ServersPage({ status, onRefresh }) {
  const [tab,      setTab]      = useState('list')
  const [servers,  setServers]  = useState([])
  const [types,    setTypes]    = useState([])
  const [versions, setVersions] = useState([])
  const [form,     setForm]     = useState({ name:'', server_type:'Paper', version:'', xmx:'3G' })
  const [loading,  setLoading]  = useState(false)
  const [msg,      setMsg]      = useState('')

  useEffect(() => { loadServers(); loadTypes() }, [])

  const loadServers  = async () => { const r = await api.listServers().catch(()=>({servers:[]})); setServers(r.servers||[]) }
  const loadTypes    = async () => { const r = await api.getTypes().catch(()=>({types:[]})); setTypes(r.types||[]) }
  const loadVersions = async t  => {
    setVersions([])
    const r = await api.getVersions(t).catch(()=>({versions:[]}))
    const vs = r.versions||[]; setVersions(vs)
    setForm(f=>({...f,version:vs[0]||''}))
  }

  async function createServer() {
    setLoading(true); setMsg('')
    try { await api.createServer(form); setMsg('✅ Servidor criado!'); loadServers(); onRefresh?.(); setTab('list') }
    catch(e) { setMsg(`❌ ${e.message}`) }
    setLoading(false)
  }
  const selectServer = async n => { await api.selectServer(n); loadServers(); onRefresh?.() }
  const deleteServer = async n => {
    if (!confirm(`Deletar "${n}"?`)) return
    await api.deleteServer(n); loadServers(); onRefresh?.()
  }

  return (
    <PageWrap>
      <SectionHeader icon="🖥" title="Servidores"
        description="Criar, selecionar e remover instâncias"
        action={
          <div style={{ display:'flex', gap:8 }}>
            <Btn onClick={()=>setTab('list')}   variant={tab==='list'?'primary':'ghost'} size="sm">📋 Lista</Btn>
            <Btn onClick={()=>setTab('create')} variant={tab==='create'?'primary':'ghost'} size="sm"><Plus size={11}/> Criar</Btn>
          </div>
        }
      />

      {tab === 'list' && (
        <Card>
          {servers.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text4)', lineHeight:2 }}>
              <Server size={28} color="var(--border2)" style={{ marginBottom:10 }} /><br/>
              Nenhum servidor criado.<br/>
              <button onClick={()=>setTab('create')} style={{
                color:'var(--gold)', background:'none', border:'none',
                cursor:'pointer', fontFamily:'inherit', fontSize:12, marginTop:6,
                textDecoration:'underline', textUnderlineOffset:3,
              }}>Criar o primeiro →</button>
            </div>
          ) : servers.map((s,i) => {
            const active = status?.server_in_use === s
            return (
              <div key={s} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'13px 2px',
                borderBottom: i<servers.length-1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                  <div style={{
                    width:9, height:9, borderRadius:'50%', flexShrink:0,
                    background: active ? 'var(--green)' : 'var(--border2)',
                    boxShadow: active ? '0 0 6px var(--green)' : 'none',
                  }}/>
                  <span style={{ fontSize:13, color: active ? 'var(--text)' : 'var(--text2)' }}>{s}</span>
                  {active && <Badge color="var(--green)" dot>ativo</Badge>}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {!active && <Btn onClick={()=>selectServer(s)} variant="ghost" size="sm">Selecionar</Btn>}
                  <Btn onClick={()=>deleteServer(s)} variant="danger" size="sm"><Trash2 size={11}/></Btn>
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {tab === 'create' && (
        <Card style={{ maxWidth:560 }}>
          <Input label="Nome do servidor" value={form.name}
            onChange={v=>setForm(f=>({...f,name:v}))} placeholder="meu-servidor" />
          <Grid cols={2} gap={14}>
            <Select label="Tipo" value={form.server_type}
              onChange={v=>{ setForm(f=>({...f,server_type:v})); loadVersions(v) }} options={types} />
            <Select label="Versão" value={form.version}
              onChange={v=>setForm(f=>({...f,version:v}))} options={versions.length?versions:['carregando...']} />
          </Grid>
          <Select label="RAM" value={form.xmx} onChange={v=>setForm(f=>({...f,xmx:v}))}
            options={['512M','1G','2G','3G','4G','6G','8G']} />
          <Msg text={msg} />
          <Btn onClick={createServer} disabled={loading||!form.name||!form.version} variant="primary" size="lg" style={{ marginTop:8 }}>
            {loading ? <><Spinner/> Criando...</> : <><Plus size={13}/> Criar Servidor</>}
          </Btn>
        </Card>
      )}
    </PageWrap>
  )
}

/* ─────────────────────────────────────────────────────────────
   RUNNER
   ───────────────────────────────────────────────────────────── */
export function RunnerPage({ status, onRefresh }) {
  const [logs,    setLogs]    = useState([])
  const [cmd,     setCmd]     = useState('')
  const [loading, setLoading] = useState(false)
  const stopStream = useRef(null)
  const running = status?.server_running

  const start = async () => {
    setLoading(true)
    try {
      await api.startServer(); onRefresh?.()
      stopStream.current = streamLogs(line=>setLogs(l=>[...l.slice(-500),line]))
    } catch(e) { setLogs(l=>[...l,`ERROR: ${e.message}`]) }
    setLoading(false)
  }
  const stop = async () => { stopStream.current?.(); await api.stopServer(); onRefresh?.() }
  const sendCmd = async () => { if (!cmd.trim()) return; await api.sendCommand(cmd); setCmd('') }

  return (
    <PageWrap>
      <SectionHeader icon="▶" title="Iniciar Servidor" description="Controle o servidor Minecraft em tempo real" />

      {/* Stats row */}
      {running && (
        <Grid cols={3} gap={12} style={{ marginBottom:16 }}>
          <StatCard label="Status"   value="Online"            icon="🟢" color="var(--green)" />
          <StatCard label="Servidor" value={status?.server_in_use||'—'} icon="🖥" color="var(--gold)" />
          <StatCard label="Endereço" value={status?.address||'—'}       icon="📡" color="var(--blue)" />
        </Grid>
      )}

      {/* Controls */}
      <Card style={{ marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
            <div style={{
              width:10, height:10, borderRadius:'50%', flexShrink:0,
              background: running ? 'var(--green)' : 'var(--text4)',
              boxShadow: running ? '0 0 8px var(--green)' : 'none',
              animation: running ? 'pulse 2s ease infinite' : 'none',
            }}/>
            <span style={{ color: running ? 'var(--green)' : 'var(--text3)', fontSize:13 }}>
              {running ? 'Servidor rodando' : 'Servidor parado'}
            </span>
            {!running && status?.server_in_use && <Badge>{status.server_in_use}</Badge>}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <Btn onClick={start} disabled={running||loading} variant="success">
              {loading ? <Spinner/> : <Play size={12}/>} Iniciar
            </Btn>
            <Btn onClick={stop} disabled={!running} variant="danger">
              <Square size={12}/> Parar
            </Btn>
          </div>
        </div>
      </Card>

      {/* Logs */}
      <Card style={{ marginBottom:14 }}>
        <div style={{ color:'var(--text3)', fontSize:10, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>
          Output do servidor
        </div>
        <LogBox lines={logs} maxHeight={380} />
      </Card>

      {/* Command */}
      {running && (
        <Card>
          <div style={{ color:'var(--text3)', fontSize:10, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>
            Enviar comando
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ position:'relative', flex:1 }}>
              <span style={{
                position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                color:'var(--gold-dim)', fontSize:12, pointerEvents:'none',
              }}>$</span>
              <input value={cmd} onChange={e=>setCmd(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&sendCmd()}
                placeholder="/say hello, /op player..."
                style={{
                  width:'100%', background:'var(--bg)',
                  border:'1px solid var(--border)', color:'var(--text)',
                  padding:'9px 12px 9px 30px', borderRadius:'var(--radius)',
                  fontSize:12, fontFamily:'inherit', transition:'border-color 0.15s',
                }}
                onFocus={e=>e.target.style.borderColor='var(--gold-dim)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'}
              />
            </div>
            <Btn onClick={sendCmd} variant="primary"><Terminal size={13}/></Btn>
          </div>
        </Card>
      )}
    </PageWrap>
  )
}

/* ─────────────────────────────────────────────────────────────
   OPTIONS
   ───────────────────────────────────────────────────────────── */
export function OptionsPage() {
  const [props,   setProps]   = useState({})
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState('')

  useEffect(() => { api.getProperties().then(setProps).catch(()=>{}) }, [])

  const f   = (k,fb='') => props[k]??fb
  const set = (k,v) => setProps(p=>({...p,[k]:v}))

  async function save() {
    setLoading(true)
    try { await api.saveProperties(props); setMsg('✅ Propriedades salvas!') }
    catch(e) { setMsg(`❌ ${e.message}`) }
    setLoading(false)
  }

  return (
    <PageWrap>
      <SectionHeader icon="⚙" title="Opções" description="Editar server.properties em tempo real" />
      <Card style={{ maxWidth:680 }}>
        <Divider label="gameplay" />
        <Grid cols={2} gap={14}>
          <Select label="Gamemode"   value={f('gamemode','survival')} onChange={v=>set('gamemode',v)}
            options={['survival','creative','adventure','spectator']} />
          <Select label="Difficulty" value={f('difficulty','easy')}  onChange={v=>set('difficulty',v)}
            options={['peaceful','easy','normal','hard']} />
        </Grid>
        <Divider label="rede & capacidade" />
        <Grid cols={2} gap={14}>
          <Input label="max-players"         value={f('max-players','20')}   onChange={v=>set('max-players',v)} />
          <Input label="server-port"         value={f('server-port','25565')} onChange={v=>set('server-port',v)} />
          <Input label="view-distance"       value={f('view-distance','10')} onChange={v=>set('view-distance',v)} />
          <Input label="simulation-distance" value={f('simulation-distance','10')} onChange={v=>set('simulation-distance',v)} />
        </Grid>
        <Divider label="mundo" />
        <Input label="motd" value={f('motd','A Minecraft Server')} onChange={v=>set('motd',v)} />
        <Msg text={msg} />
        <Btn onClick={save} disabled={loading} variant="primary" size="lg" style={{ marginTop:8 }}>
          {loading ? <><Spinner/> Salvando...</> : <><Check size={13}/> Salvar Configurações</>}
        </Btn>
      </Card>
    </PageWrap>
  )
}

/* ─────────────────────────────────────────────────────────────
   MODS
   ───────────────────────────────────────────────────────────── */
export function ModsPage() {
  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState([])
  const [installed, setInstalled] = useState({})
  const [loading,   setLoading]   = useState(false)
  const [msg,       setMsg]       = useState('')

  useEffect(() => { api.listInstalled().then(setInstalled).catch(()=>{}) }, [])

  const search = async () => {
    setLoading(true)
    const r = await api.searchMods(query,'','mod').catch(()=>({results:[]}))
    setResults(r.results||[]); setLoading(false)
  }
  const install = async hit => {
    setMsg(`⏳ Instalando ${hit.title}...`)
    try {
      const r = await api.installMod({project_id:hit.project_id})
      setMsg(`✅ ${r.file} instalado em ${r.folder}/`)
      api.listInstalled().then(setInstalled)
    } catch(e) { setMsg(`❌ ${e.message}`) }
  }

  return (
    <PageWrap>
      <SectionHeader icon="📦" title="Mods & Plugins" description="Buscar e instalar via Modrinth" />

      <Card style={{ marginBottom:14 }}>
        <div style={{ display:'flex', gap:8 }}>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&search()}
            placeholder="Buscar mod ou plugin..."
            style={{
              flex:1, background:'var(--bg)', border:'1px solid var(--border)',
              color:'var(--text)', padding:'9px 13px', borderRadius:'var(--radius)',
              fontSize:12, fontFamily:'inherit', transition:'border-color 0.15s',
            }}
            onFocus={e=>e.target.style.borderColor='var(--gold-dim)'}
            onBlur={e=>e.target.style.borderColor='var(--border)'}
          />
          <Btn onClick={search} disabled={loading} variant="primary">
            {loading ? <Spinner/> : '🔍 Buscar'}
          </Btn>
        </div>
        <Msg text={msg} />
      </Card>

      {results.length > 0 && (
        <div style={{ marginBottom:14 }}>
          {results.map(h => (
            <div key={h.project_id} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'13px 16px', background:'var(--surface)', border:'1px solid var(--border)',
              borderRadius:'var(--radius)', marginBottom:6, transition:'border-color 0.12s, transform 0.12s',
            }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--gold-dim)'; e.currentTarget.style.transform='translateX(2px)' }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none' }}
            >
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13, color:'var(--text)', marginBottom:3 }}>{h.title}</div>
                <div style={{ color:'var(--text3)', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.description?.slice(0,90)}</div>
                <span style={{ color:'var(--text4)', fontSize:10 }}>↓ {h.downloads?.toLocaleString()}</span>
              </div>
              <Btn onClick={()=>install(h)} variant="success" size="sm" style={{ marginLeft:14, flexShrink:0 }}>Instalar</Btn>
            </div>
          ))}
        </div>
      )}

      <Card>
        <div style={{ color:'var(--text3)', fontSize:10, letterSpacing:1.5, textTransform:'uppercase', marginBottom:14 }}>Instalados</div>
        {Object.entries(installed).flatMap(([folder,files]) =>
          files.map(f => (
            <div key={f} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:12, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', flex:1 }}>
                <Badge color="var(--text3)">{folder}</Badge>
                <span style={{ marginLeft:8 }}>{f}</span>
              </span>
              <Btn onClick={()=>api.removeMod(folder,f).then(()=>api.listInstalled().then(setInstalled))} variant="danger" size="sm" style={{ marginLeft:10, flexShrink:0 }}>
                <Trash2 size={11}/>
              </Btn>
            </div>
          ))
        )}
        {Object.keys(installed).length===0 && <div style={{ color:'var(--text4)', fontSize:11, textAlign:'center', padding:'16px 0' }}>Nenhum mod instalado.</div>}
      </Card>
    </PageWrap>
  )
}

/* ─────────────────────────────────────────────────────────────
   BACKUP
   ───────────────────────────────────────────────────────────── */
export function BackupPage() {
  const [backups,setBackups] = useState([])
  const [loading,setLoading] = useState(false)
  const [msg,setMsg]         = useState('')

  useEffect(() => { api.listBackups().then(r=>setBackups(r.backups||[])).catch(()=>{}) }, [])

  const createBackup = async () => {
    setLoading(true); setMsg('')
    try {
      const r = await api.createBackup({world:'world'})
      setMsg(`✅ ${r.file} (${r.size_mb} MB)`)
      api.listBackups().then(r=>setBackups(r.backups||[]))
    } catch(e) { setMsg(`❌ ${e.message}`) }
    setLoading(false)
  }
  const del = async name => { await api.deleteBackup(name); api.listBackups().then(r=>setBackups(r.backups||[])) }

  const total = backups.reduce((a,b)=>a+(b.size_mb||0),0).toFixed(1)

  return (
    <PageWrap>
      <SectionHeader icon="💾" title="Backup" description="Backup e restauração do mundo no Google Drive" />

      <Grid cols={2} gap={12} style={{ maxWidth:500, marginBottom:16 }}>
        <StatCard label="Backups" value={backups.length} icon="📦" color="var(--gold)" />
        <StatCard label="Total"   value={`${total} MB`} icon="🗄" color="var(--blue)" />
      </Grid>

      <Card style={{ marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <Btn onClick={createBackup} disabled={loading} variant="success" size="lg">
            {loading ? <><Spinner/> Criando backup...</> : '📦 Fazer Backup do Mundo'}
          </Btn>
          <Msg text={msg} />
        </div>
      </Card>

      <Card>
        <div style={{ color:'var(--text3)', fontSize:10, letterSpacing:1.5, textTransform:'uppercase', marginBottom:14 }}>
          Backups existentes — {backups.length}
        </div>
        {backups.length===0
          ? <div style={{ color:'var(--text4)', fontSize:11, textAlign:'center', padding:'16px 0' }}>Nenhum backup criado ainda.</div>
          : backups.map((b,i) => (
              <div key={b.name} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'11px 0', borderBottom:i<backups.length-1?'1px solid var(--border)':'none',
              }}>
                <div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginBottom:2 }}>{b.name}</div>
                  <div style={{ fontSize:10, color:'var(--text3)' }}>{b.size_mb} MB</div>
                </div>
                <Btn onClick={()=>del(b.name)} variant="danger" size="sm"><Trash2 size={11}/></Btn>
              </div>
            ))
        }
      </Card>
    </PageWrap>
  )
}

/* ─────────────────────────────────────────────────────────────
   LOGS
   ───────────────────────────────────────────────────────────── */
export function LogsPage() {
  const [lines,  setLines]  = useState([])
  const [filter, setFilter] = useState('')
  const [tail,   setTail]   = useState(200)
  const [loading,setLoading]= useState(false)
  const [msg,    setMsg]    = useState('')

  const load = async () => { const r = await api.getLogs(tail,filter).catch(()=>({lines:[]})); setLines(r.lines||[]) }
  useEffect(() => { load() }, [])

  const optimize = async () => {
    if (!confirm('Aplicar otimizações de TPS?')) return
    setLoading(true)
    try { const r = await api.optimizeTps(); setMsg(`✅ Otimizado: ${r.applied.join(', ')}`) }
    catch(e) { setMsg(`❌ ${e.message}`) }
    setLoading(false)
  }

  const errCount  = lines.filter(l=>/error|exception/i.test(l)).length
  const warnCount = lines.filter(l=>/warn/i.test(l)).length

  return (
    <PageWrap>
      <SectionHeader icon="📋" title="Logs & TPS" description="Output do servidor e otimizações de desempenho" />

      <Grid cols={3} gap={12} style={{ marginBottom:16 }}>
        <StatCard label="Linhas"      value={lines.length} icon="📄" color="var(--blue)"  />
        <StatCard label="Erros"       value={errCount}     icon="🔴" color="var(--red)"   />
        <StatCard label="Alertas"     value={warnCount}    icon="🟡" color="var(--amber)" />
      </Grid>

      <Card style={{ marginBottom:14 }}>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input value={filter} onChange={e=>setFilter(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&load()}
            placeholder="Filtrar (ex: ERROR, WARN, player...)"
            style={{
              flex:1, background:'var(--bg)', border:'1px solid var(--border)',
              color:'var(--text)', padding:'8px 13px', borderRadius:'var(--radius)',
              fontSize:12, fontFamily:'inherit',
            }}
            onFocus={e=>e.target.style.borderColor='var(--gold-dim)'}
            onBlur={e=>e.target.style.borderColor='var(--border)'}
          />
          <select value={tail} onChange={e=>setTail(+e.target.value)} style={{
            background:'var(--bg)', border:'1px solid var(--border)',
            color:'var(--text)', padding:'8px 10px', borderRadius:'var(--radius)',
            fontSize:11, fontFamily:'inherit', cursor:'pointer',
          }}>
            {[50,100,200,500].map(n=><option key={n} style={{background:'var(--bg)'}}>{n}</option>)}
          </select>
          <Btn onClick={load} variant="ghost"><RefreshCw size={13}/></Btn>
        </div>
        <LogBox lines={lines} maxHeight={460} />
      </Card>

      <Card>
        <div style={{ color:'var(--text3)', fontSize:10, letterSpacing:1.5, textTransform:'uppercase', marginBottom:12 }}>
          Otimizador de TPS
        </div>
        <div style={{ color:'var(--text2)', fontSize:11, lineHeight:1.9, marginBottom:14 }}>
          Aplica ajustes automáticos no server.properties e YAMLs para melhorar o TPS e reduzir lag.
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
          <Btn onClick={optimize} disabled={loading} variant="primary">
            {loading ? <><Spinner/> Otimizando...</> : '⚡ Otimizar Servidor'}
          </Btn>
          <Msg text={msg} />
        </div>
      </Card>
    </PageWrap>
  )
}
