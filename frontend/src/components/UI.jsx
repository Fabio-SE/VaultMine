import { useRef, useEffect } from 'react'

/* ── VaultLogo ────────────────────────────────────────────── */
export function VaultLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="var(--gold-faint)" />
      <path d="M10 14 L20 8 L30 14 L30 26 L20 32 L10 26 Z"
        fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 14 L20 20 L30 14"
        fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M20 20 L20 32"
        fill="none" stroke="var(--gold-dim)" strokeWidth="1.5"/>
      <path d="M16 22 L24 22"
        fill="none" stroke="var(--gold)" strokeWidth="1" strokeLinecap="round"/>
      <path d="M16 25.5 L24 25.5"
        fill="none" stroke="var(--gold-dim)" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}

/* ── ThemeToggle ──────────────────────────────────────────── */
export function ThemeToggle({ theme, setTheme }) {
  const dark = theme === 'dark'
  return (
    <button
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      title={dark ? 'Modo claro' : 'Modo escuro'}
      style={{
        position: 'relative',
        width: 52, height: 28, borderRadius: 14,
        background: dark
          ? 'linear-gradient(135deg, #2a3140, #1C2026)'
          : 'linear-gradient(135deg, #e8d8b8, #d4c4a0)',
        border: `1.5px solid ${dark ? 'var(--gold-dim)' : 'var(--gold)'}`,
        cursor: 'pointer', padding: 0, transition: 'all 0.4s var(--ease)',
        flexShrink: 0,
      }}
    >
      {/* track glow */}
      <span style={{
        position: 'absolute', inset: 0, borderRadius: 14,
        background: dark
          ? 'radial-gradient(circle at 30% 50%, #c4a26520, transparent 70%)'
          : 'radial-gradient(circle at 70% 50%, #c4a26540, transparent 70%)',
        transition: 'all 0.4s',
      }} />
      {/* thumb */}
      <span style={{
        position: 'absolute', top: 3,
        left: dark ? 3 : 25,
        width: 20, height: 20, borderRadius: '50%',
        background: dark
          ? 'radial-gradient(circle at 35% 35%, #d4b87a, #8a6e42)'
          : 'radial-gradient(circle at 35% 35%, #fff8e8, #e8cc88)',
        boxShadow: dark ? '0 1px 4px #00000060' : '0 1px 6px #c4a26560',
        transition: 'left 0.35s var(--ease)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11,
      }}>
        {dark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}

/* ── PageWrap ─────────────────────────────────────────────── */
export function PageWrap({ children }) {
  return (
    <div style={{
      padding: '36px 40px',
      animation: 'fadeSlideUp 0.22s var(--ease) both',
    }}>
      {children}
    </div>
  )
}

/* ── SectionHeader ────────────────────────────────────────── */
export function SectionHeader({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', marginBottom: 28, gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: 'var(--gold-faint)',
          border: '1px solid var(--gold-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 19,
        }}>
          {icon}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-disp)', color: 'var(--text)',
            fontSize: 22, fontWeight: 800, letterSpacing: 1, lineHeight: 1.1,
            marginBottom: 4,
          }}>
            {title}
          </div>
          {description && (
            <div style={{ color: 'var(--text3)', fontSize: 12 }}>
              {description}
            </div>
          )}
        </div>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

/* ── Card ─────────────────────────────────────────────────── */
export function Card({ children, style = {}, accent, noPad = false }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${accent ? 'var(--gold-dim)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: noPad ? 0 : '20px 22px',
      ...(accent && { borderLeft: '3px solid var(--gold)' }),
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── Btn ──────────────────────────────────────────────────── */
export function Btn({ children, onClick, variant = 'primary', disabled = false, style = {}, size = 'md' }) {
  const pad   = size === 'sm' ? '5px 12px' : size === 'lg' ? '11px 22px' : '8px 16px'
  const fs    = size === 'sm' ? 11 : size === 'lg' ? 13 : 12
  const vars  = {
    primary: { bg:'var(--gold-bg)', b:'var(--gold-dim)', c:'var(--gold-hi)', hBg:'var(--gold-faint)', hB:'var(--gold)' },
    success: { bg:'var(--green-bg)', b:'var(--green-b)', c:'var(--green)', hBg:'var(--green-bg)', hB:'var(--green)' },
    danger:  { bg:'var(--red-bg)',   b:'var(--red-b)',   c:'var(--red)',   hBg:'var(--red-bg)',   hB:'var(--red)'   },
    ghost:   { bg:'transparent',    b:'var(--border)',  c:'var(--text2)', hBg:'var(--bg3)',      hB:'var(--border2)'},
    blue:    { bg:'var(--blue-bg)', b:'var(--blue-b)',  c:'var(--blue)', hBg:'var(--blue-bg)',  hB:'var(--blue)'  },
  }
  const v = vars[variant] || vars.primary
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        padding: pad, borderRadius: 'var(--radius)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: v.bg, border: `1px solid ${v.b}`, color: v.c,
        fontSize: fs, opacity: disabled ? 0.35 : 1,
        transition: 'all 0.15s var(--ease)', letterSpacing: 0.3, fontWeight: 500,
        display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = v.hBg; e.currentTarget.style.borderColor = v.hB } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = v.bg;  e.currentTarget.style.borderColor = v.b  } }}
    >
      {children}
    </button>
  )
}

