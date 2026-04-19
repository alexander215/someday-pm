// DEV-ONLY — delete this file after Phase 2 is verified
import { useState } from 'react'
import { getProjects, createProject, updateActiveStage, deleteProject } from '../lib/projects'
import {
  getBrainstormBoardsForProject,
  createBrainstormBoard,
  deleteBrainstormBoard,
} from '../lib/brainstorm'

const STEPS = [
  { id: 1, label: 'getProjects() returns successfully' },
  { id: 2, label: "createProject({ template_key: 'general', title: 'Smoke Test Project' }) succeeds" },
  { id: 3, label: 'getProjects() includes the created project' },
  { id: 4, label: "updateActiveStage(projectId, 'marketing') succeeds" },
  { id: 5, label: 'getBrainstormBoardsForProject(projectId) succeeds' },
  { id: 6, label: "createBrainstormBoard({ projectId, moduleKey: 'naming_brainstorm', title: 'Smoke Test Board' }) succeeds" },
  { id: 7, label: 'getBrainstormBoardsForProject(projectId) returns the new board' },
]

async function runSmokeTests(onStep) {
  let projectId = null
  let boardId = null

  // Step 1
  try {
    await getProjects()
    onStep(1, 'pass', null)
  } catch (e) {
    onStep(1, 'fail', e.message)
    return { projectId, boardId }
  }

  // Step 2
  try {
    const project = await createProject({ template_key: 'general', title: 'Smoke Test Project' })
    projectId = project.id
    onStep(2, 'pass', null)
  } catch (e) {
    onStep(2, 'fail', e.message)
    return { projectId, boardId }
  }

  // Step 3
  try {
    const projects = await getProjects()
    const found = projects.some((p) => p.id === projectId)
    if (!found) throw new Error('Created project not found in getProjects() results')
    onStep(3, 'pass', null)
  } catch (e) {
    onStep(3, 'fail', e.message)
  }

  // Step 4
  try {
    await updateActiveStage(projectId, 'marketing')
    onStep(4, 'pass', null)
  } catch (e) {
    onStep(4, 'fail', e.message)
  }

  // Step 5
  try {
    await getBrainstormBoardsForProject(projectId, 'naming_brainstorm')
    onStep(5, 'pass', null)
  } catch (e) {
    onStep(5, 'fail', e.message)
  }

  // Step 6
  try {
    const board = await createBrainstormBoard({
      projectId,
      moduleKey: 'naming_brainstorm',
      title: 'Smoke Test Board',
    })
    boardId = board.id
    onStep(6, 'pass', null)
  } catch (e) {
    onStep(6, 'fail', e.message)
    return { projectId, boardId }
  }

  // Step 7
  try {
    const boards = await getBrainstormBoardsForProject(projectId, 'naming_brainstorm')
    const found = boards.some((b) => b.id === boardId)
    if (!found) throw new Error('Created board not found in getBrainstormBoardsForProject() results')
    onStep(7, 'pass', null)
  } catch (e) {
    onStep(7, 'fail', e.message)
  }

  return { projectId, boardId }
}

async function cleanup(projectId, boardId) {
  if (boardId) {
    try { await deleteBrainstormBoard(boardId) } catch (_) {}
  }
  if (projectId) {
    try { await deleteProject(projectId) } catch (_) {}
  }
}

export default function DevSmokeTestPage() {
  const [results, setResults] = useState({})
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [cleaned, setCleaned] = useState(false)
  const [ids, setIds] = useState({ projectId: null, boardId: null })

  function onStep(id, status, error) {
    setResults((prev) => ({ ...prev, [id]: { status, error } }))
  }

  async function handleRun() {
    setResults({})
    setDone(false)
    setCleaned(false)
    setIds({ projectId: null, boardId: null })
    setRunning(true)
    const { projectId, boardId } = await runSmokeTests(onStep)
    setIds({ projectId, boardId })
    setRunning(false)
    setDone(true)
  }

  async function handleCleanup() {
    await cleanup(ids.projectId, ids.boardId)
    setCleaned(true)
  }

  const allPass = done && STEPS.every((s) => results[s.id]?.status === 'pass')

  return (
    <div style={{ maxWidth: 640, margin: '48px auto', fontFamily: 'monospace', padding: '0 24px' }}>
      <div style={{ marginBottom: 8, fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
        dev only — delete after phase 2 verified
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#1a1a1a' }}>
        Phase 2 Smoke Test
      </h1>

      <button
        onClick={handleRun}
        disabled={running}
        style={{
          padding: '10px 20px',
          background: running ? '#999' : '#1a472a',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: running ? 'default' : 'pointer',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 28,
        }}
      >
        {running ? 'Running…' : done ? 'Run Again' : 'Run Smoke Tests'}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STEPS.map((step) => {
          const result = results[step.id]
          const bg = !result ? '#f5f5f5' : result.status === 'pass' ? '#e6f4ea' : '#fce8e6'
          const icon = !result ? '○' : result.status === 'pass' ? '✓' : '✗'
          const iconColor = !result ? '#999' : result.status === 'pass' ? '#1e7e34' : '#c0392b'
          return (
            <div
              key={step.id}
              style={{ background: bg, borderRadius: 6, padding: '10px 14px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: iconColor, fontWeight: 700, minWidth: 16 }}>{icon}</span>
                <div>
                  <span style={{ fontSize: 13, color: '#1a1a1a' }}>
                    <strong style={{ color: '#666' }}>Step {step.id}:</strong> {step.label}
                  </span>
                  {result?.error && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#c0392b', background: '#fff0ee', borderRadius: 4, padding: '6px 8px' }}>
                      {result.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {done && (
        <div style={{
          marginTop: 24,
          padding: '14px 18px',
          borderRadius: 8,
          background: allPass ? '#d4edda' : '#f8d7da',
          color: allPass ? '#155724' : '#721c24',
          fontWeight: 700,
          fontSize: 15,
        }}>
          {allPass ? '✓ All 7 checks passed — Phase 2 is good.' : '✗ One or more checks failed — see errors above.'}
        </div>
      )}

      {done && ids.projectId && !cleaned && (
        <button
          onClick={handleCleanup}
          style={{
            marginTop: 16,
            padding: '8px 16px',
            background: 'transparent',
            color: '#666',
            border: '1px solid #ccc',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Clean up test data
        </button>
      )}
      {cleaned && (
        <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
          Test project and board deleted.
        </div>
      )}
    </div>
  )
}
