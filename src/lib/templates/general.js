export const generalTemplate = {
  key: 'general',
  name: 'General project',
  description: 'A flexible workspace for any kind of project.',

  stages: [
    {
      stageKey: 'planning',
      label: 'Planning',
      description: 'Define the project and make key decisions.',
      modules: [
        {
          moduleKey: 'brainstorm',
          component: 'BrainstormModule',
          label: 'Brainstorm',
          description: 'Capture and react to early ideas.',
          emptyState: {
            title: 'No ideas yet',
            description: 'Add raw ideas and react to them as they develop.',
            icon: '💡',
          },
        },
        {
          moduleKey: 'planning_notes',
          component: 'NotesModule',
          label: 'Planning notes',
          description: 'Goals, constraints, background context.',
          emptyState: {
            title: 'Nothing here yet',
            description: 'Use this space to capture decisions, goals, or anything that informs the project.',
            icon: '📝',
          },
        },
        {
          moduleKey: 'planning_tasks',
          component: 'TaskListModule',
          label: 'To-dos',
          description: 'Planning-phase tasks.',
          emptyState: {
            title: 'No tasks yet',
            description: 'Add tasks you need to do before the project gets moving.',
            icon: '✅',
          },
        },
      ],
    },
    {
      stageKey: 'starting',
      label: 'Starting',
      description: 'Execute the first phase.',
      modules: [
        {
          moduleKey: 'tasks',
          component: 'TaskListModule',
          label: 'Tasks',
          description: 'What needs to happen to get this started.',
          emptyState: {
            title: 'No tasks yet',
            description: 'Add the first things you need to do.',
            icon: '📋',
          },
        },
      ],
    },
    {
      stageKey: 'marketing',
      label: 'Marketing',
      description: 'Promote the project.',
      modules: [
        {
          moduleKey: 'calendar',
          component: 'CalendarModule',
          label: 'Content calendar',
          description: 'Plan your posts and outreach.',
          platforms: ['Twitter / X', 'LinkedIn', 'Instagram', 'Newsletter', 'Other'],
          contentTypes: ['Post', 'Article', 'Launch', 'Email', 'Other'],
          statusOptions: ['draft', 'scheduled', 'published', 'cancelled'],
          emptyState: {
            title: 'No content scheduled',
            description: 'Add a post, email, or launch item to get started.',
            icon: '📅',
          },
        },
      ],
    },
    {
      stageKey: 'maintaining',
      label: 'Maintaining',
      description: 'Keep the project running smoothly.',
      modules: [
        {
          moduleKey: 'board',
          component: 'BoardModule',
          label: 'Task board',
          description: 'Issues, requests, and ongoing tasks.',
          columns: [
            { statusKey: 'open',        label: 'Open',        color: '#e8d5b7' },
            { statusKey: 'in_progress', label: 'In progress', color: '#d5e8d4' },
            { statusKey: 'done',        label: 'Done',        color: '#c8d8ea' },
            { statusKey: 'blocked',     label: 'Blocked',     color: '#f2d9d9' },
          ],
          labels: ['task', 'issue', 'request', 'other'],
          emptyState: {
            title: 'Board is empty',
            description: 'Add anything that needs tracking — issues, requests, or ongoing work.',
            icon: '🗂',
          },
        },
      ],
    },
    {
      stageKey: 'evolving',
      label: 'Evolving',
      description: 'Plan what comes next.',
      modules: [
        {
          moduleKey: 'initiatives',
          component: 'InitiativeCardsModule',
          label: 'Initiatives',
          description: 'Cluster future improvements into named initiatives.',
          emptyState: {
            title: 'No initiatives yet',
            description: 'Add an initiative to plan the next wave of work.',
            icon: '🚀',
          },
        },
      ],
    },
  ],
}
