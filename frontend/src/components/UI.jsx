/* Componentes reutilizáveis — nova paleta Zolo */

export function SectionHeader({ icon, title, description }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      marginBottom: 28,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
        background: 'linear-gradient(135deg, #2a2218, #1e1b14)',
        border: '1px solid #594A2D66',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        {icon}
      </div>
      <div style={{ borderLeft: '2px solid #594A2D', paddingLeft: 14 }}>
        <div style={{
          color: '#D9D9D9', fontSize: 17, fontWeight: 700,
          letterSpacing: 2, lineHeight: 1.2,
        }}>
          {title.toUpperCase()}
        </div>
        {description && (
          <div style={{ color: '#4a5060', fontSize: 11, marginTop: 4, letterSpacing: 0.5 }}>
            {description}
          </div>
        )}
      </div>
    </div>
  )
}

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, #13171e, #0f1318)',
      border: '1px solid #252c38',
      borderRadius: 10, padding: 22,
      boxShadow: '0 4px 24px #00000030',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function Btn({ children, onClick, variant = 'primary', disabled = false, style = {} }) {
  const colors = {
    primary:  { border: '#8C7549', color: '#8C7549', bg: '#2a2218', hoverBg: '#332a1e' },
    success:  { border: '#4a7a4a', color: '#7ab87a', bg: '#1a2518', hoverBg: '#1f2d1c' },
    danger:   { border: '#7a3a3a', color: '#c07070', bg: '#1e1618', hoverBg: '#251a1a' },
    ghost:    { border: '#2a3040', color: '#5a6070', bg: 'transparent', hoverBg: '#1a1e26' },
    gold:     { border: '#8C7549', color: '#D9D9D9', bg: 'linear-gradient(90deg, #594A2D, #8C7549)', hoverBg: '#8C7549' },
  }
  const c = colors[variant] || colors.primary
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px', borderRadius: 7, cursor: disabled ? 'not-allowed' : 'pointer',
        background: c.bg, border: `1px solid ${c.border}88`, color: c.color,
        fontSize: 12, fontFamily: 'inherit', opacity: disabled ? 0.35 : 1,
        transition: 'all 0.15s', letterSpacing: 0.5,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function Input({ label, value, onChange, placeholder, type = 'text', style = {} }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && (
        <div style={{
          color: '#594A2D', fontSize: 10, marginBottom: 5,
          letterSpacing: 1.5, fontWeight: 600,
        }}>
          {label.toUpperCase()}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: '#0a0d12',
          border: '1px solid #252c38',
          borderBottom: '1px solid #594A2D44',
          color: '#c8d0da', padding: '9px 12px', borderRadius: 7,
          fontSize: 12, fontFamily: 'inherit', outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = '#8C754966'; e.target.style.borderBottomColor = '#8C7549' }}
        onBlur={e => { e.target.style.borderColor = '#252c38'; e.target.style.borderBottomColor = '#594A2D44' }}
      />
    </div>
  )
}

export function Select({ label, value, onChange, options = [], style = {} }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && (
        <div style={{
          color: '#594A2D', fontSize: 10, marginBottom: 5,
          letterSpacing: 1.5, fontWeight: 600,
        }}>
          {label.toUpperCase()}
        </div>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          background: '#0a0d12',
          border: '1px solid #252c38',
          borderBottom: '1px solid #594A2D44',
          color: '#c8d0da', padding: '9px 12px', borderRadius: 7,
          fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
          outline: 'none',
        }}
      >
        {options.map(o => (
          <option
            key={typeof o === 'string' ? o : o.value}
            value={typeof o === 'string' ? o : o.value}
            style={{ background: '#13171e' }}
          >
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function LogBox({ lines = [], maxHeight = 360 }) {
  function classify(line) {
    if (/error|erro|exception/i.test(line)) return '#c07070'
    if (/warn|aviso/i.test(line)) return '#c8a84a'
    if (/\[info\]/i.test(line)) return '#8C7549'
    if (/\[log\]|done|✓/i.test(line)) return '#7ab87a'
    return '#4a5468'
  }
  return (
    <div style={{
      background: '#080b10',
      border: '1px solid #1e2530',
      borderLeft: '3px solid #594A2D44',
      borderRadius: 8,
      padding: '14px 16px', maxHeight, overflowY: 'auto',
      fontSize: 11, lineHeight: 1.8,
    }}>
      {lines.length === 0
        ? <span style={{ color: '#2a3040' }}>Sem output ainda...</span>
        : lines.map((l, i) => (
            <div key={i} style={{
              color: classify(l),
              whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {l}
            </div>
          ))
      }
    </div>
  )
}

export function Badge({ children, color = '#8C7549' }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 20,
      border: `1px solid ${color}44`,
      color, background: color + '14',
      fontSize: 10, letterSpacing: 0.5, fontWeight: 600,
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
      display: 'inline-block', width: 13, height: 13,
      border: '2px solid #252c38', borderTopColor: '#8C7549',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      verticalAlign: 'middle',
    }} />
  )
}

export function Divider({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      margin: '18px 0', color: '#2a3040', fontSize: 10, letterSpacing: 1.5,
    }}>
      <div style={{ flex: 1, height: 1, background: '#1e2530' }} />
      {label && <span style={{ color: '#594A2D' }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: '#1e2530' }} />
    </div>
  )
}
