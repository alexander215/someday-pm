import { useState, useEffect } from 'react'
import {
  getCardsWithItems,
  createCard,
  updateCard,
  deleteCard,
  toggleCardItem,
  createCardItem,
  getCardItems,
} from '../../lib/projectCards'
import WorkCardDetail from '../../components/cards/WorkCardDetail'
import { CheckboxBtn, DeleteBtn } from '../../components/cards/cardUtils'
import BrandEmptyState from '../../components/BrandEmptyState'

// ─────────────────────────────────────────────────────────────
// CardInitiativesModule — Evolving stage
//
// Planning cards with inline checklists. No status columns —
// these are future-work clusters, not execution tracking.
//
// Cards load with their checklist items embedded. Checklist
// items can be toggled directly on the compact view. Expanding
// a card opens WorkCardDetail for full editing.
// ─────────────────────────────────────────────────────────────

export default function CardInitiativesModule({ project, stageKey, moduleConfig }) {
  const [cards, setCards] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    getCardsWithItems(project.id, moduleConfig.moduleKey)
      .then(data => { setCards(data); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [project.id, moduleConfig.moduleKey])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      const card = await createCard(project.id, {
        stageKey,
        moduleKey: moduleConfig.moduleKey,
        title: newTitle.trim(),
        status: 'open',
        sort_order: cards.length,
      })
      setCards(prev => [...prev, { ...card, project_card_items: [] }])
      setNewTitle('')
      setExpandedId(card.id)
    } finally {
      setAdding(false)
    }
  }

  async function handleSaveDetail(cardId, updates) {
    const updated = await updateCard(cardId, updates)
    setCards(prev => prev.map(c => c.id === cardId ? { ...updated, project_card_items: c.project_card_items } : c))
  }

  async function handleDelete(cardId) {
    await deleteCard(cardId)
    setCards(prev => prev.filter(c => c.id !== cardId))
    if (expandedId === cardId) setExpandedId(null)
  }

  function updateItems(cardId, newItems) {
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, project_card_items: newItems } : c
    ))
  }

  async function handleToggleItem(cardId, itemId, completed) {
    updateItems(cardId, (cards.find(c => c.id === cardId)?.project_card_items ?? [])
      .map(i => i.id === itemId ? { ...i, completed: !completed } : i)
    )
    try {
      await toggleCardItem(itemId, !completed)
    } catch {
      const fresh = await getCardItems(cardId)
      updateItems(cardId, fresh)
    }
  }

  async function handleDetailClose(cardId) {
    try {
      const fresh = await getCardItems(cardId)
      updateItems(cardId, fresh)
    } catch {}
    setExpandedId(null)
  }

  if (!loaded) {
    return <div style={{ fontSize: 13, color: 'var(--brand-text-muted)', opacity: 0.5 }}>Loading…</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {cards.length === 0 && (
        <BrandEmptyState
          variant="compact"
          icon={moduleConfig.emptyState?.icon}
          title={moduleConfig.emptyState?.title ?? 'No initiatives yet'}
          description={moduleConfig.emptyState?.description}
        />
      )}

      {cards.map(card => (
        <InitiativeCard
          key={card.id}
          card={card}
          items={card.project_card_items ?? []}
          isExpanded={expandedId === card.id}
          onExpand={() => setExpandedId(expandedId === card.id ? null : card.id)}
          onToggleItem={(itemId, completed) => handleToggleItem(card.id, itemId, completed)}
          onSave={handleSaveDetail}
          onClose={() => handleDetailClose(card.id)}
          onDelete={handleDelete}
        />
      ))}

      {/* Add form */}
      <form
        onSubmit={handleAdd}
        style={{
          display: 'flex',
          gap: 8,
          padding: '10px 14px',
          background: 'var(--brand-board-canvas)',
          borderRadius: 10,
          border: '1px solid rgba(183,165,134,0.2)',
          alignItems: 'center',
        }}
      >
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="New initiative name…"
          disabled={adding}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            color: 'var(--brand-text-on-inset)',
          }}
        />
        {newTitle.trim() && (
          <button
            type="submit"
            disabled={adding}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-accent-mustard)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0 2px',
              flexShrink: 0,
            }}
          >
            Add
          </button>
        )}
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// InitiativeCard
// ─────────────────────────────────────────────────────────────

function InitiativeCard({ card, items, isExpanded, onExpand, onToggleItem, onSave, onClose, onDelete }) {
  const doneCount = items.filter(i => i.completed).length
  const hasItems = items.length > 0

  return (
    <div style={{
      background: 'var(--brand-board-canvas)',
      borderRadius: 10,
      border: '1px solid rgba(183,165,134,0.25)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '12px 16px',
          cursor: 'pointer',
        }}
        onClick={onExpand}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--brand-text-on-inset)',
            lineHeight: 1.35,
            display: 'block',
          }}>
            {card.title}
          </span>
          {card.body && !isExpanded && (
            <span style={{
              fontSize: 12,
              color: 'var(--brand-text-muted)',
              opacity: 0.7,
              display: 'block',
              marginTop: 3,
              lineHeight: 1.4,
            }}>
              {card.body.length > 120 ? card.body.slice(0, 120) + '…' : card.body}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, marginTop: 2 }}>
          {hasItems && !isExpanded && (
            <span style={{ fontSize: 11, color: 'var(--brand-text-muted)', opacity: 0.65 }}>
              {doneCount}/{items.length}
            </span>
          )}
          <span style={{ fontSize: 13, color: 'var(--brand-text-muted)', opacity: 0.35, lineHeight: 1 }}>
            {isExpanded ? '▲' : '▾'}
          </span>
          <DeleteBtn
            onClick={e => { e.stopPropagation(); onDelete(card.id) }}
            label="Delete initiative"
          />
        </div>
      </div>

      {/* Checklist items — compact view (not shown when expanded) */}
      {!isExpanded && hasItems && (
        <div style={{
          padding: '0 16px 12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckboxBtn
                checked={item.completed}
                onClick={e => { e.stopPropagation(); onToggleItem(item.id, item.completed) }}
                size={15}
              />
              <span style={{
                fontSize: 13,
                color: item.completed ? 'var(--brand-text-on-inset-muted)' : 'var(--brand-text-on-inset)',
                textDecoration: item.completed ? 'line-through' : 'none',
                opacity: item.completed ? 0.5 : 1,
                lineHeight: 1.35,
              }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Expanded editing detail */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid rgba(183,165,134,0.14)' }}>
          <WorkCardDetail
            card={card}
            labels={[]}
            statusOptions={null}
            initialItems={items}
            detailIndent={16}
            onSave={onSave}
            onClose={onClose}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  )
}
