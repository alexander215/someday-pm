import { useState, useEffect, useRef } from 'react'
import { getCards, createCard, updateCard, deleteCard } from '../../lib/projectCards'
import WorkCardDetail from '../../components/cards/WorkCardDetail'
import { DueDateBadge, LabelBadges, DeleteBtn } from '../../components/cards/cardUtils'
import BrandEmptyState from '../../components/BrandEmptyState'

// ─────────────────────────────────────────────────────────────
// CardBoardModule — Maintaining stage
//
// Kanban board: columns driven by moduleConfig.columns.
// Each column's statusKey maps directly to card.status.
// Cards expand inline within their column.
// Move a card by changing its status in the expanded detail.
// ─────────────────────────────────────────────────────────────

export default function CardBoardModule({ project, stageKey, moduleConfig }) {
  const [cards, setCards] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [addingToColumn, setAddingToColumn] = useState(null)
  const [newCardTitle, setNewCardTitle] = useState('')
  const addInputRef = useRef(null)

  const columns = moduleConfig.columns ?? []
  const labels = moduleConfig.labels ?? []

  useEffect(() => {
    getCards(project.id, moduleConfig.moduleKey)
      .then(data => { setCards(data); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [project.id, moduleConfig.moduleKey])

  useEffect(() => {
    if (addingToColumn) addInputRef.current?.focus()
  }, [addingToColumn])

  async function handleAddCard(e, statusKey) {
    e.preventDefault()
    if (!newCardTitle.trim()) return
    try {
      const card = await createCard(project.id, {
        stageKey,
        moduleKey: moduleConfig.moduleKey,
        title: newCardTitle.trim(),
        status: statusKey,
        sort_order: cards.filter(c => c.status === statusKey).length,
      })
      setCards(prev => [...prev, card])
      setNewCardTitle('')
      setAddingToColumn(null)
      setExpandedId(card.id)
    } catch {}
  }

  function cancelAdd() {
    setAddingToColumn(null)
    setNewCardTitle('')
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
    return <div style={{ fontSize: 13, color: 'var(--brand-text-muted)', opacity: 0.5 }}>Loading…</div>
  }

  const totalCards = cards.length

  return (
    <div>
      {totalCards === 0 && (
        <div style={{ marginBottom: 16 }}>
          <BrandEmptyState
            variant="compact"
            icon={moduleConfig.emptyState?.icon}
            title={moduleConfig.emptyState?.title ?? 'Board is empty'}
            description={moduleConfig.emptyState?.description}
          />
        </div>
      )}

      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          minWidth: 'fit-content',
        }}>
          {columns.map(col => {
            const colCards = cards.filter(c => c.status === col.statusKey)
            const isAddingHere = addingToColumn === col.statusKey

            return (
              <div
                key={col.statusKey}
                style={{ width: 264, flexShrink: 0, display: 'flex', flexDirection: 'column' }}
              >
                {/* Column header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  background: col.color,
                  borderRadius: '10px 10px 0 0',
                  borderBottom: '1px solid rgba(183,165,134,0.18)',
                }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--brand-text-on-inset)',
                    letterSpacing: '0.04em',
                  }}>
                    {col.label}
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: 'var(--brand-text-muted)',
                    marginLeft: 'auto',
                    opacity: 0.6,
                  }}>
                    {colCards.length > 0 ? colCards.length : ''}
                  </span>
                </div>

                {/* Column body */}
                <div style={{
                  background: 'var(--brand-board-canvas)',
                  border: '1px solid rgba(183,165,134,0.22)',
                  borderTop: 'none',
                  borderRadius: '0 0 10px 10px',
                  minHeight: 60,
                  overflow: 'hidden',
                }}>
                  {colCards.map((card, i) => {
                    const isExpanded = expandedId === card.id
                    return (
                      <div
                        key={card.id}
                        style={{
                          borderBottom: i < colCards.length - 1 || isAddingHere
                            ? '1px solid rgba(183,165,134,0.14)'
                            : 'none',
                        }}
                      >
                        {/* Card tile */}
                        <div
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            background: isExpanded ? 'rgba(183,165,134,0.07)' : 'transparent',
                            transition: 'background 0.1s',
                          }}
                          onClick={() => setExpandedId(isExpanded ? null : card.id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{
                              fontSize: 13,
                              color: 'var(--brand-text-on-inset)',
                              lineHeight: 1.45,
                              flex: 1,
                            }}>
                              {card.title}
                            </span>
                            <DeleteBtn
                              onClick={e => { e.stopPropagation(); handleDelete(card.id) }}
                              label="Delete card"
                            />
                          </div>

                          {(card.labels?.length > 0 || card.due_date) && (
                            <div style={{
                              display: 'flex',
                              gap: 5,
                              flexWrap: 'wrap',
                              marginTop: 6,
                              alignItems: 'center',
                            }}>
                              <LabelBadges labels={card.labels} />
                              <DueDateBadge date={card.due_date} />
                            </div>
                          )}
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div style={{ borderTop: '1px solid rgba(183,165,134,0.14)' }}>
                            <WorkCardDetail
                              card={card}
                              labels={labels}
                              statusOptions={columns}
                              detailIndent={12}
                              onSave={handleSaveDetail}
                              onClose={() => setExpandedId(null)}
                              onDelete={handleDelete}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Add card inline form or button */}
                  {isAddingHere ? (
                    <form
                      onSubmit={e => handleAddCard(e, col.statusKey)}
                      style={{ padding: '10px 12px' }}
                    >
                      <input
                        ref={addInputRef}
                        value={newCardTitle}
                        onChange={e => setNewCardTitle(e.target.value)}
                        placeholder="Card title…"
                        onKeyDown={e => e.key === 'Escape' && cancelAdd()}
                        style={{
                          width: '100%',
                          background: 'rgba(183,165,134,0.08)',
                          border: '1px solid rgba(183,165,134,0.3)',
                          borderRadius: 6,
                          padding: '6px 10px',
                          fontSize: 13,
                          fontFamily: 'var(--font-body)',
                          color: 'var(--brand-text-on-inset)',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 7 }}>
                        <button
                          type="submit"
                          disabled={!newCardTitle.trim()}
                          style={{
                            padding: '4px 12px',
                            borderRadius: 6,
                            background: 'var(--brand-accent-mustard)',
                            border: 'none',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: newCardTitle.trim() ? 'pointer' : 'default',
                            opacity: newCardTitle.trim() ? 1 : 0.4,
                          }}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={cancelAdd}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 12,
                            color: 'var(--brand-text-muted)',
                            cursor: 'pointer',
                            padding: '4px 0',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => { cancelAdd(); setAddingToColumn(col.statusKey) }}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        padding: '8px 12px',
                        textAlign: 'left',
                        fontSize: 12,
                        color: 'var(--brand-text-muted)',
                        cursor: 'pointer',
                        opacity: 0.5,
                        transition: 'opacity 0.1s',
                        borderTop: colCards.length > 0 ? '1px solid rgba(183,165,134,0.1)' : 'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                    >
                      + Add card
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
