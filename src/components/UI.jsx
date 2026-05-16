import React from 'react';
import { computeProgress, progressColor } from '../utils';

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  Approved:      'badge-green',
  Pending:       'badge-amber',
  Draft:         'badge-gray',
  Returned:      'badge-red',
  'On Track':    'badge-blue',
  Completed:     'badge-green',
  'Not Started': 'badge-gray',
};
export function Badge({ label }) {
  return <span className={`badge ${BADGE_MAP[label] || 'badge-gray'}`}>{label}</span>;
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ goal, height = 6 }) {
  const pct = computeProgress(goal);
  return (
    <div>
      <div className="progress-bar" style={{ height }}>
        <div
          className="progress-fill"
          style={{ width: `${Math.min(pct, 100)}%`, background: progressColor(pct) }}
        />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
        {goal.actual != null ? `${Math.round(pct)}% progress` : 'No data yet'}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color }) {
  return (
    <div className="card">
      <div className="card-title">{label}</div>
      <div className="card-value" style={{ color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ type = 'info', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, action }) {
  return (
    <div className="section-header">
      <div className="section-title">{title}</div>
      {action}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({ variant = 'ghost', size = '', onClick, children, style }) {
  return (
    <button
      className={`btn btn-${variant}${size ? ' btn-' + size : ''}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}

// ── Form Inputs ───────────────────────────────────────────────────────────────
export function FormGroup({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export function Input({ id, type = 'text', value, onChange, placeholder, readOnly, min, max }) {
  return (
    <input
      id={id}
      className="form-input"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      min={min}
      max={max}
    />
  );
}

export function Select({ id, value, onChange, options, disabled }) {
  return (
    <select id={id} className="form-input" value={value} onChange={onChange} disabled={disabled}>
      {options.map(o =>
        typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  );
}

export function Textarea({ id, value, onChange, rows = 3, placeholder }) {
  return (
    <textarea
      id={id}
      className="form-input"
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ resize: 'vertical' }}
    />
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, footer, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────
const TL_ITEMS = [
  ['Goal Setting', 'May',   'done'],
  ['Q1 Check-in',  'July',  'active'],
  ['Q2 Check-in',  'Oct',   ''],
  ['Q3 Check-in',  'Jan',   ''],
  ['Q4 / Annual',  'Mar',   ''],
];
export function Timeline() {
  return (
    <div className="timeline">
      {TL_ITEMS.map(([label, date, state]) => (
        <div key={label} className="tl-item">
          <div className={`tl-dot${state ? ' ' + state : ''}`}>
            {state === 'done' ? '✓' : state === 'active' ? '●' : ''}
          </div>
          <div className="tl-label">{label}</div>
          <div className="tl-date">{date}</div>
        </div>
      ))}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        padding: '10px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500,
        zIndex: 2000, pointerEvents: 'none', whiteSpace: 'nowrap',
        background: type === 'warn' ? 'var(--amber-dim)' : 'var(--green-dim)',
        color: type === 'warn' ? 'var(--amber)' : 'var(--green)',
        border: `1px solid ${type === 'warn' ? 'var(--amber)' : 'var(--green)'}`,
      }}
    >
      {message}
    </div>
  );
}