/* ── FieldLabel ───────────────────────────────────────────── */
function FieldLabel({ children }) {
  return (
    <div style={{
      color: 'var(--gold-dim)', fontSize: 10, letterSpacing: 1.5,
      fontWeight: 700, marginBottom: 6, textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

/* ── Input ────────────────────────────────────────────────── */
export function Input({ label, value, onChange, placeholder, type = 'text', style = {} }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'var(--bg)',
          border: '1px solid var(--border)',
          color: 'var(--text)', padding: '9px 13px', borderRadius: 'var(--radius)',
          fontSize: 12, fontFamily: 'inherit', transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold-dim)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}

/* ── Select ───────────────────────────────────────────────── */
export function Select({ label, value, onChange, options = [], style = {} }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: 'var(--bg)',
          border: '1px solid var(--border)',
          color: 'var(--text)', padding: '9px 13px', borderRadius: 'var(--radius)',
          fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold-dim)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border)'}
      >
        {options.map(o => (
          <option key={typeof o==='string'?o:o.value} value={typeof o==='string'?o:o.value}
            style={{ background: 'var(--bg)' }}>
            {typeof o==='string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/* ── LogBox ───────────────────────────────────────────────── */
export function LogBox({ lines = [], maxHeight = 360 }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [lines])

  const c = l => {
    if (/error|erro|exception|fatal/i.test(l)) return 'var(--red)'
    if (/warn|aviso/i.test(l))                 return 'var(--amber)'
    if (/\[info\]/i.test(l))                   return 'var(--blue)'
    if (/\[log\]|done|✓|succes/i.test(l))      return 'var(--green)'
    return 'var(--text3)'
  }

  return (
    <div ref={ref} style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderLeft: '3px solid var(--gold-dim)',
      borderRadius: 'var(--radius)', padding: '13px 15px',
      maxHeight, overflowY: 'auto', fontSize: 11, lineHeight: 1.9,
    }}>
      {lines.length === 0
        ? <span style={{ color: 'var(--text4)', fontStyle: 'italic' }}>// awaiting output...</span>
        : lines.map((l, i) => (
            <div key={i} style={{ color: c(l), whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{l}</div>
          ))
      }
    </div>
  )
}

/* ── Badge ────────────────────────────────────────────────── */
export function Badge({ children, color, dot = false }) {
  const col = color || 'var(--gold)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 9px', borderRadius: 20,
      background: col + '18', border: `1px solid ${col}44`,
      color: col, fontSize: 10, fontWeight: 600, letterSpacing: 0.4,
    }}>
      {dot && <span style={{ width:5,height:5,borderRadius:'50%',background:col,animation:'pulse 2s infinite',flexShrink:0 }} />}
      {children}
    </span>
  )
}

/* ── Grid ─────────────────────────────────────────────────── */
export function Grid({ children, cols = 2, gap = 16 }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap }}>
      {children}
    </div>
  )
}

/* ── Spinner ──────────────────────────────────────────────── */
export function Spinner() {
  return (
    <span style={{
      display:'inline-block', width:13, height:13,
      border:'1.5px solid var(--border2)', borderTopColor:'var(--gold)',
      borderRadius:'50%', animation:'spin 0.7s linear infinite', flexShrink:0,
    }} />
  )
}

/* ── Divider ──────────────────────────────────────────────── */
export function Divider({ label, style: s = {} }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'18px 0', ...s }}>
      <div style={{ flex:1, height:'1px', background:'var(--border)' }} />
      {label && <span style={{ color:'var(--gold-dim)', fontSize:9, letterSpacing:2, textTransform:'uppercase', fontWeight:700 }}>{label}</span>}
      <div style={{ flex:1, height:'1px', background:'var(--border)' }} />
    </div>
  )
}

/* ── Msg ──────────────────────────────────────────────────── */
export function Msg({ text, style: s = {} }) {
  if (!text) return null
  const ok = text.startsWith('✅')
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 'var(--radius)', fontSize: 11,
      background: ok ? 'var(--green-bg)' : 'var(--red-bg)',
      border: `1px solid ${ok ? 'var(--green-b)' : 'var(--red-b)'}`,
      color: ok ? 'var(--green)' : 'var(--red)',
      marginTop: 10, ...s,
    }}>{text}</div>
  )
}

/* ── StatCard ─────────────────────────────────────────────── */
export function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 9, flexShrink: 0,
        background: (color || 'var(--gold)') + '18',
        border: `1px solid ${color || 'var(--gold)'}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>{icon}</div>
      <div>
        <div style={{ color: 'var(--text3)', fontSize: 10, letterSpacing:1.2, textTransform:'uppercase', marginBottom:3 }}>{label}</div>
        <div style={{ color: color || 'var(--gold)', fontFamily:'var(--font-disp)', fontSize:20, fontWeight:800, lineHeight:1 }}>{value}</div>
      </div>
    </div>
  )
}
