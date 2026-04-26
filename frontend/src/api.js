/**
 * api.js — cliente HTTP para o backend FastAPI
 * 
 * Para mudar o backend: só altere a variável VAULT_API_URL no localStorage
 * ou via Settings no app. Não precisa recompilar.
 */

export const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function getApiUrl() {
  return localStorage.getItem('vault_api_url') || DEFAULT_API_URL
}

export function setApiUrl(url) {
  localStorage.setItem('vault_api_url', url.replace(/\/$/, ''))
}

async function request(method, path, body = null) {
  const base = getApiUrl()
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${base}${path}`, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Health ──────────────────────────────────────────────────
export const api = {
  health:             ()          => request('GET',    '/'),

  // Setup
  setup:              (drive_path) => request('POST',  '/setup', { drive_path }),

  // Servers
  listServers:        ()          => request('GET',    '/servers'),
  getTypes:           ()          => request('GET',    '/servers/types'),
  getVersions:        (type)      => request('GET',    `/servers/versions/${type}`),
  createServer:       (body)      => request('POST',   '/servers', body),
  selectServer:       (name)      => request('POST',   `/servers/${name}/select`),
  deleteServer:       (name)      => request('DELETE', `/servers/${name}`),

  // Runner
  startServer:        ()          => request('POST',   '/runner/start'),
  stopServer:         ()          => request('POST',   '/runner/stop'),
  sendCommand:        (command)   => request('POST',   '/runner/command', { command }),
  serverStatus:       ()          => request('GET',    '/runner/status'),

  // Options
  getProperties:      ()          => request('GET',    '/options/properties'),
  saveProperties:     (body)      => request('PUT',    '/options/properties', body),
  getOps:             ()          => request('GET',    '/options/ops'),
  removeOp:           (name)      => request('DELETE', `/options/ops/${name}`),
  getWhitelist:       ()          => request('GET',    '/options/whitelist'),

  // Mods
  searchMods:         (q, v, t)   => request('GET',    `/mods/search?q=${encodeURIComponent(q)}&version=${v}&project_type=${t}`),
  installMod:         (body)      => request('POST',   '/mods/install', body),
  listInstalled:      ()          => request('GET',    '/mods/installed'),
  removeMod:          (f, n)      => request('DELETE', `/mods/installed/${f}/${n}`),

  // Backup
  listBackups:        ()          => request('GET',    '/backup'),
  createBackup:       (body)      => request('POST',   '/backup', body),
  deleteBackup:       (name)      => request('DELETE', `/backup/${name}`),

  // Logs
  getLogs:            (tail, f)   => request('GET',    `/logs?tail=${tail}&filter=${f||''}`),
  optimizeTps:        ()          => request('POST',   '/logs/optimize'),
}

// SSE stream de logs em tempo real
export function streamLogs(onLine) {
  const url = `${getApiUrl()}/runner/stream-logs`
  const es = new EventSource(url)
  es.onmessage = (e) => onLine(e.data)
  es.onerror   = ()  => es.close()
  return () => es.close()  // retorna função de cleanup
}
