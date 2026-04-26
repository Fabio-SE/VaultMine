/* ─────────────────────────────────────────────────────────────
   UI.jsx — Componentes VAULT  •  Paleta Zolo
   ───────────────────────────────────────────────────────────── */
import { useRef, useEffect } from 'react'

/* ── Logo SVG ─────────────────────────────────────────────── */
export function VaultLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="url(#lg)" />
      <path d="M8 10 L16 6 L24 10 L24 22 L16 26 L8 22 Z"
        fill="none" stroke="#8C7549" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M8 10 L16 14 L24 10" fill="none" stroke="#8C7549" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M16 14 L16 26" fill="none" stroke="#594A2D" strokeWidth="1.2" />
      <path d="M13 16 L19 16" fill="none" stroke="#8C7549" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M13 19 L19 19" fill="none" stroke="#594A2D" strokeWidth="0.8" strokeLinecap="round" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b14" />
          <stop offset="100%" stopColor="#0b0e13" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Page wrapper com fade-in ────────────────────────────── */
export function PageWrap({ children }) {
  return (
    <div style={{
      padding: '32px 36px',
      animation: 'fadeIn 0.25s var(--ease, ease) both',
    }}>
      {children}
    </div>
  )
}

/* ── SectionHeader ───────────────────────────────────────── */
export function SectionHeader({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', marginBottom: 28,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #1e1b14, #13100c)',
          border: '1px solid #594A2D55',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
            <span style={{
              color: '#D9D9D9', fontSize: 16, fontWeight: 700, letterSpacing: 2,
            }}>
              {title.toUpperCase()}
            </span>
          </div>
          {description && (
            <div style={{ color: '#3a4252', fontSize: 11, letterSpacing: 0.3 }}>
              {description}
            </div>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

/* ── Card ────────────────────────────────────────────────── */
export function Card({ children, style = {}, accent = false }) {
  return (
    <div style={{
      background: '#10141a',
      border: `1px solid ${accent ? '#594A2D66' : '#1f2a38'}`,
      borderRadius: 10,
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
      ...(accent && { borderLeft: '3px solid #594A2D' }),
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── Btn ─────────────────────────────────────────────────── */
const BTN_VARIANTS = {
  primary: { bg: '#1c1810', border: '#8C754966', color: '#8C7549', hBg: '#252015', hBorder: '#8C7549aa' },
  success: { bg: '#0d1a10', border: '#5a9e6f44', color: '#5a9e6f', hBg: '#111f14', hBorder: '#5a9e6f88' },
  danger:  { bg: '#180d0d', border: '#9e5a5a44', color: '#9e5a5a', hBg: '#1f1111', hBorder: '#9e5a5a88' },
  ghost:   { bg: 'transparent', border: '#1f2a38', color: '#505a68', hBg: '#151a22', hBorder: '#273344' },
  solid:   { bg: 'linear-gradient(135deg,#594A2D,#8C7549)', border: 'transparent', color: '#D9D9D9', hBg: '#8C7549', hBorder: 'transparent' },
}

export function Btn({ children, onClick, variant = 'primary', disabled = false, style = {}, size = 'md' }) {
  const c = BTN_VARIANTS[variant] || BTN_VARIANTS.primary
  const pad = size === 'sm' ? '5px 11px' : size === 'lg' ? '11px 24px' : '8px 16px'
  const fs  = size === 'sm' ? 10 : size === 'lg' ? 13 : 11

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: pad, borderRadius: 7, cursor: disabled ? 'not-allowed' : 'pointer',
        background: c.bg, border: `1px solid ${c.border}`, color: c.color,
        fontSize: fs, fontFamily: 'inherit', opacity: disabled ? 0.3 : 1,
        transition: 'all 0.15s', letterSpacing: 0.5, fontWeight: 500,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.background = c.hBg
          e.currentTarget.style.borderColor = c.hBorder
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          e.currentTarget.style.background = c.bg
          e.currentTarget.style.borderColor = c.border
        }
      }}
    >
      {children}
    </button>
  )
}

/* ── Label ───────────────────────────────────────────────── */
function FieldLabel({ children }) {
  return (
    <div style={{
      color: '#594A2D', fontSize: 9, letterSpacing: 2,
      fontWeight: 700, marginBottom: 5, textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

/* ── Input ───────────────────────────────────────────────── */
export function Input({ label, value, onChange, placeholder, type = 'text', style = {}, mono = true }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: '#0b0e13',
          border: '1px solid #1f2a38',
          color: '#b0bac8', padding: '9px 12px', borderRadius: 7,
          fontSize: 12, fontFamily: mono ? 'inherit' : 'inherit',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = '#594A2D' }}
        onBlur={e => { e.target.style.borderColor = '#1f2a38' }}
      />
    </div>
  )
}

/* ── Select ──────────────────────────────────────────────── */
export function Select({ label, value, onChange, options = [], style = {} }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: '#0b0e13',
          border: '1px solid #1f2a38',
          color: '#b0bac8', padding: '9px 12px', borderRadius: 7,
          fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
        }}
        onFocus={e => { e.target.style.borderColor = '#594A2D' }}
        onBlur={e => { e.target.style.borderColor = '#1f2a38' }}
      >
        {options.map(o => (
          <option
            key={typeof o === 'string' ? o : o.value}
            value={typeof o === 'string' ? o : o.value}
            style={{ background: '#10141a' }}
          >
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/* ── LogBox ──────────────────────────────────────────────── */
export function LogBox({ lines = [], maxHeight = 360 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [lines])

  function color(line) {
    if (/error|erro|exception|fatal/i.test(line)) return '#9e5a5a'
    if (/warn|aviso/i.test(line)) return '#9e8a4a'
    if (/\[info\]/i.test(line)) return '#7a8a9e'
    if (/\[log\]|done|✓|succes/i.test(line)) return '#5a9e6f'
    return '#3a4555'
  }

  return (
    <div
      ref={ref}
      style={{
        background: '#080b10',
        border: '1px solid #161c25',
        borderLeft: '2px solid #594A2D44',
        borderRadius: 8,
        padding: '12px 14px', maxHeight, overflowY: 'auto',
        fontSize: 11, lineHeight: 1.9, position: 'relative',
      }}
    >
      {lines.length === 0
        ? <span style={{ color: '#1f2a38' }}>// awaiting output...</span>
        : lines.map((l, i) => (
            <div key={i} style={{ color: color(l), whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {l}
            </div>
          ))
      }
    </div>
  )
}

/* ── Badge ───────────────────────────────────────────────── */
export function Badge({ children, color = '#8C7549', dot = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 20,
      border: `1px solid ${color}33`,
      color, background: color + '12',
      fontSize: 10, letterSpacing: 0.5, fontWeight: 600,
    }}>
      {dot && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: color, animation: 'pulse 2s infinite',
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  )
}

/* ── Grid ────────────────────────────────────────────────── */
export function Grid({ children, cols = 2, gap = 16 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
      {children}
    </div>
  )
}

/* ── Spinner ─────────────────────────────────────────────── */
export function Spinner({ size = 13 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: `1.5px solid #1f2a38`, borderTopColor: '#8C7549',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      verticalAlign: 'middle', flexShrink: 0,
    }} />
  )
}

/* ── Divider ─────────────────────────────────────────────── */
export function Divider({ label, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      margin: '20px 0', ...style,
    }}>
      <div style={{ flex: 1, height: '1px', background: '#1f2a38' }} />
      {label && (
        <span style={{ color: '#3a4252', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: '1px', background: '#1f2a38' }} />
    </div>
  )
}

/* ── StatusPill ──────────────────────────────────────────── */
export function StatusPill({ online, label }) {
  const c = online ? '#5a9e6f' : '#9e5a5a'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '5px 10px', borderRadius: 6,
      background: online ? '#0d1a1022' : '#1a0d0d22',
      border: `1px solid ${c}33`, fontSize: 11, color: c,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: c, flexShrink: 0,
        animation: online ? 'pulse 2.5s ease infinite' : 'none',
      }} />
      {label}
    </div>
  )
}

/* ── Msg ─────────────────────────────────────────────────── */
export function Msg({ text }) {
  if (!text) return null
  const ok = text.startsWith('✅')
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 6, fontSize: 11,
      background: ok ? '#0d1a1033' : '#1a0d0d33',
      border: `1px solid ${ok ? '#5a9e6f33' : '#9e5a5a33'}`,
      color: ok ? '#5a9e6f' : '#9e5a5a',
      marginTop: 10,
    }}>
      {text}
    </div>
  )
}
