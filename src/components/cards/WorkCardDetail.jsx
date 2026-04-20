import { useState, useEffect, useRef } from 'react'
import {
  getCardItems,
  createCardItem,
  toggleCardItem,
  deleteCardItem,
} from '../../lib/projectCards'
import { CheckboxBtn, DeleteBtn, FieldLabel, insetInputStyle } from './cardUtils'

// ─────────────────────────────────────────────────────────────
// WorkCardDetail
//
// Shared expanded editing panel used by all three card modules.
//
// Props:
//   card           — card object from project_cards
//   labels         — string[] of available labels (from moduleConfig)
//   statusOptions  — [{statusKey, label}] or null (board view only)
//   initialItems   — preloaded items (initiatives view skips re-fetch)
//   detailIndent   — left padding offset in px (default 44 for list, 12 for board)
//   onSave         — async (cardId, updates) → void
//   onClose        — () → void
//   onDelete       — (cardId) → void
// ─────────────────────────────────────────────────────────────

export default function WorkCardDetail({
  card,
  labels = [],
  statusOptions = null,
  initialItems = null,
  detailIndent = 44,
  onSave,
  onClose,
  onDelete,
}) {
  const [title, setTitle] = useState(card.title)
  const [body, setBody] = useState(card.body ?? '')
  const [activeLabels, setActiveLabels] = useState(card.labels ?? [])
  const [dueDate, setDueDate] = useState(card.due_date ?? '')
  const [status, setStatus] = useState(card.status)

  const [items, setItems] = useState(initialItems ?? [])
  const [itemsLoaded, setItemsLoaded] = useState(initialItems !== null)
  const [newItemText, setNewItemText] = useState('')
  const [addingItem, setAddingItem] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isDirty =
    title.trim() !== card.title ||
    body.trim() !== (card.body ?? '') ||
    JSON.stringify([...activeLabels].sort()) !== JSON.stringify([...(card.labels ?? [])].sort()) ||
    dueDate !== (card.due_date ?? '') ||
    status !== card.status

  useEffect(() => {
    if (initialItems !== null) return
    getCardItems(card.id)
      .then(data => { setItems(data); setItemsLoaded(true) })
      .catch(() => setItemsLoaded(true))
  }, [card.id])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await onSave(card.id, {
        title: title.trim() || card.title,
        body: body.trim() || null,
        labels: activeLabels,
        due_date: dueDate || null,
        status,
      })
    } catch (err) {
      setError(err?.message ?? 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  function toggleLabel(l) {
    setActiveLabels(prev =>
      prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]
    )
  }

  async function handleToggleItem(itemId, completed) {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, completed: !completed } : i))
    try {
      await toggleCardItem(itemId, !completed)
    } catch {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, completed } : i))
    }
  }

  async function handleAddItem(e) {
    e.preventDefault()
    if (!newItemText.trim()) return
    setAddingItem(true)
    try {
      const item = await createCardItem(card.id, { text: newItemText.trim(), sort_order: items.length })
      setItems(prev => [...prev, item])
      setNewItemText('')
    } catch {
    } finally {
      setAddingItem(false)
    }
  }

  async function handleDeleteItem(itemId) {
    setItems(prev => prev.filter(i => i.id !== itemId))
    try {
      await deleteCardItem(itemId)
    } catch {
      const restored = await getCardItems(card.id)
      setItems(restored)
    }
  }

  const doneCount = items.filter(i => i.completed).length

  return (
    <div
      style={{
        padding: `0 16px 16px ${detailIndent}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ ...insetInputStyle, width: '100%', fontSize: 14, fontWeight: 600 }}
      />

      {/* Body */}
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Add notes…"
        rows={3}
        style={{
          ...insetInputStyle,
          width: '100%',
          resize: 'vertical',
          lineHeight: 1.5,
        }}
      />

      {/* Labels */}
      {labels.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {labels.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => toggleLabel(l)}
              style={{
                padding: '3px 9px',
                borderRadius: 4,
                border: '1px solid rgba(183,165,134,0.3)',
                background: activeLabels.includes(l) ? 'var(--brand-accent-mustard)' : 'transparent',
                color: activeLabels.includes(l) ? '#fff' : 'var(--brand-text-muted)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'background 0.1s, color 0.1s',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Due date + Status row */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FieldLabel>Due</FieldLabel>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={{ ...insetInputStyle, padding: '3px 8px', fontSize: 12 }}
          />
          {dueDate && (
            <button
              type="button"
              onClick={() => setDueDate('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-text-muted)', fontSize: 15, padding: '0 2px', lineHeight: 1, opacity: 0.5 }}
            >
              ×
            </button>
          )}
        </div>

        {statusOptions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FieldLabel>Status</FieldLabel>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ ...insetInputStyle, padding: '3px 8px', fontSize: 12 }}
            >
              {statusOptions.map(s => (
                <option key={s.statusKey} value={s.statusKey}>{s.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FieldLabel>Checklist</FieldLabel>
          {itemsLoaded && items.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--brand-text-muted)', opacity: 0.6 }}>
              {doneCount}/{items.length}
            </span>
          )}
        </div>

        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckboxBtn
              checked={item.completed}
              onClick={() => handleToggleItem(item.id, item.completed)}
              size={16}
            />
            <span style={{
              fontSize: 13,
              flex: 1,
              color: item.completed ? 'var(--brand-text-on-inset-muted)' : 'var(--brand-text-on-inset)',
              textDecoration: item.completed ? 'line-through' : 'none',
              opacity: item.completed ? 0.55 : 1,
            }}>
              {item.text}
            </span>
            <DeleteBtn onClick={() => handleDeleteItem(item.id)} label="Remove item" />
          </div>
        ))}

        <form onSubmit={handleAddItem} style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
          <input
            value={newItemText}
            onChange={e => setNewItemText(e.target.value)}
            placeholder="Add item…"
            disabled={addingItem}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(183,165,134,0.2)',
              outline: 'none',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              color: 'var(--brand-text-on-inset)',
              padding: '3px 0',
            }}
          />
          {newItemText.trim() && (
            <button
              type="submit"
              disabled={addingItem}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--brand-accent-mustard)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Add
            </button>
          )}
        </form>
      </div>

      {error && <div style={{ fontSize: 12, color: '#b05050' }}>{error}</div>}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {isDirty && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              background: 'var(--brand-accent-mustard)',
              border: 'none',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--brand-text-muted)', cursor: 'pointer', padding: '4px 0' }}
        >
          {isDirty ? 'Cancel' : 'Close'}
        </button>
        <button
          type="button"
          onClick={() => onDelete(card.id)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 12,
            color: 'var(--brand-text-muted)',
            cursor: 'pointer',
            padding: '4px 0',
            marginLeft: 'auto',
            opacity: 0.45,
          }}
        >
          Delete card
        </button>
      </div>
    </div>
  )
}
