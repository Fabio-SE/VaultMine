/* Componentes reutilizáveis — use em qualquer página */

export function SectionHeader({ icon, title, description }) {
  return (
    <div style={{
      borderLeft: '4px solid #00d4ff', padding: '12px 20px',
      background: '#0a1520', marginBottom: 24,
    }}>
      <div style={{ color: '#00d4ff', fontSize: 18, fontWeight: 700 }}>
        {icon} {title}
      </div>
      {description && (
        <div style={{ color: '#4a6580', fontSize: 12, marginTop: 4 }}>{description}</div>
      )}
    </div>
  )
}

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#111827', border: '1px solid #1e2d40',
      borderRadius: 10, padding: 20, ...style
    }}>
      {children}
    </div>
  )
}

export function Btn({ children, onClick, variant = 'primary', disabled = false, style = {} }) {
  const colors = {
    primary:  { border: '#00d4ff', color: '#00d4ff', bg: '#0a2a4a' },
    success:  { border: '#00ff88', color: '#00ff88', bg: '#0a2a1f' },
    danger:   { border: '#ff4444', color: '#ff4444', bg: '#2a0a0a' },
    ghost:    { border: '#1e2d40', color: '#5a7090', bg: 'transparent' },
  }
  const c = colors[variant] || colors.primary
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        background: c.bg, border: `1px solid ${c.border}`, color: c.color,
        fontSize: 13, fontFamily: 'inherit', opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s', ...style
      }}
    >
      {children}
    </button>
  )
}

export function Input({ label, value, onChange, placeholder, type = 'text', style = {} }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <div style={{ color: '#5a7090', fontSize: 11, marginBottom: 4 }}>{label}</div>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: '#0d1117', border: '1px solid #1e2d40',
          color: '#e0e6f0', padding: '8px 12px', borderRadius: 8,
          fontSize: 13, fontFamily: 'inherit', outline: 'none',
        }}
      />
    </div>
  )
}

export function Select({ label, value, onChange, options = [], style = {} }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <div style={{ color: '#5a7090', fontSize: 11, marginBottom: 4 }}>{label}</div>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: '#0d1117', border: '1px solid #1e2d40',
          color: '#e0e6f0', padding: '8px 12px', borderRadius: 8,
          fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
        }}
      >
        {options.map(o => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function LogBox({ lines = [], maxHeight = 360 }) {
  function classify(line) {
    if (/error|erro|exception/i.test(line)) return 'log-error'
    if (/warn|aviso/i.test(line)) return 'log-warn'
    if (/\[info\]/i.test(line)) return 'log-info'
    if (/\[log\]|done|✓/i.test(line)) return 'log-ok'
    return ''
  }
  return (
    <div style={{
      background: '#060c14', border: '1px solid #1e2d40', borderRadius: 8,
      padding: 14, maxHeight, overflowY: 'auto', fontSize: 11, lineHeight: 1.7,
    }}>
      {lines.length === 0
        ? <span style={{ color: '#2a3a50' }}>Sem output ainda...</span>
        : lines.map((l, i) => (
            <div key={i} className={classify(l)} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {l}
            </div>
          ))
      }
    </div>
  )
}

export function Badge({ children, color = '#00d4ff' }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 20,
      border: `1px solid ${color}44`, color, background: color + '11',
      fontSize: 11,
    }}>
      {children}
    </span>
  )
}

export function Grid({ children, cols = 2, gap = 16 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
      {children}
    </div>
  )
}

export function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14,
      border: '2px solid #1e2d40', borderTopColor: '#00d4ff',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      verticalAlign: 'middle', marginRight: 6,
    }} />
  )
}
