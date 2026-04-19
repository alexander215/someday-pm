export const buildAnAppTemplate = {
  key: 'build_an_app',
  name: 'Build an app',
  description: 'Go from idea to shipped product with guided stages.',

  stages: [
    {
      stageKey: 'planning',
      label: 'Planning',
      description: 'Lock in the decisions before you build.',
      modules: [
        {
          moduleKey: 'naming_brainstorm',
          component: 'BrainstormModule',
          label: 'App name brainstorm',
          description: 'Explore naming ideas before committing.',
          emptyState: {
            title: 'No name ideas yet',
            description: 'Add rough name ideas. React to each one and see what floats to the top.',
            icon: '💡',
          },
        },
        {
          moduleKey: 'personas',
          component: 'PersonaCardsModule',
          label: 'Target customers',
          description: 'Who is this app for? Define 1–3 personas.',
          emptyState: {
            title: 'No personas yet',
            description: 'Add a persona to clarify who you are building this for.',
            icon: '👤',
          },
        },
        {
          moduleKey: 'tech_stack',
          component: 'OptionCardsModule',
          label: 'Tech stack options',
          description: 'List the stacks you are considering. Mark one when you decide.',
          emptyState: {
            title: 'No stack options added',
            description: 'Add each option you are weighing — framework, hosting, DB. Mark the winner.',
            icon: '🛠',
          },
        },
        {
          moduleKey: 'domains',
          component: 'OptionCardsModule',
          label: 'Domain / URL options',
          description: 'Track domain ideas and availability.',
          emptyState: {
            title: 'No domain ideas',
            description: 'Add domains you are considering. Mark available ones.',
            icon: '🌐',
          },
        },
        {
          moduleKey: 'planning_notes',
          component: 'NotesModule',
          label: 'Planning notes',
          description: 'Freeform notes, requirements, constraints.',
          emptyState: {
            title: 'No notes yet',
            description: 'Dump anything here — user stories, constraints, inspiration.',
            icon: '📝',
          },
        },
        {
          moduleKey: 'planning_tasks',
          component: 'TaskListModule',
          label: 'Planning to-dos',
          description: 'Optional planning-phase tasks.',
          emptyState: {
            title: 'No tasks yet',
            description: 'Add tasks you need to do before starting to build.',
            icon: '✅',
          },
        },
      ],
    },
    {
      stageKey: 'starting',
      label: 'Starting',
      description: 'Ship the first version. Track what needs to happen.',
      modules: [
        {
          moduleKey: 'tasks',
          component: 'TaskListModule',
          label: 'Tasks',
          description: 'Everything that needs to happen to launch.',
          emptyState: {
            title: 'No tasks yet',
            description: 'Add the things you need to do to get this off the ground.',
            icon: '📋',
          },
        },
      ],
    },
    {
      stageKey: 'marketing',
      label: 'Marketing',
      description: 'Plan and track your content and outreach.',
      modules: [
        {
          moduleKey: 'calendar',
          component: 'CalendarModule',
          label: 'Content calendar',
          description: 'Schedule posts, launches, and campaigns.',
          platforms: [
            'Twitter / X', 'LinkedIn', 'Instagram', 'TikTok', 'YouTube',
            'Reddit', 'Product Hunt', 'Newsletter', 'Blog', 'Other',
          ],
          contentTypes: [
            'Post', 'Thread', 'Video', 'Story', 'Article', 'Launch', 'Email', 'Other',
          ],
          statusOptions: ['draft', 'scheduled', 'published', 'cancelled'],
          emptyState: {
            title: 'No content scheduled',
            description: 'Add your first content item — a launch post, a newsletter, anything.',
            icon: '📅',
          },
        },
      ],
    },
    {
      stageKey: 'maintaining',
      label: 'Maintaining',
      description: 'Handle issues, requests, and operational tasks.',
      modules: [
        {
          moduleKey: 'board',
          component: 'BoardModule',
          label: 'Issue board',
          description: 'Track bugs, customer requests, and operational tasks.',
          columns: [
            { statusKey: 'open',        label: 'Open',        color: '#e8d5b7' },
            { statusKey: 'in_progress', label: 'In progress', color: '#d5e8d4' },
            { statusKey: 'done',        label: 'Done',        color: '#c8d8ea' },
            { statusKey: 'blocked',     label: 'Blocked',     color: '#f2d9d9' },
          ],
          labels: ['bug', 'request', 'admin', 'task'],
          emptyState: {
            title: 'No issues yet',
            description: 'Add bugs, feature requests, or operational tasks as they come in.',
            icon: '🔧',
          },
        },
      ],
    },
    {
      stageKey: 'evolving',
      label: 'Evolving',
      description: 'Plan the next wave of improvements.',
      modules: [
        {
          moduleKey: 'initiatives',
          component: 'InitiativeCardsModule',
          label: 'Initiatives',
          description: 'Group related improvements into initiatives with checklists.',
          emptyState: {
            title: 'No initiatives yet',
            description: 'Add your first initiative — a feature cluster, redesign, or expansion.',
            icon: '🚀',
          },
        },
      ],
    },
  ],
}
