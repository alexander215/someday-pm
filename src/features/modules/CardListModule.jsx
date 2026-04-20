import { useState, useEffect } from 'react'
import { getCards, createCard, updateCard, deleteCard } from '../../lib/projectCards'
import WorkCardDetail from '../../components/cards/WorkCardDetail'
import { CheckboxBtn, DueDateBadge, LabelBadges, DeleteBtn } from '../../components/cards/cardUtils'
import BrandEmptyState from '../../components/BrandEmptyState'

// ─────────────────────────────────────────────────────────────
// CardListModule — Starting stage
// Cards displayed as a flat list. Open cards first, done last.
// Each card expands inline to show WorkCardDetail.
// ─────────────────────────────────────────────────────────────

export default function CardListModule({ project, stageKey, moduleConfig }) {
  const [cards, setCards] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const labels = moduleConfig.labels ?? []

  useEffect(() => {
    getCards(project.id, moduleConfig.moduleKey)
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
        sort_order: cards.length,
      })
      setCards(prev => [...prev, card])
      setNewTitle('')
      setExpandedId(card.id)
    } finally {
      setAdding(false)
    }
  }

  async function handleToggleDone(cardId, currentStatus) {
    const updated = await updateCard(cardId, { status: currentStatus === 'done' ? 'open' : 'done' })
    setCards(prev => prev.map(c => c.id === cardId ? updated : c))
  }

  async function handleSaveDetail(cardId, updates) {
    const updated = await updateCard(cardId, updates)
    setCards(prev => prev.map(c => c.id === cardId ? updated : c))
  }

  async function handleDelete(cardId) {
    await deleteCard(cardId)
    setCards(prev => prev.filter(c => c.id !== cardId))
    if (expandedId === cardId) setExpandedId(null)
  }

  if (!loaded) {
    return (
      <div style={{ fontSize: 13, color: 'var(--brand-text-muted)', opacity: 0.5 }}>Loading…</div>
    )
  }

  const open = cards.filter(c => c.status !== 'done')
  const done = cards.filter(c => c.status === 'done')
  const ordered = [...open, ...done]

  return (
    <div style={{
      background: 'var(--brand-board-canvas)',
      borderRadius: 12,
      border: '1px solid rgba(183,165,134,0.25)',
      overflow: 'hidden',
    }}>
      {cards.length === 0 && (
        <div style={{ padding: '14px 16px' }}>
          <BrandEmptyState
            variant="compact"
            icon={moduleConfig.emptyState?.icon}
            title={moduleConfig.emptyState?.title ?? 'No cards yet'}
            description={moduleConfig.emptyState?.description}
          />
        </div>
      )}

      {ordered.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {ordered.map((card, i) => {
            const isDone = card.status === 'done'
            const isExpanded = expandedId === card.id
            return (
              <li
                key={card.id}
                style={{
                  borderBottom: i < ordered.length - 1
                    ? '1px solid rgba(183,165,134,0.14)'
                    : 'none',
                }}
              >
                {/* ── Row ── */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : card.id)}
                >
                  <CheckboxBtn
                    checked={isDone}
                    onClick={e => { e.stopPropagation(); handleToggleDone(card.id, card.status) }}
                    size={18}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 14,
                      color: isDone
                        ? 'var(--brand-text-on-inset-muted)'
                        : 'var(--brand-text-on-inset)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      opacity: isDone ? 0.55 : 1,
                      display: 'block',
                      lineHeight: 1.4,
                    }}>
                      {card.title}
                    </span>
                    {!isExpanded && card.body && (
                      <span style={{
                        fontSize: 12,
                        color: 'var(--brand-text-muted)',
                        opacity: 0.7,
                        display: 'block',
                        marginTop: 1,
                      }}>
                        {card.body.length > 80 ? card.body.slice(0, 80) + '…' : card.body}
                      </span>
                    )}
                  </div>

                  {!isExpanded && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      <DueDateBadge date={card.due_date} />
                      <LabelBadges labels={card.labels} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, color: 'var(--brand-text-muted)', opacity: 0.35, lineHeight: 1 }}>
                      {isExpanded ? '▲' : '▾'}
                    </span>
                    <DeleteBtn
                      onClick={e => { e.stopPropagation(); handleDelete(card.id) }}
                      label="Delete card"
                    />
                  </div>
                </div>

                {/* ── Expanded detail ── */}
                {isExpanded && (
                  <WorkCardDetail
                    card={card}
                    labels={labels}
                    statusOptions={null}
                    detailIndent={44}
                    onSave={handleSaveDetail}
                    onClose={() => setExpandedId(null)}
                    onDelete={handleDelete}
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}

      {/* ── Add form ── */}
      <form
        onSubmit={handleAdd}
        style={{
          display: 'flex',
          gap: 8,
          padding: '10px 16px',
          borderTop: cards.length > 0 ? '1px solid rgba(183,165,134,0.14)' : 'none',
          alignItems: 'center',
        }}
      >
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a card…"
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
